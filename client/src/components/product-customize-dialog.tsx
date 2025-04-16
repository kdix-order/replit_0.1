/**
 * 商品のカスタマイズダイアログコンポーネント
 * サイズの選択、数量調整、カスタマイズオプションを提供します
 */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";
import { Product } from "../hooks/use-cart";
import { SIZES, CUSTOMIZATION_OPTIONS, Size } from "../lib/constants";
import { PauseCircle, ShoppingBag, ShoppingCart, X, Check, Plus } from "lucide-react";
import { useStoreSettings } from "../hooks/use-store-settings";
import { Alert, AlertTitle } from "../components/ui/alert";

/**
 * 商品カスタマイズダイアログの Props 型定義
 * @property product - カスタマイズする商品（null の場合はダイアログを表示しない）
 * @property isOpen - ダイアログの表示状態
 * @property onClose - ダイアログを閉じる際に呼び出されるコールバック
 * @property onAddToCart - カートに追加する際に呼び出されるコールバック
 */
type ProductCustomizeDialogProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: Size, customizations: string[]) => void;
};

/**
 * 商品カスタマイズダイアログコンポーネント
 * 商品のサイズ、数量、カスタマイズオプションを選択するダイアログを提供します
 */
export function ProductCustomizeDialog({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductCustomizeDialogProps) {
  // 商品の数量状態
  const [quantity, setQuantity] = useState(1);
  // 選択されたサイズ状態（デフォルトは「並」）
  const [size, setSize] = useState<Size>("並");
  // 選択されたカスタマイズオプション状態
  const [customizations, setCustomizations] = useState<string[]>([]);
  // URL遷移用のフック
  const [, setLocation] = useLocation();
  // 店舗設定（注文受付状態）を取得
  const { isAcceptingOrders, refetch: refetchStoreSettings } = useStoreSettings();
  // トースト通知
  const { toast } = useToast();

  // ダイアログが開かれるたびに店舗設定を更新
  useEffect(() => {
    if (isOpen) {
      // ダイアログが開かれたときに店舗設定を最新の状態に更新
      refetchStoreSettings();
    }
  }, [isOpen, refetchStoreSettings]);

  /**
   * ダイアログを閉じる際の処理
   * 状態をリセットしてダイアログを閉じます
   */
  const handleClose = () => {
    setQuantity(1);
    setSize("並");
    setCustomizations([]);
    onClose();
  };

  /**
   * カスタマイズオプションの変更を処理する関数
   * チェックボックスの状態に応じてカスタマイズオプションを追加/削除します
   * 
   * @param checked - チェックボックスの状態
   * @param id - カスタマイズオプションのID
   */
  const handleCustomizationChange = (checked: boolean, id: string) => {
    if (checked) {
      // オプションを追加
      setCustomizations((prev) => [...prev, id]);
    } else {
      // オプションを削除
      setCustomizations((prev) => prev.filter((item) => item !== id));
    }
  };

  /**
   * 数量を増やす関数
   */
  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  
  /**
   * 数量を減らす関数（最小値は1）
   */
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  /**
   * カートに商品を追加する関数
   * 選択した商品情報をカートに追加してダイアログを閉じます
   */
  const handleAddToCart = () => {
    if (!product) return;
    
    // 注文受付停止中の場合は処理を中断
    if (!isAcceptingOrders) {
      toast({
        title: "注文停止中",
        description: "申し訳ありませんが、現在注文の受付を一時的に停止しています。",
        variant: "destructive",
      });
      return;
    }
    
    onAddToCart(product, quantity, size, customizations);
    handleClose();
  };
  
  /**
   * 今すぐ購入する関数
   * 商品をカートに追加した後、カートページに遷移します
   */
  const handleBuyNow = () => {
    if (!product) return;
    
    // 注文受付停止中の場合は処理を中断
    if (!isAcceptingOrders) {
      toast({
        title: "注文停止中",
        description: "申し訳ありませんが、現在注文の受付を一時的に停止しています。",
        variant: "destructive",
      });
      return;
    }
    
    onAddToCart(product, quantity, size, customizations);
    handleClose();
    // カートページに遷移
    setLocation("/cart");
  };

  /**
   * 商品名とサイズから価格を計算する関数
   * 各商品ごとにサイズによる価格設定があるため、それに応じた価格を返します
   * 
   * @param productName - 商品名
   * @param sizeOption - サイズ（ガールズサイズ、並、ご飯大、おかず大、大大）
   * @returns サイズと商品に応じた価格
   */
  const getPriceForSizeAndProduct = (productName: string, sizeOption: Size): number => {
    if (productName === "から丼") {
      switch (sizeOption) {
        case "ガールズサイズ": return 380;
        case "並": return 420;
        case "ご飯大": return 480;
        case "おかず大": return 540;
        case "大大": return 600;
      }
    } else if (["キムカラ丼", "鳥塩レモン丼", "あまから丼", "牛カルビ丼", "うま煮丼", "から玉子丼"].includes(productName)) {
      switch (sizeOption) {
        case "ガールズサイズ": return 490;
        case "並": return 530;
        case "ご飯大": return 590;
        case "おかず大": return 700;
        case "大大": return 760;
      }
    } else if (productName === "月見カルビ丼") {
      switch (sizeOption) {
        case "ガールズサイズ": return 550;
        case "並": return 590;
        case "ご飯大": return 660;
        case "おかず大": return 760;
        case "大大": return 830;
      }
    } else if (productName === "デラ丼") {
      switch (sizeOption) {
        case "ガールズサイズ": return 550;
        case "並": return 690;
        case "ご飯大": return 770;
        case "おかず大": return 880;
        case "大大": return 940;
      }
    } else if (productName === "天津飯") {
      switch (sizeOption) {
        case "ガールズサイズ": return 390;
        case "並": return 450;
        case "ご飯大": return 500;
        case "おかず大": return 570; // 特大天津飯
        case "大大": return 570; // 特大天津飯
      }
    } else if (productName === "デラックス天津飯") {
      switch (sizeOption) {
        case "ガールズサイズ": return 770; // 明示されていないのでデフォルト価格
        case "並": return 770;
        case "ご飯大": return 820;
        case "おかず大": return 860;
        case "大大": return 970;
      }
    }
    
    // トッピング類やその他の商品は通常価格を返す
    return product?.price || 0;
  };

  /**
   * 商品の合計金額を計算する関数
   * 選択されたサイズと数量に基づいて合計金額を算出します
   * 
   * @returns 合計金額
   */
  const getAdjustedPrice = () => {
    if (!product) return 0;
    // 商品名とサイズから基本価格を取得
    const price = getPriceForSizeAndProduct(product.name, size);
    // 数量を掛けて合計金額を算出
    return price * quantity;
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-[#fff9dc] border-none shadow-lg" aria-describedby="customize-dialog-description">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          {/* 戻るボタンを追加 - スマホでの誤選択時に便利 */}
          <Button 
            variant="ghost" 
            onClick={handleClose}
            className="p-1 h-8 w-8 rounded-full"
            aria-label="閉じる"
          >
            ✕
          </Button>
        </DialogHeader>
        
        <p id="customize-dialog-description" className="sr-only">
          商品のサイズ、数量、カスタマイズオプションを選択してください。
        </p>
        
        <div className="grid gap-4 py-2">
          {/* 画像 */}
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-36 sm:h-48 object-cover rounded-md"
            />
          </div>
          
          {/* 説明 */}
          <p className="text-sm text-gray-500">{product.description}</p>
          
          {/* 数量セレクター */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="quantity" className="font-medium">数量:</Label>
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={incrementQuantity}
              >
                +
              </Button>
            </div>
          </div>
          
          {/* サイズ選択 */}
          <div className="space-y-2">
            <Label className="font-medium">サイズ:</Label>
            <RadioGroup
              value={size}
              onValueChange={(value) => setSize(value as Size)}
              className="grid grid-cols-2 gap-2"
            >
              {SIZES.map((sizeOption: typeof SIZES[number]) => (
                <div key={sizeOption} className="flex items-center space-x-2">
                  <RadioGroupItem value={sizeOption} id={sizeOption} />
                  <Label htmlFor={sizeOption} className="cursor-pointer">
                    {sizeOption}
                    {product && (
                      <span className="text-sm text-gray-500 ml-1">
                        (¥{getPriceForSizeAndProduct(product.name, sizeOption)})
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* カスタマイズオプション */}
          <div className="space-y-2">
            <Label className="font-medium">カスタマイズ:</Label>
            <div className="grid grid-cols-2 gap-2">
              {CUSTOMIZATION_OPTIONS.map((option: { id: string; label: string }) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={customizations.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleCustomizationChange(checked as boolean, option.id)
                    }
                  />
                  <Label htmlFor={option.id} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* ボタンを固定して常に表示されるようにする */}
        <div className="sticky bottom-0 pt-4 bg-[#fff9dc] border-t border-amber-200 mt-2">
          {/* 注文停止中の警告表示 */}
          {!isAcceptingOrders && (
            <Alert className="mb-3 border-red-500 bg-red-50">
              <PauseCircle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-500 font-bold">注文の受付を停止しています</AlertTitle>
            </Alert>
          )}
          
          {/* 合計価格 */}
          <div className="font-bold text-xl flex items-center justify-start mb-3 bg-white p-3 rounded-md border border-amber-200 shadow-sm">
            合計: <span className="text-[#e80113] ml-2">¥{getAdjustedPrice().toLocaleString()}</span>
          </div>
          
          {/* ボタン列 */}
          <div className="flex flex-row space-x-2 w-full">
            <Button 
              type="button" 
              onClick={handleAddToCart}
              className={`flex-1 py-2 flex items-center justify-center ${!isAcceptingOrders 
                ? 'bg-gray-300 hover:bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-[#e80113] hover:bg-red-700 text-white'}`}
              disabled={!isAcceptingOrders}
            >
              {!isAcceptingOrders 
                ? <><PauseCircle className="h-4 w-4 mr-2" />注文停止中</>
                : <><ShoppingCart className="h-4 w-4 mr-2" />カートに追加</>
              }
            </Button>
            <Button 
              type="button" 
              onClick={handleBuyNow}
              className={`flex-1 py-2 flex items-center justify-center ${!isAcceptingOrders 
                ? 'bg-gray-200 hover:bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300' 
                : 'bg-[#fff9dc] hover:bg-[#fffcea] text-black font-bold border border-[#e80113]/30'}`}
              disabled={!isAcceptingOrders}
            >
              {!isAcceptingOrders 
                ? <><PauseCircle className="h-4 w-4 mr-2" />注文停止中</>
                : <><ShoppingBag className="h-4 w-4 mr-2 text-[#e80113]" />今すぐ購入</>
              }
            </Button>
          </div>
          
          {/* キャンセルボタン */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="w-full mt-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4 mr-2" />キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}