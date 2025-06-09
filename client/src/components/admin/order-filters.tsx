/**
 * 注文フィルターコンポーネント
 * 検索、ステータスフィルター、並び順の変更機能を提供します
 */
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertCircle, Clock, Bell } from "lucide-react";
import { BowlSteamSpinner } from "@/components/ui/food-spinner";

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showOnlyUrgent: boolean;
  onUrgentToggle: () => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
  sortNewest: boolean;
  onSortToggle: () => void;
  orderCounts: {
    pending: number;
    paid: number;
    ready: number;
    completed: number;
    cancelled: number;
    refunded: number;
    total: number;
    urgent: number;
  };
}

export function OrderFilters({
  searchQuery,
  onSearchChange,
  showOnlyUrgent,
  onUrgentToggle,
  filterStatus,
  onStatusChange,
  sortNewest,
  onSortToggle,
  orderCounts
}: OrderFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="search" aria-label="注文フィルター">
      {/* 検索ボックス */}
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          placeholder="番号・商品名で検索"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 py-3 rounded-md border-2 border-gray-300 text-gray-800 text-sm sm:text-base w-full sm:w-64 min-h-[48px] focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
          aria-label="呼出番号または商品名で注文を検索"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
            aria-label="検索をクリア"
            type="button"
          >
            <span className="text-2xl" aria-hidden="true">×</span>
          </button>
        )}
      </div>
      
      {/* 緊急フィルター */}
      <Button
        size="lg"
        variant={showOnlyUrgent ? "default" : "outline"}
        onClick={onUrgentToggle}
        className={`px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[48px] border-2 focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2 ${
          showOnlyUrgent 
            ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
            : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
        }`}
        aria-label={showOnlyUrgent ? '急ぎの注文のフィルターを解除' : '急ぎの注文のみ表示'}
        aria-pressed={showOnlyUrgent}
      >
        <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 mr-2" aria-hidden="true" />
        急ぎ
      </Button>
      
      {/* ステータスフィルター */}
      <Select
        value={filterStatus}
        onValueChange={onStatusChange}
      >
        <SelectTrigger 
          className="w-full sm:w-48 bg-white text-gray-800 border-2 border-gray-300 h-12 text-sm sm:text-base focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
          aria-label="ステータスでフィルター"
        >
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-1" aria-hidden="true" />
            <SelectValue placeholder="すべて表示" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべての注文</SelectItem>
          <SelectItem value="pending">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              支払い待ち ({orderCounts.pending})
            </div>
          </SelectItem>
          <SelectItem value="paid">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              支払い済み ({orderCounts.paid})
            </div>
          </SelectItem>
          <SelectItem value="ready">
            <div className="flex items-center">
              <BowlSteamSpinner size="xs" className="mr-1" />
              受取可能 ({orderCounts.ready})
            </div>
          </SelectItem>
          <SelectItem value="completed">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              完了 ({orderCounts.completed})
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      {/* 並び順 */}
      <Button
        size="lg"
        variant="outline"
        onClick={onSortToggle}
        className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[48px] focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
        aria-label={sortNewest ? '古い順に並び替え' : '新しい順に並び替え'}
      >
        {sortNewest ? "新しい順" : "古い順"}
        <svg className={`ml-1 h-4 w-4 ${sortNewest ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      </Button>
    </div>
  );
}