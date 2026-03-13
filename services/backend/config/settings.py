from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    mongo_db: str = "ccc_dashboard"
    max_upload_size: int = 50 * 1024 * 1024  # 50 MB
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_prefix": "CCC_"}


settings = Settings()
