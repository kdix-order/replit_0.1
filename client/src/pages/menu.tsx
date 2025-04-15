import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCart, Product } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth"; // 認証フックを追加
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PauseCircle, Bookmark, ShoppingBag } from "lucide-react";
import { ProductCustomizeDialog } from "@/components/product-customize-dialog";
import { Size } from "@/lib/constants";
import { getCustomizationLabel } from "@/lib/utils";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * メニューカテゴリの定義 (目次機能削除のため、参照のみに使用)
 * コードリーディングをしやすくするために残しておきます
 */

/**
 * 注文ボタンコンポーネント
 * 注文の停止状態に応じて表示を切り替えるボタン
 * 
 * @param props - ボタンのプロパティ
 * @param props.isAcceptingOrders - 注文受付状態
 * @param props.onClick - クリック時のコールバック関数
 * @param props.variant - ボタンのバリアント（"order" または "customize"）
 */
function OrderButton({ isAcceptingOrders, onClick, variant = "order" }: { 
  isAcceptingOrders: boolean; 
  onClick: () => void; 
  variant?: "order" | "customize" 
}) {
  // 注文ボタン（並を注文）の表示設定
  if (variant === "order") {
    return (
      <Button 
        onClick={onClick}
        className={`inline-flex items-center ${!isAcceptingOrders 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
          : 'bg-[#fff9dc] hover:bg-[#fffcea] text-black hover:shadow-lg'} font-bold shadow-md transition-all border ${!isAcceptingOrders ? 'border-gray-300' : 'border-[#e80113]/30'}`}
        disabled={!isAcceptingOrders}
      >
        {!isAcceptingOrders 
          ? <PauseCircle className="h-4 w-4 mr-2 text-gray-500" />
          : <ShoppingBag className="h-4 w-4 mr-2 text-[#e80113]" />
        }
        {!isAcceptingOrders ? '停止中' : '並を注文'}
      </Button>
    );
  }
  
  // カスタマイズボタンの表示設定
  return (
    <Button 
      onClick={onClick}
      className={`inline-flex items-center ${!isAcceptingOrders 
        ? 'bg-gray-300 hover:bg-gray-300 text-gray-600 cursor-not-allowed' 
        : 'bg-[#e80113] hover:bg-[#d10010] text-white hover:shadow-lg'} font-bold shadow-md transition-all`}
      disabled={!isAcceptingOrders}
    >
      {!isAcceptingOrders 
        ? <PauseCircle className="h-4 w-4 mr-2" />
        : <Plus className="h-4 w-4 mr-2" />
      }
      {!isAcceptingOrders ? '注文停止中' : 'カスタマイズ'}
    </Button>
  );
}

/**
 * メニューページコンポーネント
 * 商品一覧を表示し、カートへの追加機能を提供します
 */
