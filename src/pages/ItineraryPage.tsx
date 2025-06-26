
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Utensils, Car, Phone, Share2, Download } from "lucide-react";

const ItineraryPage = () => {
  const [selectedDay, setSelectedDay] = useState(1);

  const itinerary = [
    {
      day: 1,
      title: "Siddhivinayak + ISKCON Juhu",
      hotel: "Hotel Shree Sai Palace (Dadar)",
      activities: [
        {
          time: "6:30 AM",
          activity: "Walk to Siddhivinayak Temple",
          duration: "5 mins",
          icon: <MapPin className="h-4 w-4 text-blue-500" />,
          description: "Early morning darshan with least crowd"
        },
        {
          time: "7:00 AM",
          activity: "Darshan at Siddhivinayak",
          duration: "1 hour",
          icon: <div className="text-orange-500">🕉️</div>,
          description: "Peaceful morning prayers"
        },
        {
          time: "8:00 AM",
          activity: "Breakfast at hotel",
          duration: "30 mins",
          icon: <Utensils className="h-4 w-4 text-green-500" />,
          description: "Try Puran Poli - hotel specialty"
        },
        {
          time: "10:00 AM",
          activity: "Travel to ISKCON Juhu",
          duration: "25 mins",
          icon: <Car className="h-4 w-4 text-purple-500" />,
          description: "Train from Dadar to Andheri, then auto (₹50)"
        },
        {
          time: "11:00 AM",
          activity: "Explore ISKCON Temple",
          duration: "2 hours",
          icon: <div className="text-blue-500">🏛️</div>,
          description: "Temple visit and attend kirtan"
        },
        {
          time: "1:00 PM",
          activity: "Lunch at Govinda's Restaurant",
          duration: "1 hour",
          icon: <Utensils className="h-4 w-4 text-green-500" />,
          description: "Delicious vegetarian thali (₹200)"
        },
        {
          time: "3:00 PM",
          activity: "Return to hotel",
          duration: "25 mins",
          icon: <Car className="h-4 w-4 text-purple-500" />,
          description: "Rest and refresh"
        }
      ]
    },
    {
      day: 2,
      title: "Mahalaxmi + Babulnath",
      hotel: "Hotel Aram (Marine Lines)",
      activities: [
        {
          time: "6:30 AM",
          activity: "Taxi to Mahalaxmi Temple",
          duration: "15 mins",
          icon: <Car className="h-4 w-4 text-purple-500" />,
          description: "Morning ride (₹100)"
        },
        {
          time: "7:00 AM",
          activity: "Darshan + Sea View",
          duration: "1.5 hours",
          icon: <div className="text-orange-500">🕉️</div>,
          description: "Temple visit with beautiful ocean views"
        },
        {
          time: "8:30 AM",
          activity: "Breakfast at Cafe Madras",
          duration: "45 mins",
          icon: <Utensils className="h-4 w-4 text-green-500" />,
          description: "Authentic South Indian breakfast in Matunga"
        },
        {
          time: "10:00 AM",
          activity: "Travel to Babulnath Temple",
          duration: "10 mins",
          icon: <Car className="h-4 w-4 text-purple-500" />,
          description: "Short taxi ride (₹80)"
        },
        {
          time: "11:00 AM",
          activity: "Babulnath Temple Visit",
          duration: "1.5 hours",
          icon: <div className="text-orange-500">🕉️</div>,
          description: "Ancient Shiva temple with Malabar Hill views"
        },
        {
          time: "12:30 PM",
          activity: "Lunch at Hotel Aram",
          duration: "1 hour",
          icon: <Utensils className="h-4 w-4 text-green-500" />,
          description: "Hotel's special veg biryani"
        }
      ]
    },
    {
      day: 3,
      title: "Mumbadevi + Walkeshwar",
      hotel: "Hotel Gurukripa (Girgaum)",
      activities: [
        {
          time: "7:00 AM",
          activity: "Walk to Mumbadevi Temple",
          duration: "10 mins",
          icon: <MapPin className="h-4 w-4 text-blue-500" />,
          description: "Morning walk to the ancient temple"
        },
        {
          time: "8:00 AM",
          activity: "Breakfast at Shree Thaker Bhojanalay",
          duration: "45 mins",
          icon: <Utensils className="h-4 w-4 text-green-500" />,
          description: "Traditional Gujarati thali"
        },
        {
          time: "10:00 AM",
          activity: "Bus to Walkeshwar Temple",
          duration: "25 mins",
          icon: <Car className="h-4 w-4 text-purple-500" />,
          description: "Bus #123 to Walkeshwar"
        },
        {
          time: "11:00 AM",
          activity: "Walkeshwar Temple + Banganga Tank",
          duration: "2 hours",
          icon: <div className="text-orange-500">🕉️</div>,
          description: "Historic temple complex with sacred tank"
        },
        {
          time: "1:00 PM",
          activity: "Lunch at Hotel",
          duration: "1 hour",
          icon: <Utensils className="h-4 w-4 text-green-500" />,
          description: "South Indian meals at Guru Kripa"
        }
      ]
    }
  ];

  const currentDay = itinerary.find(day => day.day === selectedDay);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Mumbai Spiritual Journey</h1>
          <p className="text-gray-600 text-lg">3-day personalized itinerary with temples, food & accommodation</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Itinerary
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
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
              </CardContent>
            </Card>
          </div>

          {/* Day Details */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Day {currentDay?.day}: {currentDay?.title}</CardTitle>
                <div className="flex items-center gap-2 text-blue-100">
                  <div className="text-lg">🏨</div>
                  <span>{currentDay?.hotel}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {currentDay?.activities.map((activity, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="bg-white p-2 rounded-full shadow-sm">
                          {activity.icon}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{activity.activity}</h4>
                            <p className="text-gray-600 text-sm">{activity.description}</p>
                          </div>
                          <div className="text-right">
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
            <div className="mt-6 grid md:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
};

export default ItineraryPage;
