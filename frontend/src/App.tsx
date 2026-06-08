import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";
import { Layout } from "@/components/Layout";

// Lazily load routes to split the bundle
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Profile = lazy(() => import("./pages/Profile"));
const BuildGenome = lazy(() => import("./pages/BuildGenome"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Auth = lazy(() => import("./pages/Auth"));
const Interview = lazy(() => import("./pages/Interview"));
const TechnicalInterview = lazy(() => import("./pages/TechnicalInterview"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const TaskDetail = lazy(() => import("./pages/TaskDetail"));
const CodingSignals = lazy(() => import("./pages/CodingSignals"));
const MNCsInterview = lazy(() => import("./pages/MNCsInterview"));
const LearningRoadmap = lazy(() => import("./pages/LearningRoadmap"));
const PlacementGenome = lazy(() => import("./pages/PlacementGenome"));
const MockInterview = lazy(() => import("./pages/MockInterview"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Premium glassmorphic loading skeleton for route transitions
const RouteLoadingSkeleton = () => (
  <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center relative overflow-hidden">
    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
    <div className="relative z-10 flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />
        <div className="absolute inset-1 rounded-full border border-t-transparent border-r-cyan-400 border-b-transparent border-l-transparent animate-spin duration-700" style={{ animationDirection: 'reverse' }} />
        <div className="absolute inset-2 rounded-full bg-violet-500/10 backdrop-blur-sm border border-white/5 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium tracking-wide text-gray-400 animate-pulse">Initializing Genome Module...</p>
    </div>
  </div>
);

// Wrapper component to handle profile completion modal
const AppContent = () => {
  const { user, isProfileComplete, loading, profileLoading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Show modal when user is logged in but profile is incomplete OR not created yet
  useEffect(() => {
    // Wait for both auth and profile to be fully loaded before showing modal
    if (!loading && !profileLoading && user) {
      // Show modal if profile doesn't exist yet OR profile exists but not completed
      const shouldShowModal = !profile || !isProfileComplete;
      // Don't show modal on auth or complete-profile pages
      if (shouldShowModal && location.pathname !== "/auth" && location.pathname !== "/complete-profile") {
        setShowProfileModal(true);
      } else {
        setShowProfileModal(false);
      }
    } else {
      setShowProfileModal(false);
    }
  }, [user, isProfileComplete, loading, profileLoading, profile, location.pathname]);

  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    navigate("/complete-profile");
  };

  return (
    <>
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={handleCompleteProfile}
        userName={profile?.full_name?.split(" ")[0] || "there"}
      />
      <Layout>
        <Suspense fallback={<RouteLoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/build" element={<BuildGenome />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/interview/technical" element={<TechnicalInterview />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/coding-signals" element={<CodingSignals />} />
            <Route path="/mncs-interview" element={<MNCsInterview />} />
            <Route path="/technical-interview" element={<TechnicalInterview />} />
            <Route path="/learning-roadmap" element={<LearningRoadmap />} />
            <Route path="/placement-genome" element={<PlacementGenome />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
