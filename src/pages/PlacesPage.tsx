import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Ticket, Users, ArrowLeft, CheckCircle, Circle } from "lucide-react";
import HotelPage from './HotelPage';

// Helper to deduplicate places by name
function dedupePlaces(arr) {
  const seen = new Set();
  return arr.filter((p) => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });
}

const PLACES_BATCH_SIZE = 5;

interface Place {
    name: string;
    description: string;
    timing?: string;
    ticket?: string;
    who_can_visit?: string;
    image_url?: string;
    // Event-specific fields
    date_time?: string;
    venue?: string;
    category?: string;
    highlights?: string;
    ticket_info?: string;
}

const PlacesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { destination, categories = [], preferences = [], visitAttractions, startDate, endDate, placesPerDay, days } = location.state || {};
  const [placesByCategory, setPlacesByCategory] = useState<Record<string, { places: Place[]; showAll: boolean; allLoaded: boolean; loading: boolean }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Track how many places are loaded for each category
  const [loadedCount, setLoadedCount] = useState<{ [cat: string]: number }>({});
  const [touristAttractions, setTouristAttractions] = useState<Record<string, Place[]>>({});
  const [allAttractions, setAllAttractions] = useState<Place[]>([]);
  const [showAllAttractions, setShowAllAttractions] = useState(false);
  const [activeTab, setActiveTab] = useState<'places' | 'events' | 'hotels'>('places');
  const [events, setEvents] = useState<Place[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(5);
  const attendEvents = location.state?.attendEvents;
  const [selectedItems, setSelectedItems] = useState<{ name: string; type: 'place' | 'event' }[]>([]);
  const [hotelState, setHotelState] = useState({
    hotels: [],
    filters: { budget: '', companion: '', food: '' },
    loading: false,
    error: '',
    lastSearched: false
  });
  const [selectedHotel, setSelectedHotel] = useState(null);
  // For demo, get foodOptions, transport, travelCompanion from location.state (should be passed from Questionnaire/Preferences)
  const foodOptions = location.state?.foodOptions || [];
  const transport = location.state?.transport || '';
  const travelCompanion = location.state?.travelCompanion || '';

  // Helper to get top 3 places for a category
  const getVisiblePlaces = (cat: string) => {
    const entry = placesByCategory[cat];
    if (!entry) return [];
    return entry.showAll ? entry.places : entry.places.slice(0, 3);
  };

  // On mount, initialize empty state for each category (no fetch)
  useEffect(() => {
    if (!destination) return;
    setLoading(true);
    setError("");
    const newPlaces: any = {};
    for (const cat of categories) {
      newPlaces[cat] = { places: [], showAll: false, allLoaded: false, loading: false };
    }
    setPlacesByCategory(newPlaces);
    setLoadedCount({});
    setTouristAttractions({});
    setAllAttractions([]);
    setShowAllAttractions(false);
    setActiveTab('places');
    setEvents([]);
    setEventsLoaded(5);
    setLoading(false);
    // Map of main category to its subcategories
    const subMap: Record<string, string[]> = {
      "Adventure": ["Hiking", "Trekking", "Rafting", "Safaris", "Rock Climbing", "Paragliding"],
      "Culture & History": ["Museums", "Heritage Sites", "Art Galleries", "Festivals", "Local Markets", "Traditional Shows"],
      "Nature": ["National Parks", "Botanical Gardens", "Wildlife Sanctuaries", "Beaches", "Mountains", "Eco-tours"],
      "Religion & Spirituality": ["Temples", "Churches", "Monasteries", "Pilgrimages", "Spiritual Retreats", "Meditation Centers"],
      "Local Events": ["Concerts", "Shows", "Cultural Performances", "Festivals", "Exhibitions"],
      "Tourist Attractions": ["Landmarks", "Monuments", "Famous Streets", "Iconic Buildings", "Viewpoints"]
    };
    const fetchInitial = async () => {
      // If visitAttractions is true, fetch top 15 tourist attractions/landmarks for the destination ONCE
      if (visitAttractions) {
        try {
          const prompt = `List the top 10 most famous tourist attractions or landmarks in ${destination}. For each, provide a short description (1-2 lines), timing (e.g., "9 AM - 5 PM"), ticket price (e.g., "$25" or "Free"), who can visit (e.g., "All ages"), and a relevant image URL. Respond ONLY with a valid JSON array of objects with 'name', 'description', 'timing', 'ticket', 'who_can_visit', and 'image_url' fields. Do not include any explanation, comments, or extra text.`;
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: "You are a helpful travel assistant." },
                { role: "user", content: prompt }
              ]
            })
          });
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || "";
          console.log("Full AI response for tourist attractions:", content);
          let parsed: Place[] = [];
          try {
            parsed = JSON.parse(content);
          } catch {
            const firstBracket = content.indexOf('[');
            const lastBracket = content.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              const jsonString = content.substring(firstBracket, lastBracket + 1);
              try {
                parsed = JSON.parse(jsonString);
              } catch {
                console.error("Failed to parse extracted JSON for tourist attractions. Original content:", content, "Extracted:", jsonString);
                setError("Sorry, we couldn't load the tourist attractions. Please try again.");
                setLoading(false);
                return;
              }
            } else {
              console.error("No valid JSON found in AI response for tourist attractions. Content:", content);
              setError("Sorry, we couldn't load the tourist attractions. Please try again.");
              setLoading(false);
              return;
            }
          }
          setAllAttractions(parsed);
          // If no categories selected, just show the top 15 as a single section
          if (!categories || categories.length === 0) {
            setTouristAttractions({});
            setLoading(false);
            return;
          }
          // For each main category, filter up to 3 relevant attractions
          const newTourist: any = {};
          for (const cat of categories) {
            // Simple keyword match: category name or subcategory in name/description
            const keywords = [cat, ...(subMap[cat] || [])].map(k => k.toLowerCase());
            const matches = parsed.filter(place =>
              keywords.some(kw =>
                place.name.toLowerCase().includes(kw) ||
                place.description.toLowerCase().includes(kw)
              )
            ).slice(0, 3);
            if (matches.length > 0) {
              newTourist[cat] = matches;
            }
          }
          setTouristAttractions(newTourist);
          setLoading(false);
          return;
        } catch (err) {
          setLoading(false);
          return;
        }
      }
      const newLoaded: any = {};
      for (const cat of categories) {
        const selectedSubs = preferences.filter((pref) => subMap[cat]?.includes(pref));
        let merged: Place[] = [];
        if (selectedSubs.length > 0) {
          for (const sub of selectedSubs) {
            try {
              const prompt = `List ${PLACES_BATCH_SIZE} top places in ${destination} for the interest: ${sub}. For each, provide a short description (1-2 lines), timing (e.g., "Best at sunset"), ticket price (e.g., "$15" or "Free"), who can visit (e.g., "All ages"), and a relevant image URL. Respond ONLY with a valid JSON array of objects with 'name', 'description', 'timing', 'ticket', 'who_can_visit', and 'image_url' fields. Do not include any explanation, comments, or extra text.`;
              const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [
                    { role: "system", content: "You are a helpful travel assistant." },
                    { role: "user", content: prompt }
                  ]
                })
              });
              const data = await res.json();
              const content = data.choices?.[0]?.message?.content || "";
              console.log(`AI Response (Interest: ${sub}):`, content);
              let parsed: Place[] = [];
              try {
                parsed = JSON.parse(content);
              } catch {
                const match = content.match(/\[.*\]/s);
                if (match) {
                  try {
                    parsed = JSON.parse(match[0]);
                  } catch {
                    console.error("Failed to parse extracted JSON for interest:", sub, "Original content:", content, "Extracted:", match[0]);
                    setError("Sorry, we couldn't load the places (invalid JSON from AI). Please try again later or try a different category.");
                    setLoading(false);
                    return;
                  }
                } else {
                  console.error("No valid JSON found in AI response for interest:", sub, "Content:", content);
                  setError("Sorry, we couldn't load the places (no valid JSON in AI response). Please try again later or try a different category.");
                  setLoading(false);
                  return;
                }
              }
              merged = merged.concat(parsed);
            } catch (err) {
              setError("Failed to fetch places. Please check your network or try again.");
            }
          }
        } else {
          try {
            const prompt = `List ${PLACES_BATCH_SIZE} most famous or top tourist attractions in ${destination} for the category: ${cat}. For each, provide a short description (1-2 lines), timing (e.g., "9 AM - 5 PM"), ticket price (e.g., "$25" or "Free"), who can visit (e.g., "All ages"), and a relevant image URL. Respond ONLY with a valid JSON array of objects with 'name', 'description', 'timing', 'ticket', 'who_can_visit', and 'image_url' fields. Do not include any explanation, comments, or extra text.`;
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [
                  { role: "system", content: "You are a helpful travel assistant." },
                  { role: "user", content: prompt }
                ]
              })
            });
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content || "";
            console.log(`AI Response (Category: ${cat}):`, content);
            let parsed: Place[] = [];
            try {
              parsed = JSON.parse(content);
            } catch {
              const match = content.match(/\[.*\]/s);
              if (match) {
                try {
                  parsed = JSON.parse(match[0]);
                } catch {
                  console.error("Failed to parse extracted JSON for category:", cat, "Original content:", content, "Extracted:", match[0]);
                  setError("Sorry, we couldn't load the places (invalid JSON from AI). Please try again later or try a different category.");
                  setLoading(false);
                  return;
                }
              } else {
                console.error("No valid JSON found in AI response for category:", cat, "Content:", content);
                setError("Sorry, we couldn't load the places (no valid JSON in AI response). Please try again later or try a different category.");
                setLoading(false);
                return;
              }
            }
            merged = merged.concat(parsed);
          } catch (err) {
            setError("Failed to fetch places. Please check your network or try again.");
          }
        }
        merged = dedupePlaces(merged).slice(0, 5); // dedupe and take top 5
        newPlaces[cat] = { places: merged, showAll: false, allLoaded: merged.length < PLACES_BATCH_SIZE, loading: false };
        newLoaded[cat] = merged.length;
      }
      setPlacesByCategory(newPlaces);
      setLoadedCount(newLoaded);
      setLoading(false);
      // Do NOT fetch events anymore
    };
    fetchInitial();
    // eslint-disable-next-line
  }, [destination, categories, preferences, visitAttractions, attendEvents, startDate, endDate]);

  // Fetch places for a category when user clicks Show More
  const fetchPlacesForCategory = async (cat: string) => {
    setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: true } }));
    const subMap: Record<string, string[]> = {
      "Adventure": ["Hiking", "Trekking", "Rafting", "Safaris", "Rock Climbing", "Paragliding"],
      "Culture & History": ["Museums", "Heritage Sites", "Art Galleries", "Festivals", "Local Markets", "Traditional Shows"],
      "Nature": ["National Parks", "Botanical Gardens", "Wildlife Sanctuaries", "Beaches", "Mountains", "Eco-tours"],
      "Religion & Spirituality": ["Temples", "Churches", "Monasteries", "Pilgrimages", "Spiritual Retreats", "Meditation Centers"],
      "Local Events": ["Concerts", "Shows", "Cultural Performances", "Festivals", "Exhibitions"],
      "Tourist Attractions": ["Landmarks", "Monuments", "Famous Streets", "Iconic Buildings", "Viewpoints"]
    };
    const selectedSubs = preferences.filter((pref) => subMap[cat]?.includes(pref));
    let merged: Place[] = [];
    if (selectedSubs.length > 0) {
      for (const sub of selectedSubs) {
        try {
          const prompt = `List ${PLACES_BATCH_SIZE} top places in ${destination} for the interest: ${sub}. For each, provide a short description (1-2 lines), timing (e.g., "Best at sunset"), ticket price (e.g., "$15" or "Free"), who can visit (e.g., "All ages"), and a relevant image URL. Respond ONLY with a valid JSON array of objects with 'name', 'description', 'timing', 'ticket', 'who_can_visit', and 'image_url' fields. Do not include any explanation, comments, or extra text.`;
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                { role: "system", content: "You are a helpful travel assistant." },
                { role: "user", content: prompt }
              ]
            })
          });
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || "";
          let parsed: Place[] = [];
          try {
            parsed = JSON.parse(content);
          } catch {
            const match = content.match(/\[.*\]/s);
            if (match) {
              try {
                parsed = JSON.parse(match[0]);
              } catch {
                setError("Sorry, we couldn't load the places (invalid JSON from AI). Please try again later or try a different category.");
                setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: false } }));
                return;
              }
            } else {
              setError("Sorry, we couldn't load the places (no valid JSON in AI response). Please try again later or try a different category.");
              setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: false } }));
              return;
            }
          }
          merged = merged.concat(parsed);
        } catch (err) {
          setError("Failed to fetch places. Please check your network or try again.");
        }
      }
    } else {
      try {
        const prompt = `List ${PLACES_BATCH_SIZE} most famous or top tourist attractions in ${destination} for the category: ${cat}. For each, provide a short description (1-2 lines), timing (e.g., "9 AM - 5 PM"), ticket price (e.g., "$25" or "Free"), who can visit (e.g., "All ages"), and a relevant image URL. Respond ONLY with a valid JSON array of objects with 'name', 'description', 'timing', 'ticket', 'who_can_visit', and 'image_url' fields. Do not include any explanation, comments, or extra text.`;
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a helpful travel assistant." },
              { role: "user", content: prompt }
            ]
          })
        });
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        let parsed: Place[] = [];
        try {
          parsed = JSON.parse(content);
        } catch {
          const match = content.match(/\[.*\]/s);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch {
              setError("Sorry, we couldn't load the places (invalid JSON from AI). Please try again later or try a different category.");
              setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: false } }));
              return;
            }
          } else {
            setError("Sorry, we couldn't load the places (no valid JSON in AI response). Please try again later or try a different category.");
            setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: false } }));
            return;
          }
        }
        merged = merged.concat(parsed);
      } catch (err) {
        setError("Failed to fetch places. Please check your network or try again.");
      }
    }
    merged = dedupePlaces(merged).slice(0, 5); // dedupe and take top 5
    setPlacesByCategory(prev => ({
      ...prev,
      [cat]: { places: merged, showAll: false, allLoaded: merged.length < PLACES_BATCH_SIZE, loading: false }
    }));
    setLoadedCount(prev => ({ ...prev, [cat]: merged.length }));
  };

  // Handler to load more places for a category
  const handleShowMore = async (cat: string) => {
    setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: true } }));
    const currentPlaces = placesByCategory[cat]?.places || [];
    const prompt = `List ${PLACES_BATCH_SIZE} more top places in ${destination} for the interest: ${cat}, excluding these: ${currentPlaces.map(p => p.name).join(", ")}. For each, provide a short description (1-2 lines), timing, ticket price, who can visit, and an image URL. Respond ONLY with a valid JSON array of objects with 'name', 'description', 'timing', 'ticket', 'who_can_visit', and 'image_url' fields. Do not include any explanation, comments, or extra text.`;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful travel assistant." },
            { role: "user", content: prompt }
          ]
        })
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      let parsed: Place[] = [];
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\[.*\]/s);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {
            setError("Sorry, we couldn't load more places (invalid JSON from AI).");
            setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: false } }));
            return;
          }
        } else {
          setError("Sorry, we couldn't load more places (no valid JSON in AI response).");
          setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: false } }));
          return;
        }
      }
      const newPlaces = dedupePlaces([...currentPlaces, ...parsed]);
      setPlacesByCategory(prev => ({
        ...prev,
        [cat]: {
          ...prev[cat],
          places: newPlaces,
          allLoaded: parsed.length < PLACES_BATCH_SIZE,
          loading: false
        }
      }));
      setLoadedCount(prev => ({ ...prev, [cat]: newPlaces.length }));
    } catch (err) {
      setError("Failed to fetch more places. Please check your network or try again.");
      setPlacesByCategory(prev => ({ ...prev, [cat]: { ...prev[cat], loading: false } }));
    }
  };

  const handleShowMoreEvents = () => {
    setEventsLoaded(prev => prev + 5);
  };

  // Selection logic
  const isSelected = (name: string, type: 'place' | 'event') => selectedItems.some(item => item.name === name && item.type === type);
  const toggleSelect = (name: string, type: 'place' | 'event') => {
    setSelectedItems(prev =>
      isSelected(name, type)
        ? prev.filter(item => !(item.name === name && item.type === type))
        : [...prev, { name, type }]
    );
  };

  // Minimum selection logic
  const minRequired = (parseInt(days, 10) || 1) * (parseInt(placesPerDay, 10) || 1);
  const totalAvailable = (() => {
    let count = 0;
    Object.values(placesByCategory).forEach(cat => { count += cat.places.length; });
    return count;
  })();
  const canProceed = selectedItems.length >= minRequired || totalAvailable < minRequired;

  // Only allow proceed if 1 hotel and at least 4 places are selected
  const selectedPlaces = selectedItems.filter(item => item.type === 'place');
  const canProceedToItinerary = selectedHotel && selectedPlaces.length >= 4;

  // Store previous itinerary in state (for showing while loading new one)
  const [previousItinerary, setPreviousItinerary] = useState(null);

  const renderPlaceCard = (place: Place, category: string, type: 'place' | 'event') => (
    <Card
      key={`${category}-${place.name}`}
      className={`w-full md:w-[350px] overflow-hidden rounded-lg shadow-lg flex flex-col transform transition-transform hover:scale-105 border-2 ${isSelected(place.name, type) ? 'border-green-500' : 'border-transparent'}`}
      onClick={() => toggleSelect(place.name, type)}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={place.image_url || '/placeholder.svg'}
        alt={place.name}
        className="w-full h-48 object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
      />
      <CardContent className="p-4 flex flex-col flex-grow bg-white">
        <div className="flex items-center mb-2">
          <span className="mr-2">{isSelected(place.name, type) ? <CheckCircle className="text-green-500 w-5 h-5" /> : <Circle className="text-gray-300 w-5 h-5" />}</span>
          <h3 className="text-xl font-bold text-gray-800">{place.name}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{place.description}</p>
        <div className="mt-auto space-y-3 text-sm text-gray-700">
          {/* For events, show new fields */}
          {type === 'event' && place.date_time && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              <span>{place.date_time}</span>
            </div>
          )}
          {type === 'event' && place.venue && (
            <div className="flex items-center">
              <span className="font-semibold mr-2">Venue:</span>
              <span>{place.venue}</span>
            </div>
          )}
          {type === 'event' && place.category && (
            <div className="flex items-center">
              <span className="font-semibold mr-2">Category:</span>
              <span>{place.category}</span>
            </div>
          )}
          {type === 'event' && place.highlights && (
            <div className="flex items-center">
              <span className="font-semibold mr-2">Highlights:</span>
              <span>{place.highlights}</span>
            </div>
          )}
          {type === 'event' && place.ticket_info && (
            <div className="flex items-center">
              <Ticket className="w-4 h-4 mr-2 text-orange-500" />
              <span>{place.ticket_info}</span>
            </div>
          )}
          {/* For both types, show who_can_visit */}
          {place.timing && type !== 'event' && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              <span>{place.timing}</span>
            </div>
          )}
          {place.ticket && type !== 'event' && (
            <div className="flex items-center">
              <Ticket className="w-4 h-4 mr-2 text-orange-500" />
              <span>{place.ticket}</span>
            </div>
          )}
          {place.who_can_visit && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-orange-500" />
              <span>{place.who_can_visit}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const hasSuggestions = visitAttractions 
    ? ((!categories || categories.length === 0) ? allAttractions.length > 0 : Object.keys(touristAttractions).length > 0)
    : Object.keys(placesByCategory).length > 0;

  let totalUniquePlaces = 0;
  if (hasSuggestions) {
    if (visitAttractions) {
      if (!categories || categories.length === 0) {
        totalUniquePlaces = allAttractions.length;
      } else {
        const uniquePlaceNames = new Set(Object.values(touristAttractions).flat().map((p: any) => p.name));
        totalUniquePlaces = uniquePlaceNames.size;
      }
    } else {
      const allPlaces = Object.values(placesByCategory).map((cat: any) => cat.places).flat();
      const uniquePlaceNames = new Set(allPlaces.map((p: any) => p.name));
      totalUniquePlaces = uniquePlaceNames.size;
    }
  }

  const TOTAL_CATEGORIES = 6;

  if (loading) return <div className="text-center p-8">Loading your personalized recommendations...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8 bg-orange-50 min-h-screen">
       <button onClick={() => window.history.back()} className="flex items-center text-orange-600 font-semibold mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Your Recommendations for {destination}</h1>
      <p className="text-center text-gray-600 mb-8">Discover amazing places and events tailored to your interests.</p>

      {/* Continue to Itinerary button above tabs */}
      <div className="flex justify-center mb-8">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg"
          disabled={!canProceedToItinerary}
          onClick={() => {
            // Save previous itinerary if any
            setPreviousItinerary(null); // You can store the last itinerary here if needed
            // Log in console when generating new one
            console.log('Generating new itinerary...');
            // Gather all required data and navigate
            navigate('/itinerary', {
              state: {
                selectedHotel,
                selectedPlaces: selectedPlaces.map(item => {
                  // Find full place object
                  let found = null;
                  Object.values(placesByCategory).forEach(cat => {
                    const match = cat.places.find(p => p.name === item.name);
                    if (match) found = match;
                  });
                  return found || { name: item.name };
                }),
                foodOptions,
                transport,
                destination,
                startDate,
                endDate,
                days,
                placesPerDay,
                travelCompanion,
                previousItinerary
              }
            });
          }}
        >
          Continue to Itinerary
        </Button>
      </div>

      {/* Always show tab navigation */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setActiveTab('places')}
          className={`px-6 py-2 rounded-l-lg transition-colors ${activeTab === 'places' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
        >
          Places
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-2 transition-colors ${activeTab === 'events' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('hotels')}
          className={`px-6 py-2 rounded-r-lg transition-colors ${activeTab === 'hotels' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}
        >
          Hotels
        </button>
      </div>

      {activeTab === 'places' && (
        <div className="space-y-12">
          {visitAttractions && allAttractions.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Top Tourist Attractions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(showAllAttractions ? allAttractions : allAttractions.slice(0, 12)).map((place, idx) => renderPlaceCard(place, `tourist-attraction-${idx}`, 'place'))}
              </div>
              {allAttractions.length > 12 && (
                <div className="text-center mt-8">
                  <Button onClick={() => setShowAllAttractions(!showAllAttractions)} className="bg-orange-500 hover:bg-orange-600">
                    {showAllAttractions ? 'Show Less' : 'Show More Attractions'}
                  </Button>
                </div>
              )}
            </div>
          )}
          {visitAttractions ? (
            <>
              {(!categories || categories.length === 0) && allAttractions.length > 0 ? (
                 <div>
                   <h2 className="text-3xl font-bold mb-6 text-gray-800">Top Tourist Attractions</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {(showAllAttractions ? allAttractions : allAttractions.slice(0, 12)).map((place) => renderPlaceCard(place, 'tourist-attraction', 'place'))}
                   </div>
                   {allAttractions.length > 12 && (
                     <div className="text-center mt-8">
                       <Button onClick={() => setShowAllAttractions(!showAllAttractions)} className="bg-orange-500 hover:bg-orange-600">
                         {showAllAttractions ? 'Show Less' : 'Show More Attractions'}
                       </Button>
                     </div>
                   )}
                 </div>
              ) : (
                Object.keys(touristAttractions).map((cat) => {
                    const places = touristAttractions[cat];
                    if (!places || places.length === 0) return null;
                    return (
                        <div key={cat}>
                            <h2 className="text-3xl font-bold mb-6 text-gray-800">{cat} - Top Tourist Attractions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {places.map((place) => renderPlaceCard(place, cat, 'place'))}
                            </div>
                        </div>
                    )
                })
              )}
               {(() => {
                  const unmatched = (categories || []).filter(cat => !touristAttractions[cat] || touristAttractions[cat].length === 0);
                  if (unmatched.length === 0) return null;
                  return (
                     <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-400 rounded-lg">
                       <h3 className="font-semibold text-yellow-800 mb-2">No Famous Attractions Found For:</h3>
                       <ul className="list-disc list-inside text-yellow-900">
                         {unmatched.map(cat => (
                           <li key={cat}>{cat}</li>
                         ))}
                       </ul>
                     </div>
                  )
               })()}
            </>
          ) : (
            Object.keys(placesByCategory).map((cat) => {
              const entry = placesByCategory[cat];
              if (!entry || entry.places.length === 0) return null;
              const visiblePlaces = entry.showAll ? entry.places : entry.places.slice(0, 3);
              return (
                <div key={cat}>
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">{cat}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {visiblePlaces.map((place) => renderPlaceCard(place, cat, 'place'))}
                  </div>
                  {entry.places.length > 3 && !entry.showAll && (
                    <div className="mt-4 flex justify-start">
                      <Button onClick={() => setPlacesByCategory(p => ({ ...p, [cat]: { ...p[cat], showAll: true } }))}>
                        Show More
                      </Button>
                    </div>
                  )}
                  {entry.places.length > 3 && entry.showAll && (
                    <div className="mt-4 flex justify-start">
                      <Button onClick={() => setPlacesByCategory(p => ({ ...p, [cat]: { ...p[cat], showAll: false } }))}>
                        Show Less
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Local Events</h2>
          <div className="text-center text-lg text-gray-500">Events coming soon.</div>
        </div>
      )}

      {activeTab === 'hotels' && (
        <HotelPage
          destination={destination}
          hotelState={hotelState}
          setHotelState={setHotelState}
          selectedHotel={selectedHotel}
          onSelectHotel={setSelectedHotel}
        />
      )}

      {/* Minimum selection message */}
      <div className="mt-12 text-center">
        {!canProceedToItinerary && (
          <div className="mb-4 text-red-600 font-semibold">
            Please select 1 hotel and at least 4 places to continue.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacesPage;
