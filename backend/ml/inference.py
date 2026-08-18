import cv2
import numpy as np
import torch
from ultralytics import YOLO
from backend.core.config import settings
from backend.core.logging import logger

class ObjectDetector:
    def __init__(self, model_path: str = settings.MODEL_PATH):
        logger.info(f"Loading model from {model_path}")
        self.model = YOLO(model_path)

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

        dummy_input = torch.zeros((1, 3, settings.INPUT_SIZE, settings.INPUT_SIZE)).to(self.device)
        self.model(dummy_input, verbose=False)

        self.confidence_threshold = settings.CONFIDENCE_THRESHOLD
        logger.info(f"Model loaded successfully on {self.device}")

    def _enhance_image(self, img):
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)

        limg = cv2.merge((cl,a,b))
        enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        return enhanced_img

    def predict_image(self, image_bytes: bytes, conf: float = None):
        if conf is None:
            conf = self.confidence_threshold

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Invalid image data")

        enhanced_img = self._enhance_image(img)

        results = self.model.predict(
            source=enhanced_img,
            conf=conf,
            iou=0.45,
            device=self.device,
            half=torch.cuda.is_available() and settings.USE_HALF,
            imgsz=settings.INPUT_SIZE,
            augment=settings.USE_TTA,
            agnostic_nms=True,
            verbose=False
        )[0]

        objects = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            label = self.model.names[class_id]

            objects.append({
                "label": label,
                "confidence": round(confidence, 4),
                "bbox": [int(x1), int(y1), int(x2 - x1), int(y2 - y1)]
            })

        if len(objects) < 3:
            h, w = enhanced_img.shape[:2]
            ch, cw = h // 2, w // 2
            y1_c, x1_c = h // 4, w // 4
            y2_c, x2_c = y1_c + ch, x1_c + cw
            center_crop = enhanced_img[y1_c:y2_c, x1_c:x2_c]

            crop_results = self.model.predict(
                source=center_crop,
                conf=conf * 1.2,
                device=self.device,
                imgsz=settings.INPUT_SIZE,
                verbose=False
            )[0]

            for box in crop_results.boxes:
                cx1, cy1, cx2, cy2 = box.xyxy[0].tolist()
                gx1, gy1 = cx1 + x1_c, cy1 + y1_c
                gx2, gy2 = cx2 + x1_c, cy2 + y1_c

                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                label = self.model.names[class_id]

                is_duplicate = False
                for obj in objects:
                    ox, oy, ow, oh = obj["bbox"]
                    if abs(gx1 - ox) < 20 and abs(gy1 - oy) < 20:
                        is_duplicate = True
                        break

                if not is_duplicate:
                    objects.append({
                        "label": label,
                        "confidence": round(confidence, 4),
                        "bbox": [int(gx1), int(gy1), int(gx2 - gx1), int(gy2 - gy1)]
                    })

        return {"objects": objects}


_detector = None
_detector_lock = None

def _get_lock():
    global _detector_lock
    if _detector_lock is None:
        import threading
        _detector_lock = threading.Lock()
    return _detector_lock

def get_detector():
    global _detector
    if _detector is not None:
        return _detector
    lock = _get_lock()
    with lock:
        if _detector is not None:
            return _detector
        try:
            _detector = ObjectDetector()
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            _detector = None
        return _detector

def detector_status():
    return {
        "loaded": _detector is not None,
        "model_path": settings.MODEL_PATH,
    }

