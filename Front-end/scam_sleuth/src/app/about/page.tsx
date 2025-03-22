"use client";

export default function AboutPage() {
  return (
    <div className="flex items-center justify-center p-4 md:p-12 lg:p-16">
      <div className="bg-cardWhite rounded-xl shadow-lg overflow-hidden w-full max-w-7xl min-h-fit">
        <div className="p-4 md:p-6 lg:p-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
            About <span className="text-red">Scam Sleuth</span>
          </h2>
          
          <div className="space-y-6">
            <p className="text-base md:text-lg">
              At Scam Sleuth, our mission is simple: to help people protect themselves from scams by providing a platform where users can report and uncover fraudulent activities. In an increasingly digital world, scams are becoming more common, affecting millions of people worldwide. Our goal is to create a safer environment by equipping individuals with the knowledge and tools needed to avoid falling victim to fraud.
              Our platform is powered by a community of vigilant users who share their experiences to help others stay informed. From online scams to in-person fraud, we&apos;re committed to building a comprehensive database that&apos;s easy to access and navigate.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">With Scam Sleuth, you can:</h3>
              <ul className="space-y-2 list-disc pl-6">
                <li className="text-base md:text-lg">Report scams you&apos;ve encountered</li>
                <li className="text-base md:text-lg">Browse reports submitted by others</li>
                <li className="text-base md:text-lg">Learn about the latest trends in fraudulent activities</li>
                <li className="text-base md:text-lg">Take steps to protect yourself and your loved ones</li>
              </ul>
            </div>

            <div className="border-t-2 border-[#E14048] my-6" />

            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-bold">Contact Us</h3>
              <p className="text-base md:text-lg">We value feedback from our users and are always ready to assist:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li className="text-base md:text-lg">Email: support@scamsleuth.com</li>
                <li className="text-base md:text-lg">Phone: +1-800-SCAM-SLEUTH (1-800-722-6758)</li>
                <li className="text-base md:text-lg">Follow us on Twitter, Facebook, and Instagram</li>
              </ul>
            </div>

            <div className="border-t-2 border-[#E14048] my-6" />

            <p className="text-base md:text-lg">
              We believe that by working together, we can reduce the number of people affected by
              scams. Join Scam Sleuth today and help us uncover scams, one report at a time.
            </p>

            <div className="text-xs md:text-sm text-gray-600 pt-6">
              © 2024 Scam Sleuth. All rights reserved. Unauthorized reproduction or distribution of any
              material from this site is prohibited without permission.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}