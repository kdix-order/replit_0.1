import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ChefHat } from "lucide-react";

type OrderStatusTrackerProps = {
  status: "new" | "preparing" | "completed";
};

export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  const [animationComplete, setAnimationComplete] = useState({
    toNew: false,
    toPreparing: false,
    toCompleted: false,
  });

  useEffect(() => {
    // ステータスに基づいてアニメーション状態を設定
    if (status === "new") {
      setAnimationComplete({ toNew: true, toPreparing: false, toCompleted: false });
    } else if (status === "preparing") {
      setAnimationComplete({ toNew: true, toPreparing: true, toCompleted: false });
    } else if (status === "completed") {
      setAnimationComplete({ toNew: true, toPreparing: true, toCompleted: true });
    }
  }, [status]);

  // ステップの状態を取得する関数
  const getStepState = (step: "new" | "preparing" | "completed") => {
    if (step === "new" && (status === "new" || status === "preparing" || status === "completed")) {
      return "active";
    } else if (step === "preparing" && (status === "preparing" || status === "completed")) {
      return "active";
    } else if (step === "completed" && status === "completed") {
      return "active";
    }
    return "inactive";
  };

  // バリアントの定義
  const variants = {
    inactive: { scale: 0.9, opacity: 0.7 },
    active: { scale: 1, opacity: 1 },
  };

  // 進捗バーのバリアント
  const progressVariants = {
    newToPreparing: { width: status === "new" ? "0%" : "50%" },
    preparingToCompleted: { width: status === "completed" ? "100%" : status === "preparing" ? "50%" : "0%" },
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto py-6">
      {/* 進捗バー - 背景 */}
      <div className="absolute top-[43px] left-0 right-0 h-2 bg-gray-200 rounded-full mx-12"></div>
      
      {/* 進捗バー - アクティブ部分 */}
      <motion.div
        className="absolute top-[43px] left-0 h-2 bg-gradient-to-r from-[#e80113] to-[#fee10b] rounded-full mx-12"
        initial={{ width: "0%" }}
        animate={{ width: status === "new" ? "0%" : status === "preparing" ? "50%" : "100%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* ステップアイコン */}
      <div className="flex justify-between items-center relative z-10">
        {/* 新規注文 */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants}
          animate={getStepState("new") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("new") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Clock className="w-6 h-6" />
          </motion.div>
          <span className={`text-sm font-medium ${
            getStepState("new") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            新規注文
          </span>
        </motion.div>

        {/* 調理中 */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants}
          animate={getStepState("preparing") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("preparing") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChefHat className="w-6 h-6" />
          </motion.div>
          <span className={`text-sm font-medium ${
            getStepState("preparing") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            調理中
          </span>
        </motion.div>

        {/* 完了 */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants}
          animate={getStepState("completed") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("completed") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle className="w-6 h-6" />
          </motion.div>
          <span className={`text-sm font-medium ${
            getStepState("completed") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            完了
          </span>
        </motion.div>
      </div>

      {/* ステータスメッセージ */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {status === "new" && (
          <p className="text-lg font-medium">ご注文を受け付けました。まもなく調理を開始します。</p>
        )}
        {status === "preparing" && (
          <p className="text-lg font-medium">現在、お料理を調理中です。しばらくお待ちください。</p>
        )}
        {status === "completed" && (
          <p className="text-lg font-medium">お料理の準備が完了しました！お呼び出し番号をご確認ください。</p>
        )}
      </motion.div>
    </div>
  );
}