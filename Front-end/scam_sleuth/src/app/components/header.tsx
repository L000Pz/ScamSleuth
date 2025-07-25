"use client";
import React, { useState, useEffect, JSX } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiUser, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { checkAuth, getUserData } from './actions';

interface UserData {
  name: string;
  username?: string;
  email?: string;
  profile_picture_id?: number | null;
  is_verified?: boolean;
  role?: string;
}

interface NavItem {
  href?: string;
  label: string;
  onClick?: () => void;
}

interface MenuItemConfig {
  icon: string;
  label: string;
  action: () => void;
}

export default function Navbar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Navigation items configuration
  const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/scams', label: 'Scams' },
    { label: 'Ask AI', onClick: () => router.push('/ask-ai') },
    { href: '/report', label: 'Report a scam' },
    { href: '/about', label: 'About us' },
  ];

  // Role-based menu items configuration
  const getMenuItems = (role: string | undefined): MenuItemConfig[] => {
    const commonItems: MenuItemConfig[] = [
      {
        icon: '🚪',
        label: 'Sign out',
        action: handleLogout
      }
    ];

    if (role === 'admin') {
      return [
        {
          icon: '📊',
          label: 'Admin Dashboard',
          action: () => {
            router.push('/admin-dashboard');
            setIsProfileDropdownOpen(false);
          }
        },
        {
          icon: '📝',
          label: 'Reviews',
          action: () => {
            router.push('/admin-dashboard/reviews');
            setIsProfileDropdownOpen(false);
          }
        },
        {
          icon: '✍️',
          label: 'Write Review',
          action: () => {
            router.push('/admin-dashboard/write-review');
            setIsProfileDropdownOpen(false);
          }
        },
        {
          icon: '📋',
          label: 'Scam Reports',
          action: () => {
            router.push('/admin-dashboard');
            setIsProfileDropdownOpen(false);
          }
        },
        ...commonItems
      ];
    } else {
      // Regular user menu items
      return [
        {
          icon: '📊',
          label: 'Dashboard',
          action: () => {
            router.push('/dashboard');
            setIsProfileDropdownOpen(false);
          }
        },
        {
          icon: '⚙️',
          label: 'Edit Profile',
          action: () => {
            router.push('/dashboard/profile-edit');
            setIsProfileDropdownOpen(false);
          }
        },
        {
          icon: '📋',
          label: 'My Activities',
          action: () => {
            router.push('/dashboard/activities');
            setIsProfileDropdownOpen(false);
          }
        },
        {
          icon: '📝',
          label: 'Report Scam',
          action: () => {
            router.push('/report');
            setIsProfileDropdownOpen(false);
          }
        },
        ...commonItems
      ];
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const verifyAuth = async (): Promise<void> => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus.isAuthenticated);
        setUserType(authStatus.userType);

        // Fetch user data if authenticated
        if (authStatus.isAuthenticated) {
          await fetchUserData();
        }
      } catch (error) {
        console.error("Error verifying auth:", error);
        setIsAuthenticated(false);
        setUserData(null);
      }
    };

    verifyAuth();
  }, []);

  const fetchUserData = async (): Promise<void> => {
    try {
      setIsLoadingUser(true);
      const data = await getUserData();
      if (data && data.name && data.name !== '[User]') {
        setUserData(data as UserData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleLogin = (): void => {
    router.push('/login');
  };

  const handleSignup = (): void => {
    router.push('/signup');
  };
  
  const handleDashboard = (): void => {
    if (userData?.role === 'admin') {
      router.push('/admin-dashboard');
    } else {
      router.push('/dashboard');
    }
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      // Import the logout function from actions
      const { logout } = await import('./actions');
      const result = await logout();
      
      if (result.success) {
        // Clear local state
        setIsAuthenticated(false);
        setUserData(null);
        setUserType(null);
        setIsProfileDropdownOpen(false);
        setIsMenuOpen(false);
        
        // Redirect to home page
        window.location.href = '/';
      } else {
        console.error('Logout failed:', result.message);
        // Still clear local state and redirect even if API call fails
        setIsAuthenticated(false);
        setUserData(null);
        setUserType(null);
        setIsProfileDropdownOpen(false);
        setIsMenuOpen(false);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state and redirect even if API call fails
      setIsAuthenticated(false);
      setUserData(null);
      setUserType(null);
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);
      window.location.href = '/';
    }
  };

  const handleNavigation = (item: NavItem): void => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
    setIsMenuOpen(false);
  };

  const isActiveRoute = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileDropdownOpen(false);
  };

  const AuthButtons = (): JSX.Element => (
    <div className="flex items-center gap-3">
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={handleLogin} 
        className="text-white hover:text-red hover:bg-white/10 transition-all duration-200 font-medium"
      >
        Login
      </Button>
      <Button 
        size="sm" 
        onClick={handleSignup} 
        className="bg-red hover:bg-red/80 text-white border-0 font-medium px-6 transition-all duration-200 hover:scale-105"
      >
        Sign Up
      </Button>
    </div>
  );

  interface ProfilePictureProps {
    size?: string;
    showName?: boolean;
    onClick?: () => void;
    isClickable?: boolean;
  }

  const ProfilePicture = ({ 
    size = "w-10 h-10", 
    showName = false,
    onClick 
  }: ProfilePictureProps): JSX.Element => {
    const [imageError, setImageError] = useState<boolean>(false);

    if (isLoadingUser) {
      return (
        <div className={`${size} rounded-full bg-white/20 animate-pulse flex items-center justify-center`}>
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
      );
    }

    const hasProfilePicture = userData?.profile_picture_id && !imageError;
    
    const getPixelSize = (className: string | undefined): number => {
      if (!className) return 40;
      const sizeMap: Record<string, number> = {
        'w-8': 32, 'h-8': 32,
        'w-10': 40, 'h-10': 40,
        'w-12': 48, 'h-12': 48,
        'w-16': 64, 'h-16': 64,
        'w-20': 80, 'h-20': 80,
        'w-24': 96, 'h-24': 96,
      };
      return sizeMap[className] || 40;
    };

    const sizeClass = size.split(' ');
    const widthClass = sizeClass.find(cls => cls.startsWith('w-'));
    const heightClass = sizeClass.find(cls => cls.startsWith('h-'));
    const pixelWidth = getPixelSize(widthClass);
    const pixelHeight = getPixelSize(heightClass);

    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onClick}
          className={`${size} rounded-full hover:ring-2 hover:ring-white/30 transition-all duration-200 hover:scale-105 relative overflow-hidden group`}
          title={userData?.name || 'Profile'}
          type="button"
        >
          {hasProfilePicture ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/Media/mediaManager/Get?id=${userData.profile_picture_id}`}
              alt={userData?.name || 'Profile'}
              width={pixelWidth}
              height={pixelHeight}
              className="w-full h-full object-cover rounded-full"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              unoptimized={true}
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red via-red/80 to-red/60 flex items-center justify-center rounded-full group-hover:from-red/80 group-hover:to-red/50 transition-all duration-200">
              <FiUser className="text-white text-lg" />
            </div>
          )}
        </button>
        
        {showName && userData?.name && (
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm truncate max-w-[120px]">
              {userData.name}
            </span>
            {userData.username && (
              <span className="text-white/70 text-xs truncate max-w-[120px]">
                @{userData.username}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const ProfileDropdown = (): JSX.Element => {
    const menuItems = getMenuItems(userData?.role);
    const isAdmin = userData?.role === 'admin';
    
    return (
      <AnimatePresence>
        {isProfileDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ProfilePicture size="w-12 h-12" isClickable={false} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{userData?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {userData?.username ? `@${userData.username}` : userData?.email || 'user@example.com'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {userData?.is_verified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Verified
                      </span>
                    )}
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const isLogoutItem = item.label === 'Sign out';
                const isLastItem = index === menuItems.length - 1;
                
                return (
                  <div key={index}>
                    {isLogoutItem && index > 0 && (
                      <div className="border-t border-gray-100 my-2"></div>
                    )}
                    <button
                      onClick={item.action}
                      className={`w-full px-4 py-2 text-left transition-colors duration-150 flex items-center gap-3 ${
                        isLogoutItem 
                          ? 'text-red hover:bg-red/5' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      type="button"
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-md shadow-lg' 
            : 'bg-black'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-6 md:px-[100px] py-4 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              className="text-2xl md:text-[32px] font-bold leading-tight"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white">SCAM</span>
              <br />
              <span className="text-red">SLEUTH</span>
            </motion.div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-lg font-medium">
            {navItems.map((item: NavItem, index: number) => (
              <div key={index}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`relative py-2 transition-all duration-200 hover:text-red group ${
                      pathname === item.href ? 'text-red' : 'text-white'
                    }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-red transition-all duration-300 ${
                      pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="relative py-2 text-white hover:text-red transition-all duration-200 group"
                    type="button"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red transition-all duration-300 group-hover:w-full" />
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth/Profile */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <div
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer"
                >
                  <ProfilePicture size="w-10 h-10" isClickable={false} />
                  <FiChevronDown className={`text-white transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </div>
                <ProfileDropdown />
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            data-mobile-menu
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6 text-white" />
            ) : (
              <FiMenu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10"
              data-mobile-menu
            >
              <div className="px-6 py-6 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navItems.map((item: NavItem, index: number) => {
                    const isActive = item.href ? isActiveRoute(item.href) : false;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleNavigation(item)}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isActive 
                            ? 'text-red bg-white/10' 
                            : 'text-white hover:text-red hover:bg-white/5'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Auth/Profile Section */}
                <div className="pt-4 border-t border-white/10">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                        <ProfilePicture size="w-12 h-12" showName={true} />
                      </div>
                      <div className="space-y-2">
                        {getMenuItems(userData?.role).map((item, index) => (
                          <Button 
                            key={index}
                            variant="ghost" 
                            onClick={item.action}
                            className={`w-full justify-start ${
                              item.label === 'Sign out' 
                                ? 'text-red hover:text-red hover:bg-red/10' 
                                : 'text-white hover:text-red hover:bg-white/10'
                            }`}
                          >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        size="lg" 
                        variant="ghost" 
                        onClick={() => { router.push('/login'); setIsMenuOpen(false); }}
                        className="w-full text-white hover:text-red hover:bg-white/10"
                      >
                        Login
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => { router.push('/signup'); setIsMenuOpen(false); }}
                        className="w-full text-white border-white/30 hover:bg-white hover:text-black"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}