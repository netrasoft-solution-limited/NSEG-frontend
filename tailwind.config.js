export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens: values come from CSS custom properties in
        // src/index.css, with dark-mode defaults in :root and light-mode
        // overrides under :root[data-theme="light"]. The rgb(var(..) / <alpha-value>)
        // form keeps Tailwind's opacity modifiers (e.g. bg-ink-800/70) working.
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          800: 'rgb(var(--color-ink-800) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
          600: 'rgb(var(--color-ink-600) / <alpha-value>)',
          500: 'rgb(var(--color-ink-500) / <alpha-value>)',
        },
        chalk: {
          DEFAULT: 'rgb(var(--color-chalk) / <alpha-value>)',
          muted: 'rgb(var(--color-chalk-muted) / <alpha-value>)',
          dim: 'rgb(var(--color-chalk-dim) / <alpha-value>)',
        },
        // Subtle divider/tint token: replaces literal white/NN opacity utilities
        // so hairlines read correctly against either theme's surface color.
        hairline: 'rgb(var(--color-hairline) / <alpha-value>)',
        gate: {
          // Fixed brand green: intentionally does NOT flip with theme, so
          // primary buttons/badges stay the same vivid color in both modes.
          // Nigerian flag green, matched to the NSEG logo.
          DEFAULT: '#008751',
          deep: '#006b40',
          // Lighter tint of the same green for small text on always-dark surfaces
          // (flag green alone falls just under AA there).
          tint: '#4cc38a',
          // Used as inline accent text (unlike DEFAULT/deep), so it flips to
          // a darker green in light mode for AA contrast against a light page.
          soft: 'rgb(var(--color-gate-soft) / <alpha-value>)',
        },
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        sky: 'rgb(var(--color-sky) / <alpha-value>)',
        // Fixed warm off-white accent card color (ClosingCta) — unaffected by theme.
        cream: '#f6f1e4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '1.75rem',
      },
      maxWidth: {
        shell: '1200px',
      },
    },
  },
  plugins: [],
}
