"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ActivityList } from '@/app/components/activityCard';

interface ActivityItem {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('date');

  // Sample data - replace with your actual data
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'Phishing',
      name: 'Email Scam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    },
    {
      id: '2',
      type: 'Investment',
      name: 'Crypto Scam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    },
    {
      id: '3',
      type: 'Shopping',
      name: 'Fake Store',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    },
    {
      id: '4',
      type: 'Romance',
      name: 'Dating Scam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    },
    {
      id: '5',
      type: 'Job',
      name: 'Employment Scam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    },
    {
      id: '6',
      type: 'Tech Support',
      name: 'Phone Scam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    },
    {
      id: '7',
      type: 'Banking',
      name: 'Account Scam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    },
    {
      id: '8',
      type: 'Social Media',
      name: 'Profile Scam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
      date: '2024/10/1'
    }
  ];

  const handleReview = (id: string) => {
    router.push(`/dashboard/activities/${id}`);
  };

  return (
    <div className="flex items-center justify-center p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex w-[1240px] h-[610px]">
        {/* Left Column - Activities Content */}
        <div className="w-3/5 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[40px] font-bold">Recent Activities</h2>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="flex items-center mb-4">
            <span className="text-lg font-semibold mr-4">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="date">Date</option>
              <option value="type">Type</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className="space-y-4">
            <ActivityList activities={activities} onReview={handleReview} />
          </div>
        </div>

        {/* Right Column - Gradient Background and Image */}
        <div className="w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex flex-col items-center justify-center p-8">
          <Image src={heroImage} alt="Detective Dog" width={278} height={319} className="mb-4" />
          <p className="text-[40px] font-bold text-white text-left">
            Track your <span style={{ color: "#E14048" }}>activities</span>
          </p>
          <p className="text-[40px] font-bold text-white text-left">and stay vigilant!</p>
        </div>
      </div>
    </div>
  );
}