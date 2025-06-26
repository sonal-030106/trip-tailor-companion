
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import PreferencesPage from "./pages/PreferencesPage";
import PlacesPage from "./pages/PlacesPage";
import ItineraryPage from "./pages/ItineraryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
