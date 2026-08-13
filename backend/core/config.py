"""
ProjectSense AI - Application Configuration
"""
from pydantic import field_validator, Field
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ProjectSense AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./projectsense.db"

    # AI (Grok / xAI)
    GROK_API_KEY: str = ""
    GROK_MODEL: str = "grok-3"

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50

    # CORS: store raw env value here (avoids pydantic-settings pre-decoding errors)
    CORS_ORIGINS_RAW: str = Field(
        '["http://localhost:3000", "https://ai-powered-academic-project-evaluat.vercel.app", "https://ai-powered-academic-project-evaluation.onrender.com"]',
        env="CORS_ORIGINS",
    )

    def _parse_cors_raw(self) -> List[str]:
        default = [
            "http://localhost:3000",
            "https://ai-powered-academic-project-evaluat.vercel.app",
            "https://ai-powered-academic-project-evaluation.onrender.com",
        ]

        value = getattr(self, "CORS_ORIGINS_RAW", None)
        if value is None:
            return default

        # If it's already a list (unlikely for RAW field), return as-is
        if isinstance(value, list):
            return value

        # Parse string: allow JSON array, comma-separated list, or single URL
        if isinstance(value, str):
            s = value.strip()
            if not s:
                return default

            try:
                parsed = json.loads(s)
            except Exception:
                return [origin.strip() for origin in s.split(",") if origin.strip()]

            if isinstance(parsed, list):
                return parsed
            return [str(parsed)]

        # Fallback
        try:
            return list(value)
        except Exception:
            return default

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return self._parse_cors_raw()

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
