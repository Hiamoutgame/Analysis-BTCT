from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import get_settings
from app.infrastructure.auth_repository import initialize_auth_schema
from app.infrastructure.database_service import get_database_service, register_database_lifecycle
from app.presentation.API.auth_router import router as auth_router

settings = get_settings()
logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    database_service = get_database_service()
    async with database_service.session() as session:
        await initialize_auth_schema(session)

    host = settings.app_host
    port = settings.app_port
    display_host = "localhost" if host in {"0.0.0.0", "::"} else host
    docs_url = app.docs_url or "/docs"
    openapi_url = app.openapi_url or "/openapi.json"
    logger.info("Swagger UI available at: http://%s:%s%s", display_host, port, docs_url)
    logger.info("OpenAPI schema available at: http://%s:%s%s", display_host, port, openapi_url)
    yield
    # Shutdown
    pass


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
    description=(
        "Authentication API for LumiFin."
        "\n\nUse Swagger at `/docs` to test register/login/refresh/logout/forgot/reset-password endpoints."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_database_lifecycle(app)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router, prefix=settings.api_prefix)


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.app_host, port=settings.app_port, reload=True)
