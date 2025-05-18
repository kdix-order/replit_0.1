import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Product } from "@/hooks/use-cart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Size } from "@/lib/constants";

type UpsellSuggestionProps = {
  product: Product;
  onAddToCart: (product: Product, quantity: number, size: Size) => void;
  onClose: () => void;
};

export function UpsellSuggestion({ product, onAddToCart, onClose }: UpsellSuggestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 left-0 right-0 z-50 mx-auto w-full max-w-sm px-4"
    >
      <Card className="border-2 border-[#e80113] overflow-hidden shadow-lg">
        <div className="bg-[#e80113] py-2 px-4 flex justify-between items-center">
          <h3 className="font-bold text-white">おすすめ商品</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-white hover:bg-[#fee10b] hover:text-black"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-md overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{product.name}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
              <p className="font-bold text-[#e80113] mt-1">¥{product.price}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-gray-300"
              onClick={onClose}
            >
              あとで
            </Button>
            <AnimatedButton 
              variant="default" 
              size="sm" 
              className="flex-1 bg-[#fee10b] hover:bg-yellow-400 text-black"
              animationType="jelly"
              onClick={() => {
                onAddToCart(product, 1, "並");
                onClose();
              }}
            >
              追加する
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}