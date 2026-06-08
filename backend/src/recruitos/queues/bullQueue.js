const { Queue, Worker } = require("bullmq");
const resumeAgent = require("../services/resumeAgent");
const githubAgent = require("../services/githubAgent");
const aiOrchestrator = require("../services/aiOrchestrator");

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const connection = {
    host: REDIS_HOST,
    port: REDIS_PORT
};

let analysisQueue = null;
let queueActive = false;

try {
    analysisQueue = new Queue("CandidateAnalysis", { connection });
    analysisQueue.on("error", (err) => {
        if (queueActive) {
            console.warn("⚠️ Redis Queue connection failed. Falling back to synchronous processing.");
            queueActive = false;
        }
    });
    queueActive = true;
    console.log("🧬 Redis queue initialized successfully on", REDIS_HOST + ":" + REDIS_PORT);
} catch (e) {
    console.warn("⚠️ Redis not running or configured. Fallback to in-memory orchestration will be active.");
}

// Queue Worker
if (queueActive) {
    let worker;
    try {
        worker = new Worker("CandidateAnalysis", async job => {
            const { type, data } = job.data;
            console.log(`Worker: Processing job ${job.id} of type ${type}`);

            if (type === "RESUME") {
                const { pdfBuffer, jobDescription, candidateId } = data;
                const result = await resumeAgent.analyze(Buffer.from(pdfBuffer), jobDescription);
                return result;
            }

            if (type === "GITHUB") {
                const { username } = data;
                const result = await githubAgent.analyze(username);
                return result;
            }
        }, { connection });

        worker.on("completed", job => {
            console.log(`Worker: Job ${job.id} completed successfully`);
        });

        worker.on("failed", (job, err) => {
            console.error(`Worker: Job ${job.id} failed with error:`, err.message);
        });

        worker.on("error", err => {
            // Silence connection errors from worker
        });
    } catch (err) {
        console.warn("⚠️ Worker initialization failed:", err.message);
    }
}

/**
 * Dispatch Analysis tasks
 */
async function dispatchAnalysis(type, data) {
    if (queueActive && analysisQueue) {
        return await analysisQueue.add(type, { type, data });
    } else {
        // Safe programmatic in-memory fallback
        console.log(`Fallback: Executing ${type} job synchronously in-memory`);
        if (type === "RESUME") {
            return await resumeAgent.analyze(data.pdfBuffer, data.jobDescription);
        }
        if (type === "GITHUB") {
            return await githubAgent.analyze(data.username);
        }
    }
}

module.exports = { dispatchAnalysis };
