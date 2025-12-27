import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import logoImage from '../assets/UrbanTales.png';

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';

export default function NewYearPromotion() {
    const [promotion, setPromotion] = useState(null);
    const [show, setShow] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [countdown, setCountdown] = useState(10);
    const [fireworks, setFireworks] = useState([]);
    const audioRef = useRef(null);

    const getDaysToPromoEnd = () => {
  if (!promotion?.endDate) {
    const now = new Date();
    const newYear = new Date('2026-01-01T00:00:00');
    const diff = newYear - now;
    const days = diff / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(days));
  }

  const now = new Date();
  const endDate = new Date(promotion.endDate);
  const diff = endDate - now;
  const days = diff / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(days));
};



    useEffect(() => {
        fetchPromotion();
    }, []);

    useEffect(() => {
        if (!show || timeLeft <= 0) return;

        if (audioRef.current) {
            audioRef.current.volume = 0.4;
            audioRef.current.play().catch(console.error);
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    setShow(false);
                    sessionStorage.setItem('newYearPromoSeen', 'true');
                    if (audioRef.current) audioRef.current.pause();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [show, timeLeft]);

    useEffect(() => {
        if (!show) return;

        const actualDaysLeft = getDaysToPromoEnd();
        let current = 10;

        const interval = setInterval(() => {
            if (current > actualDaysLeft) {
                setCountdown(current);
                current--;
            } else {
                clearInterval(interval);
                setCountdown(actualDaysLeft);
            }
        }, 250);

        return () => clearInterval(interval);
    }, [show, promotion]);


    useEffect(() => {
        if (!show) return;

        const interval = setInterval(() => {
            setFireworks(prev => [...prev.slice(-7), {
                id: Date.now() + Math.random(),
                x: 15 + Math.random() * 70,
                y: 15 + Math.random() * 50,
                color: ['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#DDA0DD'][Math.floor(Math.random() * 5)],
            }]);
        }, 500);

        return () => clearInterval(interval);
    }, [show]);

    const fetchPromotion = async () => {
        try {
            const lastSeen = sessionStorage.getItem('newYearPromoSeen');
            if (lastSeen) return;

            const res = await axios.get(`${BASE_API_URL}/api/promotions/active?placement=HOMEPAGE_FULLSCREEN`);

            if (res.data.promotions?.[0]) {
                const promo = res.data.promotions[0];
                setPromotion(promo);
                setShow(true);
                setTimeLeft(promo.duration || 8);
                axios.post(`${BASE_API_URL}/api/promotions/${promo._id}/view`).catch(console.error);
            }
        } catch (error) {
            console.error('Fetch promotion error:', error);
        }
    };

    if (!promotion) return null;

    const progress = (timeLeft / (promotion.duration || 8)) * 100;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
                >
                    <audio ref={audioRef} loop>
                        <source src="https://assets.mixkit.co/active_storage/sfx/2773/2773-preview.mp3" type="audio/mpeg" />
                    </audio>

                    {/* Background */}
                    <motion.div
                        animate={{
                            background: [
                                'linear-gradient(135deg, #0a0015 0%, #1a0a3e 30%, #2d1b4e 60%, #1a0a3e 100%)',
                                'linear-gradient(135deg, #1a0a3e 0%, #2d1b4e 30%, #1e0a3a 60%, #0a0015 100%)',
                                'linear-gradient(135deg, #2d1b4e 0%, #1a0a3e 30%, #0a0015 60%, #1a0a3e 100%)',
                            ]
                        }}
                        transition={{ duration: 12, repeat: Infinity }}
                        className="absolute inset-0"
                    />

                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(255,215,0,0.2)_0%,_transparent_60%)]"
                    />

                    {/* Rings */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 4, 1],
                                opacity: [0.6, 0, 0.6],
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                delay: i * 1.3,
                                ease: "easeInOut"
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 sm:border-3"
                            style={{
                                width: `${180 + i * 40}px`,
                                height: `${180 + i * 40}px`,
                                borderColor: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#FFA500'][i],
                                borderStyle: 'dashed',
                                boxShadow: `0 0 30px ${['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#FFA500'][i]}`,
                            }}
                        />
                    ))}

                    {/* Fireworks */}
                    <AnimatePresence>
                        {fireworks.map((fw) => (
                            <div key={fw.id} className="absolute" style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 8, opacity: 0 }}
                                    transition={{ duration: 2.5 }}
                                    className="absolute w-10 h-10 rounded-full"
                                    style={{
                                        background: `radial-gradient(circle, ${fw.color}, transparent)`,
                                        boxShadow: `0 0 120px 60px ${fw.color}`,
                                    }}
                                />

                                {[...Array(40)].map((_, i) => {
                                    const angle = (i / 40) * Math.PI * 2;
                                    const distance = 90 + Math.random() * 100;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ scale: 0, x: 0, y: 0 }}
                                            animate={{
                                                scale: [0, 1.5, 0],
                                                x: Math.cos(angle) * distance,
                                                y: Math.sin(angle) * distance,
                                                opacity: [1, 1, 0],
                                            }}
                                            transition={{ duration: 2.2, ease: "easeOut" }}
                                            className="absolute w-3 h-3 rounded-full"
                                            style={{ background: fw.color, boxShadow: `0 0 12px ${fw.color}` }}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </AnimatePresence>

                    {/* Confetti */}
                    {[...Array(80)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{
                                y: '110vh',
                                opacity: [0, 1, 1, 0],
                                rotate: [0, Math.random() * 720],
                                x: [0, Math.sin(i * 2) * 120],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 3,
                                delay: Math.random() * 2,
                                repeat: Infinity,
                            }}
                            className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded"
                            style={{
                                left: `${Math.random() * 100}%`,
                                background: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98'][Math.floor(Math.random() * 4)],
                                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                            }}
                        />
                    ))}

                    {/* Logo - Top Right */}
                    <motion.div
                        initial={{ scale: 0, rotate: 360 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20"
                    >
                        <motion.img
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            src={logoImage}
                            alt="UrbanTales"
                            className="w-20 sm:w-28 md:w-32 h-auto"
                            style={{ filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.8))' }}
                        />
                    </motion.div>

                    {/* Days Badge - Top Center */}
                    {/* Days Badge - Only show if countdown > 0 */}
{countdown > 0 && (
  <motion.div
    initial={{ scale: 0, y: -100 }}
    animate={{ scale: 1, y: 0 }}
    transition={{ delay: 0.4, type: "spring" }}
    className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-20"
  >
    <motion.div
      animate={{ boxShadow: ['0 0 30px rgba(255,215,0,0.6)', '0 0 60px rgba(255,215,0,1)', '0 0 30px rgba(255,215,0,0.6)'] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="inline-flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-xl border-2 border-white/50"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={countdown}
          initial={{ scale: 2.5, opacity: 0, y: -60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.3, opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 600 }}
          className="text-white font-black text-3xl sm:text-4xl min-w-[40px] sm:min-w-[50px] text-center"
          style={{ textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
        >
          {countdown}
        </motion.span>
      </AnimatePresence>

      <div>
        <div className="text-white font-black text-sm sm:text-base">
          {countdown} Day{countdown !== 1 ? 's' : ''} Left!
        </div>
        <div className="text-white/90 text-xs font-semibold">to New Year 2026</div>
      </div>
    </motion.div>
  </motion.div>
)}

                    {/* Main Content - Center */}
                    <div className="relative h-full flex flex-col items-center justify-center">
                        {/* 2026 - Center with Gradient */}
                        <motion.div
                            initial={{ scale: 0, rotateY: -180 }}
                            animate={{ scale: 1, rotateY: 0 }}
                            transition={{ delay: 0.6, duration: 1.5, type: "spring" }}
                            style={{ perspective: "3000px" }}
                            className="relative mb-8 sm:mb-12"
                        >
                            <motion.h1
                                animate={{
                                    rotateY: [0, 5, 0, -5, 0],
                                    scale: [1, 1.03, 1],
                                }}
                                transition={{ duration: 8, repeat: Infinity }}
                                className="text-[100px] sm:text-[150px] md:text-[200px] font-black text-center"
                                style={{
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF1493 50%, #9370DB 75%, #00CED1 100%)',
                                    backgroundSize: '200% 200%',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0 20px 40px rgba(255,105,180,0.7))',
                                }}
                            >
                                <motion.span
                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                >
                                    2026
                                </motion.span>
                            </motion.h1>
                        </motion.div>

                        {/* Happy New Year */}
                        <motion.div
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-center px-4 space-y-6 sm:space-y-8"
                        >
                            <motion.h2
                                animate={{ scale: [1, 1.06, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                                className="text-5xl sm:text-7xl md:text-8xl font-black text-white"
                                style={{ textShadow: '0 0 50px rgba(255,215,0,1), 0 0 100px rgba(255,105,180,0.8)' }}
                            >
                                {promotion.title || "🎊 🎊 Happy New Year! 🎉 🎉"}
                            </motion.h2>


                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400"
                            >
                                from UrbanTales
                            </motion.p>


                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                                className="text-xl sm:text-2xl md:text-3xl font-bold text-white/98 max-w-3xl mx-auto"
                                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                            >
                                {promotion.description || "New Year, New Deals, New You!"}
                            </motion.p>

                            {/* Emojis */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.8 }}
                                className="flex items-center justify-center gap-5 sm:gap-8 pt-4"
                            >
                                {['🎁', '✨', '🎉', '🎈'].map((emoji, i) => (
                                    <motion.span
                                        key={i}
                                        animate={{
                                            y: [0, -15, 0],
                                            rotate: [0, 10, -10, 0],
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            delay: i * 0.3,
                                        }}
                                        className="text-3xl sm:text-4xl md:text-5xl"
                                        style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
                                    >
                                        {emoji}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/70">
                        <motion.div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 relative overflow-hidden"
                        >
                            <motion.div
                                animate={{ x: ['-100%', '300%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                            />
                        </motion.div>
                    </div>

                    {/* Shooting Stars */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                x: ['-10vw', '110vw'],
                                y: [`${i * 7}vh`, `${50 + i * 6}vh`],
                                opacity: [0, 1, 1, 0],
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                            className="absolute w-2 h-2 bg-white rounded-full"
                            style={{ boxShadow: '0 0 30px 8px rgba(255,255,255,1)' }}
                        />
                    ))}
                    {/* Powered by UrbanTales Chip with Blinking Light */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 }}
                        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full">
                            {/* Blinking Light */}
                            <motion.span
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    boxShadow: [
                                        '0 0 5px rgba(34,197,94,0.5)',
                                        '0 0 15px rgba(34,197,94,1)',
                                        '0 0 5px rgba(34,197,94,0.5)',
                                    ],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-emerald-400"
                            />

                            {/* Text */}
                            <span className="text-white/80 text-[10px] sm:text-xs font-semibold">
                                Powered by UrbanTales
                            </span>
                        </div>
                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}

