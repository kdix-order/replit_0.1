/**
 * デバウンスフック
 * 値の変更を指定時間遅延させる
 */
import { useState, useEffect } from 'react';

/**
 * 値の変更をデバウンスするカスタムフック
 * @param value デバウンスする値
 * @param delay 遅延時間（ミリ秒）
 * @returns デバウンスされた値
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 値が変更されたらタイマーをセット
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // クリーンアップ関数でタイマーをクリア
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}