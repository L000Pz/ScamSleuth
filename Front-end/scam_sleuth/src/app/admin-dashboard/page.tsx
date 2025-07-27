"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getDashboardStats, getRecentActivity } from './actions';
import { 
  FileText, 
  CheckCircle,
  Plus
} from 'lucide-react';

interface DashboardStats {
  totalReports: number;
  totalReviews: number;
  todayReports: number;
}

interface RecentActivityItem {
  id: string;
  type: 'report' | 'review';
  title: string;
  date: string;
  author?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [statsResult, activityResult] = await Promise.all([
          getDashboardStats(),
          getRecentActivity()
        ]);
        
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        } else {
          setError(statsResult.error || 'Failed to fetch dashboard stats');
        }

        if (activityResult.success && activityResult.data) {
          setRecentActivity(activityResult.data);
        }
      } catch (err) {
        setError('An error occurred while fetching dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with Scam Sleuth today.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/admin-dashboard/write-review')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Write Review
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{stats.todayReports} today
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Published Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                <p className="text-xs text-gray-500 mt-1">
                  By admin team
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin-dashboard/reports')}
              className="w-full justify-start hover:bg-blue-50 hover:border-blue-300"
            >
              <FileText className="w-4 h-4 mr-3" />
              View All Reports
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/admin-dashboard/reviews')}
              className="w-full justify-start hover:bg-green-50 hover:border-green-300"
            >
              <CheckCircle className="w-4 h-4 mr-3" />
              Manage Reviews
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/admin-dashboard/write-review')}
              className="w-full justify-start hover:bg-purple-50 hover:border-purple-300"
            >
              <Plus className="w-4 h-4 mr-3" />
              Write New Review
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin-dashboard/reports')}
              className="text-blue-600 hover:text-blue-700"
            >
              View All
            </Button>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div
                  key={`${activity.type}-${activity.id}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    if (activity.type === 'report') {
                      router.push(`/admin-dashboard/reports/${activity.id}`);
                    } else {
                      router.push(`/admin-dashboard/reviews/${activity.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {activity.type === 'report' ? (
                        <FileText className="w-5 h-5 text-blue-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.date}</span>
                        {activity.author && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">by {activity.author}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}