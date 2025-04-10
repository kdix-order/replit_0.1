import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { FoodSpinner, BouncingFoodSpinner } from "@/components/ui/food-spinner";

type PayPayPaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
};

export function PayPayPaymentDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount 
}: PayPayPaymentDialogProps) {
  const [processingState, setProcessingState] = useState<"initial" | "processing" | "success" | "error">("initial");

  const handleSubmit = async () => {
    console.log("Starting PayPay payment processing");
    setProcessingState("processing");
    
    // デバッグモード：常に成功させる（テストのため）
    setTimeout(() => {
      // 常に成功
      const isSuccessful = true; // テスト中は必ず成功にする
      console.log(`PayPay payment ${isSuccessful ? 'successful' : 'failed'}`);
      
      if (isSuccessful) {
        setProcessingState("success");
        
        // 少し待ってから成功コールバックを呼び出す
        setTimeout(() => {
          console.log("Calling onSuccess callback");
          onSuccess();
        }, 1000);
      } else {
        setProcessingState("error");
      }
    }, 2000);
  };
  
  const handleRetry = () => {
    setProcessingState("initial");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && processingState !== "processing") {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md border-2 border-[#fe0032] shadow-lg p-6">
        <DialogHeader className="pb-3 mb-4 border-b border-gray-100">
          <DialogTitle className="text-center text-2xl font-bold text-[#fe0032]">PayPay決済</DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-1">
            以下の金額を支払います
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#fe0032] to-red-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/PayPay_Logo.svg/512px-PayPay_Logo.svg.png" 
              alt="PayPay" 
              className="w-16 h-16 drop-shadow-md"
            />
          </div>
          
          <div className="text-4xl font-bold mb-6 bg-gray-50 px-8 py-4 rounded-xl border border-gray-200 shadow-sm">¥{amount.toLocaleString()}</div>
          
          {processingState === "initial" && (
            <Button 
              className="w-full bg-[#fe0032] hover:bg-[#cc0029] text-white py-6 text-lg font-bold rounded-xl shadow-md transform transition-transform duration-300 hover:scale-[1.02]"
              onClick={handleSubmit}
            >
              支払いを確定する
            </Button>
          )}
          
          {processingState === "processing" && (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-2 flex items-center justify-center rounded-full bg-[#fe0032] text-white">
                <p className="text-xl font-bold">処理中</p>
              </div>
              <p className="mt-2 font-medium">決済処理中...</p>
            </div>
          )}
          
          {processingState === "success" && (
            <div className="flex flex-col items-center text-green-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <p className="text-xl font-semibold mt-2">支払い完了</p>
            </div>
          )}
          
          {processingState === "error" && (
            <div className="flex flex-col items-center text-red-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
              <p className="text-xl font-semibold mt-2">エラーが発生しました</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleRetry}
              >
                やり直す
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          {processingState === "initial" && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              キャンセル
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}