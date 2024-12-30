"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import {checkAuth} from './actions'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status on mount and when token changes
  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUserType(authStatus.userType);
    };

    verifyAuth();
  }, []);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const AuthButtons = () => (
    <>
      <Button size='md' variant="ghost" onClick={handleLogin} className='text-[20px] font-medium'>Login</Button>
      <Button size='md' variant="outline" onClick={handleSignup} className='text-[20px] font-medium'>Sign Up</Button>
    </>
  );

  const ProfileButton = () => (
    <button
      onClick={handleDashboard}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-red hover:opacity-80 transition-opacity"
    >
      <FiUser className="text-white text-xl" />
    </button>
  );

  return (
    <header className="relative flex items-center justify-between px-6 md:px-[100px] py-4 bg-black text-white">
      <div className="flex items-center space-x-4 md:space-x-8">
        <Link href="/" className="text-2xl md:text-[39px] font-bold leading-tight">
          SCAM<br />SLEUTH
        </Link>
        
        {/* Desktop Nav Links */}
        <nav className="hidden md:flex space-x-6 pl-4 text-lg md:text-[28px] font-medium">
          <Link href="/" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Home</span>
          </Link>
          <Link href="/scams" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Scams</span>
          </Link>
          <Link href="/report" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">Report a scam</span>
          </Link>
          <Link href="/about" className="relative">
            <span className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red after:transition-all after:duration-300 after:ease-in-out hover:after:w-full">About us</span>
          </Link>
        </nav>
      </div>

      {/* Desktop Buttons/Profile */}
      <div className="hidden md:flex items-center space-x-4">
        {isAuthenticated ? <ProfileButton /> : <AuthButtons />}
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
            <Link href="/" onClick={toggleMenu} className="text-[20px] font-medium">Home</Link>
            <Link href="/scams" onClick={toggleMenu} className="text-[20px] font-medium">Scams</Link>
            <Link href="/report" onClick={toggleMenu} className="text-[20px] font-medium">Report a scam</Link>
            <Link href="/about" onClick={toggleMenu} className="text-[20px] font-medium">About us</Link>
          </div>

          {/* Centered Login/Signup Buttons or Profile Button */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex space-x-4 mt-auto pb-8">
              {isAuthenticated ? (
                <ProfileButton />
              ) : (
                <>
                  <Button size='lg' variant="ghost" onClick={() => { handleLogin(); toggleMenu(); }} className="text-xl font-medium">Login</Button>
                  <Button size='lg' variant="outline" onClick={() => { handleSignup(); toggleMenu(); }} className="text-xl font-medium">Sign Up</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}