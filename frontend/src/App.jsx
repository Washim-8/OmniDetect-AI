import React, { useState, useEffect } from 'react';
import ImageDetection from './components/ImageDetection';
import WebcamDetection from './components/WebcamDetection';
import './index.css';

import config from './config';

function App() {
  const [activeTab, setActiveTab] = useState('image');
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

  return (
    <div className="app-container">
      <nav className="glass-nav">
        <a href="/" className="logo">Washim Shaikh</a>
        <div className="nav-links">
          <a href="/">🧠 AI Detector</a>
          <a href="/portfolio.html" className="nav-cta">👤 About & Portfolio</a>
        </div>
      </nav>

      <header className="header">
        <div className="status-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          background: isBackendReady ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: isBackendReady ? '#10b981' : '#f59e0b',
          marginBottom: '1rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isBackendReady ? '#10b981' : '#f59e0b'
          }}></span>
          {isBackendReady ? 'Detection Server Online' : 'Detection Server Offline'}
        </div>
        <h1>OmniDetect AI</h1>
        <p>Advanced Real-Time Object Detection Powered by YOLOv11</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          Image Analysis
        </button>
        <button
          className={`tab ${activeTab === 'webcam' ? 'active' : ''}`}
          onClick={() => setActiveTab('webcam')}
        >
          Live Webcam
        </button>
      </div>

      <main>
        {activeTab === 'image' ? <ImageDetection /> : <WebcamDetection />}
      </main>
    </div>
  );
}

export default App;
