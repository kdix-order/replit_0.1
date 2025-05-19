/**
 * 時間枠選択コンポーネント
 * ユーザーが注文の受け取り時間を選択するためのUIを提供します
 * 利用可能な時間枠のリストを表示し、枠の残り数も表示します
 */
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 時間枠データの型定義
 * APIから取得する時間枠情報の形式を定義します
 * 
 * @property id - 時間枠のID
 * @property time - 時間帯を表す文字列（例："12:00-12:10"）
 * @property available - 残りの予約可能数
 * @property capacity - 最大予約可能数
 * @property isFull - 予約が満枠かどうかのフラグ
 */
type TimeSlot = {
  id: string;
  time: string;
  available: number;
  capacity: number;
  isFull: boolean;
};

/**
 * 時間枠選択コンポーネントのProps
 * 
 * @property onSelect - 時間枠が選択されたときに呼び出されるコールバック関数
 * @property selectedId - 現在選択されている時間枠のID（未選択の場合はnull）
 */
type TimeSlotSelectorProps = {
  onSelect: (id: string) => void;
  selectedId: string | null;
};

/**
 * 時間枠選択コンポーネント本体
 * 利用可能な時間枠のグリッドを表示し、選択状態を管理します
 * 
 * @param onSelect - 時間枠が選択されたときに呼び出されるコールバック関数
 * @param selectedId - 現在選択されている時間枠のID（選択なしの場合はnull）
 */
export function TimeSlotSelector({ onSelect, selectedId }: TimeSlotSelectorProps) {
  /**
   * 時間枠データの取得
   * React Queryを使用してAPIから時間枠情報を取得します
   */
  const { data: timeSlots, isLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots"],
  });

  /**
   * ローディング中の表示
   * データ取得中はスケルトンUIを表示します
   */
  if (isLoading) {
    return (
      <>
        {/* ローディング中の注意メッセージ */}
        <div className="bg-[#fee10b]/20 border border-[#fee10b] rounded-md p-3 mb-3 flex items-center">
          <div className="text-black mr-2">⚠️</div>
          <p className="text-sm">受け取り時間を選択すると、注文確定ボタンが有効になります</p>
        </div>
        {/* スケルトンローダー - 時間枠の読み込み中表現 */}
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </>
    );
  }

  /**
   * 時間枠がない場合の表示
   * 利用可能な時間枠が存在しない場合のメッセージを表示します
   */
  if (!timeSlots || timeSlots.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-gray-50">
        <p className="text-gray-500">現在、利用可能な時間枠がありません</p>
      </div>
    );
  }

  /**
   * 時間枠セレクターの主要UI表示
   * 選択状態に応じたヘルプメッセージと時間枠グリッドを表示します
   */
  return (
    <>
      {/* 選択状態に応じたヘルプメッセージ（選択済み:緑、未選択:黄色警告） */}
      <div className={`bg-[#fee10b]/20 border ${selectedId ? 'border-green-500 bg-green-50' : 'border-[#fee10b]'} rounded-md p-3 mb-3 flex items-center`}>
        {selectedId ? (
          // 時間枠選択済みの場合のメッセージ
          <>
            <div className="text-green-600 mr-2">✓</div>
            <div>
              <p className="text-sm font-medium text-green-800">受け取り時間が選択されました！</p>
              <p className="text-xs text-green-700">下部の「注文を確定する」ボタンで決済に進めます</p>
            </div>
          </>
        ) : (
          // 時間枠未選択の場合の警告メッセージ
          <>
            <div className="text-[#e80113] mr-2">⚠️</div>
            <div>
              <p className="text-sm font-medium text-[#e80113]">受け取り時間を選択してください</p>
              <p className="text-xs text-gray-700">受け取り時間を選択すると注文確定ボタンが有効になります</p>
            </div>
          </>
        )}
      </div>

      {/* 時間枠ボタングリッド - 3カラムレイアウト */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 overflow-y-auto max-h-[300px]">
        {/* 時間枠ボタンのマッピング */}
        {timeSlots.map((slot) => (
          <Button
            key={slot.id}
            variant={selectedId === slot.id ? "default" : "outline"}
            // ボタンスタイルの条件分岐:
            // 1. 利用可能かどうか
            // 2. 選択されているかどうか
            className={`p-1 sm:p-2 rounded-md text-sm flex flex-col items-center h-16 sm:h-20 ${
              slot.available > 0
                ? selectedId === slot.id
                  ? "bg-[#e80113] text-white border-[#e80113] hover:bg-red-700" // 選択中: 赤色の背景
                  : "text-gray-900 hover:bg-gray-100 border-gray-200"           // 未選択: 白背景
                : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" // 満枠: 灰色背景
            }`}
            // 枠が利用可能な場合のみクリックイベントを発火
            onClick={() => slot.available > 0 && onSelect(slot.id)}
            // 枠が満杯の場合は無効化
            disabled={slot.available <= 0}
          >
            {/* 時間帯表示 */}
            <span className="text-sm sm:text-base font-medium mb-0.5 sm:mb-1">{slot.time}</span>
            {/* 残り枠数表示バッジ - 状態に応じて色変更 */}
            <span className={`block text-xs rounded-full px-1.5 sm:px-2 py-0.5 ${
              slot.available > 0 
                ? selectedId === slot.id
                  ? "bg-white text-[#e80113]"  // 選択中: 白背景に赤文字
                  : "bg-[#fee10b] text-black"  // 利用可能: 黄色背景に黒文字
                : "bg-gray-200 text-gray-500"  // 満枠: 灰色
            }`}>
              {/* 残り枠数またはメッセージ */}
              {slot.available > 0 ? `残${slot.available}枠` : "満枠"}
            </span>
          </Button>
        ))}
      </div>
    </>
  );
}
