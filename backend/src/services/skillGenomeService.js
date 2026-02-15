const {
    fetchUserRepos,
    fetchRepositoryDetails,
    fetchCommitHistory,
    fetchFileTree,
    fetchFileContent,
    fetchReadme
} = require('./githubService');

const {
    detectArchitecturalPatterns,
    analyzeCodeQuality,
    detectFrameworks,
    analyzeCommitMessages,
    classifyDocumentationMaturity
} = require('../data/codePatterns');

/**
 * Main function to analyze skill genome for a GitHub username
 */
async function analyzeSkillGenome(username) {
    try {
        console.log(`Starting Skill Genome analysis for: ${username}`);

        // Step 1: Fetch all repositories
        const allRepos = await fetchUserRepos(username);

        if (!allRepos || allRepos.length === 0) {
            return {
                username,
                skill_genome: getEmptySkillGenome(),
                metadata: {
                    analyzedRepos: 0,
                    totalRepos: 0,
                    analysisTimestamp: new Date().toISOString()
                }
            };
        }

        // Step 2: Select relevant repositories (filter and rank)
        const selectedRepos = await selectRelevantRepositories(allRepos, username);
        console.log(`Selected ${selectedRepos.length} repositories for analysis`);

        if (selectedRepos.length === 0) {
            return {
                username,
                skill_genome: getEmptySkillGenome(),
                metadata: {
                    analyzedRepos: 0,
                    totalRepos: allRepos.length,
                    analysisTimestamp: new Date().toISOString(),
                    message: 'No repositories met the quality threshold for analysis'
                }
            };
        }

        // Step 3: Analyze each repository in depth (ALL of them)
        const analyzedRepos = [];
        for (const repo of selectedRepos) {
            console.log(`Analyzing repository: ${repo.name}`);
            const analysis = await analyzeRepository(repo, username);
            if (analysis) {
                analyzedRepos.push(analysis);
            }
        }

        // Step 4: Calculate skill scores
        const skillScores = calculateSkillScores(analyzedRepos);

        // Step 5: Determine engineering maturity
        const maturity = determineEngineeringMaturity(analyzedRepos);

        // Step 6: Extract core technologies
        const technologies = extractCoreTechnologies(analyzedRepos);

        // Step 7: Generate evidence summary
        const evidence = generateEvidenceSummary(analyzedRepos);

        // Step 8: Generate explanations
        const explanations = generateExplanations(skillScores, analyzedRepos);

        return {
            username,
            skill_genome: {
                primary_domains: skillScores,
                engineering_maturity: maturity,
                core_technologies: technologies,
                evidence_summary: evidence,
                explanations
            },
            metadata: {
                analyzedRepos: analyzedRepos.length,
                totalRepos: allRepos.length,
                analysisTimestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Skill Genome analysis failed:', error);
        throw new Error(`Failed to analyze skill genome: ${error.message}`);
    }
}

/**
 * Select and rank repositories - now includes ALL repos
 */
async function selectRelevantRepositories(repos, username) {
    // No filtering - include ALL repositories
    // Sort by update time (most recent first) for better relevance
    return repos.sort((a, b) =>
        new Date(b.updated_at) - new Date(a.updated_at)
    );
}

/**
 * Calculate repository quality/complexity score
 */
function calculateRepositoryScore(repo) {
    let score = 0;

    // Complexity indicators
    if (repo.size > 100) score += 10;           // Has meaningful code
    if (repo.size > 1000) score += 10;          // Substantial project
    if (!repo.fork) score += 15;                // Original work (critical)
    if (repo.has_issues) score += 5;            // Project management

    // Activity indicators
    const ageInDays = (Date.now() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24);
    if (ageInDays > 30) score += 10;            // Long-term project
    if (ageInDays > 180) score += 5;            // Mature project

    const updateRecency = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    if (updateRecency < 90) score += 15;        // Recently maintained
    if (updateRecency < 30) score += 5;         // Actively developed

    // Quality indicators (but NOT primary factors)
    if (repo.stargazers_count > 0) score += 3;  // Some community interest
    if (repo.watchers_count > 1) score += 2;

    // Slight penalty for tutorial/template repos (but still include them)
    const description = (repo.description || '').toLowerCase();
    if (description.includes('tutorial')) score -= 5;
    if (description.includes('template')) score -= 5;
    if (description.includes('learning')) score -= 3;
    if (description.includes('practice')) score -= 3;

    // Only heavily penalize truly empty repos
    if (repo.size < 10) score -= 20;
    if (!repo.description || repo.description.length < 10) score -= 3;

    return score;
}

/**
 * Analyze a single repository in depth
 */
async function analyzeRepository(repo, username) {
    try {
        const analysis = {
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            language: repo.language,
            size: repo.size,
            created_at: repo.created_at,
            updated_at: repo.updated_at
        };

        // Fetch file tree
        const fileTree = await fetchFileTree(username, repo.name);
        analysis.fileTree = fileTree;
        analysis.fileCount = fileTree.length;

        // Detect architectural patterns
        analysis.architecturalPatterns = detectArchitecturalPatterns(fileTree);

        // Fetch README
        const readme = await fetchReadme(username, repo.name);
        analysis.readme = readme;
        analysis.documentation = classifyDocumentationMaturity(readme);

        // Fetch and analyze commits
        const commits = await fetchCommitHistory(username, repo.name, 100);
        analysis.commitCount = commits.length;
        analysis.commitQuality = analyzeCommitMessages(commits);

        // Sample and analyze source files (up to 5 relevant files)
        const sourceFiles = await sampleSourceFiles(username, repo.name, fileTree);
        analysis.sourceFiles = sourceFiles;
        analysis.codeQuality = analyzeCodeQuality(sourceFiles);

        // Detect frameworks
        analysis.frameworks = detectFrameworks([...sourceFiles, { path: 'README.md', content: readme }]);

        // Calculate complexity score
        analysis.complexityScore = calculateComplexityScore(analysis);

        // Classify project
        analysis.classification = classifyProject(analysis);

        return analysis;

    } catch (error) {
        console.error(`Failed to analyze repository ${repo.name}:`, error.message);
        return null;
    }
}

/**
 * Sample relevant source files for code analysis
 */
async function sampleSourceFiles(username, repoName, fileTree) {
    const sourceExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rb', '.php', '.cs'];
    const configFiles = ['package.json', 'requirements.txt', 'go.mod', 'Gemfile', 'composer.json'];

    const files = [];

    // Get config files first
    for (const configFile of configFiles) {
        const file = fileTree.find(f => f.path === configFile);
        if (file && file.type === 'blob') {
            const content = await fetchFileContent(username, repoName, file.path);
            files.push({ path: file.path, content, size: file.size });

            if (files.length >= 10) return files;
        }
    }

    // Get source files
    const sourceFiles = fileTree.filter(f =>
        f.type === 'blob' &&
        sourceExtensions.some(ext => f.path.endsWith(ext)) &&
        f.size < 100000 // Skip very large files
    );

    // Sort by size (prefer medium-sized files)
    sourceFiles.sort((a, b) => Math.abs(a.size - 5000) - Math.abs(b.size - 5000));

    // Sample up to 5 more files
    for (const file of sourceFiles.slice(0, 5)) {
        const content = await fetchFileContent(username, repoName, file.path);
        files.push({ path: file.path, content, size: file.size });

        if (files.length >= 10) break;
    }

    return files;
}

/**
 * Calculate complexity score for a repository
 */
function calculateComplexityScore(analysis) {
    let score = 0;

    // File count and size
    if (analysis.fileCount > 50) score += 20;
    if (analysis.fileCount > 100) score += 10;
    if (analysis.size > 5000) score += 15;

    // Architectural patterns
    const patternCount = Object.keys(analysis.architecturalPatterns).length;
    score += patternCount * 10;

    // Code quality indicators
    const qualityScore = Object.values(analysis.codeQuality)
        .reduce((sum, q) => sum + (q.score || 0), 0);
    score += qualityScore / 2;

    // Documentation
    if (analysis.documentation.level === 'production-grade') score += 20;
    else if (analysis.documentation.level === 'intermediate') score += 10;

    // Commit activity
    if (analysis.commitCount > 50) score += 15;
    if (analysis.commitCount > 100) score += 10;

    // Frameworks
    score += analysis.frameworks.length * 5;

    return Math.min(score, 100);
}

/**
 * Classify project type and primary domain
 */
function classifyProject(analysis) {
    const domainScores = {
        'Backend Engineering': 0,
        'Frontend Development': 0,
        'Data Science': 0,
        'Machine Learning': 0,
        'System Design': 0
    };

    // Score based on frameworks
    for (const framework of analysis.frameworks) {
        domainScores[framework.domain] += framework.weight * framework.confidence * 30;
    }

    // Score based on architectural patterns
    for (const pattern of Object.values(analysis.architecturalPatterns)) {
        domainScores[pattern.domain] += pattern.score;
    }

    // Score based on language
    const langDomainMap = {
        'JavaScript': 'Frontend Development',
        'TypeScript': 'Frontend Development',
        'Python': 'Backend Engineering',
        'Java': 'Backend Engineering',
        'Go': 'Backend Engineering',
        'Ruby': 'Backend Engineering',
        'C#': 'Backend Engineering'
    };

    if (analysis.language && langDomainMap[analysis.language]) {
        domainScores[langDomainMap[analysis.language]] += 10;
    }

    // Find primary domain
    let primaryDomain = 'Backend Engineering';
    let maxScore = 0;

    for (const [domain, score] of Object.entries(domainScores)) {
        if (score > maxScore) {
            maxScore = score;
            primaryDomain = domain;
        }
    }

    // Determine complexity level
    let complexity = 'low';
    if (analysis.complexityScore >= 70) complexity = 'high';
    else if (analysis.complexityScore >= 40) complexity = 'medium';

    // Determine project type
    let type = 'library';
    if (analysis.frameworks.some(f => f.name === 'react' || f.name === 'vue' || f.name === 'angular')) {
        type = 'web-application';
    } else if (analysis.frameworks.some(f => f.name === 'express' || f.name === 'fastapi' || f.name === 'django')) {
        type = 'api-service';
    } else if (analysis.frameworks.some(f => f.name === 'tensorflow' || f.name === 'pytorch')) {
        type = 'ml-pipeline';
    }

    return {
        type,
        complexity,
        primaryDomain,
        confidence: Math.min(maxScore / 50, 1)
    };
}

/**
 * Calculate weighted skill scores across all repositories
 */
function calculateSkillScores(repositories) {
    const domains = {
        'Backend Engineering': 0,
        'Frontend Development': 0,
        'Data Science': 0,
        'Machine Learning': 0,
        'System Design': 0
    };

    for (const repo of repositories) {
        // Code structure & patterns (30%)
        const architectureScore = Object.keys(repo.architecturalPatterns).length * 10;
        const codeScore = (architectureScore / 30) * 0.30;

        // Libraries & frameworks (25%)
        const frameworkScore = repo.frameworks.reduce((sum, f) => sum + (f.weight * f.confidence), 0);
        const normalizedFrameworkScore = Math.min(frameworkScore, 1) * 0.25;

        // Commit behavior (20%)
        const commitScore = (repo.commitQuality.hasSemanticPrefixes + repo.commitQuality.clarity) / 2 * 0.20;

        // Documentation (15%)
        const docScore = (repo.documentation.score / 100) * 0.15;

        // Project complexity (10%)
        const complexityScore = (repo.complexityScore / 100) * 0.10;

        // Total weighted score for this repo
        const totalScore = codeScore + normalizedFrameworkScore + commitScore + docScore + complexityScore;

        // Add to primary domain with confidence weighting
        const domain = repo.classification.primaryDomain;
        domains[domain] += totalScore * repo.classification.confidence * 100;
    }

    // Normalize to 0-100 scale
    const maxScore = Math.max(...Object.values(domains));
    if (maxScore > 0) {
        for (const domain in domains) {
            domains[domain] = Math.round((domains[domain] / maxScore) * 100);
        }
    }

    return domains;
}

/**
 * Determine overall engineering maturity
 */
function determineEngineeringMaturity(repositories) {
    let maturityScore = 0;

    for (const repo of repositories) {
        // Documentation quality
        if (repo.documentation.level === 'production-grade') maturityScore += 15;
        else if (repo.documentation.level === 'intermediate') maturityScore += 8;

        // Code quality
        if (repo.codeQuality.errorHandling.detected) maturityScore += 10;
        if (repo.codeQuality.asyncUsage.detected) maturityScore += 8;
        if (repo.codeQuality.testCoverage.detected) maturityScore += 15;

        // Commit quality
        if (repo.commitQuality.hasSemanticPrefixes > 0.5) maturityScore += 10;
        if (repo.commitQuality.conventionalCommits > 0.6) maturityScore += 8;

        // Architectural patterns
        if (Object.keys(repo.architecturalPatterns).length >= 2) maturityScore += 12;
    }

    const avgScore = repositories.length > 0 ? maturityScore / repositories.length : 0;

    if (avgScore >= 50) return 'Advanced';
    if (avgScore >= 25) return 'Intermediate';
    return 'Beginner';
}

/**
 * Extract core technologies from analyzed repositories
 */
function extractCoreTechnologies(repositories) {
    const techCount = {};

    for (const repo of repositories) {
        // Add primary language
        if (repo.language) {
            techCount[repo.language] = (techCount[repo.language] || 0) + 1;
        }

        // Add frameworks
        for (const framework of repo.frameworks) {
            const name = framework.name.charAt(0).toUpperCase() + framework.name.slice(1);
            techCount[name] = (techCount[name] || 0) + framework.confidence;
        }
    }

    // Sort by frequency and take top 10
    return Object.entries(techCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tech]) => tech);
}

