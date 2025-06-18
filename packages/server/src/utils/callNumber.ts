/**
 * 受付番号変換ユーティリティ
 * データベースの連番を201-300の範囲に変換
 */

/**
 * 受付番号を201-300の範囲に変換する
 * @param callNumber - データベースから取得した受付番号
 * @returns 201-300の範囲に変換された受付番号
 */
export function transformCallNumber(callNumber: number): number {
    return (callNumber % 100) + 201;
  }