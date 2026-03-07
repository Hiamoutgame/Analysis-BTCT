import os
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Awaitable, Callable, Optional, Protocol
from urllib.parse import quote_plus

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine


class AppWithEventHandlers(Protocol):
    def add_event_handler(self, event_type: str, func: Callable[[], Awaitable[Any]]) -> None:
        ...


def _first_env(*keys: str) -> Optional[str]:
    for key in keys:
        value = os.getenv(key)
        if value is not None and value != "":
            return value
    return None


def _int_env(*keys: str, default: int) -> int:
    raw_value = _first_env(*keys)
    if raw_value is None:
        return default

    try:
        return int(raw_value)
    except ValueError as exc:
        joined_keys = ", ".join(keys)
        raise ValueError(f"Invalid integer value for {joined_keys}: {raw_value}") from exc


def _bool_env(*keys: str, default: bool) -> bool:
    raw_value = _first_env(*keys)
    if raw_value is None:
        return default

    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def build_database_url() -> str:
    direct_url = _first_env("DATABASE_URL", "POSTGRES_DSN", "SQLALCHEMY_DATABASE_URI")
    if direct_url:
        return direct_url

    host = _first_env("DB_HOST", "POSTGRES_HOST", "PGHOST", "DB_SERVER")
    port = _first_env("DB_PORT", "POSTGRES_PORT", "PGPORT") or "5432"
    database = _first_env("DB_NAME", "DB_DATABASE", "POSTGRES_DB", "PGDATABASE")
    username = _first_env("DB_USER", "DB_USERNAME", "POSTGRES_USER", "PGUSER")
    password = _first_env("DB_PASSWORD", "POSTGRES_PASSWORD", "PGPASSWORD")
    ssl_mode = _first_env("DB_SSLMODE", "POSTGRES_SSLMODE", "PGSSLMODE")

    missing_fields = []
    if not host:
        missing_fields.append("DB_HOST/POSTGRES_HOST")
    if not database:
        missing_fields.append("DB_NAME/POSTGRES_DB")
    if not username:
        missing_fields.append("DB_USER/POSTGRES_USER")
    if password is None:
        missing_fields.append("DB_PASSWORD/POSTGRES_PASSWORD")

    if missing_fields:
        missing_text = ", ".join(missing_fields)
        raise ValueError(
            "Missing PostgreSQL environment variables. "
            f"Provide DATABASE_URL or set: {missing_text}."
        )

    user_part = quote_plus(username)
    password_part = quote_plus(password)
    database_part = quote_plus(database)

    url = f"postgresql+asyncpg://{user_part}:{password_part}@{host}:{port}/{database_part}"
    if ssl_mode:
        url = f"{url}?sslmode={quote_plus(ssl_mode)}"

    return url


class DatabaseService:
    def __init__(self, database_url: Optional[str] = None) -> None:
        self._database_url = database_url or build_database_url()

        self._engine: AsyncEngine = create_async_engine(
            self._database_url,
            pool_pre_ping=True,
            pool_size=_int_env("DB_POOL_SIZE", "POSTGRES_POOL_SIZE", default=5),
            max_overflow=_int_env("DB_MAX_OVERFLOW", "POSTGRES_MAX_OVERFLOW", default=10),
            pool_timeout=_int_env("DB_POOL_TIMEOUT", "POSTGRES_POOL_TIMEOUT", default=30),
            pool_recycle=_int_env("DB_POOL_RECYCLE", "POSTGRES_POOL_RECYCLE", default=1800),
            echo=_bool_env("DB_ECHO", "SQLALCHEMY_ECHO", default=False),
        )
        self._session_factory = async_sessionmaker(
            bind=self._engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )
        self._connected = False

    @property
    def database_url(self) -> str:
        return self._database_url

    @property
    def engine(self) -> AsyncEngine:
        return self._engine

    async def connect(self) -> None:
        if self._connected:
            return

        async with self._engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        self._connected = True

    async def disconnect(self) -> None:
        if not self._connected:
            return

        await self._engine.dispose()
        self._connected = False

    @asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        if not self._connected:
            await self.connect()

        async with self._session_factory() as db_session:
            yield db_session


_database_service: Optional[DatabaseService] = None


def get_database_service() -> DatabaseService:
    global _database_service

    if _database_service is None:
        _database_service = DatabaseService()
    return _database_service


async def get_db_session() -> AsyncIterator[AsyncSession]:
    database_service = get_database_service()
    async with database_service.session() as db_session:
        yield db_session


def register_database_lifecycle(app: AppWithEventHandlers) -> None:
    async def _startup() -> None:
        await get_database_service().connect()

    async def _shutdown() -> None:
        await get_database_service().disconnect()

    app.add_event_handler("startup", _startup)
    app.add_event_handler("shutdown", _shutdown)