/**
 * Generate evidence summary with strengths and gaps
 */
function generateEvidenceSummary(repositories) {
    const strengths = [];
    const gaps = [];

    // Analyze patterns across all repos
    const hasTests = repositories.filter(r => r.codeQuality.testCoverage.detected).length;
    const hasGoodDocs = repositories.filter(r => r.documentation.level === 'production-grade').length;
    const hasErrorHandling = repositories.filter(r => r.codeQuality.errorHandling.detected).length;
    const hasAsyncCode = repositories.filter(r => r.codeQuality.asyncUsage.detected).length;
    const hasArchitecturePatterns = repositories.filter(r => Object.keys(r.architecturalPatterns).length > 0).length;
    const avgCommitsPerRepo = repositories.reduce((sum, r) => sum + r.commitCount, 0) / repositories.length;
    const avgSemanticCommits = repositories.reduce((sum, r) => sum + r.commitQuality.hasSemanticPrefixes, 0) / repositories.length;

    // Identify strengths
    if (hasArchitecturePatterns / repositories.length > 0.5) {
        strengths.push(`Strong architectural patterns detected in ${hasArchitecturePatterns}/${repositories.length} repos`);
    }

    if (hasErrorHandling / repositories.length > 0.7) {
        strengths.push('Production-grade error handling across projects');
    }

    if (hasAsyncCode / repositories.length > 0.6) {
        strengths.push('Consistent use of async/concurrent programming patterns');
    }

    if (avgSemanticCommits > 0.5) {
        strengths.push(`High commit quality (${Math.round(avgSemanticCommits * 100)}% semantic commits)`);
    }

    if (hasGoodDocs > 0) {
        strengths.push(`Excellent documentation (${hasGoodDocs} production-grade README${hasGoodDocs > 1 ? 's' : ''})`);
    }

    if (avgCommitsPerRepo > 30) {
        strengths.push(`Strong commit consistency (avg ${Math.round(avgCommitsPerRepo)} commits per repo)`);
    }

    // Identify gaps
    if (hasTests === 0) {
        gaps.push('No test coverage detected in analyzed repositories');
    } else if (hasTests / repositories.length < 0.3) {
        gaps.push('Limited test coverage across projects');
    }

    if (hasGoodDocs === 0) {
        gaps.push('Documentation needs improvement (no production-grade READMEs)');
    }

    if (avgSemanticCommits < 0.3) {
        gaps.push('Commit message quality could be improved');
    }

    if (hasArchitecturePatterns / repositories.length < 0.3) {
        gaps.push('Limited architectural pattern implementation');
    }

    return { strengths, gaps };
}

