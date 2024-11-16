// src/app/dashboard/page.tsx
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // Simulate logout action (remove token if implemented)
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <header className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
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
              <h2 className="text-[40px] font-bold">Welcome, [User]!</h2>
              <p className="text-gray-600">Here’s what’s happening with your account today.</p>
            </div>
            <Image src={heroImage} alt="User Icon" width={120} height={120} />
          </div>

          {/* Dashboard Features */}
          <div className="w-full space-y-6">
            {/* Profile Section */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Your Profile</h3>
              <p className="text-gray-600">View or edit your personal information and settings.</p>
              <Button variant="outline" className="mt-4">Edit Profile</Button>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <p className="text-gray-600">View your recent reports or actions taken on your account.</p>
              <Button variant="outline" className="mt-4">View Activity</Button>
            </div>

            {/* Quick Links Section */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Quick Links</h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li className="mt-1">Submit a Scam Report</li>
                <li className="mt-1">Browse Scam Alerts</li>
                <li className="mt-1">Contact Support</li>
              </ul>
              <Button variant="outline" className="mt-4">Explore More</Button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
