import { RefObject, useEffect } from 'react';

/**
 * Keep element anchored by bottom edge. If the window is too short, scale it down (no scrolling).
 */
export function useFitToViewport(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const available = el.getBoundingClientRect().bottom - 12;
      const scale = Math.min(1, available / el.offsetHeight);
      el.style.transform = scale < 1 ? `scale(${scale})` : '';
    };
    fit();
    const observer = new ResizeObserver(fit); // content height changes (legend text, hidden items)
    observer.observe(el);
    window.addEventListener('resize', fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [ref]);
}
