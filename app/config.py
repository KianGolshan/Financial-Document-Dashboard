from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./finance.db"
    UPLOAD_ROOT: Path = Path("uploads")
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS: set[str] = {".pdf", ".doc", ".docx"}

    model_config = {"env_prefix": "FINANCE_"}


settings = Settings()
