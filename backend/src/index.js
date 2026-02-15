require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { extractSkillsFromGitHub } = require("./services/githubService");
const { extractSkillsFromResume } = require("./services/resumeService");
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const dailyTasksRoutes = require("./routes/dailyTasksRoutes");
const codingSignalsRoutes = require("./routes/codingSignalsRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const githubRoutes = require("./routes/githubRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Enhanced CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Skill Genome API is running" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Interview routes
app.use("/api/interview", interviewRoutes);

// Daily tasks routes
app.use("/api/daily-tasks", dailyTasksRoutes);

// Coding signals routes (platform integrations)
app.use("/api/coding-signals", codingSignalsRoutes);

// Practice recommendation routes
app.use("/api/practice", practiceRoutes);

// GitHub Skill Genome routes
app.use("/api/github", githubRoutes);

// GitHub skill extraction endpoint
app.post("/api/github/skills", async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== "string") {
            return res.status(400).json({
                error: "GitHub username is required",
            });
        }

        // Clean the username
        const cleanUsername = username.trim().replace(/^@/, "");

        console.log(`Extracting skills for GitHub user: ${cleanUsername}`);

        const result = await extractSkillsFromGitHub(cleanUsername);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("GitHub extraction error:", error.message);

        // Handle specific error cases
        const status = error.message.includes("token is invalid") || error.message.includes("Bad credentials") ? 401 : 500;

        res.status(status).json({
            success: false,
            error: error.message,
        });
    }
});

// Resume skill extraction endpoint
app.post("/api/resume/skills", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Resume PDF file is required",
            });
        }

        console.log(`Extracting skills from resume: ${req.file.originalname}`);

        const result = await extractSkillsFromResume(req.file.buffer);

        res.json({
            success: true,
            data: {
                filename: req.file.originalname,
                ...result,
            },
        });
    } catch (error) {
        console.error("Resume extraction error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Server error:", error.message);
    res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
    });
});

// Start server
// Start server
app.listen(PORT, async () => {
    console.log(`🧬 Skill Genome API running on port ${PORT}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);

    // Check Python service health on startup
    const { checkPythonServiceHealth } = require("./services/codingSignalsService");
    await checkPythonServiceHealth();
});
