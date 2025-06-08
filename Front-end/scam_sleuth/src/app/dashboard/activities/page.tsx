"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
import { useRouter } from 'next/navigation';
import { useState, useEffect, JSX } from 'react';
import { ActivityList } from '@/app/components/activityCard';
import { getActivities } from './actions';

interface ActivityItem {
  id: string;
  type: string;
  name: string;
  description: string;
  date: string;
  scamDate: string;
  financialLoss: number;
}

type SortBy = 'reportDate' | 'scamDate' | 'type' | 'name' | 'financialLoss';
type SortOrder = 'asc' | 'desc';

interface SortOption {
  value: SortBy;
  label: string;
  icon: string;
}

export default function ActivitiesPage(): JSX.Element {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortBy>('reportDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sort options configuration
  const sortOptions: SortOption[] = [
    { value: 'reportDate', label: 'Report Date', icon: '📅' },
    { value: 'scamDate', label: 'Scam Date', icon: '⚠️' },
    { value: 'financialLoss', label: 'Financial Loss', icon: '💰' },
    { value: 'name', label: 'Title', icon: '📝' },
    { value: 'type', label: 'Scam Type', icon: '🏷️' },
  ];

  useEffect(() => {
    const fetchActivities = async (): Promise<void> => {
      try {
        setLoading(true);
        const result = await getActivities();
        
        if (result.success && result.data) {
          setActivities(result.data);
        } else {
          setError(result.error || 'Failed to fetch activities');
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('An error occurred while fetching activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleReview = (id: string): void => {
    router.push(`/dashboard/activities/${id}`);
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  const handleSortChange = (newSortBy: string): void => {
    const newSort = newSortBy as SortBy;
    if (newSort === sortBy) {
      // If same sort field, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If different field, set new field with appropriate default order
      setSortBy(newSort);
      // Financial loss and dates default to desc (highest/newest first)
      // Names and types default to asc (alphabetical)
      setSortOrder(['financialLoss', 'reportDate', 'scamDate'].includes(newSort) ? 'desc' : 'asc');
    }
  };

  const toggleSortOrder = (): void => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Sort activities based on selected criteria
  const sortedActivities = [...activities].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'reportDate':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'scamDate':
        comparison = new Date(a.scamDate).getTime() - new Date(b.scamDate).getTime();
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'financialLoss':
        comparison = a.financialLoss - b.financialLoss;
        break;
      default:
        return 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Calculate total financial loss
  const totalFinancialLoss = activities.reduce((sum, activity) => sum + activity.financialLoss, 0);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

            {/* Enhanced Stats Card */}
            <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">{activities.length}</span>
                    </div>
                    <div>
                      <p className="font-medium">Total Reports</p>
                      <p className="text-sm text-gray-500">All time submissions</p>
                    </div>
                  </div>
                  
                  {totalFinancialLoss > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red text-lg font-bold">$</span>
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(totalFinancialLoss)}</p>
                        <p className="text-sm text-gray-500">Total reported losses</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-700">Sort by:</span>
                  <div className="flex items-center gap-2">
                    <select 
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="p-2 px-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white shadow-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={toggleSortOrder}
                      className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white shadow-sm"
                      title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                    >
                      {sortOrder === 'asc' ? '↗️' : '↘️'}
                    </button>
                  </div>
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
                      onClick={handleRetry}
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
                      Showing {sortedActivities.length} activit{sortedActivities.length === 1 ? 'y' : 'ies'}
                      {sortBy === 'financialLoss' && totalFinancialLoss > 0 && (
                        <span className="ml-2 text-red font-medium">
                          • Total losses: {formatCurrency(totalFinancialLoss)}
                        </span>
                      )}
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