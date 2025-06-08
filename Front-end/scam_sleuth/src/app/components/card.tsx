import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CardProps {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export default function ScamCard({ id, name, imageUrl }: CardProps) {
  const isEven = id % 2 === 0;
  
  return (
    <div
      className={`${
        isEven ? 'bg-cardWhite text-black' : 'bg-cardWhite text-black'
      } rounded-xl shadow-2xl overflow-hidden max-w-[280px] h-[337px] transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]`}
    >
      {/* Dark Header */}
      <div className={`${isEven ? "bg-black h-[152px]" : "bg-black h-[33px]"}`}></div>
      
      {/* Image */}
      <div className={`${isEven ? 'mt-[-119px]' : 'mt-0'} flex justify-center`}>
        <div className="flex justify-center w-[280px] h-[119px]">
          <Image src={imageUrl} alt={name} width={280} height={119} className="object-cover" />
        </div>
      </div>

      {/* Content - Fixed layout to prevent button movement */}
      <div className="flex flex-col h-[166px] px-4">
        {/* Title container with fixed height */}
        <div className="flex-grow flex items-center justify-center py-2">
          <h3 className="text-lg font-bold text-center line-clamp-3">{name}</h3>
        </div>
        
        {/* Button container with fixed position at bottom */}
        <div className="flex justify-center pb-4">
          <Link href={`/scams/${id}`}>
            <Button variant="outline" className="text-md font-medium">
              View more
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}