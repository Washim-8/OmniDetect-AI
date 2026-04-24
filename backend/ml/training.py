from ultralytics import YOLO
from backend.core.logging import logger
from backend.core.config import settings

def train_model(data_yaml="coco128.yaml", epochs=100, imgsz=640, device=None):
    """
    Train a high-capacity YOLOv11 model.
    Using larger models (like 'm', 'l', or 'x') for maximum accuracy.
    """
    logger.info(f"Initializing High-Capacity YOLOv11 model ({settings.MODEL_PATH}) for training")
    # Load the high-capacity model
    model = YOLO(settings.MODEL_PATH)
    
    # Advanced training settings for maximum accuracy:
    # 1. More epochs (100+) for better convergence
    # 2. Use early stopping (patience)
    # 3. Use higher resolution if data allows
    logger.info(f"Starting high-accuracy training for {epochs} epochs on {data_yaml}")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        patience=20,  # Increased patience for larger models
        device=device,
        project="high_accuracy_project",
        name="yolo11_high_cap_run",
        exist_ok=True
    )
    
    logger.info("Training complete.")
    return results

def export_model(model_path=settings.MODEL_PATH, format="onnx"):
    """
    Export the model to faster inference formats like ONNX or OpenVINO.
    """
    logger.info(f"Exporting model {model_path} to {format}")
    model = YOLO(model_path)
    path = model.export(format=format)
    logger.info(f"Model exported successfully to {path}")
    return path

if __name__ == "__main__":
    # Example: train and then export
    # train_model()
    export_model()
