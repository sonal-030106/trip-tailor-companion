import { Button } from "@/components/ui/button";
import { Plane, Map, User, LogOut, Menu, X, Calendar, Star } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);
  const [showItinerariesDropdown, setShowItinerariesDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Load saved itineraries from localStorage
  useEffect(() => {
    const loadSavedItineraries = () => {
      try {
        const saved = localStorage.getItem('savedItineraries');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSavedItineraries(parsed);
        }
      } catch (error) {
        console.error('Error loading saved itineraries:', error);
      }
    };

    loadSavedItineraries();
    // Listen for storage changes
    window.addEventListener('storage', loadSavedItineraries);
    return () => window.removeEventListener('storage', loadSavedItineraries);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Function to reset session storage when going home
  const handleHomeClick = () => {
    // Clear all session storage data
    sessionStorage.clear();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Function to save current itinerary
  const saveCurrentItinerary = async () => {
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
        const itineraryData = {
          userId: user.uid,
          destination,
          date: new Date().toLocaleDateString(),
          places: selectedPlaces ? JSON.parse(selectedPlaces) : [],
          hotel: selectedHotel ? JSON.parse(selectedHotel) : null,
          itinerary: generatedItinerary,
          timestamp: new Date().toISOString()
        };
        await addDoc(collection(db, 'itineraries'), itineraryData);
        alert('Itinerary saved successfully!');
        // Refresh saved itineraries
        fetchSavedItineraries();
      } else {
        alert('No itinerary to save. Please generate an itinerary first.');
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Error saving itinerary. Please try again.');
    }
  };

  // Function to fetch saved itineraries for the logged-in user
  const fetchSavedItineraries = async () => {
    if (!user) return;
    try {
      setSavedItineraries([]); // Optionally show loading state
      const q = query(collection(db, 'itineraries'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const itineraries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedItineraries(itineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  };

  // Fetch itineraries when user logs in
  useEffect(() => {
    if (user) fetchSavedItineraries();
  }, [user]);

  // Function to delete saved itinerary from Firestore
  const deleteSavedItinerary = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'itineraries', id));
      setSavedItineraries(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  // Function to load saved itinerary
  const loadSavedItinerary = (itinerary: any) => {
    try {
      sessionStorage.setItem('destination', itinerary.destination);
      sessionStorage.setItem('generatedItinerary', itinerary.itinerary);
      if (itinerary.places) {
        sessionStorage.setItem('selectedPlaces', JSON.stringify(itinerary.places));
      }
      if (itinerary.hotel) {
        sessionStorage.setItem('selectedHotel', JSON.stringify(itinerary.hotel));
      }
      navigate('/itinerary');
      setShowItinerariesDropdown(false);
    } catch (error) {
      console.error('Error loading itinerary:', error);
      alert('Error loading itinerary. Please try again.');
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleHomeClick}>
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl group-hover:bg-white/30 transition-all duration-300 shadow-lg">
              <Plane className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
                Smart Trip Planner
              </h1>
              <p className="text-xs text-blue-100 opacity-80">Plan • Explore • Discover</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button
              onClick={handleHomeClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                location.pathname === '/' 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Map className="h-4 w-4" />
              Home
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                location.pathname === '/login' 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Trip Planner
            </button>

            {/* My Itineraries Dropdown */}
            <DropdownMenu open={showItinerariesDropdown} onOpenChange={setShowItinerariesDropdown}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-300">
                  <Star className="h-4 w-4" />
                  My Itineraries
                  {savedItineraries.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {savedItineraries.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Saved Itineraries
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedItineraries.length === 0 ? (
                  <DropdownMenuItem disabled className="text-gray-500">
                    No saved itineraries yet
                  </DropdownMenuItem>
                ) : (
                  savedItineraries.map((itinerary) => (
                    <DropdownMenuItem
                      key={itinerary.id}
                      className="flex flex-col items-start p-3 hover:bg-blue-50 cursor-pointer"
                      onClick={() => loadSavedItinerary(itinerary)}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-semibold text-gray-800">{itinerary.destination}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSavedItinerary(itinerary.id);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {itinerary.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Map className="h-3 w-3" />
                          {itinerary.places?.length || 0} places
                        </span>
                        {itinerary.hotel && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Hotel
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  onClick={saveCurrentItinerary}
                >
                  💾 Save Current Itinerary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="border-2 border-white/20 hover:border-white/40 transition-all duration-300">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName || user.email} />
                  ) : (
                    <AvatarFallback className="bg-white/20 text-white">
                      <Mail className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden md:inline text-white font-medium">{user.displayName || user.email}</span>
                <Button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden bg-white/20 p-2 rounded-lg text-white hover:bg-white/30 transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/20">
            <nav className="flex flex-col space-y-2 pt-4">
              <button
                onClick={handleHomeClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Map className="h-4 w-4" />
                Home
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === '/login' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Trip Planner
              </button>

              <button
                onClick={() => {
                  setShowItinerariesDropdown(!showItinerariesDropdown);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                <Star className="h-4 w-4" />
                My Itineraries
                {savedItineraries.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {savedItineraries.length}
                  </span>
                )}
              </button>

              <button
                onClick={saveCurrentItinerary}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-blue-100 hover:bg-white/10 transition-all duration-300"
              >
                💾 Save Current Itinerary
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
