/**
 * Placement Genome Intelligence Data
 * 
 * Company-specific hiring intelligence, skill weight matrices,
 * readiness scoring algorithms, and placement strategy data.
 */

// ─── Types ────────────────────────────────────────────────────
export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  tier: "faang" | "tier1" | "tier2" | "startup";
  logo: string;
  accentColor: string;
  glowColor: string;
  avgSalary: { min: number; max: number; currency: string };
  hiringBar: "very_high" | "high" | "medium";
  interviewRounds: InterviewRound[];
  skillWeights: SkillWeight[];
  topTopics: string[];
  hiringTrends: HiringTrend[];
  cultureFit: string[];
  preparationPriorities: string[];
}

export interface InterviewRound {
  name: string;
  type: "coding" | "system_design" | "behavioral" | "oa" | "machine_coding" | "domain";
  duration: number;
  difficulty: number; // 1-10
  focusAreas: string[];
}

export interface SkillWeight {
  skill: string;
  weight: number; // 0-1
  category: "dsa" | "system_design" | "language" | "behavioral" | "projects" | "cs_fundamentals";
}

export interface HiringTrend {
  quarter: string;
  openings: number;
  difficulty: number;
}

export interface PlacementReadiness {
  overall: number;
  technical: number;
  interview: number;
  consistency: number;
  recruiterAttractiveness: number;
  companyScores: CompanyReadinessScore[];
}

export interface CompanyReadinessScore {
  companyId: string;
  readiness: number;
  probability: number;
  missingSkills: string[];
  strengths: string[];
  weeklyDelta: number;
}

export interface RoadmapPhase {
  month: number;
  title: string;
  focus: string[];
  milestones: string[];
  dailyHours: number;
  weeklyGoals: WeeklyGoal[];
}

export interface WeeklyGoal {
  week: number;
  tasks: string[];
  target: string;
}

export interface DailyTask {
  id: string;
  type: "coding" | "project" | "interview" | "github" | "revision" | "system_design";
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  linkedSkill: string;
}

export interface PeerBenchmark {
  metric: string;
  userValue: number;
  percentile: number;
  topCandidateAvg: number;
  recommendation: string;
}

