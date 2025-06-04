"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { checkAuth, getUserData } from './actions';

interface UserData {
  name: string;
  username?: string;
  email?: string;
  profile_picture_id?: number | null;
  is_verified?: boolean;
  role?: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const router = useRouter();

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUserType(authStatus.userType);

      // Fetch user data if authenticated
      if (authStatus.isAuthenticated) {
        await fetchUserData();
      }
    };

    verifyAuth();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoadingUser(true);
      const data = await getUserData();
      if (data && data.name) {
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleDashboard = () => {
    if (userType === 'admin') {
      router.push('/admin-dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleAskAI = () => {
    router.push('/ask-ai');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const AuthButtons = () => (
    <>
      <Button size='md' variant="ghost" onClick={handleLogin} className='text-[20px] font-medium'>
        Login
      </Button>
      <Button size='md' variant="outline" onClick={handleSignup} className='text-[20px] font-medium'>
        Sign Up
      </Button>
    </>
  );

  const ProfilePicture = ({ size = "w-12 h-12", showName = false }: { size?: string; showName?: boolean }) => {
    const [imageError, setImageError] = useState(false);

    if (isLoadingUser) {
      return (
        <div className={`${size} rounded-full bg-gray-300 animate-pulse flex items-center justify-center`}>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    const hasProfilePicture = userData?.profile_picture_id && !imageError;
    
    // Extract size values for Next.js Image component
    const sizeClass = size.split(' ');
    const widthClass = sizeClass.find(cls => cls.startsWith('w-'));
    const heightClass = sizeClass.find(cls => cls.startsWith('h-'));
    
    // Convert Tailwind classes to pixel values
    const getPixelSize = (className: string | undefined): number => {
      if (!className) return 48;
      const sizeMap: Record<string, number> = {
        'w-8': 32, 'h-8': 32,
        'w-10': 40, 'h-10': 40,
        'w-12': 48, 'h-12': 48,
        'w-16': 64, 'h-16': 64,
        'w-20': 80, 'h-20': 80,
        'w-24': 96, 'h-24': 96,
      };
      return sizeMap[className] || 48;
    };

    const pixelWidth = getPixelSize(widthClass);
    const pixelHeight = getPixelSize(heightClass);

    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleDashboard}
          className={`${size} rounded-full hover:opacity-80 transition-all duration-200 hover:scale-105 relative overflow-hidden border-2 border-white/20 hover:border-white/40`}
          title={userData?.name || 'Profile'}
        >
          {hasProfilePicture ? (
            <Image
              src={`http://localhost:8080/Media/mediaManager/Get?id=${userData.profile_picture_id}`}
              alt={userData?.name || 'Profile'}
              width={pixelWidth}
              height={pixelHeight}
              className="w-full h-full object-cover rounded-full"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              unoptimized={true} // Since this is from your API, not a static asset
              priority={false} // Profile pictures don't need to be priority loaded
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red via-red/80 to-red/60 flex items-center justify-center rounded-full">
              <FiUser className="text-white text-lg" />
            </div>
          )}
        </button>
        
        {showName && userData?.name && (
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm truncate max-w-[100px]">
              {userData.name}
            </span>
            {userData.username && (
              <span className="text-white/70 text-xs truncate max-w-[100px]">
                @{userData.username}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="relative flex items-center justify-between px-6 md:px-[100px] py-4 bg-black text-white">
      <div className="flex items-center space-x-4 md:space-x-8">
        <Link href="/" className="text-2xl md:text-[39px] font-bold leading-tight">
          SCAM<br />SLEUTH
        </Link>
        
        {/* Desktop Nav Links */}
        <nav className="hidden md:flex space-x-6 pl-4 text-lg md:text-[28px] font-medium">
          <Link href="/" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">
              Home
            </span>
          </Link>
          <Link href="/scams" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">
              Scams
            </span>
          </Link>
          <button onClick={handleAskAI} className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">
              Ask AI
            </span>
          </button>
          <Link href="/report" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">
              Report a scam
            </span>
          </Link>
          <Link href="/about" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">
              About us
            </span>
          </Link>
        </nav>
      </div>

      {/* Desktop Buttons/Profile */}
      <div className="hidden md:flex items-center space-x-4">
        {isAuthenticated ? <ProfilePicture size="w-12 h-12" /> : <AuthButtons />}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center z-50">
        <button onClick={toggleMenu} className="text-3xl relative z-50">
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Full-Screen Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black text-white z-40 md:hidden">
          {/* Navbar Items positioned below the close button */}
          <div className="absolute top-16 right-8 flex flex-col items-end space-y-4 z-50">
            <Link href="/" onClick={toggleMenu} className="text-[20px] font-medium">
              Home
            </Link>
            <Link href="/scams" onClick={toggleMenu} className="text-[20px] font-medium">
              Scams
            </Link>
            <button onClick={() => { handleAskAI(); toggleMenu(); }} className="text-[20px] font-medium">
              Ask AI
            </button>
            <Link href="/report" onClick={toggleMenu} className="text-[20px] font-medium">
              Report a scam
            </Link>
            <Link href="/about" onClick={toggleMenu} className="text-[20px] font-medium">
              About us
            </Link>
          </div>

          {/* Centered Login/Signup Buttons or Profile Button */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-6 mt-auto pb-8">
              {isAuthenticated ? (
                <div className="flex flex-col items-center space-y-4">
                  <ProfilePicture size="w-20 h-20" showName={true} />
                  <Button 
                    variant="outline" 
                    onClick={() => { handleDashboard(); toggleMenu(); }}
                    className="text-lg font-medium px-8"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Button 
                    size='lg' 
                    variant="ghost" 
                    onClick={() => { handleLogin(); toggleMenu(); }} 
                    className="text-xl font-medium"
                  >
                    Login
                  </Button>
                  <Button 
                    size='lg' 
                    variant="outline" 
                    onClick={() => { handleSignup(); toggleMenu(); }} 
                    className="text-xl font-medium"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}