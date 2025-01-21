"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getReviews } from './actions';
import { Plus } from 'lucide-react';

interface Review {
  id: string;
  type: string;
  name: string;
  date: string;
  content_id: number;
}

export default function ReviewsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const result = await getReviews();
        
        if (result.success && result.data) {
          setReviews(result.data);
        } else {
          setError(result.error || 'Failed to fetch reviews');
        }
      } catch (err) {
        setError('An error occurred while fetching reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
    const sortedReviews = [...reviews].sort((a, b) => {
      switch (criteria) {
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
    setReviews(sortedReviews);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[40px] font-bold">Reviews</h2>
        <div className="flex items-end flex-col gap-2">
          <div
            className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
            onClick={() => router.push('/admin-dashboard/write-review')}
          >
            <Plus className="h-5 w-5" />
          </div>
          
          <div>
            <span className="text-xl">Sort by: </span>
            <select 
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="date">Date</option>
              <option value="type">Type</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id}
              className="flex items-stretch bg-background rounded-xl overflow-hidden shadow-md"
            >
              {/* Left black label */}
              <div className="bg-black text-white sm:p-4 w-full sm:w-40 sm:max-w-[100px] flex items-center justify-center">
                <span className="text-sm font-medium text-center sm:[writing-mode:vertical-rl] sm:h-[98px] sm:rotate-180 sm:max-h-[90px] whitespace-pre-wrap break-words" style={{ writingMode: 'vertical-rl' }}>
                  {review.type}
                </span>
              </div>

              {/* Main content */}
              <div className="flex-grow p-4 flex justify-between items-center">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{review.name}</h3>
                  </div>
                </div>

                {/* Right side with date and button */}
                <div className="ml-4 flex flex-col items-end gap-2">
                  <span className="text-gray-500">{review.date}</span>
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/admin-dashboard/reviews/${review.id}`)}
                    className="rounded-full px-6 font-bold"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}