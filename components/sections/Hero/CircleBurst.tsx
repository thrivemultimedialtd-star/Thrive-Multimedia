'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { env, subscribe } from '@/lib/motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number; // seconds remaining
  total: number;
  ring?: boolean;
}

const COLORS = ['#7fb53f', '#6a9a36', '#24391a', '#232323', '#c9b79c'];
const MAX = 160;

/**
 * Click or tap anywhere in the hero (not on links or buttons) and a burst of
 * circles (the site's motif) flies out from that point and fades.
 */
export default function CircleBurst({ area, className, onBurst }: { area: RefObject<HTMLElement | null>; className?: string; onBurst?: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(onBurst);
  useEffect(() => {
    burstRef.current = onBurst;
  }, [onBurst]);

  useEffect(() => {
    const cv = canvas.current;
    const host = area.current;
    if (!cv || !host || env.reducedMotion) return;
    const ctx = cv.getContext('2d')!;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = host.clientWidth;
      h = host.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let particles: Particle[] = [];
    let stop: (() => void) | null = null;
    let bursts = 0;

    const tick = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      particles = particles.filter((p) => (p.life -= dt) > 0);
      for (const p of particles) {
        const t = p.life / p.total; // 1 → 0
        if (p.ring) {
          const r = p.r + (1 - t) * 140;
          ctx.globalAlpha = t * 0.6;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.stroke();
          continue;
        }
        p.vx *= Math.exp(-2.2 * dt);
        p.vy = p.vy * Math.exp(-2.2 * dt) + 520 * dt; // light gravity
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.min(1, t * 1.6);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r * (0.35 + 0.65 * t)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!particles.length && stop) {
        stop();
        stop = null;
      }
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (target.closest('a, button, input, textarea, label, [role="button"]')) return;
      const box = host.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const n = 14 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 220 + Math.random() * 420;
        const life = 0.9 + Math.random() * 0.4;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 180, // slight upward bias
          r: 4 + Math.random() * 12,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life,
          total: life,
        });
      }
      // Every third burst, an iris ring echoes the site's transitions.
      if (++bursts % 3 === 1) particles.push({ x, y, vx: 0, vy: 0, r: 12, color: '#6a9a36', life: 0.9, total: 0.9, ring: true });
      if (particles.length > MAX) particles = particles.slice(-MAX);
      stop ??= subscribe(tick);
      burstRef.current?.();
    };
    host.addEventListener('pointerdown', onDown);
    return () => {
      host.removeEventListener('pointerdown', onDown);
      ro.disconnect();
      stop?.();
    };
  }, [area]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