// ─── Company Intelligence Database ───────────────────────────
export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    id: "google",
    name: "Google",
    slug: "google",
    tier: "faang",
    logo: "google",
    accentColor: "#4285F4",
    glowColor: "rgba(66, 133, 244, 0.3)",
    avgSalary: { min: 150000, max: 300000, currency: "USD" },
    hiringBar: "very_high",
    interviewRounds: [
      { name: "Phone Screen", type: "coding", duration: 45, difficulty: 7, focusAreas: ["Arrays", "Strings", "Trees"] },
      { name: "Coding Round 1", type: "coding", duration: 45, difficulty: 8, focusAreas: ["Graphs", "DP", "Binary Search"] },
      { name: "Coding Round 2", type: "coding", duration: 45, difficulty: 9, focusAreas: ["Advanced DP", "Greedy", "Tries"] },
      { name: "System Design", type: "system_design", duration: 45, difficulty: 8, focusAreas: ["Distributed Systems", "Scalability", "CAP Theorem"] },
      { name: "Googleyness & Leadership", type: "behavioral", duration: 45, difficulty: 6, focusAreas: ["Leadership", "Collaboration", "Ambiguity"] },
    ],
    skillWeights: [
      { skill: "DSA", weight: 0.35, category: "dsa" },
      { skill: "System Design", weight: 0.25, category: "system_design" },
      { skill: "Problem Solving", weight: 0.2, category: "dsa" },
      { skill: "Communication", weight: 0.1, category: "behavioral" },
      { skill: "Projects", weight: 0.1, category: "projects" },
    ],
    topTopics: ["Graphs", "Dynamic Programming", "Trees", "Binary Search", "Sliding Window", "Tries", "Segment Trees"],
    hiringTrends: [
      { quarter: "Q1 2025", openings: 1200, difficulty: 8.5 },
      { quarter: "Q2 2025", openings: 1400, difficulty: 8.2 },
      { quarter: "Q3 2025", openings: 1100, difficulty: 8.7 },
      { quarter: "Q4 2025", openings: 1600, difficulty: 8.0 },
    ],
    cultureFit: ["Innovation-driven", "Data-informed decisions", "Collaborative problem solving"],
    preparationPriorities: ["Master Graph algorithms", "Practice DP patterns (25+)", "Build 2 scalable projects", "System design deep dive"],
  },
  {
    id: "amazon",
    name: "Amazon",
    slug: "amazon",
    tier: "faang",
    logo: "amazon",
    accentColor: "#FF9900",
    glowColor: "rgba(255, 153, 0, 0.3)",
    avgSalary: { min: 140000, max: 280000, currency: "USD" },
    hiringBar: "very_high",
    interviewRounds: [
      { name: "Online Assessment", type: "oa", duration: 90, difficulty: 7, focusAreas: ["Arrays", "Strings", "BFS/DFS"] },
      { name: "Phone Screen", type: "coding", duration: 60, difficulty: 7, focusAreas: ["OOP", "Data Structures", "LP Stories"] },
      { name: "Loop 1 - Coding", type: "coding", duration: 60, difficulty: 8, focusAreas: ["Trees", "Graphs", "Heaps"] },
      { name: "Loop 2 - DSA + LP", type: "coding", duration: 60, difficulty: 8, focusAreas: ["DP", "Greedy", "Leadership Principles"] },
      { name: "Loop 3 - System Design", type: "system_design", duration: 60, difficulty: 8, focusAreas: ["HLD", "Database Design", "AWS Services"] },
      { name: "Bar Raiser", type: "behavioral", duration: 60, difficulty: 9, focusAreas: ["Leadership Principles", "Ownership", "Dive Deep"] },
    ],
    skillWeights: [
      { skill: "Leadership Principles", weight: 0.3, category: "behavioral" },
      { skill: "DSA", weight: 0.3, category: "dsa" },
      { skill: "System Design", weight: 0.2, category: "system_design" },
      { skill: "OOP/LLD", weight: 0.1, category: "cs_fundamentals" },
      { skill: "Projects", weight: 0.1, category: "projects" },
    ],
    topTopics: ["OOP Design", "Leadership Principles", "Trees", "BFS/DFS", "Heaps", "Sliding Window"],
    hiringTrends: [
      { quarter: "Q1 2025", openings: 2200, difficulty: 7.8 },
      { quarter: "Q2 2025", openings: 2500, difficulty: 7.5 },
      { quarter: "Q3 2025", openings: 2000, difficulty: 8.0 },
      { quarter: "Q4 2025", openings: 2800, difficulty: 7.3 },
    ],
    cultureFit: ["Customer obsession", "Ownership mentality", "Bias for action", "Frugality"],
    preparationPriorities: ["Prepare 14 LP stories (STAR format)", "OOP/LLD practice", "AWS fundamentals", "Behavioral round mastery"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    slug: "microsoft",
    tier: "faang",
    logo: "microsoft",
    accentColor: "#00A4EF",
    glowColor: "rgba(0, 164, 239, 0.3)",
    avgSalary: { min: 130000, max: 250000, currency: "USD" },
    hiringBar: "high",
    interviewRounds: [
      { name: "Phone Screen", type: "coding", duration: 30, difficulty: 6, focusAreas: ["Arrays", "Strings", "Basics"] },
      { name: "Coding Round", type: "coding", duration: 60, difficulty: 7, focusAreas: ["Trees", "Linked Lists", "Stacks"] },
      { name: "System Design", type: "system_design", duration: 45, difficulty: 7, focusAreas: ["Azure", "Microservices", "APIs"] },
      { name: "Behavioral", type: "behavioral", duration: 30, difficulty: 5, focusAreas: ["Growth Mindset", "Collaboration", "Inclusivity"] },
    ],
    skillWeights: [
      { skill: "CS Fundamentals", weight: 0.3, category: "cs_fundamentals" },
      { skill: "DSA", weight: 0.25, category: "dsa" },
      { skill: "System Design", weight: 0.2, category: "system_design" },
      { skill: "Communication", weight: 0.15, category: "behavioral" },
      { skill: "Full Stack", weight: 0.1, category: "projects" },
    ],
    topTopics: ["Trees", "Linked Lists", "Stacks/Queues", "Sorting", "CS Fundamentals", "OOP"],
    hiringTrends: [
      { quarter: "Q1 2025", openings: 1800, difficulty: 7.0 },
      { quarter: "Q2 2025", openings: 2000, difficulty: 6.8 },
      { quarter: "Q3 2025", openings: 1600, difficulty: 7.2 },
      { quarter: "Q4 2025", openings: 2200, difficulty: 6.5 },
    ],
    cultureFit: ["Growth mindset", "Inclusive culture", "Customer-centric"],
    preparationPriorities: ["Strong CS fundamentals", "Full-stack project", "Communication skills", "Azure basics"],
  },
  {
    id: "meta",
    name: "Meta",
    slug: "meta",
    tier: "faang",
    logo: "meta",
    accentColor: "#0668E1",
    glowColor: "rgba(6, 104, 225, 0.3)",
    avgSalary: { min: 150000, max: 320000, currency: "USD" },
    hiringBar: "very_high",
    interviewRounds: [
      { name: "Phone Screen", type: "coding", duration: 45, difficulty: 7, focusAreas: ["Arrays", "Strings", "Hash Maps"] },
      { name: "Coding 1", type: "coding", duration: 45, difficulty: 8, focusAreas: ["Graphs", "DP", "Recursion"] },
      { name: "Coding 2", type: "coding", duration: 45, difficulty: 9, focusAreas: ["Advanced DP", "Combinatorics"] },
      { name: "System Design", type: "system_design", duration: 45, difficulty: 9, focusAreas: ["News Feed", "Chat Systems", "Real-time"] },
      { name: "Behavioral", type: "behavioral", duration: 45, difficulty: 6, focusAreas: ["Move Fast", "Be Bold", "Focus on Impact"] },
    ],
    skillWeights: [
      { skill: "DSA", weight: 0.35, category: "dsa" },
      { skill: "System Design", weight: 0.25, category: "system_design" },
      { skill: "React/Frontend", weight: 0.15, category: "language" },
      { skill: "Communication", weight: 0.15, category: "behavioral" },
      { skill: "Projects", weight: 0.1, category: "projects" },
    ],
    topTopics: ["Graphs", "DP", "Hash Maps", "BFS/DFS", "Sliding Window", "Two Pointers"],
    hiringTrends: [
      { quarter: "Q1 2025", openings: 900, difficulty: 8.8 },
      { quarter: "Q2 2025", openings: 1100, difficulty: 8.5 },
      { quarter: "Q3 2025", openings: 800, difficulty: 9.0 },
      { quarter: "Q4 2025", openings: 1200, difficulty: 8.3 },
    ],
    cultureFit: ["Move fast", "Be bold", "Focus on impact", "Build social value"],
    preparationPriorities: ["Speed coding practice", "Graph mastery", "React deep dive", "System design for social platforms"],
  },
  {
    id: "adobe",
    name: "Adobe",
    slug: "adobe",
    tier: "tier1",
    logo: "adobe",
    accentColor: "#FF0000",
    glowColor: "rgba(255, 0, 0, 0.3)",
    avgSalary: { min: 120000, max: 220000, currency: "USD" },
    hiringBar: "high",
    interviewRounds: [
      { name: "Online Test", type: "oa", duration: 90, difficulty: 6, focusAreas: ["MCQs", "Coding", "Aptitude"] },
      { name: "Technical 1", type: "coding", duration: 60, difficulty: 7, focusAreas: ["DSA", "OOP", "Java/C++"] },
      { name: "Technical 2", type: "coding", duration: 60, difficulty: 7, focusAreas: ["LLD", "Design Patterns"] },
      { name: "Hiring Manager", type: "behavioral", duration: 45, difficulty: 5, focusAreas: ["Projects", "Culture", "Growth"] },
    ],
    skillWeights: [
      { skill: "DSA", weight: 0.3, category: "dsa" },
      { skill: "OOP/LLD", weight: 0.25, category: "cs_fundamentals" },
      { skill: "Projects", weight: 0.2, category: "projects" },
      { skill: "CS Fundamentals", weight: 0.15, category: "cs_fundamentals" },
      { skill: "Communication", weight: 0.1, category: "behavioral" },
    ],
    topTopics: ["OOP", "Design Patterns", "Trees", "Graphs", "LLD", "Java Collections"],
    hiringTrends: [
      { quarter: "Q1 2025", openings: 600, difficulty: 6.5 },
      { quarter: "Q2 2025", openings: 750, difficulty: 6.2 },
      { quarter: "Q3 2025", openings: 500, difficulty: 6.8 },
      { quarter: "Q4 2025", openings: 800, difficulty: 6.0 },
    ],
    cultureFit: ["Creativity-driven", "User experience focus", "Design thinking"],
    preparationPriorities: ["Master OOP & Design Patterns", "LLD practice", "Strong project portfolio", "Java/C++ proficiency"],
  },
  {
    id: "goldman",
    name: "Goldman Sachs",
    slug: "goldman-sachs",
    tier: "tier1",
    logo: "goldman",
    accentColor: "#7399C6",
    glowColor: "rgba(115, 153, 198, 0.3)",
    avgSalary: { min: 130000, max: 240000, currency: "USD" },
    hiringBar: "high",
    interviewRounds: [
      { name: "HackerRank Test", type: "oa", duration: 120, difficulty: 7, focusAreas: ["DSA", "SQL", "Aptitude"] },
      { name: "Technical 1", type: "coding", duration: 60, difficulty: 7, focusAreas: ["DSA", "Core Java", "DBMS"] },
      { name: "Technical 2", type: "coding", duration: 60, difficulty: 8, focusAreas: ["System Design", "Concurrency"] },
      { name: "Hiring Manager", type: "behavioral", duration: 45, difficulty: 6, focusAreas: ["Finance Basics", "Problem Solving"] },
    ],
    skillWeights: [
      { skill: "DSA", weight: 0.25, category: "dsa" },
      { skill: "CS Fundamentals", weight: 0.25, category: "cs_fundamentals" },
      { skill: "System Design", weight: 0.2, category: "system_design" },
      { skill: "DBMS/SQL", weight: 0.15, category: "cs_fundamentals" },
      { skill: "Projects", weight: 0.15, category: "projects" },
    ],
    topTopics: ["Core Java", "DBMS", "OS", "Networking", "Trees", "Sorting", "Concurrency"],
    hiringTrends: [
      { quarter: "Q1 2025", openings: 400, difficulty: 7.5 },
      { quarter: "Q2 2025", openings: 500, difficulty: 7.2 },
      { quarter: "Q3 2025", openings: 350, difficulty: 7.8 },
      { quarter: "Q4 2025", openings: 550, difficulty: 7.0 },
    ],
    cultureFit: ["Analytical mindset", "Financial acumen", "Precision-driven"],
    preparationPriorities: ["Core CS subjects (OS, DBMS, CN)", "SQL mastery", "Java concurrency", "Finance basics"],
  },
];

