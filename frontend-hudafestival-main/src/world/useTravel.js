import { useEffect, useMemo, useRef } from 'react';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Pointer / wheel → camera steering.
// Desktop (hover): absolute cursor position maps to steer velocity (centre =
// slow, edge = fast) and vertical position to camera pitch.
// Touch / drag: movement delta steers, release recentres.
// Wheel always nudges the journey for direct control.
export function useTravel() {
  const controls = useRef({
    nx: 0,
    ny: 0,
    active: false,
    boost: 0,
    wheelDelta: 0,
    onHud: null,
    _acc: 0,
  });

  useEffect(() => {
    let lastX = null;
    let lastY = null;

    const onMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = e.clientX;
      const y = e.clientY;

      if (e.pointerType === 'touch' || e.buttons) {
        if (lastX !== null) {
          controls.current.nx = clamp((x - lastX) / 36, -1, 1);
          controls.current.ny = clamp(-(y - lastY) / 36, -1, 1);
        }
      } else {
        controls.current.nx = (x / w) * 2 - 1;
        controls.current.ny = (y / h) * 2 - 1;
      }
      lastX = x;
      lastY = y;
    };

    const onDown = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      lastX = null;
      lastY = null;
      controls.current.nx = 0;
      controls.current.ny = 0;
    };
    const onWheel = (e) => {
      controls.current.wheelDelta += -e.deltaY * 0.00035;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  const api = useMemo(
    () => ({
      controls,
      setActive: (v) => {
        controls.current.active = v;
      },
      triggerBoost: (sec = 1.1) => {
        controls.current.boost = sec;
        controls.current.active = true;
      },
    }),
    []
  );

  return api;
}
