import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dna, LayoutDashboard, Target, BarChart3, User, LogOut, ChevronDown, Settings } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Dna },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/tasks", label: "Daily Tasks", icon: Target },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/profile", label: "Profile", icon: User },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
    navigate("/");
  };

  // Get user initials for avatar (prefer profile data from DB)
  const getUserInitials = () => {
    if (!user) return "U";
    const name = profile?.full_name || user.user_metadata?.full_name || user.email || "";
    if (name.includes("@")) {
      return name.charAt(0).toUpperCase();
    }
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
      : name.charAt(0).toUpperCase();
  };

  // Get user avatar URL (prefer profile data from DB)
  const getAvatarUrl = () => {
    return profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  };

  // Get display name (prefer profile data from DB)
  const getDisplayName = () => {
    return profile?.full_name || user?.user_metadata?.full_name || "User";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-msg-in ${
        scrolled ? "bg-[#050505]/95 border-b border-border backdrop-blur-md" : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Dna className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Skill<span className="text-primary">Genome</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "genome-ghost" : "ghost"}
                    size="sm"
                    className={`relative ${isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* CTA / Profile */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              /* Profile Dropdown */
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                >
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()!}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border-2 border-primary/50 object-cover"
                      loading="lazy"
                      decoding="async"
                      width={36}
                      height={36}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-primary/30">
                      {getUserInitials()}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileMenu ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileMenu(false)}
                      />

                      {/* Dropdown Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl rounded-xl border border-border shadow-xl z-50 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-border bg-muted/30">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground text-sm truncate">
                              {getDisplayName()}
                            </p>
                            {profile?.provider && profile.provider !== "email" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary capitalize">
                                {profile.provider}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm text-foreground"
                          >
                            <User className="w-4 h-4 text-muted-foreground" />
                            View Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm text-foreground"
                          >
                            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                            Dashboard
                          </Link>
                          <Link
                            to="/interview"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm text-foreground"
                          >
                            <Target className="w-4 h-4 text-muted-foreground" />
                            Interview Prep
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-border py-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-sm text-red-500"
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
            ) : (
              /* Login / Get Started buttons */
              <>
                <Link to="/auth">
                  <Button variant="genome-outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/build">
                  <Button variant="genome" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

