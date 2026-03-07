import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

class InvalidTokenError(Exception):
    pass


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _create_token_payload(
    *,
    user_id: int,
    email: str,
    role: str,
    token_type: str,
    expires_delta: timedelta,
    include_jti: bool,
) -> tuple[dict[str, Any], datetime]:
    expires_at = datetime.now(timezone.utc) + expires_delta

    payload: dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "type": token_type,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }

    if include_jti:
        payload["jti"] = str(uuid4())

    return payload, expires_at


def _encode_token(payload: dict[str, Any]) -> str:
    settings = get_settings()
    return jwt.encode(payload, settings.auth.secret_key, algorithm=settings.auth.algorithm)


def create_access_token(user_id: int, email: str, role: str) -> tuple[str, datetime]:
    settings = get_settings()
    payload, expires_at = _create_token_payload(
        user_id=user_id,
        email=email,
        role=role,
        token_type="access",
        expires_delta=timedelta(minutes=settings.auth.access_token_expire_minutes),
        include_jti=False,
    )
    return _encode_token(payload), expires_at


def create_refresh_token(user_id: int, email: str, role: str) -> tuple[str, datetime]:
    settings = get_settings()
    payload, expires_at = _create_token_payload(
        user_id=user_id,
        email=email,
        role=role,
        token_type="refresh",
        expires_delta=timedelta(days=settings.auth.refresh_token_expire_days),
        include_jti=True,
    )
    return _encode_token(payload), expires_at


def create_password_reset_token(user_id: int, email: str, role: str) -> tuple[str, datetime]:
    settings = get_settings()
    payload, expires_at = _create_token_payload(
        user_id=user_id,
        email=email,
        role=role,
        token_type="password_reset",
        expires_delta=timedelta(minutes=settings.auth.reset_token_expire_minutes),
        include_jti=True,
    )
    return _encode_token(payload), expires_at


def decode_token(token: str, expected_type: str | None = None) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.auth.secret_key, algorithms=[settings.auth.algorithm])
    except JWTError as exc:
        raise InvalidTokenError("Token is invalid or expired") from exc

    token_type = payload.get("type")
    if expected_type and token_type != expected_type:
        raise InvalidTokenError(f"Invalid token type. Expected '{expected_type}'.")

    return payload
