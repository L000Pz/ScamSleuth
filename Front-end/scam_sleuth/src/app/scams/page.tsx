"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import heroImage from '@/assets/images/hero.png';

interface ScamReport {
  id: string;
  name: string;
  description: string;
  date: string;
  imageUrl: string;
}

export default function ScamsPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dummyReports: ScamReport[] = [
          {
            id: '1',
            name: 'Email Scam',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
            date: '2024/10/1',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '2',
            name: 'Crypto Scam',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et efficitur ipsum, id hendrerit leo. Ut accumsan neque nunc.',
            date: '2024/10/1',
            imageUrl: '/detective-dog.png'
          }
          // Add more dummy data as needed
        ];

        setReports(dummyReports);
      } catch (error) {
        setError('Failed to load scam reports');
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
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
        {reports.map((report, index) => (
          <div 
            key={report.id}
            className="flex bg-cardWhite rounded-xl overflow-hidden shadow-lg"
          >
            {/* Left side with image */}
            <div className={`${index % 2 === 0 ? "w-32 bg-black flex items-center justify-center p-4":"w-10 bg-black flex items-center justify-center p-4"}`}>
              
            </div>
            {/* Image */}
            <div className={`${index % 2 === 0 ? 'ml-[-119px]' : 'mr-0'} flex justify-center`}>
                <div className="flex justify-center w-[100px] h-[100px]">
                    <Image src={heroImage} alt={"hero"} width={280} height={119} className="object-cover" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold">{report.name}</h3>
                <span className="font-bold">{report.date}</span>
              </div>
              <p className="text-gray-700 mb-4">{report.description}</p>
              <div className="flex justify-end">
                <Button 
                  variant={index % 2 === 0 ? "outline" : "outlineW"}
                  onClick={() => router.push(`/scams/${report.id}`)}
                  className="rounded-full px-8 py-2 font-bold"
                >
                  Read More
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}