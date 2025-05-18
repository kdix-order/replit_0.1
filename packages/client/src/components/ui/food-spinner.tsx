import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Foods array with different food items and their SVG representations
const FOODS = [
  {
    name: "rice-bowl",
    icon: (
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
    ),
  },
  {
    name: "chopsticks",
    icon: (
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
        <path d="M8 4v20M16 4v20" />
        <path d="M8 4c0-1 1-2 2-2s3 1 3 3" />
        <path d="M16 4c0-1-1-2-2-2s-3 1-3 3" />
      </svg>
    ),
  },
  {
    name: "karaage",
    icon: (
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
    ),
  },
  {
    name: "takoyaki",
    icon: (
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
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    ),
  },
  {
    name: "egg",
    icon: (
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
    ),
  },
  {
    name: "green-onion",
    icon: (
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
    ),
  },
  {
    name: "meat",
    icon: (
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
    ),
  },
];

type FoodSpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "black";
  foodType?: "random" | "rice-bowl" | "chopsticks" | "karaage" | "takoyaki" | "egg";
  className?: string;
  text?: string;
};

export function FoodSpinner({
  size = "md",
  color = "primary",
  foodType = "random",
  className,
  text,
}: FoodSpinnerProps) {
  // Size mappings
  const sizeClass = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Color mappings
  const colorClass = {
    primary: "text-[#e80113]",
    secondary: "text-[#fee10b]",
    white: "text-white",
    black: "text-black",
  };

  // Get a random or specific food icon
  const getFoodIcon = () => {
    if (foodType === "random") {
      const randomIndex = Math.floor(Math.random() * FOODS.length);
      return FOODS[randomIndex].icon;
    }
    
    const selectedFood = FOODS.find((food) => food.name === foodType);
    return selectedFood ? selectedFood.icon : FOODS[0].icon;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        className={cn("relative", sizeClass[size])}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className={cn(colorClass[color])}>{getFoodIcon()}</div>
      </motion.div>
      {text && (
        <p className={cn("mt-2 text-sm font-medium", colorClass[color])}>
          {text}
        </p>
      )}
    </div>
  );
}

type BowlSteamProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
};

export function BowlSteamSpinner({
  size = "md",
  className,
  text,
}: BowlSteamProps) {
  // Size mappings
  const sizeClass = {
    xs: "w-4 h-4",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div>
        {/* Simple bowl icon without animations */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-[#e80113]", sizeClass[size])}
        >
          {/* Bowl with simple content indicator */}
          <path d="M3 10h18c0 0 1 0.2 1 2c0 4-4.1 8-10 8c-5.9 0-10-4-10-8c0-1.8 1-2 1-2z" />
          <path d="M7.5 14.5a4.5 4.5 0 0 0 9 0" />
        </svg>
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600">{text}</p>
      )}
    </div>
  );
}

type BouncingFoodSpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  foodType?: "random" | "rice-bowl" | "chopsticks" | "karaage" | "takoyaki" | "egg";
  className?: string;
  text?: string;
};

export function BouncingFoodSpinner({
  size = "md",
  foodType = "random",
  className,
  text,
}: BouncingFoodSpinnerProps) {
  // Size mappings
  const sizeClass = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Get a random or specific food icon
  const getFoodIcon = () => {
    if (foodType === "random") {
      const randomIndex = Math.floor(Math.random() * FOODS.length);
      return FOODS[randomIndex].icon;
    }
    
    const selectedFood = FOODS.find((food) => food.name === foodType);
    return selectedFood ? selectedFood.icon : FOODS[0].icon;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("text-[#e80113]", sizeClass[size])}
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          >
            {getFoodIcon()}
          </motion.div>
        ))}
      </div>
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600">{text}</p>
      )}
    </div>
  );
}