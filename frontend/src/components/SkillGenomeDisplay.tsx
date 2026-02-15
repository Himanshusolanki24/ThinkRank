import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Brain,
    Code,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Award,
    Target,
    Sparkles,
} from "lucide-react";

interface SkillGenome {
    primary_domains: {
        "Backend Engineering": number;
        "Frontend Development": number;
        "Data Science": number;
        "Machine Learning": number;
        "System Design": number;
    };
    engineering_maturity: "Beginner" | "Intermediate" | "Advanced";
    core_technologies: string[];
    evidence_summary: {
        strengths: string[];
        gaps: string[];
    };
    explanations: {
        [key: string]: string;
    };
}

interface SkillGenomeData {
    username: string;
    skill_genome: SkillGenome;
    metadata: {
        analyzedRepos: number;
        totalRepos: number;
        analysisTimestamp: string;
    };
}

interface SkillGenomeDisplayProps {
    data: SkillGenomeData;
}

const getMaturityColor = (maturity: string) => {
    switch (maturity) {
        case "Advanced":
            return "from-green-500 to-emerald-600";
        case "Intermediate":
            return "from-blue-500 to-cyan-600";
        default:
            return "from-amber-500 to-orange-600";
    }
};

const getMaturityIcon = (maturity: string) => {
    switch (maturity) {
        case "Advanced":
            return Award;
        case "Intermediate":
            return Target;
        default:
            return Brain;
    }
};

export const SkillGenomeDisplay = ({ data }: SkillGenomeDisplayProps) => {
    const { skill_genome, metadata } = data;

    // Get top 3 domains
    const topDomains = Object.entries(skill_genome.primary_domains)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .filter(([, score]) => score > 0);

    const MaturityIcon = getMaturityIcon(skill_genome.engineering_maturity);

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h3 className="font-display text-2xl font-bold text-foreground">
                                    Skill Genome Analysis
                                </h3>
                            </div>
                            <p className="text-muted-foreground">
                                Analyzed {metadata.analyzedRepos} of {metadata.totalRepos} repositories
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${getMaturityColor(skill_genome.engineering_maturity)} text-white`}>
                            <MaturityIcon className="w-5 h-5" />
                            <span className="font-semibold">{skill_genome.engineering_maturity}</span>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Primary Domains */}
            {topDomains.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Code className="w-5 h-5 text-primary" />
                            <h4 className="font-display text-lg font-semibold">Primary Skill Domains</h4>
                        </div>
                        <div className="space-y-4">
                            {topDomains.map(([domain, score], index) => (
                                <div key={domain} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">{domain}</span>
                                        <span className="text-sm font-bold text-primary">{score}/100</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                        />
                                    </div>
                                    {skill_genome.explanations[domain] && (
                                        <p className="text-xs text-muted-foreground whitespace-pre-line pl-2 border-l-2 border-primary/30 mt-2">
                                            {skill_genome.explanations[domain]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Core Technologies */}
            {skill_genome.core_technologies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h4 className="font-display text-lg font-semibold">Core Technologies</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skill_genome.core_technologies.map((tech, index) => (
                                <motion.div
                                    key={tech}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                >
                                    <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                                        {tech}
                                    </Badge>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Evidence Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid md:grid-cols-2 gap-4"
            >
                {/* Strengths */}
                <Card className="p-6 bg-green-500/5 border-green-500/20">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <h4 className="font-display text-lg font-semibold">Strengths</h4>
                    </div>
                    {skill_genome.evidence_summary.strengths.length > 0 ? (
                        <ul className="space-y-2">
                            {skill_genome.evidence_summary.strengths.map((strength, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-start gap-2 text-sm text-foreground"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{strength}</span>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No significant strengths detected yet. Keep building!
                        </p>
                    )}
                </Card>

                {/* Gaps */}
                <Card className="p-6 bg-amber-500/5 border-amber-500/20">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <h4 className="font-display text-lg font-semibold">Growth Areas</h4>
                    </div>
                    {skill_genome.evidence_summary.gaps.length > 0 ? (
                        <ul className="space-y-2">
                            {skill_genome.evidence_summary.gaps.map((gap, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-start gap-2 text-sm text-foreground"
                                >
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span>{gap}</span>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Great work! No major gaps detected.
                        </p>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};
