import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MapPin, Settings, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TravelPlanningTabs = () => {
  const [activeTab, setActiveTab] = useState("questionnaire");
  const [showWarning, setShowWarning] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [dataUpdateTimestamp, setDataUpdateTimestamp] = useState<number>(Date.now());
  const [lastTabData, setLastTabData] = useState<{[key: string]: any}>({});
  const navigate = useNavigate();
  const location = useLocation();

  // Check completion status
  const isQuestionnaireCompleted = () => {
    const destination = sessionStorage.getItem('destination');
    const travelCompanion = sessionStorage.getItem('travelCompanion');
    const transport = sessionStorage.getItem('transport');
    const budget = sessionStorage.getItem('budget');
    const days = sessionStorage.getItem('days');
    const startDate = sessionStorage.getItem('startDate');
    const foodOptions = sessionStorage.getItem('foodOptions');
    
    return destination && travelCompanion && transport && budget && days && startDate && foodOptions;
  };

  const isCategoriesCompleted = () => {
    const selectedPlaces = sessionStorage.getItem('selectedPlaces');
    return selectedPlaces && JSON.parse(selectedPlaces).length > 0;
  };

  const isItineraryGenerated = () => {
    // Check if itinerary has been generated (you might want to add a flag in sessionStorage)
    return sessionStorage.getItem('itineraryGenerated') === 'true';
  };

  // Function to check if data has been updated
  const hasDataChanged = (tabName: string) => {
    const currentData = getCurrentTabData(tabName);
    const lastData = lastTabData[tabName];
    
    if (!lastData) return true; // First time loading
    
    // Compare relevant data for each tab
    if (tabName === 'categories') {
      const currentPlaces = currentData.selectedPlaces || [];
      const lastPlaces = lastData.selectedPlaces || [];
      const currentHotels = currentData.selectedHotels || [];
      const lastHotels = lastData.selectedHotels || [];
      const currentDestination = currentData.destination;
      const lastDestination = lastData.destination;
      
      // Check if journey details changed (destination, travel companion, etc.)
      const journeyDetailsChanged = currentDestination !== lastDestination;
      
      // Check if places changed
      const placesChanged = JSON.stringify(currentPlaces) !== JSON.stringify(lastPlaces);
      
      // Check if hotels changed
      const hotelsChanged = JSON.stringify(currentHotels) !== JSON.stringify(lastHotels);
      
      // If journey details changed, reload everything
      if (journeyDetailsChanged) {
        return true;
      }
      
      // If only hotels changed, don't reload categories (hotels are handled separately)
      if (hotelsChanged && !placesChanged && !journeyDetailsChanged) {
        return false;
      }
      
      // If places changed, reload categories
      return placesChanged;
    }
    
    if (tabName === 'itinerary') {
      const currentItinerary = currentData.itineraryGenerated || false;
      const lastItinerary = lastData.itineraryGenerated || false;
      const currentPlaces = currentData.selectedPlaces || [];
      const lastPlaces = lastData.selectedPlaces || [];
      
      // Check if places changed (which would require new itinerary)
      const placesChanged = JSON.stringify(currentPlaces) !== JSON.stringify(lastPlaces);
      
      return currentItinerary !== lastItinerary || placesChanged;
    }
    
    return false;
  };

  // Function to check if this is the first time loading
  const isFirstTimeLoading = (tabName: string) => {
    if (tabName === 'categories') {
      return !sessionStorage.getItem('lastJourneyDetails');
    }
    
    if (tabName === 'itinerary') {
      return !sessionStorage.getItem('itineraryDataHash');
    }
    
    return true;
  };

  // Function to get current tab data
  const getCurrentTabData = (tabName: string) => {
    if (tabName === 'categories') {
      return {
        selectedPlaces: JSON.parse(sessionStorage.getItem('selectedPlaces') || '[]'),
        selectedHotels: JSON.parse(sessionStorage.getItem('selectedHotels') || '[]'),
        destination: sessionStorage.getItem('destination'),
        travelCompanion: sessionStorage.getItem('travelCompanion'),
        transport: sessionStorage.getItem('transport'),
        budget: sessionStorage.getItem('budget'),
        days: sessionStorage.getItem('days'),
        startDate: sessionStorage.getItem('startDate'),
        foodOptions: sessionStorage.getItem('foodOptions')
      };
    }
    
    if (tabName === 'itinerary') {
      return {
        itineraryGenerated: sessionStorage.getItem('itineraryGenerated') === 'true',
        selectedPlaces: JSON.parse(sessionStorage.getItem('selectedPlaces') || '[]'),
        destination: sessionStorage.getItem('destination')
      };
    }
    
    return {};
  };

  // Update active tab based on current route
  useEffect(() => {
    if (location.pathname === '/questionnaire' || location.pathname === '/') {
      setActiveTab('questionnaire');
    } else if (location.pathname === '/preferences') {
      setActiveTab('categories');
    } else if (location.pathname === '/itinerary') {
      setActiveTab('itinerary');
    }
  }, [location.pathname]);

  // Monitor data changes and update timestamp
  useEffect(() => {
    const checkForUpdates = () => {
      const currentTimestamp = Date.now();
      let hasUpdates = false;
      
      // Check if any relevant data has changed
      const currentPlaces = sessionStorage.getItem('selectedPlaces');
      const currentHotels = sessionStorage.getItem('selectedHotels');
      const currentItinerary = sessionStorage.getItem('itineraryGenerated');
      const currentDestination = sessionStorage.getItem('destination');
      const currentTravelCompanion = sessionStorage.getItem('travelCompanion');
      const currentTransport = sessionStorage.getItem('transport');
      const currentBudget = sessionStorage.getItem('budget');
      const currentDays = sessionStorage.getItem('days');
      const currentStartDate = sessionStorage.getItem('startDate');
      const currentFoodOptions = sessionStorage.getItem('foodOptions');
      
      // Check for journey details changes
      const journeyDetailsChanged = 
        currentDestination !== lastTabData.categories?.destination ||
        currentTravelCompanion !== lastTabData.categories?.travelCompanion ||
        currentTransport !== lastTabData.categories?.transport ||
        currentBudget !== lastTabData.categories?.budget ||
        currentDays !== lastTabData.categories?.days ||
        currentStartDate !== lastTabData.categories?.startDate ||
        currentFoodOptions !== lastTabData.categories?.foodOptions;
      
      // Check for places changes
      const placesChanged = currentPlaces !== lastTabData.categories?.selectedPlaces;
      
      // Check for hotels changes
      const hotelsChanged = currentHotels !== lastTabData.categories?.selectedHotels;
      
      // Check for itinerary changes
      const itineraryChanged = currentItinerary !== lastTabData.itinerary?.itineraryGenerated;
      
      if (journeyDetailsChanged || placesChanged || hotelsChanged || itineraryChanged) {
        hasUpdates = true;
      }
      
      if (hasUpdates) {
        setDataUpdateTimestamp(currentTimestamp);
        // Update last tab data
        setLastTabData({
          categories: getCurrentTabData('categories'),
          itinerary: getCurrentTabData('itinerary')
        });
      }
    };

    // Check for updates every 2 seconds
    const interval = setInterval(checkForUpdates, 2000);
    return () => clearInterval(interval);
  }, [lastTabData]);

  const handleTabChange = (newTab: string) => {
    // If trying to go to a later step without completing previous steps
    if (newTab === 'categories' && !isQuestionnaireCompleted()) {
      setPendingTab(newTab);
      setShowWarning(true);
      return;
    }
    
    if (newTab === 'itinerary' && (!isQuestionnaireCompleted() || !isCategoriesCompleted())) {
      setPendingTab(newTab);
      setShowWarning(true);
      return;
    }

    // Check if this is the first time loading
    const isFirstTime = isFirstTimeLoading(newTab);
    
    // Check if data has changed for the target tab
    if (newTab === 'categories' && hasDataChanged('categories')) {
      if (isFirstTime) {
        console.log("First time loading categories");
      } else {
        console.log("Categories data changed (subsequent update)");
      }
      // Data has changed, navigate normally
      navigate('/preferences');
    } else if (newTab === 'itinerary' && hasDataChanged('itinerary')) {
      if (isFirstTime) {
        console.log("First time loading itinerary");
      } else {
        console.log("Itinerary data changed (subsequent update)");
      }
      // Data has changed, navigate normally
      navigate('/itinerary');
    } else if (newTab === 'questionnaire') {
      // Always allow navigation to questionnaire
      navigate('/questionnaire');
    } else {
      // Data hasn't changed, just update the active tab without reloading
      setActiveTab(newTab);
      // Navigate without triggering a full reload
      if (newTab === 'categories') {
        navigate('/preferences', { replace: true });
      } else if (newTab === 'itinerary') {
        navigate('/itinerary', { replace: true });
      }
    }
  };

  const handleWarningConfirm = () => {
    if (pendingTab === 'categories') {
      toast({
        title: "Complete Questionnaire First",
        description: "Please complete the questionnaire before selecting categories.",
        variant: "destructive",
      });
    } else if (pendingTab === 'itinerary') {
      toast({
        title: "Complete Previous Steps",
        description: "Please complete the questionnaire and select places before generating itinerary.",
        variant: "destructive",
      });
    }
    setShowWarning(false);
    setPendingTab(null);
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
    setPendingTab(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-0 h-14">
          <TabsTrigger 
            value="questionnaire" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all duration-300"
          >
            <MapPin className="w-4 h-4" />
            Questionnaire
            {isQuestionnaireCompleted() && (
              <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="categories"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all duration-300"
            disabled={!isQuestionnaireCompleted()}
          >
            <Settings className="w-4 h-4" />
            Categories
            {isCategoriesCompleted() && (
              <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="itinerary"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all duration-300"
            disabled={!isQuestionnaireCompleted() || !isCategoriesCompleted()}
          >
            <Calendar className="w-4 h-4" />
            Itinerary
            {isItineraryGenerated() && (
              <div className="w-2 h-2 bg-green-500 rounded-full ml-1"></div>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Warning Dialog */}
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Complete Previous Steps
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingTab === 'categories' && "Please complete the questionnaire before selecting categories."}
                {pendingTab === 'itinerary' && "Please complete the questionnaire and select places before generating itinerary."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleWarningCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleWarningConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Tabs>
    </div>
  );
};

export default TravelPlanningTabs; 