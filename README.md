# 🚀 ThinkRank

<div align="center">

**Map Your Skills. Chart Your Path. Rank Higher.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

*An AI-powered platform that creates a living genome map of your skills, provides personalized learning roadmaps, and accelerates your career growth.*

</div>

---

## ✨ Features

### 🧬 Skill Genome Mapping
- **AI-Powered Analysis**: Extract and analyze skills from GitHub profiles or resume uploads
- **Interactive Visualizations**: D3.js-powered skill network graphs and heatmaps
- **Weakness Detection**: Identify skill gaps with AI precision and priority ranking
- **Industry Benchmarks**: Compare your skills against industry standards

### 🗺️ Personalized Learning Roadmaps
- **Curated Learning Paths**: Structured roadmaps for different tech stacks (Frontend, Backend, AI/ML, etc.)
- **Progress Tracking**: Visual progress indicators with node-based milestones
- **Topic-Based Learning**: Organized topics with estimated completion times
- **Status Management**: Track completed, active, and locked learning nodes

### 📊 Coding Signals
- **Multi-Platform Integration**: LeetCode, CodeChef, Codeforces, HackerRank
- **Performance Analytics**: Track ratings, submissions, and problem-solving stats
- **Activity Heatmaps**: GitHub-style contribution tracking

### 🎯 Daily Tasks & Growth
- **Personalized Micro-Tasks**: 15-30 minute daily exercises tailored to your gaps
- **Streak Tracking**: Gamified consistency with streak rewards
- **Progress Dashboard**: Monitor your skill evolution over time

### 💼 Interview Prep
- **MNC Interview Mode**: Practice with company-specific question patterns
- **AI-Powered Feedback**: Get real-time feedback on your responses
- **Skill-Based Questions**: Questions tailored to your skill profile

---

## 🏗️ Architecture

```
ThinkRank/
├── 🌐 frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   ├── roadmap/  # Learning roadmap components
│   │   │   ├── ui/       # shadcn/ui base components
│   │   │   └── ...
│   │   ├── pages/        # Route components
│   │   ├── contexts/     # React contexts (Auth, Theme)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── data/         # Static data (roadmaps, etc.)
│   │   └── lib/          # Utilities & configurations
│   └── public/           # Static assets
│
├── ⚙️ backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── config/       # Configuration
│   └── sql/              # Database schemas
│
└── 🐍 coding_signals/    # Python FastAPI Microservice
    ├── scrapers/         # Platform-specific scrapers
    ├── normalization/    # Data processing
    └── utils/            # Shared utilities
```

---

## � Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.9+
- **npm** or **yarn**

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Himanshusolanki24/ThinkRank.git
cd ThinkRank
```

### 2️⃣ Start the Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3️⃣ Start the Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:3001
```

### 4️⃣ Start Coding Signals Engine (Optional)
```bash
cd coding_signals
pip3 install -r requirements.txt
playwright install chromium
python3 -m uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

---

## 🔧 Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_AI_API_KEY=your_google_ai_key
MISTRAL_API_KEY=your_mistral_api_key
```

---

## 🎨 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **Visualization** | D3.js, Cytoscape.js, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **AI Services** | Google Generative AI, Mistral AI |
| **Coding Signals** | Python, FastAPI, Playwright |

---

## 📱 Key Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Overview of skills, daily tasks, and progress |
| **Build Genome** | Upload resume or connect GitHub to build skill profile |
| **Roadmap** | Interactive learning paths with progress tracking |
| **Coding Signals** | View coding platform stats and rankings |
| **MNC Interview** | Practice interviews for top tech companies |
| **Analytics** | Deep dive into skill analytics and trends |

---

## 🔌 API Endpoints

### Backend (Port 3001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/login` | User authentication |
| `POST` | `/api/extract-skills/github` | Extract skills from GitHub |
| `POST` | `/api/extract-skills/resume` | Extract skills from resume |
| `GET` | `/api/daily-tasks` | Get personalized daily tasks |
| `POST` | `/api/interview/start` | Start interview session |

### Coding Signals (Port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/coding-signals/fetch` | Fetch coding platform data |
| `GET` | `/platforms` | List supported platforms |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## � Roadmap

- [x] Skill Genome Mapping
- [x] Personalized Learning Roadmaps
- [x] Coding Signals Integration
- [x] MNC Interview Mode
- [ ] Mobile App Development
- [ ] Team Skill Analysis
- [ ] Skill Certification System
- [ ] AI Career Coaching

---

<div align="center">

**Built with ❤️ for developers who want to evolve their skills continuously.**

*"Your skill evolution engine powered by AI"*

[⬆ Back to Top](#-thinkrank)

</div>