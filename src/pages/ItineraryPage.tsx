import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Utensils, ArrowRight, Star, Car, Train, Bus, User, Coffee, Pizza, IceCream, Calendar, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { extractJsonArrayFromText } from '../lib/utils';
import { addDays, format } from 'date-fns';
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { auth } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { createHash } from 'crypto'; // If not available, use a browser hash function

const cityDescriptions: Record<string, string> = {
  mumbai: "The city of dreams, famous for its vibrant culture, historic landmarks, and delicious street food.",
  pune: "A vibrant city known for its educational institutions, pleasant weather, and rich Maratha history.",
  delhi: "India's capital, blending ancient monuments, bustling markets, and modern city life.",
  goa: "A coastal paradise famous for its beaches, nightlife, and Portuguese heritage.",
  // Add more cities as needed
};


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
  const [quickText, setQuickText] = useState<string | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(15); // seconds
  const [user] = useAuthState(auth);

  // Always read trip details from navigation state first, then sessionStorage
  const selectedPlaces = location.state?.selectedPlaces || JSON.parse(sessionStorage.getItem('selectedPlaces') || '[]');
  const selectedHotels = location.state?.selectedHotels || JSON.parse(sessionStorage.getItem('selectedHotels') || '[]');
  const selectedHotel = location.state?.selectedHotel || JSON.parse(sessionStorage.getItem('selectedHotel') || 'null');
  const destination = location.state?.destination || sessionStorage.getItem('destination') || '';
  const numberOfDays = location.state?.numberOfDays || sessionStorage.getItem('numberOfDays') || '';
  const days = location.state?.days || sessionStorage.getItem('days') || '';
  const endDate = location.state?.endDate || sessionStorage.getItem('endDate') || '';
  const foodOptions = location.state?.foodOptions || JSON.parse(sessionStorage.getItem('foodOptions') || '[]');
  const startDate = location.state?.startDate || sessionStorage.getItem('startDate') || '';
  const transport = location.state?.transport || sessionStorage.getItem('transport') || '';
  const travelCompanion = location.state?.travelCompanion || sessionStorage.getItem('travelCompanion') || '';
  const budget = location.state?.budget || sessionStorage.getItem('budget') || '';
  const cityKey = destination.trim().toLowerCase();
  const cityDescription = cityDescriptions[cityKey] || "Explore this amazing destination!";

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
    numberOfDays
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
    // If showTempItinerary flag is set, load tempItinerary from localStorage
    if (sessionStorage.getItem('showTempItinerary') === 'true') {
      const temp = localStorage.getItem('tempItinerary');
      if (temp) {
        setQuickText(temp);
        setLoading(false);
        setError("");
        return;
      }
    }
    // If a saved itinerary is provided (e.g., from My Itineraries), display it and skip trip details check
    if (location.state?.itinerary) {
      setQuickText(location.state.itinerary);
      setError(""); // Clear any previous error
      return;
    }
    // If not viewing a saved itinerary, require trip details for generation
    if (!selectedPlaces || !foodOptions || !transport || !startDate || !numberOfDays || !destination) {
      setError("Missing trip details. Please go back and complete the selection.");
      return;
    }
    
    // Check if itinerary has already been generated for this exact data
    const storedItinerary = sessionStorage.getItem('generatedItinerary');
    const storedItineraryData = sessionStorage.getItem('itineraryDataHash');
    
    // Create a hash of current data to compare
    const currentDataHash = JSON.stringify({
      selectedPlaces: selectedPlaces.map(p => p.name).sort(),
      foodOptions: foodOptions.sort(),
      transport,
      startDate,
      numberOfDays,
      destination,
      travelCompanion,
      budget,
      selectedHotel: selectedHotel?.name || null
    });
    
    if (storedItinerary && storedItineraryData === currentDataHash) {
      console.log("Itinerary already generated for this data, using cached version");
      setQuickText(storedItinerary);
      setLoading(false);
      return;
    }
    
    // Check if this is the first time loading
    const isFirstTime = !storedItineraryData;
    
    // Only regenerate if it's not the first time and data has actually changed
    if (!isFirstTime && storedItineraryData === currentDataHash) {
      console.log("First time loading, generating itinerary");
    } else if (!isFirstTime && storedItineraryData !== currentDataHash) {
      console.log("Data changed (subsequent update), regenerating itinerary");
    }
    
    // Always use the quick itinerary prompt for any destination/hotel
    setLoading(true);
    setQuickText(null);
    setError("");
    setLoadingStartTime(Date.now());
    
    // Force estimated time to be a random value between 20 and 25 seconds
    const estimatedSeconds = Math.floor(Math.random() * 6) + 20; // 20-25 seconds
    setEstimatedTime(estimatedSeconds);
    
    // Handle hotel information - make it optional
    const hotelInfo = selectedHotel 
      ? `staying at ${selectedHotel.name}${selectedHotel.location ? ` (${selectedHotel.location})` : ''}`
      : "without a specific hotel accommodation";
    
    // Get top places from sessionStorage
    const topPlaces = JSON.parse(sessionStorage.getItem('topPlaces') || '[]');
    const topPlacesInfo = topPlaces.length > 0 ? `\nTOP 5 MUST-VISIT PLACES: ${topPlaces.map(p => p.name).join(", ")}` : '';
    
    const prompt = `You are a travel itinerary generator. Create a comprehensive and detailed ${numberOfDays}-day travel itinerary for a tourist visiting ${destination}, ${hotelInfo}.

CRITICAL: You must respond with ONLY valid JSON. Do not include any thinking, explanations, or other text. Start your response with { and end with }.

TRAVELER PROFILE:
- Travel companion: ${travelCompanion}
- Budget level: ${budget || 'medium'}
- Transport preference: ${transport}
- Food preferences: ${foodOptions.join(", ")}
- Trip duration: ${numberOfDays} days
- Start date: ${startDate}
- End date: ${endDate || 'Not specified'}

SELECTED PLACES (${selectedPlaces.length} total): ${selectedPlaces.map(p => p.name).join(", ")}${topPlacesInfo}

The itinerary should:
- Distribute the ${selectedPlaces.length} places evenly across ${numberOfDays} days
- Each day should have approximately ${Math.ceil(selectedPlaces.length / parseInt(numberOfDays))} places
- Prioritize the top 5 must-visit places and distribute them across different days
- If a day has fewer places than others, that's fine - just use what's available
- Travel between places should be sequential (i.e., do not return to accommodation between places during the day)
- Consider the travel companion type (${travelCompanion}) for activity suggestions
- Match the budget level (${budget}) for meal and transport suggestions

For each destination, provide:
- Name of the place
- Description: Brief description of the place
- Time: Suggested duration to spend at this place (e.g., "2-3 hours", "1 hour")
- Travel route with specific details:
  - **For the FIRST place of each day**: ${selectedHotel ? `Suggest route from ${selectedHotel.name}` : `Suggest route from the nearest major transportation hub in ${destination} (like a famous bus station, railway station, metro station, or airport) that people typically use to reach ${destination}. For example: "From ${destination} Central Bus Station: taxi 20 mins, ₹150" or "From ${destination} Airport: local train 15 mins, ₹20"`}
  - **For subsequent places**: From previous place to next place
  - **If travel method is "Best Route"**: Provide 2-3 route options with different transportation modes (e.g., "Option 1: Local train 15 mins, ₹20 | Option 2: Taxi 10 mins, ₹120 | Option 3: Bus 25 mins, ₹15")
  - Include specific transport mode (walk, local train, taxi, rickshaw, bus, metro)
  - Include exact travel time in minutes (e.g., "15 mins", "30 mins", "45 mins")
  - Include estimated fare in rupees (e.g., "₹50", "₹200", "₹0 for walking")
  - Format: "From [transportation hub/previous place]: [transport] [time], [fare]"
- Ticket price: Entry fee for the attraction (if applicable, e.g., "₹500", "Free entry", "₹200 for adults")
- Activities: Provide 3-4 engaging and appealing activities that visitors can do at this place. Make them specific, descriptive, and user-friendly. Include:
  * Cultural experiences (e.g., "Attend the early morning aarti ceremony")
  * Exploration activities (e.g., "Explore the beautiful architecture and vibrant spiritual ambiance")
  * Local experiences (e.g., "Grab quick breakfast nearby (hot idlis, chai at local stalls)")
  * Interactive experiences (e.g., "If lucky, catch an exhibition or workshop")
  * Photo opportunities (e.g., "Capture stunning sunset views from the viewpoint")
  * Relaxation activities (e.g., "Stroll through art galleries, street installations, and cafes")
  * Educational experiences (e.g., "Learn about the rich history from local guides")
  * Adventure activities (e.g., "Climb to the top for panoramic city views")
  * Shopping experiences (e.g., "Browse local handicrafts and souvenirs")
  * Food experiences (e.g., "Sample authentic local cuisine at nearby restaurants")
- Suggested meals nearby with timing (breakfast: 8-9 AM, lunch: 1-2 PM, snacks: 4-5 PM, dinner: 8-9 PM), matching user's food preferences: ${foodOptions.join(", ")}
- Souvenirs or unique local experience (optional, only if it fits quickly)
- Tips: Best time to visit, safety tips, or local insights

Also include:
- Estimated total daily costs for transport and meals (consider budget: ${budget})
- Any quick travel tips for first-timers or safety
- Consider the travel companion type (${travelCompanion})
- Include meal suggestions that match the food preferences: ${foodOptions.join(", ")}

IMPORTANT: For travel routes, use this exact format:
- **First place of each day**: "From [nearest major transportation hub]: [transport] [time], [fare]"
- **Subsequent places**: "From [previous place]: [transport] [time], [fare]"
- **If "Best Route" selected**: "Option 1: [transport1] [time1], [fare1] | Option 2: [transport2] [time2], [fare2] | Option 3: [transport3] [time3], [fare3]"

Examples of transportation hubs for ${destination}:
- Major bus stations (e.g., ${destination} Central Bus Station, ${destination} Bus Terminal)
- Major railway stations (e.g., ${destination} Central, ${destination} Junction)
- Metro stations (e.g., ${destination} Metro Station)
- Airport (e.g., ${destination} International Airport, ${destination} Domestic Airport)
- Major landmarks that serve as transport hubs

${!selectedHotel ? `IMPORTANT: Since no hotel is selected, always start each day's first activity from a major transportation hub like ${destination} Central Bus Station or ${destination} Airport, as these are the most common entry points for travelers.` : ''}

