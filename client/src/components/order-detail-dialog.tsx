import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { OrderStatusTracker } from "./order-status-tracker";
import { Separator } from "@/components/ui/separator";
import { getCustomizationLabel } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, ChefHat, AlertCircle, Ticket } from "lucide-react";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  customizations?: string[];
};

type Order = {
  id: number;
  userId: number;
  callNumber: number;
  status: "new" | "preparing" | "completed";
  total: number;
  timeSlot: {
    id: number;
    time: string;
  };
  createdAt: string;
  items: OrderItem[];
};

type OrderDetailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
};

export function OrderDetailDialog({ isOpen, onClose, order }: OrderDetailDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [, setLocation] = useLocation();

  // 注文ステータスが「完了」に変わった時にコンフェティアニメーションを表示
  useEffect(() => {
    if (order?.status === "completed") {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  // 注文ステータスに対応するアイコンとメッセージ
  const getStatusIndicator = (status: "new" | "preparing" | "completed") => {
    switch(status) {
      case "new":
        return {
          icon: <AlertCircle className="w-6 h-6 text-[#fee10b]" />,
          message: "新規注文を受け付けました",
          color: "bg-[#fee10b]/10 text-[#e80113]"
        };
      case "preparing":
        return {
          icon: <ChefHat className="w-6 h-6 text-[#e80113]" />,
          message: "現在調理中です",
          color: "bg-[#e80113]/10 text-[#e80113]"
        };
      case "completed":
        return {
          icon: <ClipboardCheck className="w-6 h-6 text-green-600" />,
          message: "お料理が完成しました",
          color: "bg-green-100 text-green-800"
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-[#fee10b]" />,
          message: "処理中",
          color: "bg-gray-100 text-gray-800"
        };
    }
  };

  if (!order) return null;

  const statusInfo = getStatusIndicator(order.status);
  const orderDate = new Date(order.createdAt);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md md:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-[#e80113] to-[#d10010] text-white p-4">
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>注文詳細</span>
            <span className="text-[#fee10b]">#{order.callNumber}</span>
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            {format(orderDate, "yyyy年MM月dd日 HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          {/* ステータスインジケーター */}
          <div className={`rounded-md p-3 flex items-center gap-2 mb-4 ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.message}</span>
          </div>

          {/* 注文進捗トラッカー */}
          <div className="mb-6">
            <OrderStatusTracker status={order.status} />
          </div>

          <Separator className="my-4" />

          {/* 注文詳細 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">注文内容</h3>
            <ul className="space-y-2">
              <AnimatePresence>
                {order.items.map((item, index) => (
                  <motion.li 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between p-2 rounded-md border border-gray-100 bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">
                        {item.name} {item.size && `(${item.size})`}
                      </div>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {item.customizations.map(getCustomizationLabel).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">x{item.quantity}</span>
                      <span className="font-semibold">{item.price.toLocaleString()}円</span>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">合計</span>
              <span className="font-bold text-lg">{order.total.toLocaleString()}円</span>
            </div>
          </div>

          {/* 受け取りQRコードと閉じるボタン */}
          <div className="mt-6 flex flex-col gap-3">
            <Button 
              className="w-full bg-[#e80113] hover:bg-[#d10010] text-white"
              onClick={() => {
                onClose();
                setLocation(`/pickup/${order.callNumber}`);
              }}
            >
              <Ticket className="h-4 w-4 mr-2" />
              受け取り用QRコードを表示
            </Button>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">受取時間：{order.timeSlot.time}</p>
              <Button variant="outline" onClick={onClose}>閉じる</Button>
            </div>
          </div>
        </div>

        {/* コンフェティアニメーション */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  top: "-5%",
                  left: `${Math.random() * 100}%`,
                  background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                }}
                animate={{
                  y: ["0vh", "100vh"],
                  x: [`0%`, `${(Math.random() - 0.5) * 50}%`],
                  rotate: [0, Math.random() * 360],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}