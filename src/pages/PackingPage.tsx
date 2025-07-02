import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { generatePackingListWithAI } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { db, auth } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY || "YOUR_TOGETHER_API_KEY";
const TOGETHER_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";

const PackingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [packingList, setPackingList] = useState<any>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [category: string]: { [item: string]: boolean } }>({});
  const [customItem, setCustomItem] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);

  // Read trip details
  const destination = location.state?.destination || sessionStorage.getItem('destination') || '';
  const numberOfDays = location.state?.numberOfDays || sessionStorage.getItem('numberOfDays') || '';
  const days = location.state?.days || sessionStorage.getItem('days') || '';
  const startDate = location.state?.startDate || sessionStorage.getItem('startDate') || '';
  const endDate = location.state?.endDate || sessionStorage.getItem('endDate') || '';
  const travelCompanion = location.state?.travelCompanion || sessionStorage.getItem('travelCompanion') || '';
  const budget = location.state?.budget || sessionStorage.getItem('budget') || '';
  const transport = location.state?.transport || sessionStorage.getItem('transport') || '';
  const weather = sessionStorage.getItem('weather') || '';
  const preferences = sessionStorage.getItem('preferences') || '';

  // Compose a unique key for each user's trip
  const tripKey = user && destination && startDate ? `${user.uid}_${destination}_${startDate}` : null;

  // Add city descriptions mapping
  const cityDescriptions: Record<string, string> = {
    mumbai: "The city of dreams, famous for its vibrant culture, historic landmarks, and delicious street food.",
    delhi: "India's capital, blending ancient monuments, bustling markets, and modern city life.",
    goa: "A coastal paradise famous for its beaches, nightlife, and Portuguese heritage.",
    pune: "A vibrant city known for its educational institutions, pleasant weather, and rich Maratha history.",
    kerala: "God's Own Country, known for its backwaters, lush greenery, and unique culture.",
    // Add more as needed
  };
  const cityKey = destination.trim().toLowerCase();
  const cityDescription = cityDescriptions[cityKey] || "Get ready for your amazing trip!";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !destination || !startDate) return;
    // Clear sessionStorage for packingList and checkedItems when trip changes
    sessionStorage.removeItem('packingList');
    sessionStorage.removeItem('checkedItems');
    async function loadPackingList() {
      setLoading(true);
      setError("");
      try {
        const docRef = doc(db, "packingLists", tripKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPackingList(docSnap.data().packingList);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        setError("Failed to load packing list from server.");
      }
      // If not found, generate a new one
      try {
        const aiPacking = await generatePackingListWithAI({
          destination,
          startDate,
          endDate,
          numberOfDays: numberOfDays || days,
          travelCompanion,
          budget,
          transport,
          weather,
          preferences,
          apiKey: TOGETHER_API_KEY,
          model: TOGETHER_MODEL,
        });
        setPackingList(aiPacking);
        await setDoc(doc(db, "packingLists", tripKey), { packingList: aiPacking });
      } catch (err: any) {
        setError(err.message || "Failed to generate packing list. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadPackingList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, destination, startDate]);

  // Initialize checkedItems when packingList loads
  useEffect(() => {
    if (packingList && packingList.categories) {
      const initialChecked: { [category: string]: { [item: string]: boolean } } = {};
      packingList.categories.forEach((cat: any) => {
        initialChecked[cat.name] = {};
        cat.items.forEach((item: string) => {
          initialChecked[cat.name][item] = false;
        });
      });
      setCheckedItems(initialChecked);
    }
  }, [packingList]);

  const handleCheckboxChange = (category: string, item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: !prev[category][item],
      },
    }));
  };

  const handleAddCustomItem = () => {
    if (!customItem.trim() || !customCategory) return;
    setCheckedItems((prev) => ({
      ...prev,
      [customCategory]: {
        ...prev[customCategory],
        [customItem]: false,
      },
    }));
    setCustomItem("");
    if (customInputRef.current) customInputRef.current.focus();
  };

  const totalItems = Object.values(checkedItems).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  const packedItems = Object.values(checkedItems).reduce((sum, cat) => sum + Object.values(cat).filter(Boolean).length, 0);
  const progress = totalItems ? Math.round((packedItems / totalItems) * 100) : 0;

  // Store packing list and checked items in sessionStorage whenever they change
  useEffect(() => {
    if (packingList) {
      sessionStorage.setItem('packingList', JSON.stringify(packingList));
    }
  }, [packingList]);

  useEffect(() => {
    if (checkedItems) {
      sessionStorage.setItem('checkedItems', JSON.stringify(checkedItems));
    }
  }, [checkedItems]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-4 text-lg font-semibold">Generating your AI-powered packing list...</div>
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }
  if (!packingList) {
    return <div className="text-center mt-8">No packing list found.</div>;
  }
  return (
    <div className="max-w-6xl mx-auto py-10 px-2">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-2xl shadow-xl p-6 md:p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-2">Your {destination} Journey</h1>
            <p className="text-center text-lg opacity-95 mb-3 font-medium">
              {cityDescription}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200">
        <div className="font-semibold mb-2 text-blue-800">{destination} Trip Packing Progress</div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{packedItems} of {totalItems} items packed</span>
          <span>{totalItems - packedItems} items remaining</span>
        </div>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-2 items-center bg-white/70 rounded-2xl shadow-md p-4 border border-gray-200">
        <input
          ref={customInputRef}
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 bg-white shadow-sm"
          placeholder="Enter item name..."
          value={customItem}
          onChange={e => setCustomItem(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 bg-white shadow-sm"
          value={customCategory}
          onChange={e => setCustomCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {packingList?.categories.map((cat: any) => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <button
          onClick={handleAddCustomItem}
          className="ml-0 sm:ml-2 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 text-white text-2xl font-bold shadow-lg hover:scale-110 hover:from-blue-600 hover:to-orange-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          title="Add item"
        >
          <span className="-mt-1">+</span>
        </button>
      </div>
      {packingList.tips && (
        <div className="mb-8 p-6 rounded-3xl shadow-2xl bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-50 border-l-8 border-yellow-300 animate-fade-in flex items-start gap-4 relative overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 shadow-lg mr-2">
            <span className="text-4xl drop-shadow-lg">🌤️</span>
          </div>
          <div>
            <div className="font-extrabold text-xl mb-2 bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-600 bg-clip-text text-transparent">
              Special Tips for Your Trip
            </div>
            <div className="text-yellow-900 text-base font-medium leading-relaxed">
              {packingList.tips}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {packingList?.categories.map((cat: any, idx: number) => {
          // Define a set of unique, light pastel gradient classes
          const gradients = [
            'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100',
            'bg-gradient-to-br from-green-100 via-teal-100 to-blue-100',
            'bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100',
            'bg-gradient-to-br from-pink-100 via-red-100 to-yellow-100',
            'bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100',
            'bg-gradient-to-br from-purple-100 via-fuchsia-100 to-red-100',
          ];
          const gradientClass = gradients[idx % gradients.length];
          return (
            <div
              key={cat.name}
              className={`rounded-2xl border-0 shadow-xl glass-card text-gray-800 p-6 animate-fade-in relative overflow-hidden transition-transform duration-300 hover:scale-105 ${gradientClass}`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="font-bold text-xl mb-3 flex items-center gap-2 drop-shadow-lg text-gray-900">
                {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                {cat.name}
                <span className="ml-auto text-xs text-gray-700 bg-white/40 px-2 py-1 rounded-full">
                  {Object.values(checkedItems[cat.name] || {}).filter(Boolean).length}/{Object.keys(checkedItems[cat.name] || {}).length}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(checkedItems[cat.name] || {}).map((item) => (
                  <div key={item} className="flex items-center gap-2 mb-2 bg-white/30 rounded-lg px-2 py-1 transition-all hover:bg-white/50">
                    <Checkbox
                      checked={checkedItems[cat.name][item]}
                      onCheckedChange={() => handleCheckboxChange(cat.name, item)}
                      className="accent-blue-200 w-4 h-4 border-white/60"
                    />
                    <span className={checkedItems[cat.name][item] ? "line-through text-gray-400 font-medium text-base" : "text-gray-800 font-medium text-base"}>{item}</span>
                    <button
                      className="ml-auto text-red-300 hover:text-red-500"
                      onClick={() => {
                        setCheckedItems(prev => {
                          const updated = { ...prev };
                          delete updated[cat.name][item];
                          return { ...updated };
                        });
                      }}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackingPage; 