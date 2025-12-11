import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface CardProps {
  id: number;
  name: string;
  description: string;
  date: string;
  scamType?: string;
  imageUrl?: string | StaticImageData;
}

export default function ScamCard({ id, name, description, date, scamType, imageUrl }: CardProps) {
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const isPersian = (text: string): boolean => {
    const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return persianRegex.test(text);
  };

  const titleIsPersian = isPersian(name);
  const descIsPersian = isPersian(description);

  console.log('Title:', name, 'isPersian:', titleIsPersian);
  console.log('Description:', description, 'isPersian:', descIsPersian);

  return (
    <div className="group bg-cardWhite rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gradWhite/30 hover:border-red/40 hover:-translate-y-1 w-full max-w-[300px] h-[360px] flex flex-col">
      <div className="relative h-[140px] flex-shrink-0 bg-gradient-to-br from-black to-gradWhite overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {imageUrl ? (
          typeof imageUrl === 'string' ? (
            <img
              src={imageUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <Image 
              src={imageUrl} 
              alt={name} 
              fill
              className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
              sizes="300px"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-20">⚠️</span>
          </div>
        )}
        
        {scamType && (
          <div className="absolute bottom-3 left-3 right-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full font-medium truncate">
              {scamType}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 min-h-0">
        <h3 
          className={`font-bold text-sm text-black mb-2 group-hover:text-red transition-colors leading-tight line-clamp-2 h-[40px] overflow-hidden ${titleIsPersian ? 'text-right' : 'text-left'}`}
          dir={titleIsPersian ? 'rtl' : 'ltr'}
        >
          {name}
        </h3>
        
        <p 
          className={`text-xs text-black mb-2 leading-relaxed overflow-hidden line-clamp-2 ${descIsPersian ? 'text-right' : 'text-left'}`}
          dir={descIsPersian ? 'rtl' : 'ltr'}
        >
          {truncateText(description, 50)}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-black/60 mb-3 mt-auto">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{date}</span>
        </div>

        <Link href={`/scams/${id}`}>
          <Button 
            className="w-full bg-gradient-to-r from-red to-red/90 hover:from-red/90 hover:to-red text-white border-0 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-md py-2"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}