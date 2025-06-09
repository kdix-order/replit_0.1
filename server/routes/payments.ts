/***********************************
 * PayPay決済関連のエンドポイント
 ***********************************/

import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { createPayment, getPaymentDetails } from "../paypay";
import { storage } from "../storage";
import { printOrderReceipt } from "../smaregi";

const router = express.Router();

// PayPay QRコード生成エンドポイント
router.post("/api/payments/paypay/create", isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "必須パラメータが不足しています" });
    }

    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "注文が見つかりません" });
    }
    const description = `味店焼マン注文 #${order.callNumber}`;

    const response = await createPayment(orderId, order.total, description, req.header("Origin"));
    res.json(response);
  } catch (error) {
    console.error('PayPay QRコード生成エラー:', error);
    res.status(500).json({
      message: '支払い処理中にエラーが発生しました',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// PayPay画面からのリダイレクト用エンドポイント
// ブラウザで開かれるので、認証は無効化
router.get("/api/payments/paypay/completed/:merchantPaymentId", async (req, res) => {
  try {
    const { merchantPaymentId } = req.params;
    if (!merchantPaymentId) {
      return res.status(400).json({ message: "merchantPaymentIdが必要です" });
    }
    // PayPayからのリダイレクト時に支払い状態を確認
    const response = await getPaymentDetails(merchantPaymentId);

    if ((response as any).BODY.data.status === "COMPLETED") {
      // 支払い完了時の処理
      // Orderに支払い完了のステータスを更新
      const order = await storage.updateOrderStatus(merchantPaymentId, "paid", "system", "PayPay支払い完了");
      if (!order) {
        return res.status(404).json({ message: "注文が見つかりません" });
      }

      // Clear cart
      await storage.clearCart(order.userId);

      // スマレジプリンターに印刷を送信
      console.log('\n🖨️ === 印刷処理開始 ===');
      console.log('Order Details for Printing:');
      console.log('- Order ID:', order.id);
      console.log('- Call Number:', order.callNumber);
      console.log('- Total:', order.total);
      console.log('- Status:', order.status);
      console.log('- Items:', JSON.stringify(order.items, null, 2));
      
      try {
        await printOrderReceipt(order);
        console.log(`✅ Receipt print job completed for order ${order.id}`);
      } catch (printError) {
        console.error('❌ Failed to print receipt:', printError);
        // 印刷エラーが発生しても処理を継続
      }
      console.log('🖨️ === 印刷処理終了 ===\n');

      res.redirect(`/pickup/${order.id}`);
    } else {
      // 支払い失敗時の処理
      res.redirect("/failure");
    }
  } catch (error) {
    console.error('PayPayリダイレクトエラー:', error);
    res.status(500).json({
      message: 'リダイレクト処理中にエラーが発生しました',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// PayPay 支払い状態確認エンドポイント
router.get("/api/payments/paypay/status/:merchantPaymentId", isAuthenticated, async (req, res) => {
  try {
    const { merchantPaymentId } = req.params;
    const response = await getPaymentDetails(merchantPaymentId);
    res.json(response);
  } catch (error) {
    console.error('PayPay 支払い状態確認エラー:', error);
    res.status(500).json({
      message: '支払い状態確認中にエラーが発生しました',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;