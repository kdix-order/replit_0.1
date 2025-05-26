import { MemStorage } from './mem-storage';
import { PgStorage } from './pg-storage';
import { IStorage } from './istorage';

export { IStorage, MemStorage, PgStorage };

/**
 * テスト環境用のシングルトンインスタンス
 * テスト間でストレージを共有するために使用
 */
let testStorageInstance: IStorage | null = null;

/**
 * ストレージファクトリ関数
 * 環境に応じて適切なストレージインスタンスを作成します
 * 
 * テスト環境では同一インスタンスを返し、テスト間で状態を共有します
 * 本番環境では毎回新しいインスタンスを作成します
 */
export function createStorage(): IStorage {
  if (process.env.NODE_ENV === 'test') {
    if (!testStorageInstance) {
      testStorageInstance = new MemStorage(300);  // テスト時は300から開始
    }
    return testStorageInstance;
  } else {
    return new PgStorage();  // 本番環境では201から開始
  }
}
