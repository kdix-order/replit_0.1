import React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  animationType?: "scale" | "bounce" | "pulse" | "wiggle" | "jelly";
  intensity?: "subtle" | "medium" | "strong";
  delay?: number;
}

export function AnimatedButton({
  children,
  className,
  animationType = "scale",
  intensity = "medium",
  delay = 0,
  ...props
}: AnimatedButtonProps) {
  // アニメーションのインテンシティ設定
  const intensityValues = {
    subtle: {
      scale: [1, 1.02, 1],
      bounce: [0, -2, 0],
      pulse: [1, 1.03, 1],
      wiggle: [-1, 1, -1, 0],
      jelly: [1, 1.05, 0.95, 1.02, 1]
    },
    medium: {
      scale: [1, 1.05, 1],
      bounce: [0, -4, 0],
      pulse: [1, 1.07, 1],
      wiggle: [-2, 2, -2, 0],
      jelly: [1, 1.1, 0.9, 1.05, 1]
    },
    strong: {
      scale: [1, 1.1, 1],
      bounce: [0, -6, 0],
      pulse: [1, 1.12, 1],
      wiggle: [-3, 3, -3, 0],
      jelly: [1, 1.15, 0.85, 1.1, 1]
    }
  };

  // アニメーション別のトランジション設定
  const getTransition = () => {
    switch (animationType) {
      case "scale":
        return {
          duration: 0.2,
          ease: "easeInOut"
        };
      case "bounce":
        return {
          duration: 0.3,
          ease: "easeOut",
          type: "spring",
          stiffness: 500,
          damping: 10
        };
      case "pulse":
        return {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          repeat: 1,
          repeatType: "reverse" as const
        };
      case "wiggle":
        return {
          duration: 0.4,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 1]
        };
      case "jelly":
        return {
          duration: 0.5,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 1]
        };
      default:
        return {
          duration: 0.2,
          ease: "easeInOut"
        };
    }
  };

  // アニメーションのプロパティを設定
  const getAnimationProps = () => {
    const values = intensityValues[intensity][animationType];
    
    switch (animationType) {
      case "scale":
        return { scale: values };
      case "bounce":
        return { y: values };
      case "pulse":
        return { scale: values };
      case "wiggle":
        return { rotate: values };
      case "jelly":
        return { scale: values };
      default:
        return { scale: values };
    }
  };

  return (
    <motion.div
      whileTap={getAnimationProps()}
      transition={getTransition()}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: { delay }
      }}
      className="inline-block"
    >
      <Button className={cn("transform-gpu", className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}