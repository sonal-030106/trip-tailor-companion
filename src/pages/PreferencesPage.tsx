import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createHash } from 'crypto'; // If using Node.js, otherwise use a browser hash function
import { toast } from "@/hooks/use-toast";
import { generatePackingListWithAI } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface FormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelStyle: string;
  groupSize: string;
  interests: string;
  accommodationType: string;
  transportationType: string;
  dietaryRestrictions: string;
  accessibilityNeeds: string[];
  specialRequests: string;
}

interface Place {
  name: string;
  description: string;
  timeToVisit?: string;
  rating?: string;
  entryFee?: string;
}

interface Hotel {
  name: string;
  location?: string;
  description: string;
  pricePerNight?: string;
  rating?: string;
}

interface CategoriesState {
  [category: string]: {
    places?: Place[];
    subcategories?: {
      [subcategory: string]: {
        places?: Place[];
      };
    };
  };
}

const categories = [
  {
    name: "Adventure",
    color: "bg-pink-100",
    border: "border-pink-200",
    icon: "▲",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    subcategories: [
      { name: "Hiking", icon: "🥾" },
      { name: "Trekking", icon: "🥾" },
      { name: "Rafting", icon: "🛶" },
      { name: "Safaris", icon: "🦁" },
      { name: "Rock Climbing", icon: "🧗" },
      { name: "Paragliding", icon: "🪂" }
    ]
  },
  {
    name: "Culture & History",
    color: "bg-purple-100",
    border: "border-purple-200",
    icon: "🏛️",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
    subcategories: [
      { name: "Museums", icon: "🏛️" },
      { name: "Heritage Sites", icon: "🏠" },
      { name: "Art Galleries", icon: "🖼️" },
      { name: "Festivals", icon: "🎉" },
      { name: "Local Markets", icon: "🛒" },
      { name: "Traditional Shows", icon: "🎭" }
    ]
  },
  {
    name: "Nature",
    color: "bg-green-100",
    border: "border-green-200",
    icon: "🌿",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b",
    subcategories: [
      { name: "National Parks", icon: "🌲" },
      { name: "Botanical Gardens", icon: "🌸" },
      { name: "Wildlife Sanctuaries", icon: "🦒" },
      { name: "Beaches", icon: "🏖️" },
      { name: "Mountains", icon: "🏔️" },
      { name: "Eco-tours", icon: "🌱" }
    ]
  },
  {
    name: "Religion & Spirituality",
    color: "bg-yellow-100",
    border: "border-yellow-200",
    icon: "🕉️",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    subcategories: [
      { name: "Temples", icon: "⛩️" },
      { name: "Churches", icon: "⛪" },
      { name: "Monasteries", icon: "🏯" },
      { name: "Pilgrimages", icon: "🚶‍♂️" },
      { name: "Spiritual Retreats", icon: "🧘‍♀️" },
      { name: "Meditation Centers", icon: "🧘‍♂️" }
    ]
  },
  {
    name: "Local Events",
    color: "bg-pink-100",
    border: "border-pink-200",
    icon: "🎵",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    subcategories: [
      { name: "Concerts", icon: "🎤" },
      { name: "Shows", icon: "🎬" },
      { name: "Cultural Performances", icon: "🎭" },
      { name: "Festivals", icon: "🎉" },
      { name: "Exhibitions", icon: "🖼️" }
    ]
  },
  {
    name: "Hotels",
    color: "bg-blue-100",
    border: "border-blue-200",
    icon: "🏨",
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
    subcategories: [
      { name: "Luxury Hotels", icon: "⭐" },
      { name: "Boutique Hotels", icon: "🏩" },
      { name: "Budget Hotels", icon: "💸" },
      { name: "Resorts", icon: "🏝️" },
      { name: "Hostels", icon: "🛏️" },
      { name: "Homestays", icon: "🏠" }
    ]
  }
];

// Use Vite env variable for Together.ai API key
const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY || "YOUR_TOGETHER_API_KEY"; // Set VITE_TOGETHER_API_KEY in your .env file
const TOGETHER_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"; // updated model name

