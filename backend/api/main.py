import os
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from backend.api.routes import router as api_router
from backend.core.config import settings
from backend.ml.inference import detector_status, get_detector

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

# Static file serving for React frontend (when dist is built)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    models_dir = os.path.join(frontend_dist, "models")
    if os.path.exists(models_dir):
        app.mount("/models", StaticFiles(directory=models_dir), name="models")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": f"Welcome to {settings.PROJECT_NAME}"}
