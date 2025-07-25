/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from 'next/headers';

interface DashboardStats {
  totalReports: number;
  totalReviews: number;
  todayReports: number;
}

interface RecentActivityItem {
  id: string;
  type: 'report' | 'review';
  title: string;
  status: 'pending' | 'reviewed' | 'published';
  date: string;
  author?: string;
}

interface Report {
  report_id: number;
  title: string;
  writer_id: number;
  scam_type_id: number;
  scam_date: string;
  report_date: string;
  financial_loss: number;
  description: string;
}

interface Review {
  review_id: number;
  title: string;
  review_date: string;
}

async function getUserInfoFromToken(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/ReturnByToken?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': '*/*' 
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Verify user is admin
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { success: false, error: 'Invalid authentication. Please login again.' };
    }

    if (userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    // Fetch data from multiple endpoints
    const [reportsRes, reviewsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/ViewReports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/GetAdminReviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      })
    ]);

    const [reports, reviews]: [Report[], Review[]] = await Promise.all([
      reportsRes.json(),
      reviewsRes.json()
    ]);

    // Calculate stats
    const totalReports = reports.length;
    const totalReviews = reviews.length;
    
    // Calculate today's reports using report_date (when the report was submitted)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayReports = reports.filter((report: Report) => {
      const reportDate = new Date(report.report_date);
      reportDate.setHours(0, 0, 0, 0);
      return reportDate.getTime() === today.getTime();
    }).length;

    const stats: DashboardStats = {
      totalReports,
      totalReviews,
      todayReports
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}

export async function getRecentActivity(): Promise<{
  success: boolean;
  data?: RecentActivityItem[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // Verify user is admin
    const userInfo = await getUserInfoFromToken(token);
    
    if (!userInfo) {
      return { success: false, error: 'Invalid authentication. Please login again.' };
    }

    if (userInfo.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    // Fetch recent reports and reviews
    const [reportsRes, reviewsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/ViewReports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/Admin/adminManagement/GetAdminReviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      })
    ]);

    const [reports, reviews]: [Report[], Review[]] = await Promise.all([
      reportsRes.json(),
      reviewsRes.json()
    ]);

    // Combine and sort recent activity
    const recentActivity: RecentActivityItem[] = [];

    // Add recent reports (last 5) - using report_date for sorting
    const recentReports = reports
      .sort((a: Report, b: Report) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
      .slice(0, 5)
      .map((report: Report) => ({
        id: report.report_id.toString(),
        type: 'report' as const,
        title: report.title,
        status: 'pending' as const,
        date: formatDate(report.report_date),
        author: `User ${report.writer_id}`
      }));

    // Add recent reviews (last 5)
    const recentReviews = reviews
      .sort((a: Review, b: Review) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime())
      .slice(0, 5)
      .map((review: Review) => ({
        id: review.review_id.toString(),
        type: 'review' as const,
        title: review.title,
        status: 'published' as const,
        date: formatDate(review.review_date),
        author: 'Admin Team'
      }));

    // Combine reports and reviews
    recentActivity.push(...recentReports, ...recentReviews);

    // Sort by date (most recent first) - need to parse the formatted dates back for sorting
    recentActivity.sort((a, b) => {
      const dateA = parseFormattedDate(a.date);
      const dateB = parseFormattedDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Return only the most recent 10 items
    return { 
      success: true, 
      data: recentActivity.slice(0, 10) 
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return { success: false, error: 'Failed to fetch recent activity' };
  }
}

// Helper function to format dates consistently
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}

// Helper function to parse formatted dates back to Date objects for sorting
function parseFormattedDate(formattedDate: string): Date {
  const now = new Date();
  
  if (formattedDate === 'Today') {
    return now;
  } else if (formattedDate === 'Yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  } else if (formattedDate.includes('days ago')) {
    const days = parseInt(formattedDate.split(' ')[0]);
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - days);
    return pastDate;
  } else {
    // For formatted dates like "Jun 5" or "Jun 5, 2024"
    try {
      return new Date(formattedDate);
    } catch {
      return new Date(0); // Fallback to epoch if parsing fails
    }
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/IAM/authentication/Logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Backend logout failed, proceeding with cookie cleanup');
      }
    }

    cookieStore.delete('token');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Failed to logout' };
  }
}