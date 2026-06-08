/**
 * Code Execution Service
 * Sandboxed code execution via Judge0 API
 */
const axios = require("axios");

const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || "";

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
    python: 71,      // Python 3
    javascript: 63,  // Node.js
    java: 62,        // Java
    cpp: 54,         // C++ (GCC)
    c: 50,           // C (GCC)
};

const LANGUAGE_TEMPLATES = {
    python: (code, input) => ({ source_code: code, stdin: input }),
    javascript: (code, input) => ({ source_code: code, stdin: input }),
    java: (code, input) => ({ source_code: code, stdin: input }),
    cpp: (code, input) => ({ source_code: code, stdin: input }),
};

/**
 * Submit code for execution
 */
async function executeCode(code, language, stdin = "") {
    const langId = LANGUAGE_IDS[language];
    if (!langId) throw new Error(`Unsupported language: ${language}`);

    const headers = {
        "Content-Type": "application/json",
    };

    // If using RapidAPI hosted Judge0
    if (JUDGE0_KEY) {
        headers["X-RapidAPI-Key"] = JUDGE0_KEY;
        headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
    }

    try {
        // Submit
        const submitRes = await axios.post(
            `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true&fields=*`,
            {
                source_code: code,
                language_id: langId,
                stdin: stdin,
                cpu_time_limit: 5,
                memory_limit: 128000,
            },
            { headers, timeout: 30000 }
        );

        const result = submitRes.data;

        return {
            status: mapStatus(result.status?.id),
            stdout: result.stdout || "",
            stderr: result.stderr || "",
            compile_output: result.compile_output || "",
            runtime_ms: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
            memory_kb: result.memory || null,
            exit_code: result.exit_code,
        };
    } catch (error) {
        // Fallback: simulate execution locally for demo
        console.warn("Judge0 unavailable, using simulated execution:", error.message);
        return simulateExecution(code, language, stdin);
    }
}

/**
 * Run code against multiple test cases
 */
async function runTestCases(code, language, testCases) {
    const results = [];

    for (const tc of testCases) {
        const stdin = typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input);
        const result = await executeCode(code, language, stdin);

        let passed = false;
        if (result.status === "accepted" && result.stdout) {
            const output = result.stdout.trim();
            const expected = typeof tc.expected === "string" ? tc.expected : JSON.stringify(tc.expected);
            passed = output === expected.trim();
        }

        results.push({
            ...result,
            passed,
            input: tc.input,
            expected: tc.expected,
            actual: result.stdout?.trim() || result.stderr || result.compile_output,
        });
    }

    return {
        results,
        passed_count: results.filter((r) => r.passed).length,
        total_count: results.length,
        all_passed: results.every((r) => r.passed),
    };
}

function mapStatus(statusId) {
    const statusMap = {
        1: "in_queue",
        2: "processing",
        3: "accepted",
        4: "wrong_answer",
        5: "time_limit_exceeded",
        6: "compile_error",
        7: "runtime_error_sigsegv",
        8: "runtime_error_sigxfsz",
        9: "runtime_error_sigfpe",
        10: "runtime_error_sigabrt",
        11: "runtime_error",
        12: "runtime_error",
        13: "internal_error",
        14: "exec_format_error",
    };
    return statusMap[statusId] || "unknown";
}

/**
 * Simulated execution for development/demo when Judge0 is unavailable
 */
function simulateExecution(code, language, stdin) {
    // Basic simulation - returns a mock result
    const hasError = code.includes("syntax error") || code.length < 10;
    
    if (hasError) {
        return {
            status: "compile_error",
            stdout: "",
            stderr: "Syntax or compilation error detected",
            compile_output: "Error in submitted code",
            runtime_ms: 0,
            memory_kb: 0,
            exit_code: 1,
        };
    }

    return {
        status: "accepted",
        stdout: "Simulated output — connect Judge0 for real execution",
        stderr: "",
        compile_output: "",
        runtime_ms: Math.floor(Math.random() * 100) + 10,
        memory_kb: Math.floor(Math.random() * 5000) + 2000,
        exit_code: 0,
    };
}

module.exports = { executeCode, runTestCases, LANGUAGE_IDS };
