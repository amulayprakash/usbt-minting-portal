import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

export function useCountUp(
  target: number,
  inView: boolean,
  { duration = 1.6, decimals = 0, delay = 0 }: { duration?: number; decimals?: number; delay?: number } = {}
): string {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => {
      const controls = animate(0, target, {
        duration,
        ease: [0.32, 0.72, 0, 1],
        onUpdate(v) {
          setValue(v);
        },
      });
      return controls.stop;
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [inView, target, duration, decimals, delay]);

  if (decimals > 0) return value.toFixed(decimals);
  return Math.round(value).toLocaleString('en-US');
}
