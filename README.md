# 🧬 Skill Genome

**Visualize Your Skills. Evolve Your Future.**

Skill Genome is an AI-powered platform that maps your skills as a living genome, identifies weaknesses with precision, and accelerates your growth through personalized daily micro-tasks.

![Skill Genome Preview](https://via.placeholder.com/1200x600/1a1a1a/00d4ff?text=Skill+Genome+Platform)

## ✨ Features

### 🎯 Core Capabilities
- **AI Skill Mapping**: Advanced AI creates a living genome map of your skills with real-time connections and proficiency levels
- **Multi-Source Analysis**: Extract skills from GitHub repositories or resume uploads
- **Weakness Detection**: Identify skill gaps with AI precision and priority ranking
- **Personalized Tasks**: Daily 15-30 minute micro-tasks tailored to your skill gaps
- **Live Visualizations**: Interactive skill network graphs and heatmaps
- **Coding Signals**: Scrape and analyze coding activity from multiple platforms (LeetCode, CodeChef, Codeforces, HackerRank)

### 🚀 Advanced Features
- **Skill DNA Visualization**: Unique genetic-style representation of your skill profile
- **Industry Benchmarks**: Compare your skills against industry standards
- **Growth Tracking**: Monitor your skill evolution over time
- **Interview Mode**: AI-powered interview preparation with skill-based questions
- **Activity Heatmap**: GitHub-style contribution tracking for skill development

## 🏗️ Architecture

This is a full-stack application built with modern technologies:

```
skill-genome/
├── 🌐 frontend/          # React + Vite + TypeScript
├── ⚙️ backend/           # Node.js + Express API
└── 🐍 coding_signals/    # Python FastAPI Microservice
```

### Tech Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Charts**: Recharts, D3.js, Cytoscape.js
- **State Management**: React Context + Hooks

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI Services**: Google Generative AI, Mistral AI
- **File Processing**: PDF parsing, GitHub API integration

#### Coding Signals Engine
- **Framework**: FastAPI
- **Web Scraping**: Playwright, httpx
- **Data Processing**: Python 3.9+
- **Platforms**: LeetCode, CodeChef, Codeforces, HackerRank

## 🚀 Quick Start

Run each service in a **separate terminal window**:

### 1. Backend Service
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3. Coding Signals Engine
```bash
cd coding_signals
pip3 install -r requirements.txt
playwright install chromium
python3 -m uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

### ✅ Verification

Once all services are running:
- **Frontend**: Visit [http://localhost:3000](http://localhost:3000)
- **Backend Health**: Visit [http://localhost:3001/api/health](http://localhost:3001/api/health)
- **Coding Signals Health**: Visit [http://localhost:8000/health](http://localhost:8000/health)

## 🌟 Getting Started

1. **Build Your Skill Genome**
   - Connect your GitHub profile or upload your resume
   - Let AI analyze and map your skills

2. **Explore Your Skills**
   - View your skill network visualization
   - Check proficiency scores and connections
   - Identify skill gaps and improvement areas

3. **Start Daily Tasks**
   - Receive personalized micro-tasks
   - Complete 15-30 minute focused exercises
   - Track your progress and skill evolution

4. **Monitor Growth**
   - View activity heatmaps
   - Track skill development over time
   - Compare against industry benchmarks

## 📁 Project Structure

```
skill-genome/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration
│   │   └── data/           # Static data & utilities
│   └── sql/                # Database schemas
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/           # Utilities & configurations
│   └── public/            # Static assets
└── coding_signals/
    ├── scrapers/          # Platform-specific scrapers
    ├── normalization/     # Data processing
    └── utils/            # Shared utilities
```

## 🔌 API Endpoints

### Backend (Node.js) - Port 3001
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `POST /api/extract-skills/github` - Extract skills from GitHub
- `POST /api/extract-skills/resume` - Extract skills from resume
- `GET /api/daily-tasks` - Get personalized daily tasks
- `POST /api/interview/start` - Start interview session

### Coding Signals (Python) - Port 8000
- `GET /health` - Health check
- `POST /coding-signals/fetch` - Fetch coding platform data
- `GET /platforms` - List supported platforms

## 🎨 Key Components

### Skill Visualization
- **D3SkillNetwork**: Interactive network graph of skill connections
- **CytoscapeSkillGraph**: Advanced graph visualization
- **ActivityHeatmap**: GitHub-style activity tracking
- **SkillDNA**: Genetic-style skill representation

### User Experience
- **Glassmorphism Design**: Modern glass-effect UI
- **Neural Background**: Animated background effects
- **Responsive Layout**: Mobile-first design approach
- **Dark Theme**: Optimized for developer workflows

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_AI_API_KEY=your_google_ai_key
MISTRAL_API_KEY=your_mistral_api_key
```

#### Coding Signals (.env)
```env
LEETCODE_SESSION=your_leetcode_session
CODEFORCES_API_KEY=your_codeforces_key
```

## 🚧 Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn
- pip

### Development Commands
```bash
# Frontend development
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint

# Backend development
npm run dev          # Start with watch mode
npm start            # Start production

# Coding Signals
uvicorn main:app --reload --port 8000  # Start FastAPI server
```

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following key tables:
- `users` - User profiles and authentication
- `user_skills` - Skill assignments and proficiency scores
- `daily_tasks` - Personalized task assignments
- `task_completions` - Task completion tracking
- `interview_results` - Interview session data
- `user_streaks` - Streak and activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure all tests pass
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Deployment

### Frontend (Vercel)
- Automatic deployment from main branch
- Environment variables configured in Vercel dashboard

### Backend (Vercel Serverless)
- Serverless functions deployment
- Environment variables in Vercel settings

### Coding Signals (Python Hosting)
- Deploy to platforms supporting FastAPI
- Ensure Playwright browser dependencies are available

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/skill-genome/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/skill-genome/discussions)
- **Email**: support@skillgenome.dev

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Integration with more coding platforms
- [ ] Team skill analysis features
- [ ] Advanced AI coaching
- [ ] Skill certification system
- [ ] API marketplace for skill data

---

**Built with ❤️ for developers who want to evolve their skills continuously.**

*"Your skill evolution engine powered by AI"*