// ─── Skill Category Definitions ──────────────────────────────
export const SKILL_CATEGORIES = {
  dsa: { label: "DSA & Algorithms", color: "#8B5CF6", icon: "Brain" },
  system_design: { label: "System Design", color: "#06B6D4", icon: "Network" },
  language: { label: "Languages & Frameworks", color: "#10B981", icon: "Code" },
  behavioral: { label: "Behavioral & Soft Skills", color: "#F59E0B", icon: "Users" },
  projects: { label: "Projects & Portfolio", color: "#EC4899", icon: "FolderGit" },
  cs_fundamentals: { label: "CS Fundamentals", color: "#6366F1", icon: "GraduationCap" },
};

// ─── Mock User Placement Data ────────────────────────────────
export const MOCK_USER_READINESS: PlacementReadiness = {
  overall: 68,
  technical: 72,
  interview: 58,
  consistency: 75,
  recruiterAttractiveness: 64,
  companyScores: [
    { companyId: "google", readiness: 62, probability: 34, missingSkills: ["Advanced DP", "Segment Trees", "System Design at Scale"], strengths: ["Graph algorithms", "Tree traversal", "Problem solving speed"], weeklyDelta: 2.3 },
    { companyId: "amazon", readiness: 74, probability: 52, missingSkills: ["Leadership Principles", "HLD for AWS"], strengths: ["OOP Design", "Data structures", "Coding consistency"], weeklyDelta: 1.8 },
    { companyId: "microsoft", readiness: 78, probability: 61, missingSkills: ["Azure fundamentals"], strengths: ["CS Fundamentals", "Full stack experience", "Communication"], weeklyDelta: 3.1 },
    { companyId: "meta", readiness: 58, probability: 28, missingSkills: ["Speed coding", "Advanced Graph", "Real-time system design"], strengths: ["React proficiency", "Frontend skills"], weeklyDelta: 1.5 },
    { companyId: "adobe", readiness: 82, probability: 68, missingSkills: ["Design Patterns depth"], strengths: ["OOP", "LLD", "Java proficiency", "Projects"], weeklyDelta: 2.0 },
    { companyId: "goldman", readiness: 71, probability: 45, missingSkills: ["Finance basics", "Concurrency", "SQL optimization"], strengths: ["Core Java", "DSA", "Networking"], weeklyDelta: 1.2 },
  ],
};

