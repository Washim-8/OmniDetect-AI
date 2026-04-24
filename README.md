# 🚀 OmniDetect AI
### _Detect Anything. Anywhere. In Real Time._

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&pause=1000&color=0F766E&center=true&vCenter=true&width=700&lines=Real-Time+Object+Detection+System;Powered+by+YOLOv11+%2B+FastAPI;High-Performance+Computer+Vision;Smart+%7C+Secure+%7C+Scalable" />
</p>

<p align="center">
  <a href="https://github.com/Washim-8/OmniDetect-AI/stargazers"><img src="https://img.shields.io/github/stars/Washim-8/OmniDetect-AI?style=for-the-badge&color=0F766E" /></a>
  <a href="https://github.com/Washim-8/OmniDetect-AI/network/members"><img src="https://img.shields.io/github/forks/Washim-8/OmniDetect-AI?style=for-the-badge&color=0F766E" /></a>
  <a href="https://github.com/Washim-8/OmniDetect-AI/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Washim-8/OmniDetect-AI?style=for-the-badge&color=0F766E" /></a>
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,fastapi,pytorch,react,vite,js,html,css,git,docker" />
</p>

---

## 📌 Overview

**OmniDetect AI** is a state-of-the-art computer vision platform designed for real-time object detection and intelligent analysis. Built with a focus on speed and accuracy, it bridges the gap between complex deep learning models and practical, everyday applications—whether it's for surveillance, automation, or smart monitoring.

Unlike traditional detection systems that suffer from high latency, OmniDetect AI utilizes optimized inference engines (including YOLOv11 and SAHI) to provide instant feedback from live camera feeds, static images, and video files. It is built to solve real-world problems by making advanced AI accessible, secure, and highly performant.

---

## ✨ Features

- 🎯 **Advanced Real-Time Detection** — Leveraging YOLOv11 for industry-leading speed and precision.
- 🖼️ **High-Resolution Sliced Inference** — Integrated with **SAHI** for detecting small objects in large, high-res images.
- ⚡ **Hybrid Processing** — Optimized backend inference with FastAPI and experimental client-side detection via WebWorkers.
- 📸 **Multi-Source Support** — Seamlessly switch between live webcam, image uploads, and video streams.
- 🔍 **Privacy-First Design** — Built to handle data efficiently with options for edge-based processing.
- 🖥️ **Premium Dashboard** — A sleek, React-powered UI featuring glassmorphism and real-time visualization.
- 📦 **Docker Ready** — Fully containerized for easy deployment across various environments.

---

## 🛠 Tech Stack

### 💻 Core Languages
- **Python**: Backend logic and AI pipeline.
- **JavaScript (ES6+)**: Frontend interactivity and WebWorker-based inference.

### 🧠 AI / Computer Vision
- **YOLOv11 & v8**: Core detection architecture.
- **PyTorch**: Model training and optimization.
- **SAHI**: Sliced Aided Hyper Inference for small object detection.
- **OpenCV**: Image preprocessing and frame manipulation.

### ⚙️ Backend
- **FastAPI**: High-performance asynchronous API framework.
- **Uvicorn**: Lightning-fast ASGI server.

### 🎨 Frontend
- **React (Vite)**: Modern, reactive user interface.
- **CSS3 (Custom)**: Premium glassmorphic design language.

---

## 📂 Project Structure

```bash
OmniDetect-AI/
├── backend/
│   ├── api/          # API endpoints & routing logic
│   ├── core/         # Configuration & global settings
│   ├── ml/           # Model loading & inference pipelines
│   └── tests/        # Backend unit & integration tests
├── frontend/
│   ├── src/          # React components & state management
│   ├── public/       # Static assets
│   └── index.html    # Entry point
├── models/           # Pre-trained YOLO weights (.pt files)
├── docker-compose.yml# Multi-container orchestration
└── requirements.txt  # Python dependencies
```

---

## ⚙️ How It Works

