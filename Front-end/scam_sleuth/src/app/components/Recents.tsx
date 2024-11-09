"use client"
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
    <section className="px-8 py-16 bg-[#BBB8AF]">
      <h2 className="text-2xl font-bold mb-8">Recent scams</h2>
      <div className="grid grid-cols-5 gap-8">
        {isLoading
          ? Array.from({ length: 5 }, (_, i) => <ScamCardSkeleton key={i} />)
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
