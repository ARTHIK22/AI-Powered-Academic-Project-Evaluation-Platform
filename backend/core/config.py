"""
ProjectSense AI - Application Configuration
"""
from pydantic import field_validator
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

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://ai-power-academic-project-evaluatio.vercel.app",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, value):
        if value is None:
            return cls.__fields__["CORS_ORIGINS"].default

        if isinstance(value, str):
            stripped_value = value.strip()
            if not stripped_value:
                return cls.__fields__["CORS_ORIGINS"].default

            try:
                parsed = json.loads(stripped_value)
            except json.JSONDecodeError:
                return [origin.strip() for origin in stripped_value.split(",") if origin.strip()]

            if isinstance(parsed, list):
                return parsed
            return [str(parsed)]

        return value

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
