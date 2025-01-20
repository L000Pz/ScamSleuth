"use client";

import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import Script from 'next/script';
import { config } from '@/app/config/env';
import { logout } from './actions';
import { useEffect, useCallback } from 'react';

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
        // Optionally show an error message to the user
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
      <div className="flex items-center justify-center p-[76px]">
        <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
          {/* Left Sidebar */}
          <div className="w-80 bg-black text-white p-6 flex flex-col flex-shrink-0">
            <h1 className="text-[32px] font-bold mb-8">Admin Panel</h1>
            
            {/* Navigation Links */}
            <nav className="flex-grow space-y-6">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`block text-xl transition-colors relative pl-4 ${
                    pathname === item.href 
                      ? 'text-red bg-white/10 h rounded-lg' 
                      : 'hover:text-red'
                  }`}
                >
                  {pathname === item.href && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red rounded-r"></div>
                  )}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="rounded-full font-bold"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow p-8 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}