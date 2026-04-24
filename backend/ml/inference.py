import cv2
import numpy as np
import torch
from ultralytics import YOLO
from backend.core.config import settings
from backend.core.logging import logger

class ObjectDetector:
    def __init__(self, model_path: str = settings.MODEL_PATH):
        logger.info(f"Loading Extreme Capacity model from {model_path}")
        self.model = YOLO(model_path)
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        
        # Warm-up
        dummy_input = torch.zeros((1, 3, settings.INPUT_SIZE, settings.INPUT_SIZE)).to(self.device)
        self.model(dummy_input, verbose=False)
        
        self.confidence_threshold = settings.CONFIDENCE_THRESHOLD
        logger.info(f"Model loaded successfully on {self.device}")

    def _enhance_image(self, img):
        """Advanced image enhancement for better detection in low light/low contrast."""
        # Convert to LAB color space
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L-channel
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        
        # Merge channels and convert back to BGR
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

        # Step 1: Image Enhancement
        enhanced_img = self._enhance_image(img)

        # Step 2: Global Inference
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
            
        # Step 3: SAHI Lite (Slicing-Aided Hyper Inference)
        # If we find very few objects or if resolution is high, we can run inference on center crop
        # to catch small objects that might be missed in the global view.
        if len(objects) < 3:
            h, w = enhanced_img.shape[:2]
            # Define a center crop (50% of original size)
            ch, cw = h // 2, w // 2
            y1_c, x1_c = h // 4, w // 4
            y2_c, x2_c = y1_c + ch, x1_c + cw
            center_crop = enhanced_img[y1_c:y2_c, x1_c:x2_c]
            
            crop_results = self.model.predict(
                source=center_crop,
                conf=conf * 1.2, # Higher threshold for crop to avoid noise
                device=self.device,
                imgsz=settings.INPUT_SIZE,
                verbose=False
            )[0]
            
            for box in crop_results.boxes:
                cx1, cy1, cx2, cy2 = box.xyxy[0].tolist()
                # Map back to original coordinates
                gx1, gy1 = cx1 + x1_c, cy1 + y1_c
                gx2, gy2 = cx2 + x1_c, cy2 + y1_c
                
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                label = self.model.names[class_id]
                
                # Check for duplicates before adding
                is_duplicate = False
                for obj in objects:
                    ox, oy, ow, oh = obj["bbox"]
                    # Simple IOU/distance check for duplicates
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

try:
    detector = ObjectDetector()
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    detector = None
