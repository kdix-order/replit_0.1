/**
 * キーボードナビゲーション用のカスタムフック
 * アクセシビリティ向上のためのキーボード操作をサポート
 */
import { useEffect, useRef, useCallback } from 'react';
import { TIME_CONSTANTS } from '@/constants/admin';

/**
 * フォーカストラップを実装するフック
 * モーダルやダイアログ内でフォーカスを閉じ込める
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // 初期フォーカス
    firstFocusable?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
  
  return containerRef;
}

/**
 * 矢印キーでのナビゲーションを実装するフック
 */
export function useArrowNavigation(
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const currentIndexRef = useRef(0);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentIndex = currentIndexRef.current;
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        if (orientation !== 'horizontal') {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
      case 'ArrowDown':
        if (orientation !== 'horizontal') {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if (orientation !== 'vertical') {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
      case 'ArrowRight':
        if (orientation !== 'vertical') {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(currentIndex);
        return;
      default:
        return;
    }
    
    if (loop) {
      nextIndex = (nextIndex + items.length) % items.length;
    } else {
      nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
    }
    
    if (nextIndex !== currentIndex) {
      currentIndexRef.current = nextIndex;
      items[nextIndex]?.focus();
    }
  }, [items, orientation, loop, onSelect]);
  
  useEffect(() => {
    items.forEach((item, index) => {
      item.addEventListener('keydown', handleKeyDown);
      item.addEventListener('focus', () => {
        currentIndexRef.current = index;
      });
    });
    
    return () => {
      items.forEach(item => {
        item.removeEventListener('keydown', handleKeyDown);
      });
    };
  }, [items, handleKeyDown]);
}

/**
 * Escキーでの閉じる動作を実装するフック
 */
export function useEscapeKey(
  onEscape: () => void,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, isActive]);
}

/**
 * ライブリージョンへのアナウンスを行うフック
 */
export function useAnnounce() {
  const announceRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!announceRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      announceRef.current = announcer;
    }
    
    return () => {
      if (announceRef.current?.parentNode) {
        announceRef.current.parentNode.removeChild(announceRef.current);
      }
    };
  }, []);
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, TIME_CONSTANTS.ANNOUNCE_CLEAR_DELAY);
    }
  }, []);
  
  return announce;
}