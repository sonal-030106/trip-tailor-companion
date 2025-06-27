import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plane, Star } from "lucide-react";

const allCategories = [
  {
    category: "Adventure",
    icon: "\uD83D\uDDFB\uFE0F",
    color: "bg-red-100 border-red-200 hover:border-red-400",
    selectedColor: "bg-red-500 text-white",
    options: [
      { name: "Hiking", icon: "\uD83E\uDD7E" },
      { name: "Trekking", icon: "\u26F0\uFE0F" },
      { name: "Rafting", icon: "\uD83D\uDEA3" },
      { name: "Safaris", icon: "\uD83E\uDD81" },
      { name: "Rock Climbing", icon: "\uD83E\uDDE7" },
      { name: "Paragliding", icon: "\uD83E\uDE82" }
    ]
  },
  {
    category: "Culture & History",
    icon: "\uD83C\uDFDB\uFE0F",
    color: "bg-purple-100 border-purple-200 hover:border-purple-400",
    selectedColor: "bg-purple-500 text-white",
    options: [
      { name: "Museums", icon: "\uD83C\uDFAA" },
      { name: "Heritage Sites", icon: "\uD83C\uDFE0" },
      { name: "Art Galleries", icon: "\uD83D\uDDBC\uFE0F" },
      { name: "Festivals", icon: "\uD83C\uDF89" },
      { name: "Local Markets", icon: "\uD83D\uDED2" },
      { name: "Traditional Shows", icon: "\uD83C\uDFAD" }
    ]
  },
  {
    category: "Nature",
    icon: "\uD83C\uDF3F",
    color: "bg-green-100 border-green-200 hover:border-green-400",
    selectedColor: "bg-green-500 text-white",
    options: [
      { name: "National Parks", icon: "\uD83C\uDF32" },
      { name: "Botanical Gardens", icon: "\uD83C\uDF38" },
      { name: "Wildlife Sanctuaries", icon: "\uD83E\uDD93" },
      { name: "Beaches", icon: "\uD83C\uDFD6\uFE0F" },
      { name: "Mountains", icon: "\uD83C\uDFD4\uFE0F" },
      { name: "Eco-tours", icon: "\uD83C\uDF31" }
    ]
  },
  {
    category: "Religion & Spirituality",
    icon: "\uD83D\uDD49\uFE0F",
    color: "bg-orange-100 border-orange-200 hover:border-orange-400",
    selectedColor: "bg-orange-500 text-white",
    options: [
      { name: "Temples", icon: "\uD83D\uDE94" },
      { name: "Churches", icon: "\u26EA" },
      { name: "Monasteries", icon: "\uD83C\uDFE1" },
      { name: "Pilgrimages", icon: "\uD83D\uDEB6\u200D\u2642\uFE0F" },
      { name: "Spiritual Retreats", icon: "\uD83E\uDDD8\u200D\u2640\uFE0F" },
      { name: "Meditation Centers", icon: "\uD83E\uDDD8\u200D\u2642\uFE0F" }
    ]
  },
  {
    category: "Local Events",
    icon: "\uD83C\uDFB6",
    color: "bg-pink-100 border-pink-200 hover:border-pink-400",
    selectedColor: "bg-pink-500 text-white",
    options: [
      { name: "Concerts", icon: "\uD83C\uDFB5" },
      { name: "Shows", icon: "\uD83C\uDFAC" },
      { name: "Cultural Performances", icon: "\uD83C\uDFAD" },
      { name: "Festivals", icon: "\uD83C\uDF89" },
      { name: "Exhibitions", icon: "\uD83C\uDFA8" }
    ]
  },
  {
    category: "Tourist Attractions",
    icon: "\uD83C\uDF0D",
    color: "bg-blue-100 border-blue-200 hover:border-blue-400",
    selectedColor: "bg-blue-500 text-white",
    options: [
      { name: "Landmarks", icon: "\uD83C\uDFEF" },
      { name: "Monuments", icon: "\uD83D\uDDFF" },
      { name: "Famous Streets", icon: "\uD83C\uDFD7\uFE0F" },
      { name: "Iconic Buildings", icon: "\uD83C\uDFE2" },
      { name: "Viewpoints", icon: "\uD83D\uDDFD" }
    ]
  }
];

const PreferencesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.destination;
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('selectedCategories');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string') as string[];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('selectedPreferences');
    return saved ? JSON.parse(saved) : [];
  });
  const [attendEvents, setAttendEvents] = useState<null | boolean>(() => {
    const saved = sessionStorage.getItem('attendEvents');
    return saved === null ? null : JSON.parse(saved);
  });
  const [mode, setMode] = useState<'attractions' | 'interests' | null>(null);

  useEffect(() => {
    sessionStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);
  useEffect(() => {
    sessionStorage.setItem('selectedPreferences', JSON.stringify(selectedPreferences));
  }, [selectedPreferences]);
  useEffect(() => {
    sessionStorage.setItem('attendEvents', JSON.stringify(attendEvents));
  }, [attendEvents]);

  useEffect(() => {
    // Clean up sessionStorage if selectedCategories contains any non-string values
    const saved = sessionStorage.getItem('selectedCategories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item: any) => typeof item === 'string');
          if (filtered.length !== parsed.length) {
            sessionStorage.setItem('selectedCategories', JSON.stringify(filtered));
          }
        }
      } catch {}
    }
  }, []);

  const setCategoriesSafe = (cats: any[]) => {
    const filtered = Array.isArray(cats) ? cats.filter((c) => typeof c === 'string') : [];
    setSelectedCategories(filtered);
    if (filtered.length !== cats.length) {
      console.error('Attempted to set selectedCategories to a non-string array:', cats);
    }
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => {
      const newCats = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat];
      setTimeout(() => setCategoriesSafe(newCats), 0); // ensure safe set
      return newCats;
    });
    // If unselecting a category, also remove its subcategories from preferences
    if (selectedCategories.includes(cat)) {
      const subOptions = allCategories.find(c => c.category === cat)?.options.map(o => o.name) || [];
      setSelectedPreferences(prev => prev.filter(p => !subOptions.includes(p)));
    }
  };

  const togglePreference = (option: string) => {
    setSelectedPreferences(prev =>
      prev.includes(option)
        ? prev.filter(p => p !== option)
        : [...prev, option]
    );
  };

  const handleContinue = () => {
    if (mode === 'attractions') {
      navigate('/places', {
        state: {
          destination,
          visitAttractions: true,
          categories: [],
          preferences: []
        }
      });
      return;
    }

    navigate('/places', {
      state: {
        destination,
        categories: selectedCategories,
        preferences: selectedPreferences,
        attendEvents,
        visitAttractions: false // This path is for interests, not general attractions
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">How would you like to plan your trip?</h1>
          <p className="text-gray-600 text-lg">Choose an option to get recommendations for {destination}.</p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
          <button
            onClick={() => setMode('attractions')}
            className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${mode === 'attractions' ? 'bg-blue-100 border-blue-400' : 'bg-white hover:border-blue-300'}`}
          >
            <div className="flex items-center mb-2">
              <Star className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Popular Tourist Attractions</h2>
            </div>
            <p className="text-gray-600">Get a quick list of the most famous landmarks and tourist spots.</p>
          </button>
          <button
            onClick={() => setMode('interests')}
            className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${mode === 'interests' ? 'bg-green-100 border-green-400' : 'bg-white hover:border-green-300'}`}
          >
            <div className="flex items-center mb-2">
              <Plane className="h-6 w-6 text-green-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-800">Personalized Recommendations</h2>
            </div>
            <p className="text-gray-600">Choose your interests for a customized list of places to visit.</p>
          </button>
        </div>

        {mode === 'interests' && (
          <>
            {/* Remove All Categories button */}
            {selectedCategories.length > 0 && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setCategoriesSafe([])}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold"
                >
                  Remove All Categories
                </button>
              </div>
            )}
            {/* Category selection */}
            <div className="mb-8 flex flex-wrap gap-4 justify-center">
              {allCategories.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryToggle(cat.category)}
                  className={`flex items-center px-5 py-3 rounded-full border-2 text-lg font-semibold transition-all duration-200 gap-2
                ${selectedCategories.includes(cat.category) ? cat.selectedColor : `${cat.color} text-gray-700`}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Subcategory selection for selected categories */}
            <div className="grid gap-8">
              {allCategories
                .filter(cat => selectedCategories.includes(cat.category))
                .map((category) => (
                  <Card key={category.category} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="text-3xl mr-3">{category.icon}</div>
                        <h2 className="text-2xl font-bold text-gray-800">{category.category}</h2>
                        <button
                          className="ml-auto text-sm underline"
                          type="button"
                          onClick={() => {
                            // Select all subcategories for this category
                            const all = category.options.map(o => o.name);
                            const allSelected = all.every(opt => selectedPreferences.includes(opt));
                            setSelectedPreferences(prev =>
                              allSelected
                                ? prev.filter(p => !all.includes(p))
                                : [...prev, ...all.filter(opt => !prev.includes(opt))]
                            );
                          }}
                        >
                          {category.options.every(opt => selectedPreferences.includes(opt)) ? 'Unselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {category.options.map((option) => (
                          <button
                            key={option.name}
                            onClick={() => togglePreference(option.name)}
                            className={`p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedPreferences.includes(option.name)
                                ? category.selectedColor
                                : `${category.color} text-gray-700`
                            }`}
                          >
                            <span className="mr-2 text-lg align-middle">{option.icon}</span>
                            {option.name}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </>
        )}

        {mode && (
          <div className="mt-8 text-center">
            {mode === 'interests' && (
              <>
                <div className="mb-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {selectedCategories.length} categories, {selectedPreferences.length} preferences selected
                  </Badge>
                </div>

                {/* Local Events Question */}
                <div className="mb-6 text-left max-w-2xl mx-auto bg-pink-50 border-l-4 border-pink-300 rounded-lg p-6">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🎟️</span>
                    <span className="font-bold text-lg">Local Events</span>
                  </div>
                  <div className="mb-2 text-pink-900">Would you like to attend local events during your visit? This includes concerts, shows, and cultural performances.</div>
                  <div className="flex gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setAttendEvents(true)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-lg font-medium transition-all
                  ${attendEvents === true ? 'bg-pink-500 text-white border-pink-500' : 'bg-white border-pink-300 hover:bg-pink-100 text-pink-700'}`}
                    >
                      <span>👍 Yes, I'm interested</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendEvents(false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-lg font-medium transition-all
                  ${attendEvents === false ? 'bg-pink-500 text-white border-pink-500' : 'bg-white border-pink-300 hover:bg-pink-100 text-pink-700'}`}
                    >
                      <span>❌ No, thanks</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleContinue}
              disabled={mode === 'interests' && (selectedCategories.length === 0 || attendEvents === null)}
              className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Generate My {destination} Guide
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesPage;
