import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class AuthSettings:
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    reset_token_expire_minutes: int


@dataclass(frozen=True)
class AppSettings:
    app_name: str
    app_version: str
    app_host: str
    app_port: int
    api_prefix: str
    cors_origins: list[str]
    expose_reset_token_in_response: bool
    auth: AuthSettings


def _int_env(key: str, default: int) -> int:
    raw_value = os.getenv(key)
    if not raw_value:
        return default
    try:
        return int(raw_value)
    except ValueError as exc:
        raise ValueError(f"Invalid integer value for {key}: {raw_value}") from exc


def _bool_env(key: str, default: bool) -> bool:
    raw_value = os.getenv(key)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def _list_env(key: str, default: str) -> list[str]:
    raw_value = os.getenv(key, default)
    return [item.strip() for item in raw_value.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> AppSettings:
    auth_settings = AuthSettings(
        secret_key=os.getenv("JWT_SECRET_KEY", "change-this-in-production"),
        algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        access_token_expire_minutes=_int_env("ACCESS_TOKEN_EXPIRE_MINUTES", 30),
        refresh_token_expire_days=_int_env("REFRESH_TOKEN_EXPIRE_DAYS", 7),
        reset_token_expire_minutes=_int_env("RESET_TOKEN_EXPIRE_MINUTES", 15),
    )

    return AppSettings(
        app_name=os.getenv("APP_NAME", "LumiFin API"),
        app_version=os.getenv("APP_VERSION", "1.0.0"),
        app_host=os.getenv("APP_HOST", "127.0.0.1"),
        app_port=_int_env("APP_PORT", 8000),
        api_prefix=os.getenv("API_PREFIX", "/api/v1"),
        cors_origins=_list_env("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"),
        expose_reset_token_in_response=_bool_env("EXPOSE_RESET_TOKEN", True),
        auth=auth_settings,
    )
