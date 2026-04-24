from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Real-Time Object Detection API"
    API_V1_STR: str = "/api/v1"
    MODEL_PATH: str = "yolo11m.pt"  # Balanced Medium model for better speed
    CONFIDENCE_THRESHOLD: float = 0.25  # Standard threshold
    INPUT_SIZE: int = 640  # Standard resolution for speed
    USE_HALF: bool = True
    USE_TTA: bool = False   # Disable TTA for speed, enable only if needed
    
    class Config:
        case_sensitive = True

settings = Settings()
