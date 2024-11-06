import React from 'react';
import HeroSection from './components/HeroSection';
import RecentScams from './components/Recents';

export default function Home() {
  return (
    <div className=" bg-background">
      <HeroSection />
      <RecentScams />
    </div>
  );
}
