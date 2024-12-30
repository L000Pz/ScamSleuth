"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import heroImage from '@/assets/images/hero.png';
import { ScamList } from '@/app/components/cardLong';

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
            name: 'Phishing Email Scam',
            description: 'Sophisticated email impersonating a major bank, requesting urgent account verification. Includes fraudulent login page to steal credentials.',
            date: '2024/10/1',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '2',
            name: 'Crypto Investment Fraud',
            description: 'Fake cryptocurrency trading platform promising unrealistic returns. Uses social media ads to lure victims into "guaranteed" investment schemes.',
            date: '2024/9/28',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '3',
            name: 'Romance Scam',
            description: 'Dating app profile using stolen photos, building emotional connection to request money for fake emergencies and travel expenses.',
            date: '2024/9/25',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '4',
            name: 'Tech Support Scam',
            description: 'Pop-up alerts claiming computer virus infection, directing victims to call fake Microsoft support number for expensive unnecessary repairs.',
            date: '2024/9/22',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '5',
            name: 'Job Offer Scam',
            description: 'Remote work opportunity requiring upfront payment for training materials. Promises high salary for minimal work experience.',
            date: '2024/9/20',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '6',
            name: 'Shopping Website Fraud',
            description: 'Fake e-commerce site advertising luxury goods at extremely low prices. Takes payment but never delivers products.',
            date: '2024/9/18',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '7',
            name: 'Rental Property Scam',
            description: 'Listing for apartment rental at below-market rate, requiring immediate deposit without viewing. Property doesnt actually exist.',
            date: '2024/9/15',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '8',
            name: 'Government Impersonation',
            description: 'Caller claiming to be from tax office, threatening arrest unless immediate payment is made through gift cards for alleged tax debt.',
            date: '2024/9/12',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '9',
            name: 'Lottery Winner Scam',
            description: 'Email notification of huge lottery win, requiring payment of fees to claim prize. Uses official-looking documents and logos.',
            date: '2024/9/10',
            imageUrl: '/detective-dog.png'
          },
          {
            id: '10',
            name: 'Invoice Fraud',
            description: 'Business email compromise sending fake invoices for legitimate-looking services. Targets accounting departments with urgent payment requests.',
            date: '2024/9/8',
            imageUrl: '/detective-dog.png'
          }
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