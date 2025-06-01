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
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row w-full max-w-[1440px] min-h-[700px] relative">
        <div className="w-full lg:w-3/5 flex flex-col lg:h-[700px]">
          <div className="p-6 md:p-8 bg-cardWhite border-b border-gray-100">
            <div className="flex flex-row justify-between items-center mb-6">
              <h2 className="text-3xl md:text-[40px] font-bold flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Recent Activities
              </h2>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">{activities.length}</span>
                  </div>
                  <div>
                    <p className="font-medium">Total Activities</p>
                    <p className="text-sm text-gray-500">All time reports</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-gray-700">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 px-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white shadow-sm"
                  >
                    <option value="date">Date</option>
                    <option value="type">Type</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 lg:overflow-y-auto px-6 md:px-8 scroll-smooth pb-6">
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-500 font-medium">Loading activities...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-600 font-medium">{error}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                    <p className="text-gray-500 mb-4">You haven&apos;t submitted any reports yet.</p>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/report')}
                      className="hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
                    >
                      Submit Your First Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      Showing {sortedActivities.length} activities
                    </p>
                  </div>
                  <ActivityList activities={sortedActivities} onReview={handleReview} />
                </div>
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