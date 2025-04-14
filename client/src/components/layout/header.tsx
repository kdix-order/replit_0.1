import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  User as UserIcon, 
  Menu as MenuIcon, 
  X,
  LogOut,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, login, adminDemoLogin, customerDemoLogin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleAdminView = () => {
    if (location === "/admin") {
      window.location.href = "/";
    } else {
      window.location.href = "/admin";
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#e80113] to-[#d10010] shadow-lg border-b-2 border-[#fee10b] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ロゴとブランド名 */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="md:block">
                    <svg className="h-9 w-9 text-[#fee10b]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl md:text-2xl font-bold text-white text-shadow hover:text-[#fee10b] transition-colors">
                    味店焼マン
                  </span>
                </div>
              </Link>
            </div>
            
            {/* デスクトップ用ナビゲーション - モバイルでは非表示 */}
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              <Link href="/">
                <div className={`px-3 py-2 rounded-md text-sm font-bold cursor-pointer ${location === "/" ? "bg-[#fee10b] text-black" : "text-white hover:bg-[#fee10b] hover:text-black"}`}>
                  メニュー
                </div>
              </Link>
              {isAuthenticated && (
                <Link href="/orders">
                  <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${location === "/orders" ? "bg-[#fee10b] text-black" : "text-white hover:bg-[#fee10b] hover:text-black"}`}>
                    注文履歴
                  </div>
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin">
                  <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${location === "/admin" ? "bg-[#fee10b] text-black" : "text-white hover:bg-[#fee10b] hover:text-black"}`}>
                    管理画面
                  </div>
                </Link>
              )}
            </nav>
          </div>
          
          {/* カートとユーザーメニュー */}
          <div className="flex items-center">
            {/* デスクトップ用カートアイコン - モバイルでは非表示 */}
            <div className="hidden md:block">
              <Link href="/cart">
                <div className="p-2 rounded-full text-white hover:text-[#fee10b] relative cursor-pointer">
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#fee10b] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
            
            {/* ユーザーアカウントメニュー */}
            <div className="hidden md:ml-4 md:flex md:items-center">
              {!isAuthenticated ? (
                <div className="flex space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="bg-[#fee10b] text-black hover:bg-[#ffd000] font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                        size="sm"
                      >
                        ログイン
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-gray-200">
                      <DropdownMenuItem 
                        onClick={() => window.location.href = "/api/auth/google"} 
                        className="cursor-pointer hover:bg-[#fee10b] hover:text-black flex items-center"
                      >
                        <img
                          src="https://developers.google.com/identity/images/g-logo.png"
                          alt="Google"
                          className="w-4 h-4 mr-2"
                        />
                        Googleでログイン
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={adminDemoLogin} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        管理者としてログイン
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={customerDemoLogin} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                        <Users className="mr-2 h-4 w-4" />
                        お客様としてログイン
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="bg-black text-white hover:bg-gray-800 font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                        size="sm"
                      >
                        デモログイン
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-gray-200">
                      <DropdownMenuItem onClick={adminDemoLogin} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        管理者としてログイン
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={customerDemoLogin} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                        <Users className="mr-2 h-4 w-4" />
                        お客様としてログイン
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <div className="h-8 w-8 rounded-full bg-[#fee10b] text-black flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {user?.username.charAt(0) || "U"}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-gray-200">
                    {isAdmin && (
                      <DropdownMenuItem onClick={toggleAdminView} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                        <Settings className="mr-2 h-4 w-4" />
                        {location === "/admin" ? "通常表示に戻る" : "管理画面表示"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                      <LogOut className="mr-2 h-4 w-4" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* モバイル用のログインボタン - 非ログイン時のみ表示 */}
            {!isAuthenticated && (
              <div className="md:hidden flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="bg-[#fee10b] text-black hover:bg-[#ffd000] font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-md"
                      size="sm"
                    >
                      <UserIcon className="h-4 w-4 mr-1" />
                      ログイン
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-gray-200">
                    <DropdownMenuItem 
                      onClick={() => window.location.href = "/api/auth/google"} 
                      className="cursor-pointer hover:bg-[#fee10b] hover:text-black flex items-center"
                    >
                      <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="w-4 h-4 mr-2"
                      />
                      Googleでログイン
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={adminDemoLogin} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      管理者としてログイン
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={customerDemoLogin} className="cursor-pointer hover:bg-[#fee10b] hover:text-black">
                      <Users className="mr-2 h-4 w-4" />
                      お客様としてログイン
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* モバイル用メニューボタン */}
            <div className="flex items-center md:hidden ml-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#fee10b] focus:outline-none"
              >
                <span className="sr-only">メニューを開く</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー - ドロップダウン */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-[#d10010] to-[#e80113] border-t-2 border-[#fee10b] shadow-lg absolute w-full z-50">
          <div className="px-2 pt-3 pb-4 space-y-2 sm:px-3">
            {isAuthenticated ? (
              <div className="px-4 py-3 rounded-lg bg-[#fee10b]/10 mb-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-[#fee10b] text-black flex items-center justify-center mr-3">
                    <span className="text-sm font-bold">
                      {user?.username.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.username || "ユーザー"}</p>
                  </div>
                </div>
              </div>
            ) : null}
            
            <button
              className="w-full px-4 py-3 rounded-lg text-base font-bold text-white bg-black/20 hover:bg-black/30 flex items-center justify-center"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              ログアウト
            </button>
            
            {isAdmin && (
              <button
                className="w-full px-4 py-3 rounded-lg text-base font-bold text-white bg-black/20 hover:bg-black/30 flex items-center justify-center"
                onClick={() => {
                  toggleAdminView();
                  setMobileMenuOpen(false);
                }}
              >
                <Settings className="mr-2 h-5 w-5" />
                {location === "/admin" ? "通常表示に戻る" : "管理画面表示"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
