import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users, DollarSign, Clock, ArrowRight } from "lucide-react";
import { format, addDays } from "date-fns";

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: "",
    travelCompanion: "",
    transport: "",
    budget: "",
    days: "",
    startDate: null as Date | null,
    foodOptions: [] as string[],
    placesPerDay: ""
  });
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const totalSteps = 8;

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.destination.length < 1) {
        setLocationSuggestions([]);
        return;
      }
      const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(formData.destination)}&limit=5&apiKey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      setLocationSuggestions(data.features || []);
    };
    fetchSuggestions();
  }, [formData.destination]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const calculatedEndDate = formData.startDate && formData.days ? addDays(formData.startDate, parseInt(formData.days, 10)) : null;

  const handleLocationSuggestionClick = (suggestion: any) => {
    setFormData({ ...formData, destination: suggestion.properties.formatted });
    setShowLocationSuggestions(false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/preferences', {
        state: {
          destination: formData.destination,
          days: formData.days,
          placesPerDay: formData.placesPerDay,
          startDate: formData.startDate,
          endDate: calculatedEndDate
        }
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.destination;
      case 2:
        return !!formData.travelCompanion;
      case 3:
        return !!formData.transport;
      case 4:
        return !!formData.budget;
      case 5:
        return !!formData.days;
      case 6:
        return !!formData.placesPerDay;
      case 7:
        return !!formData.startDate && !!formData.days;
      case 8:
        return formData.foodOptions.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Where would you like to go?</h2>
              <p className="text-gray-600">Tell us your dream destination</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <Input
                  id="destination"
                  placeholder="e.g., Mumbai, Goa, Kerala..."
                  value={formData.destination}
                  onChange={e => { setFormData(prev => ({ ...prev, destination: e.target.value })); setShowLocationSuggestions(true); }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  className="text-lg py-3"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <ul
                    className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto"
                    onMouseDown={e => e.preventDefault()}
                  >
                    {locationSuggestions.map((s, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, destination: s.properties.formatted }));
                          setShowLocationSuggestions(false);
                        }}
                        className="p-3 cursor-pointer hover:bg-blue-100 text-gray-800"
                      >
                        {s.properties.formatted}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Who's joining you?</h2>
              <p className="text-gray-600">Select your travel companion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: "solo", label: "🧑 Solo Travel" },
                { value: "couple", label: "👫 Couple" },
                { value: "family", label: "👨‍👩‍👧‍👦 Family" },
                { value: "friends", label: "🧑‍🤝‍🧑 Friends" },
                { value: "group", label: "👥 Group" },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, travelCompanion: option.value }))}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all text-lg font-medium w-full justify-center
                    ${formData.travelCompanion === option.value ? 'bg-green-100 border-green-500 text-green-800' : 'hover:bg-green-50 border-gray-300 text-gray-700'}`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚗</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">How will you travel?</h2>
              <p className="text-gray-600">Choose your preferred transport</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: "flight", label: "✈️ Flight" },
                { value: "train", label: "🚆 Train" },
                { value: "bus", label: "🚌 Bus" },
                { value: "car", label: "🚗 Car/Self Drive" },
                { value: "bike", label: "🏍️ Bike" },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, transport: option.value }))}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all text-lg font-medium w-full justify-center
                    ${formData.transport === option.value ? 'bg-orange-100 border-orange-500 text-orange-800' : 'hover:bg-orange-50 border-gray-300 text-gray-700'}`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">What's your budget?</h2>
              <p className="text-gray-600">Select your budget range</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: "low", label: "Low Budget", desc: "₹5,000 - ₹15,000", icon: "💸" },
                { value: "medium", label: "Medium Budget", desc: "₹15,000 - ₹35,000", icon: "💰" },
                { value: "high", label: "High Budget", desc: "₹35,000+", icon: "🤑" }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, budget: option.value }))}
                  className={`flex flex-col items-center space-y-2 p-4 border rounded-lg cursor-pointer transition-all text-lg font-medium w-full justify-center
                    ${formData.budget === option.value ? 'bg-yellow-100 border-yellow-500 text-yellow-800' : 'hover:bg-yellow-50 border-gray-300 text-gray-700'}`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span>{option.label}</span>
                  <span className="text-sm text-gray-500">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Clock className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">How many days?</h2>
              <p className="text-gray-600">Enter number of days for your trip</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                placeholder="e.g., 5"
                value={formData.days}
                onChange={(e) => setFormData({...formData, days: e.target.value})}
                className="text-lg py-3"
                min="1"
                max="4"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">How many places per day?</h2>
              <p className="text-gray-600">How many places do you want to visit each day?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, placesPerDay: String(num) }))}
                  className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all text-lg font-medium w-full
                    ${formData.placesPerDay === String(num) ? 'bg-orange-100 border-orange-500 text-orange-800' : 'hover:bg-orange-50 border-gray-300 text-gray-700'}`}
                >
                  {num} Place{num > 1 ? 's' : ''} per Day
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CalendarIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">When do you want to travel?</h2>
              <p className="text-gray-600">Select your start date. The end date will be calculated automatically.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({...formData, startDate: date})}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Calculated End Date</Label>
                <div className="p-3 border rounded-lg bg-gray-100 text-gray-700 w-full text-left font-normal">
                   <CalendarIcon className="mr-2 h-4 w-4 inline-block" />
                   {calculatedEndDate ? format(calculatedEndDate, "PPP") : "End date"}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Food Preferences</h2>
              <p className="text-gray-600">What type of food do you prefer? (Select all that apply)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: "vegetarian", label: "🥦 Vegetarian" },
                { value: "jain", label: "🧘 Jain Food" },
                { value: "non-vegetarian", label: "🍗 Non-Vegetarian" },
                { value: "indian", label: "🍛 Indian Cuisine" },
                { value: "chinese", label: "🥡 Chinese Cuisine" },
                { value: "mixed", label: "🍽️ Mixed (All types)" },
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-orange-50">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={formData.foodOptions.includes(option.value)}
                    onChange={e => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, foodOptions: [...prev.foodOptions, option.value] }));
                      } else {
                        setFormData(prev => ({ ...prev, foodOptions: prev.foodOptions.filter(f => f !== option.value) }));
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-orange-500"
                  />
                  <span className="text-lg">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderStep()}
            
            <div className="flex justify-between pt-8">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={currentStep === 1}
                className="px-6"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className={`bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-6 ${currentStep === 1 && formData.destination ? 'border-4 border-black shadow-none' : ''}`}
                disabled={!isStepValid()}
              >
                {currentStep === totalSteps ? "Continue to Preferences" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionnairePage;
