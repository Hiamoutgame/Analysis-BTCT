from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass
class UserRecord:
    user_id: int
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    password_hash: str


AUTH_SCHEMA_SQL = [
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('user', 'admin');
        END IF;
    END
    $$;
    """,
    """
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,
    """
    CREATE TABLE IF NOT EXISTS app_user (
        user_id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(120),
        role user_role NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    DROP TRIGGER IF EXISTS trg_app_user_updated_at ON app_user;
    """,
    """
    CREATE TRIGGER trg_app_user_updated_at
    BEFORE UPDATE ON app_user
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
    """,
    """
    CREATE TABLE IF NOT EXISTS app_refresh_token (
        token_id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS app_password_reset_token (
        reset_id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
        token_hash VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_app_refresh_token_user ON app_refresh_token (user_id);
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_app_password_reset_token_user ON app_password_reset_token (user_id);
    """,
]


def _row_to_user(row: dict) -> UserRecord:
    return UserRecord(
        user_id=row["user_id"],
        email=row["email"],
        full_name=row["full_name"],
        role=row["role"],
        is_active=row["is_active"],
        password_hash=row["password_hash"],
    )


async def initialize_auth_schema(session: AsyncSession) -> None:
    for sql in AUTH_SCHEMA_SQL:
        await session.execute(text(sql))
    await session.commit()


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[UserRecord]:
    result = await session.execute(
        text(
            """
            SELECT user_id, email, full_name, role::text AS role, is_active, password_hash
            FROM app_user
            WHERE lower(email) = :email
            LIMIT 1
            """
        ),
        {"email": email.lower().strip()},
    )
    row = result.mappings().first()
    return _row_to_user(row) if row else None


async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[UserRecord]:
    result = await session.execute(
        text(
            """
            SELECT user_id, email, full_name, role::text AS role, is_active, password_hash
            FROM app_user
            WHERE user_id = :user_id
            LIMIT 1
            """
        ),
        {"user_id": user_id},
    )
    row = result.mappings().first()
    return _row_to_user(row) if row else None


async def create_user(
    session: AsyncSession,
    *,
    email: str,
    password_hash: str,
    full_name: Optional[str],
    role: str = "user",
) -> UserRecord:
    result = await session.execute(
        text(
            """
            INSERT INTO app_user (email, password_hash, full_name, role)
            VALUES (:email, :password_hash, :full_name, CAST(:role AS user_role))
            RETURNING user_id, email, full_name, role::text AS role, is_active, password_hash
            """
        ),
        {
            "email": email.lower().strip(),
            "password_hash": password_hash,
            "full_name": full_name,
            "role": role,
        },
    )
    row = result.mappings().first()
    await session.commit()
    return _row_to_user(row)


async def store_refresh_token(
    session: AsyncSession,
    *,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
) -> None:
    await session.execute(
        text(
            """
            INSERT INTO app_refresh_token (user_id, token_hash, expires_at)
            VALUES (:user_id, :token_hash, :expires_at)
            """
        ),
        {"user_id": user_id, "token_hash": token_hash, "expires_at": expires_at},
    )
    await session.commit()


async def revoke_refresh_token(session: AsyncSession, token_hash: str) -> bool:
    result = await session.execute(
        text(
            """
            UPDATE app_refresh_token
            SET revoked_at = CURRENT_TIMESTAMP
            WHERE token_hash = :token_hash
              AND revoked_at IS NULL
            RETURNING token_id
            """
        ),
        {"token_hash": token_hash},
    )
    await session.commit()
    return result.scalar_one_or_none() is not None


async def is_refresh_token_active(session: AsyncSession, token_hash: str) -> bool:
    result = await session.execute(
        text(
            """
            SELECT token_id
            FROM app_refresh_token
            WHERE token_hash = :token_hash
              AND revoked_at IS NULL
              AND expires_at > CURRENT_TIMESTAMP
            LIMIT 1
            """
        ),
        {"token_hash": token_hash},
    )
    return result.scalar_one_or_none() is not None


async def revoke_all_refresh_tokens_for_user(session: AsyncSession, user_id: int) -> None:
    await session.execute(
        text(
            """
            UPDATE app_refresh_token
            SET revoked_at = CURRENT_TIMESTAMP
            WHERE user_id = :user_id
              AND revoked_at IS NULL
            """
        ),
        {"user_id": user_id},
    )
    await session.commit()


async def store_password_reset_token(
    session: AsyncSession,
    *,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
) -> None:
    await session.execute(
        text(
            """
            INSERT INTO app_password_reset_token (user_id, token_hash, expires_at)
            VALUES (:user_id, :token_hash, :expires_at)
            """
        ),
        {"user_id": user_id, "token_hash": token_hash, "expires_at": expires_at},
    )
    await session.commit()


async def consume_password_reset_token(session: AsyncSession, token_hash: str) -> Optional[int]:
    result = await session.execute(
        text(
            """
            UPDATE app_password_reset_token
            SET used_at = CURRENT_TIMESTAMP
            WHERE token_hash = :token_hash
              AND used_at IS NULL
              AND expires_at > CURRENT_TIMESTAMP
            RETURNING user_id
            """
        ),
        {"token_hash": token_hash},
    )
    row = result.mappings().first()
    await session.commit()
    return row["user_id"] if row else None


async def update_user_password(session: AsyncSession, user_id: int, password_hash: str) -> None:
    await session.execute(
        text(
            """
            UPDATE app_user
            SET password_hash = :password_hash
            WHERE user_id = :user_id
            """
        ),
        {"user_id": user_id, "password_hash": password_hash},
    )
    await session.commit()