1. **Input Capture**: The system accepts inputs from a live webcam feed, uploaded images, or video files.
2. **Preprocessing**: Images are normalized, resized, and—if high-res—sliced using SAHI to ensure even the smallest details aren't missed.
3. **Inference Pipeline**: The FastAPI backend processes frames through the YOLO model. For client-side tests, the frontend uses WebWorkers to prevent UI blocking.
4. **Result Synthesis**: Bounding boxes are drawn, confidence scores are calculated, and labels are assigned in real-time.
5. **Output Visualization**: The UI renders a smooth overlay, providing instant visual feedback and detection analytics.

---

## ▶️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Washim-8/OmniDetect-AI.git
cd OmniDetect-AI
```

### 2️⃣ Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn api.main:app --reload
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4️⃣ Docker Deployment (Optional)
```bash
docker-compose up --build
```

---

## 📸 Screenshots & Demo

> [!TIP]
> **GIF Idea 1:** Live webcam feed showing real-time detection of common household objects.
> **GIF Idea 2:** Sliced inference demo where a large drone shot is processed to find small vehicles.
> **GIF Idea 3:** Switching between Light and Dark modes with smooth transitions.

---

## 🚀 Future Improvements

- 🧠 **DeepSORT Integration**: Implementing robust object tracking across frames.
- ☁️ **Cloud Inference API**: Providing a scalable endpoint for third-party integrations.
- 📱 **Mobile Optimization**: Progressive Web App (PWA) support for on-the-go detection.
- 📊 **Custom Training Dashboard**: A tool for users to fine-tune models on their own datasets.

---

## 👨‍💻 Author

**Washim Shaikh**  
_Aspiring Software Engineer & AI Enthusiast_

I am a Computer Science Engineering student dedicated to building systems that don't just work, but solve real-world problems. My passion lies at the intersection of AI/ML and modern web architecture, with a focus on creating intelligent, scalable, and practically useful applications.

Whether it’s engineering e-auction platforms for farmers (**AgriTrade**), developing advanced **Fraud Detection Systems**, or building **LLM-based Chatbots**, I approach every project with a problem-solving mindset and a commitment to technical excellence.

### 🔧 Skills
- **Languages**: Python, Java, C, C++, JavaScript
- **Frameworks**: FastAPI, Django, React, Flask
- **AI/ML**: Computer Vision, PyTorch, TensorFlow, Data Analysis
- **Tools**: Git, GitHub, Docker, AWS, VS Code

### 💼 Experience
- **AWS Internship**: iStudio (Ongoing)
- **Machine Learning Internship**: Yhills
- **AI with Python Internship**: Coincent
- **Full Stack Development Internship**: 1Stop

---

## 📬 Contact

<p align="left">
  <a href="mailto:washimshaikh33@gmail.com"><img src="https://img.shields.io/badge/Email-0F766E?style=for-the-badge&logo=gmail&logoColor=white" /></a>
  <a href="https://www.linkedin.com/in/washim-shaikh-349868281/"><img src="https://img.shields.io/badge/LinkedIn-0F766E?style=for-the-badge&logo=linkedin&logoColor=white" /></a>
  <a href="https://github.com/Washim-8"><img src="https://img.shields.io/badge/GitHub-0F766E?style=for-the-badge&logo=github&logoColor=white" /></a>
</p>

> [!IMPORTANT]
> **Let’s build something great.** I’m always open to collaborations, innovative project ideas, or new opportunities in the AI and Software Engineering space.

---

## 📊 Performance & Stats
<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=Washim-8&show_icons=true&theme=tokyonight&hide_border=true&bg_color=0F172A&title_color=0F766E&icon_color=0F766E&text_color=94A3B8" width="48%" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=Washim-8&theme=tokyonight&hide_border=true&background=0F172A&stroke=0F766E&ring=0F766E&fire=0F766E&currStreakLabel=0F766E" width="48%" />
</p>

---

## ⭐ Support
If you found this project useful, please consider giving it a **Star**! It helps more than you think.
