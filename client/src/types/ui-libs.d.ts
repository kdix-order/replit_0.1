/**
 * UI関連ライブラリの型宣言
 * CI/CDパイプラインの型チェックエラーを解決するための型定義
 */

declare module 'cmdk' {
  import * as React from 'react';
  export const Command: React.FC<any> & {
    Input: React.FC<any>;
    List: React.FC<any>;
    Item: React.FC<any>;
    Group: React.FC<any>;
    Separator: React.FC<any>;
    Empty: React.FC<any>;
    Dialog: React.FC<any>;
    Loading: React.FC<any>;
  };
}

declare module 'embla-carousel-react' {
  import * as React from 'react';
  
  export interface EmblaCarouselType {
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: () => boolean;
    canScrollNext: () => boolean;
    scrollTo: (index: number) => void;
    selectedScrollSnap: () => number;
    on: (event: string, callback: (api?: EmblaCarouselType) => void) => void;
    off: (event: string, callback: (api?: EmblaCarouselType) => void) => void;
  }
  
  export type UseEmblaCarouselType = [React.RefObject<HTMLDivElement>, EmblaCarouselType | undefined];
  
  interface EmblaOptionsType {
    axis?: 'x' | 'y';
    [key: string]: any;
  }
  
  export default function useEmblaCarousel(
    options?: EmblaOptionsType,
    plugins?: any[]
  ): UseEmblaCarouselType;
}

declare module 'input-otp' {
  import * as React from 'react';
  export const OTPInput: React.FC<any>;
  export const OTPInputContext: React.Context<any>;
  export function useOTPInput(options?: any): any;
}

declare module 'recharts' {
  import * as React from 'react';
  export const AreaChart: React.FC<any>;
  export const Area: React.FC<any>;
  export const BarChart: React.FC<any>;
  export const Bar: React.FC<any>;
  export const LineChart: React.FC<any>;
  export const Line: React.FC<any>;
  export const PieChart: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const ResponsiveContainer: React.FC<any>;
  export const Cell: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
  export const Legend: React.FC<any>;
  
  export interface LegendProps {
    payload?: any[];
    verticalAlign?: string;
    [key: string]: any;
  }
  
  export namespace Legend {
    export interface LegendProps {
      payload?: any[];
      verticalAlign?: string;
      [key: string]: any;
    }
  }
}

declare module 'vaul' {
  import * as React from 'react';
  export const Drawer: React.FC<any> & {
    Root: React.FC<any>;
    Portal: React.FC<any>;
    Content: React.FC<any>;
    Trigger: React.FC<any>;
    Title: React.FC<any>;
    Description: React.FC<any>;
    Close: React.FC<any>;
    Overlay: React.FC<any>;
  };
}

declare module 'react-resizable-panels' {
  import * as React from 'react';
  export const PanelGroup: React.FC<any>;
  export const Panel: React.FC<any>;
  export const PanelResizeHandle: React.FC<any>;
  export function ImperativePanelHandle(): any;
}

declare module 'drizzle-zod' {
  export function createInsertSchema(table: any, options?: any): any;
  export const createSelectSchema: typeof createInsertSchema;
}

declare module '@replit/vite-plugin-shadcn-theme-json' {
  export default function themePlugin(options?: any): any;
}

declare module 'framer-motion' {
  import * as React from 'react';
  
  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    custom?: any;
    initial?: boolean;
    onExitComplete?: () => void;
    exitBeforeEnter?: boolean;
    presenceAffectsLayout?: boolean;
  }
  
  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    variants?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
    whileInView?: any;
    custom?: any;
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any;
  }
  
  export const motion: {
    [key: string]: React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<any>>;
  };
  
  export const AnimatePresence: React.FC<AnimatePresenceProps>;
}