// JSON repair utility function
function repairJsonString(jsonString) {
  let repaired = jsonString;
  
  console.log("Starting JSON repair with:", repaired);

  // Remove features from combined strings like "name: Shaniwar Wada, description: ..."
  repaired = jsonString.replace(/"([^"]+):\s*([^"]+)"/g, '"$1": "$2"');
  
  // Fix missing quotes around property names
  repaired = repaired.replace(/(\w+):/g, '"$1":');
  
  // Fix missing quotes around string values
  repaired = repaired.replace(/:\s*([^",\{\}\[\]\s][^,\{\}\[\]]*[^",\{\}\[\]\s])\s*([,\}\]])/g, ': "$1"$2');
  
  // Remove trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix unescaped characters in strings
  repaired = repaired.replace(/\\/g, '\\\\');
  repaired = repaired.replace(/"/g, '\\"');
  repaired = repaired.replace(/\\"/g, '"');

  console.log("Finished JSON repair with:", repaired);
  return repaired;
}

async function fetchTogetherPlaces(prompt) {
  const startTime = Date.now();
  
  // Check if API key is properly configured
  if (!TOGETHER_API_KEY || TOGETHER_API_KEY === "YOUR_TOGETHER_API_KEY") {
    console.error("Together.ai API key is not configured. Please set VITE_TOGETHER_API_KEY in your .env file");
    return { 
      data: [], 
      responseTime: 0,
      error: "API key not configured. Please set VITE_TOGETHER_API_KEY in your .env file"
    };
  }
  
  try {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: TOGETHER_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response error:", response.status, errorText);
      return { 
        data: [], 
        responseTime: (Date.now() - startTime) / 1000,
        error: `API Error: ${response.status} - ${errorText}`
      };
    }
    
    const data = await response.json();
    const endTime = Date.now();
    const actualResponseTime = (endTime - startTime) / 1000;
    
    console.log("Together AI raw response:", data);
    console.log(`Actual API response time: ${actualResponseTime}s`);
    
    try {
      const text = data.choices?.[0]?.message?.content || "";
      console.log("Together AI text:", text);
      console.log("Raw response data:", data);
      
      // Clean the text - remove any markdown formatting
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      console.log("Cleaned text:", cleanedText);
      
      // Try to find JSON array with better error handling
      const jsonStart = cleanedText.indexOf("[");
      const jsonEnd = cleanedText.lastIndexOf("]");
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = cleanedText.slice(jsonStart, jsonEnd + 1);
        console.log("Extracted JSON string:", jsonString);
        
        // Try to fix common JSON issues before parsing
        let fixedJsonString = repairJsonString(jsonString);
        
        console.log("Original JSON string:", jsonString);
        console.log("Fixed JSON string:", fixedJsonString);
        
        try {
          const parsedData = JSON.parse(fixedJsonString);
          console.log("Successfully parsed JSON:", parsedData);
          
          // Validate the parsed data
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log("Valid array with", parsedData.length, "items");
            return { data: parsedData, responseTime: actualResponseTime };
          } else {
            console.log("Parsed data is not a valid array or is empty");
          }
        } catch (parseError) {
          console.error("JSON parse error after fixing:", parseError);
          console.log("Failed JSON string:", fixedJsonString);
          
          // Try a more aggressive repair approach
          console.log("Attempting aggressive JSON repair...");
          let aggressiveRepair = fixedJsonString;
          
          // Try to fix any remaining unquoted property names
          aggressiveRepair = aggressiveRepair.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          
          // Try to fix any remaining unquoted string values
          aggressiveRepair = aggressiveRepair.replace(/:\s*([^"{\[\]},\n]+)(?=[,}])/g, ': "$1"');
          
          console.log("Aggressively repaired JSON:", aggressiveRepair);
          
          try {
            const parsedData = JSON.parse(aggressiveRepair);
            console.log("Successfully parsed with aggressive repair:", parsedData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              return { data: parsedData, responseTime: actualResponseTime };
            }
          } catch (aggressiveError) {
            console.error("Aggressive repair also failed:", aggressiveError);
            
            // Final fallback: Try to extract individual objects manually
            console.log("Attempting manual object extraction...");
            try {
              const manualObjects = [];
              
              // Split by object boundaries and try to parse each
              const objectMatches = jsonString.match(/\{[^}]+\}/g);
              if (objectMatches) {
                for (const match of objectMatches) {
                  try {
                    // Try to fix common issues in individual objects
                    let fixedObject = match;
                    
                    // Fix property names without quotes
                    fixedObject = fixedObject.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                    
                    // Fix values without quotes
                    fixedObject = fixedObject.replace(/:\s*([^"{\[\]},\n]+)(?=[,}])/g, ': "$1"');
                    
                    // Fix arrays
                    fixedObject = fixedObject.replace(/"features:\s*\[([^\]]+)\]/g, function(match, p1) {
                      const items = p1.split(',').map(s => `"${s.replace(/(^"|"$)/g, '').trim()}"`);
                      return `"features": [${items.join(', ')}]`;
                    });
                    
                    const obj = JSON.parse(fixedObject);
                    if (obj && obj.name && obj.description) {
                      manualObjects.push(obj);
                      console.log("Successfully extracted object:", obj);
                    }
                  } catch (objError) {
                    console.log("Failed to parse individual object:", match);
                  }
                }
              }
              
              if (manualObjects.length > 0) {
                console.log("Successfully extracted objects manually:", manualObjects);
                return { data: manualObjects, responseTime: actualResponseTime };
              }
            } catch (manualError) {
              console.error("Manual extraction also failed:", manualError);
            }
          }
        }
      } else {
        console.log("No valid JSON array found in response");
        console.log("jsonStart:", jsonStart, "jsonEnd:", jsonEnd);
        console.log("Full cleaned text for debugging:", cleanedText);
      }
      
      // Fallback: try to extract individual place objects from the text
      console.log("Attempting fallback parsing...");
      const fallbackPlaces = [];
      const lines = cleanedText.split('\n');
      
      // Try multiple parsing strategies
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Strategy 1: Look for JSON-like patterns
        if (line.includes('"name"') || line.includes('"description"')) {
          // Try to extract a place object from surrounding lines
          const placeLines = lines.slice(Math.max(0, i-2), i+3);
          const placeText = placeLines.join('\n');
          
          // Look for name and description patterns
          const nameMatch = placeText.match(/"name"\s*:\s*"([^"]+)"/);
          const descMatch = placeText.match(/"description"\s*:\s*"([^"]+)"/);
          const timeMatch = placeText.match(/"timeToVisit"\s*:\s*"([^"]+)"/);
          
          if (nameMatch && descMatch) {
            const place = {
              name: nameMatch[1],
              description: descMatch[1],
              timeToVisit: timeMatch ? timeMatch[1] : "Anytime"
            };
            fallbackPlaces.push(place);
            console.log("Extracted fallback place (JSON pattern):", place);
          }
        }
        
        // Strategy 2: Look for numbered lists or bullet points
        if (line.match(/^\d+\.\s/) || line.match(/^[-*]\s/)) {
          const nextLine = lines[i + 1]?.trim() || "";
          const nextNextLine = lines[i + 2]?.trim() || "";
          
          if (line.length > 10 && (nextLine.length > 20 || nextNextLine.length > 20)) {
            const place = {
              name: line.replace(/^\d+\.\s|^[-*]\s/, '').trim(),
              description: nextLine || nextNextLine,
              timeToVisit: "Anytime"
            };
            fallbackPlaces.push(place);
            console.log("Extracted fallback place (list pattern):", place);
          }
        }
        
        // Strategy 3: Look for lines that seem like place names (capitalized, reasonable length)
        if (line.length > 5 && line.length < 50 && 
            line === line.charAt(0).toUpperCase() + line.slice(1) &&
            !line.includes(':') && !line.includes('"') && !line.includes('{') && !line.includes('}')) {
          
          const nextLine = lines[i + 1]?.trim() || "";
          if (nextLine.length > 20) {
            const place = {
              name: line,
              description: nextLine,
              timeToVisit: "Anytime"
            };
            fallbackPlaces.push(place);
            console.log("Extracted fallback place (name pattern):", place);
          }
        }
      }
      
      if (fallbackPlaces.length > 0) {
        console.log("Using fallback places:", fallbackPlaces);
        return { data: fallbackPlaces, responseTime: actualResponseTime };
      }
      
      return { data: [], responseTime: actualResponseTime };
    } catch (e) {
      console.error("Failed to parse Together AI response:", e);
      return { data: [], responseTime: actualResponseTime };
    }
  } catch (error) {
    const endTime = Date.now();
    const actualResponseTime = (endTime - startTime) / 1000;
    console.error("API call failed:", error);
    return { 
      data: [], 
      responseTime: actualResponseTime,
      error: error.message || "Unknown error occurred"
    };
  }
}

const PlaceCard = ({ place, isSelected, onSelect }) => (
  <div
    className={`rounded-2xl bg-gradient-to-br from-white to-orange-50 shadow-lg border p-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group relative overflow-hidden ${
      isSelected ? 'border-orange-600 ring-2 ring-orange-200 shadow-orange-200' : 'border-gray-200 hover:border-orange-300'
    }`}
    onClick={() => onSelect(place)}
  >
    {/* Decorative corner element */}
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 opacity-10 rounded-bl-full"></div>
    
    <div className="flex items-center mb-2 relative z-10">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={e => onSelect(place)}
        className="mr-3 accent-orange-600 w-5 h-5"
        onClick={e => e.stopPropagation()}
      />
      <div className="flex items-center gap-2">
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🌟</span>
        <div className="font-extrabold text-xl text-gray-900 truncate group-hover:text-orange-600 transition-colors duration-300" title={place.name}>
          {place.name}
        </div>
      </div>
    </div>
    
    <div className="text-gray-600 text-base font-medium mb-3 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300 relative z-10">
      {place.description}
    </div>

    {/* Rating */}
    {place.rating && (
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-lg">⭐</span>
          <span className="font-semibold text-gray-700">{place.rating}</span>
        </div>
      </div>
    )}

    {/* Entry Fee */}
    {place.entryFee && (
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Entry Fee:</span>
        <span className="text-sm px-3 py-1 rounded-full font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
          {place.entryFee}
        </span>
      </div>
    )}

    {/* Best Time to Visit */}
    {place.timeToVisit && (
      <div className="flex items-center gap-2 mt-auto relative z-10">
        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 font-semibold text-sm px-4 py-2 rounded-full border border-orange-200 group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300">
          <span className="text-lg">🕒</span>
          {place.timeToVisit}
        </span>
      </div>
    )}
  </div>
);

