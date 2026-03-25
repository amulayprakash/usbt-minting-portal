/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: '#07070e',
        surface: {
          DEFAULT: '#0d0d1a',
          1: '#12121f',
          2: '#16162a',
        },
        cyan: {
          350: '#3dd5e8',
          450: '#0ec9e5',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5)',
        card: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'accent-glow': '0 0 24px rgba(6,182,212,0.18), inset 0 1px 0 rgba(6,182,212,0.15)',
        'accent-ring': '0 0 0 3px rgba(6,182,212,0.12)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 3.5s infinite',
        'spin-slow': 'spin 24s linear infinite',
        'spin-reverse': 'spinReverse 18s linear infinite',
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-ring': 'pulseRing 2.5s ease-out infinite',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'counter-in': 'counterIn 0.8s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-16px) rotate(1deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-0.5deg)' },
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        counterIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
