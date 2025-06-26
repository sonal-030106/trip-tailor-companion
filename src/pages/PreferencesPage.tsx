
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const PreferencesPage = () => {
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const preferences = [
    {
      category: "Adventure",
      icon: "🏔️",
      color: "bg-red-100 border-red-200 hover:border-red-400",
      selectedColor: "bg-red-500 text-white",
      options: ["Hiking", "Trekking", "Rafting", "Safaris", "Rock Climbing", "Paragliding"]
    },
    {
      category: "Culture & History",
      icon: "🏛️",
      color: "bg-purple-100 border-purple-200 hover:border-purple-400",
      selectedColor: "bg-purple-500 text-white",
      options: ["Museums", "Heritage Sites", "Art Galleries", "Festivals", "Local Markets", "Traditional Shows"]
    },
    {
      category: "Nature",
      icon: "🌿",
      color: "bg-green-100 border-green-200 hover:border-green-400",
      selectedColor: "bg-green-500 text-white",
      options: ["National Parks", "Eco-tours", "Wildlife Sanctuaries", "Botanical Gardens", "Beaches", "Mountains"]
    },
    {
      category: "Shopping",
      icon: "🛍️",
      color: "bg-pink-100 border-pink-200 hover:border-pink-400",
      selectedColor: "bg-pink-500 text-white",
      options: ["Malls", "Local Bazaars", "Street Shopping", "Handicrafts", "Souvenirs", "Fashion Districts"]
    },
    {
      category: "Entertainment",
      icon: "🎭",
      color: "bg-blue-100 border-blue-200 hover:border-blue-400",
      selectedColor: "bg-blue-500 text-white",
      options: ["Concerts", "Shows", "Nightlife", "Casinos", "Theme Parks", "Water Parks"]
    },
    {
      category: "Religion/Spiritual",
      icon: "🕉️",
      color: "bg-orange-100 border-orange-200 hover:border-orange-400",
      selectedColor: "bg-orange-500 text-white",
      options: ["Temples", "Churches", "Monasteries", "Spiritual Retreats", "Meditation Centers", "Pilgrimages"]
    }
  ];

  const togglePreference = (option: string) => {
    setSelectedPreferences(prev => 
      prev.includes(option) 
        ? prev.filter(p => p !== option)
        : [...prev, option]
    );
  };

  const handleContinue = () => {
    navigate('/places');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">What interests you?</h1>
          <p className="text-gray-600 text-lg">Select your travel preferences to get personalized recommendations</p>
        </div>

        <div className="grid gap-8">
          {preferences.map((category) => (
            <Card key={category.category} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{category.icon}</div>
                  <h2 className="text-2xl font-bold text-gray-800">{category.category}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {category.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => togglePreference(option)}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedPreferences.includes(option)
                          ? category.selectedColor
                          : `${category.color} text-gray-700`
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="mb-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {selectedPreferences.length} preferences selected
            </Badge>
          </div>
          <Button
            onClick={handleContinue}
            disabled={selectedPreferences.length === 0}
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Find Places
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
