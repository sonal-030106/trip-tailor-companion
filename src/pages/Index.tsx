
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plane, Map, Calendar, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

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
            TravelGenie
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
            Start Your Journey
          </Button>
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
