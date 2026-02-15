/**
 * Code Pattern Detection Module
 * Defines patterns for architectural detection, code quality analysis,
 * framework identification, and documentation maturity classification
 */

// Architectural patterns to detect in file structures
const ARCHITECTURE_PATTERNS = {
    mvc: {
        filePatterns: ['controller', 'model', 'view', 'controllers', 'models', 'views'],
        score: 20,
        domain: 'Backend Engineering'
    },
    microservice: {
        filePatterns: ['service', 'services', 'api', 'gateway', 'microservice'],
        score: 25,
        domain: 'System Design'
    },
    layered: {
        filePatterns: ['routes', 'services', 'models', 'data', 'repository'],
        score: 20,
        domain: 'Backend Engineering'
    },
    componentBased: {
        filePatterns: ['components', 'containers', 'pages', 'layouts'],
        score: 18,
        domain: 'Frontend Development'
    },
    restful: {
        filePatterns: ['routes', 'api', 'endpoints', 'controllers'],
        score: 15,
        domain: 'Backend Engineering'
    }
};

// Code quality patterns to search for in source files
const QUALITY_PATTERNS = {
    errorHandling: {
        patterns: ['try', 'catch', 'throw', 'except', 'rescue', 'Error'],
        weight: 0.15,
        minCount: 5
    },
    async: {
        patterns: ['async', 'await', 'Promise', 'asyncio', 'goroutine', 'CompletableFuture'],
        weight: 0.20,
        minCount: 3
    },
    testing: {
        filePatterns: ['test', 'spec', '__test__', 'tests'],
        patterns: ['describe', 'it', 'test', 'assert', 'expect', 'mock'],
        weight: 0.25,
        minCount: 1
    },
    typing: {
        patterns: ['interface', 'type', ': string', ': number', 'TypeScript', 'mypy'],
        weight: 0.10,
        minCount: 5
    },
    documentation: {
        patterns: ['/**', '///', '"""', 'docstring', '@param', '@returns'],
        weight: 0.10,
        minCount: 3
    }
};

// Framework and library detection
const FRAMEWORK_SIGNATURES = {
    // Frontend frameworks
    react: {
        files: ['package.json'],
        patterns: ['"react":', 'import React', 'from "react"', 'useState', 'useEffect'],
        domain: 'Frontend Development',
        weight: 0.25
    },
    vue: {
        files: ['package.json'],
        patterns: ['"vue":', 'import Vue', '<template>', 'v-if', 'v-for'],
        domain: 'Frontend Development',
        weight: 0.25
    },
    angular: {
        files: ['package.json', 'angular.json'],
        patterns: ['"@angular', 'import { Component }', 'NgModule'],
        domain: 'Frontend Development',
        weight: 0.25
    },

    // Backend frameworks
    express: {
        files: ['package.json'],
        patterns: ['"express":', 'require("express")', 'app.get(', 'app.post('],
        domain: 'Backend Engineering',
        weight: 0.25
    },
    fastapi: {
        files: ['requirements.txt', 'pyproject.toml'],
        patterns: ['fastapi', 'from fastapi', '@app.get', 'FastAPI('],
        domain: 'Backend Engineering',
        weight: 0.25
    },
    django: {
        files: ['requirements.txt', 'manage.py'],
        patterns: ['django', 'from django', 'models.Model', 'views.py'],
        domain: 'Backend Engineering',
        weight: 0.25
    },
    flask: {
        files: ['requirements.txt'],
        patterns: ['flask', 'from flask', '@app.route', 'Flask(__name__)'],
        domain: 'Backend Engineering',
        weight: 0.25
    },

    // Data Science / ML
    tensorflow: {
        files: ['requirements.txt', 'package.json'],
        patterns: ['tensorflow', 'import tensorflow', 'tf.keras'],
        domain: 'Machine Learning',
        weight: 0.30
    },
    pytorch: {
        files: ['requirements.txt'],
        patterns: ['torch', 'import torch', 'nn.Module'],
        domain: 'Machine Learning',
        weight: 0.30
    },
    sklearn: {
        files: ['requirements.txt'],
        patterns: ['scikit-learn', 'sklearn', 'from sklearn'],
        domain: 'Data Science',
        weight: 0.25
    },
    pandas: {
        files: ['requirements.txt'],
        patterns: ['pandas', 'import pandas', 'pd.DataFrame'],
        domain: 'Data Science',
        weight: 0.20
    },
    numpy: {
        files: ['requirements.txt'],
        patterns: ['numpy', 'import numpy', 'np.array'],
        domain: 'Data Science',
        weight: 0.15
    }
};

