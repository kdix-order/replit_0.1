/**
 * services/receiptService.ts
 * 
 * レシート画像生成サービス
 * Canvas APIを使用してレシート画像（JPEG形式）を生成します。
 */

import { createCanvas } from 'canvas';
import type { CanvasRenderingContext2D } from 'canvas';
import { OrderWithTimeSlot } from '../../../shared/schema';

/**
 * レシート画像の設定
 */
const RECEIPT_CONFIG = {
  maxWidth: 576,
  maxHeight: 1024,
  maxFileSize: 63 * 1024, // 63KB
  padding: 20,
  lineHeight: 24,
  backgroundColor: '#ffffff',
  textColor: '#000000',
  headerFontSize: 36,
  titleFontSize: 24,
  bodyFontSize: 18,
  smallFontSize: 14,
};

/**
 * 注文アイテムの型定義
 */
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  customizations: string[];
}

/**
 * レシート画像生成サービスクラス
 */
export class ReceiptService {
  /**
   * 注文からレシート画像を生成します
   * @param order 注文データ
   * @returns JPEG画像のBuffer
   * @throws 画像生成に失敗した場合
   */
  async generateReceiptImage(order: OrderWithTimeSlot): Promise<Buffer> {
    try {
      // キャンバスの初期サイズを設定
      const canvas = createCanvas(RECEIPT_CONFIG.maxWidth, RECEIPT_CONFIG.maxHeight);
      const ctx = canvas.getContext('2d');
      
      // 背景を白に設定
      ctx.fillStyle = RECEIPT_CONFIG.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // テキストの基本設定
      ctx.fillStyle = RECEIPT_CONFIG.textColor;
      ctx.textAlign = 'center';
      
      let currentY = RECEIPT_CONFIG.padding;
      
      // 呼び出し番号を描画（最も目立つように）
      currentY = this.drawCallNumber(ctx, order.callNumber, currentY);
      
      // 区切り線
      currentY = this.drawSeparator(ctx, currentY);
      
      // 注文内容を描画
      currentY = this.drawOrderItems(ctx, order.items as OrderItem[], currentY);
      
      // 区切り線
      currentY = this.drawSeparator(ctx, currentY);
      
      // 合計金額を描画
      currentY = this.drawTotal(ctx, order.total, currentY);
      
      // 受け取り時間を描画
      currentY = this.drawPickupTime(ctx, order.timeSlot.time, currentY);
      
      // 実際のコンテンツサイズに基づいてキャンバスをリサイズ
      const actualHeight = Math.min(currentY + RECEIPT_CONFIG.padding, RECEIPT_CONFIG.maxHeight);
      const finalCanvas = createCanvas(RECEIPT_CONFIG.maxWidth, actualHeight);
      const finalCtx = finalCanvas.getContext('2d');
      
      // 背景を再描画
      finalCtx.fillStyle = RECEIPT_CONFIG.backgroundColor;
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      
      // 元のキャンバスの内容をコピー
      finalCtx.drawImage(canvas, 0, 0);
      
      // JPEGとして出力（品質を調整してファイルサイズを制御）
      let quality = 0.8;
      let imageBuffer: Buffer;
      
      do {
        imageBuffer = finalCanvas.toBuffer('image/jpeg', { quality });
        if (imageBuffer.length <= RECEIPT_CONFIG.maxFileSize) {
          break;
        }
        quality -= 0.1;
      } while (quality > 0.1);
      
      return imageBuffer;
      
    } catch (error) {
      console.error('Receipt image generation failed:', error);
      throw new Error('Failed to generate receipt image');
    }
  }
  
  /**
   * 呼び出し番号を描画
   */
  private drawCallNumber(ctx: CanvasRenderingContext2D, callNumber: number, startY: number): number {
    ctx.font = `bold ${RECEIPT_CONFIG.headerFontSize}px Arial`;
    ctx.fillText('お呼び出し番号', RECEIPT_CONFIG.maxWidth / 2, startY + RECEIPT_CONFIG.headerFontSize);
    
    // 番号を大きく赤色で表示
    ctx.fillStyle = '#e80113';
    ctx.font = `bold 48px Arial`;
    ctx.fillText(callNumber.toString(), RECEIPT_CONFIG.maxWidth / 2, startY + RECEIPT_CONFIG.headerFontSize + 60);
    
    // 色を元に戻す
    ctx.fillStyle = RECEIPT_CONFIG.textColor;
    
    return startY + RECEIPT_CONFIG.headerFontSize + 80;
  }
  
