from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.ml.inference import get_detector
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class DetectionResult(BaseModel):
    label: str
    confidence: float
    bbox: List[int]

class PredictResponse(BaseModel):
    objects: List[DetectionResult]

@router.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...), confidence: Optional[float] = Form(None)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    detector = get_detector()
    if detector is None:
        raise HTTPException(status_code=503, detail="Model is still loading. Please try again in 30 seconds.")

    try:
        contents = await file.read()
        results = detector.predict_image(contents, conf=confidence)
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

