/**
 * PayPay API連携モジュール
 * 
 * このファイルはPayPay決済APIとの連携機能を提供します。
 * API認証情報がない場合は自動的にデモモードで動作し、モックデータを返します。
 * 
 * モックモード実装により、実際のPayPay API認証情報がなくても
 * アプリケーションの決済フローを完全にテストできます。
 * 
 * 【編集方法】
 * 1. 実際のPayPay連携を行う場合は.envファイルに以下の変数を設定:
 *    - PAYPAY_API_KEY: PayPayデベロッパーポータルで取得したAPIキー
 *    - PAYPAY_API_SECRET: PayPayデベロッパーポータルで取得したAPIシークレット
 *    - PAYPAY_MERCHANT_ID: PayPayデベロッパーポータルで取得した加盟店ID
 * 
 * 2. デモモードで使用する場合は上記の環境変数を設定せず、
 *    このファイルはそのまま使用できます。デモモードが自動的に有効になります。
 * 
 * 【デモモード動作説明】
 * - createPayment: 常に成功レスポンスとサンプルQRコード画像URLを返します
 * - getPaymentDetails: 常に支払い成功ステータス(COMPLETED)を返します
 */

// @ts-ignore 型定義が完全でないため、ignoreを使用
import PAYPAYOPA from '@paypayopa/paypayopa-sdk-node';
import { randomUUID } from 'crypto';

// フロントエンドのURL（リダイレクト先として使用）
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * PayPay SDKを初期化する関数
 * 
 * 環境変数に認証情報がない場合はnullを返し、デモモードで動作します。
 * 認証情報が設定されている場合は、PayPay SDK設定済みインスタンスを返します。
 * 
 * @returns 設定済みのPayPay SDKインスタンス、または環境変数未設定時はnull
 */
export function initializePayPay() {
  // 必要な環境変数がすべて設定されているか確認
  if (!process.env.PAYPAY_API_KEY || 
      !process.env.PAYPAY_API_SECRET || 
      !process.env.PAYPAY_MERCHANT_ID) {
    console.warn('PayPay環境変数が設定されていません。デモモードで動作します。');
    return null; // デモモードを示すnullを返す
  }

  // PayPay SDK初期化
  PAYPAYOPA.Configure({
    clientId: process.env.PAYPAY_API_KEY,
    clientSecret: process.env.PAYPAY_API_SECRET,
    merchantId: process.env.PAYPAY_MERCHANT_ID,
    productionMode: false, // サンドボックス環境。本番環境の場合はtrueに変更
  });

  console.log('PayPay SDKが正常に初期化されました');
  return PAYPAYOPA;
}

/**
 * 支払いQRコードを作成する関数
 * 
 * PayPay API認証情報がある場合は実際にAPIを呼び出し、
 * ない場合はモックデータを返すデモモードで動作します。
 * 
 * @param orderId - 注文ID（加盟店注文ID）
 * @param amount - 支払金額（日本円）
 * @param orderDescription - 注文の説明
 * @returns PayPay API応答、または認証情報未設定時はモックデータ
 */
export async function createPayment(orderId: string, amount: number, orderDescription: string, origin: string | undefined) {
  // PayPay SDKインスタンスを取得
  const payPayInstance = initializePayPay();
  
  // 認証情報がない場合はデモモードで動作
  if (!payPayInstance) {
    // デモモード: 成功レスポンスを返す
    console.log(`デモモード: 注文ID ${orderId} の支払いQRコードを生成`);
    
    // モックデータを返す
    // 実際のPayPay APIと同じ形式のレスポンスを生成
    return {
      status: 'SUCCESS',
      data: {
        paymentId: `demo-${randomUUID()}`, // 一意のIDを生成
        merchantPaymentId: orderId,
        deepLink: 'https://example.com/demo-paypay', // デモ用ディープリンク
        // PayPay公式SDKのサンプルQRコード画像
        url: 'https://raw.githubusercontent.com/PayPay/paypayopa-sdk-node/master/resources/default_qrcode.png',
      }
    };
  }

  // 実際のPayPay APIを呼び出す
  try {
    // PayPay QRコード作成APIに送信するペイロード
    const payload = {
      merchantPaymentId: orderId,
      amount: {
        amount: amount,
        currency: 'JPY'
      },
      orderDescription: orderDescription,
      redirectUrl: `${origin || FRONTEND_URL}/api/payments/paypay/completed/${orderId}`, // 決済完了後のリダイレクト先
      redirectType: 'WEB_LINK',
      codeType: "ORDER_QR",
    };

    // QRコード作成APIを呼び出し
    return await payPayInstance.QRCodeCreate(payload);
  } catch (error) {
    console.error('PayPay QRコード作成エラー:', error);
    throw error;
  }
}

/**
 * 支払いの詳細情報を取得する関数
 * 
 * PayPay API認証情報がある場合は実際にAPIを呼び出し、
 * ない場合はモックデータを返すデモモードで動作します。
 * 
 * @param merchantPaymentId - 加盟店注文ID（注文作成時に使用したID）
 * @returns PayPay API応答、または認証情報未設定時はモックデータ
 */
export async function getPaymentDetails(merchantPaymentId: string) {
  // PayPay SDKインスタンスを取得
  const payPayInstance = initializePayPay();
  
  // 認証情報がない場合はデモモードで動作
  if (!payPayInstance) {
    // デモモード: 成功レスポンスを返す
    console.log(`デモモード: 注文ID ${merchantPaymentId} の支払い状態を取得`);
    
    // モックデータを返す
    // 実際のPayPay APIと同じ形式のレスポンスを生成
    return {
      status: 'SUCCESS',
      data: {
        status: 'COMPLETED', // 常に決済完了状態を返す
        paymentId: `demo-${randomUUID()}`,
        refunds: [], // 返金データ（デモでは空）
        merchantPaymentId
      }
    };
  }

  // 実際のPayPay APIを呼び出す
  try {
    // PayPay SDKのGetCodePaymentDetailsは配列を期待するため修正
    // 支払いステータス確認APIを呼び出し
    return await payPayInstance.GetCodePaymentDetails([merchantPaymentId]);
  } catch (error) {
    console.error('PayPay 支払い詳細取得エラー:', error);
    throw error;
  }
}