from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.auth_service import AuthService, AuthServiceError
from app.infrastructure.database_service import get_db_session
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)


def _raise_auth_error(error: AuthServiceError) -> None:
    raise HTTPException(status_code=error.status_code, detail=error.message)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_db_session)) -> TokenResponse:
    service = AuthService(session)
    try:
        return await service.register(
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
        )
    except AuthServiceError as error:
        _raise_auth_error(error)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_db_session)) -> TokenResponse:
    service = AuthService(session)
    try:
        return await service.login(email=payload.email, password=payload.password)
    except AuthServiceError as error:
        _raise_auth_error(error)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    service = AuthService(session)
    try:
        return await service.refresh(refresh_token=payload.refresh_token)
    except AuthServiceError as error:
        _raise_auth_error(error)


@router.post("/logout", response_model=MessageResponse)
async def logout(payload: LogoutRequest, session: AsyncSession = Depends(get_db_session)) -> MessageResponse:
    service = AuthService(session)
    try:
        await service.logout(refresh_token=payload.refresh_token)
        return MessageResponse(message="Logged out successfully")
    except AuthServiceError as error:
        _raise_auth_error(error)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ForgotPasswordResponse:
    service = AuthService(session)
    try:
        return await service.forgot_password(email=payload.email)
    except AuthServiceError as error:
        _raise_auth_error(error)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
) -> MessageResponse:
    service = AuthService(session)
    try:
        await service.reset_password(reset_token=payload.reset_token, new_password=payload.new_password)
        return MessageResponse(message="Password reset successfully")
    except AuthServiceError as error:
        _raise_auth_error(error)


@router.get("/me", response_model=UserResponse)
async def get_me(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db_session),
) -> UserResponse:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")

    service = AuthService(session)
    try:
        return await service.get_current_user_from_access_token(credentials.credentials)
    except AuthServiceError as error:
        _raise_auth_error(error)
