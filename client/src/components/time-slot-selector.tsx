import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type TimeSlot = {
  id: number;
  time: string;
  available: number;
  capacity: number;
  isFull: boolean;
};

type TimeSlotSelectorProps = {
  onSelect: (id: number) => void;
  selectedId: number | null;
};

export function TimeSlotSelector({ onSelect, selectedId }: TimeSlotSelectorProps) {
  const { data: timeSlots, isLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/timeslots"],
  });

  if (isLoading) {
    return (
      <>
        <div className="bg-[#fee10b]/20 border border-[#fee10b] rounded-md p-3 mb-3 flex items-center">
          <div className="text-black mr-2">⚠️</div>
          <p className="text-sm">受け取り時間を選択すると、注文確定ボタンが有効になります</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </>
    );
  }

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-gray-50">
        <p className="text-gray-500">現在、利用可能な時間枠がありません</p>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-[#fee10b]/20 border ${selectedId ? 'border-green-500 bg-green-50' : 'border-[#fee10b]'} rounded-md p-3 mb-3 flex items-center`}>
        {selectedId ? (
          <>
            <div className="text-green-600 mr-2">✓</div>
            <div>
              <p className="text-sm font-medium text-green-800">受け取り時間が選択されました！</p>
              <p className="text-xs text-green-700">下部の「注文を確定する」ボタンで決済に進めます</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-[#e80113] mr-2">⚠️</div>
            <div>
              <p className="text-sm font-medium text-[#e80113]">受け取り時間を選択してください</p>
              <p className="text-xs text-gray-700">受け取り時間を選択すると注文確定ボタンが有効になります</p>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 overflow-y-auto max-h-[300px]">
        {timeSlots.map((slot) => (
          <Button
            key={slot.id}
            variant={selectedId === slot.id ? "default" : "outline"}
            className={`p-1 sm:p-2 rounded-md text-sm flex flex-col items-center h-16 sm:h-20 ${
              slot.available > 0
                ? selectedId === slot.id
                  ? "bg-[#e80113] text-white border-[#e80113] hover:bg-red-700"
                  : "text-gray-900 hover:bg-gray-100 border-gray-200" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            }`}
            onClick={() => slot.available > 0 && onSelect(slot.id)}
            disabled={slot.available <= 0}
          >
            <span className="text-sm sm:text-base font-medium mb-0.5 sm:mb-1">{slot.time}</span>
            <span className={`block text-xs rounded-full px-1.5 sm:px-2 py-0.5 ${
              slot.available > 0 
                ? selectedId === slot.id
                  ? "bg-white text-[#e80113]" 
                  : "bg-[#fee10b] text-black"
                : "bg-gray-200 text-gray-500"
            }`}>
              {slot.available > 0 ? `残${slot.available}枠` : "満枠"}
            </span>
          </Button>
        ))}
      </div>
    </>
  );
}
