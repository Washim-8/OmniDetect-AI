from ultralytics import YOLO
from backend.core.logging import logger
import json

def evaluate_model(model_path="runs/detect/train/weights/best.pt", data_yaml="coco128.yaml"):
    logger.info(f"Loading model {model_path} for evaluation")
    model = YOLO(model_path)
    
    logger.info(f"Evaluating model on {data_yaml}")
    metrics = model.val(data=data_yaml)
    
    eval_results = {
        "mAP50-95": metrics.box.map,
        "mAP50": metrics.box.map50,
        "precision": metrics.box.mp,
        "recall": metrics.box.mr
    }
    
    logger.info(f"Evaluation Results: {json.dumps(eval_results, indent=2)}")
    return eval_results

if __name__ == "__main__":
    try:
        evaluate_model()
    except Exception as e:
        logger.error(f"Evaluation failed (likely no trained model found): {e}")
