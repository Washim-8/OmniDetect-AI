import cv2
import albumentations as A
import numpy as np
from backend.core.logging import logger
from backend.core.config import settings

def get_train_transforms():
    """
    Returns advanced data augmentation pipeline for training.
    Advanced augmentations like Mosaic and MixUp are handled by YOLO11 internally,
    but these can be used for pre-processing other data.
    """
    return A.Compose([
        A.HorizontalFlip(p=0.5),
        A.VerticalFlip(p=0.1),
        A.RandomRotate90(p=0.2),
        A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.3),
        A.HueSaturationValue(p=0.2),
        A.GaussNoise(p=0.1),
        A.MotionBlur(p=0.1),
        A.Resize(settings.INPUT_SIZE, settings.INPUT_SIZE)
    ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))

def preprocess_image(image_path_or_bytes):
    """
    Optimized preprocessing: resize and normalize.
    Supports both path and raw bytes.
    """
    if isinstance(image_path_or_bytes, bytes):
        nparr = np.frombuffer(image_path_or_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    else:
        img = cv2.imread(image_path_or_bytes)
        
    if img is None:
        logger.error(f"Failed to read image")
        return None
    
    # YOLO handles RGB conversion and resizing internally, 
    # but for manual preprocessing:
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img, (settings.INPUT_SIZE, settings.INPUT_SIZE))
    
    # Normalization (YOLO also does this internally)
    img_normalized = img_resized / 255.0
    
    return img_normalized
