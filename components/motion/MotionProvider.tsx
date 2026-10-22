'use client';

import { useEffect } from 'react';
import { initEnv, initScroll } from '@/lib/motion';

/** Starts the shared motion engines once. Renders nothing. */
export default function MotionProvider() {
  useEffect(() => {
    initEnv();
    initScroll();
  }, []);
  return null;
}
