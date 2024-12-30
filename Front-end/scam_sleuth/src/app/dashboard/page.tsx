"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logout } from './actions';
import { report } from 'process';
import { useEffect } from 'react';


export default function UserDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Force reload on mount using hash strategy
    const reloadOnce = () => {
      if (!window.location.hash) {
        window.location.hash = 'loaded';
        window.location.reload();
      }
    };
    
    reloadOnce();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
        {/* Left Column - Dashboard Content */}
        <div className="w-3/5 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[40px] font-bold">Welcome, [User]!</h2>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
          
          <div className="space-y-6 mx-[30px] -mt-4">
            {/* Profile Section */}
            <div className="p-4 border border-gray-300 rounded-xl">
              <h3 className="text-[20px] font-bold mb-2">Your Profile</h3>
              <p className="text-gray-600 mb-4">View or edit your personal information and settings.</p>
              <Button 
                variant="outline" 
                className="w-[150px] h-[40px] rounded-full font-bold"
                onClick={()=> router.push('dashboard/profile-edit')}
              >
                Edit Profile
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="p-4 border border-gray-300 rounded-xl">
              <h3 className="text-[20px] font-bold mb-2">Recent Activity</h3>
              <p className="text-gray-600 mb-4">Track your recent reports and account activities.</p>
              <Button 
                variant="outline" 
                className="w-[150px] h-[40px] rounded-full font-bold"
                onClick={()=> router.push('dashboard/activities')}
              >
                View Activity
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border border-gray-300 rounded-xl">
              <h3 className="text-[20px] font-bold mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button 
                  variant="outline" 
                  className="h-[40px] rounded-full font-bold"
                  onClick={()=>router.push('report')}
                >
                  Submit Report
                </Button>
                <Button 
                  variant="outline" 
                  className="h-[40px] rounded-full font-bold"
                  onClick={()=>router.push('scams')}
                >
                  Browse Alerts
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Gradient Background and Image */}
        <div className="w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[40px] font-bold text-white text-left">
            Welcome back, <span style={{ color: "#E14048" }}>Sleuth</span>!
          </p>
          <p className="text-[40px] font-bold text-white text-left">Ready to make a difference?</p>
        </div>
      </div>
    </div>
  );
}