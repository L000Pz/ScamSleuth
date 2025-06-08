"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Eye, ChevronRight, RefreshCw, TrendingUp } from 'lucide-react';
import ScamCard from './card';
import ScamCardSkeleton from './ScamCardSkeleton';
import { getRecentReviews } from './actions';
import heroImage from '@/assets/images/hero.png';

interface Review {
  review_id: number;
  title: string;
  description: string;
  review_date: string;
  scam_type_id: number;
  review_content_id: number;
}

interface TransformedScam {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export default function RecentScams() {
  const [scams, setScams] = useState<TransformedScam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const result = await getRecentReviews();
      
      if (result.success && result.data) {
        const transformedScams: TransformedScam[] = result.data
          .slice(0, 6)
          .map((review: Review) => ({
            id: review.review_id,
            name: review.title,
            description: review.description || 'No description available',
          }));
        setScams(transformedScams);
        setError(null);
      } else {
        setError(result.error || 'Failed to load recent scams');
      }
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      setError('Failed to load recent scams');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleViewAll = () => {
    // Navigate to all scams page
    window.location.href = '/scams';
  };

  // Container variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Item variants for individual cards
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-[#BBB8AF] via-[#C5C2B8] to-[#BBB8AF] px-4 md:px-[100px] md:py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-red rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg mx-auto text-center"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-red" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Unable to Load Scams</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 bg-red hover:bg-red/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-[#BBB8AF] via-[#C5C2B8] to-[#BBB8AF] px-4 md:px-[100px] md:py-16 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-64 h-64 bg-red rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 0.8, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-black rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12"
        >
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-red rounded-full shadow-lg"
              />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                Recent Scams
              </h2>
            </div>
            <p className="text-gray-600 text-lg">
              Stay informed about the latest fraud attempts in your area
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red to-red/80 hover:from-red/90 hover:to-red/70 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <Eye className="w-4 h-4" />
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ScamCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
            >
              {scams.map((scam) => (
                <motion.div
                  key={scam.id}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -5,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="group"
                >
                  <div className="relative">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                    <div className="relative">
                      <ScamCard
                        id={scam.id}
                        name={scam.name}
                        description={scam.description}
                        imageUrl={heroImage}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-white/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 shadow-lg">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <AlertTriangle className="w-6 h-6 text-red" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800">{scams.length}</h3>
              <p className="text-gray-600">Recent Reports</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 shadow-lg">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Eye className="w-6 h-6 text-blue-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800">24/7</h3>
              <p className="text-gray-600">Monitoring</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 shadow-lg">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <TrendingUp className="w-6 h-6 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800">Live</h3>
              <p className="text-gray-600">Updates</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}