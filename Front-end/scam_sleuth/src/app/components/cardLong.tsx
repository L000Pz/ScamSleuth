// ScamCard.tsx
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import heroImage from '@/assets/images/hero.png'

interface ScamItem {
  id: string;
  name: string;
  date: string;
  imageUrl: string;
}

interface ScamCardProps {
  scam: ScamItem;
  onReview: (id: string) => void;
}

export const ScamCard = ({ scam, onReview }: ScamCardProps) => {
  // Function to get color based on scam type
  const isEven = parseInt(scam.id) % 2 === 0;
  
  return (
    <div className="flex items-stretch bg-cardWhite h-[110px] rounded-[20px] overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Left color-coded label based on scam type */}
      <div className={"bg-black w-[33px]"}></div>

      <div className={"text-white ml-[-8px] p-4 w-32 flex items-center justify-center"}>
        <Image src={heroImage} alt={scam.name} width={280} height={119} className="object-cover" />
      </div>

      {/* Main content */}
      <div className="flex-grow p-4 flex justify-between items-center">
        <div className="flex-grow pr-4">
          <h3 className="text-xl font-bold mb-2">{scam.name}</h3>
          
        </div>

        {/* Right side with date and button */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-gray-500">{scam.date}</span>
          <Button 
            variant="outline"
            onClick={() => onReview(scam.id)}
            className="rounded-full px-6 font-bold"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

// ScamList.tsx
interface ScamListProps {
  scams: ScamItem[];
  onReview: (id: string) => void;
}

export const ScamList = ({ scams, onReview }: ScamListProps) => {
  return (
    <div className="space-y-4">
      {scams.map((scam) => (
        <ScamCard 
          key={scam.id} 
          scam={scam} 
          onReview={onReview}
        />
      ))}
    </div>
  );
};