import { Link, useLocation } from "wouter";
import { Home, ShoppingCart, User, History, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

export function BottomNav() {
  const [location] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-4 h-16">
        {/* ホーム */}
        <Link href="/">
          <div className="flex flex-col items-center justify-center h-full cursor-pointer">
            <div className={`p-1 rounded-full ${location === "/" ? "bg-[#fee10b]" : "bg-transparent"}`}>
              <Home className={`h-5 w-5 ${location === "/" ? "text-black" : "text-gray-600"}`} />
            </div>
            <span className={`text-xs mt-1 ${location === "/" ? "text-[#e80113] font-bold" : "text-gray-600"}`}>
              メニュー
            </span>
          </div>
        </Link>
        
        {/* カート */}
        <Link href="/cart">
          <div className="flex flex-col items-center justify-center h-full relative cursor-pointer">
            <div className={`p-1 rounded-full ${location === "/cart" ? "bg-[#fee10b]" : "bg-transparent"}`}>
              <ShoppingCart className={`h-5 w-5 ${location === "/cart" ? "text-black" : "text-gray-600"}`} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-1/4 bg-[#e80113] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className={`text-xs mt-1 ${location === "/cart" ? "text-[#e80113] font-bold" : "text-gray-600"}`}>
              カート
            </span>
          </div>
        </Link>
        
        {/* 注文履歴 - ログイン済みの場合のみ表示 */}
        <Link href={isAuthenticated ? "/orders" : "/"}>
          <div className={`flex flex-col items-center justify-center h-full cursor-pointer ${!isAuthenticated ? "opacity-50" : ""}`}>
            <div className={`p-1 rounded-full ${location === "/orders" ? "bg-[#fee10b]" : "bg-transparent"}`}>
              <History className={`h-5 w-5 ${location === "/orders" ? "text-black" : "text-gray-600"}`} />
            </div>
            <span className={`text-xs mt-1 ${location === "/orders" ? "text-[#e80113] font-bold" : "text-gray-600"}`}>
              注文履歴
            </span>
          </div>
        </Link>
        
        {/* アカウント/管理 */}
        {isAdmin ? (
          <Link href="/admin">
            <div className="flex flex-col items-center justify-center h-full cursor-pointer">
              <div className={`p-1 rounded-full ${location === "/admin" ? "bg-[#fee10b]" : "bg-transparent"}`}>
                <Settings className={`h-5 w-5 ${location === "/admin" ? "text-black" : "text-gray-600"}`} />
              </div>
              <span className={`text-xs mt-1 ${location === "/admin" ? "text-[#e80113] font-bold" : "text-gray-600"}`}>
                管理
              </span>
            </div>
          </Link>
        ) : (
          <Link href={isAuthenticated ? "/account" : "/"}>
            <div className="flex flex-col items-center justify-center h-full cursor-pointer">
              <div className={`p-1 rounded-full ${location === "/account" ? "bg-[#fee10b]" : "bg-transparent"}`}>
                <User className={`h-5 w-5 ${location === "/account" ? "text-black" : "text-gray-600"}`} />
              </div>
              <span className={`text-xs mt-1 ${location === "/account" ? "text-[#e80113] font-bold" : "text-gray-600"}`}>
                {isAuthenticated ? "アカウント" : "ログイン"}
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}