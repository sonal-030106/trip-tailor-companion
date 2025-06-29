import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { DollarSign, Utensils, Users } from "lucide-react";

interface HotelDetailsProps {
  formData: {
    budget: string;
    mealPreferences: string[];
    companions: string;
  };
  setFormData: (updater: (prev: any) => any) => void;
}

export const HotelDetails = ({ formData, setFormData }: HotelDetailsProps) => {
  const handleMealPreferenceChange = (meal: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        mealPreferences: [...prev.mealPreferences, meal]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        mealPreferences: prev.mealPreferences.filter((m: string) => m !== meal)
      }));
    }
  };

  return (
    <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Hotel Budget Card */}
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-teal-500" />
              <Label className="text-base font-semibold">Hotel Budget</Label>
            </div>
            <RadioGroup 
              value={formData.budget} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-teal-50 transition-colors">
                <RadioGroupItem value="low" id="low" />
                <div className="flex flex-col">
                  <Label htmlFor="low" className="font-medium cursor-pointer text-sm">Low</Label>
                  <span className="text-xs text-muted-foreground">₹1,000 - ₹2,000 per day</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-teal-50 transition-colors">
                <RadioGroupItem value="medium" id="medium" />
                <div className="flex flex-col">
                  <Label htmlFor="medium" className="font-medium cursor-pointer text-sm">Medium</Label>
                  <span className="text-xs text-muted-foreground">₹2,000 - ₹4,000 per day</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-teal-50 transition-colors">
                <RadioGroupItem value="high" id="high" />
                <div className="flex flex-col">
                  <Label htmlFor="high" className="font-medium cursor-pointer text-sm">High</Label>
                  <span className="text-xs text-muted-foreground">₹8,000+ per day</span>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Meal Preferences Card */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-rose-500" />
              <Label className="text-base font-semibold">Meal Preferences</Label>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {["Veg", "Non-Veg", "Indian", "Mix"].map((meal) => (
                <div key={meal} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-rose-50 transition-colors">
                  <Checkbox
                    id={meal}
                    checked={formData.mealPreferences.includes(meal)}
                    onCheckedChange={(checked) => handleMealPreferenceChange(meal, checked as boolean)}
                  />
                  <Label htmlFor={meal} className="font-medium cursor-pointer text-sm">{meal}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Travel Companions Card */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-violet-500" />
              <Label className="text-base font-semibold">Travel Companions</Label>
            </div>
            <RadioGroup 
              value={formData.companions} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, companions: value }))}
              className="grid grid-cols-2 md:grid-cols-5 gap-3"
            >
              {["Solo", "Partner/Spouse", "Family with Kids", "Friends", "Business Colleagues"].map((companion) => (
                <div key={companion} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-violet-50 transition-colors">
                  <RadioGroupItem value={companion} id={companion} />
                  <Label htmlFor={companion} className="font-medium cursor-pointer text-xs">{companion}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  );
}; 