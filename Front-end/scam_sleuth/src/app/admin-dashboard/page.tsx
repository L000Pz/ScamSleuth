// src/app/admin-dashboard/page.tsx
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // Simulate logout action (remove token if implemented)
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <header className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" className="text-white border-white" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-[76px]">
        <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-8 w-full h-[610px] mx-auto">
          {/* Welcome Section */}
          <div className="flex items-center justify-between w-full mb-8">
            <div>
              <h2 className="text-[40px] font-bold">Welcome, Admin!</h2>
              <p className="text-gray-600">Here are your administrative tools and reports.</p>
            </div>
            <Image src={heroImage} alt="Admin Icon" width={120} height={120} />
          </div>

          {/* Dashboard Features */}
          <div className="w-full space-y-6">
            {/* Manage Users Section */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Manage Users</h3>
              <p className="text-gray-600">View and manage all registered users.</p>
              <Button variant="outline" className="mt-4">Go to Users</Button>
            </div>

            {/* View Reports Section */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">View Reports</h3>
              <p className="text-gray-600">Review submitted scam reports and take action.</p>
              <Button variant="outline" className="mt-4">View Reports</Button>
            </div>

            {/* Site Settings Section */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Site Settings</h3>
              <p className="text-gray-600">Manage administrative settings for the site.</p>
              <Button variant="outline" className="mt-4">Settings</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
