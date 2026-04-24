import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import config from '../config';

export default function WebcamDetection({ isBackendReady }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [confidence, setConfidence] = useState(0.25);
  const [detections, setDetections] = useState([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const workerRef = useRef(null);
  const isProcessing = useRef(false);

  // Local backend status check (if prop not provided)
  const [localBackendReady, setLocalBackendReady] = useState(false);
  const ready = isBackendReady !== undefined ? isBackendReady : localBackendReady;

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/`);
        if (res.ok) setLocalBackendReady(true);
      } catch (e) {
        setLocalBackendReady(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/detection.worker.js', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, detections, error } = e.data;
      if (type === 'LOADED') {
        setIsModelLoaded(true);
        console.log("Model loaded in worker");
      } else if (type === 'RESULTS') {
        setDetections(detections);
        isProcessing.current = false;
      } else if (type === 'ERROR') {
        console.error("Worker error:", error);
      }
    };

    workerRef.current.postMessage({ type: 'LOAD' });

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 640, facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing webcam: ", err);
      alert("Could not access webcam. Ensure you are on HTTPS or localhost.");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setDetections([]);
    }
  };

  const preprocessAndDetect = useCallback(async () => {
    if (!videoRef.current || !isStreaming || isProcessing.current) return;
    
    if (useBackend && !ready) return;
    if (!useBackend && !isModelLoaded) return;

    isProcessing.current = true;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(video, 0, 0, 640, 640);

    if (useBackend) {
      // Backend detection
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'webcam.jpg');
        formData.append('confidence', confidence.toString());

        try {
          const response = await fetch(`${config.API_BASE_URL}${config.API_V1_STR}/predict`, {
            method: 'POST',
            body: formData,
          });
          const result = await response.json();
          setDetections(result.objects);
        } catch (error) {
          console.error("Backend detection error:", error);
        } finally {
          isProcessing.current = false;
        }
      }, 'image/jpeg', 0.7);
    } else {
      // Frontend (ONNX) detection
      const imageData = ctx.getImageData(0, 0, 640, 640);
      workerRef.current.postMessage({
        type: 'DETECT',
        data: {
          buffer: imageData.data.buffer,
          threshold: confidence,
          iouThreshold: 0.45
        }
      }, [imageData.data.buffer]);
    }
  }, [isStreaming, isModelLoaded, confidence, useBackend, isBackendReady]);

  useEffect(() => {
    let frameId;
    const loop = () => {
      preprocessAndDetect();
      frameId = requestAnimationFrame(loop);
    };
    if (isStreaming && isModelLoaded) {
      frameId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isStreaming, isModelLoaded, preprocessAndDetect]);

  const drawBoundingBoxes = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    const scaleX = video.clientWidth / 640;
    const scaleY = video.clientHeight / 640;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const [x, y, w, h] = det.bbox;
      
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledW = w * scaleX;
      const scaledH = h * scaleY;

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
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
          {!isStreaming ? (
            <button className="btn" onClick={startWebcam}>Start Webcam</button>
          ) : (
            <button className="btn secondary" onClick={stopWebcam}>Stop Webcam</button>
          )}
          
          <div className="slider-container">
            <label>Confidence: {confidence.toFixed(2)}</label>
            <input 
              type="range" 
              min="0.1" max="1.0" step="0.05" 
              value={confidence} 
              onChange={(e) => setConfidence(parseFloat(e.target.value))} 
            />
          </div>

          <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '20px' }}>
            <label style={{ fontSize: '0.9rem' }}>High Accuracy (Backend)</label>
            <input 
              type="checkbox" 
              checked={useBackend} 
              onChange={(e) => setUseBackend(e.target.checked)}
              disabled={!isBackendReady}
            />
          </div>

          <div style={{marginLeft: 'auto', fontSize: '0.8rem', color: (useBackend ? ready : isModelLoaded) ? 'var(--success)' : 'orange'}}>
            {useBackend 
              ? (ready ? '● Detection Server Active' : '○ Connecting to Server...')
              : (isModelLoaded ? '● Engine Active (ONNX)' : '○ Loading Engine...')
            }
          </div>
        </div>

        <div className="preview-area">
          {!isStreaming && (
            <div className="placeholder-text">
              <p>Camera is off</p>
            </div>
          )}
          
          <div style={{ position: 'relative', display: isStreaming ? 'inline-block' : 'none' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
            <canvas ref={canvasRef}></canvas>
          </div>
        </div>
      </div>

      <div className="results-panel">
        <h3>Live Analysis ({detections.length})</h3>
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
