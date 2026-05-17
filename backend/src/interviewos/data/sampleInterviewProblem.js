const sampleInterviewProblem = {
    id: "pb_interviewos_001",
    prompt: "Design a function that returns the length of the longest substring without repeating characters.",
    constraints: [
        "1 <= s.length <= 100000",
        "Input contains printable ASCII characters"
    ],
    examples: [
        {
            input: 's = "abcabcbb"',
            output: "3",
            explanation: "The longest substring without repeating characters is \"abc\"."
        },
        {
            input: 's = "bbbbb"',
            output: "1",
            explanation: "Any single character is a valid substring."
        }
    ],
    starterCode: {
        javascript: "function lengthOfLongestSubstring(s) {\n  // TODO\n}\n",
        python: "def length_of_longest_substring(s: str) -> int:\n    pass\n"
    },
    inputFormat: "A single string `s`.",
    outputFormat: "Return an integer.",
    notes: [
        "Explain the tradeoff between brute force and sliding window approaches."
    ],
    hiddenMetadata: {
        source: "leetcode",
        platformProblemId: "3",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "medium",
        topicTags: ["sliding-window", "hash-map", "strings"],
        sheet: "CP31",
        editorial: "Use two pointers with a last-seen index map."
    }
};

module.exports = {
    sampleInterviewProblem
};
