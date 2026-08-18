from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.api.routes import router as api_router
from backend.core.config import settings
from backend.ml.inference import detector_status, get_detector
import threading

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

cors_origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

MODEL_LOADING_STARTED = False
MODEL_LOADING_ERROR = None

def _load_model_async():
    global MODEL_LOADING_ERROR
    try:
        d = get_detector()
        if d is None:
            MODEL_LOADING_ERROR = "Model failed to initialize"
    except Exception as e:
        MODEL_LOADING_ERROR = str(e)

@app.on_event("startup")
async def startup_event():
    global MODEL_LOADING_STARTED
    if not MODEL_LOADING_STARTED:
        MODEL_LOADING_STARTED = True
        thread = threading.Thread(target=_load_model_async, daemon=True)
        thread.start()

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

@app.get("/health")
def health_check():
    status = detector_status()
    model_loaded = status["loaded"]
    if model_loaded:
        overall = "healthy"
        code = 200
    elif MODEL_LOADING_ERROR:
        overall = "error"
        code = 503
    elif MODEL_LOADING_STARTED:
        overall = "loading"
        code = 200
    else:
        overall = "starting"
        code = 200
    return JSONResponse(
        status_code=code,
        content={
            "status": overall,
            "model_loaded": model_loaded,
            "model_path": status.get("model_path", settings.MODEL_PATH),
            "error": MODEL_LOADING_ERROR,
        }
    )

