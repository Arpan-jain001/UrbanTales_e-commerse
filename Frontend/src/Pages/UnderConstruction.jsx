import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaHammer, FaCog, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const gearAnim1 = {
  animate: { rotate: [0, 360], transition: { duration: 3, repeat: Infinity, ease: "linear" } }
};
const gearAnim2 = {
  animate: { rotate: [360, 0], transition: { duration: 2.1, repeat: Infinity, ease: "linear" } }
};
const hammerAnim = {
  animate: { rotate: [-8, 25, -8], transition: { duration: 1.5, repeat: Infinity } }
};

const ProgressBar = ({ percent = 65, steps = 5 }) => {
  const activeSteps = Math.ceil((percent / 100) * steps);
  return (
    <div className="w-full flex flex-col items-center">
      {/* Segmented Bar */}
      <div className="my-3 flex items-center w-full max-w-md gap-2">
        {[...Array(steps)].map((_, i) => (
          <div
            key={i}
            className={
              i < activeSteps
                ? "flex-1 h-6 rounded-full bg-blue-600 shadow"
                : "flex-1 h-6 rounded-full bg-gray-200"
            }
            style={{
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Stripes animation for active steps */}
            {i < activeSteps && (
              <motion.div
                animate={{ x: [0, 38, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 h-full w-9 opacity-40"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #fff 0px, #fff 4px, transparent 7px, transparent 13px)",
                }}
              />
            )}
          </div>
        ))}
      </div>
      {/* Bubble + percentage label and animated check at 65% */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative flex items-center"
      >
        <div className="bg-blue-600 text-white px-5 py-[0.35rem] rounded-full font-bold text-base shadow flex items-center gap-2 select-none border-4 border-blue-200">
          <FaCheckCircle className="text-lg" />
          65% Complete
        </div>
      </motion.div>
    </div>
  );
};

const UnderConstruction = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 relative font-sans select-none">
      <div className="relative z-10 max-w-lg w-full bg-white shadow-xl rounded-2xl px-8 py-12 text-center border border-blue-100">

        {/* Error 503 Badge */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="mb-8"
        >
          <div className="flex items-center justify-center">
            <span className="bg-red-600 text-white px-7 py-2 rounded-full font-bold text-xl shadow flex gap-2 items-center">
              <FaExclamationTriangle className="text-2xl text-yellow-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]" />
              ERROR 503
            </span>
          </div>
        </motion.div>

        {/* Connected animated gears & hammer */}
        <div className="relative flex items-center justify-center mb-6 h-24">
          <motion.span
            variants={gearAnim1}
            animate="animate"
            className="absolute left-1/3 bottom-7"
          >
            <FaCog className="text-[2.8rem] text-gray-400" />
          </motion.span>
          <motion.span
            variants={gearAnim2}
            animate="animate"
            className="absolute left-1/2 top-1"
            style={{ zIndex: 2, marginLeft: "-1.8rem" }}
          >
            <FaCog className="text-[3.5rem] text-gray-500" />
          </motion.span>
          <motion.span
            variants={gearAnim1}
            animate="animate"
            className="absolute left-2/3 top-10"
            style={{ zIndex: 1, marginLeft: "-2.2rem" }}
          >
            <FaCog className="text-[2.1rem] text-gray-300" />
          </motion.span>
          <motion.span
            variants={hammerAnim}
            animate="animate"
            className="absolute left-1/2 top-8"
            style={{ marginLeft: "-1rem", zIndex: 3 }}
          >
            <FaHammer className="text-[2.2rem] text-blue-700 drop-shadow-[0_2px_8px_rgba(33,87,224,0.12)]" />
          </motion.span>
        </div>

        {/* Main Heading */}
        <motion.h1
          initial={{ y: 11, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl md:text-2xl font-extrabold mb-3 text-red-600"
        >
          This page/feature is <span className="font-bold">under maintenance</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.7 }}
          className="text-lg text-gray-700 mb-2 font-medium"
        >
          Our team is working.<br />
          Page/feature coming soon!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36, duration: 0.8 }}
          className="text-sm text-gray-500 mb-8"
        >
          For help: <a href="mailto:urbantales4@gmail.com" className="text-blue-600 underline font-semibold">urbantales4@gmail.com</a>
        </motion.p>

      

        {/* Gradient Go to Home Button */}
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{
            scale: 1.07,
            boxShadow: "0 2px 22px #3887e080",
            background: "linear-gradient(90deg,#42a5f5,#ffd600)"
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-500 via-yellow-400 to-pink-500 text-white font-bold text-base px-7 py-3 rounded-full shadow flex items-center gap-2 mx-auto transition-all duration-200 mt-4 hover:brightness-105"
        >
          <FaHome className="text-xl" /> Go to Home
        </motion.button>

        {/* Footer with Copyright */}
        <div className="mt-7 text-gray-500 text-base pt-2 flex flex-col items-center">
          <span>UrbanTales • E-commerce</span>
          <span className="mt-[2px] text-xs">© {new Date().getFullYear()} UrbanTales. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
