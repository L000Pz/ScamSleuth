import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/images/hero.png';
const HeroSection = () => {
  return (
    <section className="relative flex items-center justify-between px-[100px] py-16 text-white">
  {/* Background Layers */}
  <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-black via-black to-gradWhite">
  
  </div>
  <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-red  to-gradWhite"></div>

  {/* Content */}
  <div className="relative flex items-center justify-between w-full">
    {/* Left Side: Text and Buttons */}
    <div className="max-w-[610px] space-y-7">
      <h2 className="text-5xl font-bold leading-snug">
        Uncovering Scams,<br /> One Report at a Time.
      </h2>
      <p className="text-lg ">
        Scam Sleuth empowers you to stay informed by uncovering fraudulent activities in your area and beyond. Our community-driven reports help you navigate online and offline scams with confidence. Browse through existing reports or add your own to keep others safe.
      </p>
      <div className="flex space-x-4">
        <Button size='md' variant="outlineW" className='text-[16px] '>View all scams</Button>
        <Button size='md' variant="outline" className='text-[16px] font-meduim' >Report a scam</Button>
    </div>
    </div>

    {/* Right Side: Image */}
    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
        <Image
          src={heroImage}
          alt="Detective Dog"
          width={400}
          height={400}
          className=" h-[496px] w-[517px]"
        />
      </div>
  </div>
</section>
  );
};

export default HeroSection;