import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import PreferencesPage from "./pages/PreferencesPage";
import PlacesPage from "./pages/PlacesPage";
import ItineraryPage from "./pages/ItineraryPage";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
