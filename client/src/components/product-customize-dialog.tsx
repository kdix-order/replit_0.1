import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { useLocation } from "wouter";
import { Product } from "../hooks/use-cart";
import { SIZES, CUSTOMIZATION_OPTIONS, Size } from "../lib/constants";

type ProductCustomizeDialogProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: Size, customizations: string[]) => void;
};

export function ProductCustomizeDialog({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductCustomizeDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<Size>("並");
  const [customizations, setCustomizations] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  // ダイアログを閉じる時にリセット
  const handleClose = () => {
    setQuantity(1);
    setSize("並");
    setCustomizations([]);
    onClose();
  };

  // カスタマイズオプションの選択を管理
  const handleCustomizationChange = (checked: boolean, id: string) => {
    if (checked) {
      setCustomizations((prev) => [...prev, id]);
    } else {
      setCustomizations((prev) => prev.filter((item) => item !== id));
    }
  };

  // 個数の増減
  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // カートに追加
  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity, size, customizations);
      handleClose();
    }
  };
  
  // 今すぐ購入
  const handleBuyNow = () => {
    if (product) {
      onAddToCart(product, quantity, size, customizations);
      handleClose();
      // カートページに遷移
      setLocation("/cart");
    }
  };

  // 商品とサイズによる実際の価格を取得
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

  // 合計金額を計算
  const getAdjustedPrice = () => {
    if (!product) return 0;
    const price = getPriceForSizeAndProduct(product.name, size);
    return price * quantity;
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* 画像 */}
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-48 object-cover rounded-md"
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
          <div className="space-y-3">
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
          <div className="space-y-3">
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
        
        <DialogFooter className="flex-col space-y-3 sm:space-y-0 sm:space-x-3 sm:flex-row sm:justify-between items-stretch">
          <div className="font-bold text-lg flex items-center justify-center sm:justify-start">
            合計: ¥{getAdjustedPrice().toLocaleString()}
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              type="button" 
              onClick={handleAddToCart}
              className="bg-[#e80113] hover:bg-red-700 text-white"
            >
              カートに追加
            </Button>
            <Button 
              type="button" 
              onClick={handleBuyNow}
              className="bg-[#fee10b] hover:bg-yellow-400 text-black font-bold"
            >
              今すぐ購入
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}