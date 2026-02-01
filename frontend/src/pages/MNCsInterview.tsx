/**
 * MNCs Interview Page
 * 
 * Provides company-specific interview preparation tracks for major tech companies.
 * Each company shows interview rounds overview and practice options.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Code2,
    Brain,
    Users,
    Clock,
    ChevronRight,
    Briefcase,
    Target,
    Sparkles,
    Zap,
    Trophy,
    Star,
    ArrowRight,
} from "lucide-react";

// Import SVGL logos
import {
    Google,
    Microsoft,
    AmazonWebServicesLight,
    Meta,
    AppleLight,
    Netflix,
    UberLight,
} from "@ridemountainpig/svgl-react";

// Custom Flipkart Logo using provided SVG
const FlipkartLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 713.39 707.4" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="356.4805" y1="493.1343" x2="356.4805" y2="1080.8978" gradientTransform="matrix(1 0 0 1 0.14 -373.5461)">
                <stop offset="0" stopColor="#F7E830" />
                <stop offset="1" stopColor="#FDCB06" />
            </linearGradient>
            <radialGradient id="SVGID_2_" cx="353.4156" cy="761.2123" r="478.08" gradientTransform="matrix(1 0 0 1 0.14 -373.5461)" gradientUnits="userSpaceOnUse">
                <stop offset="0.596" stopColor="#F29405" />
                <stop offset="0.736" stopColor="#F7D01E" />
                <stop offset="1" stopColor="#FDCB06" />
            </radialGradient>
        </defs>
        <path fill="url(#SVGID_1_)" stroke="#FCD109" strokeWidth="0.094" d="M712.87,122.59c-0.3-1-0.6-2-1-3c-236.9,0.1-473.7,0-710.5,0.1c-0.6,0.7-1,1.4-1.1,2.3c0,183.7,0,367.3-0.1,551	c1.5,9.8,6.9,18.7,14.1,25.4c0.3,0.1,1,0.2,1.3,0.3c3.7,3.9,9,5.8,14,7.6c3.7-0.2,7.3,1.4,11,1h294c2.8-0.1,5.7,0.4,8.4-0.7	c0.1-0.4,0.2-1.1,0.3-1.5c0.1-0.5,0.2-1.6,0.3-2.2c6.3-35.2,12.4-70.5,19.1-105.7l0.6-4.5c-27.2-0.1-54.5,0-81.7-0.1	c-6.6-0.2-13.4,0-20-0.8c-11.3-0.5-22.7-0.1-34-1.2c-14,0-27.9-1.3-41.9-1.3c-11-1.1-22.1-0.7-33.2-1.2c-7.2-0.9-14.6-0.5-21.9-0.8	c-11.9-1.3-24-0.4-35.9-1.7c-12.6,0.1-25.2-1-37.8-1.3c0.1-0.1,0.2-0.5,0.2-0.6c4.2,0.1,8.3-0.2,12.5-0.3c9.3-1.2,18.7-0.4,28-1.7	c9.7,0,19.3-1.3,29-1.3c8.6-1.2,17.3-0.5,25.9-1.7c10.1,0,20-1.3,30.1-1.4c8.3-1.1,16.7-0.5,25-1.6c9.7,0.1,19.3-1.4,29-1.3	c9.5-1.1,19.2-0.8,28.7-1.8c-0.9-3.7-1.6-7.4-2.4-11.1c-0.7-2.3-3.5-1.8-5.3-2.1c-21.7-3.1-43.3-6.2-64.9-9.2	c1.4-1.1,3.3-0.6,4.9-0.8c16.8-1.3,33.5-2.8,50.3-4c3.8-0.2,7.5-0.9,11.3-1c-1.7-5.2-2.7-10.9-5-15.7	c-35.9-5.5-71.8-10.4-107.6-16.3c9.3-1.5,18.7-2.2,28-3.2l0.8-0.3c29.7-3.1,59.5-6.6,89.2-9.5c37.7-0.2,75.3-0.1,113,0	c1.2-0.2,3.3,0.4,3.5-1.3c3.1-16.2,6.1-32.4,9.2-48.6c4.3-22.5,11.1-44.7,21.6-65.2c16.5-33,42.6-61,74.4-79.6	c29.7-17.4,64.1-25.8,98.3-27.4c11.1-1,22.3-0.7,33.3,0.7c7.2,1.7,14.6,3.7,20.3,8.6c4.7,3.8,7.5,9.4,9.6,15	c4.6,13.3,7.2,27.1,9.4,41c0.1,5.6,1.1,11.9-1.9,17c-2.8,5-8.4,7.4-13.7,8.9c-19.3,5-39.5,0.3-58.8,5c-15.9,3.4-30.7,12.2-40.8,24.9	c-11.9,14.8-18.2,33.2-21.7,51.6c-2.7,16.4-6.1,32.8-8.8,49.3c19,0.1,38.1-0.1,57.2,0.1c7.6,0,15.4,4.2,18.5,11.4	c4,9.2,3.1,19.6,1.8,29.3c-1.6,10.9-4.2,21.7-9.1,31.7c-4.1,8.5-10.9,16.3-20.2,19.3c-4.8,1.9-10,1.5-15.1,1.5	c-16.8,0-33.6,0.2-50.4,0c-2.7,12.3-4.5,24.9-6.9,37.4c-4.4,24.3-8.7,48.7-13.1,73.1c-0.1,0.8-0.2,2.5-0.2,3.4	c7.9,0.4,15.8,0,23.7,0.2c58.6,0,117.3-0.1,176,0c6.3,0.2,12.7-1.3,18.2-4.4c3.3-1.2,5.3-4.1,8.2-5.7c2.8-1.6,3.6-4.9,6-7	c2.6-4.6,5.3-9.4,5.5-14.8c0.3,0,1.1-0.1,1.5-0.2C712.77,490.59,713.07,306.59,712.87,122.59z" />
        <path fill="#0D69B3" stroke="#0D69B3" strokeWidth="0.094" d="M486.27,304.69c29.7-17.4,64.1-25.8,98.3-27.4c11.1-1,22.3-0.7,33.3,0.7c7.2,1.7,14.6,3.7,20.3,8.6	c-2.9,0.2-5.7-1.1-8.6-1.5c-8.2-1.6-16.7-1-25-1.2c-24.1,0-48.4,1.9-71.7,8.5c-12.2,3.7-24.4,8-35.5,14.4	c-19.2,10.6-36.5,24.6-50.5,41.4c-25,28.7-39.7,65.1-46.8,102.2c-3.4,19.9-7.3,39.7-10.4,59.7c-5,0.5-10.1,0.2-15.1,0.2	c-22-0.1-44-0.2-66-0.4c-4.7,0.2-9.3-0.9-14-0.6c-40,0.2-80-0.1-120-0.1l0.8-0.3c29.7-3.1,59.5-6.6,89.2-9.5	c37.7-0.2,75.3-0.1,113,0c1.2-0.2,3.3,0.4,3.5-1.3c3.1-16.2,6.1-32.4,9.2-48.6c4.3-22.5,11.1-44.7,21.6-65.2	C428.37,351.29,454.47,323.29,486.27,304.69z" />
    </svg>
);

// White Logo Components for better visibility
const WhiteApple = ({ className = "w-6 h-6" }: { className?: string }) => (
    <AppleLight className={`${className} text-white`} style={{ filter: 'brightness(0) invert(1)' }} />
);

const WhiteUber = ({ className = "w-6 h-6" }: { className?: string }) => (
    <UberLight className={`${className} text-white`} style={{ filter: 'brightness(0) invert(1)' }} />
);

const WhiteAWS = ({ className = "w-6 h-6" }: { className?: string }) => (
    <AmazonWebServicesLight className={`${className} text-white`} style={{ filter: 'brightness(0) invert(1)' }} />
);

// Company configurations with interview details
const COMPANIES = [
    {
        id: "google",
        name: "Google",
        slug: "google",
        // color: "from-blue-500 to-green-500",
        Logo: Google,
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        rounds: [
            { name: "Phone Screen", type: "Technical", icon: Code2, duration: "45 min" },
            { name: "Coding Round 1", type: "DSA", icon: Brain, duration: "45 min" },
            { name: "Coding Round 2", type: "DSA", icon: Brain, duration: "45 min" },
            { name: "System Design", type: "Design", icon: Building2, duration: "45 min" },
            { name: "Behavioral", type: "Googleyness", icon: Users, duration: "45 min" },
        ],
        skills: ["Data Structures", "Algorithms", "System Design", "Problem Solving"],
        difficulty: "Hard",
        avgSalary: "$150k - $300k",
    },
    {
        id: "microsoft",
        name: "Microsoft",
        slug: "microsoft",
        // color: "from-cyan-500 to-blue-600",
        Logo: Microsoft,
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/30",
        rounds: [
            { name: "Phone Screen", type: "Technical", icon: Code2, duration: "30 min" },
            { name: "Coding Round", type: "DSA", icon: Brain, duration: "60 min" },
            { name: "System Design", type: "Design", icon: Building2, duration: "45 min" },
            { name: "Behavioral", type: "Culture Fit", icon: Users, duration: "30 min" },
        ],
        skills: ["C#", ".NET", "Azure", "System Design", "DSA"],
        difficulty: "Medium-Hard",
        avgSalary: "$130k - $250k",
    },
    {
        id: "amazon",
        name: "Amazon",
        slug: "amazon",
        // color: "from-orange-500 to-yellow-500",
        Logo: WhiteAWS,
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        rounds: [
            { name: "Online Assessment", type: "Technical", icon: Code2, duration: "90 min" },
            { name: "Phone Screen", type: "Technical", icon: Code2, duration: "60 min" },
            { name: "Loop Interview 1", type: "DSA", icon: Brain, duration: "60 min" },
            { name: "Loop Interview 2", type: "DSA + LP", icon: Brain, duration: "60 min" },
            { name: "Loop Interview 3", type: "System Design", icon: Building2, duration: "60 min" },
            { name: "Bar Raiser", type: "LP Focus", icon: Users, duration: "60 min" },
        ],
        skills: ["Leadership Principles", "DSA", "System Design", "AWS"],
        difficulty: "Hard",
        avgSalary: "$140k - $280k",
    },
    {
        id: "meta",
        name: "Meta",
        slug: "meta",
        // color: "from-blue-600 to-purple-600",
        Logo: Meta,
        bgColor: "bg-blue-600/10",
        borderColor: "border-blue-600/30",
        rounds: [
            { name: "Phone Screen", type: "Technical", icon: Code2, duration: "45 min" },
            { name: "Coding Round 1", type: "DSA", icon: Brain, duration: "45 min" },
            { name: "Coding Round 2", type: "DSA", icon: Brain, duration: "45 min" },
            { name: "System Design", type: "Design", icon: Building2, duration: "45 min" },
            { name: "Behavioral", type: "Culture", icon: Users, duration: "45 min" },
        ],
        skills: ["React", "DSA", "System Design", "Distributed Systems"],
        difficulty: "Hard",
        avgSalary: "$150k - $320k",
    },
    {
        id: "apple",
        name: "Apple",
        slug: "apple",
        // color: "from-gray-600 to-gray-800",
        Logo: WhiteApple,
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500/30",
        rounds: [
            { name: "Phone Screen", type: "Technical", icon: Code2, duration: "30 min" },
            { name: "Technical Interview 1", type: "DSA", icon: Brain, duration: "60 min" },
            { name: "Technical Interview 2", type: "Domain", icon: Brain, duration: "60 min" },
            { name: "Team Interview", type: "Behavioral", icon: Users, duration: "60 min" },
        ],
        skills: ["Swift", "Objective-C", "iOS", "System Design", "DSA"],
        difficulty: "Hard",
        avgSalary: "$140k - $290k",
    },
    {
        id: "flipkart",
        name: "Flipkart",
        Logo: FlipkartLogo,
        slug: "flipkart",
        // color: "from-yellow-500 to-blue-600",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        rounds: [
            { name: "Online Test", type: "Technical", icon: Code2, duration: "90 min" },
            { name: "Machine Coding", type: "LLD", icon: Brain, duration: "90 min" },
            { name: "Problem Solving", type: "DSA", icon: Brain, duration: "60 min" },
            { name: "System Design", type: "HLD", icon: Building2, duration: "60 min" },
            { name: "Hiring Manager", type: "Behavioral", icon: Users, duration: "45 min" },
        ],
        skills: ["Java", "System Design", "DSA", "LLD"],
        difficulty: "Medium-Hard",
        avgSalary: "₹25L - ₹60L",
    },
    {
        id: "uber",
        name: "Uber",
        slug: "uber",
        // color: "from-gray-800 to-gray-900",
        Logo: WhiteUber,
        bgColor: "bg-gray-800/10",
        borderColor: "border-gray-600/30",
        rounds: [
            { name: "Phone Screen", type: "Technical", icon: Code2, duration: "45 min" },
            { name: "Onsite - Coding", type: "DSA", icon: Brain, duration: "45 min" },
            { name: "Onsite - System Design", type: "Design", icon: Building2, duration: "45 min" },
            { name: "Onsite - Behavioral", type: "Culture", icon: Users, duration: "45 min" },
        ],
        skills: ["DSA", "System Design", "Distributed Systems", "Problem Solving"],
        difficulty: "Hard",
        avgSalary: "$140k - $280k",
    },
    {
        id: "netflix",
        name: "Netflix",
        slug: "netflix",
        // color: "from-red-600 to-red-800",
        Logo: Netflix,
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        rounds: [
            { name: "Phone Screen", type: "Technical", icon: Code2, duration: "60 min" },
            { name: "Onsite - Technical 1", type: "DSA/Design", icon: Brain, duration: "60 min" },
            { name: "Onsite - Technical 2", type: "Domain", icon: Brain, duration: "60 min" },
            { name: "Onsite - Cultural", type: "Culture", icon: Users, duration: "60 min" },
        ],
        skills: ["Senior Level", "System Design", "Leadership", "Domain Expertise"],
        difficulty: "Very Hard",
        avgSalary: "$200k - $400k",
    },
];

const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes("Very Hard")) return "text-red-400 bg-red-500/20";
    if (difficulty.includes("Hard")) return "text-orange-400 bg-orange-500/20";
    return "text-yellow-400 bg-yellow-500/20";
};

export default function MNCsInterview() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const sounds = useSoundEffects();
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);

    const handleStartPractice = (companyId: string) => {
        sounds.playClick();
        // Navigate to technical interview with company-specific skills
        const company = COMPANIES.find((c) => c.id === companyId);
        if (company) {
            // For now, navigate to the technical interview page
            // In future, this could set company-specific context
            navigate("/technical-interview");
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white pb-16">
            {/* Neural Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
                        <Building2 className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-violet-300">MNCs Interview Prep</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Crack </span>
                        <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                            Tech Giants
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Company-specific interview preparation with detailed round breakdowns,
                        skills required, and practice sessions tailored to each company's process.
                    </p>
                </motion.div>

                {/* Stats Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    {[
                        { icon: Building2, label: "Companies", value: "8+" },
                        { icon: Trophy, label: "Success Rate", value: "85%" },
                        { icon: Target, label: "Interview Rounds", value: "40+" },
                        { icon: Zap, label: "Practice Questions", value: "500+" },
                    ].map((stat, index) => (
                        <div
                            key={stat.label}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm"
                        >
                            <stat.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Companies Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {COMPANIES.map((company, index) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            onMouseEnter={() => {
                                setHoveredCompany(company.id);
                                sounds.playHover();
                            }}
                            onMouseLeave={() => setHoveredCompany(null)}
                            className="group cursor-pointer"
                            onClick={() => setSelectedCompany(company.id === selectedCompany ? null : company.id)}
                        >
                            <Card
                                className={`relative overflow-hidden transition-all duration-300 ${hoveredCompany === company.id || selectedCompany === company.id
                                    ? "border-violet-500/50 scale-[1.02]"
                                    : "border-white/10"
                                    } bg-gradient-to-br from-[#1A1A23] to-[#0F0F16]`}
                            >
                                {/* Gradient overlay on hover */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                                />

                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        {/* Company Logo using SVGL */}
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br  p-0.5 flex items-center justify-center`}
                                        >
                                            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center overflow-hidden p-2">
                                                <company.Logo className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-white">
                                                {company.name}
                                            </CardTitle>
                                            <CardDescription className="text-gray-400">
                                                {company.rounds.length} Interview Rounds
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Difficulty & Salary */}
                                    <div className="flex items-center justify-between">
                                        <Badge className={getDifficultyColor(company.difficulty)}>
                                            {company.difficulty}
                                        </Badge>
                                        <span className="text-xs text-gray-400">{company.avgSalary}</span>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {company.skills.slice(0, 3).map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="outline"
                                                className="text-xs border-white/20 text-gray-300"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                        {company.skills.length > 3 && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs border-white/20 text-gray-400"
                                            >
                                                +{company.skills.length - 3}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Interview Rounds Preview */}
                                    <div
                                        className={`space-y-2 overflow-hidden transition-all duration-300 ${selectedCompany === company.id ? "max-h-96" : "max-h-0"
                                            }`}
                                    >
                                        <div className="pt-4 border-t border-white/10">
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">
                                                Interview Process
                                            </h4>
                                            <div className="space-y-2">
                                                {company.rounds.map((round, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-400">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-gray-300">{round.name}</span>
                                                            <span className="text-gray-500 ml-2">
                                                                ({round.type})
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            <span className="text-xs">{round.duration}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2">
                                        <Button
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all font-medium"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartPractice(company.id);
                                            }}
                                        >
                                            <span>Start Practice</span>
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-4 px-8 py-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                        <Sparkles className="w-8 h-8 text-violet-400" />
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-white">
                                Not sure where to start?
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Take a quick skill assessment to get personalized company recommendations.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                            onClick={() => {
                                sounds.playClick();
                                navigate("/technical-interview");
                            }}
                        >
                            Take Assessment
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
