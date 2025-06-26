
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, DollarSign, ArrowRight } from "lucide-react";

const PlacesPage = () => {
  const navigate = useNavigate();
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);

  // Mock data - in real app, this would come from API based on preferences
  const places = {
    "Religion/Spiritual": [
      {
        id: "siddhivinayak",
        name: "Siddhivinayak Temple",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&h=200&fit=crop",
        rating: 4.6,
        duration: "1-2 hours",
        price: "Free",
        description: "Famous Ganesh temple in Mumbai"
      },
      {
        id: "iskcon",
        name: "ISKCON Temple Juhu",
        image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=300&h=200&fit=crop",
        rating: 4.5,
        duration: "2-3 hours",
        price: "Free",
        description: "Beautiful Krishna temple with cultural programs"
      },
      {
        id: "mahalaxmi",
        name: "Mahalaxmi Temple",
        image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=300&h=200&fit=crop",
        rating: 4.7,
        duration: "1-2 hours",
        price: "Free",
        description: "Ancient temple dedicated to Goddess Mahalaxmi"
      }
    ]
  };

  const hotels = [
    {
      id: "hotel1",
      name: "Hotel Shree Sai Palace",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",
      rating: 4.2,
      price: "₹2,500/night",
      amenities: ["Pure Veg", "WiFi", "AC"],
      location: "Dadar"
    },
    {
      id: "hotel2",
      name: "Hotel Aram",
      image: "https://images.unsplash.com/photo-1578774204375-babad2e1abb6?w=300&h=200&fit=crop",
      rating: 4.0,
      price: "₹2,000/night",
      amenities: ["Vegetarian", "Room Service", "Parking"],
      location: "Marine Lines"
    },
    {
      id: "hotel3",
      name: "Hotel Gurukripa",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop",
      rating: 4.3,
      price: "₹1,800/night",
      amenities: ["Jain Food", "WiFi", "Laundry"],
      location: "Girgaum"
    }
  ];

  const togglePlace = (placeId: string) => {
    setSelectedPlaces(prev => 
      prev.includes(placeId) 
        ? prev.filter(p => p !== placeId)
        : [...prev, placeId]
    );
  };

  const toggleHotel = (hotelId: string) => {
    setSelectedHotels(prev => 
      prev.includes(hotelId) 
        ? prev.filter(h => h !== hotelId)
        : [...prev, hotelId]
    );
  };

  const handleGenerateItinerary = () => {
    navigate('/itinerary');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Places & Hotels</h1>
          <p className="text-gray-600 text-lg">Select places to visit and hotels to stay based on your preferences</p>
        </div>

        {/* Places Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MapPin className="mr-2 text-blue-500" />
            Places to Visit
          </h2>
          
          {Object.entries(places).map(([category, categoryPlaces]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPlaces.map((place) => (
                  <Card 
                    key={place.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      selectedPlaces.includes(place.id) 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => togglePlace(place.id)}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={place.image} 
                          alt={place.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {selectedPlaces.includes(place.id) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-lg text-gray-800 mb-2">{place.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{place.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">{place.rating}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {place.duration}
                          </div>
                          <div className="flex items-center text-sm text-green-600 font-medium">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {place.price}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Hotels Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="mr-2 text-2xl">🏨</div>
            Hotels & Accommodation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Card 
                key={hotel.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedHotels.includes(hotel.id) 
                    ? 'ring-2 ring-green-500 shadow-lg' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => toggleHotel(hotel.id)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {selectedHotels.includes(hotel.id) && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-lg text-gray-800 mb-2">{hotel.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{hotel.location}</p>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">{hotel.price}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hotel.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <div className="mb-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 mr-4">
              {selectedPlaces.length} places selected
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {selectedHotels.length} hotels selected
            </Badge>
          </div>
          <Button
            onClick={handleGenerateItinerary}
            disabled={selectedPlaces.length === 0 || selectedHotels.length === 0}
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Generate My Itinerary
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlacesPage;
