"use client";
import { useEffect, useState } from 'react';
import ScamCard from './card';
import ScamCardSkeleton from './ScamCardSkeleton';

export default function RecentScams() {
  const [scams, setScams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         setIsLoading(true);
  //         const response = await fetch('/api/scams'); // Replace with your actual API endpoint
  //         const data = await response.json();
  //         setScams(data);
  //       } catch (error) {
  //         // console.error('Error fetching scam data:', error);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchData();
  //   }, []);

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
                className="max-w-xs w-full mx-auto"
              />
            ))}
      </div>
    </section>
  );
}
