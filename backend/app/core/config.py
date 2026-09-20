import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "examples"

class Settings:
    PROJECT_NAME: str = "Ichnos"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/tracelake.db")
    EXAMPLES_DIR: Path = DATA_DIR

settings = Settings()
