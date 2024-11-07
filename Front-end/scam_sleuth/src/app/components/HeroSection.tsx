import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';

const HeroSection = () => {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-[100px] py-8 md:py-16 text-white">
      <div className="absolute inset-0 w-full md:w-1/2 bg-gradient-to-r from-black via-black to-gradWhite"></div>
      <div className="absolute inset-y-0 right-0 w-full md:w-1/2 bg-gradient-to-l from-red to-gradWhite items-center justify-center overflow-hidden hidden md:flex">
        <Image
          src={heroImage}
          alt="Detective Dog"
          layout="fill" 
          objectFit="cover" 
          className="h-full"
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-col md:flex-row items-center justify-between w-full">
        {/* Left Side: Text and Buttons */}
        <div className="max-w-full md:max-w-[610px] space-y-4 md:space-y-7 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold leading-snug">
            Uncovering Scams,<br /> One Report at a Time.
          </h2>
          <p className="text-base md:text-lg">
            Scam Sleuth empowers you to stay informed by uncovering fraudulent activities in your area and beyond. Our community-driven reports help you navigate online and offline scams with confidence. Browse through existing reports or add your own to keep others safe.
          </p>
          {/* Buttons in a Row on All Screen Sizes */}
          <div className="flex space-x-4 justify-center md:justify-start">
            <Button size='md' variant="outlineW" className='text-[16px]'>View all scams</Button>
            <Button size='md' variant="outline" className='text-[16px] font-medium'>Report a scam</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
