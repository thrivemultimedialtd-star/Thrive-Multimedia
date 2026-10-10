'use client';

import { useEffect, type RefObject } from 'react';
import { clamp, damp, env, observe, pointer, scroll, subscribe } from '@/lib/motion';

interface Layers {
  card: RefObject<HTMLElement | null>;
  frame: RefObject<HTMLElement | null>; // the container: rotates, moves half as much
  image: RefObject<HTMLElement | null>; // the picture: moves most, skews with velocity
  inner?: RefObject<HTMLElement | null>; // inside the picture: drifts toward the pointer
  meta?: RefObject<HTMLElement | null>; // the text: counter-moves slightly
}

const MAX_PUSH = 26; // px
const STIFFNESS = 140;
const DAMPING = 13;

/**
 * Pointer-evade physics for project compositions.
 * distance → force → target offset (away from the pointer) → spring toward the target.
 * Layers sample the same spring at different depths so the card feels layered, not rigid.
 */
export function useProjectPhysics({ card, frame, image, inner, meta }: Layers, intensity = 1) {
  useEffect(() => {
    const el = card.current;
    if (!el || env.reducedMotion) return;

    // Geometry cached in document space; updated on resize, never read per frame.
    const box = { x: 0, y: 0, w: 0, h: 0 };
    const measure = () => {
      const r = el.getBoundingClientRect();
      box.x = r.left + window.scrollX;
      box.y = r.top + window.scrollY;
      box.w = r.width;
      box.h = r.height;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();

    const s = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, ix: 0, iy: 0, tilt: 0 };
    let resting = true;

    const write = () => {
      const skew = clamp(s.vx * 0.004, -2.5, 2.5);
      if (image.current)
        image.current.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) skewX(${skew.toFixed(3)}deg)`;
      if (frame.current)
        frame.current.style.transform = `translate3d(${(s.x * 0.5).toFixed(2)}px, ${(s.y * 0.5).toFixed(2)}px, 0) rotate(${(s.rot + s.tilt).toFixed(3)}deg)`;
      if (meta?.current)
        meta.current.style.transform = `translate3d(${(-s.x * 0.3).toFixed(2)}px, ${(-s.y * 0.3).toFixed(2)}px, 0)`;
      if (inner?.current)
        inner.current.style.translate = `${s.ix.toFixed(2)}px ${s.iy.toFixed(2)}px`;
    };

    const tickDesktop = (dt: number) => {
      const left = box.x - window.scrollX;
      const top = box.y - window.scrollY;
      const cx = left + box.w / 2;
      const cy = top + box.h / 2;
      const dx = cx - pointer.x;
      const dy = cy - pointer.y;
      const d = Math.hypot(dx, dy) || 1;
      const radius = Math.hypot(box.w, box.h) / 2 + 140;
      const force = pointer.active ? clamp(1 - d / radius) ** 2 : 0;
      const inside =
        pointer.active && pointer.x > left && pointer.x < left + box.w && pointer.y > top && pointer.y < top + box.h;

      // Target: pushed away from the pointer, scaled by proximity.
      const tx = (dx / d) * force * MAX_PUSH * intensity;
      const ty = (dy / d) * force * MAX_PUSH * intensity;
      const trot = (dx / d) * force * -1.2 * intensity;

      // Semi-implicit spring.
      s.vx += (tx - s.x) * STIFFNESS * dt;
      s.vy += (ty - s.y) * STIFFNESS * dt;
      const k = Math.exp(-DAMPING * dt);
      s.vx *= k;
      s.vy *= k;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot = damp(s.rot, trot, 6, dt);

      // Inside the frame, the picture leans toward the pointer with damping (depth).
      const ix = inside ? ((pointer.x - cx) / box.w) * 18 : 0;
      const iy = inside ? ((pointer.y - cy) / box.h) * 18 : 0;
      s.ix = damp(s.ix, ix, 5, dt);
      s.iy = damp(s.iy, iy, 5, dt);

      const still =
        force === 0 &&
        Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.rot) + Math.abs(s.ix) + Math.abs(s.iy) <
          0.05;
      if (still) {
        if (!resting) {
          s.x = s.y = s.vx = s.vy = s.rot = s.ix = s.iy = 0;
          write();
          resting = true;
        }
        return;
      }
      resting = false;
      write();
    };

    // Touch devices: no pointer, so a gentle tilt from scroll velocity keeps the cards alive.
    const tickTouch = (dt: number) => {
      const target = clamp(scroll.velocity * -0.0006, -1.2, 1.2) * intensity;
      s.tilt = damp(s.tilt, target, 6, dt);
      if (Math.abs(s.tilt) < 0.005 && target === 0) {
        if (!resting) {
          s.tilt = 0;
          write();
          resting = true;
        }
        return;
      }
      resting = false;
      write();
    };

    let stopTick: (() => void) | null = null;
    const stopObs = observe(
      el,
      (e) => {
        if (e.isIntersecting && !stopTick) {
          measure();
          stopTick = subscribe(env.touch ? tickTouch : tickDesktop);
        } else if (!e.isIntersecting && stopTick) {
          stopTick();
          stopTick = null;
        }
      },
      '15% 0px 15% 0px',
    );

    return () => {
      ro.disconnect();
      stopObs();
      stopTick?.();
    };
  }, [card, frame, image, inner, meta, intensity]);
}
