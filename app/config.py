from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./finance.db"
    UPLOAD_ROOT: Path = Path("uploads")
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS: set[str] = {".pdf", ".doc", ".docx", ".xlsx", ".xls"}

    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"
    PARSING_CHUNK_SIZE: int = 25
    PARSING_CHUNK_OVERLAP: int = 5
    PARSING_MAX_CONCURRENT: int = 3

    model_config = {"env_prefix": "FINANCE_"}


settings = Settings()
