"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, FileText, AlertTriangle, RefreshCw, Plus, Edit } from 'lucide-react';
import { getReviews } from './actions';

interface Review {
  id: string;
  type: string;
  name: string;
  date: string;
  rawDate: string;
  content_id: number;
}

type SortCriteria = 'date' | 'type' | 'name';

export default function ReviewsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortCriteria>('date');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const sortReviews = (reviewsToSort: Review[], criteria: SortCriteria): Review[] => {
    return [...reviewsToSort].sort((a, b) => {
      switch (criteria) {
        case 'date':
          return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const fetchReviews = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const result = await getReviews();
      
      if (result.success && result.data) {
        const sortedData = sortReviews(result.data, sortBy);
        setReviews(sortedData);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('An error occurred while fetching reviews');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSort = (criteria: SortCriteria) => {
    setSortBy(criteria);
    const sortedReviews = sortReviews(reviews, criteria);
    setReviews(sortedReviews);
  };

  const formatReviewType = (type: string): string => {
    if (type.toLowerCase().includes('crypto')) {
      return 'Crypto Scam';
    }
    const words = type.split(',');
    if (words.length > 1) {
      return words.map(word => word.trim()).join('\n');
    }
    return type;
  };

  const truncateTitle = (title: string, maxLength: number = 80): string => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength).trim() + '...';
  };

  const handleRefresh = () => {
    fetchReviews(true);
  };

  const handleCreateReview = () => {
    router.push('/admin-dashboard/write-review');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reviews</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Reviews
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={handleCreateReview}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Write Review
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-medium text-gray-700">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortCriteria)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            >
              <option value="date">Date</option>
              <option value="type">Type</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
              <div className="text-sm text-blue-800">Total Reviews</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {new Set(reviews.map(review => review.type)).size}
              </div>
              <div className="text-sm text-green-800">Unique Scam Types</div>
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 mt-8 bg-gray-50 rounded-xl p-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Found</h3>
          <p className="text-gray-600 mb-4">There are currently no reviews to display.</p>
          <Button
            onClick={handleCreateReview}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Write Your First Review
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id}
              className="flex flex-col lg:flex-row bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 min-h-[120px]"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black text-white py-3 px-4 lg:p-4 w-full lg:w-24 lg:min-w-24 lg:max-w-24 flex items-center justify-center min-h-[50px]">
                <span className="text-xs font-semibold text-center whitespace-pre-line lg:[writing-mode:vertical-rl] lg:rotate-180 leading-tight overflow-hidden">
                  {formatReviewType(review.type)}
                </span>
              </div>

              <div className="flex-grow p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4 h-full">
                  <div className="flex-grow">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {truncateTitle(review.name)}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">Published:</span>
                      <span>{review.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end lg:justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/admin-dashboard/reviews/${review.id}`)}
                      className="rounded-full px-6 py-2 font-semibold hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}