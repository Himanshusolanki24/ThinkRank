import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle resize to determine mobile state
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Sidebar */}
            <Sidebar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* Main Content Area */}
            <main
                className="flex-1 relative transition-all duration-300 ease-in-out"
                style={{
                    marginLeft: isMobile ? 0 : (isExpanded ? 240 : 80)
                }}
            >
                <DashboardHeader onMobileMenuClick={() => setIsMobileOpen(true)} />
                {children}
            </main>

            {/* Mobile Sidebar Overlay */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </div>
    );
};