Best Route Examples:
- "Option 1: Local train 15 mins, ₹20 | Option 2: Taxi 10 mins, ₹120 | Option 3: Bus 25 mins, ₹15"
- "Option 1: Metro 8 mins, ₹30 | Option 2: Auto-rickshaw 12 mins, ₹80 | Option 3: Walking 25 mins, ₹0"

RESPOND WITH ONLY THIS JSON STRUCTURE - NO OTHER TEXT:
{
  "itinerary": [
    {
      "day": 1,
      "date": "${startDate}",
      "dailyCost": "₹1500",
      "dailyTips": "Carry water and wear comfortable shoes",
      "places": [
        {
          "name": "Place Name",
          "description": "Brief description of the place",
          "time": "2-3 hours",
          "travelRoute": "${transport === 'Best Route' ? 'Option 1: Local train 15 mins, ₹20 | Option 2: Taxi 10 mins, ₹120 | Option 3: Bus 25 mins, ₹15' : 'From Mumbai Central Station: taxi 20 mins, ₹150'}",
          "ticketPrice": "₹500",
          "activities": [
            "Attend the early morning aarti ceremony and experience the spiritual ambiance",
            "Explore the beautiful architecture and learn about the rich history",
            "Grab quick breakfast nearby (hot idlis, chai at local stalls)",
            "Capture stunning photos of the iconic landmark"
          ],
          "meals": "Lunch (1:00 PM): Restaurant name - ${foodOptions.join(", ")} cuisine",
          "souvenir": "Local handicraft shop nearby",
          "tips": "Best time to visit: morning (9 AM - 11 AM)"
        }
      ]
    }
  ]}`;
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: 'system', content: 'You are a helpful travel assistant.' },
          { role: 'user', content: prompt }
        ]
      })
    })
      .then(res => res.json())
      .then(data => {
        const content = data.choices?.[0]?.message?.content || '';
        setQuickText(content);
        setLoading(false);
        
        // When saving the generated itinerary, check if the same itinerary ID is already saved
        const storedItinerary = sessionStorage.getItem('generatedItinerary');
        const storedItineraryData = sessionStorage.getItem('itineraryDataHash');
        // ... existing code ...
        // Only save if not already saved
        if ((!storedItinerary || storedItineraryData !== currentDataHash) && content) {
          sessionStorage.setItem('generatedItinerary', content);
          sessionStorage.setItem('itineraryDataHash', currentDataHash);
          sessionStorage.setItem('itineraryGenerated', 'true');
          // Set flag that itinerary has been generated at least once
          sessionStorage.setItem('itineraryGeneratedOnce', 'true');
        }
        // ... existing code ...
      })
      .catch(() => {
        setError('Failed to fetch quick itinerary. Please try again.');
        setLoading(false);
      });
  }, [
    location.state, 
    selectedPlaces, 
    selectedHotels, 
    destination, 
    numberOfDays, 
    foodOptions, 
    startDate, 
    transport, 
    travelCompanion, 
    budget
  ]);

  // Function to manually construct JSON from text when parsing fails
  function constructJSONFromText(text) {
    console.log('Attempting to construct JSON from text...');
    
    try {
      // Look for day patterns in the text
      const dayMatches = text.match(/day\s*\d+/gi);
      const placeMatches = text.match(/"([^"]+)"/g);
      
      if (dayMatches && dayMatches.length > 0) {
        console.log('Found day patterns:', dayMatches);
        
        // Create a basic itinerary structure
        const itinerary = {
          itinerary: dayMatches.map((dayMatch, index) => {
            const dayNumber = dayMatch.match(/\d+/)[0];
            return {
              day: parseInt(dayNumber),
              date: '',
              dailyCost: '',
              dailyTips: '',
              places: [{
                name: placeMatches?.[index]?.replace(/"/g, '') || `Place ${index + 1}`,
                time: '2-3 hours',
                description: 'A must-visit attraction',
                travelRoute: 'From previous location: walk 10 mins, ₹0',
                ticketPrice: 'Free entry',
                activities: ['Explore the beautiful architecture', 'Take stunning photos', 'Learn about the rich history'],
                meals: 'Lunch: Local restaurant',
                souvenir: 'Local handicrafts available',
                tips: 'Best time to visit: morning'
              }]
            };
          })
        };
        
        console.log('Constructed JSON:', itinerary);
        return itinerary.itinerary.map((dayData, i) => ({
          day: `Day ${dayData.day || i + 1}`,
          date: dayData.date || '',
          dailyCost: dayData.dailyCost || '',
          dailyTips: dayData.dailyTips || '',
          activities: dayData.places.map(place => ({
            name: place.name || 'Unknown Place',
            time: place.time || '',
            description: place.description || '',
            transport: place.travelRoute || '',
            ticketPrice: place.ticketPrice || '',
            meal: place.meals || '',
            souvenir: place.souvenir || '',
            activities: place.activities || place.thingsToDo || [],
            tips: place.tips || ''
          }))
        }));
      }
    } catch (error) {
      console.error('Manual JSON construction error:', error.message);
    }
    
    return null;
  }

  function validateAndFixJSON(jsonString) {
    let fixedJSON = jsonString;

    // Remove trailing commas from within property names (e.g., "day, ": 1 -> "day": 1)
    fixedJSON = fixedJSON.replace(/"([^",]+),\s*"\s*:/g, '"$1":');

    // Remove trailing commas from within string values (e.g., "value, " -> "value")
    fixedJSON = fixedJSON.replace(/",\s*([,}\]])/g, '"$1');
    
    // Fix missing commas between properties (e.g. "prop1": "val1" "prop2": "val2" -> "prop1": "val1", "prop2": "val2")
    fixedJSON = fixedJSON.replace(/\"\s*\"/g, '", "');

    // Remove trailing commas before closing braces and brackets
    fixedJSON = fixedJSON.replace(/,\s*(}|])/g, '$1');

    try {
      // Attempt to parse the cleaned JSON
      return JSON.parse(fixedJSON);
    } catch (e) {
      console.error('Initial JSON parsing failed, attempting more advanced fixing...', e.message);
    }
    
    // If parsing fails, try more aggressive fixes
    try {
      const cleaned = fixedJSON
        .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
        .replace(/,\s*([}\]])/g, '$1');

      const result = JSON.parse(cleaned);
      console.log('JSON parsing successful after advanced fixes');
      return result;
    } catch (fixError) {
        console.error('JSON fixing also failed:', fixError.message);
        
        const jsonMatch = fixedJSON.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            console.log('JSON extraction successful');
            return result;
          } catch (extractError) {
            console.error('JSON extraction also failed:', extractError.message);
          }
        }
        
        console.log('All parsing attempts failed. Returning fallback structure.');
        return {
          itinerary: [{
            day: 1,
            places: [{ name: 'Error: Could not parse itinerary' }]
          }]
        };
    }
  }

  function parseQuickItinerary(text) {
    console.log('Parsing itinerary text:', text);
    console.log('Text length:', text?.length);
    console.log('Text type:', typeof text);
    
    if (!text || typeof text !== 'string') {
      console.error('Invalid text input:', text);
      return [];
    }
    
    // Clean the text to extract only JSON
    function extractJSON(raw) {
      console.log('Extracting JSON from raw text...');
      console.log('Raw text length:', raw?.length);
      console.log('Raw text preview:', raw?.substring(0, 300));
      
      if (!raw || typeof raw !== 'string') {
        console.error('Invalid raw text input:', raw);
        return null;
      }
      
      // Remove <think>...</think> blocks more aggressively
      raw = raw.replace(/<think>[\s\S]*?<\/think>/g, '');
      raw = raw.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
      raw = raw.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '');
      raw = raw.replace(/<thought>[\s\S]*?<\/thought>/g, '');
      raw = raw.replace(/<analysis>[\s\S]*?<\/analysis>/g, '');
      
      // Remove any text before the first { and after the last }
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        raw = raw.substring(firstBrace, lastBrace + 1);
      }
      
      // Remove code block markers
      raw = raw.replace(/```json|```/g, '');
      raw = raw.replace(/```/g, '');
      
      // Remove any remaining non-JSON text
      raw = raw.replace(/^[^{]*/, ''); // Remove everything before first {
      raw = raw.replace(/}[^}]*$/, '}'); // Remove everything after last }
      
      // Trim whitespace
      raw = raw.trim();
      
      console.log('Cleaned text length:', raw.length);
      console.log('First 200 chars:', raw.substring(0, 200));
      console.log('Last 200 chars:', raw.substring(raw.length - 200));
      
      // Find the first and last curly braces to extract JSON
      const firstBraceFinal = raw.indexOf('{');
      const lastBraceFinal = raw.lastIndexOf('}');
      console.log('Brace positions - First:', firstBraceFinal, 'Last:', lastBraceFinal);
      
      if (firstBraceFinal !== -1 && lastBraceFinal !== -1 && lastBraceFinal > firstBraceFinal) {
        const extracted = raw.substring(firstBraceFinal, lastBraceFinal + 1);
        console.log('Extracted JSON length:', extracted.length);
        console.log('Extracted JSON preview:', extracted.substring(0, 300));
        return extracted;
      }
      
      console.log('No valid JSON braces found');
      return null;
    }
    
    try {
      // Always clean the JSON first to remove think blocks and code markers
      const cleanedJSON = extractJSON(text);
      console.log('Cleaned JSON result:', cleanedJSON ? 'Success' : 'Failed');
      
      if (cleanedJSON) {
        try {
          const jsonData = validateAndFixJSON(cleanedJSON);
          console.log('Parsed cleaned JSON data:', jsonData);
          
          if (jsonData.itinerary && Array.isArray(jsonData.itinerary)) {
            const result = jsonData.itinerary.map((dayData, i) => ({
              day: `Day ${dayData.day || i + 1}`,
              date: dayData.date || '',
              dailyCost: dayData.dailyCost || '',
              dailyTips: dayData.dailyTips || '',
              activities: dayData.places.map(place => ({
                name: place.name || 'Unknown Place',
                time: place.time || '',
                description: place.description || '',
                transport: place.travelRoute || '',
                ticketPrice: place.ticketPrice || '',
                meal: place.meals || '',
                souvenir: place.souvenir || '',
                activities: place.activities || place.thingsToDo || [],
                tips: place.tips || ''
              }))
            }));
            console.log('Successfully parsed itinerary:', result);
            return result;
          }
        } catch (cleanedError) {
          console.error('Cleaned JSON parsing failed:', cleanedError.message);
          console.error('Cleaned JSON string length:', cleanedJSON.length);
          console.error('Cleaned JSON preview:', cleanedJSON.substring(0, 500));
        }
      }
      
      // If cleaning failed or no JSON found, try fallback extraction
      console.log('Attempting fallback JSON extraction...');
      
      // Try multiple extraction strategies
      const extractionStrategies = [
        // Strategy 1: Simple JSON object extraction
        () => text.match(/\{[\s\S]*\}/),
        // Strategy 2: Look for JSON with "itinerary" key
        () => text.match(/\{[^}]*"itinerary"[^}]*\}/),
        // Strategy 3: Look for array of day objects
        () => text.match(/\[\s*\{[^}]*"day"[^}]*\}/),
        // Strategy 4: Look for any JSON-like structure
        () => text.match(/\{[^}]*"places"[^}]*\}/),
        // Strategy 5: Look for JSON with "activities" key
        () => text.match(/\{[^}]*"activities"[^}]*\}/)
      ];
      
      let extractedJSON = null;
      for (let i = 0; i < extractionStrategies.length; i++) {
        try {
          const match = extractionStrategies[i]();
          if (match) {
            console.log(`Strategy ${i + 1} found JSON match`);
            extractedJSON = match[0];
            break;
          }
        } catch (strategyError) {
          console.error(`Strategy ${i + 1} failed:`, strategyError.message);
        }
      }
      
      if (extractedJSON) {
        try {
          const fallbackJson = validateAndFixJSON(extractedJSON);
          console.log('Fallback JSON parsed:', fallbackJson);
          
          if (fallbackJson.itinerary && Array.isArray(fallbackJson.itinerary)) {
            const result = fallbackJson.itinerary.map((dayData, i) => ({
              day: `Day ${dayData.day || i + 1}`,
              date: dayData.date || '',
              dailyCost: dayData.dailyCost || '',
              dailyTips: dayData.dailyTips || '',
              activities: dayData.places.map(place => ({
                name: place.name || 'Unknown Place',
                time: place.time || '',
                description: place.description || '',
                transport: place.travelRoute || '',
                ticketPrice: place.ticketPrice || '',
                meal: place.meals || '',
                souvenir: place.souvenir || '',
                activities: place.activities || place.thingsToDo || [],
                tips: place.tips || ''
              }))
            }));
            console.log('Successfully parsed fallback itinerary:', result);
            return result;
          }
        } catch (fallbackError) {
          console.error('Fallback JSON parsing also failed:', fallbackError.message);
          console.error('Extracted JSON preview:', extractedJSON.substring(0, 500));
        }
      }
      
      // Last resort: try to manually construct JSON from text
      console.log('Attempting manual JSON construction...');
      try {
        const manualJSON = constructJSONFromText(text);
        if (manualJSON) {
          console.log('Manual JSON construction successful');
          return manualJSON;
        }
      } catch (manualError) {
        console.error('Manual JSON construction failed:', manualError.message);
      }
      
      // Return empty array if all parsing fails
      console.error('All JSON parsing attempts failed');
      console.error('Original text length:', text?.length);
      console.error('Original text preview:', text?.substring(0, 1000));
      return [];
    } catch (error) {
      console.error('Unexpected error in parsing:', error.message);
      console.error('Error stack:', error.stack);
      return [];
    }
  }

  function ItineraryDaysUI({ quickText, selectedHotel }) {
    const [parsed, setParsed] = useState([]);
    const [showJSON, setShowJSON] = useState(false);
    const [selectedDay, setSelectedDay] = useState(0);

    useEffect(() => {
      if (quickText) {
        const parsed = parseQuickItinerary(quickText);
        setParsed(parsed);
      }
    }, [quickText]);

    if (!parsed.length) return <div className="text-center p-8 text-gray-500">No itinerary found.</div>;

    // Color cycles for days
    const dayBg = [
      'border-blue-400 bg-blue-50',
      'border-orange-400 bg-orange-50',
      'border-green-400 bg-green-50',
    ];
    const badgeBg = [
      'bg-blue-200 text-blue-800',
      'bg-orange-200 text-orange-800',
      'bg-green-200 text-green-800',
    ];
    const headerGradient = [
      'from-blue-200 via-blue-50 to-white',
      'from-orange-200 via-orange-50 to-white',
      'from-green-200 via-green-50 to-white',
    ];
    const iconColor = [
      'text-blue-500',
      'text-orange-500',
      'text-green-500',
    ];

    // Function to parse multiple route options from Best Route selection
    const parseRouteOptions = (routeText) => {
      if (!routeText || !routeText.includes('Option')) {
        return null;
      }
      
      const options = [];
      const optionRegex = /Option (\d+):\s*([^|]+)/g;
      let match;
      
      while ((match = optionRegex.exec(routeText)) !== null) {
        const optionNumber = match[1];
        const routeDetails = match[2].trim();
        
        // Extract transport mode, time, and fare
        const transportMatch = routeDetails.match(/([^0-9]+)\s+(\d+)\s*(min|mins|minutes?|hour|hours?),\s*₹(\d+)/i);
        if (transportMatch) {
          options.push({
            number: optionNumber,
            transport: transportMatch[1].trim(),
            time: `${transportMatch[2]} ${transportMatch[3]}`,
            fare: `₹${transportMatch[4]}`,
            fullText: routeDetails
          });
        }
      }
      
      return options.length > 0 ? options : null;
    };

    // Function to get transport icon
    const getTransportIcon = (transportText) => {
      if (!transportText) return <Navigation className="w-4 h-4" />;
      
      const text = transportText.toLowerCase();
      if (text.includes('walk') || text.includes('foot')) return <User className="w-4 h-4" />;
      if (text.includes('taxi') || text.includes('car') || text.includes('rickshaw')) return <Car className="w-4 h-4" />;
      if (text.includes('train') || text.includes('metro')) return <Train className="w-4 h-4" />;
      if (text.includes('bus')) return <Bus className="w-4 h-4" />;
      return <Navigation className="w-4 h-4" />;
    };

    // Function to extract timing from transport text
    const extractTiming = (transportText) => {
      if (!transportText) return '15 mins';
      
      const timeMatch = transportText.match(/(\d+)\s*(min|mins|minutes?|hour|hours?)/i);
      if (timeMatch) {
        const time = timeMatch[1];
        const unit = timeMatch[2].toLowerCase();
        return `${time} ${unit}`;
      }
      return '15 mins'; // default
    };

    // Function to extract fare from transport text
    const extractFare = (transportText) => {
      if (!transportText) return '₹50';
      
      const fareMatch = transportText.match(/₹(\d+)/);
      if (fareMatch) {
        return `₹${fareMatch[1]}`;
      }
      return '₹50'; // default
    };

    // Function to extract ticket price
    const extractTicketPrice = (ticketText) => {
      if (!ticketText) return null;
      
      const priceMatch = ticketText.match(/₹(\d+)/);
      if (priceMatch) {
        return `₹${priceMatch[1]}`;
      }
      return null;
    };

    // Function to get meal icon
    const getMealIcon = (mealType) => {
      switch (mealType.toLowerCase()) {
        case 'breakfast':
        case 'coffee':
          return <Coffee className="w-4 h-4" />;
        case 'lunch':
        case 'dinner':
          return <Pizza className="w-4 h-4" />;
        case 'snacks':
        case 'dessert':
          return <IceCream className="w-4 h-4" />;
        default:
          return <Utensils className="w-4 h-4" />;
      }
    };

    // Function to suggest timing for activities
    const getSuggestedTiming = (index, totalActivities) => {
      const baseHour = 9; // Start at 9 AM
      let currentHour = baseHour;
      
      // Add time for each previous activity and travel
      for (let i = 0; i < index; i++) {
        // Assume 2-3 hours per activity + 30 mins travel
        currentHour += 2.5;
      }
      
      const hour = Math.floor(currentHour);
      const minutes = Math.round((currentHour - hour) * 60);
      const timeString = hour > 12 ? `${hour - 12}:${minutes.toString().padStart(2, '0')} PM` : `${hour}:${minutes.toString().padStart(2, '0')} AM`;
      return timeString;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
        <div className="max-w-7xl mx-auto py-8">
          {/* Header with enhanced styling */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                <div className="max-w-4xl mx-auto">
                  {/* Main Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    Your {destination} Journey
                  </h1>
                  
                  {/* City Description */}
                  <p className="text-lg sm:text-xl md:text-2xl opacity-95 mb-3 font-medium">
                    {cityDescription}
                  </p>
                  
                  {/* Trip Details */}
                  <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">{numberOfDays}-Day Trip</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">{selectedPlaces?.length || 0} Places</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">Personalized</span>
                    </div>
                  </div>
                  
                  {/* Save Itinerary Button at bottom right, bigger and more attractive */}
                  <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
                    <Button
                      onClick={handleSaveItinerary}
                      className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-extrabold text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-emerald-400/50 transition-all duration-300 transform hover:scale-110"
                      style={{ boxShadow: '0 8px 32px 0 rgba(34,197,94,0.25), 0 1.5px 8px 0 rgba(59,130,246,0.15)' }}
                    >
                      <span role="img" aria-label="save" className="mr-3">💾</span> Save Itinerary
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comprehensive Trip Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Navigation className="w-6 h-6 text-blue-600" />
              Trip Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Basic Trip Info */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Trip Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Destination:</span>
                    <span className="font-medium text-blue-800">{destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-medium text-blue-800">{numberOfDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Start Date:</span>
                    <span className="font-medium text-blue-800">{startDate}</span>
                  </div>
                  {endDate && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">End Date:</span>
                      <span className="font-medium text-blue-800">{endDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Travel Preferences */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-800">Travel Preferences</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Companion:</span>
                    <span className="font-medium text-green-800">{travelCompanion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Transport:</span>
                    <span className="font-medium text-green-800">{transport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Budget:</span>
                    <span className="font-medium text-green-800">{budget || 'Medium'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Places:</span>
                    <span className="font-medium text-green-800">{selectedPlaces?.length || 0} selected</span>
                  </div>
                </div>
              </div>

              {/* Food Preferences */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-orange-800">Food Preferences</h3>
                </div>
                <div className="space-y-2">
                  {foodOptions?.map((food, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-800">{food}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accommodation */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-800">Accommodation</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {selectedHotel ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Hotel:</span>
                        <span className="font-medium text-purple-800">{selectedHotel.name}</span>
                      </div>
                      {selectedHotel.location && (
                        <div className="flex justify-between">
                          <span className="text-purple-700">Location:</span>
                          <span className="font-medium text-purple-800">{selectedHotel.location}</span>
                        </div>
                      )}
                      {selectedHotel.rating && (
                        <div className="flex justify-between">
                          <span className="text-purple-700">Rating:</span>
                          <span className="font-medium text-purple-800">{selectedHotel.rating} ⭐</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-purple-700 text-sm">
                      No specific hotel selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64">
              <div className="bg-white rounded-2xl shadow p-4 sticky top-4">
                <h2 className="font-bold text-lg mb-4">Trip Overview</h2>
                <div className="space-y-2">
                  {parsed.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(idx)}
                      className={`w-full text-left rounded-xl px-4 py-3 transition font-medium
                        ${selectedDay === idx
                          ? "bg-gradient-to-r from-blue-500 to-orange-400 text-white shadow"
                          : "bg-gray-100 text-gray-800 hover:bg-blue-50"}
                      `}
                    >
                      <div className="text-base font-bold">Day {idx + 1}</div>
                      <div className="text-sm truncate">
                        {day.activities.map(a => a.name).join(" + ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Only show the selected day */}
              {(() => {
                const day = parsed[selectedDay];
                return (
                  <div
                    className={`rounded-2xl shadow-lg p-6 mb-10 border-l-8 ${dayBg[selectedDay % 3]}`}
                  >
                    {/* Header with gradient */}
                    <div className={`flex justify-between items-center mb-6 bg-gradient-to-r ${headerGradient[selectedDay % 3]} rounded-xl p-4`}>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${badgeBg[selectedDay % 3]}`}>Day {selectedDay + 1}</span>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <Star className={`w-6 h-6 ${iconColor[selectedDay % 3]}`} />
                          {day.activities.map(a => a.name).join(' + ') || `Day ${selectedDay + 1}`}
                        </h2>
                        <p className="text-gray-600">{day.activities.map(a => a.description).filter(Boolean).join(' | ')}</p>
                      </div>
                      {/* Removed the Get Directions button from here for clarity */}
                    </div>

                    {/* Daily Schedule Timeline */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        Daily Schedule
                      </h3>
                      
                      <div className="space-y-4">
                        {day.activities.map((activity, idx) => (
                          <div key={idx} className="relative">
                            {/* Timeline connector */}
                            {idx < day.activities.length - 1 && (
                              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300"></div>
                            )}
                            
                            <div className="flex gap-4">
                              {/* Time indicator */}
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300">
                                  <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-xs text-gray-500 mt-1 font-medium">
                                  {getSuggestedTiming(idx, day.activities.length)}
                                </div>
                              </div>
                              
                              {/* Activity card */}
                              <div className="flex-1 bg-white rounded-xl shadow-sm border p-4">
                                {/* Place Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-gray-800">{activity.name}</h3>
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name)}`, '_blank');
                                      }}
                                      className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 font-bold text-base hover:bg-green-200 transition border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
                                      aria-label={`Get directions to ${activity.name}`}
                                    >
                                      <MapPin className="w-5 h-5 text-green-500" />
                                      Directions
                                    </button>
                                  </div>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {activity.time || '2-3 hours'}
                                  </Badge>
                                </div>
                                
                                <p className="text-gray-600 mb-4 text-base">{activity.description}</p>

                                {/* Travel Route with enhanced styling */}
                                {idx === 0 ? (
                                  // First activity - from hotel/starting point
                                  <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        {getTransportIcon(activity.transport)}
                                      </div>
                                      <span className="font-semibold text-green-800 text-base">Starting Journey</span>
                                    </div>
                                    
                                    {/* Check if this is a Best Route with multiple options */}
                                    {(() => {
                                      const routeOptions = parseRouteOptions(activity.transport);
                                      if (routeOptions && transport === 'Best Route') {
                                        return (
                                          <div className="space-y-3">
                                            <div className="text-sm text-blue-700 font-medium mb-2">
                                              Multiple route options available:
                                            </div>
                                            {routeOptions.map((option, optionIdx) => (
                                              <div key={optionIdx} className="bg-white rounded-lg p-3 border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="font-semibold text-blue-800 text-sm">
                                                    Option {option.number}
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 text-xs">
                                                      <Clock className="w-3 h-3" />
                                                      {option.time}
                                                    </span>
                                                    <span className="text-green-600 font-medium text-sm">
                                                      {option.fare}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                                  <strong>Journey:</strong> {option.transport}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                              <span className="text-blue-700 font-medium">
                                                {selectedHotel ? `From ${selectedHotel.name}` : `From nearby ${destination} transport hub`}
                                              </span>
                                              <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  {extractTiming(activity.transport)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <span className="text-green-600 font-medium">{extractFare(activity.transport)}</span>
                                                </span>
                                              </div>
                                            </div>
                                            <div className="text-sm text-blue-600 bg-blue-100 p-2 rounded">
                                              <strong>Journey:</strong> {activity.transport || 'Walking distance'}
                                            </div>
                                            {!selectedHotel && (
                                              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                                                <strong>💡 Tip:</strong> Start your day from {destination} Central Bus Station or {destination} Airport for easy access to public transport
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                ) : (
                                  // Subsequent activities - from previous place
                                  <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        {getTransportIcon(activity.transport)}
                                      </div>
                                      <span className="font-semibold text-green-800">Travel Route</span>
                                    </div>
                                    
                                    {/* Check if this is a Best Route with multiple options */}
                                    {(() => {
                                      const routeOptions = parseRouteOptions(activity.transport);
                                      if (routeOptions && transport === 'Best Route') {
                                        return (
                                          <div className="space-y-3">
                                            <div className="text-sm text-orange-700 font-medium mb-2">
                                              Multiple route options from {day.activities[idx - 1].name}:
                                            </div>
                                            {routeOptions.map((option, optionIdx) => (
                                              <div key={optionIdx} className="bg-white rounded-lg p-3 border border-orange-200">
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="font-semibold text-orange-800 text-sm">
                                                    Option {option.number}
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 text-xs">
                                                      <Clock className="w-3 h-3" />
                                                      {option.time}
                                                    </span>
                                                    <span className="text-green-600 font-medium text-sm">
                                                      {option.fare}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                                                  <strong>Journey:</strong> {option.transport}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                              <span className="text-orange-700 font-medium">
                                                From {day.activities[idx - 1].name}
                                              </span>
                                              <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  {extractTiming(activity.transport)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <span className="text-green-600 font-medium">{extractFare(activity.transport)}</span>
                                                </span>
                                              </div>
                                            </div>
                                            <div className="text-sm text-orange-600 bg-orange-100 p-2 rounded">
                                              <strong>Journey:</strong> {activity.transport || 'Walking distance'}
                                            </div>
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}

                                {/* Activity Ticket Pricing (Optional) */}
                                {activity.ticketPrice && !activity.ticketPrice.toLowerCase().includes('free') && (
                                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 font-bold text-sm">₹</span>
                                      </div>
                                      <span className="font-semibold text-purple-800 text-base">Entry Ticket</span>
                                    </div>
                                    <div className="flex items-center justify-between text-base">
                                      <span className="text-purple-700">Admission Fee</span>
                                      <span className="text-purple-600 font-medium text-lg">{extractTicketPrice(activity.ticketPrice)}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Activities */}
                                <div className="mb-4">
                                  <span className="font-semibold text-gray-700 mb-3 block text-base flex items-center gap-2">
                                    <Star className="w-4 h-4 text-blue-500" />
                                    Things to do:
                                  </span>
                                  <div className="space-y-3">
                                    {activity.activities?.map((thing, i) => (
                                      <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-sm transition-all duration-200">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 shadow-sm"></div>
                                        <span className="text-gray-700 text-base leading-relaxed font-medium">{thing}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Tips */}
                                {activity.tips && (
                                  <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Star className="w-4 h-4 text-yellow-600" />
                                      <span className="font-semibold text-yellow-800">Pro Tip</span>
                                    </div>
                                    <p className="text-yellow-700 text-base">{activity.tips}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Return journey to hotel */}
                        {selectedHotel && (
                          <div className="relative">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-300">
                                  <MapPin className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-xs text-gray-500 mt-1 font-medium">
                                  Evening
                                </div>
                              </div>
                              
                              <div className="flex-1 bg-white rounded-xl shadow-sm border p-4">
                                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <Car className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-purple-800">Return Journey</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-purple-700 font-medium">
                                        Back to {selectedHotel.name}
                                      </span>
                                      <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          20 mins
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <span className="text-green-600 font-medium">₹150</span>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-sm text-purple-600 bg-purple-100 p-2 rounded text-base">
                                      <strong>Journey:</strong> Taxi or local transport back to accommodation
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Meal Suggestions with timing */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-purple-500" /> 
                        Meal Schedule - Day {selectedDay + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { type: 'Breakfast', time: '8:00 AM', icon: Coffee },
                          { type: 'Lunch', time: '1:00 PM', icon: Pizza },
                          { type: 'Snacks', time: '4:00 PM', icon: IceCream },
                          { type: 'Dinner', time: '8:00 PM', icon: Utensils }
                        ].map((meal, idx) => {
                          // Find a meal suggestion for each type from all activities
                          let mealSuggestion = day.activities
                            .map((a) => a.meal)
                            .find((m) => {
                              if (typeof m === 'string') {
                                return m.toLowerCase().includes(meal.type.toLowerCase());
                              } else if (typeof m === 'object' && m !== null) {
                                // If meal is an object, check if it has the current meal type (case-insensitive)
                                const key = Object.keys(m).find(k => k.toLowerCase() === meal.type.toLowerCase());
                                return key && typeof m[key] === 'string';
                              }
                              return false;
                            });
                          // If mealSuggestion is an object, extract the value for the current meal type
                          if (typeof mealSuggestion === 'object' && mealSuggestion !== null) {
                            const key = Object.keys(mealSuggestion).find(k => k.toLowerCase() === meal.type.toLowerCase());
                            mealSuggestion = key ? mealSuggestion[key] : undefined;
                          }
                          
                          const colorMap = [
                            'bg-orange-50 border-orange-200',
                            'bg-green-50 border-green-200',
                            'bg-blue-50 border-blue-200',
                            'bg-purple-50 border-purple-200',
                          ];
                          const iconColorMap = [
                            'text-orange-600',
                            'text-green-600',
                            'text-blue-600',
                            'text-purple-600',
                          ];
                          const IconComponent = meal.icon;
                          
                          return (
                            <div key={meal.type} className={`${colorMap[idx]} rounded-xl p-4 border`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 ${iconColorMap[idx].replace('text-', 'bg-').replace('-600', '-100')} rounded-full flex items-center justify-center`}>
                                  <IconComponent className={`w-5 h-5 ${iconColorMap[idx]}`} />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">{meal.type}</div>
                                  <div className="text-sm text-gray-500">{meal.time}</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700 text-base">
                                {mealSuggestion || 'Local restaurant nearby'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Enhanced Daily Summary with Cost Breakdown */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-blue-600" />
                        Day {selectedDay + 1} Summary & Insights
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cost Breakdown */}
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="text-green-600 font-bold">₹</span>
                            Cost Breakdown
                          </h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm text-green-700">Transport Costs:</span>
                              <span className="font-semibold text-green-600">
                                ₹{day.activities.reduce((total, activity) => {
                                  const fare = extractFare(activity.transport);
                                  return total + parseInt(fare.replace('₹', '') || '0');
                                }, 0) + (selectedHotel ? 150 : 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm text-blue-700">Activity Tickets:</span>
                              <span className="font-semibold text-blue-600">
                                ₹{day.activities.reduce((total, activity) => {
                                  const ticketPrice = activity.ticketPrice;
                                  if (ticketPrice) {
                                    const price = extractTicketPrice(ticketPrice);
                                    return total + (price ? parseInt(price.replace('₹', '') || '0') : 0);
                                  }
                                  return total;
                                }, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                              <span className="text-sm text-orange-700">Estimated Meals:</span>
                              <span className="font-semibold text-orange-600">
                                ₹{(() => {
                                  const mealCost = budget === 'low' ? 300 : budget === 'high' ? 800 : 500;
                                  return mealCost * 3; // 3 meals per day
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-purple-50 rounded border-t-2 border-purple-200">
                              <span className="text-sm font-semibold text-purple-700">Total Daily Cost:</span>
                              <span className="font-bold text-purple-600 text-lg">
                                ₹{(() => {
                                  const transportCost = day.activities.reduce((total, activity) => {
                                    const fare = extractFare(activity.transport);
                                    return total + parseInt(fare.replace('₹', '') || '0');
                                  }, 0) + (selectedHotel ? 150 : 0);
                                  
                                  const ticketCost = day.activities.reduce((total, activity) => {
                                    const ticketPrice = activity.ticketPrice;
                                    if (ticketPrice) {
                                      const price = extractTicketPrice(ticketPrice);
                                      return total + (price ? parseInt(price.replace('₹', '') || '0') : 0);
                                    }
                                    return total;
                                  }, 0);
                                  
                                  const mealCost = (() => {
                                    const mealCost = budget === 'low' ? 300 : budget === 'high' ? 800 : 500;
                                    return mealCost * 3;
                                  })();
                                  
                                  return transportCost + ticketCost + mealCost;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Travel Insights */}
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            Travel Insights
                          </h5>
                          <div className="space-y-3">
                            <div className="p-2 bg-blue-50 rounded">
                              <div className="text-sm font-medium text-blue-700 mb-1">Transport Mode:</div>
                              <div className="text-sm text-blue-600">{transport}</div>
                            </div>
                            <div className="p-2 bg-green-50 rounded">
                              <div className="text-sm font-medium text-green-700 mb-1">Places to Visit:</div>
                              <div className="text-sm text-green-600">{day.activities.length} destinations</div>
                            </div>
                            <div className="p-2 bg-orange-50 rounded">
                              <div className="text-sm font-medium text-orange-700 mb-1">Food Preferences:</div>
                              <div className="text-sm text-orange-600">{foodOptions?.join(', ')}</div>
                            </div>
                            <div className="p-2 bg-purple-50 rounded">
                              <div className="text-sm font-medium text-purple-700 mb-1">Travel Companion:</div>
                              <div className="text-sm text-purple-600">{travelCompanion}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Daily Tips */}
                      {day.dailyTips && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="font-semibold text-yellow-800">Daily Tips</span>
                          </div>
                          <p className="text-yellow-700 text-sm">{day.dailyTips}</p>
                        </div>
                      )}

                      {/* Budget Recommendations */}
                      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-600 font-bold">₹</span>
                          <span className="font-semibold text-gray-700">Budget Recommendations</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Based on your {budget || 'medium'} budget preference, we've optimized this itinerary for the best value. 
                          Consider carrying extra cash for souvenirs and unexpected expenses.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading component with progress and time estimation
  const LoadingSpinner = () => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      if (!loadingStartTime) return;

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - loadingStartTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate progress percentage
        const progressPercent = Math.min(95, (elapsed / estimatedTime) * 100);
        setProgress(progressPercent);
      }, 1000);

      return () => clearInterval(interval);
    }, [loadingStartTime, estimatedTime]);

    const remainingTime = Math.max(0, estimatedTime - elapsedTime);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Animated Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Creating Your Perfect Itinerary
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-6">
            Crafting a personalized {numberOfDays}-day journey with {selectedPlaces.length} amazing places
          </p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </div>
          </div>
          
          {/* Status Messages */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              {progress < 25 && "🔄 Analyzing your preferences and places..."}
              {progress >= 25 && progress < 50 && "🗺️ Planning optimal routes and timing..."}
              {progress >= 50 && progress < 75 && "🍽️ Finding perfect meal suggestions..."}
              {progress >= 75 && progress < 95 && "✨ Adding final touches and tips..."}
              {progress >= 95 && "🎉 Almost ready! Finalizing your itinerary..."}
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4 text-xs text-gray-500">
            💡 Tip: The more places you selected, the longer it takes to create the perfect itinerary
          </div>
        </div>
      </div>
    );
  };

  // Save Itinerary handler
  const handleSaveItinerary = async () => {
    try {
      if (!user) {
        alert('You must be logged in to save itineraries.');
        return;
      }
      const destination = sessionStorage.getItem('destination');
      const generatedItinerary = sessionStorage.getItem('generatedItinerary');
      const selectedPlaces = sessionStorage.getItem('selectedPlaces');
      const selectedHotel = sessionStorage.getItem('selectedHotel');
      if (destination && generatedItinerary) {
        // Compute a unique hash for this itinerary
        const itineraryHash = btoa(unescape(encodeURIComponent(JSON.stringify({ destination, selectedPlaces, selectedHotel }))));
        if (localStorage.getItem('savedItinerary_' + itineraryHash)) {
          alert('This itinerary is already saved.');
          return;
        }
        // Get packing list and checked items from sessionStorage
        const packingList = sessionStorage.getItem('packingList');
        const checkedItems = sessionStorage.getItem('checkedItems');
        const itineraryData = {
          userId: user.uid,
          destination,
          date: new Date().toLocaleDateString(),
          places: selectedPlaces ? JSON.parse(selectedPlaces) : [],
          hotel: selectedHotel ? JSON.parse(selectedHotel) : null,
          itinerary: generatedItinerary,
          packingList: packingList ? JSON.parse(packingList) : null,
          checkedItems: checkedItems ? JSON.parse(checkedItems) : null,
          timestamp: new Date().toISOString()
        };
        await addDoc(collection(db, 'itineraries'), itineraryData);
        localStorage.setItem('savedItinerary_' + itineraryHash, 'true');
        alert('Itinerary saved successfully!');
      } else {
        alert('No itinerary to save. Please generate an itinerary first.');
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Error saving itinerary. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (quickText) {
    return <ItineraryDaysUI quickText={quickText} selectedHotel={selectedHotel} />;
  }
  return <div className="text-center p-8 text-gray-500">No itinerary found.</div>;
};

export default ItineraryPage;