export default function Menu() {
  // 必要なフック・ユーティリティの初期化
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth(); // ユーザーの認証状態
  const { isAcceptingOrders, refetch: refetchStoreSettings } = useStoreSettings(); // 店舗の注文受付状態

  // ページロード時と定期的に店舗設定を更新
  useEffect(() => {
    // ページ表示時に店舗設定を更新
    refetchStoreSettings();
    
    // 一定間隔で店舗設定を自動更新（60秒ごと）
    const interval = setInterval(() => {
      refetchStoreSettings();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refetchStoreSettings]);

  // 商品カスタマイズダイアログの状態管理
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 各カテゴリセクションへの参照（目次機能削除後も、セクション識別用に残しています）
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /**
   * 即購入用ハンドラー
   * 「並」サイズの商品をカスタマイズなしで素早くカートに追加する機能
   * 
   * @param product - カートに追加する商品
   */
  const handleQuickBuy = (product: Product) => {
    // 未ログインの場合はログインを促す
    if (!isAuthenticated) {
      toast({
        title: "ログインしてください",
        description: "商品を注文するには、ログインまたは会員登録が必要です。画面右上のログインボタンからお進みください。",
        variant: "destructive",
      });
      return;
    }

    // 注文停止中の場合は処理を中断
    if (!isAcceptingOrders) {
      toast({
        title: "注文停止中",
        description: "申し訳ありませんが、現在注文の受付を一時的に停止しています。",
        variant: "destructive",
      });
      return;
    }

    // すべての商品を「並」サイズでカートに追加
    addToCart(product, 1, "並", []);
    toast({
      title: "カートに追加しました",
      description: `${product.name} 並 を1個カートに追加しました`,
    });
  };

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  /**
   * 商品カスタマイズダイアログを開く関数
   * サイズやカスタマイズオプションを選択するダイアログを表示します
   * 
   * @param product - カスタマイズする商品
   */
  const openProductDialog = (product: Product) => {
    // 未ログインの場合はログインを促す
    if (!isAuthenticated) {
      toast({
        title: "ログインしてください",
        description: "商品をカスタマイズするには、ログインまたは会員登録が必要です。画面右上のログインボタンからお進みください。",
        variant: "destructive",
      });
      return;
    }

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

  /**
   * カートに商品を追加する関数
   * カスタマイズダイアログから選択された情報をカートに追加します
   * 
   * @param product - カートに追加する商品
   * @param quantity - 数量
   * @param size - サイズ (ガールズサイズ・並・ご飯大・おかず大・大大)
   * @param customizations - カスタマイズオプションの配列 (例: 玉子抜き)
   */
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

    // ユーザーに通知
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
      <div className="text-center mb-10 bg-white py-8 rounded-lg shadow-lg border-2 border-[#e80113] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-[#e80113]"></div>
        <h1 className="text-4xl font-bold text-[#e80113] mb-3 font-japanese">味店焼マン</h1>
        <div className="flex justify-center">
          <div className="w-32 h-1 bg-[#e80113] mb-4 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-[#333] mb-4">メニュー</h2>
        <div className="absolute bottom-0 left-0 w-full h-3 bg-[#e80113]"></div>
      </div>

      {/* 注文停止中の通知 - より目立つデザインに改善 */}
      {!isAcceptingOrders && (
        <div className="mb-8 relative">
          <div className="absolute -top-1 -left-1 right-1 bottom-1 bg-[#e80113]/10 rounded-lg"></div>
          <Alert className="border-2 border-[#e80113] bg-red-50 shadow-lg relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
              <div className="bg-[#e80113] text-white rounded-full p-3 flex-shrink-0">
                <PauseCircle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <AlertTitle className="text-[#e80113] font-bold text-xl mb-2 flex items-center justify-center sm:justify-start">
                  現在、注文を停止しています
                </AlertTitle>
                <AlertDescription className="text-gray-800 text-center sm:text-left">
                  <p className="mb-2 font-medium">申し訳ありませんが、現在注文の受付を一時的に停止しています。</p>
                  <p>
                    準備が整い次第、再開いたします。
                    まもなく再開予定ですので、しばらく経ってからもう一度お試しください。
                  </p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
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


          {/* 丼 */}
          <div 
            id="donburi" 
            className="mb-12"
            ref={(el) => (categoryRefs.current["donburi"] = el)}
          >
            <h2 className="text-2xl font-bold text-[#333] mb-6 border-b-2 border-[#e80113] pb-2 flex items-center">
              <ShoppingBag className="mr-2 text-[#e80113]" size={20} />
              丼
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.filter(product => 
                ((product.id <= 7) || (product.id === 8 || product.id === 9)) &&
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
                    <div className="absolute top-2 right-2 bg-[#e80113] text-white text-sm font-bold py-1 px-3 rounded-full shadow-md">
                      ¥{product.price}
                    </div>
                    {(product.id === 8 || product.id === 9) && (
                      <div className="absolute top-2 left-2 bg-[#e80113] text-white text-xs font-bold py-1 px-2 rounded-sm shadow">
                        人気
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 bg-gradient-to-b from-white to-[#fffcf0]">
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
                    <div className="mt-4 flex justify-between">
                      <OrderButton 
                        isAcceptingOrders={isAcceptingOrders}
                        onClick={() => handleQuickBuy(product)}
                        variant="order"
                      />
                      <OrderButton 
                        isAcceptingOrders={isAcceptingOrders}
                        onClick={() => openProductDialog(product)}
                        variant="customize"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 天津飯 */}
          <div 
            id="tenshinhan" 
            className="mb-12"
            ref={(el) => (categoryRefs.current["tenshinhan"] = el)}
          >
            <h2 className="text-2xl font-bold text-[#333] mb-6 border-b-2 border-[#e80113] pb-2 flex items-center">
              <Bookmark className="mr-2 text-[#e80113]" size={20} />
              天津飯
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.filter(product => 
                (product.id === 10 || product.id === 11) &&
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
                    <div className="absolute top-2 right-2 bg-[#e80113] text-white text-sm font-bold py-1 px-3 rounded-full shadow-md">
                      ¥{product.price}
                    </div>
                  </div>
                  <CardContent className="p-5 bg-gradient-to-b from-white to-[#fffcf0]">
                    <h3 className="text-xl font-bold text-[#e80113]">{product.name}</h3>
                    <p className="mt-2 text-sm text-gray-700">{product.description}</p>
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
                    <div className="mt-4 flex justify-between">
                      <OrderButton 
                        isAcceptingOrders={isAcceptingOrders}
                        onClick={() => handleQuickBuy(product)}
                        variant="order"
                      />
                      <OrderButton 
                        isAcceptingOrders={isAcceptingOrders}
                        onClick={() => openProductDialog(product)}
                        variant="customize"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* トッピング */}
          <div 
            id="toppings"
            ref={(el) => (categoryRefs.current["toppings"] = el)}
            className="mb-12 bg-white/80 rounded-lg p-6 border-2 border-[#e80113] shadow-md"
          >
            <h2 className="text-2xl font-bold text-[#333] mb-6 border-b-2 border-[#e80113] pb-2 flex items-center">
              <Plus className="mr-2 text-[#e80113]" size={20} />
              トッピング
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.filter(product => 
                product.name.includes('からあげ2個') || 
                product.name.includes('うま煮 2個') || 
                product.name.includes('キムチ')
              ).map((product) => (
                <div key={product.id} className="flex items-center justify-between bg-gradient-to-r from-white to-[#fffaee] p-4 rounded-lg border-2 border-[#e80113]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#e80113]">
                  <div>
                    <h3 className="font-bold text-[#e80113] text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-700 mt-1">{product.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-lg text-white bg-[#e80113] px-2 py-1 rounded-md shadow-sm">¥{product.price}</div>
                    <OrderButton 
                      isAcceptingOrders={isAcceptingOrders}
                      onClick={() => handleQuickBuy(product)}
                      variant="order"
                    />
                  </div>
                </div>
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