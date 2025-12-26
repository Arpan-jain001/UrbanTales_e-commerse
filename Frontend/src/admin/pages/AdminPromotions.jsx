import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiX, FiArrowRight } from 'react-icons/fi';

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';

export default function PromotionSplash() {
  const [promotion, setPromotion] = useState(null);
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchPromotion();
  }, []);

  useEffect(() => {
    if (!show || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setShow(false);
          sessionStorage.setItem('promotionSeen', 'true');
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [show, timeLeft]);

  const fetchPromotion = async () => {
    try {
      const lastSeen = sessionStorage.getItem('promotionSeen');
      if (lastSeen) return;

      const res = await axios.get(`${BASE_API_URL}/api/promotions/active?placement=HOMEPAGE_FULLSCREEN`);
      
      if (res.data.promotions && res.data.promotions.length > 0) {
        const promo = res.data.promotions[0];
        setPromotion(promo);
        setShow(true);
        setTimeLeft(promo.duration || 6);

        // Track view
        axios.post(`${BASE_API_URL}/api/promotions/${promo._id}/view`).catch(console.error);
      }
    } catch (error) {
      console.error('Fetch promotion error:', error);
    }
  };

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('promotionSeen', 'true');
  };

  const handleClick = () => {
    if (promotion?.clickAction) {
      axios.post(`${BASE_API_URL}/api/promotions/${promotion._id}/click`).catch(console.error);
      window.location.href = promotion.clickAction;
    }
  };

  if (!promotion) return null;

  const progress = (timeLeft / (promotion.duration || 6)) * 100;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
            {/* Floating Orbs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-10 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -80, 0],
                y: [0, 60, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500/30 to-blue-500/30 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-3xl"
            />

            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          </div>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all group"
          >
            <FiX className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-90 transition-transform duration-300" />
          </motion.button>

          {/* Main Content Container */}
          <div className="relative h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              className="relative max-w-7xl w-full"
              style={{ perspective: "2000px" }}
            >
              {/* 3D Card Effect */}
              <motion.div
                animate={{
                  rotateX: [0, 2, 0, -2, 0],
                  rotateY: [0, -2, 0, 2, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{ transformStyle: "preserve-3d" }}
                onClick={handleClick}
              >
                {/* Glassmorphism Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-white/10 to-transparent p-[2px]">
                  <div className="w-full h-full rounded-3xl bg-black/40 backdrop-blur-2xl" />
                </div>

                {/* Content */}
                <div className="relative cursor-pointer">
                  {/* Media */}
                  {promotion.type === "VIDEO" ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-auto max-h-[85vh] object-contain rounded-3xl"
                    >
                      <source src={promotion.mediaUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <motion.img
                      src={promotion.mediaUrl}
                      alt={promotion.title}
                      className="w-full h-auto max-h-[85vh] object-contain rounded-3xl"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-8 md:p-12">
                    {/* Title with 3D Text Effect */}
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="relative"
                    >
                      <h1 
                        className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 sm:mb-6"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF1493 50%, #9370DB 75%, #4169E1 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          textShadow: '0 0 80px rgba(255,215,0,0.5)',
                          filter: 'drop-shadow(0 10px 30px rgba(255,105,180,0.6))'
                        }}
                      >
                        {promotion.title}
                      </h1>
                      
                      {/* Sparkle Effects */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                          className="absolute w-4 h-4 rounded-full bg-yellow-300"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Description */}
                    {promotion.description && (
                      <motion.p
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-2xl mb-6 sm:mb-8 max-w-4xl"
                      >
                        {promotion.description}
                      </motion.p>
                    )}

                    {/* CTA Button */}
                    {promotion.clickAction && (
                      <motion.button
                        initial={{ y: 50, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClick}
                        className="group relative px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full text-white font-black text-lg sm:text-2xl shadow-2xl overflow-hidden"
                      >
                        <motion.div
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        />
                        <span className="relative flex items-center gap-3">
                          Shop Now
                          <FiArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </span>
                      </motion.button>
                    )}
                  </div>

                  {/* Floating Particles */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                      className="absolute w-2 h-2 rounded-full bg-white/60"
                      style={{
                        bottom: `${Math.random() * 20}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: progress / 100 }}
              className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 origin-left"
              style={{ transformOrigin: "left" }}
            />
          </div>

          {/* Timer Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full"
          >
            <p className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⏱️
              </motion.span>
              Auto-closing in {Math.ceil(timeLeft)}s
            </p>
          </motion.div>

                    {/* Corner Decorations */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-8 left-8 w-20 h-20 sm:w-32 sm:h-32 opacity-20"
          >
            <div className="w-full h-full border-4 border-yellow-400 rounded-full" />
            <div className="absolute inset-2 border-4 border-pink-400 rounded-full" />
            <div className="absolute inset-4 border-4 border-purple-400 rounded-full" />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-8 right-8 w-20 h-20 sm:w-32 sm:h-32 opacity-20"
          >
            <div className="w-full h-full border-4 border-indigo-400 rounded-full" />
            <div className="absolute inset-2 border-4 border-blue-400 rounded-full" />
            <div className="absolute inset-4 border-4 border-cyan-400 rounded-full" />
          </motion.div>

          {/* Shooting Stars */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: ['0vw', '100vw'],
                y: ['0vh', '50vh'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut"
              }}
              className="absolute top-0 left-0 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full"
              style={{
                boxShadow: '0 0 20px 2px rgba(255,255,255,0.8), 0 0 40px 4px rgba(255,255,255,0.4)',
              }}
            />
          ))}

          {/* 3D Rotating Elements */}
          <motion.div
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-10 hidden md:block"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl opacity-40 blur-sm" />
          </motion.div>

          <motion.div
            animate={{
              rotateX: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-10 hidden md:block"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-40 blur-sm" />
          </motion.div>

          {/* Pulsating Rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 border-2 border-white/30 rounded-full"
            />
          ))}

          {/* Bottom Info Bar */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-20 sm:bottom-24 left-0 right-0 flex justify-center px-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 sm:px-8 py-3 sm:py-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white text-xs sm:text-sm font-semibold">Limited Time</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <span className="text-white text-xs sm:text-sm font-semibold">Exclusive Deals</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-white text-xs sm:text-sm font-semibold">Hot Offers</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

