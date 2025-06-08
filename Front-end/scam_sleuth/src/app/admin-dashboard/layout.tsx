"use client";

import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, X, FileText, List, PenSquare, BarChart3 } from 'lucide-react';
import Script from 'next/script';
import { config } from '@/app/config/env';
import { logout } from './actions';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/admin-dashboard', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Scam Reports', href: '/admin-dashboard/reports', icon: <List className="w-5 h-5" /> },
  { name: 'Reviews', href: '/admin-dashboard/reviews', icon: <FileText className="w-5 h-5" /> },
  { name: 'Write a Review', href: '/admin-dashboard/write-review', icon: <PenSquare className="w-5 h-5" /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    router.refresh();
  }, [pathname, router]);

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
      <div className="flex items-center justify-center p-2 md:p-4 lg:p-6 min-h-screen">
        <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-[1440px] h-[90vh]">
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
            w-full lg:w-auto
            bg-black text-white 
            p-4 lg:p-6 
            flex flex-col
            flex-shrink-0
            ${isSidebarCollapsed ? 'lg:w-24' : 'lg:w-96'}
            transition-all duration-300
          `}>
            <div className="flex items-center justify-between mb-8">
              <h1 className={`${isSidebarCollapsed ? 'hidden' : 'block'} text-2xl font-bold`}>
                Admin Dashboard
              </h1>
              <button 
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex text-white hover:bg-white/10 h-10 w-10 items-center justify-center rounded-full ml-auto"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? (
                  <Menu className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Navigation Links */}
            <nav className="space-y-6 mb-auto">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center transition-colors relative py-3 px-4 rounded-lg
                    ${pathname === item.href 
                      ? 'text-red bg-white/10' 
                      : 'hover:text-red hover:bg-white/5'
                    } 
                    ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  {pathname === item.href && !isSidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red rounded-r"/>
                  )}
                  
                  <span className={`${isSidebarCollapsed ? 'mr-0 text-xl' : 'mr-4 text-lg'}`}>
                    {item.icon}
                  </span>
                  
                  {!isSidebarCollapsed && (
                    <span className="text-lg font-medium">{item.name}</span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-16">
              <Button 
                variant="outline"
                onClick={handleLogout}
                className={`w-full rounded-full font-bold flex items-center justify-center ${isSidebarCollapsed ? 'p-3' : 'py-3 px-4'}`}
              >
                <LogOut className={isSidebarCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5"} />
                {isSidebarCollapsed ? '' : 'Logout'}
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