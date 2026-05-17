const PUBLIC_PROBLEM_FIELDS = [
    "prompt",
    "constraints",
    "examples",
    "starterCode",
    "functionSignature",
    "inputFormat",
    "outputFormat",
    "notes"
];

const sanitizeProblemForCandidate = (problem) => {
    const safe = {};

    for (const field of PUBLIC_PROBLEM_FIELDS) {
        if (problem[field] !== undefined) {
            safe[field] = problem[field];
        }
    }

    return safe;
};

module.exports = {
    PUBLIC_PROBLEM_FIELDS,
    sanitizeProblemForCandidate
};
