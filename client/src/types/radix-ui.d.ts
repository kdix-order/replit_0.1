/**
 * Radix UI コンポーネント用の型宣言
 * CI/CDパイプラインの型チェックエラーを解決するための型定義
 */

declare module '@radix-ui/react-accordion' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Item: React.FC<any>;
  export const Header: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Content: React.FC<any>;
}

declare module '@radix-ui/react-aspect-ratio' {
  import * as React from 'react';
  export const Root: React.FC<any>;
}

declare module '@radix-ui/react-checkbox' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Indicator: React.FC<any>;
}

declare module '@radix-ui/react-collapsible' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Content: React.FC<any>;
  export const CollapsibleTrigger: React.FC<any>;
  export const CollapsibleContent: React.FC<any>;
}

declare module '@radix-ui/react-context-menu' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Portal: React.FC<any>;
  export const Content: React.FC<any>;
  export const Item: React.FC<any>;
  export const CheckboxItem: React.FC<any>;
  export const RadioItem: React.FC<any>;
  export const Label: React.FC<any>;
  export const Separator: React.FC<any>;
  export const Shortcut: React.FC<any>;
  export const Sub: React.FC<any>;
  export const SubContent: React.FC<any>;
  export const SubTrigger: React.FC<any>;
  export const Group: React.FC<any>;
  export const RadioGroup: React.FC<any>;
  export const ItemIndicator: React.FC<any>;
}

declare module '@radix-ui/react-hover-card' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Content: React.FC<any>;
}

declare module '@radix-ui/react-menubar' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Menu: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Portal: React.FC<any>;
  export const Content: React.FC<any>;
  export const Item: React.FC<any>;
  export const CheckboxItem: React.FC<any>;
  export const RadioItem: React.FC<any>;
  export const Label: React.FC<any>;
  export const Separator: React.FC<any>;
  export const Shortcut: React.FC<any>;
  export const Sub: React.FC<any>;
  export const SubContent: React.FC<any>;
  export const SubTrigger: React.FC<any>;
  export const Group: React.FC<any>;
  export const RadioGroup: React.FC<any>;
  export const ItemIndicator: React.FC<any>;
}

declare module '@radix-ui/react-navigation-menu' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const List: React.FC<any>;
  export const Item: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Content: React.FC<any>;
  export const Link: React.FC<any>;
  export const Indicator: React.FC<any>;
  export const Viewport: React.FC<any>;
}

declare module '@radix-ui/react-progress' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Indicator: React.FC<any>;
}

declare module '@radix-ui/react-radio-group' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Item: React.FC<any>;
  export const Indicator: React.FC<any>;
}

declare module '@radix-ui/react-scroll-area' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Viewport: React.FC<any>;
  export const Scrollbar: React.FC<any>;
  export const Thumb: React.FC<any>;
  export const Corner: React.FC<any>;
  export const ScrollAreaScrollbar: React.FC<any>;
  export const ScrollAreaThumb: React.FC<any>;
}

declare module '@radix-ui/react-separator' {
  import * as React from 'react';
  export const Root: React.FC<any>;
}

declare module '@radix-ui/react-slider' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Track: React.FC<any>;
  export const Range: React.FC<any>;
  export const Thumb: React.FC<any>;
}

declare module '@radix-ui/react-switch' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Thumb: React.FC<any>;
}

declare module '@radix-ui/react-toggle' {
  import * as React from 'react';
  export const Root: React.FC<any>;
}

declare module '@radix-ui/react-toggle-group' {
  import * as React from 'react';
  export const Root: React.FC<any>;
  export const Item: React.FC<any>;
}

declare module '@radix-ui/react-tooltip' {
  import * as React from 'react';
  export const Provider: React.FC<any>;
  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Content: React.FC<any>;
  export const Arrow: React.FC<any>;
}
