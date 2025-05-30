"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPublicReview } from './actions';

interface ReviewData {
  id: string;
  title: string;
  date: string;
  content: string;
  media: Array<{
    media_id: number;
  }>;
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setIsLoading(true);
        const result = await getPublicReview(params.id);
        
        if (result.success && result.data) {
          setReview(result.data);
        } else {
          setError(result.error || 'Failed to fetch review');
        }
      } catch (error) {
        setError('Failed to load review');
        console.error('Error fetching review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error || 'Review not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2" 
        onClick={() => router.push('/scams')}
      >
        <ArrowLeft size={20} />
        Back to Reviews
      </Button>

      {/* Main Content */}
      <Card>
        <CardContent className="p-8">
          {/* Header Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Calendar size={16} />
              {review.date}
            </div>
            <h1 className="text-3xl font-bold">{review.title}</h1>
          </div>

          {/* Review Content */}
          <div className="prose max-w-none mt-6" 
               dangerouslySetInnerHTML={{ __html: review.content }} />

          {/* Media Section */}
          {review.media && review.media.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Evidence</h2>
              <div className="grid gap-6">
                {review.media.map((media, index) => (
                  <div key={media.media_id} className="rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={`http://localhost:8080/Media/mediaManager/Get?id=${media.media_id}`}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}