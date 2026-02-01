# 🚀 Quick Start Guide - Skill Genome

Run each of these services in a **separate terminal window**.

## 1. Backend Service (Node.js)
Runs on `http://localhost:3001`
```bash
cd backend
npm run dev
```

## 2. Frontend Application (React/Vite)
Runs on `http://localhost:3000`
```bash
cd frontend
npm run dev
```

## 3. Coding Signals Engine (Python/FastAPI)
Runs on `http://localhost:8000`

**Option A: Standard Run**
```bash
cd coding_signals
python3 -m uvicorn main:app --reload --port 8000
```
*Note: If `uvicorn` is not found, try `python3 -m pip install uvicorn` first.*

**Option B: If you need to install dependencies first**
```bash
cd coding_signals
pip3 install -r requirements.txt
playwright install chromium
python3 -m uvicorn main:app --reload --port 8000
```

---

### ✅ Verification
Once all services are running, you can verify they are connected:
- **Frontend**: Visit [http://localhost:3000](http://localhost:3000)
- **Backend Health**: Visit [http://localhost:3001/api/health](http://localhost:3001/api/health)
- **Coding Signals Health**: Visit [http://localhost:8000/health](http://localhost:8000/health)
