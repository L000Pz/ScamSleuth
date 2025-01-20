"use client";
import { useEffect, useState } from 'react';
import ScamCard from './card';
import ScamCardSkeleton from './ScamCardSkeleton';
import { getRecentReviews } from './actions';

interface Review {
  review_id: number;
  title: string;
  description: string;
  review_date: string;
  scam_type_id: number;
  review_content_id: number;
}

interface TransformedScam {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export default function RecentScams() {
  const [scams, setScams] = useState<TransformedScam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getRecentReviews();
        
        if (result.success && result.data) {
          const transformedScams: TransformedScam[] = result.data.map((review: Review) => ({
            id: review.review_id,
            name: review.title,
            description: review.description || 'No description available',
          }));
          setScams(transformedScams);
        } else {
          setError(result.error || 'Failed to load recent scams');
        }
      } catch (error) {
        console.error('Error fetching recent reviews:', error);
        setError('Failed to load recent scams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <section className="py-12 bg-[#BBB8AF] px-4 md:px-[100px] md:py-16">
        <div className="text-red-600 text-center">{error}</div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-[#BBB8AF] px-4 md:px-[100px] md:py-16">
      <h2 className="text-xl font-bold mb-6 md:text-2xl lg:text-3xl">Recent scams</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <ScamCardSkeleton key={i} />)
          : scams.map((scam) => (
              <ScamCard
                key={scam.id}
                id={scam.id}
                name={scam.name}
                description={scam.description}
                imageUrl={scam.imageUrl}
              />
            ))}
      </div>
    </section>
  );
}