// Commit message patterns for quality analysis
const COMMIT_PATTERNS = {
    semantic: {
        patterns: [/^feat[:(]/, /^fix[:(]/, /^docs[:(]/, /^refactor[:(]/, /^test[:(]/, /^chore[:(]/],
        weight: 0.30
    },
    descriptive: {
        minLength: 20,
        weight: 0.25
    },
    conventional: {
        patterns: [/^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:/],
        weight: 0.25
    }
};

// Documentation maturity classification
const DOCUMENTATION_SECTIONS = {
    essential: {
        patterns: ['install', 'setup', 'getting started', 'usage', 'how to'],
        weight: 0.40
    },
    intermediate: {
        patterns: ['api', 'documentation', 'examples', 'configuration', 'features'],
        weight: 0.30
    },
    advanced: {
        patterns: ['architecture', 'contributing', 'deployment', 'testing', 'ci/cd', 'diagram'],
        weight: 0.30
    }
};

// Helper function to detect patterns in text
function detectPatterns(text, patterns) {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    let count = 0;

    for (const pattern of patterns) {
        if (typeof pattern === 'string') {
            const regex = new RegExp(pattern.toLowerCase(), 'gi');
            const matches = lowerText.match(regex);
            if (matches) count += matches.length;
        } else if (pattern instanceof RegExp) {
            const matches = text.match(pattern);
            if (matches) count += matches.length;
        }
    }

    return count;
}

// Detect architectural patterns from file tree
function detectArchitecturalPatterns(fileTree) {
    const detected = {};
    const filePaths = fileTree.map(f => f.path.toLowerCase());

    for (const [patternName, pattern] of Object.entries(ARCHITECTURE_PATTERNS)) {
        const matchCount = pattern.filePatterns.filter(fp =>
            filePaths.some(path => path.includes(fp))
        ).length;

        if (matchCount >= 2) { // At least 2 pattern files must match
            detected[patternName] = {
                matched: true,
                score: pattern.score,
                domain: pattern.domain,
                matchCount
            };
        }
    }

    return detected;
}

// Analyze code quality from source files
function analyzeCodeQuality(sourceFiles) {
    const quality = {
        errorHandling: { detected: false, count: 0, score: 0 },
        asyncUsage: { detected: false, count: 0, score: 0 },
        testCoverage: { detected: false, count: 0, score: 0 },
        typing: { detected: false, count: 0, score: 0 },
        documentation: { detected: false, count: 0, score: 0 }
    };

    const allContent = sourceFiles.map(f => f.content || '').join('\n');

    for (const [key, pattern] of Object.entries(QUALITY_PATTERNS)) {
        const count = detectPatterns(allContent, pattern.patterns || []);
        const fileMatches = pattern.filePatterns ?
            sourceFiles.filter(f => pattern.filePatterns.some(fp => f.path.toLowerCase().includes(fp))).length :
            0;

        const totalCount = count + fileMatches;

        quality[key] = {
            detected: totalCount >= (pattern.minCount || 1),
            count: totalCount,
            score: Math.min(totalCount / (pattern.minCount || 1), 1) * pattern.weight * 100
        };
    }

    return quality;
}

// Detect frameworks from dependency files and code
function detectFrameworks(files) {
    const detected = [];

    for (const [framework, signature] of Object.entries(FRAMEWORK_SIGNATURES)) {
        // Check if relevant dependency files exist
        const hasDependencyFile = files.some(f =>
            signature.files.some(sf => f.path.toLowerCase().includes(sf))
        );

        if (!hasDependencyFile) continue;

        // Check for patterns in file content
        const allContent = files.map(f => f.content || '').join('\n');
        const patternCount = detectPatterns(allContent, signature.patterns);

        if (patternCount > 0) {
            detected.push({
                name: framework,
                domain: signature.domain,
                weight: signature.weight,
                confidence: Math.min(patternCount / 3, 1) // Confidence based on pattern frequency
            });
        }
    }

    return detected;
}

// Analyze commit message quality
function analyzeCommitMessages(commits) {
    if (!commits || commits.length === 0) {
        return {
            hasSemanticPrefixes: 0,
            averageLength: 0,
            clarity: 0,
            conventionalCommits: 0
        };
    }

    let semanticCount = 0;
    let conventionalCount = 0;
    let totalLength = 0;

    for (const commit of commits) {
        const message = commit.commit?.message || commit.message || '';

        // Check for semantic prefixes
        if (COMMIT_PATTERNS.semantic.patterns.some(p => p.test(message))) {
            semanticCount++;
        }

        // Check for conventional commits
        if (COMMIT_PATTERNS.conventional.patterns.some(p => p.test(message))) {
            conventionalCount++;
        }

        totalLength += message.length;
    }

    const avgLength = totalLength / commits.length;

    return {
        hasSemanticPrefixes: semanticCount / commits.length,
        averageLength: Math.round(avgLength),
        clarity: avgLength >= COMMIT_PATTERNS.descriptive.minLength ? 0.75 : 0.45,
        conventionalCommits: conventionalCount / commits.length
    };
}

// Classify documentation maturity
function classifyDocumentationMaturity(readmeContent) {
    if (!readmeContent || readmeContent.length < 100) {
        return { level: 'beginner', score: 0 };
    }

    const lowerContent = readmeContent.toLowerCase();
    let score = 0;
    const detected = {};

    // Check for essential sections
    for (const [category, config] of Object.entries(DOCUMENTATION_SECTIONS)) {
        const matchCount = config.patterns.filter(p => lowerContent.includes(p)).length;
        detected[category] = matchCount;
        score += (matchCount / config.patterns.length) * config.weight * 100;
    }

    // Additional quality indicators
    const hasCodeBlocks = (readmeContent.match(/```/g) || []).length >= 2;
    const hasImages = /!\[.*\]\(.*\)/.test(readmeContent);
    const wordCount = readmeContent.split(/\s+/).length;

    if (hasCodeBlocks) score += 10;
    if (hasImages) score += 5;
    if (wordCount > 500) score += 10;

    let level = 'beginner';
    if (score >= 70) level = 'production-grade';
    else if (score >= 40) level = 'intermediate';

    return {
        level,
        score: Math.round(score),
        detected,
        hasCodeBlocks,
        hasImages,
        wordCount
    };
}

module.exports = {
    ARCHITECTURE_PATTERNS,
    QUALITY_PATTERNS,
    FRAMEWORK_SIGNATURES,
    COMMIT_PATTERNS,
    DOCUMENTATION_SECTIONS,
    detectArchitecturalPatterns,
    analyzeCodeQuality,
    detectFrameworks,
    analyzeCommitMessages,
    classifyDocumentationMaturity,
    detectPatterns
};
