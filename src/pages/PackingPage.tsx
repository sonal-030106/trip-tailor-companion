import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { generatePackingListWithAI } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Hash trip data for caching
  const tripData = { destination, numberOfDays, days, startDate, endDate, travelCompanion, budget, transport, weather, preferences };
  const dataString = JSON.stringify(tripData);
  function hashFnv32a(str: string) {
    let hval = 0x811c9dc5;
    for (let i = 0; i < str.length; ++i) {
      hval ^= str.charCodeAt(i);
      hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return (hval >>> 0).toString(16);
  }
  const packingHash = hashFnv32a(dataString);

  useEffect(() => {
    // Always load the last packing list from sessionStorage on mount
    const cached = sessionStorage.getItem('packingList');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.categories)) {
          setPackingList(parsed);
          setLoading(false);
          return;
        }
      } catch {
        // Parsing error, clear and force reload
        sessionStorage.removeItem('packingList');
      }
    }
    // If no cached packing list, generate a new one
    async function fetchPackingList() {
      setLoading(true);
      setLoadingStartTime(Date.now());
      setEstimatedTime(10);
      setError("");
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
        sessionStorage.setItem('packingList', JSON.stringify(aiPacking));
      } catch (err: any) {
        setError(err.message || "Failed to generate packing list. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchPackingList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <h1 className="text-4xl font-bold text-center mb-2">Your Mumbai Journey</h1>
        <p className="text-center text-lg text-gray-600 mb-4">
          The city of dreams, famous for its vibrant culture, historic landmarks, and delicious street food.
        </p>
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-2">Mumbai Trip Packing Progress</div>
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
      <div className="mb-6 flex gap-2 items-center">
        <input
          ref={customInputRef}
          type="text"
          className="border rounded px-3 py-2 w-64"
          placeholder="Enter item name..."
          value={customItem}
          onChange={e => setCustomItem(e.target.value)}
        />
        <select
          className="border rounded px-2 py-2"
          value={customCategory}
          onChange={e => setCustomCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {packingList?.categories.map((cat: any) => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <Button onClick={handleAddCustomItem} className="ml-2">+</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {packingList?.categories.map((cat: any, idx: number) => (
          <div key={cat.name} className={`rounded-xl border p-4 shadow-sm bg-white`}>
            <div className="font-bold text-lg mb-2 flex items-center gap-2">
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
              <span className="ml-auto text-xs text-gray-400">{Object.values(checkedItems[cat.name] || {}).filter(Boolean).length}/{Object.keys(checkedItems[cat.name] || {}).length}</span>
            </div>
            <div className="max-h-40 overflow-y-auto pr-2">
              {Object.keys(checkedItems[cat.name] || {}).map((item) => (
                <div key={item} className="flex items-center gap-2 mb-1">
                  <Checkbox
                    checked={checkedItems[cat.name][item]}
                    onCheckedChange={() => handleCheckboxChange(cat.name, item)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span className={checkedItems[cat.name][item] ? "line-through text-gray-400" : ""}>{item}</span>
                  <button
                    className="ml-auto text-red-400 hover:text-red-600"
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
        ))}
      </div>
      <div className="mb-8">
        <div className="font-bold text-lg mb-2">Mumbai Trip Highlights</div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">🎢 EsselWorld</div>
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-medium">🏖️ Juhu Beach</div>
          <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-medium">🎤 Arijit Concert</div>
        </div>
      </div>
    </div>
  );
};

export default PackingPage; 