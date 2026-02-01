import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Bell,
    ChevronDown,
    Settings,
    LogOut,
    User,
    Menu,
    Sparkles,
    Command
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
    onMobileMenuClick?: () => void;
}

export const DashboardHeader = ({ onMobileMenuClick }: DashboardHeaderProps) => {
    const location = useLocation();
    const { user, profile, signOut } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Get page title based on path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/dashboard") return "Dashboard";
        if (path === "/analytics") return "Analytics";
        if (path === "/tasks") return "Daily Tasks";
        if (path === "/profile") return "Profile";
        if (path === "/settings") return "Settings";
        if (path === "/interview") return "AI Interview";
        return "Skill Genome";
    };

    return (
        <header
            className={`sticky top-0 z-30 flex items-center justify-between px-6 py-4 transition-all duration-300 ${scrolled
                ? "bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.05]"
                : "bg-transparent"
                }`}
        >
            {/* Left: Page Title / Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMobileMenuClick}
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <motion.h1
                    key={location.pathname}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-bold text-white capitalize"
                >
                    {getPageTitle()}
                </motion.h1>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search skills, tasks, or interviews..."
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:bg-white/[0.05] focus:border-violet-500/30 transition-all"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium text-gray-400">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-4">
                {/* AI Interview CTA */}
                <Link to="/interview" className="hidden sm:block">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 hover:from-violet-600/20 hover:to-purple-600/20 text-violet-300 border border-violet-500/20 rounded-xl"
                    >
                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                        AI Interview
                    </Button>
                </Link>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0A0A0F]" />
                </button>

                {/* Separator */}
                <div className="w-px h-8 bg-white/[0.1]" />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/[0.05] transition-colors"
                    >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center border border-white/10 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-white/80" />
                            )}
                        </div>
                        <div className="hidden lg:block text-left mr-1">
                            <p className="text-sm font-medium text-white leading-none mb-1">
                                {profile?.username || profile?.full_name?.split(' ')[0] || "User"}
                            </p>
                            <p className="text-[10px] text-gray-400 leading-none">
                                {profile?.streak_count || 0} Day Streak
                            </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-64 bg-[#0F0F16] border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/[0.05]">
                                        <p className="font-medium text-white">{profile?.full_name || "User"}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>

                                    <div className="p-2">
                                        <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                                                <User className="w-4 h-4" />
                                                Profile
                                            </button>
                                        </Link>
                                        <Link to="/settings" onClick={() => setShowProfileMenu(false)}>
                                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </button>
                                        </Link>
                                    </div>

                                    <div className="p-2 border-t border-white/[0.05]">
                                        <button
                                            onClick={() => { signOut(); setShowProfileMenu(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};
