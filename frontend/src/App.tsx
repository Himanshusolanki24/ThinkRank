import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import BuildGenome from "./pages/BuildGenome";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import Interview from "./pages/Interview";
import TechnicalInterview from "./pages/TechnicalInterview";
import InterviewOS from "./pages/InterviewOS";
import CompleteProfile from "./pages/CompleteProfile";
import TaskDetail from "./pages/TaskDetail";
import CodingSignals from "./pages/CodingSignals";
import MNCsInterview from "./pages/MNCsInterview";
import LearningRoadmap from "./pages/LearningRoadmap";
import PlacementGenome from "./pages/PlacementGenome";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/build" element={<BuildGenome />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/interview/technical" element={<TechnicalInterview />} />
          <Route path="/interview-os" element={<InterviewOS />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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

