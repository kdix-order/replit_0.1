/**
 * グローバル型宣言ファイル
 * CI/CDパイプラインの型チェックエラーを解決するための型定義
 */

declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';
  
  export interface JestAxeConfigureOptions {
    rules?: Record<string, { enabled: boolean }>;
    checks?: Record<string, { enabled: boolean }>;
  }
  
  export function configureAxe(options: JestAxeConfigureOptions): void;
  export function axe(html: Element | string, options?: JestAxeConfigureOptions): Promise<AxeResults>;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
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

declare module '@radix-ui/react-accordion' {}
declare module '@radix-ui/react-aspect-ratio' {}
declare module '@radix-ui/react-checkbox' {}
declare module '@radix-ui/react-collapsible' {}
declare module '@radix-ui/react-context-menu' {}
declare module '@radix-ui/react-hover-card' {}
declare module '@radix-ui/react-menubar' {}
declare module '@radix-ui/react-navigation-menu' {}
declare module '@radix-ui/react-progress' {}
declare module '@radix-ui/react-radio-group' {}
declare module '@radix-ui/react-scroll-area' {}
declare module '@radix-ui/react-separator' {}
declare module '@radix-ui/react-slider' {}
declare module '@radix-ui/react-switch' {}
declare module '@radix-ui/react-toggle' {}
declare module '@radix-ui/react-toggle-group' {}
declare module '@radix-ui/react-tooltip' {}

declare module 'cmdk' {}
declare module 'embla-carousel-react' {}
declare module 'input-otp' {}
declare module 'recharts' {}
declare module 'vaul' {}
declare module 'react-resizable-panels' {}
declare module 'drizzle-zod' {}
declare module '@replit/vite-plugin-shadcn-theme-json' {}