// ─── Mock Daily Tasks ────────────────────────────────────────
export const MOCK_DAILY_TASKS: DailyTask[] = [
  { id: "t1", type: "coding", title: "Solve 2 Graph Problems (Medium)", description: "Focus on BFS/DFS traversal patterns", difficulty: "medium", estimatedMinutes: 45, xpReward: 50, isCompleted: false, linkedSkill: "Graphs" },
  { id: "t2", type: "system_design", title: "Design URL Shortener", description: "Practice HLD with scalability analysis", difficulty: "hard", estimatedMinutes: 60, xpReward: 80, isCompleted: false, linkedSkill: "System Design" },
  { id: "t3", type: "github", title: "Push 1 Meaningful Commit", description: "Contribute to your active project", difficulty: "easy", estimatedMinutes: 30, xpReward: 25, isCompleted: true, linkedSkill: "Projects" },
  { id: "t4", type: "interview", title: "Mock Behavioral (STAR)", description: "Practice 2 Amazon LP stories", difficulty: "medium", estimatedMinutes: 30, xpReward: 40, isCompleted: false, linkedSkill: "Behavioral" },
  { id: "t5", type: "revision", title: "Revise DP Patterns", description: "Review knapsack and LCS variations", difficulty: "hard", estimatedMinutes: 40, xpReward: 45, isCompleted: false, linkedSkill: "DSA" },
  { id: "t6", type: "coding", title: "1 Easy LeetCode Warmup", description: "Array/String problem under 15 min", difficulty: "easy", estimatedMinutes: 15, xpReward: 15, isCompleted: true, linkedSkill: "DSA" },
];

