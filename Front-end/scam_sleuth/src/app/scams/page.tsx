"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ScamList } from '@/app/components/cardLong';
import { fetchScamReports, type ScamReport } from './actions';

export default function ScamsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      const { data, error: fetchError } = await fetchScamReports();
      
      if (fetchError) {
        setError(fetchError);
      } else if (data) {
        setReports(data);
      }
      
      setIsLoading(false);
    };

    loadReports();
  }, []);

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
    const sortedReports = [...reports].sort((a, b) => {
      switch (criteria) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setReports(sortedReports);
  };

  const handleReview = (id: string) => {
    router.push(`/scams/${id}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[40px] font-bold">Recent Scams</h2>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="p-2 bg-cardWhite border-b-2 rounded-md border-black focus:outline-none focus:border-[#E14048]"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        <ScamList scams={reports} onReview={handleReview} />
      </div>
    </div>
  );
}