const express = require("express");
const router = express.Router();
const multer = require("multer");
const recruitOSController = require("../controllers/recruitOSController");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF documents are allowed"));
        }
    }
});

// Resume parsing and compatibility
router.post("/resume", upload.single("resume"), recruitOSController.uploadResume);

// GitHub architecture analysis
router.post("/github", recruitOSController.analyzeGithub);

// Unified Intelligence report
router.get("/report/:sessionId", recruitOSController.getCandidateReport);

// Recruiter Dashboard metrics
router.get("/dashboard", recruitOSController.getDashboardMetrics);

module.exports = router;
