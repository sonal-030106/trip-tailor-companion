import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Utensils, Car, Phone, Share2, Download, Navigation, Plus, X, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";

const ItineraryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(1);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState<any[]>([]);

  // Get user selections from navigation state
  const {
    selectedHotel,
    selectedPlaces,
    foodOptions,
    transport,
    startDate,
    endDate,
    destination,
    travelCompanion,
    placesPerDay
  } = location.state || {};

  // Debug: log all required fields
  console.log('ItineraryPage state:', {
    selectedHotel,
    selectedPlaces,
    foodOptions,
    transport,
    startDate,
    endDate,
    destination,
    travelCompanion,
    placesPerDay
  });

  const events = [
    {
      id: "ganesh-chaturthi",
      name: "Ganesh Chaturthi Festival",
      date: "Aug 19, 2024",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&h=200&fit=crop",
      description: "Experience Mumbai's grandest festival with massive pandals and processions"
    },
    {
      id: "kala-ghoda",
      name: "Kala Ghoda Arts Festival",
      date: "Feb 2025",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300&h=200&fit=crop",
      description: "9-day cultural extravaganza with street art, music, and theater"
    },
    {
      id: "bandra-fair",
      name: "Bandra Fair",
      date: "Sep 8-15, 2024",
      image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=300&h=200&fit=crop",
      description: "Week-long festival with food stalls, games, and live music"
    }
  ];

  const availablePlaces = [
    {
      id: "gateway-of-india",
      name: "Gateway of India",
      image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=300&h=200&fit=crop",
      description: "Iconic 26-meter arch monument overlooking the Arabian Sea",
      type: "Heritage"
    },
    {
      id: "marine-drive",
      name: "Marine Drive",
      image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=300&h=200&fit=crop",
      description: "3.6-km promenade known as Queen's Necklace for its nighttime lights",
      type: "Scenic"
    },
    {
      id: "elephanta-caves",
      name: "Elephanta Caves",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      description: "UNESCO-listed 5th-century rock-cut caves with intricate Shiva sculptures",
      type: "Heritage"
    }
  ];

  useEffect(() => {
    // If itinerary is passed in state, use it
    if (location.state?.itinerary) {
      setItinerary(location.state.itinerary);
      return;
    }
    // If required data is missing, show error
    if (!selectedHotel || !selectedPlaces || !foodOptions || !transport || !startDate || !endDate || !destination) {
      setError("Missing trip details. Please go back and complete the selection.");
      return;
    }
    // Otherwise, fetch itinerary from AI
    setLoading(true);
    setError("");
    const prompt = `Generate a detailed, day-wise travel itinerary for a tourist visiting ${destination} from ${startDate} to ${endDate}.\n- The user's preferred transport to reach the city is ${transport}, but please suggest all reasonable options for each leg (e.g., taxi, metro, bus, auto, walking, etc.) with fare estimates and timing, especially for non-locals.\n- The user will stay at ${selectedHotel.name}.\n- The user wants to visit these places: ${selectedPlaces.map((p: any) => p.name).join(", ")}.\n- The user's food preferences are: ${foodOptions.join(", ")}.\n- The user is traveling as: ${travelCompanion}.\n- The user wants to visit ${placesPerDay} places per day.\nFor each day, include:\n1. How to reach the hotel from the arrival point (with all options, fares, and timing).\n2. For each place, how to get there from the hotel (all options, fares, timing, step-by-step if needed).\n3. Suggest famous food and souvenirs at each place.\n4. Suggest meal options based on food preferences.\n5. At the end of the last day, suggest lunch at the hotel and how to reach the next destination (with all options).\n6. Include a short description for each activity and mention the time for each.\nRespond ONLY with a valid JSON array, one object per day, with fields: day, title, hotel, image, description, activities (array of: time, activity, duration, description, image, mapUrl, transportOptions, foodSuggestions, souvenirSuggestions). Do not include any explanation, comments, or extra text.`;
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful travel assistant.' },
          { role: 'user', content: prompt }
        ]
      })
    })
      .then(res => res.json())
      .then(data => {
        const content = data.choices?.[0]?.message?.content || '';
        console.log('AI raw response:', content);
        let parsed = [];
        try {
          // Try to find the first [ and last ] and parse only that substring
          const firstBracket = content.indexOf('[');
          const lastBracket = content.lastIndexOf(']');
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            const jsonString = content.substring(firstBracket, lastBracket + 1);
            parsed = JSON.parse(jsonString);
          } else {
            throw new Error('No valid JSON array found in AI response.');
          }
        } catch (err) {
          setError('Sorry, could not parse itinerary data.');
          setLoading(false);
          return;
        }
        setItinerary(parsed);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch itinerary. Please try again.');
        setLoading(false);
      });
  // eslint-disable-next-line
  }, []);

  if (loading) return <div className="text-center p-8 text-lg">Generating your personalized itinerary...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!itinerary.length) return <div className="text-center p-8 text-gray-500">No itinerary found.</div>;

  const currentDay = itinerary.find(day => day.day === selectedDay);

  const openMaps = (mapUrl: string) => {
    window.open(mapUrl, '_blank');
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  const filteredPlaces = availablePlaces.filter(place => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header with enhanced styling */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <img 
              src={currentDay?.image} 
              alt="Mumbai skyline"
              className="w-full h-48 object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-3xl font-bold mb-2">Your Mumbai Spiritual Journey</h1>
              <p className="text-lg opacity-90">3-day personalized itinerary with temples, food & accommodation</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mb-6">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Itinerary
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button 
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600"
            >
              <Calendar className="h-4 w-4" />
              Add Events
            </Button>
            <Button 
              onClick={() => setShowAddPlaceModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
            >
              <Plus className="h-4 w-4" />
              Add Places
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Day Selector */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Trip Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {itinerary.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedDay === day.day
                        ? 'bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">Day {day.day}</div>
                    <div className="text-sm opacity-90">{day.title}</div>
                  </button>
                ))}
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Travel Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use M-Indicator app for train schedules</li>
                    <li>• Avoid 8-10 AM & 5-7 PM rush hours</li>
                    <li>• All hotels have pure-veg options</li>
                    <li>• Carry water bottle and comfortable shoes</li>
                  </ul>
                </div>

                {selectedEvents.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Selected Events</h4>
                    {selectedEvents.map(eventId => {
                      const event = events.find(e => e.id === eventId);
                      return (
                        <div key={eventId} className="text-sm text-purple-700 mb-1 flex justify-between items-center">
                          <span>{event?.name}</span>
                          <button 
                            onClick={() => toggleEvent(eventId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Day Details with enhanced visuals */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-6">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Day {currentDay?.day}: {currentDay?.title}</CardTitle>
                    <div className="flex items-center gap-2 text-blue-100 mt-2">
                      <div className="text-lg">🏨</div>
                      <span>{currentDay?.hotel}</span>
                    </div>
                  </div>
                  <img 
                    src={currentDay?.image} 
                    alt={currentDay?.title}
                    className="w-20 h-16 object-cover rounded-lg border-2 border-white/30"
                  />
                </div>
                <p className="text-blue-100 mt-2 text-sm">{currentDay?.description}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {currentDay?.activities.map((activity, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                      <div className="flex-shrink-0">
                        <img 
                          src={activity.image} 
                          alt={activity.activity}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="bg-white p-1 rounded-full shadow-sm">
                                {activity.icon}
                              </div>
                              <h4 className="font-semibold text-gray-800">{activity.activity}</h4>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <Badge variant="outline" className="mb-1">
                              {activity.time}
                            </Badge>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.duration}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">Emergency Contact</h4>
                    <p className="text-sm text-green-700">Tourist Helpline: 1363</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Navigation</h4>
                    <p className="text-sm text-blue-700">Google Maps Integration</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="flex items-center gap-3">
                  <Utensils className="h-8 w-8 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-orange-800">Food Guide</h4>
                    <p className="text-sm text-orange-700">Veg restaurants nearby</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Events Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add Events to Your Trip</CardTitle>
                <Button variant="ghost" onClick={() => setShowEventModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <Card 
                      key={event.id}
                      className={`cursor-pointer transition-all ${
                        selectedEvents.includes(event.id) 
                          ? 'ring-2 ring-purple-500 shadow-lg' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => toggleEvent(event.id)}
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <img 
                            src={event.image} 
                            alt={event.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                          {selectedEvents.includes(event.id) && (
                            <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                              ✓
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-gray-800 mb-1">{event.name}</h4>
                          <p className="text-purple-600 text-xs font-medium mb-2">{event.date}</p>
                          <p className="text-gray-600 text-xs">{event.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Places Modal */}
        {showAddPlaceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add More Places</CardTitle>
                <Button variant="ghost" onClick={() => setShowAddPlaceModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search places to add..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlaces.map((place) => (
                    <Card 
                      key={place.id}
                      className="cursor-pointer hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-0">
                        <img 
                          src={place.image} 
                          alt={place.name}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-sm text-gray-800">{place.name}</h4>
                            <Badge variant="secondary" className="text-xs">{place.type}</Badge>
                          </div>
                          <p className="text-gray-600 text-xs mb-3">{place.description}</p>
                          <Button size="sm" className="w-full text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Itinerary
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPage;
