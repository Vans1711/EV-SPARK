import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap, User } from 'lucide-react';
import SparkCoinsIndicator from './SparkCoinsIndicator';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get user initials for avatar
  const userInitials = user?.user_metadata?.name 
    ? `${user.user_metadata.name.charAt(0)}`
    : user?.email?.charAt(0) || 'U';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-8 lg:px-12',
        isScrolled ? 'py-3 backdrop-blur-xl bg-ev-dark-200/80 shadow-lg' : 'py-5 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <Zap className="h-7 w-7 text-ev-green-400 animate-pulse-slow" />
          <span className="text-xl font-bold tracking-tight text-white">
            EV <span className="text-ev-green-400">Spark</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/stations" 
            className={`text-sm font-medium transition-colors ${
              isActive('/stations') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
            }`}
          >
            Find Stations
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-colors ${
              isActive('/dashboard') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/payment-dashboard" 
            className={`text-sm font-medium transition-colors ${
              isActive('/payment-dashboard') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
            }`}
          >
            Payments
          </Link>
          <Link 
            to="/support" 
            className={`text-sm font-medium transition-colors ${
              isActive('/support') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
            }`}
          >
            Support
          </Link>
          
          {/* Add profile link directly in the navbar */}
          {user && (
            <Link 
              to="/profile" 
              className={`text-sm font-medium transition-colors ${
                isActive('/profile') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
              }`}
            >
              Profile
            </Link>
          )}
        </nav>

        {/* User is signed in */}
        {user ? (
          <div className="hidden md:flex items-center space-x-4">
            <SparkCoinsIndicator />
            <Link to="/profile">
              <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-ev-green-400 transition-all">
                <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                <AvatarFallback className="bg-ev-green-500 text-white text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <SparkCoinsIndicator />
            <Button 
              variant="ghost" 
              className="text-white hover:text-ev-green-400 hover:bg-white/5"
              asChild
            >
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button 
              className="bg-ev-green-500 hover:bg-ev-green-600 text-white"
              asChild
            >
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}

        <button
          className="md:hidden text-white hover:text-ev-green-400 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-ev-dark-100 border-t border-white/5 py-4 px-6 shadow-lg animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/stations" 
              className={`text-sm font-medium transition-colors ${
                isActive('/stations') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Stations
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/payment-dashboard" 
              className={`text-sm font-medium transition-colors ${
                isActive('/payment-dashboard') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Payments
            </Link>
            <Link 
              to="/support" 
              className={`text-sm font-medium transition-colors ${
                isActive('/support') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Support
            </Link>
            
            {user && (
              <Link 
                to="/profile" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/profile') ? 'text-ev-green-400' : 'text-white hover:text-ev-green-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-ev-green-500 text-white text-[10px]">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>Profile</span>
                </div>
              </Link>
            )}
            
            <div className="flex items-center pt-2 pb-2">
              <SparkCoinsIndicator />
            </div>
            
            <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
              {user ? (
                <Button 
                  variant="destructive" 
                  className="justify-center"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="justify-center text-white hover:text-ev-green-400 hover:bg-white/5"
                    asChild
                  >
                    <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button 
                    className="justify-center bg-ev-green-500 hover:bg-ev-green-600 text-white"
                    asChild
                  >
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
