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
            {['Low', 'Medium', 'High'].map((budget, idx) => (
              <label key={budget} htmlFor={`hotel-budget-${budget}`} className="block cursor-pointer">
                <div className={`rounded-xl border p-4 mb-4 flex items-center gap-4 transition-all duration-200 ${formData.budget === budget.toLowerCase() ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}> 
                  <input
                    type="radio"
                    id={`hotel-budget-${budget}`}
                    name="hotel-budget"
                    value={budget.toLowerCase()}
                    checked={formData.budget === budget.toLowerCase()}
                    onChange={() => setFormData((prev: any) => ({ ...prev, budget: budget.toLowerCase() }))}
                    className="form-radio h-5 w-5 text-green-600 focus:ring-green-500 cursor-pointer"
                    style={{ accentColor: '#22c55e' }}
                  />
                  <div>
                    <div className="font-semibold text-lg text-gray-800">{budget}</div>
                    <div className="text-gray-500 text-sm">
                      {budget === 'Low' && '₹1,000 - ₹2,000 per day'}
                      {budget === 'Medium' && '₹2,000 - ₹4,000 per day'}
                      {budget === 'High' && '₹8,000+ per day'}
                    </div>
                  </div>
                </div>
              </label>
            ))}
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
                <label key={meal} htmlFor={`meal-pref-${meal}`} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-rose-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id={`meal-pref-${meal}`}
                    checked={formData.mealPreferences.includes(meal)}
                    onChange={(e) => handleMealPreferenceChange(meal, e.target.checked)}
                    className="form-checkbox h-5 w-5 text-rose-500 focus:ring-rose-400 cursor-pointer"
                    style={{ accentColor: '#f43f5e' }}
                  />
                  <span className="font-medium cursor-pointer text-sm">{meal}</span>
                </label>
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