const HotelCard = ({ hotel, isSelected, onSelect }) => {
  // Get trip duration from sessionStorage
  const days = sessionStorage.getItem('days') || '1';
  const numberOfDays = parseInt(days) || 1;
  
  // Calculate total cost for the trip
  const calculateTotalCost = (pricePerNight) => {
    if (!pricePerNight) return null;
    
    // Extract numeric value from price string (e.g., "₹2500" -> 2500)
    const priceMatch = pricePerNight.match(/₹(\d+)/);
    if (priceMatch) {
      const basePrice = parseInt(priceMatch[1]);
      const totalCost = basePrice * numberOfDays;
      return `₹${totalCost.toLocaleString()}`;
    }
    return null;
  };
  
  const totalCost = calculateTotalCost(hotel.pricePerNight);
  
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-lg border p-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer group relative overflow-hidden ${
        isSelected ? 'border-blue-600 ring-2 ring-blue-200 shadow-blue-200' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => onSelect(hotel)}
    >
      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 rounded-bl-full"></div>
      
      <div className="flex items-center mb-2 relative z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={e => onSelect(hotel)}
          className="mr-3 accent-blue-600 w-5 h-5"
          onClick={e => e.stopPropagation()}
        />
        <div className="flex items-center gap-2">
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🏨</span>
          <div className="font-extrabold text-xl text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300" title={hotel.name}>
            {hotel.name}
          </div>
        </div>
      </div>
      
      <div className="text-gray-600 text-base font-medium mb-2 group-hover:text-gray-700 transition-colors duration-300 relative z-10">
        {hotel.location}
      </div>
      
      {hotel.description && (
        <div className="text-gray-500 text-sm mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors duration-300 relative z-10">
          {hotel.description}
        </div>
      )}

      {/* Rating */}
      {hotel.rating && (
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="font-semibold text-gray-700">{hotel.rating}</span>
          </div>
        </div>
      )}

      {/* Price per night */}
      {hotel.pricePerNight && (
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <span className="text-xs font-medium text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Price per night:</span>
          <span className="text-sm px-3 py-1 rounded-full font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
            {hotel.pricePerNight}
          </span>
        </div>
      )}

      {/* Total cost for trip */}
      {totalCost && (
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <span className="text-xs font-medium text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Total for {numberOfDays} day{numberOfDays > 1 ? 's' : ''}:</span>
          <span className="text-sm px-3 py-1 rounded-full font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
            {totalCost}
          </span>
        </div>
      )}

      {/* Features */}
      {hotel.features && hotel.features.length > 0 && (
        <div className="mb-3 relative z-10">
          <span className="text-xs font-medium text-gray-500 mb-2 block group-hover:text-gray-600 transition-colors duration-300">Features:</span>
          <div className="flex flex-wrap gap-2">
            {hotel.features.map((feature, index) => {
              // Define feature icons and colors
              const featureConfig = {
                'WiFi': { icon: '📶', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                'Parking': { icon: '🚗', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                'Veg Restaurant': { icon: '🥗', color: 'bg-green-100 text-green-700 border-green-200' },
                'AC': { icon: '❄️', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
                'Room Service': { icon: '🛎️', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                'Spa': { icon: '💆', color: 'bg-pink-100 text-pink-700 border-pink-200' },
                'Gym': { icon: '💪', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                'Pool': { icon: '🏊', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                'Restaurant': { icon: '🍽️', color: 'bg-red-100 text-red-700 border-red-200' },
                'Bar': { icon: '🍷', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                'Conference Room': { icon: '🏢', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                'Laundry': { icon: '👕', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                'Airport Shuttle': { icon: '✈️', color: 'bg-teal-100 text-teal-700 border-teal-200' },
                'Pet Friendly': { icon: '🐕', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                'Free Breakfast': { icon: '🍳', color: 'bg-lime-100 text-lime-700 border-lime-200' }
              };

              const config = featureConfig[feature] || { icon: '✅', color: 'bg-gray-100 text-gray-700 border-gray-200' };

              return (
                <div
                  key={index}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105 ${config.color}`}
                  title={feature}
                >
                  <span className="text-xs">{config.icon}</span>
                  <span className="hidden sm:inline">{feature}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback for old priceRange format */}
      {!hotel.pricePerNight && hotel.priceRange && (
        <div className="flex items-center gap-2 mt-auto relative z-10">
          <span className="text-xs font-medium text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Price Range:</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium border transition-all duration-300 ${
            hotel.priceRange.toLowerCase() === 'high' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200 group-hover:from-red-200 group-hover:to-pink-200' :
            hotel.priceRange.toLowerCase() === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200 group-hover:from-yellow-200 group-hover:to-orange-200' :
            'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 group-hover:from-green-200 group-hover:to-emerald-200'
          }`}>
            {hotel.priceRange}
          </span>
        </div>
      )}
    </div>
  );
};

export default function PreferencesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    travelStyle: "",
    groupSize: "",
    interests: "",
    accommodationType: "",
    transportationType: "",
    dietaryRestrictions: "",
    accessibilityNeeds: [],
    specialRequests: "",
  });

  const [categoriesData, setCategoriesData] = useState<CategoriesState>({});
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<string[]>([]);
  
  // Read preferences and destination from navigation state or sessionStorage
  const foodOption = location.state?.foodOption || sessionStorage.getItem('foodOption') || 'any';
  const companionType = location.state?.companionType || sessionStorage.getItem('companionType') || 'traveler';
  const budget = location.state?.budget || sessionStorage.getItem('budget') || 'medium';
  
  // Read hotel preferences from questionnaire
  const hotelBudget = location.state?.budget || sessionStorage.getItem('budget') || 'medium';
  const travelCompanion = location.state?.travelCompanion || sessionStorage.getItem('travelCompanion') || 'Solo';
  const mealPreferences = location.state?.foodOptions || JSON.parse(sessionStorage.getItem('foodOptions') || '["Mix"]');
  
  // Ensure destination is read from state or sessionStorage
  const [destination, setDestination] = useState(location.state?.destination || sessionStorage.getItem('destination') || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [categoryPlaces, setCategoryPlaces] = useState({});
  const [subcategoryPlaces, setSubcategoryPlaces] = useState({});
  const [hotelOptions, setHotelOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState({});
  const [subcategoryLoading, setSubcategoryLoading] = useState({});
  const [hotelLoading, setHotelLoading] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState("tourist");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [topPlaces, setTopPlaces] = useState([]);
  const [topPlacesLoading, setTopPlacesLoading] = useState(false);
  
  // Loading state variables for time estimation
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(8); // seconds
  const [currentLoadingType, setCurrentLoadingType] = useState<string>('');
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const [packingList, setPackingList] = useState(null);
  const [showPackingModal, setShowPackingModal] = useState(false);
  const [packingLoading, setPackingLoading] = useState(false);
  const [packingError, setPackingError] = useState("");
  // Add this state at the top of the PreferencesPage component
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Loading component with progress and time estimation for PreferencesPage
  const LoadingSpinner = ({ type, categoryName }) => {
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Animated Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {type === 'hotels' ? 'Finding Perfect Hotels' : 'Discovering Amazing Places'}
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-6">
            {type === 'hotels' 
              ? `Searching for the best hotels in ${destination}`
              : `Exploring ${categoryName} in ${destination}`
            }
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
          
          {/* Time Information */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Elapsed time:</span>
              <span className="font-semibold">{elapsedTime}s</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated remaining:</span>
              <span className="font-semibold">{remainingTime}s</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total estimated:</span>
              <span className="font-semibold">{estimatedTime}s</span>
            </div>
          </div>
          
          {/* Status Messages */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              {!isDataProcessed && progress < 25 && "🔍 Searching for the best options..."}
              {!isDataProcessed && progress >= 25 && progress < 50 && "📝 Gathering detailed information..."}
              {!isDataProcessed && progress >= 50 && progress < 75 && "✨ Curating top recommendations..."}
              {!isDataProcessed && progress >= 75 && progress < 95 && "🎯 Finalizing your selection..."}
              {!isDataProcessed && progress >= 95 && "🎉 Almost ready! Loading your results..."}
              {isDataProcessed && "✅ Data ready! Preparing your results..."}
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4 text-xs text-gray-500">
            💡 Tip: We're analyzing thousands of options to find the perfect matches for you
          </div>
        </div>
      </div>
    );
  };

  // Restore from sessionStorage on mount
  useEffect(() => {
    const cat = sessionStorage.getItem('categoryPlaces');
    if (cat) setCategoryPlaces(JSON.parse(cat));
    const sub = sessionStorage.getItem('subcategoryPlaces');
    if (sub) setSubcategoryPlaces(JSON.parse(sub));
    const hotels = sessionStorage.getItem('hotelOptions');
    console.log("Restoring hotels from sessionStorage:", hotels);
    if (hotels) {
      const parsedHotels = JSON.parse(hotels);
      console.log("Parsed hotels:", parsedHotels);
      setHotelOptions(parsedHotels);
    }
    
    // Restore selected places and hotels from sessionStorage
    const storedSelectedPlaces = sessionStorage.getItem('selectedPlaces');
    if (storedSelectedPlaces) {
      const parsedPlaces = JSON.parse(storedSelectedPlaces);
      console.log("Restoring selected places:", parsedPlaces);
      setSelectedPlaces(parsedPlaces);
    }
    
    const storedSelectedHotels = sessionStorage.getItem('selectedHotels');
    if (storedSelectedHotels) {
      const parsedHotels = JSON.parse(storedSelectedHotels);
      console.log("Restoring selected hotels:", parsedHotels);
      setSelectedHotels(parsedHotels);
    }
    
    // Check if data has already been loaded recently (within last 5 minutes)
    const lastLoadTime = sessionStorage.getItem('preferencesLastLoadTime');
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (lastLoadTime && (currentTime - parseInt(lastLoadTime)) < fiveMinutes) {
      console.log("Data was loaded recently, skipping reload");
      return;
    }
    
    // Set last load time
    sessionStorage.setItem('preferencesLastLoadTime', currentTime.toString());
  }, []);

  // Save to sessionStorage on update
  useEffect(() => {
    sessionStorage.setItem('categoryPlaces', JSON.stringify(categoryPlaces));
    // Set flag that categories have been loaded at least once
    if (Object.keys(categoryPlaces).length > 0) {
      sessionStorage.setItem('categoriesLoadedOnce', 'true');
    }
  }, [categoryPlaces]);
  useEffect(() => {
    sessionStorage.setItem('subcategoryPlaces', JSON.stringify(subcategoryPlaces));
  }, [subcategoryPlaces]);
  useEffect(() => {
    sessionStorage.setItem('hotelOptions', JSON.stringify(hotelOptions));
  }, [hotelOptions]);
  
  // Save selected places and hotels to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('selectedPlaces', JSON.stringify(selectedPlaces));
  }, [selectedPlaces]);
  useEffect(() => {
    sessionStorage.setItem('selectedHotels', JSON.stringify(selectedHotels));
  }, [selectedHotels]);

  // Clear on unmount (when leaving the page)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('categoryPlaces');
      sessionStorage.removeItem('subcategoryPlaces');
      // Keep selectedPlaces, selectedHotels, and hotelOptions persistent
      // sessionStorage.removeItem('hotelOptions'); // Keep hotels persistent
      // sessionStorage.removeItem('selectedPlaces'); // Keep selected places persistent
      // sessionStorage.removeItem('selectedHotels'); // Keep selected hotels persistent
    };
  }, []);

  // Fetch top places when destination changes
  useEffect(() => {
    if (destination && destination.trim()) {
      // Check if top places are already loaded for this destination
      const storedTopPlaces = sessionStorage.getItem('topPlaces');
      const storedDestination = sessionStorage.getItem('topPlacesDestination');
      
      if (storedTopPlaces && storedDestination === destination) {
        console.log("Top places already loaded for this destination, using cached data");
        setTopPlaces(JSON.parse(storedTopPlaces));
        setTopPlacesLoading(false);
        return;
      }
      
      fetchTopPlaces();
    }
  }, [destination]);

  // Check for journey details changes and reload categories if needed
  useEffect(() => {
    const checkJourneyDetailsChange = () => {
      const currentDestination = sessionStorage.getItem('destination');
      const currentTravelCompanion = sessionStorage.getItem('travelCompanion');
      const currentBudget = sessionStorage.getItem('budget');
      const currentFoodOptions = sessionStorage.getItem('foodOptions');
      
      const lastJourneyDetails = sessionStorage.getItem('lastJourneyDetails');
      const currentJourneyDetails = JSON.stringify({
        destination: currentDestination,
        travelCompanion: currentTravelCompanion,
        budget: currentBudget,
        foodOptions: currentFoodOptions
      });
      
      // Check if this is the first time loading
      const isFirstTime = !lastJourneyDetails;
      
      // Check if categories have been loaded at least once
      const categoriesLoadedOnce = sessionStorage.getItem('categoriesLoadedOnce') === 'true';
      
      if (!isFirstTime && lastJourneyDetails !== currentJourneyDetails && categoriesLoadedOnce) {
        console.log("Journey details changed (subsequent update), clearing category data");
        // Clear category data but keep hotels
        setCategoryPlaces({});
        setSubcategoryPlaces({});
        sessionStorage.removeItem('categoryPlaces');
        sessionStorage.removeItem('subcategoryPlaces');
        // Keep hotelOptions persistent
      }
      
      // Update last journey details
      sessionStorage.setItem('lastJourneyDetails', currentJourneyDetails);
    };
    
    checkJourneyDetailsChange();
  }, [destination, travelCompanion, budget, mealPreferences]);

  // Monitor selectedPlaces changes and clear itinerary cache when places change
  useEffect(() => {
    const lastSelectedPlaces = sessionStorage.getItem('lastSelectedPlaces');
    const currentSelectedPlaces = JSON.stringify(selectedPlaces.map(p => p.name).sort());
    
    // Check if this is the first time loading
    const isFirstTime = !lastSelectedPlaces;
    
    // Check if itinerary has been generated at least once
    const itineraryGeneratedOnce = sessionStorage.getItem('itineraryGeneratedOnce') === 'true';
    
    if (!isFirstTime && lastSelectedPlaces !== currentSelectedPlaces && itineraryGeneratedOnce) {
      console.log("Selected places changed (subsequent update), clearing itinerary cache");
      // Clear cached itinerary data since places changed
      sessionStorage.removeItem('generatedItinerary');
      sessionStorage.removeItem('itineraryDataHash');
      sessionStorage.setItem('itineraryGenerated', 'false');
    }
    
    // Update last selected places
    sessionStorage.setItem('lastSelectedPlaces', currentSelectedPlaces);
  }, [selectedPlaces]);

  // Function to fetch top 5 places for the destination
  const fetchTopPlaces = async () => {
    if (topPlaces.length > 0) return; // Only fetch if not present
    setTopPlacesLoading(true);
    
    const prompt = `Suggest the top 5 must-visit tourist attractions in ${destination}. 

Focus on the most popular and iconic places that are specific to ${destination}.

IMPORTANT: You must respond with ONLY a valid JSON array. Do not include any other text, explanations, or markdown formatting.

Format your response exactly like this:
[{"name": "Place Name", "description": "A short description of the place", "timeToVisit": "Best time to visit", "rating": "4.5/5", "entryFee": "₹500"}]

Example response:
[{"name": "Eiffel Tower", "description": "Iconic iron lattice tower offering panoramic city views", "timeToVisit": "Evening for light show", "rating": "4.8/5", "entryFee": "₹2000"}, {"name": "Louvre Museum", "description": "World's largest art museum housing the Mona Lisa", "timeToVisit": "Morning to avoid crowds", "rating": "4.6/5", "entryFee": "₹1500"}]

Respond with ONLY the JSON array:`;
    
    try {
      console.log("Fetching top places for destination:", destination);
      const result = await fetchTogetherPlaces(prompt);
      
      console.log("Top places API result:", result);
      
      if (result.error) {
        console.error("Top places API Error:", result.error);
        setTopPlacesLoading(false);
        return;
      }
      
      if (!result.data || !Array.isArray(result.data)) {
        console.error("Top places API returned invalid data:", result.data);
        setTopPlacesLoading(false);
        return;
      }
      
      console.log("Setting top places:", result.data);
      setTopPlaces(result.data);
      setTopPlacesLoading(false);
      
      // Store top places with destination for smart loading
      sessionStorage.setItem('topPlaces', JSON.stringify(result.data));
      sessionStorage.setItem('topPlacesDestination', destination);
      
      console.log("Top places successfully loaded and stored");
    } catch (error) {
      console.error("Error in fetchTopPlaces:", error);
      setTopPlacesLoading(false);
    }
  };

  // Generate places for a main category when selected
  const handleCategorySelect = async (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setSelectedSidebar("tourist");
    if (!destination) return;
    
    if (cat.name === "Hotels") {
      console.log("Hotels category clicked. Current hotelOptions:", hotelOptions);
      if (hotelOptions && hotelOptions.length > 0) {
        console.log("Hotels already loaded, skipping API call");
        // Hotels are already loaded, just return without setting loading state
        return;
      }
      console.log("Loading hotels for destination:", destination);
      setHotelLoading(true);
      setLoadingStartTime(Date.now());
      setEstimatedTime(6); // Initial estimate
      setCurrentLoadingType('hotels');
      setIsDataProcessed(false);
      
      const prompt = `Suggest the top 5 hotels in ${destination} based on these preferences:

Budget: ${hotelBudget}
Travel Companion: ${travelCompanion}
Meal Preferences: ${mealPreferences.join(', ')}

Consider the budget level, type of traveler, and food preferences when suggesting hotels.

IMPORTANT: You must respond with ONLY a valid JSON array. Do not include any other text, explanations, or markdown formatting.

Format your response exactly like this:
[{"name": "Hotel Name", "location": "Hotel location/address", "description": "Brief description of the hotel", "pricePerNight": "₹2500", "rating": "4.5/5"}]

Example response:
[{"name": "Grand Hotel", "location": "123 Main Street, Downtown", "description": "Luxury hotel with fine dining and spa facilities", "pricePerNight": "₹8500", "rating": "4.8/5"}, {"name": "Comfort Inn", "location": "456 Beach Road, Waterfront", "description": "Mid-range hotel with good amenities and sea view", "pricePerNight": "₹3500", "rating": "4.2/5"}]

CRITICAL: Provide REAL prices per night in Indian Rupees (₹). Use actual prices that hotels would charge, not price ranges.

Respond with ONLY the JSON array:`;
      
      // Display the prompt for debugging
      console.log("=== HOTELS PROMPT ===");
      console.log(prompt);
      console.log("=== END HOTELS PROMPT ===");
      
      const result = await fetchTogetherPlaces(prompt);
      
      // Check for errors
      if (result.error) {
        console.error("API Error:", result.error);
        alert(`Error: ${result.error}\n\nPlease check your API key configuration.`);
        setHotelLoading(false);
        setLoadingStartTime(null);
        setIsDataProcessed(false);
        return;
      }
      
      // Update with real response time
      setEstimatedTime(result.responseTime);
      
      // Set data immediately without delays
      setHotelOptions(result.data);
      setHotelLoading(false);
      setLoadingStartTime(null);
      setIsDataProcessed(false);
      
      return;
    }
    
    if (categoryPlaces[cat.name] && categoryPlaces[cat.name].length > 0) return; // Only fetch if not present
    setCategoryLoading((prev) => ({ ...prev, [cat.name]: true }));
    setLoadingStartTime(Date.now());
    setEstimatedTime(8); // Initial estimate
    setCurrentLoadingType('category');
    setIsDataProcessed(false);
    
    const prompt = `Suggest the top 5 tourist attractions in the category "${cat.name}" for the destination "${destination}". 

Focus on the most popular and must-visit places that are specific to ${destination} in this category.

CRITICAL: Respond with ONLY a valid JSON array. Do not include any thinking process, explanations, or markdown formatting.

Format your response exactly like this:
[{"name": "Place Name", "description": "A short description of the place", "timeToVisit": "Best time to visit", "rating": "4.5/5", "entryFee": "₹500"}]

Example response:
[{"name": "Eiffel Tower", "description": "Iconic iron lattice tower offering panoramic city views", "timeToVisit": "Evening for light show", "rating": "4.8/5", "entryFee": "₹2000"}, {"name": "Louvre Museum", "description": "World's largest art museum housing the Mona Lisa", "timeToVisit": "Morning to avoid crowds", "rating": "4.6/5", "entryFee": "₹1500"}]

Respond with ONLY the JSON array:`;

    // Display the prompt for debugging
    console.log(`=== ${cat.name.toUpperCase()} CATEGORY PROMPT ===`);
    console.log(prompt);
    console.log(`=== END ${cat.name.toUpperCase()} CATEGORY PROMPT ===`);
    
    const result = await fetchTogetherPlaces(prompt);
    
    console.log("Category result:", result);
    console.log("Category data:", result.data);
    console.log("Category response time:", result.responseTime);
    
    // Check for errors
    if (result.error) {
      console.error("API Error:", result.error);
      alert(`Error: ${result.error}\n\nPlease check your API key configuration.`);
      setCategoryLoading((prev) => ({ ...prev, [cat.name]: false }));
      setLoadingStartTime(null);
      setIsDataProcessed(false);
      return;
    }
    
    // Update with real response time
    setEstimatedTime(result.responseTime);
    
    // Set data immediately without delays
    console.log("Setting category places:", result.data);
    setCategoryPlaces((prev) => {
      const newState = { ...prev, [cat.name]: result.data };
      console.log("New category places state:", newState);
      return newState;
    });
    setCategoryLoading((prev) => ({ ...prev, [cat.name]: false }));
    setLoadingStartTime(null);
    setIsDataProcessed(false);
  };

  // Generate places for a subcategory when selected
  const handleSubcategorySelect = async (category: string, subcategory: string) => {
    const loadingKey = `${category}-${subcategory}`;
    setLoadingCategories(prev => [...prev, loadingKey]);
    
    try {
      const result = await fetchTogetherPlaces(
        `Suggest the top 5 ${subcategory} places in ${destination} for ${formData.travelStyle} travelers with budget ${formData.budget}. Focus on ${subcategory} experiences.

CRITICAL: Respond with ONLY a valid JSON array. Do not include any thinking process, explanations, or markdown formatting.

Format your response exactly like this:
[{"name": "Place Name", "description": "A short description of the place", "timeToVisit": "Best time to visit", "rating": "4.5/5", "entryFee": "₹500"}]

Respond with ONLY the JSON array:`
      );
      
      if (result.data && result.data.length > 0) {
        setCategoriesData(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            subcategories: {
              ...prev[category]?.subcategories,
              [subcategory]: {
                places: result.data
              }
            }
          }
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${subcategory} places:`, error);
    } finally {
      setLoadingCategories(prev => prev.filter(key => key !== loadingKey));
    }
  };

  // Get places for a subcategory (if generated)
  const getPlacesForSubcategory = (subcatName) => {
    return subcategoryPlaces[subcatName] || [];
  };

  // Modal close handler: only reset selection, not places
  const handleCloseCategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSidebar("tourist");
  };

  // Multi-select handlers
  const togglePlace = (place) => {
    console.log("Toggling place:", place.name);
    console.log("Current selectedPlaces:", selectedPlaces);
    setSelectedPlaces(prev => {
      const newSelection = prev.some(p => p.name === place.name)
        ? prev.filter(p => p.name !== place.name)
        : [...prev, place];
      console.log("New selectedPlaces:", newSelection);
      return newSelection;
    });
  };
  const toggleHotel = (hotel) => {
    console.log("Toggling hotel:", hotel.name);
    console.log("Current selectedHotels:", selectedHotels);
    setSelectedHotels(prev => {
      const newSelection = prev.some(h => h.name === hotel.name)
        ? prev.filter(h => h.name !== hotel.name)
        : [...prev, hotel];
      console.log("New selectedHotels:", newSelection);
      return newSelection;
    });
  };

  // Handler for Generate Itinerary button
  const handleShowItinerary = () => {
    if (selectedPlaces.length === 0) {
      alert('Please select at least one place to generate an itinerary.');
      return;
    }
    
    const allTripDetails = {
      destination: destination,
      selectedPlaces: selectedPlaces,
      selectedHotels: selectedHotels,
      selectedHotel: selectedHotels.length > 0 ? selectedHotels[0] : null,
      numberOfDays: location.state?.days || sessionStorage.getItem('days') || '',
      days: location.state?.days || sessionStorage.getItem('days') || '',
      endDate: (location.state?.endDate || sessionStorage.getItem('endDate') || ''),
      foodOptions: location.state?.foodOptions || JSON.parse(sessionStorage.getItem('foodOptions') || '[]'),
      startDate: location.state?.startDate || sessionStorage.getItem('startDate') || '',
      transport: location.state?.transport || sessionStorage.getItem('transport') || '',
      travelCompanion: location.state?.travelCompanion || sessionStorage.getItem('travelCompanion') || '',
      budget: location.state?.budget || sessionStorage.getItem('budget') || '',
      topPlaces: topPlaces, // Include top places for reference
    };
    Object.entries(allTripDetails).forEach(([key, value]) => {
      sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    
    // Clear cached itinerary data since new places are selected
    sessionStorage.removeItem('generatedItinerary');
    sessionStorage.removeItem('itineraryDataHash');
    sessionStorage.setItem('itineraryGenerated', 'false');
    
    navigate('/itinerary', { state: allTripDetails });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderSubcategory = (category: string, subcategory: string) => {
    const subcategoryData = categoriesData[category]?.subcategories?.[subcategory];
    const isLoading = loadingCategories.includes(`${category}-${subcategory}`);
    const hasPlaces = subcategoryData?.places && subcategoryData.places.length > 0;

    return (
      <div key={subcategory} className="ml-6 border-l-2 border-gray-200 pl-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">{subcategory}</h4>
          <div className="flex gap-2">
            {!hasPlaces && !isLoading && (
              <Button
                onClick={() => handleSubcategorySelect(category, subcategory)}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                Load Top 5 Places
              </Button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs text-gray-600">Loading top 5 places...</span>
            </div>
          </div>
        )}

        {hasPlaces && !isLoading && (
          <div className="mt-2">
            <h5 className="font-medium text-sm text-gray-700 mb-1">Top 5 Places:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subcategoryData.places.slice(0, 5).map((place, index) => (
                <div key={index} className="border rounded p-2 bg-gray-50">
                  <h6 className="font-medium text-xs">{place.name}</h6>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {place.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (category: string) => {
    const categoryData = categoriesData[category];
    const subcategories = categoryData?.subcategories || {};
    const isExpanded = expandedCategories.includes(category);
    const isLoading = loadingCategories.includes(category);
    const hasPlaces = categoryData?.places && categoryData.places.length > 0;

    return (
      <div key={category} className="border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCategories.includes(category)}
              onCheckedChange={(checked) => {
                setSelectedCategories(prev =>
                  checked
                    ? [...prev, category]
                    : prev.filter(c => c !== category)
                );
              }}
              className="accent-blue-500 w-5 h-5"
            />
            <h3 className="text-lg font-semibold">{category}</h3>
          </div>
          <div className="flex gap-2">
            {!hasPlaces && !isLoading && (
              <Button
                onClick={() => handleCategorySelect(category)}
                disabled={isLoading}
                size="sm"
              >
                Load Top 5 Places
              </Button>
            )}
            <Button
              onClick={() => toggleCategory(category)}
              variant="outline"
              size="sm"
            >
              {isExpanded ? "Hide" : "Show"} Subcategories
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading top 5 places...</span>
            </div>
          </div>
        )}

        {hasPlaces && !isLoading && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Top 5 Places:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryData.places.slice(0, 5).map((place, index) => (
                <div key={index} className="border rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-sm">{place.name}</h5>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {place.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {Object.keys(subcategories).map((subcategory) =>
              renderSubcategory(category, subcategory)
            )}
          </div>
        )}
      </div>
    );
  };

  async function handleGeneratePackingList() {
    setPackingLoading(true);
    setPackingError("");
    setShowPackingModal(true);
    try {
      // Gather trip details
      const packingData = {
        destination,
        startDate: location.state?.startDate || sessionStorage.getItem('startDate') || '',
        endDate: location.state?.endDate || sessionStorage.getItem('endDate') || '',
        numberOfDays: location.state?.days || sessionStorage.getItem('days') || '',
        travelCompanion: location.state?.travelCompanion || sessionStorage.getItem('travelCompanion') || '',
        budget: location.state?.budget || sessionStorage.getItem('budget') || '',
        transport: location.state?.transport || sessionStorage.getItem('transport') || '',
        weather: sessionStorage.getItem('weather') || '',
        preferences: sessionStorage.getItem('preferences') || '',
      };
      sessionStorage.setItem('packingData', JSON.stringify(packingData));

      // Create a hash of the trip data
      const dataString = JSON.stringify(packingData);
      function hashFnv32a(str) {
        let hval = 0x811c9dc5;
        for (let i = 0; i < str.length; ++i) {
          hval ^= str.charCodeAt(i);
          hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        return (hval >>> 0).toString(16);
      }
      const packingHash = hashFnv32a(dataString);
      sessionStorage.setItem('packingHash', packingHash);

      // Check if packing list for this hash already exists
      const cachedPackingList = sessionStorage.getItem(`packingList_${packingHash}`);
      if (cachedPackingList) {
        sessionStorage.setItem('packingList', cachedPackingList);
      } else {
        // Use shared utility for AI call
        const aiPacking = await generatePackingListWithAI({
          ...packingData,
          apiKey: TOGETHER_API_KEY,
          model: TOGETHER_MODEL,
        });
        sessionStorage.setItem('packingList', JSON.stringify(aiPacking));
        sessionStorage.setItem(`packingList_${packingHash}`, JSON.stringify(aiPacking));
      }

      setShowPackingModal(false);
      sessionStorage.setItem('autoSelectTab', 'packing');
      navigate('/packing');
      setTimeout(() => {
        if (window && window.sessionStorage) {
          window.sessionStorage.setItem('autoSelectTab', 'packing');
        }
      }, 500);
      toast({
        title: 'Packing List Ready',
        description: 'Your AI-generated packing list is ready in the Packing tab.',
        variant: 'default',
      });
    } catch (err) {
      setPackingError("Failed to generate packing list. Please try again.");
      toast({
        title: 'Packing List Error',
        description: 'Failed to generate AI packing list. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPackingLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-2">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Explore Categories
        </h1>
      </div>
      
      {/* Show categories immediately when destination is entered */}
      {destination && (
        <>
          <p className="text-center text-xl text-gray-700 mb-8">
            Choose a category to discover amazing places and experiences
            {destination && ` in ${destination}`}
          </p>
          
          {/* Destination input and Next button */}
          <div className="flex gap-4 justify-center mb-8">
            <input
              className="border rounded-lg px-4 py-2 text-lg w-72"
              placeholder="Enter your destination..."
              value={destination}
              onChange={(e) => { setDestination(e.target.value); sessionStorage.setItem('destination', e.target.value); }}
            />
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-lg disabled:opacity-50"
              disabled={!destination}
            >
              Next
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 justify-center">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`rounded-2xl border ${cat.border} ${cat.color} shadow-lg hover:shadow-2xl transition-all duration-300 p-4 flex flex-col w-[375px] h-[164px] cursor-pointer group hover:scale-105 relative overflow-hidden`}
                onClick={() => handleCategorySelect(cat)}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-bl-full"></div>
                <div className="flex-1 flex flex-col relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                    <span className="font-bold text-lg group-hover:text-white transition-colors duration-300">{cat.name}</span>
                  </div>
                  <div className="text-gray-700 text-sm mb-3 font-medium group-hover:text-white/90 transition-colors duration-300">
                    {cat.subcategories.length} subcategories
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {cat.subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub.name}
                        className="bg-white/90 border border-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1 font-medium shadow-sm group-hover:bg-white/80 transition-all duration-300"
                      >
                        <span>{sub.icon}</span>
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <span className="text-gray-500 text-sm font-medium group-hover:text-white/80 transition-colors duration-300">
                        +{cat.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modern Subcategory Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className={`${selectedCategory.color} p-6 border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{selectedCategory.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h2>
                    <p className="text-gray-600">Explore subcategories and discover amazing places</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseCategory}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <span className="w-6 h-6 text-gray-600 text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[70vh]">
              {/* Subcategories Sidebar - only for non-hotel categories */}
              {selectedCategory.name !== "Hotels" && (
                <div className="w-[340px] border-r bg-gray-50 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Subcategories</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div
                        onClick={() => setSelectedSidebar("tourist")}
                        className={`flex items-center space-x-3 p-2 rounded-lg text-left transition-all duration-200 text-sm mb-2 cursor-pointer ${selectedSidebar === "tourist" ? "bg-blue-100 border-blue-200 border" : "hover:bg-gray-100 border border-transparent"}`}
                      >
                        <span className="text-lg">🌟</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Tourist Attractions</div>
                          <div className="text-xs text-gray-500">
                            {categoryLoading[selectedCategory.name] && "Loading top 5 places..."}
                            {!categoryLoading[selectedCategory.name] && categoryPlaces[selectedCategory.name] && `${categoryPlaces[selectedCategory.name].length} places loaded`}
                            {!categoryLoading[selectedCategory.name] && !categoryPlaces[selectedCategory.name] && "Click to load top 5 places"}
                          </div>
                        </div>
                        {!categoryLoading[selectedCategory.name] && !categoryPlaces[selectedCategory.name] && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategorySelect(selectedCategory);
                            }}
                          >
                            Load
                          </Button>
                        )}
                      </div>
                      {/* Subcategories */}
                      {selectedCategory.subcategories.map((option, index) => {
                        const subcategoryData = categoriesData[selectedCategory.name]?.subcategories?.[option.name];
                        const isLoading = loadingCategories.includes(`${selectedCategory.name}-${option.name}`);
                        const hasPlaces = subcategoryData?.places && subcategoryData.places.length > 0;
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center space-x-3 p-2 rounded-lg text-left transition-all duration-200 text-sm cursor-pointer ${selectedSidebar === option.name ? "bg-blue-100 border-blue-200 border" : "hover:bg-gray-100 border border-transparent"}`}
                            onClick={() => {
                              if (!hasPlaces && !isLoading) {
                                handleSubcategorySelect(selectedCategory.name, option.name);
                              }
                              setSelectedSidebar(option.name);
                            }}
                          >
                            <span className="text-lg">{option.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.name}</div>
                              <div className="text-xs text-gray-500">
                                {isLoading && "Loading top 5 places..."}
                                {!isLoading && hasPlaces && `${subcategoryData.places.length} places loaded`}
                                {!isLoading && !hasPlaces && "Click to load top 5 places"}
                              </div>
                            </div>
                            {!hasPlaces && !isLoading && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubcategorySelect(selectedCategory.name, option.name);
                                }}
                              >
                                Load
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Places Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {selectedCategory.name === "Hotels" ? (
                    <>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                          Recommended Hotels
                        </h3>
                        <p className="text-gray-600 text-lg">
                          Based on your preferences: <span className="font-semibold text-blue-600">{hotelBudget}</span> budget, <span className="font-semibold text-blue-600">{travelCompanion}</span> travel, <span className="font-semibold text-blue-600">{mealPreferences.join(', ')}</span> meals
                        </p>
                      </div>
                      {hotelLoading && (
                        <div className="flex justify-center items-center h-32">
                          <span className="text-blue-600 font-bold text-xl animate-pulse">Loading...</span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {hotelOptions.map((hotel, idx) => (
                          <HotelCard
                            key={idx}
                            hotel={hotel}
                            isSelected={selectedHotels.some(h => h.name === hotel.name)}
                            onSelect={toggleHotel}
                          />
                        ))}
                      </div>
                      {!hotelLoading && hotelOptions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No hotels found.</div>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedSidebar === "tourist" && (
                        <>
                          <div className="mb-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                              Tourist Attractions
                            </h3>
                            <p className="text-gray-600 text-lg">
                              Discover the best attractions in <span className="font-semibold text-blue-600">{destination}</span>
                            </p>
                          </div>
                          {categoryLoading[selectedCategory.name] && selectedSidebar === "tourist" && (
                            <div className="flex justify-center items-center h-32">
                              <span className="text-blue-600 font-bold text-xl animate-pulse">Loading...</span>
                            </div>
                          )}
                          <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            {(() => {
                              console.log("Rendering tourist attractions for category:", selectedCategory.name);
                              console.log("Category places data:", categoryPlaces);
                              console.log("Current category places:", categoryPlaces[selectedCategory.name]);
                              console.log("Is loading:", categoryLoading[selectedCategory.name]);
                              return (categoryPlaces[selectedCategory.name] || []).slice(0, 5).map((place, idx) => (
                                <PlaceCard
                                  key={idx}
                                  place={place}
                                  isSelected={selectedPlaces.some(p => p.name === place.name)}
                                  onSelect={togglePlace}
                                />
                              ));
                            })()}
                          </div>
                          {(!categoryLoading[selectedCategory.name] && (!categoryPlaces[selectedCategory.name] || categoryPlaces[selectedCategory.name].length === 0)) && (
                            <div className="text-center py-12">
                              <div className="text-4xl mb-4">🔍</div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No tourist attractions found
                              </h3>
                              <p className="text-gray-600">
                                Click the "Load" button to discover top 5 tourist attractions in {destination}.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {selectedSidebar !== "tourist" && selectedSidebar && (
                        <>
                          <div className="mb-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                              {selectedSidebar}
                            </h3>
                            <p className="text-gray-600 text-lg">
                              Discover the best <span className="font-semibold text-blue-600">{selectedSidebar.toLowerCase()}</span> experiences in <span className="font-semibold text-blue-600">{destination}</span>
                            </p>
                          </div>
                          {loadingCategories.includes(`${selectedCategory.name}-${selectedSidebar}`) && (
                            <div className="flex justify-center items-center h-32">
                              <span className="text-blue-600 font-bold text-xl animate-pulse">Loading...</span>
                            </div>
                          )}
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            {(() => {
                              const subcategoryData = categoriesData[selectedCategory.name]?.subcategories?.[selectedSidebar];
                              const places = subcategoryData?.places || [];
                              console.log("Rendering subcategory places for:", selectedSidebar);
                              console.log("Subcategory data:", subcategoryData);
                              console.log("Places:", places);
                              return places.slice(0, 5).map((place, idx) => (
                                <PlaceCard
                                  key={idx}
                                  place={place}
                                  isSelected={selectedPlaces.some(p => p.name === place.name)}
                                  onSelect={togglePlace}
                                />
                              ));
                            })()}
                          </div>
                          {(() => {
                            const subcategoryData = categoriesData[selectedCategory.name]?.subcategories?.[selectedSidebar];
                            const places = subcategoryData?.places || [];
                            const isLoading = loadingCategories.includes(`${selectedCategory.name}-${selectedSidebar}`);
                            
                            if (places.length === 0 && !isLoading) {
                              return (
                                <div className="text-center py-12">
                                  <div className="text-4xl mb-4">🔍</div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No places found
                                  </h3>
                                  <p className="text-gray-600">
                                    Click the "Load" button to discover top 5 {selectedSidebar.toLowerCase()} places.
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedPlaces.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
          {/* Place count indicator */}
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 text-sm">
            <div className="font-semibold text-gray-800">
              {selectedPlaces.length} places selected
            </div>
            <div className="text-gray-600">
              {location.state?.days || sessionStorage.getItem('days') || '0'}-day trip
            </div>
          </div>
          {/* Generate Packing List button */}
          <button
            className="bg-green-500 text-white px-8 py-3 rounded-full shadow-lg font-bold text-lg hover:bg-green-600 transition"
            onClick={handleGeneratePackingList}
          >
            Generate Packing List
          </button>
          {/* Generate Itinerary button */}
          <button
            className="bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg font-bold text-lg hover:bg-blue-700 transition"
            onClick={handleShowItinerary}
          >
            Generate Itinerary
          </button>
        </div>
      )}
      {/* Packing List Modal */}
      {showPackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowPackingModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-center">AI Packing List</h2>
            {packingLoading && <div className="text-center text-blue-600">Generating packing list...</div>}
            {packingError && <div className="text-center text-red-600">{packingError}</div>}
            {packingList && packingList.categories && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {packingList.categories.map((cat, idx) => (
                  <div key={idx}>
                    <div className="font-semibold text-lg mb-1">{cat.name}</div>
                    <ul className="list-disc list-inside text-gray-700">
                      {cat.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Loading Spinner for AI Generation */}
      {loadingStartTime && (
        <LoadingSpinner 
          type={currentLoadingType} 
          categoryName={selectedCategory?.name || selectedSubcategory || 'places'} 
        />
      )}
    </div>
  );
}