  /**
   * 区切り線を描画
   */
  private drawSeparator(ctx: CanvasRenderingContext2D, startY: number): number {
    const margin = 30;
    ctx.strokeStyle = RECEIPT_CONFIG.textColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, startY);
    ctx.lineTo(RECEIPT_CONFIG.maxWidth - margin, startY);
    ctx.stroke();
    
    return startY + 20;
  }
  
  /**
   * 注文アイテムを描画
   */
  private drawOrderItems(ctx: CanvasRenderingContext2D, items: OrderItem[], startY: number): number {
    ctx.font = `bold ${RECEIPT_CONFIG.titleFontSize}px Arial`;
    ctx.fillText('ご注文内容', RECEIPT_CONFIG.maxWidth / 2, startY + RECEIPT_CONFIG.titleFontSize);
    
    let currentY = startY + RECEIPT_CONFIG.titleFontSize + 30;
    
    items.forEach((item) => {
      // 商品名と数量
      ctx.font = `bold ${RECEIPT_CONFIG.bodyFontSize}px Arial`;
      ctx.textAlign = 'left';
      const itemText = `${item.name} × ${item.quantity}`;
      ctx.fillText(itemText, RECEIPT_CONFIG.padding, currentY);
      
      // 価格（右寄せ）
      ctx.textAlign = 'right';
      const itemTotal = item.price * item.quantity;
      ctx.fillText(`¥${itemTotal.toLocaleString()}`, RECEIPT_CONFIG.maxWidth - RECEIPT_CONFIG.padding, currentY);
      
      currentY += RECEIPT_CONFIG.lineHeight + 5;
      
      // サイズ情報
      if (item.size && item.size !== '並') {
        ctx.font = `${RECEIPT_CONFIG.smallFontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(`  サイズ: ${item.size}`, RECEIPT_CONFIG.padding, currentY);
        currentY += RECEIPT_CONFIG.lineHeight;
      }
      
      // カスタマイズ情報
      if (item.customizations && item.customizations.length > 0) {
        ctx.font = `${RECEIPT_CONFIG.smallFontSize}px Arial`;
        ctx.textAlign = 'left';
        item.customizations.forEach((customization) => {
          ctx.fillText(`  ${customization}`, RECEIPT_CONFIG.padding, currentY);
          currentY += RECEIPT_CONFIG.lineHeight;
        });
      }
      
      currentY += 10; // アイテム間のスペース
    });
    
    ctx.textAlign = 'center'; // 中央寄せに戻す
    return currentY;
  }
  
  /**
   * 合計金額を描画
   */
  private drawTotal(ctx: CanvasRenderingContext2D, total: number, startY: number): number {
    ctx.font = `bold ${RECEIPT_CONFIG.titleFontSize}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText(`合計: ¥${total.toLocaleString()}`, RECEIPT_CONFIG.maxWidth - RECEIPT_CONFIG.padding, startY + RECEIPT_CONFIG.titleFontSize);
    
    ctx.textAlign = 'center'; // 中央寄せに戻す
    return startY + RECEIPT_CONFIG.titleFontSize + 20;
  }
  
  /**
   * 受け取り時間を描画
   */
  private drawPickupTime(ctx: CanvasRenderingContext2D, pickupTime: string, startY: number): number {
    ctx.font = `${RECEIPT_CONFIG.bodyFontSize}px Arial`;
    ctx.fillText(`受け取り時間: ${pickupTime}`, RECEIPT_CONFIG.maxWidth / 2, startY + RECEIPT_CONFIG.bodyFontSize);
    
    return startY + RECEIPT_CONFIG.bodyFontSize + 20;
  }
}

export const receiptService = new ReceiptService();