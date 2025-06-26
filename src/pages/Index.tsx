
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Map, Calendar, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const destinations = [
    {
      id: 1,
      name: "Spiritual Journey",
      image: "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=300&h=200&fit=crop",
      description: "Discover sacred temples and spiritual experiences"
    },
    {
      id: 2,
      name: "Adventure Trails",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop",
      description: "Thrilling hiking and trekking adventures"
    },
    {
      id: 3,
      name: "Cultural Heritage",
      image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=300&h=200&fit=crop",
      description: "Explore museums and historical monuments"
    },
    {
      id: 4,
      name: "Nature Escapes",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
      description: "Beautiful parks and eco-tourism experiences"
    },
    {
      id: 5,
      name: "City Entertainment",
      image: "https://images.unsplash.com/photo-1527576539890-dfa815648363?w=300&h=200&fit=crop",
      description: "Shopping malls and entertainment venues"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-4 rounded-full">
              <Plane className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
            Smart Trip Planner
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your AI-powered travel companion that creates personalized itineraries 
            based on your preferences, budget, and travel style.
          </p>
          <Button 
            onClick={() => navigate('/login')} 
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Button>
        </div>

        {/* Destinations Gallery */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Explore Amazing Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {destinations.map((destination) => (
              <div key={destination.id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group cursor-pointer">
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{destination.name}</h3>
                  <p className="text-sm text-gray-600">{destination.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
              <Map className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Planning</h3>
            <p className="text-gray-600">AI-powered recommendations based on your preferences and travel style.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="bg-orange-100 p-3 rounded-full w-fit mb-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Flexible Dates</h3>
            <p className="text-gray-600">Choose your travel duration and get optimized day-by-day itineraries.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="bg-green-100 p-3 rounded-full w-fit mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Group Travel</h3>
            <p className="text-gray-600">Perfect for solo travelers, couples, families, and group adventures.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
