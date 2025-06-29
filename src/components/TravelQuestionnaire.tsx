import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plane, Hotel, Briefcase, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JourneyDetails } from "./JourneyDetails";
import { HotelDetails } from "./HotelDetails";

export const TravelQuestionnaire = () => {
  const [activeSubTab, setActiveSubTab] = useState("journey");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(6);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [showUpdateOption, setShowUpdateOption] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    numberOfDays: "",
    destination: "",
    travelMethod: "",
    budget: "",
    mealPreferences: [] as string[],
    companions: "",
    packingCategories: [],
    packingItems: {},
    travelGoal: "",
    eveningPreference: "",
    travelPace: "",
    interests: "",
    dietaryRestrictions: ""
  });

  // Load existing data from sessionStorage on mount
  useEffect(() => {
    const safeJsonParse = (value) => {
      if (!value) return "";
      try {
        return JSON.parse(value);
      } catch (error) {
        // If parsing fails, return the value as is (it's likely a plain string)
        return value;
      }
    };

    const existingData = {
      destination: sessionStorage.getItem('destination') ? safeJsonParse(sessionStorage.getItem('destination')) : "",
      travelCompanion: sessionStorage.getItem('travelCompanion') ? safeJsonParse(sessionStorage.getItem('travelCompanion')) : "",
      transport: sessionStorage.getItem('transport') ? safeJsonParse(sessionStorage.getItem('transport')) : "",
      budget: sessionStorage.getItem('budget') ? safeJsonParse(sessionStorage.getItem('budget')) : "",
      days: sessionStorage.getItem('days') ? safeJsonParse(sessionStorage.getItem('days')) : "",
      startDate: sessionStorage.getItem('startDate') ? safeJsonParse(sessionStorage.getItem('startDate')) : "",
      endDate: sessionStorage.getItem('endDate') ? safeJsonParse(sessionStorage.getItem('endDate')) : "",
      foodOptions: sessionStorage.getItem('foodOptions') ? safeJsonParse(sessionStorage.getItem('foodOptions')) : [],
      packingCategories: sessionStorage.getItem('packingCategories') ? safeJsonParse(sessionStorage.getItem('packingCategories')) : [],
      packingItems: sessionStorage.getItem('packingItems') ? safeJsonParse(sessionStorage.getItem('packingItems')) : {},
      travelGoal: sessionStorage.getItem('travelGoal') ? safeJsonParse(sessionStorage.getItem('travelGoal')) : "",
      eveningPreference: sessionStorage.getItem('eveningPreference') ? safeJsonParse(sessionStorage.getItem('eveningPreference')) : "",
      travelPace: sessionStorage.getItem('travelPace') ? safeJsonParse(sessionStorage.getItem('travelPace')) : "",
      interests: sessionStorage.getItem('interests') ? safeJsonParse(sessionStorage.getItem('interests')) : "",
      dietaryRestrictions: sessionStorage.getItem('dietaryRestrictions') ? safeJsonParse(sessionStorage.getItem('dietaryRestrictions')) : ""
    };

    // Check if there's existing data
    if (existingData.destination) {
      setFormData({
        startDate: existingData.startDate || "",
        endDate: existingData.endDate || "",
        numberOfDays: existingData.days || "",
        destination: existingData.destination || "",
        travelMethod: existingData.transport || "",
        budget: existingData.budget || "",
        mealPreferences: existingData.foodOptions || [],
        companions: existingData.travelCompanion || "",
        packingCategories: existingData.packingCategories || [],
        packingItems: existingData.packingItems || {},
        travelGoal: existingData.travelGoal || "",
        eveningPreference: existingData.eveningPreference || "",
        travelPace: existingData.travelPace || "",
        interests: existingData.interests || "",
        dietaryRestrictions: existingData.dietaryRestrictions || ""
      });
      
      // Check if there are existing places/hotels in sessionStorage
      const existingPlaces = sessionStorage.getItem('categoryPlaces');
      const existingHotels = sessionStorage.getItem('hotelOptions');
      if (existingPlaces || existingHotels) {
        setShowUpdateOption(true);
      }
    }
  }, []);

  // Function to handle form data changes
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
    
    const safeJsonParse = (value) => {
      if (!value) return "";
      try {
        return JSON.parse(value);
      } catch (error) {
        // If parsing fails, return the value as is (it's likely a plain string)
        return value;
      }
    };
    
    // Check if there are existing places/hotels and if current data differs from stored data
    const existingData = {
      destination: sessionStorage.getItem('destination') ? safeJsonParse(sessionStorage.getItem('destination')) : "",
      travelCompanion: sessionStorage.getItem('travelCompanion') ? safeJsonParse(sessionStorage.getItem('travelCompanion')) : "",
      transport: sessionStorage.getItem('transport') ? safeJsonParse(sessionStorage.getItem('transport')) : "",
      budget: sessionStorage.getItem('budget') ? safeJsonParse(sessionStorage.getItem('budget')) : "",
      days: sessionStorage.getItem('days') ? safeJsonParse(sessionStorage.getItem('days')) : "",
      startDate: sessionStorage.getItem('startDate') ? safeJsonParse(sessionStorage.getItem('startDate')) : "",
      endDate: sessionStorage.getItem('endDate') ? safeJsonParse(sessionStorage.getItem('endDate')) : "",
      foodOptions: sessionStorage.getItem('foodOptions') ? safeJsonParse(sessionStorage.getItem('foodOptions')) : [],
      packingCategories: sessionStorage.getItem('packingCategories') ? safeJsonParse(sessionStorage.getItem('packingCategories')) : [],
      packingItems: sessionStorage.getItem('packingItems') ? safeJsonParse(sessionStorage.getItem('packingItems')) : {},
      travelGoal: sessionStorage.getItem('travelGoal') ? safeJsonParse(sessionStorage.getItem('travelGoal')) : "",
      eveningPreference: sessionStorage.getItem('eveningPreference') ? safeJsonParse(sessionStorage.getItem('eveningPreference')) : "",
      travelPace: sessionStorage.getItem('travelPace') ? safeJsonParse(sessionStorage.getItem('travelPace')) : "",
      interests: sessionStorage.getItem('interests') ? safeJsonParse(sessionStorage.getItem('interests')) : "",
      dietaryRestrictions: sessionStorage.getItem('dietaryRestrictions') ? safeJsonParse(sessionStorage.getItem('dietaryRestrictions')) : ""
    };

    const hasExistingData = existingData.destination || existingData.travelCompanion || existingData.transport || 
                           existingData.budget || existingData.days || existingData.startDate || 
                           existingData.endDate || existingData.foodOptions.length > 0 ||
                           existingData.packingCategories.length > 0 || existingData.packingItems.length > 0 ||
                           existingData.travelGoal || existingData.eveningPreference || existingData.travelPace ||
                           existingData.interests || existingData.dietaryRestrictions;

    if (hasExistingData) {
      const hasChanges = 
        newFormData.destination !== existingData.destination ||
        newFormData.travelMethod !== existingData.transport ||
        newFormData.budget !== existingData.budget ||
        newFormData.numberOfDays !== existingData.days ||
        newFormData.startDate !== existingData.startDate ||
        newFormData.endDate !== existingData.endDate ||
        JSON.stringify(newFormData.mealPreferences) !== JSON.stringify(existingData.foodOptions) ||
        newFormData.companions !== existingData.travelCompanion ||
        JSON.stringify(newFormData.packingCategories) !== JSON.stringify(existingData.packingCategories) ||
        JSON.stringify(newFormData.packingItems) !== JSON.stringify(existingData.packingItems) ||
        newFormData.travelGoal !== existingData.travelGoal ||
        newFormData.eveningPreference !== existingData.eveningPreference ||
        newFormData.travelPace !== existingData.travelPace ||
        newFormData.interests !== existingData.interests ||
        newFormData.dietaryRestrictions !== existingData.dietaryRestrictions;

      setHasChanges(hasChanges);
      setShowUpdateOption(true);
    }
  };

  // Loading component with progress and time estimation
  const LoadingSpinner = () => {
    useEffect(() => {
      if (!loadingStartTime) return;

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - loadingStartTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate progress percentage
        const progressPercent = Math.min(95, (elapsed / estimatedTime) * 100);
        setProgress(progressPercent);
      }, 1000);

      return () => clearInterval(interval);
    }, [loadingStartTime, estimatedTime]);

    const remainingTime = Math.max(0, estimatedTime - elapsedTime);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Animated Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isUpdating ? 'Updating Your Preferences' : 'Processing Your Preferences'}
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-6">
            {isUpdating 
              ? 'Regenerating recommendations based on your new preferences'
              : 'Analyzing your travel preferences and preparing recommendations'
            }
          </p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </div>
          </div>
          
          {/* Time Information */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Elapsed time:</span>
              <span className="font-semibold">{elapsedTime}s</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated remaining:</span>
              <span className="font-semibold">{remainingTime}s</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total estimated:</span>
              <span className="font-semibold">{estimatedTime}s</span>
            </div>
          </div>
          
          {/* Status Messages */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              {!isDataProcessed && progress < 25 && (isUpdating ? "🔄 Updating preferences..." : "🔍 Analyzing your travel preferences...")}
              {!isDataProcessed && progress >= 25 && progress < 50 && (isUpdating ? "📝 Regenerating destination details..." : "📝 Processing destination details...")}
              {!isDataProcessed && progress >= 50 && progress < 75 && (isUpdating ? "✨ Updating recommendations..." : "✨ Preparing recommendations...")}
              {!isDataProcessed && progress >= 75 && progress < 95 && (isUpdating ? "🎯 Finalizing updates..." : "🎯 Finalizing your setup...")}
              {!isDataProcessed && progress >= 95 && (isUpdating ? "🎉 Almost ready! Redirecting..." : "🎉 Almost ready! Redirecting to preferences...")}
              {isDataProcessed && "✅ Data ready! Preparing your results..."}
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4 text-xs text-gray-500">
            💡 Tip: We're customizing your experience based on your preferences
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    console.log("Form submitted:", formData);
    
    // Validate required fields from Journey section only
    const requiredJourneyFields = {
      destination: formData.destination,
      numberOfDays: formData.numberOfDays,
      startDate: formData.startDate,
      endDate: formData.endDate,
      travelMethod: formData.travelMethod
    };

    const missingJourneyFields = Object.entries(requiredJourneyFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingJourneyFields.length > 0) {
      alert(`Please fill in all Journey details: ${missingJourneyFields.join(', ')}`);
      return;
    }

    // Start loading
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setElapsedTime(0);
    setProgress(0);
    setIsDataProcessed(false);

    // Set default values for Hotel details if not provided
    const defaultBudget = formData.budget || "medium";
    const defaultCompanions = formData.companions || "Solo";
    const defaultMealPreferences = formData.mealPreferences.length > 0 ? formData.mealPreferences : ["Mix"];

    // Save all form data to sessionStorage
    const allFormData = {
      destination: formData.destination,
      travelCompanion: defaultCompanions,
      transport: formData.travelMethod,
      budget: defaultBudget,
      days: formData.numberOfDays,
      startDate: formData.startDate,
      endDate: formData.endDate,
      foodOptions: defaultMealPreferences,
      packingCategories: formData.packingCategories || [],
      packingItems: formData.packingItems || {},
      travelGoal: formData.travelGoal || "",
      eveningPreference: formData.eveningPreference || "",
      travelPace: formData.travelPace || "",
      interests: formData.interests || "",
      dietaryRestrictions: formData.dietaryRestrictions || ""
    };

    // Persist all formData fields to sessionStorage
    Object.entries(allFormData).forEach(([key, value]) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    });
    
    // Clear existing places and hotels to force regeneration
    sessionStorage.removeItem('categoryPlaces');
    sessionStorage.removeItem('subcategoryPlaces');
    sessionStorage.removeItem('hotelOptions');
    
    // Reset itinerary generated flag since questionnaire is being updated
    sessionStorage.setItem('itineraryGenerated', 'false');
    
    // Simulate processing time
    setTimeout(() => {
      setIsLoading(false);
      setLoadingStartTime(null);
      setIsDataProcessed(true);
      
      // Navigate to preferences page
      navigate('/preferences', {
        state: allFormData
      });
    }, 3000); // 3 seconds loading time
  };

  // Function to handle update (regenerate places/hotels)
  const handleUpdate = async () => {
    console.log("Updating with new preferences:", formData);
    
    // Validate required fields from Journey section only
    const requiredJourneyFields = {
      destination: formData.destination,
      numberOfDays: formData.numberOfDays,
      startDate: formData.startDate,
      endDate: formData.endDate,
      travelMethod: formData.travelMethod
    };

    const missingJourneyFields = Object.entries(requiredJourneyFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingJourneyFields.length > 0) {
      alert(`Please fill in all Journey details: ${missingJourneyFields.join(', ')}`);
      return;
    }

    // Start loading
    setIsLoading(true);
    setIsUpdating(true);
    setLoadingStartTime(Date.now());
    setElapsedTime(0);
    setProgress(0);
    setIsDataProcessed(false);

    // Set default values for Hotel details if not provided
    const defaultBudget = formData.budget || "medium";
    const defaultCompanions = formData.companions || "Solo";
    const defaultMealPreferences = formData.mealPreferences.length > 0 ? formData.mealPreferences : ["Mix"];

    // Save all form data to sessionStorage
    const allFormData = {
      destination: formData.destination,
      travelCompanion: defaultCompanions,
      transport: formData.travelMethod,
      budget: defaultBudget,
      days: formData.numberOfDays,
      startDate: formData.startDate,
      endDate: formData.endDate,
      foodOptions: defaultMealPreferences,
      packingCategories: formData.packingCategories || [],
      packingItems: formData.packingItems || {},
      travelGoal: formData.travelGoal || "",
      eveningPreference: formData.eveningPreference || "",
      travelPace: formData.travelPace || "",
      interests: formData.interests || "",
      dietaryRestrictions: formData.dietaryRestrictions || ""
    };

    // Persist all formData fields to sessionStorage
    Object.entries(allFormData).forEach(([key, value]) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    });
    
    // Clear existing places and hotels to force regeneration
    sessionStorage.removeItem('categoryPlaces');
    sessionStorage.removeItem('subcategoryPlaces');
    sessionStorage.removeItem('hotelOptions');
    
    // Reset itinerary generated flag since questionnaire is being updated
    sessionStorage.setItem('itineraryGenerated', 'false');
    
    // Simulate processing time
    setTimeout(() => {
      setIsLoading(false);
      setIsUpdating(false);
      setLoadingStartTime(null);
      setIsDataProcessed(true);
      
      // Navigate to preferences page
      navigate('/preferences', {
        state: allFormData
      });
    }, 3000); // 3 seconds loading time
  };

  // Function to continue without updating (use existing places/hotels)
  const handleContinue = () => {
    // Set default values for Hotel details if not provided
    const defaultBudget = formData.budget || "medium";
    const defaultCompanions = formData.companions || "Solo";
    const defaultMealPreferences = formData.mealPreferences.length > 0 ? formData.mealPreferences : ["Mix"];

    // Save all form data to sessionStorage
    const allFormData = {
      destination: formData.destination,
      travelCompanion: defaultCompanions,
      transport: formData.travelMethod,
      budget: defaultBudget,
      days: formData.numberOfDays,
      startDate: formData.startDate,
      endDate: formData.endDate,
      foodOptions: defaultMealPreferences,
      packingCategories: formData.packingCategories || [],
      packingItems: formData.packingItems || {},
      travelGoal: formData.travelGoal || "",
      eveningPreference: formData.eveningPreference || "",
      travelPace: formData.travelPace || "",
      interests: formData.interests || "",
      dietaryRestrictions: formData.dietaryRestrictions || ""
    };

    // Persist all formData fields to sessionStorage
    Object.entries(allFormData).forEach(([key, value]) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    });
    
    // Navigate to preferences page without clearing existing places/hotels
    navigate('/preferences', {
      state: allFormData
    });
  };

  // Check if form is complete (for button styling/validation)
  const isFormComplete = () => {
    // Only check Journey section fields for button activation
    return formData.destination && 
           formData.numberOfDays && 
           formData.startDate && 
           formData.endDate && 
           formData.travelMethod;
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="text-center pb-4 flex-shrink-0">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Travel Preferences
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-1">
          Tell us about your ideal trip and we'll create the perfect itinerary
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-white/80 backdrop-blur-sm shadow-md border-0 h-10 flex-shrink-0">
            <TabsTrigger 
              value="journey" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all duration-300 text-sm"
            >
              <Plane className="w-3 h-3" />
              Journey
            </TabsTrigger>
            <TabsTrigger 
              value="hotel"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all duration-300 text-sm"
            >
              <Hotel className="w-3 h-3" />
              Hotel
            </TabsTrigger>
            <TabsTrigger 
              value="packing"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all duration-300 text-sm"
            >
              <Briefcase className="w-3 h-3" />
              Packing
            </TabsTrigger>
            <TabsTrigger 
              value="questions"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium transition-all duration-300 text-sm"
            >
              <CheckSquare className="w-3 h-3" />
              Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journey" className="animate-fade-in flex-1 mt-0">
            <JourneyDetails formData={formData} setFormData={handleFormDataChange} />
          </TabsContent>

          <TabsContent value="hotel" className="animate-fade-in flex-1 mt-0">
            <HotelDetails formData={formData} setFormData={handleFormDataChange} />
          </TabsContent>

          <TabsContent value="packing" className="animate-fade-in flex-1 mt-0">
            <PackingDetails formData={formData} setFormData={handleFormDataChange} />
          </TabsContent>

          <TabsContent value="questions" className="animate-fade-in flex-1 mt-0">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Questions</h3>
                <p className="text-sm text-gray-600">
                  Help us personalize your experience better
                </p>
              </div>
              
              <Card className="border-2 hover:border-blue-300 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What's your primary travel goal for this trip?
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.travelGoal || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, travelGoal: e.target.value }))}
                      >
                        <option value="">Select your goal</option>
                        <option value="relaxation">Relaxation & Wellness</option>
                        <option value="adventure">Adventure & Exploration</option>
                        <option value="culture">Cultural Experience</option>
                        <option value="business">Business/Work</option>
                        <option value="romance">Romance & Couples</option>
                        <option value="family">Family Time</option>
                        <option value="photography">Photography</option>
                        <option value="food">Food & Culinary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How do you prefer to spend your evenings?
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.eveningPreference || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, eveningPreference: e.target.value }))}
                      >
                        <option value="">Select preference</option>
                        <option value="nightlife">Nightlife & Entertainment</option>
                        <option value="dining">Fine Dining</option>
                        <option value="quiet">Quiet & Relaxing</option>
                        <option value="cultural">Cultural Shows</option>
                        <option value="shopping">Shopping</option>
                        <option value="outdoor">Outdoor Activities</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What's your preferred pace of travel?
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.travelPace || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, travelPace: e.target.value }))}
                      >
                        <option value="">Select pace</option>
                        <option value="fast">Fast-paced (See everything)</option>
                        <option value="moderate">Moderate (Balanced)</option>
                        <option value="slow">Slow-paced (Relaxed)</option>
                        <option value="flexible">Flexible (Go with the flow)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Any specific interests or hobbies you'd like to explore?
                      </label>
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="e.g., Photography, Yoga, Local crafts, History..."
                        value={formData.interests || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Any dietary restrictions or preferences?
                      </label>
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="2"
                        placeholder="e.g., Vegetarian, Gluten-free, Allergies..."
                        value={formData.dietaryRestrictions || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 flex-shrink-0">
          {showUpdateOption && hasChanges ? (
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-yellow-800 font-semibold text-sm">Changes Detected</span>
                </div>
                <p className="text-yellow-700 text-xs">
                  You've made changes to your preferences. Would you like to update your recommendations?
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleUpdate}
                  disabled={!isFormComplete()}
                  className={`flex-1 font-semibold py-2 text-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isFormComplete() 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🔄 Update Categories
                </Button>
                <Button 
                  onClick={handleContinue}
                  disabled={!isFormComplete()}
                  className={`flex-1 font-semibold py-2 text-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isFormComplete() 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ➡️ Continue with Existing
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isFormComplete()}
              className={`w-full font-semibold py-2 text-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
                isFormComplete() 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Preferences
            </Button>
          )}
        </div>
      </CardContent>
      
      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

// Packing Details Component
const PackingDetails = ({ formData, setFormData }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});

  const packingCategories = [
    {
      name: "Clothing & Accessories",
      icon: "👕",
      items: [
        "T-shirts/Shirts",
        "Pants/Jeans",
        "Dresses/Skirts",
        "Underwear",
        "Socks",
        "Pajamas",
        "Swimwear",
        "Jacket/Sweater",
        "Shoes (Comfortable)",
        "Shoes (Formal)",
        "Hat/Cap",
        "Sunglasses",
        "Jewelry",
        "Watch"
      ]
    },
    {
      name: "Toiletries & Personal Care",
      icon: "🧴",
      items: [
        "Toothbrush & Toothpaste",
        "Shampoo & Conditioner",
        "Soap/Body Wash",
        "Deodorant",
        "Hair Brush/Comb",
        "Hair Products",
        "Skincare Products",
        "Makeup",
        "Razor & Shaving Cream",
        "Nail Clippers",
        "Contact Lenses & Solution",
        "Glasses",
        "Sunscreen",
        "Insect Repellent",
        "First Aid Kit"
      ]
    },
    {
      name: "Electronics & Gadgets",
      icon: "📱",
      items: [
        "Phone & Charger",
        "Power Bank",
        "Camera",
        "Laptop & Charger",
        "Tablet",
        "Headphones/Earphones",
        "Universal Adapter",
        "USB Cables",
        "Memory Cards",
        "Portable Speaker",
        "E-reader"
      ]
    },
    {
      name: "Travel Essentials",
      icon: "🎒",
      items: [
        "Passport/ID",
        "Travel Documents",
        "Credit/Debit Cards",
        "Cash",
        "Travel Insurance",
        "Maps/Guidebooks",
        "Notebook & Pen",
        "Water Bottle",
        "Snacks",
        "Umbrella/Raincoat",
        "Travel Pillow",
        "Eye Mask",
        "Ear Plugs",
        "Travel Lock",
        "Laundry Bag"
      ]
    },
    {
      name: "Health & Wellness",
      icon: "💊",
      items: [
        "Prescription Medications",
        "Pain Relievers",
        "Allergy Medicine",
        "Motion Sickness Pills",
        "Vitamins",
        "Hand Sanitizer",
        "Face Masks",
        "Tissues",
        "Lip Balm",
        "Eye Drops",
        "Band-Aids",
        "Thermometer"
      ]
    },
    {
      name: "Entertainment & Activities",
      icon: "🎮",
      items: [
        "Books/Magazines",
        "Playing Cards",
        "Travel Games",
        "Music Playlist",
        "Movies/TV Shows",
        "Journal",
        "Art Supplies",
        "Fitness Gear",
        "Yoga Mat",
        "Beach Towel",
        "Beach Toys"
      ]
    }
  ];

  // Load existing packing data from sessionStorage
  useEffect(() => {
    const savedCategories = sessionStorage.getItem('packingCategories');
    const savedItems = sessionStorage.getItem('packingItems');
    
    if (savedCategories) {
      setSelectedCategories(JSON.parse(savedCategories));
    }
    if (savedItems) {
      setSelectedItems(JSON.parse(savedItems));
    }
  }, []);

  // Save packing data to sessionStorage and update form data
  useEffect(() => {
    sessionStorage.setItem('packingCategories', JSON.stringify(selectedCategories));
    sessionStorage.setItem('packingItems', JSON.stringify(selectedItems));
    
    // Update form data with packing information
    setFormData(prev => ({
      ...prev,
      packingCategories: selectedCategories,
      packingItems: selectedItems
    }));
  }, [selectedCategories, selectedItems, setFormData]);

  const toggleCategory = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleItem = (categoryName, itemName) => {
    setSelectedItems(prev => ({
      ...prev,
      [categoryName]: prev[categoryName]?.includes(itemName)
        ? prev[categoryName].filter(item => item !== itemName)
        : [...(prev[categoryName] || []), itemName]
    }));
  };

  const selectAllInCategory = (categoryName) => {
    const category = packingCategories.find(cat => cat.name === categoryName);
    if (category) {
      setSelectedItems(prev => ({
        ...prev,
        [categoryName]: category.items
      }));
    }
  };

  const deselectAllInCategory = (categoryName) => {
    setSelectedItems(prev => ({
      ...prev,
      [categoryName]: []
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Packing Checklist</h3>
        <p className="text-sm text-gray-600">
          Select the categories and items you'd like to pack for your trip
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packingCategories.map((category) => (
          <Card key={category.name} className="border-2 hover:border-blue-300 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                </div>
                <Checkbox
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => toggleCategory(category.name)}
                  className="w-4 h-4"
                />
              </div>
            </CardHeader>
            
            {selectedCategories.includes(category.name) && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectAllInCategory(category.name)}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deselectAllInCategory(category.name)}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {category.items.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedItems[category.name]?.includes(item) || false}
                          onChange={() => toggleItem(category.name, item)}
                          className="w-3 h-3"
                        />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      {selectedCategories.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-semibold text-blue-800 mb-2">Packing Summary</h4>
            <div className="text-sm text-blue-700">
              <p>Selected Categories: {selectedCategories.length}</p>
              <p>Total Items: {Object.values(selectedItems).flat().length}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 