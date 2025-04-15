/**
 * ショッピングカート機能を提供するカスタムフック
 * 商品の追加、更新、削除、カート内の商品情報取得などの機能を提供します
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

/**
 * 商品データの型定義
 */
export type Product = {
  id: number;            // 商品ID
  name: string;          // 商品名
  description: string;   // 商品説明
  price: number;         // 価格
  image: string;         // 商品画像URL
};

/**
 * カート内商品アイテムの型定義
 */
export type CartItem = {
  id: number;                  // カートアイテムID
  userId: number;              // ユーザーID
  productId: number;           // 商品ID
  quantity: number;            // 数量
  size: string;                // サイズ (並、ご飯大など)
  customizations: string[];    // カスタマイズオプション (玉子抜きなど)
  product: Product;            // 商品データ
};

/**
 * カート機能を提供するカスタムフック
 * 商品の追加、更新、削除およびカート関連の計算機能を提供します
 */
export function useCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  /**
   * カート内商品の取得
   * ユーザーが認証されている場合のみ有効
   */
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  /**
   * カートに商品を追加するためのミューテーション
   */
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
      // 成功時にカートデータを再取得
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      // エラー発生時にユーザーに通知
      toast({
        title: "エラーが発生しました",
        description: "商品をカートに追加できませんでした",
        variant: "destructive",
      });
    },
  });

  /**
   * カート内商品の数量を更新するためのミューテーション
   * 数量が0以下の場合は商品を削除します
   */
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (quantity <= 0) {
        // 数量が0以下の場合は商品を削除
        return apiRequest("DELETE", `/api/cart/${id}`, undefined);
      }
      // 数量を更新
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      // 成功時にカートデータを再取得
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      // エラー発生時にユーザーに通知
      toast({
        title: "エラーが発生しました",
        description: "カートを更新できませんでした",
        variant: "destructive",
      });
    },
  });

  /**
   * カートから商品を削除するためのミューテーション
   */
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`, undefined);
    },
    onSuccess: () => {
      // 成功時にカートデータを再取得
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      // エラー発生時にユーザーに通知
      toast({
        title: "エラーが発生しました",
        description: "商品をカートから削除できませんでした",
        variant: "destructive",
      });
    },
  });

  /**
   * カートに商品を追加する関数
   * 
   * @param product - 追加する商品
   * @param quantity - 数量 (デフォルト: 1)
   * @param size - サイズ (デフォルト: 並)
   * @param customizations - カスタマイズオプションの配列 (デフォルト: [])
   */
  const addToCart = (
    product: Product, 
    quantity = 1, 
    size: string = "並", 
    customizations: string[] = []
  ) => {
    // 未認証の場合はログインを促す
    if (!isAuthenticated) {
      toast({
        title: "ログインしてください",
        description: "商品をカートに追加するには、ログインまたは会員登録が必要です。画面右上のログインボタンからお進みください。",
        variant: "destructive",
      });
      return;
    }
    
    // カートに追加
    addToCartMutation.mutate({ 
      productId: product.id, 
      quantity, 
      size, 
      customizations 
    });
  };

  /**
   * カート内商品の数量を更新する関数
   * 
   * @param id - カートアイテムID
   * @param quantity - 新しい数量
   */
  const updateQuantity = (id: number, quantity: number) => {
    updateQuantityMutation.mutate({ id, quantity });
  };

  /**
   * カートから商品を削除する関数
   * 
   * @param id - カートアイテムID
   */
  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  /**
   * カート内のすべての商品を削除する関数
   */
  const clearCart = () => {
    cartItems.forEach(item => {
      removeItemMutation.mutate(item.id);
    });
  };

  /**
   * カート内の商品数を計算
   * 各商品の数量を合計します
   */
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  /**
   * カート内の合計金額を計算
   * 各商品の価格×数量の合計を算出します
   */
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
