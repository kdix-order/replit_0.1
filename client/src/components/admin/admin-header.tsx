/**
 * 管理画面ヘッダーコンポーネント
 * 管理画面のタイトル、現在時刻、更新ボタンを表示します
 */
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";

interface AdminHeaderProps {
  currentTime: Date;
  lastRefreshTime: Date;
  showRefreshAnimation: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

export function AdminHeader({
  currentTime,
  lastRefreshTime,
  showRefreshAnimation,
  isFetching,
  onRefresh
}: AdminHeaderProps) {
  return (
    <header className="text-center mb-4 bg-[#fee10b] py-4 rounded-lg shadow-md" role="banner">
      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">味店焼マン - 管理画面</h1>
      <div className="flex justify-center">
        <hr className="w-20 border-[#e80113] border-t-2 mb-3" />
      </div>
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <span className="text-sm sm:text-base bg-[#e80113] text-white px-3 py-2 rounded-md flex items-center" role="timer" aria-live="polite" aria-label={`現在の時刻 ${currentTime.toLocaleTimeString()}`}>
            <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
            現在の時刻: {currentTime.toLocaleTimeString()}
          </span>
          
          <Button
            size="lg"
            onClick={onRefresh}
            className="bg-white text-[#e80113] border-2 border-[#e80113] hover:bg-[#e80113] hover:text-white px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[48px] focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
            disabled={isFetching}
            aria-label={isFetching ? 'データを更新中' : '最新の情報に更新'}
          >
            <RefreshCw className={`mr-2 h-4 sm:h-5 w-4 sm:w-5 ${isFetching || showRefreshAnimation ? 'animate-spin' : ''}`} aria-hidden="true" />
            {isFetching ? '更新中...' : '最新の情報に更新'}
          </Button>
        </div>
        <div className="text-xs sm:text-sm text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm" role="status" aria-live="polite">
          <span className={`transition-opacity duration-300 ${showRefreshAnimation ? 'opacity-100 font-bold text-[#e80113]' : 'opacity-80'}`}>
            最終更新: {lastRefreshTime.toLocaleTimeString()} 
            {showRefreshAnimation && <span className="ml-2 font-bold text-green-600" role="status" aria-live="assertive">✓ 更新完了!</span>}
          </span>
          <span className="ml-2 text-gray-500">(1分ごとに自動更新)</span>
        </div>
      </div>
    </header>
  );
}