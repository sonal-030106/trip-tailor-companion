import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import TravelPlanningTabs from "./components/TravelPlanningTabs";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import PreferencesPage from "./pages/PreferencesPage";
import PlacesPage from "./pages/PlacesPage";
import ItineraryPage from "./pages/ItineraryPage";
import PackingPage from "./pages/PackingPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  
  // Show tabs only when user is in the questionnaire flow (not on home or login)
  const shouldShowTabs = !['/', '/login'].includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      <Header />
      {shouldShowTabs && <TravelPlanningTabs />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/packing" element={<PackingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white py-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <span className="font-bold text-lg">Trip Tailor Companion</span>
          <span className="text-sm opacity-80 mt-2 md:mt-0">&copy; {new Date().getFullYear()} All rights reserved.</span>
          <span className="text-sm opacity-80 mt-2 md:mt-0">Made with ❤️ for travelers</span>
        </div>
      </footer>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
