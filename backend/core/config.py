from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Real-Time Object Detection API"
    API_V1_STR: str = "/api/v1"
    MODEL_PATH: str = os.getenv("MODEL_PATH", "yolov8n.pt")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
    INPUT_SIZE: int = int(os.getenv("INPUT_SIZE", "640"))
    USE_HALF: bool = os.getenv("USE_HALF", "True").lower() == "true"
    USE_TTA: bool = os.getenv("USE_TTA", "False").lower() == "true"
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
