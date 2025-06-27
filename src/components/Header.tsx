import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-2 rounded-full">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              Smart Trip Planner
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`text-lg font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`text-lg font-medium transition-colors ${
                location.pathname === '/login' 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Trip Planner
            </button>
          </nav>

          {/* Login/User Button */}
          {user ? (
            <div className="flex items-center space-x-3">
              <Avatar>
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || user.email} />
                ) : (
                  <AvatarFallback>
                    <Mail className="h-5 w-5 text-gray-500" />
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="hidden md:inline text-gray-700 font-medium">{user.displayName || user.email}</span>
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Log Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
