import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type RiceBowlWithIngredientsProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
};

export function RiceBowlWithIngredients({
  size = "md",
  className,
  text,
}: RiceBowlWithIngredientsProps) {
  // Size mappings
  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  const containerClass = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-40 h-40",
    xl: "w-48 h-48",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", containerClass[size])}>
        {/* Bowl (static at the bottom) */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full">
          <div className={cn("text-[#e80113]", sizeClass[size])}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="M19 11H5c0 0 0-6.5 7-6.5S19 11 19 11z" />
              <path d="M12 11v6" />
              <path d="M8 11v6" />
              <path d="M16 11v6" />
              <path d="M5 17h14a2 2 0 0 1 0 4H5a2 2 0 0 1 0-4z" />
            </svg>
          </div>
        </div>

        {/* Rice (static inside bowl) */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className={cn("text-white", sizeClass.sm)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              stroke="#f0f0f0"
              strokeWidth="1"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="6" />
            </svg>
          </div>
        </div>

        {/* Ingredient 1 - Karaage */}
        <motion.div
          className="absolute"
          style={{ top: "25%", left: "30%" }}
          animate={{
            y: [0, -5, 0, -3, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <div className={cn("text-[#e5a355]", sizeClass.sm)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="8" />
              <path d="M14.5 8.5l-5 5" />
              <path d="M8.5 9.5l4 1" />
              <path d="M11.5 14.5l1-4" />
            </svg>
          </div>
        </motion.div>

        {/* Ingredient 2 - Egg */}
        <motion.div
          className="absolute"
          style={{ top: "40%", left: "55%" }}
          animate={{
            y: [0, -3, 0, -6, 0],
            rotate: [3, -3, 3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className={cn("text-[#fee10b]", sizeClass.sm)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
        </motion.div>

        {/* Ingredient 3 - Green Onion */}
        <motion.div
          className="absolute"
          style={{ top: "20%", left: "65%" }}
          animate={{
            y: [0, -4, 0, -2, 0],
            rotate: [-5, 5, -5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2.7,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 0.2,
          }}
        >
          <div className={cn("text-[#3fa34d]", sizeClass.sm)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="M12 2v20" />
              <path d="M8 4c0 1.5 1.5 3 4 3s4-1.5 4-3" />
              <path d="M8 8c0 1.5 1.5 3 4 3s4-1.5 4-3" />
            </svg>
          </div>
        </motion.div>

        {/* Ingredient 4 - Meat */}
        <motion.div
          className="absolute"
          style={{ top: "35%", left: "25%" }}
          animate={{
            y: [0, -2, 0, -5, 0],
            rotate: [2, -2, 2],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 0.7,
          }}
        >
          <div className={cn("text-[#b44e2a]", sizeClass.sm)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <rect x="4" y="8" width="16" height="8" rx="2" />
              <path d="M6 12h12" />
            </svg>
          </div>
        </motion.div>

        {/* Steam 1 */}
        <motion.div
          className="absolute left-1/3"
          style={{ top: "10%" }}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [0, -15],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeOut",
            delay: 0.2,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-gray-400", sizeClass.sm)}
          >
            <path d="M3 10c1.5 0 2.5-1 2.5-2.5 0-1.5 1-2.5 2.5-2.5 1.5 0 2.5 1 2.5 2.5" />
          </svg>
        </motion.div>

        {/* Steam 2 */}
        <motion.div
          className="absolute left-2/3"
          style={{ top: "5%" }}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [0, -20],
          }}
          transition={{
            duration: 2.3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeOut",
            delay: 0.5,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-gray-400", sizeClass.sm)}
          >
            <path d="M12 7c1.5 0 2.5-1 2.5-2.5 0-1.5 1-2.5 2.5-2.5 1.5 0 2.5 1 2.5 2.5" />
          </svg>
        </motion.div>
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600">{text}</p>
      )}
    </div>
  );
}