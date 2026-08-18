import logging
import sys
import os

def setup_logging():
    handlers = [logging.StreamHandler(sys.stdout)]
    log_path = os.environ.get("LOG_FILE", "app.log")
    try:
        handlers.append(logging.FileHandler(log_path))
    except (OSError, PermissionError):
        pass
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=handlers,
    )
    return logging.getLogger("object_detection")

logger = setup_logging()

