import { useEffect } from 'react';

/**
 * Calls `handler` when the user presses outside every ref in `refs`.
 * Designed for popovers/dropdowns: keep it active while the menu is open
 * and close the menu from the handler. Listeners are always cleaned up.
 *
 * @param {React.RefObject|React.RefObject[]} refs - trigger + panel wrappers
 * @param {boolean} active - only listens while a menu is open
 * @param {(event: MouseEvent|TouchEvent) => void} handler - runs on outside press
 */
export default function useClickOutside(refs, active, handler) {
  useEffect(() => {
    if (!active) return undefined;
    const refList = Array.isArray(refs) ? refs : [refs];
    const onPointerDown = (event) => {
      const insideAny = refList.some((ref) => ref.current && ref.current.contains(event.target));
      if (!insideAny) handler(event);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [refs, active, handler]);
}
