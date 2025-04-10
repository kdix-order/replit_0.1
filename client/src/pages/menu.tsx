import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCart, Product } from "@/hooks/use-cart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PauseCircle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCustomizeDialog } from "@/components/product-customize-dialog";
import { Size } from "@/lib/constants";
import { getCustomizationLabel } from "@/lib/utils";
import { BowlSteamSpinner, BouncingFoodSpinner } from "@/components/ui/food-spinner";
import { RiceBowlWithIngredients } from "@/components/ui/rice-bowl-animation";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Menu() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 店舗設定を取得
  const { isAcceptingOrders } = useStoreSettings();
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const openProductDialog = (product: Product) => {
    // 注文停止中は商品ダイアログを開かない
    if (!isAcceptingOrders) {
      toast({
        title: "注文停止中",
        description: "申し訳ありませんが、現在注文の受付を一時的に停止しています。準備が整い次第、再開いたします。",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddToCart = (
    product: Product, 
    quantity: number, 
    size: Size, 
    customizations: string[]
  ) => {
    addToCart(product, quantity, size, customizations);
    
    // カスタマイズ情報を表示文字列にする
    const customizationLabels = customizations.length > 0 
      ? `（${customizations.map(c => getCustomizationLabel(c)).join('、')}）` 
      : '';
    
    toast({
      title: "カートに追加しました",
      description: `${product.name} ${size} ${customizationLabels} を${quantity}個カートに追加しました`,
    });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>メニューを読み込めませんでした。後でもう一度お試しください。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 bg-gradient-to-r from-[#f8d0c7] via-[#fff1e6] to-[#f8d0c7] py-8 rounded-lg shadow-lg border-2 border-[#e80113] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#e80113]"></div>
        <h1 className="text-4xl font-bold text-[#e80113] mb-3 font-japanese">味店焼マン</h1>
        <div className="flex justify-center">
          <div className="w-24 h-1 bg-[#e80113] mb-4 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-[#333] mb-4">メニュー</h2>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-[#e80113]"></div>
      </div>
      
      {/* 注文停止中の通知 */}
      {!isAcceptingOrders && (
        <Alert className="mb-6 border-[#e80113] bg-red-50">
          <PauseCircle className="h-5 w-5 text-[#e80113]" />
          <AlertTitle className="text-[#e80113] font-bold text-lg">現在、注文を停止しています</AlertTitle>
          <AlertDescription className="text-gray-800">
            申し訳ありませんが、現在注文の受付を一時的に停止しています。準備が整い次第、再開いたします。
            しばらく経ってからもう一度お試しください。
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 bg-[#e80113] rounded-full flex items-center justify-center text-white font-bold mb-4">
            読込中
          </div>
          <p className="text-sm mt-2 text-gray-600 font-medium">メニューを読み込み中...</p>
        </div>
      ) : (
        <div>
          {/* 主な料理 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#333] mb-6 border-b-2 border-[#e80113] pb-2">丼</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.filter(product => 
                !product.name.includes('からあげ2個') && 
                !product.name.includes('うま煮 2個') && 
                !product.name.includes('キムチ')
              ).map((product) => (
                <Card key={product.id} className="overflow-hidden border-2 border-[#e80113] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-[#fee10b] text-black text-sm font-bold py-1 px-3 rounded-full shadow">
                      ¥{product.price}
                    </div>
                  </div>
                  <CardContent className="p-5 bg-gradient-to-b from-white to-[#fff8e6]">
                    <h3 className="text-xl font-bold text-[#e80113]">{product.name}</h3>
                    <p className="mt-2 text-sm text-gray-700">{product.description}</p>
                    {product.name === 'から丼' && (
                      <div className="mt-2 text-xs text-gray-600">
                        ご飯大 480円　おかず大 540円　大大 600円　ガールズ 380円
                      </div>
                    )}
                    {(product.name === 'キムカラ丼' || product.name === '鳥塩レモン丼' || 
                      product.name === 'あまから丼' || product.name === '牛カルビ丼' || 
                      product.name === 'うま煮丼' || product.name === 'から玉子丼') && (
                      <div className="mt-2 text-xs text-gray-600">
                        ご飯大 590円　おかず大 700円　大大 760円　ガールズ 490円
                      </div>
                    )}
                    {product.name === '月見カルビ丼' && (
                      <div className="mt-2 text-xs text-gray-600">
                        ご飯大 660円　おかず大 760円　大大 830円　ガールズ 550円
                      </div>
                    )}
                    {product.name === 'デラ丼' && (
                      <div className="mt-2 text-xs text-gray-600">
                        ご飯大 770円　おかず大 880円　大大 940円　ガールズ 550円
                      </div>
                    )}
                    {product.name === '天津飯' && (
                      <div className="mt-2 text-xs text-gray-600">
                        天津飯大 500円　特大天津飯 570円　ガールズ 390円
                      </div>
                    )}
                    {product.name === 'デラックス天津飯' && (
                      <div className="mt-2 text-xs text-gray-600">
                        ご飯大 820円　おかず大 860円　大大 970円
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => openProductDialog(product)}
                        className="inline-flex items-center bg-[#e80113] hover:bg-[#d10010] text-white font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        カスタマイズ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* トッピング */}
          <div>
            <h2 className="text-2xl font-bold text-[#333] mb-6 border-b-2 border-[#e80113] pb-2">トッピング</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.filter(product => 
                product.name.includes('からあげ2個') || 
                product.name.includes('うま煮 2個') || 
                product.name.includes('キムチ')
              ).map((product) => (
                <Card key={product.id} className="overflow-hidden border-2 border-[#e80113] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-[#fee10b] text-black text-sm font-bold py-1 px-3 rounded-full shadow">
                      ¥{product.price}
                    </div>
                  </div>
                  <CardContent className="p-5 bg-gradient-to-b from-white to-[#fff8e6]">
                    <h3 className="text-xl font-bold text-[#e80113]">{product.name}</h3>
                    <p className="mt-2 text-sm text-gray-700">{product.description}</p>
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => openProductDialog(product)}
                        className="inline-flex items-center bg-[#e80113] hover:bg-[#d10010] text-white font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        カスタマイズ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 商品カスタマイズダイアログ */}
      <ProductCustomizeDialog
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
