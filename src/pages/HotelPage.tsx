import { useEffect, useState } from 'react';

const budgets = ['low', 'medium', 'high'];
const companions = ['solo', 'couple', 'family', 'group'];
const foods = ['Veg', 'Non-Veg', 'Vegan', 'Jain'];

const HotelPage = ({ destination = 'Mumbai', hotelState, setHotelState, selectedHotel, onSelectHotel }) => {
  const [page, setPage] = useState(0);
  const { hotels, filters, loading, error, lastSearched } = hotelState;
  const { budget, companion, food } = filters;
  const [shouldFetch, setShouldFetch] = useState(false);

  // Fetch hotels only when shouldFetch is true
  useEffect(() => {
    if (!shouldFetch) return;
    setHotelState(prev => ({ ...prev, loading: true, error: '' }));
    let filterText = '';
    if (budget) filterText += ` Budget: ${budget}.`;
    if (companion) filterText += ` Travel companion: ${companion}.`;
    if (food) filterText += ` Food preference: ${food}.`;
    const prompt = `List the top 1 hotels in ${destination} for a user with these preferences:${filterText} For each, provide: name, room_type (best suited for the travel companion type), price_per_person (in INR), food (Veg, Non-Veg, Vegan, etc.), companion_type (solo, couple, family, group), budget (low, medium, high), image_url (preferably from Wikimedia Commons or Unsplash). Respond ONLY with a valid JSON array of objects with these fields. Do not include any explanation, comments, or extra text.`;
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
        let parsed = [];
        try {
          parsed = JSON.parse(content);
        } catch {
          const firstBracket = content.indexOf('[');
          const lastBracket = content.lastIndexOf(']');
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            try {
              parsed = JSON.parse(content.substring(firstBracket, lastBracket + 1));
            } catch {
              setHotelState(prev => ({ ...prev, error: 'Sorry, could not parse hotel data.', loading: false, lastSearched: true }));
              setShouldFetch(false);
              return;
            }
          } else {
            setHotelState(prev => ({ ...prev, error: 'Sorry, could not find hotel data.', loading: false, lastSearched: true }));
            setShouldFetch(false);
            return;
          }
        }
        setHotelState(prev => ({ ...prev, hotels: parsed, loading: false, error: '', lastSearched: true }));
        setShouldFetch(false);
      })
      .catch(() => {
        setHotelState(prev => ({ ...prev, error: 'Failed to fetch hotels. Please try again.', loading: false, lastSearched: true }));
        setShouldFetch(false);
      });
  }, [shouldFetch, destination, budget, companion, food, setHotelState]);

  // Filtering logic (if you want to further filter after fetch)
  const filteredHotels = hotels.filter(hotel => {
    return (
      (!budget || hotel.budget === budget) &&
      (!companion || hotel.companion_type === companion) &&
      (!food || (hotel.food && hotel.food.toLowerCase().includes(food.toLowerCase())))
    );
  });

  const hotelsToShow = filteredHotels.slice(page * 6, (page + 1) * 6);
  const totalPages = Math.ceil(filteredHotels.length / 6);

  // Handler for clicking a hotel card
  const handleHotelClick = (hotel) => {
    if (onSelectHotel) onSelectHotel(hotel);
  };

  return (
    <div className="p-8 bg-orange-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Find Your Perfect Hotel</h1>
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <select value={budget} onChange={e => { setHotelState(prev => ({ ...prev, filters: { ...prev.filters, budget: e.target.value } })); setPage(0); }} className="p-2 rounded border">
          <option value="">All Budgets (per person)</option>
          {budgets.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
        </select>
        <select value={companion} onChange={e => { setHotelState(prev => ({ ...prev, filters: { ...prev.filters, companion: e.target.value } })); setPage(0); }} className="p-2 rounded border">
          <option value="">All Companions</option>
          {companions.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select value={food} onChange={e => { setHotelState(prev => ({ ...prev, filters: { ...prev.filters, food: e.target.value } })); setPage(0); }} className="p-2 rounded border">
          <option value="">All Food Types</option>
          {foods.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="flex justify-center mb-8">
        <button
          onClick={() => { setShouldFetch(true); setPage(0); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Search Hotels
        </button>
      </div>
      {loading ? (
        <div className="text-center text-lg text-gray-500">Loading hotels...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        lastSearched && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotelsToShow.map(hotel => (
                <div
                  key={hotel.name}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition border-2 ${selectedHotel && selectedHotel.name === hotel.name ? 'border-green-500' : 'border-transparent'}`}
                  onClick={() => handleHotelClick(hotel)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${hotel.name}`}
                >
                  <img src={hotel.image_url} alt={hotel.name} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">{hotel.name}</h2>
                    <div className="mb-1 text-gray-600">Room: <span className="font-semibold">{hotel.room_type}</span></div>
                    <div className="mb-1 text-gray-600">Price: <span className="font-semibold">{hotel.price_per_person || hotel.price}</span> <span className="text-xs">(per person)</span></div>
                    <div className="mb-1 text-gray-600">Food: <span className="font-semibold">{hotel.food}</span></div>
                    <button className="mt-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition">View Details</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-4">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50">Previous</button>
                <span className="px-4 py-2">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

export default HotelPage;