// ─── Peer Benchmark Data ─────────────────────────────────────
export const MOCK_PEER_BENCHMARKS: PeerBenchmark[] = [
  { metric: "Problems Solved", userValue: 287, percentile: 72, topCandidateAvg: 450, recommendation: "Solve 25 more medium/hard problems this month" },
  { metric: "Contest Rating", userValue: 1580, percentile: 65, topCandidateAvg: 1850, recommendation: "Participate in 2 weekly contests consistently" },
  { metric: "GitHub Contributions", userValue: 340, percentile: 78, topCandidateAvg: 500, recommendation: "Maintain daily commit streak" },
  { metric: "System Design Score", userValue: 62, percentile: 55, topCandidateAvg: 82, recommendation: "Complete 3 more HLD case studies" },
  { metric: "Mock Interview Score", userValue: 7.2, percentile: 68, topCandidateAvg: 8.5, recommendation: "Practice 2 mock interviews per week" },
  { metric: "Project Quality", userValue: 74, percentile: 71, topCandidateAvg: 88, recommendation: "Add CI/CD and documentation to top project" },
];

// ─── Roadmap Template ────────────────────────────────────────
export const MOCK_ROADMAP: RoadmapPhase[] = [
  {
    month: 1,
    title: "Foundation & DSA Core",
    focus: ["Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Sorting"],
    milestones: ["100 problems solved", "2 contest participations", "GitHub profile setup"],
    dailyHours: 4,
    weeklyGoals: [
      { week: 1, tasks: ["Arrays & Hashing (20 problems)", "Setup GitHub portfolio"], target: "Build problem-solving habit" },
      { week: 2, tasks: ["Strings & Two Pointers (20 problems)", "Start Project 1"], target: "Pattern recognition" },
      { week: 3, tasks: ["Linked Lists & Stacks (15 problems)", "1st Contest"], target: "Data structure fluency" },
      { week: 4, tasks: ["Sorting & Searching (15 problems)", "Project 1 MVP"], target: "Month 1 review" },
    ],
  },
  {
    month: 2,
    title: "Advanced DSA & System Design Intro",
    focus: ["Trees", "Graphs", "DP basics", "System Design fundamentals"],
    milestones: ["200 problems total", "System design basics", "Project 1 complete"],
    dailyHours: 5,
    weeklyGoals: [
      { week: 1, tasks: ["Binary Trees (20 problems)", "System Design: Basics"], target: "Tree mastery" },
      { week: 2, tasks: ["Graphs BFS/DFS (20 problems)", "Design URL shortener"], target: "Graph traversal" },
      { week: 3, tasks: ["DP 1D patterns (15 problems)", "Design Chat System"], target: "DP foundation" },
      { week: 4, tasks: ["Heaps & Priority Queues (15 problems)", "Project 1 polish"], target: "Month 2 review" },
    ],
  },
  {
    month: 3,
    title: "Advanced Patterns & Interview Prep",
    focus: ["Advanced DP", "Backtracking", "Tries", "Mock Interviews"],
    milestones: ["320 problems total", "5 system designs", "Mock interview practice"],
    dailyHours: 6,
    weeklyGoals: [
      { week: 1, tasks: ["2D DP & Knapsack (15 problems)", "Design Instagram"], target: "Advanced DP" },
      { week: 2, tasks: ["Backtracking & Tries (15 problems)", "Start Project 2"], target: "Pattern depth" },
      { week: 3, tasks: ["2 Mock Interviews", "Behavioral prep (STAR)"], target: "Interview readiness" },
      { week: 4, tasks: ["Company-specific practice", "Resume finalization"], target: "Application ready" },
    ],
  },
  {
    month: 4,
    title: "Interview Sprint & Applications",
    focus: ["Company-specific prep", "Mock interviews", "Resume optimization", "Applications"],
    milestones: ["400+ problems", "10 mock interviews", "Applications sent"],
    dailyHours: 6,
    weeklyGoals: [
      { week: 1, tasks: ["Target company problems", "3 mock interviews"], target: "Company focus" },
      { week: 2, tasks: ["System design deep dive", "Behavioral mastery"], target: "Full preparation" },
      { week: 3, tasks: ["Revision & weak areas", "Apply to companies"], target: "Application phase" },
      { week: 4, tasks: ["Final mock rounds", "Interview scheduling"], target: "Interview ready" },
    ],
  },
];
