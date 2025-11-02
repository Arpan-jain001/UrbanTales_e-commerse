import React from "react";
import { motion } from "framer-motion";

const ORDER_STATUSES = [
  "Pending", "Placed", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"
];

export default function SellerOrderStatusTracker({ status }) {
  const stages = ORDER_STATUSES;
  const currIndex = stages.indexOf(status);

  return (
    <div className="flex items-center gap-1 my-2">
      {stages.map((stage, i) => {
        const active = i <= currIndex;
        const circleColor =
          stage === "Cancelled"
            ? "bg-red-600 border-red-600"
            : active
            ? "bg-blue-700 border-blue-700"
            : "bg-gray-200 border-gray-300";
        const textColor =
          stage === "Cancelled"
            ? "text-red-700 font-semibold"
            : active
            ? "text-blue-700 font-semibold"
            : "text-gray-500";
        return (
          <React.Fragment key={stage}>
            <motion.span
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${circleColor}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.13 }}
            >
              {active && (
                <motion.span
                  className="text-white text-[9px] select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.12 + 0.11 }}
                >✓</motion.span>
              )}
            </motion.span>
            <motion.span
              className={`text-xs select-none ${textColor}`}
              initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.14 + 0.13 }}
              style={{ minWidth: 52, textAlign: "center" }}
            >
              {stage}
            </motion.span>
            {i < stages.length - 1 && (
              <motion.span
                className={`mx-1 ${stage === "Cancelled" ? "text-red-500" : "text-blue-500 font-bold"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: active ? 1 : 0.2 }}
                transition={{ delay: i * 0.09 + 0.13 }}
              >→</motion.span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
