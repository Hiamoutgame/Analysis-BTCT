from dataclasses import dataclass
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession  # type: ignore[reportMissingImports]
from sqlalchemy.exc import IntegrityError  # type: ignore[reportMissingImports]

from app.core.config import get_settings
from app.core.security import (
    InvalidTokenError,
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.infrastructure import auth_repository
from app.schemas.auth import (
    ForgotPasswordResponse,
    TokenResponse,
    UserResponse,
)


class AuthServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@dataclass
class AuthService:
    session: AsyncSession

    async def register(self, *, email: str, password: str, full_name: Optional[str]) -> TokenResponse:
        normalized_email = email.strip().lower()
        existing_user = await auth_repository.get_user_by_email(self.session, normalized_email)
        if existing_user:
            raise AuthServiceError("Email is already registered", status_code=409)

        hashed_password = hash_password(password)

        try:
            user = await auth_repository.create_user(
                self.session,
                email=normalized_email,
                password_hash=hashed_password,
                full_name=full_name,
                role="user",
            )
        except IntegrityError as exc:
            await self.session.rollback()
            raise AuthServiceError("Email is already registered", status_code=409) from exc

        return await self._issue_token_pair(user.user_id)

    async def login(self, *, email: str, password: str) -> TokenResponse:
        normalized_email = email.strip().lower()
        user = await auth_repository.get_user_by_email(self.session, normalized_email)
        if user is None or not verify_password(password, user.password_hash):
            raise AuthServiceError("Invalid email or password", status_code=401)

        if not user.is_active:
            raise AuthServiceError("Account is inactive", status_code=403)

        return await self._issue_token_pair(user.user_id)

    async def refresh(self, *, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token, expected_type="refresh")
            user_id = int(payload["sub"])
        except (InvalidTokenError, KeyError, ValueError) as exc:
            raise AuthServiceError("Invalid refresh token", status_code=401) from exc

        refresh_token_hash = hash_token(refresh_token)
        is_active = await auth_repository.is_refresh_token_active(self.session, refresh_token_hash)
        if not is_active:
            raise AuthServiceError("Refresh token has been revoked", status_code=401)

        user = await auth_repository.get_user_by_id(self.session, user_id)
        if user is None or not user.is_active:
            raise AuthServiceError("User account is unavailable", status_code=401)

        await auth_repository.revoke_refresh_token(self.session, refresh_token_hash)
        return await self._issue_token_pair(user.user_id)

    async def logout(self, *, refresh_token: str) -> None:
        try:
            decode_token(refresh_token, expected_type="refresh")
        except InvalidTokenError as exc:
            raise AuthServiceError("Invalid refresh token", status_code=401) from exc

        refresh_token_hash = hash_token(refresh_token)
        revoked = await auth_repository.revoke_refresh_token(self.session, refresh_token_hash)
        if not revoked:
            raise AuthServiceError("Refresh token already revoked or not found", status_code=400)

    async def forgot_password(self, *, email: str) -> ForgotPasswordResponse:
        normalized_email = email.strip().lower()
        user = await auth_repository.get_user_by_email(self.session, normalized_email)

        message = "If this email exists, a reset link has been generated."
        if user is None:
            return ForgotPasswordResponse(message=message)

        reset_token, reset_expire_at = create_password_reset_token(user.user_id, user.email, user.role)
        await auth_repository.store_password_reset_token(
            self.session,
            user_id=user.user_id,
            token_hash=hash_token(reset_token),
            expires_at=reset_expire_at,
        )

        settings = get_settings()
        if settings.expose_reset_token_in_response:
            return ForgotPasswordResponse(message=message, reset_token=reset_token)
        return ForgotPasswordResponse(message=message)

    async def reset_password(self, *, reset_token: str, new_password: str) -> None:
        try:
            decode_payload = decode_token(reset_token, expected_type="password_reset")
            token_user_id = int(decode_payload["sub"])
        except (InvalidTokenError, KeyError, ValueError) as exc:
            raise AuthServiceError("Invalid reset token", status_code=401) from exc

        token_hash = hash_token(reset_token)
        consumed_user_id = await auth_repository.consume_password_reset_token(self.session, token_hash)
        if consumed_user_id is None:
            raise AuthServiceError("Reset token is expired or already used", status_code=400)

        if consumed_user_id != token_user_id:
            raise AuthServiceError("Reset token is invalid", status_code=401)

        new_password_hash = hash_password(new_password)
        await auth_repository.update_user_password(self.session, consumed_user_id, new_password_hash)
        await auth_repository.revoke_all_refresh_tokens_for_user(self.session, consumed_user_id)

    async def get_current_user_from_access_token(self, access_token: str) -> UserResponse:
        try:
            payload = decode_token(access_token, expected_type="access")
            user_id = int(payload["sub"])
        except (InvalidTokenError, KeyError, ValueError) as exc:
            raise AuthServiceError("Invalid access token", status_code=401) from exc

        user = await auth_repository.get_user_by_id(self.session, user_id)
        if user is None or not user.is_active:
            raise AuthServiceError("User account is unavailable", status_code=401)

        return UserResponse(
            user_id=user.user_id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,  # type: ignore[arg-type]
            is_active=user.is_active,
        )

    async def _issue_token_pair(self, user_id: int) -> TokenResponse:
        user = await auth_repository.get_user_by_id(self.session, user_id)
        if user is None:
            raise AuthServiceError("User not found", status_code=404)

        access_token, access_expire_at = create_access_token(user.user_id, user.email, user.role)
        refresh_token, refresh_expire_at = create_refresh_token(user.user_id, user.email, user.role)

        await auth_repository.store_refresh_token(
            self.session,
            user_id=user.user_id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_expire_at,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            access_expires_at=access_expire_at.isoformat(),
            refresh_expires_at=refresh_expire_at.isoformat(),
            user=UserResponse(
                user_id=user.user_id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,  # type: ignore[arg-type]
                is_active=user.is_active,
            ),
        )
