import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
    Home,
    LayoutDashboard,
    Target,
    BarChart3,
    User,
    LogOut,
    Sparkles,
    Brain,
    Code2,
    Building2,
    Map,
    Dna,
} from "lucide-react";

const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/coding-signals", label: "Coding Signals", icon: Code2 },
    { path: "/mncs-interview", label: "MNCs Interview", icon: Building2 },
    { path: "/learning-roadmap", label: "Learning Roadmap", icon: Map },
    { path: "/tasks", label: "Daily Tasks", icon: Target },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/profile", label: "Profile", icon: User },
];

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isMobileOpen?: boolean;
    setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar = ({ isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const sounds = useSoundEffects();
    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        sounds.initAudio();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSignOut = async () => {
        sounds.playClick();
        await signOut();
        navigate("/");
    };

    // Close mobile sidebar on navigation
    useEffect(() => {
        if (isMobile && setIsMobileOpen) {
            setIsMobileOpen(false);
        }
    }, [location.pathname]);

    return (
        <motion.div
            className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'
                }`}
            style={{
                background: "linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(15, 10, 25, 0.95) 100%)",
                backdropFilter: "blur(20px)",
                borderRight: "1px solid rgba(139, 92, 246, 0.1)",
                width: isMobile ? 280 : (isExpanded ? 240 : 80)
            }}
            animate={!isMobile ? { width: isExpanded ? 240 : 80 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => !isMobile && setIsExpanded(true)}
            onMouseLeave={() => !isMobile && setIsExpanded(false)}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-center relative border-b border-violet-500/10">
                <Link to="/" className="flex items-center gap-3 overflow-hidden px-4 w-full">
                    <div className="relative shrink-0 w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl opacity-20 blur-lg" />
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
                            <Dna className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-lg whitespace-nowrap"
                            >
                                <span className="text-white">Skill</span>
                                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Genome</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-6 flex flex-col gap-1.5 px-3 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isHovered = hoveredPath === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => sounds.playClick()}
                            onMouseEnter={() => {
                                setHoveredPath(item.path);
                                sounds.playHover();
                            }}
                            onMouseLeave={() => setHoveredPath(null)}
                        >
                            <div className="relative flex items-center h-12 px-3 rounded-xl transition-all duration-300 group">
                                {/* Active Background */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
                                            border: "1px solid rgba(139, 92, 246, 0.25)",
                                        }}
                                        transition={{ type: "spring", duration: 0.5 }}
                                    />
                                )}

                                {/* Hover Effect */}
                                {!isActive && isHovered && (
                                    <div
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.03)",
                                            border: "1px solid rgba(255, 255, 255, 0.05)",
                                        }}
                                    />
                                )}

                                <div className="relative z-10 flex items-center gap-4 w-full">
                                    <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${isActive
                                        ? 'text-violet-400'
                                        : 'text-gray-500 group-hover:text-gray-300'
                                        }`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className={`text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                                    ? 'text-white'
                                                    : 'text-gray-500 group-hover:text-gray-300'
                                                    }`}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Active Pill on Left */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-pill"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                                        style={{
                                            background: "linear-gradient(180deg, #8B5CF6 0%, #A855F7 100%)",
                                            boxShadow: "0 0 12px rgba(139, 92, 246, 0.6)",
                                        }}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            {/* <div className="px-3 py-4 border-t border-violet-500/10">
                <Link to="/interview">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
                        style={{
                            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                        }}
                    >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex-1"
                                >
                                    <p className="text-sm font-medium text-white">AI Interview</p>
                                    <p className="text-xs text-gray-500">Practice with AI</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </Link>
            </div> */}

            {/* User Section / Logout */}
            <div className="p-3 border-t border-violet-500/10">
                {user ? (
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 group transition-all"
                    >
                        <div className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 group-hover:text-red-400 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-sm font-medium text-gray-500 group-hover:text-red-400 whitespace-nowrap"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                ) : (
                    <Link to="/auth">
                        <div className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-violet-500/10 group transition-all">
                            <div className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 group-hover:text-violet-400">
                                <User className="w-5 h-5" />
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-sm font-medium text-gray-500 group-hover:text-violet-400 whitespace-nowrap"
                                    >
                                        Sign In
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </Link>
                )}
            </div>
        </motion.div>
    );
};
