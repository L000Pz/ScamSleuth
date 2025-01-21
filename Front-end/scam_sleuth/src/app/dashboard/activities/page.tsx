"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ActivityList } from '@/app/components/activityCard';
import { getActivities } from './actions';

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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const result = await getActivities();
        
        if (result.success && result.data) {
          setActivities(result.data);
        } else {
          setError(result.error || 'Failed to fetch activities');
        }
      } catch (err) {
        setError('An error occurred while fetching activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleReview = (id: string) => {
    router.push(`/dashboard/activities/${id}`);
  };

  const sortedActivities = [...activities].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="flex items-center justify-center p-4 md:p-[76px]">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-[1240px] min-h-[610px] relative">
        <div className="w-full lg:w-3/5 flex flex-col lg:h-[610px]">
          <div className="p-4 md:p-8 bg-cardWhite">
            <div className="flex flex-row justify-between items-center mb-6">
              <h2 className="text-3xl md:text-[40px] font-bold">Recent Activities</h2>
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
          </div>

          <div className="flex-1 lg:overflow-y-auto px-4 md:px-8 scroll-smooth">
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-4">No activities found</div>
              ) : (
                <ActivityList activities={sortedActivities} onReview={handleReview} />
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-2/5 bg-gradient-to-t from-black via-black/40 via-40% via-cardWhite to-red flex-col items-center justify-center p-8">
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