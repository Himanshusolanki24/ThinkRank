import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { NeuralBackground } from "@/components/NeuralBackground";
import {
    Brain,
    Dna,
    Target,
    Zap,
    TrendingUp,
    ChevronRight,
    Sparkles,
    GitBranch,
    BarChart3,
    Rocket,
    Shield,
    Users,
    Award,
    CheckCircle,
    ArrowRight,
    Code,
    FileText,
} from "lucide-react";
import { useRef } from "react";

const steps = [
    {
        step: 1,
        title: "Connect Your Profile",
        description:
            "Link your GitHub account or upload your resume. Our AI scans your repositories, commits, and experience to understand your technical journey.",
        icon: GitBranch,
        color: "from-blue-500 to-cyan-500",
        features: ["GitHub Integration", "Resume Parsing", "LinkedIn Sync"],
    },
    {
        step: 2,
        title: "AI Skill Mapping",
        description:
            "Our advanced AI creates a living genome map of your skills, showing connections between technologies and proficiency levels in real-time.",
        icon: Dna,
        color: "from-primary to-pink-400",
        features: ["50+ Skill Categories", "Proficiency Scoring", "Skill Relationships"],
    },
    {
        step: 3,
        title: "Weakness Detection",
        description:
            "Identify skill gaps that might be holding you back. Get precise insights into areas where focused improvement can accelerate your career.",
        icon: Target,
        color: "from-orange-500 to-yellow-500",
        features: ["Gap Analysis", "Priority Ranking", "Industry Benchmarks"],
    },
    {
        step: 4,
        title: "Personalized Tasks",
        description:
            "Receive daily micro-tasks tailored to your skill gaps. Each task is designed to be completable in 15-30 minutes for consistent growth.",
        icon: Zap,
        color: "from-green-500 to-emerald-500",
        features: ["Daily Challenges", "Adaptive Difficulty", "Progress Tracking"],
    },
    {
        step: 5,
        title: "Watch Yourself Evolve",
        description:
            "Track your growth over time with beautiful visualizations. See your skill genome evolve as you complete tasks and build new competencies.",
        icon: TrendingUp,
        color: "from-purple-500 to-violet-500",
        features: ["Growth Analytics", "Skill Timeline", "Achievement System"],
    },
];

const benefits = [
    {
        icon: Rocket,
        title: "10x Faster Growth",
        description: "Focused learning paths accelerate your skill development",
    },
    {
        icon: Shield,
        title: "Privacy First",
        description: "Your data is encrypted and never shared with third parties",
    },
    {
        icon: Users,
        title: "Community Driven",
        description: "Learn from peers and contribute to the skill ecosystem",
    },
    {
        icon: Award,
        title: "Verified Skills",
        description: "Get recognized for your competencies with verified badges",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const HowItWorks = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-8">
                <NeuralBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>The Science of Skill Evolution</span>
                        </motion.div>

                        <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                            How{" "}
                            <span className="text-gradient-pink">Skill Genome</span>
                            <br />
                            Works
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            A revolutionary approach to skill development powered by AI,
                            data-driven insights, and personalized learning paths.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/build">
                                <Button variant="genome" size="xl" className="group">
                                    Start Building
                                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Floating Icons */}
                <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[10%] top-1/3 hidden lg:block"
                >
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-sm">
                        <Code className="w-8 h-8 text-blue-400" />
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-[10%] top-1/2 hidden lg:block"
                >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                        <Brain className="w-10 h-10 text-primary" />
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[20%] bottom-1/4 hidden lg:block"
                >
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center backdrop-blur-sm">
                        <FileText className="w-7 h-7 text-green-400" />
                    </div>
                </motion.div>
            </section>

            {/* Steps Section */}
            <section ref={containerRef} className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="font-display text-4xl font-bold text-foreground mb-4">
                            Your Journey to Mastery
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Five powerful steps that transform how you learn and grow
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Connection Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 hidden lg:block" />

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={containerVariants}
                            className="space-y-16 lg:space-y-24"
                        >
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isEven = index % 2 === 0;

                                return (
                                    <motion.div
                                        key={step.step}
                                        variants={itemVariants}
                                        transition={{ duration: 0.6 }}
                                        className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${isEven ? "" : "lg:flex-row-reverse"
                                            }`}
                                    >
                                        {/* Content */}
                                        <div className="flex-1 text-center lg:text-left">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="relative group"
                                            >
                                                <div
                                                    className={`absolute -inset-4 bg-gradient-to-r ${step.color} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`}
                                                />
                                                <div className="relative genome-card">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div
                                                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
                                                        >
                                                            <Icon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-primary font-medium">
                                                                Step {step.step}
                                                            </span>
                                                            <h3 className="font-display text-2xl font-bold text-foreground">
                                                                {step.title}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <p className="text-muted-foreground mb-6">
                                                        {step.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-2">
                                                        {step.features.map((feature) => (
                                                            <span
                                                                key={feature}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Step Number Circle */}
                                        <div className="relative hidden lg:flex items-center justify-center">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-3xl font-display font-bold text-white shadow-lg shadow-primary/20 relative z-10`}
                                            >
                                                {step.step}
                                            </motion.div>
                                            <div
                                                className={`absolute w-28 h-28 rounded-full bg-gradient-to-r ${step.color} opacity-20 blur-xl`}
                                            />
                                        </div>

                                        {/* Spacer for layout */}
                                        <div className="flex-1 hidden lg:block" />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 relative overflow-hidden">
                <motion.div
                    style={{ y }}
                    className="absolute -right-64 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
                />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-4xl font-bold text-foreground mb-4">
                            Why Choose Skill Genome?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Built for developers who want to accelerate their growth
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {benefits.map((benefit) => {
                            const Icon = benefit.icon;
                            return (
                                <motion.div
                                    key={benefit.title}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className="genome-card text-center"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {benefit.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl bg-card border border-border p-12 md:p-16 text-center overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />

                        <div className="relative z-10">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                            >
                                <Dna className="w-10 h-10 text-primary" />
                            </motion.div>

                            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                                Ready to Evolve?
                            </h2>

                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                                Join thousands of developers who are transforming their careers
                                with AI-powered skill evolution.
                            </p>

                            <Link to="/build">
                                <Button variant="genome" size="xl" className="group">
                                    Build Your Skill Genome
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorks;
