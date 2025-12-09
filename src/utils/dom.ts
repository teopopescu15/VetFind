// Utility helpers for DOM operations used only on web
export function blurActiveElementIfWeb(): void {
  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    try {
      document.activeElement.blur();
    } catch (e) {
      // ignore errors
    }
  }
}

export default blurActiveElementIfWeb;

// Detect aria-hidden overlays that cover (or nearly cover) the viewport and disable pointer events
// This is a defensive web-only workaround to prevent invisible overlays from blocking scroll.
export function disableBlockingAriaHiddenOverlays(): () => void {
  if (typeof document === 'undefined') return () => {};

  const overlays = Array.from(document.querySelectorAll('[aria-hidden="true"]')) as HTMLElement[];
  const toRestore: { el: HTMLElement; pointer?: string; visibility?: string; display?: string }[] = [];

  overlays.forEach((el) => {
    try {
      const r = el.getBoundingClientRect();
      const coversWidth = r.width >= (window.innerWidth - 2);
      const coversHeight = r.height >= (window.innerHeight - 2);
      const isFixedOrAbsolute = getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'absolute';

      if ((coversWidth && coversHeight) || isFixedOrAbsolute) {
        // save current styles
        toRestore.push({ el, pointer: el.style.pointerEvents, visibility: el.style.visibility, display: el.style.display });
        // disable interaction and hide visually
        el.style.pointerEvents = 'none';
        // keep visibility but ensure it doesn't trap interactions; also set display none if it's visible
        if (getComputedStyle(el).display !== 'none') {
          el.style.display = 'none';
        }
        el.style.visibility = 'hidden';
      }
    } catch (e) {
      // ignore
    }
  });

  // return a restore function to re-enable overlays if needed
  return () => {
    toRestore.forEach(({ el, pointer, visibility, display }) => {
      try {
        if (pointer !== undefined) el.style.pointerEvents = pointer;
        if (visibility !== undefined) el.style.visibility = visibility;
        if (display !== undefined) el.style.display = display;
      } catch (e) {
        // ignore
      }
    });
  };
}
