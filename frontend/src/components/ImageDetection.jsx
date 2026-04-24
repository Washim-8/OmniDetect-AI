import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import config from '../config';

export default function ImageDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confidence, setConfidence] = useState(0.25);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef(null);
   const imageRef = useRef(null);
   
   // Backend status check
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/`);
        if (res.ok) setIsBackendReady(true);
      } catch (e) {
        setIsBackendReady(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImage = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetections([]);
    }
  };

  const handleImageChange = (e) => {
    handleImage(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImage(e.dataTransfer.files[0]);
    }
  };

  const handleDetect = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setDetections([]);

    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('confidence', confidence.toString());

    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_V1_STR}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`);
      }

      const result = await response.json();
      setDetections(result.objects);
    } catch (error) {
      console.error("Detection error:", error);
      alert("Failed to connect to detection server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const drawBoundingBoxes = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || detections.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = img.clientWidth / img.clientHeight;
    
    let renderW, renderH, offsetX, offsetY;
    
    if (imgRatio > containerRatio) {
      renderW = img.clientWidth;
      renderH = img.clientWidth / imgRatio;
      offsetX = 0;
      offsetY = (img.clientHeight - renderH) / 2;
    } else {
      renderH = img.clientHeight;
      renderW = img.clientHeight * imgRatio;
      offsetY = 0;
      offsetX = (img.clientWidth - renderW) / 2;
    }

    const scaleX = renderW / img.naturalWidth;
    const scaleY = renderH / img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const [x, y, w, h] = det.bbox;
      
      const scaledX = (x * scaleX) + offsetX;
      const scaledY = (y * scaleY) + offsetY;
      const scaledW = w * scaleX;
      const scaledH = h * scaleY;

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

      ctx.fillStyle = '#2563eb';
      const text = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(scaledX, scaledY - 25, textWidth + 10, 25);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter';
      ctx.fillText(text, scaledX + 5, scaledY - 7);
    });
  }, [detections]);

  useEffect(() => {
    drawBoundingBoxes();
  }, [detections, drawBoundingBoxes]);

  return (
    <div className="glass-panel workspace">
      <div className="main-content">
        <div className="controls-container">
          <input
            type="file"
            accept="image/*"
            id="image-upload"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload" className="btn secondary">
            Choose Image
          </label>
          
          <div className="slider-container">
            <label>Confidence: {confidence.toFixed(2)}</label>
            <input 
              type="range" 
              min="0.1" max="1.0" step="0.05" 
              value={confidence} 
              onChange={(e) => setConfidence(parseFloat(e.target.value))} 
            />
          </div>

          <button 
            className="btn" 
            onClick={handleDetect} 
            disabled={!selectedImage || isLoading || !isBackendReady}
          >
            {isLoading ? 'Analyzing...' : 'Run Detection'}
          </button>

          <div style={{marginLeft: 'auto', fontSize: '0.8rem', color: isBackendReady ? 'var(--success)' : 'orange'}}>
            {isBackendReady ? '● Detection Server Active' : '○ Connecting to Server...'}
          </div>
        </div>

        <div 
          className={`preview-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            borderColor: isDragging ? 'var(--accent)' : '',
            background: isDragging ? 'rgba(37, 99, 235, 0.05)' : ''
          }}
        >
          {isLoading && <div className="loading-spinner" style={{position: 'absolute', zIndex: 10}}></div>}
          
          {previewUrl ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                ref={imageRef}
                onLoad={drawBoundingBoxes}
              />
              <canvas ref={canvasRef}></canvas>
            </div>
          ) : (
            <div className="placeholder-text">
              <p>Click "Choose Image" or <b>Drag & Drop</b> here</p>
            </div>
          )}
        </div>
      </div>

      <div className="results-panel">
        <h3>Analysis Results ({detections.length})</h3>
        <ul className="detection-list">
          {detections.map((det, idx) => (
            <li key={idx} className="detection-item">
              <span className="detection-label">{det.label}</span>
              <span className="detection-conf">{(det.confidence * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
