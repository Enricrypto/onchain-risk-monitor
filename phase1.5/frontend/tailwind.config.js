/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#121212',
        'bg-elevated': '#1a1a1a',
        'bg-card': '#141414',

        // Border colors
        'border-subtle': 'rgba(255, 255, 255, 0.1)',
        'border-default': 'rgba(255, 255, 255, 0.15)',
        'border-hover': 'rgba(255, 255, 255, 0.25)',

        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'text-muted': 'rgba(255, 255, 255, 0.5)',

        // Accent colors
        'accent-purple': '#8b5cf6',
        'accent-violet': '#7c3aed',
        'accent-orange': '#f59e0b',
        'accent-amber': '#d97706',
        'accent-teal': '#14b8a6',
        'accent-cyan': '#06b6d4',

        // Status colors
        'status-healthy': '#22c55e',
        'status-warning': '#f59e0b',
        'status-critical': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-purple-orange': 'linear-gradient(135deg, #7c3aed, #f59e0b)',
        'gradient-teal-purple': 'linear-gradient(135deg, #14b8a6, #8b5cf6)',
        'gradient-purple-cyan': 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-radial-glow': 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-orange': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-healthy': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-critical': '0 0 20px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
