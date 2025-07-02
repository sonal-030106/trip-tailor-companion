import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CardContent } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { CalendarDays, Train, Clock, MapPin } from "lucide-react";

interface JourneyDetailsProps {
  formData: {
    startDate: string;
    endDate: string;
    numberOfDays: string;
    destination: string;
    travelMethod: string;
  };
  setFormData: (updater: (prev: any) => any) => void;
}

export const JourneyDetails = ({ formData, setFormData }: JourneyDetailsProps) => {
  // Automatically update endDate when startDate or numberOfDays changes
  useEffect(() => {
    if (formData.startDate && formData.numberOfDays) {
      const start = new Date(formData.startDate);
      const days = parseInt(formData.numberOfDays, 10);
      if (!isNaN(start.getTime()) && !isNaN(days)) {
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1); // inclusive of start date
        const endDateStr = end.toISOString().split('T')[0];
        if (formData.endDate !== endDateStr) {
          setFormData(prev => ({ ...prev, endDate: endDateStr }));
        }
      }
    }
  }, [formData.startDate, formData.numberOfDays]);

  return (
    <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Destination Card - First */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-orange-500" />
              <Label className="text-base font-semibold">Destination</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-xs font-medium">Where do you want to go?</Label>
              <Input
                id="destination"
                type="text"
                placeholder="Enter destination city or country"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                className="border-2 focus:border-orange-300 transition-colors h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Travel Method Card - Right side of destination */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Train className="w-4 h-4 text-purple-500" />
              <Label className="text-base font-semibold">Travel Method</Label>
            </div>
            <RadioGroup 
              value={formData.travelMethod} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, travelMethod: value }))}
              className="grid grid-cols-2 gap-2"
            >
              {["Local Train/Metro", "Car", "Bus", "Cab", "Best Route"].map((method) => (
                <label
                  key={method}
                  htmlFor={method}
                  className={`flex items-center space-x-2 p-2 border rounded-lg hover:bg-purple-50 transition-colors cursor-pointer ${formData.travelMethod === method ? 'ring-2 ring-purple-400' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, travelMethod: method }))}
                >
                  <RadioGroupItem value={method} id={method} />
                  <span className="font-medium text-xs">{method}</span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Number of Days Card - Below destination */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-green-500" />
              <Label className="text-base font-semibold">Duration</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfDays" className="text-xs font-medium">Number of Days</Label>
              <Input
                id="numberOfDays"
                type="number"
                min="1"
                placeholder="Enter number of days"
                value={formData.numberOfDays}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfDays: e.target.value }))}
                className="border-2 focus:border-green-300 transition-colors h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Travel Dates Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <Label className="text-base font-semibold">Travel Dates</Label>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-xs font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border-2 focus:border-blue-300 transition-colors h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate" className="text-xs font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border-2 focus:border-blue-300 transition-colors h-8 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  );
}; 