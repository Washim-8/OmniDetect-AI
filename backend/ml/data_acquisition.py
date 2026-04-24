import os
import requests
from backend.core.logging import logger

def download_sample_data(output_dir="data"):
    os.makedirs(output_dir, exist_ok=True)
    sample_url = "https://ultralytics.com/images/zidane.jpg"
    dest_path = os.path.join(output_dir, "sample.jpg")
    
    if not os.path.exists(dest_path):
        logger.info(f"Downloading sample image to {dest_path}")
        response = requests.get(sample_url)
        with open(dest_path, "wb") as f:
            f.write(response.content)
        logger.info("Download complete.")
    else:
        logger.info("Sample data already exists.")
        
if __name__ == "__main__":
    download_sample_data()
