import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const MIN_SWIPE_DISTANCE = 80;
const MAX_SWIPE_TIME_MS = 400;

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    // --- Touch events (mobile / touchscreen) ---
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    }

    function onTouchEnd(e: TouchEvent) {
      if (!start.current) return;
      const t = e.changedTouches[0];
      handleSwipeEnd(t.clientX, t.clientY);
    }

    // --- Pointer events (trackpad / mouse drag / pen) ---
    function onPointerDown(e: PointerEvent) {
      // Only track direct manipulation (touch or pen) and mouse/trackpad
      start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    }

    function onPointerUp(e: PointerEvent) {
      if (!start.current) return;
      handleSwipeEnd(e.clientX, e.clientY);
    }

    function handleSwipeEnd(endX: number, endY: number) {
      if (!start.current) return;
      const dx = endX - start.current.x;
      const dy = endY - start.current.y;
      const dt = Date.now() - start.current.t;
      start.current = null;

      if (dt > MAX_SWIPE_TIME_MS) return;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < MIN_SWIPE_DISTANCE) return;

      if (dx > 0) {
        navigate(-1); // swipe right → back
      } else {
        navigate(1); // swipe left → forward
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [navigate]);
}
