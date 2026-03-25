'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface ColorState {
  r: number;
  g: number;
  b: number;
}

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const lastRipplePosRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const blobsRef = useRef<Blob[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number>(0);
  const colorRef = useRef<ColorState>({ r: 6, g: 182, b: 212 });

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const init = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;

      const count = Math.min(80, Math.floor((W * H) / 11000));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.8 + 0.8, // larger dots: 0.8–2.6px
      }));

      const base = Math.min(W, H);
      blobsRef.current = [
        { x: W * 0.12, y: H * 0.28, vx: 0.14,  vy: 0.09,  size: base * 0.65, phase: 0   },
        { x: W * 0.82, y: H * 0.18, vx: -0.11, vy: 0.13,  size: base * 0.52, phase: 2.1 },
        { x: W * 0.52, y: H * 0.78, vx: 0.09,  vy: -0.11, size: base * 0.48, phase: 4.2 },
      ];
    };

    init();

    const onResize = () => init();

    const onMouseMove = (e: MouseEvent) => {
      const mx = e.clientX;
      const my = e.clientY;
      mouseRef.current = { x: mx, y: my };

      const lx = lastRipplePosRef.current.x;
      const ly = lastRipplePosRef.current.y;
      const dist = Math.sqrt((mx - lx) ** 2 + (my - ly) ** 2);

      if (dist >= 72) {
        lastRipplePosRef.current = { x: mx, y: my };
        ripplesRef.current.push({
          x: mx,
          y: my,
          radius: 0,
          maxRadius: 48 + Math.random() * 20,
          alpha: 1,
        });
        if (ripplesRef.current.length > 18) {
          ripplesRef.current.splice(0, ripplesRef.current.length - 18);
        }
      }
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    let t = 0;

    const frame = () => {
      t += 0.004;
      const isDark = themeRef.current === 'dark';

      // Lerp accent color between themes
      // Dark: cyan-500 (6,182,212)  |  Light: deep navy-teal (7,89,133) — high contrast on pale canvas
      const targetR = isDark ? 6  : 7;
      const targetG = isDark ? 182 : 89;
      const targetB = isDark ? 212 : 133;
      const c = colorRef.current;
      c.r += (targetR - c.r) * 0.05;
      c.g += (targetG - c.g) * 0.05;
      c.b += (targetB - c.b) * 0.05;
      const R = Math.round(c.r);
      const G = Math.round(c.g);
      const B = Math.round(c.b);

      ctx.clearRect(0, 0, W, H);

      // Light mode: subtle tinted wash so particles/lines read against the pale canvas
      if (!isDark) {
        ctx.fillStyle = 'rgba(7, 89, 133, 0.028)';
        ctx.fillRect(0, 0, W, H);
      }

      // ── Soft drifting blob orbs ───────────────────────────────────────────
      const blobAlpha = isDark ? 0.12 : 0.08; // boosted in light mode

      for (const blob of blobsRef.current) {
        blob.x += blob.vx + Math.sin(t + blob.phase) * 0.35;
        blob.y += blob.vy + Math.cos(t + blob.phase * 0.8) * 0.28;

        const pad = blob.size * 0.4;
        if (blob.x < -pad) blob.vx =  Math.abs(blob.vx);
        if (blob.x > W + pad) blob.vx = -Math.abs(blob.vx);
        if (blob.y < -pad) blob.vy =  Math.abs(blob.vy);
        if (blob.y > H + pad) blob.vy = -Math.abs(blob.vy);

        const g = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.size / 2);
        g.addColorStop(0,   `rgba(${R}, ${G}, ${B}, ${blobAlpha})`);
        g.addColorStop(0.5, `rgba(${R}, ${G}, ${B}, ${blobAlpha * 0.35})`);
        g.addColorStop(1,   `rgba(${R}, ${G}, ${B}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Ripples ───────────────────────────────────────────────────────────
      const ripplePeakAlpha = isDark ? 0.30 : 0.22;
      const ripples = ripplesRef.current;

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const progress = rp.radius / rp.maxRadius;
        const speed    = (1 - progress) * 2.2 + 0.4;
        rp.radius += speed;

        if (progress < 0.3) {
          rp.alpha = progress / 0.3;
        } else {
          rp.alpha = 1 - (progress - 0.3) / 0.7;
        }

        if (rp.radius >= rp.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${R}, ${G}, ${B}, ${rp.alpha * ripplePeakAlpha})`;
        ctx.lineWidth   = 1.0;
        ctx.stroke();
      }

      // ── Particle constellation ────────────────────────────────────────────
      const particles   = particlesRef.current;
      const connectDist  = 140;
      const mouseRadius  = 110;
      // Prominent dot & line values
      const dotAlpha     = isDark ? 0.45 : 0.55;
      const lineAlphaMax = isDark ? 0.18 : 0.28;
      const mouse        = mouseRef.current;

      // Glow settings — drawn with shadow, then cleared so ripples aren't affected
      const glowColor = `rgba(${R}, ${G}, ${B}, 1)`;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gentle mouse attraction
        if (mouse.x > 0) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < mouseRadius && d > 1) {
            const force = ((mouseRadius - d) / mouseRadius) * 0.013;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }

        p.vx *= 0.984;
        p.vy *= 0.984;
        p.x  += p.vx;
        p.y  += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Connection lines (no glow — keeps them subtle)
        for (let j = i + 1; j < particles.length; j++) {
          const p2  = particles[j];
          const ldx = p.x - p2.x;
          const ldy = p.y - p2.y;
          const ld  = Math.sqrt(ldx * ldx + ldy * ldy);

          if (ld < connectDist) {
            const a = (1 - ld / connectDist) * lineAlphaMax;
            ctx.beginPath();
            ctx.moveTo(p.x,  p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${R}, ${G}, ${B}, ${a})`;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }

        // Glowing dot — core + bloom
        ctx.shadowBlur  = isDark ? 6 : 4;
        ctx.shadowColor = glowColor;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${dotAlpha})`;
        ctx.fill();

        // Reset shadow so lines in next iteration aren't bloomed
        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden
    />
  );
}
