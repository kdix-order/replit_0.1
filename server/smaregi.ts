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
    console.log('=== レシートデータ生成開始 ===');
    console.log('Order:', JSON.stringify(order, null, 2));
    
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
    
    const receiptText = lines.join('\n');
    console.log('=== 生成されたレシートデータ ===');
    console.log(receiptText);
    console.log('================================');
    
    return receiptText;
  }

  async printReceipt(order: Order & { items?: any[] }): Promise<void> {
    try {
      const printData: PrintData = {
        printType: 'receipt',
        printData: this.formatReceiptData(order)
      };

      const url = `${this.baseUrl}/${this.config.contractId}/stores/${this.config.storeId}/terminals/${this.config.terminalId}/prints`;
      
      console.log('=== スマレジAPI印刷リクエスト ===');
      console.log('URL:', url);
      console.log('Headers:', {
        'Authorization': `Bearer ${this.config.accessToken.substring(0, 10)}...`,
        'Content-Type': 'application/json'
      });
      console.log('Request Body:', JSON.stringify(printData, null, 2));
      console.log('================================');

      const response = await axios.post(
        url,
        printData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('=== スマレジAPI印刷レスポンス ===');
      console.log('Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('Print job sent successfully!');
      console.log('================================');
    } catch (error) {
      console.error('=== スマレジAPI印刷エラー ===');
      console.error('Failed to print receipt:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error Type: Axios Error');
        console.error('Response Status:', (error as any).response?.status);
        console.error('Response Data:', JSON.stringify((error as any).response?.data, null, 2));
        console.error('Request Config:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        });
      } else {
        console.error('Error Type:', typeof error);
        console.error('Error Details:', error);
      }
      console.error('==============================');
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

  // デバッグ: 環境変数の確認
  console.log('=== スマレジ環境変数チェック ===');
  console.log('SMAREGI_CONTRACT_ID:', contractId ? `設定済み (${contractId})` : '未設定');
  console.log('SMAREGI_ACCESS_TOKEN:', accessToken ? `設定済み (${accessToken.substring(0, 10)}...)` : '未設定');
  console.log('SMAREGI_STORE_ID:', storeId ? `設定済み (${storeId})` : '未設定');
  console.log('SMAREGI_TERMINAL_ID:', terminalId ? `設定済み (${terminalId})` : '未設定');
  console.log('================================');

  if (!contractId || !accessToken || !storeId || !terminalId) {
    console.warn('Smaregi API credentials not configured. Printing will be disabled.');
    console.warn('Missing credentials:', {
      contractId: !contractId,
      accessToken: !accessToken,
      storeId: !storeId,
      terminalId: !terminalId
    });
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
  console.log('\n=== printOrderReceipt 呼び出し ===');
  console.log('Order ID:', order.id);
  console.log('Call Number:', order.callNumber);
  console.log('Status:', order.status);
  console.log('Total:', order.total);
  console.log('================================\n');
  
  const api = initializeSmaregiAPI();
  
  if (!api) {
    console.log('❌ Smaregi API not configured. Skipping print.');
    return;
  }

  console.log('✅ Smaregi API initialized successfully');

  try {
    await api.printReceipt(order);
    console.log(`✅ Receipt printed successfully for order ${order.id} (Call Number: ${order.callNumber})`);
  } catch (error) {
    console.error(`❌ Failed to print receipt for order ${order.id}:`, error);
    // エラーが発生しても処理を継続
  }
}