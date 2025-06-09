import axios from 'axios';
import type { Order } from '@db/schema';

interface SmaregiConfig {
  contractId: string;
  accessToken: string;
  storeId: string;
  terminalId: string;
}

interface PrintData {
  printType: 'receipt';
  printData: string;
}

class SmaregiAPI {
  private config: SmaregiConfig;
  private baseUrl = 'https://api.smaregi.jp/access';

  constructor(config: SmaregiConfig) {
    this.config = config;
  }

  private formatReceiptData(order: Order & { items?: any[] }): string {
    const lines: string[] = [];
    
    // 注文番号（大きく表示）
    lines.push(`（店舗用）${order.callNumber || order.id}`);
    lines.push('');
    
    // 注文情報ヘッダー
    const now = new Date(order.createdAt);
    const receiptNo = `746603${order.callNumber.toString().padStart(7, '0')}`;
    lines.push(`No:${receiptNo}`);
    lines.push(`端末番号:1 ID:10330`);
    lines.push(`${now.toLocaleDateString('ja-JP')} ${now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`);
    lines.push('');
    
    // 商品明細（Order.itemsがある場合）
    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any) => {
        // 商品名と数量
        if (item.quantity > 1) {
          lines.push(`${item.productName || item.name} × ${item.quantity}`);
        } else {
          lines.push(item.productName || item.name);
        }
        
        // サイズ（デフォルト以外の場合）
        if (item.size && item.size !== '並') {
          lines.push(`  【${item.size}】`);
        }
        
        // カスタマイズ
        if (item.customizations && item.customizations.length > 0) {
          item.customizations.forEach((custom: string) => {
            lines.push(`  ・${custom}`);
          });
        }
        
        lines.push(''); // 商品間の空行
      });
    } else {
      // order.itemsがJSONBフィールドの場合
      const items = order.items as any;
      if (items && Array.isArray(items)) {
        items.forEach((item: any) => {
          // 商品名と数量
          if (item.quantity > 1) {
            lines.push(`${item.name} × ${item.quantity}`);
          } else {
            lines.push(item.name);
          }
          
          // サイズ（デフォルト以外の場合）
          if (item.size && item.size !== '並') {
            lines.push(`  【${item.size}】`);
          }
          
          // カスタマイズ
          if (item.customizations && item.customizations.length > 0) {
            item.customizations.forEach((custom: string) => {
              lines.push(`  ・${custom}`);
            });
          }
          
          lines.push(''); // 商品間の空行
        });
      }
    }
    
    // 受取時間スロット
    if (order.timeSlotId) {
      lines.push(`受取時間: ${order.timeSlotId}`);
    }
    
    // フッター
    lines.push('');
    lines.push('--------------------------------');
    
    return lines.join('\n');
  }

  async printReceipt(order: Order & { items?: any[] }): Promise<void> {
    try {
      const printData: PrintData = {
        printType: 'receipt',
        printData: this.formatReceiptData(order)
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.config.contractId}/stores/${this.config.storeId}/terminals/${this.config.terminalId}/prints`,
        printData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Print job sent successfully:', response.data);
    } catch (error) {
      console.error('Failed to print receipt:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', (error as any).response?.data);
        console.error('Response status:', (error as any).response?.status);
      }
      throw error;
    }
  }
}

// シングルトンインスタンス
let smaregiAPI: SmaregiAPI | null = null;

export function initializeSmaregiAPI(): SmaregiAPI | null {
  const contractId = process.env.SMAREGI_CONTRACT_ID;
  const accessToken = process.env.SMAREGI_ACCESS_TOKEN;
  const storeId = process.env.SMAREGI_STORE_ID;
  const terminalId = process.env.SMAREGI_TERMINAL_ID;

  if (!contractId || !accessToken || !storeId || !terminalId) {
    console.warn('Smaregi API credentials not configured. Printing will be disabled.');
    return null;
  }

  if (!smaregiAPI) {
    smaregiAPI = new SmaregiAPI({
      contractId,
      accessToken,
      storeId,
      terminalId
    });
  }

  return smaregiAPI;
}

export async function printOrderReceipt(order: Order & { items?: any[] }): Promise<void> {
  const api = initializeSmaregiAPI();
  
  if (!api) {
    console.log('Smaregi API not configured. Skipping print.');
    return;
  }

  try {
    await api.printReceipt(order);
    console.log(`Receipt printed for order ${order.id}`);
  } catch (error) {
    console.error(`Failed to print receipt for order ${order.id}:`, error);
    // エラーが発生しても処理を継続
  }
}