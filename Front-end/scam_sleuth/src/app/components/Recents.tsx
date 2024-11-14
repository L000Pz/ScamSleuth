"use client";
import { useEffect, useState } from 'react';
import ScamCard from './card';
import ScamCardSkeleton from './ScamCardSkeleton';
import { Scam } from '../../types/scam'; // Import the Scam type

export default function RecentScams() {
  const [scams, setScams] = useState<Scam[]>([]); // Type the state as an array of Scam
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/scams'); // Mirage will intercept this request
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Scam[] = await response.json(); // Type the data as an array of Scam
        setScams(data);
      } catch (error) {
        console.error('Error fetching scam data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
