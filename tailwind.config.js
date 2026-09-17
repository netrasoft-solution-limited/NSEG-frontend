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
          // Gateway forest green (reference design palette). White text passes AA on it.
          DEFAULT: '#0B6E4F',
          deep: '#0B5A40',
          // The palette's dark-mode green, for small text on always-dark surfaces.
          tint: '#4FB68F',
          // Used as inline accent text (unlike DEFAULT/deep), so it flips to
          // a darker green in light mode for AA contrast against a light page.
          soft: 'rgb(var(--color-gate-soft) / <alpha-value>)',
        },
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        // Theme-aware accent (DEFAULT) plus fixed shades for the console's info badges and
        // notices, which previously referenced shades that didn't exist.
        sky: {
          DEFAULT: 'rgb(var(--color-sky) / <alpha-value>)',
          50: '#EAF2F5',
          100: '#D5E6EC',
          700: '#1F5F74',
          800: '#184B5C',
        },
        // Fixed warm off-white accent card color (ClosingCta) — unaffected by theme.
        cream: '#F8F7F2',
        // The console and workspaces use Tailwind's stock gray/emerald/amber/rose. They are
        // remapped to the Gateway palette (warm neutrals, forest green, gold, clay) so every
        // surface shares one set of colours. Text shades are tuned to keep AA on white.
        gray: {
          50: '#F8F7F2',
          100: '#F2F1EA',
          200: '#E3E1D6',
          300: '#CFCCBD',
          400: '#98A8A0',
          500: '#65756D',
          600: '#4F5F58',
          700: '#33443D',
          800: '#1C2A24',
          900: '#0D1A15',
          950: '#07100C',
        },
        emerald: {
          50: '#E9F4EF',
          100: '#D3EBE0',
          200: '#A8D6C2',
          300: '#7DC0A5',
          400: '#3E9C79',
          500: '#1C7A4E',
          600: '#0B6E4F',
          700: '#0B5A40',
          800: '#073D2C',
          900: '#052A1E',
        },
        amber: {
          50: '#FBF2E1',
          100: '#F6E4C2',
          200: '#EFD29C',
          300: '#E0B25C',
          400: '#D4A044',
          500: '#C9922F',
          600: '#A8781F',
          700: '#8A600D',
          800: '#6E4C0B',
          900: '#5E400C',
          950: '#3A2807',
        },
        rose: {
          50: '#FBEBE9',
          100: '#F7D8D4',
          200: '#F2C4BE',
          300: '#E58573',
          400: '#D25A4A',
          500: '#C23A2E',
          600: '#B3271E',
          700: '#9A2019',
          800: '#7E1A14',
          900: '#5F130F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        sora: ['Sora', '"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
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
