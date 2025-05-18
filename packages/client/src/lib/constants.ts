// Product customization options
export const SIZES = ["ガールズサイズ", "並", "ご飯大", "おかず大", "大大"] as const;
export type Size = typeof SIZES[number];

export const CUSTOMIZATION_OPTIONS = [
  { id: "no_egg", label: "玉子抜き" },
  { id: "no_onion", label: "玉ねぎ抜き" },
  { id: "extra_sauce", label: "ソース増量" },
  { id: "less_sauce", label: "ソース少なめ" },
  { id: "extra_spicy", label: "辛さ増し" },
  { id: "less_spicy", label: "辛さ控えめ" }
] as const;

export type CustomizationOption = {
  id: string;
  label: string;
};