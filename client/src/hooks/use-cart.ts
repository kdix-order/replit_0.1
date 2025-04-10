import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  size: string;
  customizations: string[];
  product: Product;
};

export function useCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get cart items
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      quantity, 
      size, 
      customizations 
    }: { 
      productId: number; 
      quantity: number; 
      size: string; 
      customizations: string[];
    }) => {
      return apiRequest("POST", "/api/cart", { productId, quantity, size, customizations });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "商品をカートに追加できませんでした",
        variant: "destructive",
      });
    },
  });

  // Update cart item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (quantity <= 0) {
        return apiRequest("DELETE", `/api/cart/${id}`, undefined);
      }
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "カートを更新できませんでした",
        variant: "destructive",
      });
    },
  });

  // Remove from cart mutation
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "商品をカートから削除できませんでした",
        variant: "destructive",
      });
    },
  });

  // Add to cart
  const addToCart = (
    product: Product, 
    quantity = 1, 
    size: string = "並", 
    customizations: string[] = []
  ) => {
    if (!isAuthenticated) {
      toast({
        title: "ログインが必要です",
        description: "カートに追加するにはログインしてください",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate({ 
      productId: product.id, 
      quantity, 
      size, 
      customizations 
    });
  };

  // Update quantity
  const updateQuantity = (id: number, quantity: number) => {
    updateQuantityMutation.mutate({ id, quantity });
  };

  // Remove item
  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  // Clear cart
  const clearCart = () => {
    cartItems.forEach(item => {
      removeItemMutation.mutate(item.id);
    });
  };

  // Calculate cart count
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity, 
    0
  );

  return {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateQuantityMutation.isPending,
    isRemovingFromCart: removeItemMutation.isPending,
  };
}
