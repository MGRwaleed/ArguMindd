# ⚔️ ArguMind — AI Debate Assistant

> **TRUTH IS NOT SPOKEN · IT IS PROVEN**

ArguMind is a real-time AI-powered debate platform that listens, analyzes, and judges arguments as they happen. Submit your argument. Let the AI decide. Fair analysis. Unbiased verdicts.

---

## 🧠 What It Does

- 🎙️ **Live Speech-to-Text** — Captures both speakers via Deepgram and transcribes in real time
- 🔍 **AI Fact Checking** — Claims are extracted and verified using Groq LLaMA 3.3 70B + Tavily search
- ⚖️ **Automated Judging** — Scores each argument with TRUE / FALSE / PARTIALLY TRUE verdicts and confidence scores
- 📊 **Deep Summary** — End-of-debate analysis with strengths, weaknesses, and round-by-round breakdown
- 🌐 **Real-Time Debate Rooms** — WebRTC-powered video rooms with unique room codes
- 🏆 **Leaderboard & History** — Track your debate record, ELO ranking, and session history

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   ARGUMIND STACK                    │
├──────────────┬──────────────┬───────────────────────┤
│   Frontend   │   Backend    │     AI Pipeline       │
│  React/Vite  │ Node/Express │  FastAPI + Groq       │
│  Port 5173   │  Port 5000   │  Port 8000            │
├──────────────┴──────────────┴───────────────────────┤
│         Streaming Backend (Socket.IO)               │
│              Port 4000                              │
├─────────────────────────────────────────────────────┤
│         Deepgram STT Service — Port 3001            │
├─────────────────────────────────────────────────────┤
│              MongoDB Atlas                          │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| **Main App** | [app.argumind.space](https://app.argumind.space) |
| **Debate Arena** | [stream.argumind.space](https://stream.argumind.space) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Lucide React |
| Backend | Node.js, Express, JWT, bcrypt |
| AI Pipeline | FastAPI, Groq (LLaMA 3.3 70B), Tavily SDK |
| STT | Deepgram Nova-3 |
| Real-Time | Socket.IO, WebRTC |
| Database | MongoDB Atlas |
| Tunneling | Cloudflare Tunnel |
| Domain | argumind.space (Hostinger) |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- Groq API key
- Tavily API key
- Deepgram API key

### 1. Clone the repo
```bash
git clone https://github.com/MGRwaleed/ArguMindd.git
cd ArguMindd
```

### 2. Setup environment variables

**Root `.env`** (FastAPI):
```env
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
```

**`server/.env`** (Node.js):
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

**`streaming/backend/.env`**:
```env
MONGO_URI=your_mongodb_uri
DEEPGRAM_API_KEY=your_deepgram_key
FACT_CHECKER_URL=http://localhost:8000
PORT=4000
```

**`deepgram-stt/.env`**:
```env
DEEPGRAM_API_KEY=your_deepgram_key
```

### 3. Install dependencies

```bash
# Node backend
cd server && npm install

# React frontend
cd client && npm install

# Streaming frontend
cd streaming && npm install

# Streaming backend
cd streaming/backend && npm install

# Deepgram STT
cd deepgram-stt && npm install

# Python pipeline
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 4. Start everything

Double-click `start.bat` or run each service manually:

```bash
# Terminal 1 — Node backend
cd server && node server.js

# Terminal 2 — FastAPI pipeline
uvicorn app.main:app --reload --port 8000

# Terminal 3 — React frontend
cd client && npm run dev

# Terminal 4 — Deepgram STT
cd deepgram-stt && node src/app.js

# Terminal 5 — Streaming frontend
cd streaming && npm run dev

# Terminal 6 — Streaming backend
cd streaming/backend && node temp.js
```

---

## 🎯 Features Roadmap

- [x] User authentication (JWT)
- [x] Real-time debate rooms (WebRTC)
- [x] Speech-to-text transcription
- [x] AI fact checking pipeline
- [x] Automated scoring & judging
- [x] Deep debate summary
- [x] Session history & archives
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Tournament mode
- [ ] AI debate opponent (solo mode)

---

## 👥 Team

| Name | Role |
|---|---|
| **Mohammed Ghulam Rasool (Waleed)** | AI Pipeline · Frontend · Full-Stack Integration |
| **Syed Sameer Ahmed** | Debate Arena · Speech-to-Text · WebRTC |
| **Medidi Moses** | Research · Testing |
| **Mohammed Zaid Khan** | Research · Testing |

**Guide:** Dr. Sara Ali  
**Institution:** Global Institute of Engineering and Technology

---

## 📄 License

MIT License — feel free to fork, build, and debate.

---

<div align="center">
  <strong>Built with 🔥 by Batch-8, CSE (Data Science)</strong><br/>
  <em>Because every argument deserves a fair judge.</em>
</div>
