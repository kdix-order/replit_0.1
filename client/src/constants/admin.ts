/**
 * 管理画面で使用する定数
 */

// 時間関連の定数
export const TIME_CONSTANTS = {
  REFRESH_INTERVAL: 60000, // 1分ごとの自動更新
  REFRESH_ANIMATION_DURATION: 2000, // リフレッシュアニメーションの表示時間
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
  },
  ANNOUNCE_CLEAR_DELAY: 1000, // スクリーンリーダーアナウンスのクリア遅延
  URGENT_ORDER_THRESHOLD_MINUTES: 10, // 急ぎの注文とみなす待ち時間
} as const;

// デバウンス関連の定数
export const DEBOUNCE_DELAYS = {
  SEARCH: 300, // 検索入力のデバウンス遅延
} as const;

// UI関連の定数
export const UI_CONSTANTS = {
  MIN_TOUCH_TARGET_SIZE: 44, // タッチターゲットの最小サイズ (px)
  MIN_BUTTON_HEIGHT: 48, // ボタンの最小高さ (px)
  FOCUS_RING_OFFSET: 2, // フォーカスリングのオフセット (px)
  MOBILE_BREAKPOINT: 640, // モバイルブレークポイント (px)
} as const;

// カラーテーマ
export const COLORS = {
  PRIMARY: '#e80113', // 赤 (メインカラー)
  SECONDARY: '#fee10b', // 黄色 (サブカラー)
  BACKGROUND: '#fff9dc', // 薄い黄色 (背景色)
  TEXT: {
    PRIMARY: '#000000',
    SECONDARY: '#6b7280',
    MUTED: '#9ca3af',
  },
  STATUS: {
    PENDING: {
      BG: '#f3f4f6',
      TEXT: '#374151',
      BORDER: '#d1d5db',
    },
    PAID: {
      BG: '#fee10b',
      TEXT: '#000000',
      BORDER: '#e80113',
    },
    READY: {
      BG: '#d1fae5',
      TEXT: '#065f46',
      BORDER: '#86efac',
    },
    COMPLETED: {
      BG: '#d1fae5',
      TEXT: '#065f46',
      BORDER: '#86efac',
    },
    CANCELLED: {
      BG: '#fee2e2',
      TEXT: '#991b1b',
      BORDER: '#fca5a5',
    },
    REFUNDED: {
      BG: '#fee2e2',
      TEXT: '#991b1b',
      BORDER: '#fca5a5',
    },
  },
} as const;

// アニメーション関連の定数
export const ANIMATION_CONSTANTS = {
  TRANSITION_DURATION: 150, // トランジション時間 (ms)
  HOVER_OPACITY: 0.9,
  DISABLED_OPACITY: 0.6,
} as const;

// レイアウト関連の定数
export const LAYOUT_CONSTANTS = {
  MAX_WIDTH: '7xl', // 最大幅
  PADDING: {
    MOBILE: 4,
    TABLET: 6,
    DESKTOP: 8,
  },
  SPACING: {
    XS: 1,
    SM: 2,
    MD: 4,
    LG: 6,
    XL: 8,
  },
} as const;

// その他の定数
export const MISC_CONSTANTS = {
  MAX_ITEMS_PREVIEW: 1, // 注文概要で表示する最大商品数
  DIALOG_MAX_HEIGHT: '90vh', // ダイアログの最大高さ
  SEARCH_INPUT_WIDTH: 64, // 検索入力欄の幅 (Tailwind単位)
} as const;