"use client";

import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import Script from 'next/script';
import { config } from '@/app/config/env';
import { logout } from './actions';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Scam Reports', href: '/admin-dashboard' },
  { name: 'Reviews', href: '/admin-dashboard/reviews' },
  { name: 'Write a Review', href: '/admin-dashboard/write-review' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    router.refresh();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', result.message);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <Script 
        src={`https://cdn.tiny.cloud/1/${config.tinymceApiKey}/tinymce/6/tinymce.min.js`}
        strategy="beforeInteractive"
        referrerPolicy="origin"
      />
      <div className="flex items-center justify-center p-4 md:p-8 lg:p-[76px] min-h-screen">
        <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-[1240px] lg:h-[610px]">
          {/* Mobile Menu Button */}
          <div className="lg:hidden p-4 flex justify-between items-center bg-black text-white">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Sidebar - Mobile & Desktop */}
          <div className={`
            ${isMobileMenuOpen ? 'block' : 'hidden'}
            lg:block
            w-full lg:w-80 
            bg-black text-white 
            p-4 lg:p-6 
            flex flex-col
            flex-shrink-0
          `}>
            <h1 className="hidden lg:block text-[32px] font-bold mb-8">Admin Panel</h1>
            
            {/* Navigation Links */}
            <nav className="space-y-4 lg:space-y-6 mb-auto">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-lg lg:text-xl transition-colors relative pl-4 py-2 ${
                    pathname === item.href 
                      ? 'text-red bg-white/10 rounded-lg' 
                      : 'hover:text-red'
                  }`}
                >
                  {pathname === item.href && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red rounded-r"/>
                  )}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-16">
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="w-full rounded-full font-bold"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}