/**
 * 注文ステータストラッカーコンポーネント
 * 注文の進行状況を視覚的に表示するプログレスバーとステップインジケーターを提供します
 * 「新規注文」「調理中」「完了」の3段階でステータスを表示します
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // アニメーション効果のためのライブラリ
import { CheckCircle, Clock, ChefHat } from "lucide-react"; // アイコンコンポーネント

/**
 * OrderStatusTrackerのプロパティ型定義
 * 
 * @property status - 現在の注文ステータス（"new":新規注文, "preparing":調理中, "completed":完了）
 */
type OrderStatusTrackerProps = {
  status: "new" | "paid" | "preparing" | "completed";
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
// Removed unused animationComplete state

  /**
   * ステータスが変更されたときのアニメーション状態を更新する効果
   * 現在のステータスに応じて、アニメーション完了状態を設定します
   */
// Removed unused useEffect for animationComplete state

  /**
   * 各ステップが「アクティブ」か「非アクティブ」かを判定する関数
   * 現在のステータスとターゲットステップに基づいて状態を返します
   *
   * @param step - 判定するステップ
   * @returns "active"（アクティブ）または"inactive"（非アクティブ）
   */
  const getStepState = (step: "new" | "paid" | "preparing" | "completed") => {
    if (step === "new" && (status === "new" || status === "paid" || status === "preparing" || status === "completed")) {
      // 新規注文ステップはどのステータスでもアクティブ
      return "active";
    } else if (step === "paid" && (status === "paid" || status === "preparing" || status === "completed")) {
      // 支払いステップは「支払い」または「調理中」または「完了」状態でアクティブ
      return "active";
    } else if (step === "preparing" && (status === "preparing" || status === "completed")) {
      // 調理中ステップは「調理中」または「完了」状態でアクティブ
      return "active";
    } else if (step === "completed" && status === "completed") {
      // 完了ステップは「完了」状態でのみアクティブ
      return "active";
    }
    // それ以外は非アクティブ
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
  const progressVariants = {
    // 新規注文から調理中への進捗
    newToPaid: { width: status === "new" ? "0%" : "33%" },
    paidToPreparing: { width: status === "paid" ? "33%" : status === "preparing" ? "66%" : "0%" },
    // 調理中から完了への進捗
    preparingToCompleted: { width: status === "completed" ? "100%" : status === "preparing" ? "66%" : "0%" },
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
          width: status === "new" ? "0%"
            : status === "paid" ? "33%"
            : status === "preparing" ? "66%"
              : "100%"
        }}
        // スムーズなアニメーション設定
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* 3つのステップアイコン（新規注文、調理中、完了）を横並びに配置 */}
      <div className="flex justify-between items-center relative z-10">
        {/* Step 1: 新規注文アイコン */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants} // 定義済みのアニメーションバリアント
          // ステップの状態に応じたアニメーション適用
          animate={getStepState("new") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          {/* アイコン円形コンテナ - アクティブ時は赤背景、非アクティブ時は灰色背景 */}
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("new") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }} // ホバー時に少し拡大
            whileTap={{ scale: 0.95 }}    // クリック時に少し縮小
          >
            <Clock className="w-6 h-6"/> {/* 時計アイコン */}
          </motion.div>
          {/* ステップラベル - アクティブ時は赤文字、非アクティブ時は灰色文字 */}
          <span className={`text-sm font-medium ${
            getStepState("new") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            新規注文
          </span>
        </motion.div>

        {/* Step 2: 調理中アイコン */}
        <motion.div
          className="flex flex-col items-center"
          variants={variants}
          animate={getStepState("preparing") === "active" ? "active" : "inactive"}
          transition={{ duration: 0.3 }}
        >
          {/* アイコン円形コンテナ */}
          <motion.div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              getStepState("preparing") === "active" ? "bg-[#e80113] text-white" : "bg-gray-300 text-gray-600"
            } mb-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChefHat className="w-6 h-6"/> {/* シェフハットアイコン */}
          </motion.div>
          {/* ステップラベル */}
          <span className={`text-sm font-medium ${
            getStepState("preparing") === "active" ? "text-[#e80113]" : "text-gray-500"
          }`}>
            調理中
          </span>
        </motion.div>

        {/* Step 3: 完了アイコン */}
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
            完了
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
        {/* 新規注文時のメッセージ */}
        {status === "new" && (
          <p className="text-lg font-medium">ご注文を受け付けました。支払い後調理を開始します。</p>
        )}
        {/* 支払い時のメッセージ */}
        {status === "paid" && (
          <p className="text-lg font-medium">お支払いが完了しました。調理を開始します。</p>
        )}
        {/* 調理中のメッセージ */}
        {status === "preparing" && (
          <p className="text-lg font-medium">現在、お料理を調理中です。しばらくお待ちください。</p>
        )}
        {/* 完了時のメッセージ */}
        {status === "completed" && (
          <p className="text-lg font-medium">お料理の準備が完了しました！お呼び出し番号をご確認ください。</p>
        )}
      </motion.div>
    </div>
  );
}