/**
 * Generate detailed explanations for each skill domain
 */
function generateExplanations(scores, repositories) {
    const explanations = {};

    for (const domain in scores) {
        const relevantRepos = repositories.filter(r =>
            r.classification.primaryDomain === domain
        );

        if (relevantRepos.length === 0 || scores[domain] < 10) {
            explanations[domain] = `Score: ${scores[domain]}/100\n\nNo significant projects detected in ${domain}.`;
            continue;
        }

        const patterns = [];
        const frameworks = [];

        for (const repo of relevantRepos) {
            patterns.push(...Object.keys(repo.architecturalPatterns));
            frameworks.push(...repo.frameworks.map(f => f.name));
        }

        const uniquePatterns = [...new Set(patterns)];
        const uniqueFrameworks = [...new Set(frameworks)];

        const avgCommitMaturity = relevantRepos.reduce((sum, r) =>
            sum + (r.commitQuality.hasSemanticPrefixes + r.commitQuality.clarity) / 2, 0
        ) / relevantRepos.length;

        const productionGradeDocs = relevantRepos.filter(r =>
            r.documentation.level === 'production-grade'
        ).length;

        explanations[domain] = `Score: ${scores[domain]}/100

Evidence from ${relevantRepos.length} project(s):
- Repositories: ${relevantRepos.map(r => r.name).join(', ')}
- Detected patterns: ${uniquePatterns.length > 0 ? uniquePatterns.join(', ') : 'None'}
- Technologies: ${uniqueFrameworks.length > 0 ? uniqueFrameworks.join(', ') : 'None'}
- Average commit maturity: ${Math.round(avgCommitMaturity * 100)}%
- Documentation quality: ${productionGradeDocs} production-grade, ${relevantRepos.length - productionGradeDocs} intermediate/beginner`;
    }

    return explanations;
}

/**
 * Get empty skill genome structure
 */
function getEmptySkillGenome() {
    return {
        primary_domains: {
            'Backend Engineering': 0,
            'Frontend Development': 0,
            'Data Science': 0,
            'Machine Learning': 0,
            'System Design': 0
        },
        engineering_maturity: 'Beginner',
        core_technologies: [],
        evidence_summary: {
            strengths: [],
            gaps: ['No repositories available for analysis']
        },
        explanations: {
            'Backend Engineering': 'No data available',
            'Frontend Development': 'No data available',
            'Data Science': 'No data available',
            'Machine Learning': 'No data available',
            'System Design': 'No data available'
        }
    };
}

module.exports = {
    analyzeSkillGenome
};
