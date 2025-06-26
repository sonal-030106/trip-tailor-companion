
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users, DollarSign, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

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
    endDate: null as Date | null,
    foodOptions: "",
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/preferences');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
              <Input
                id="destination"
                placeholder="e.g., Mumbai, Goa, Kerala..."
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                className="text-lg py-3"
              />
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
            <Select value={formData.travelCompanion} onValueChange={(value) => setFormData({...formData, travelCompanion: value})}>
              <SelectTrigger className="text-lg py-3">
                <SelectValue placeholder="Choose your travel companion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo Travel</SelectItem>
                <SelectItem value="couple">Couple</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={formData.transport} onValueChange={(value) => setFormData({...formData, transport: value})}>
              <SelectTrigger className="text-lg py-3">
                <SelectValue placeholder="Select transport mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flight">Flight</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="car">Car/Self Drive</SelectItem>
                <SelectItem value="bike">Bike</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: "low", label: "Low Budget", desc: "₹5,000 - ₹15,000", color: "border-green-200 hover:border-green-400" },
                { value: "medium", label: "Medium Budget", desc: "₹15,000 - ₹35,000", color: "border-blue-200 hover:border-blue-400" },
                { value: "high", label: "High Budget", desc: "₹35,000+", color: "border-purple-200 hover:border-purple-400" }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.budget === option.value ? 'border-blue-500 bg-blue-50' : option.color
                  }`}
                  onClick={() => setFormData({...formData, budget: option.value})}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
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
                max="30"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CalendarIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">When do you want to travel?</h2>
              <p className="text-gray-600">Select your travel dates</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({...formData, endDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Food Preferences</h2>
              <p className="text-gray-600">What type of food do you prefer?</p>
            </div>
            <Select value={formData.foodOptions} onValueChange={(value) => setFormData({...formData, foodOptions: value})}>
              <SelectTrigger className="text-lg py-3">
                <SelectValue placeholder="Select food preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="jain">Jain Food</SelectItem>
                <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="indian">Indian Cuisine</SelectItem>
                <SelectItem value="chinese">Chinese Cuisine</SelectItem>
                <SelectItem value="mixed">Mixed (All types)</SelectItem>
              </SelectContent>
            </Select>
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
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-6"
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
