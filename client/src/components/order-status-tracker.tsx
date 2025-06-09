/**
 * 注文ステータストラッカーコンポーネント
 * 注文の進行状況を視覚的に表示するプログレスバーとステップインジケーターを提供します
 * 「新規注文」「調理中」「完了」の3段階でステータスを表示します
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // アニメーション効果のためのライブラリ
import { CheckCircle, Clock, ChefHat } from "lucide-react"; // アイコンコンポーネント
import { getStatusLabel, type OrderStatus } from "@/utils/orderStatus";

/**
 * OrderStatusTrackerのプロパティ型定義
 * 
 * @property status - 現在の注文ステータス（"new":新規注文, "preparing":調理中, "completed":完了）
 */
type OrderStatusTrackerProps = {
  status: OrderStatus;
};

/**
 * 注文ステータストラッカーコンポーネント本体
 * 現在の注文ステータスに基づいて進捗バーとステップアイコンを表示します
 *
 * @param status - 現在の注文ステータス（"new","preparing","completed"）
 */
export function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  /**
   * アニメーション完了状態を管理するステート
   * 各ステップのアニメーション完了状態を保持します
   */
  const [animationComplete, setAnimationComplete] = useState({
    toPending: false,   // 支払い待ちステップのアニメーション完了状態
    toPaid: false,      // 支払い済みステップのアニメーション完了状態
    toReady: false,     // 受取可能ステップのアニメーション完了状態
    toCompleted: false, // 完了ステップのアニメーション完了状態
  });

  /**
   * ステータスが変更されたときのアニメーション状態を更新する効果
   * 現在のステータスに応じて、アニメーション完了状態を設定します
   */
  useEffect(() => {
    if (status === "pending") {
      // 支払い待ちのみ
      setAnimationComplete({ toPending: true, toPaid: false, toReady: false, toCompleted: false });
    } else if (status === "paid") {
      // 支払い済みまで完了
      setAnimationComplete({ toPending: true, toPaid: true, toReady: false, toCompleted: false });
    } else if (status === "ready") {
      // 受取可能まで完了
      setAnimationComplete({ toPending: true, toPaid: true, toReady: true, toCompleted: false });
    } else if (status === "completed") {
      // すべてのステップ完了
      setAnimationComplete({ toPending: true, toPaid: true, toReady: true, toCompleted: true });
    } else if (status === "cancelled" || status === "refunded") {
      // キャンセル/返金の場合も全ステップ表示
      setAnimationComplete({ toPending: true, toPaid: true, toReady: false, toCompleted: false });
    }
  }, [status]);

  /**
   * 各ステップが「アクティブ」か「非アクティブ」かを判定する関数
   * 現在のステータスとターゲットステップに基づいて状態を返します
   *
   * @param step - 判定するステップ
   * @returns "active"（アクティブ）または"inactive"（非アクティブ）
   */
  const getStepState = (step: "pending" | "paid" | "ready" | "completed") => {
    if (step === "pending" && (status === "pending" || status === "paid" || status === "ready" || status === "completed")) {
      return "active";
    } else if (step === "paid" && (status === "paid" || status === "ready" || status === "completed")) {
      return "active";
    } else if (step === "ready" && (status === "ready" || status === "completed")) {
      return "active";
    } else if (step === "completed" && status === "completed") {
      return "active";
    }
    // キャンセル/返金の場合の特別処理
    if ((status === "cancelled" || status === "refunded") && (step === "pending" || step === "paid")) {
      return "active";
    }
    return "inactive";
  };

  /**
   * ステップのアニメーションバリアント設定
   * 各状態のスケールと透明度を定義します
   */
  const variants = {
    inactive: { scale: 0.9, opacity: 0.7 }, // 非アクティブ状態のスタイル
    active: { scale: 1, opacity: 1 },       // アクティブ状態のスタイル
  };

  /**
   * 進捗バーのアニメーションバリアント設定
   * ステータスに応じた進捗バーの幅を定義します
   */
  // ステータスに基づく進捗率を計算
  const getProgress = () => {
    switch (status) {
      case "pending": return 0;
      case "paid": return 33;
      case "ready": return 66;
      case "completed": return 100;
      case "cancelled":
      case "refunded":
        return 33; // キャンセル/返金は支払い済み段階で止まる
      default: return 0;
    }
  };

  /**
   * 注文ステータストラッカーのレンダリング
   * 進捗バー、ステップアイコン、ステータスメッセージから成るUI
   */
  return (
    <div className="relative w-full max-w-3xl mx-auto py-6">
      {/* 進捗バー - 背景（灰色の横線） */}
      <div className="absolute top-[43px] left-0 right-0 h-2 bg-gray-200 rounded-full mx-12"></div>

      {/* 進捗バー - アクティブ部分（ステータスに応じて動的に幅が変化する赤→黄のグラデーション） */}
      <motion.div
        className="absolute top-[43px] left-0 h-2 bg-gradient-to-r from-[#e80113] to-[#fee10b] rounded-full mx-12"
        initial={{ width: "0%" }} // 初期状態は幅0
        animate={{
          // ステータスに応じてプログレスバーの進行度を変更
          width: `${getProgress()}%`
        }}
        // スムーズなアニメーション設定
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* 3つのステップアイコン（新規注文、調理中、完了）を横並びに配置 */}
      <div className="flex justify-between items-center relative z-10">
        {/* Step 1: 支払い待ちアイコン */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants} // 定義済みのアニメーションバリアント
          // ステップの状態に応じたアニメーション適用
          animate={getStepState("pending") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          {/* アイコン円形コンテナ - アクティブ時は赤背景、非アクティブ時は灰色背景 */}
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("pending") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }} // ホバー時に少し拡大
            whileTap={{ scale: 0.95 }}    // クリック時に少し縮小
          >
            <Clock className="w-6 h-6"/> {/* 時計アイコン */}
          </motion.div>
          {/* ステップラベル - アクティブ時は赤文字、非アクティブ時は灰色文字 */}
          <span className={`text-sm font-medium ${
            getStepState("pending") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            {getStatusLabel("pending")}
          </span>
        </motion.div>

        {/* Step 2: 調理中アイコン */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants}
          animate={getStepState("paid") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          {/* アイコン円形コンテナ */}
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("paid") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChefHat className="w-6 h-6"/> {/* シェフハットアイコン */}
          </motion.div>
          {/* ステップラベル */}
          <span className={`text-sm font-medium ${
            getStepState("paid") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            {getStatusLabel("paid")}
          </span>
        </motion.div>

        {/* Step 3: 受取可能アイコン */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants}
          animate={getStepState("ready") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          {/* アイコン円形コンテナ */}
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("ready") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle className="w-6 h-6"/> {/* チェックマークアイコン */}
          </motion.div>
          {/* ステップラベル */}
          <span className={`text-sm font-medium ${
            getStepState("ready") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            {getStatusLabel("ready")}
          </span>
        </motion.div>

        {/* Step 4: 完了アイコン */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants}
          animate={getStepState("completed") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          {/* アイコン円形コンテナ */}
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("completed") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle className="w-6 h-6"/> {/* チェックマークアイコン */}
          </motion.div>
          {/* ステップラベル */}
          <span className={`text-sm font-medium ${
            getStepState("completed") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            {getStatusLabel("completed")}
          </span>
        </motion.div>
      </div>

      {/* ステータスに応じた説明文 - 下からフェードインするアニメーション付き */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }} // 初期状態は不透明度0で下に10px
        animate={{ opacity: 1, y: 0 }}  // 表示時は不透明度100%で元の位置
        transition={{ delay: 0.3 }}     // 0.3秒遅延してアニメーション開始
      >
        {/* 支払い待ち時のメッセージ */}
        {status === "pending" && (
          <p className="text-lg font-medium">お支払いをお待ちしています</p>
        )}
        {/* 支払い済み時のメッセージ */}
        {status === "paid" && (
          <p className="text-lg font-medium">ご注文を承りました</p>
        )}
        {/* 受取可能時のメッセージ */}
        {status === "ready" && (
          <p className="text-lg font-medium">お受け取りいただけます</p>
        )}
        {/* 完了時のメッセージ */}
        {status === "completed" && (
          <p className="text-lg font-medium">ご利用ありがとうございました</p>
        )}
        {/* キャンセル時のメッセージ */}
        {status === "cancelled" && (
          <p className="text-lg font-medium text-red-600">キャンセルされました</p>
        )}
        {/* 返金時のメッセージ */}
        {status === "refunded" && (
          <p className="text-lg font-medium text-red-600">返金処理が完了しました</p>
        )}
      </motion.div>
    </div>
  );
}