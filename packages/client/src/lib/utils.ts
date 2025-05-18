import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// カスタマイズIDを日本語表示に変換する関数
export function getCustomizationLabel(customizationId: string): string {
  switch (customizationId) {
    case "no_egg": return "玉子抜き";
    case "no_onion": return "玉ねぎ抜き";
    case "extra_sauce": return "ソース増量";
    case "less_sauce": return "ソース少なめ";
    case "extra_spicy": return "辛さ増し";
    case "less_spicy": return "辛さ控えめ";
    default: return customizationId;
  }
}
