import type { Config } from 'tailwindcss';

/**
 * Tailwind 只做「令牌到原子类」的映射，不持有任何原始色值。
 * 所有颜色必须指向 src/styles/tokens.css 里的 CSS 变量，
 * 这样切换 <html data-theme> 就能整体换肤（协议第七节）。
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* 基础色板 */
        ink: { DEFAULT: 'var(--hmw-ink)', deep: 'var(--hmw-ink-2)' },
        gold: { DEFAULT: 'var(--hmw-gold)', hi: 'var(--hmw-gold-hi)' },
        cinnabar: 'var(--hmw-cinnabar)',
        paper: 'var(--hmw-paper)',
        jade: 'var(--hmw-jade)',

        /* 语义令牌：组件只允许使用这一组 */
        bg: 'var(--hmw-bg)',
        surface: { DEFAULT: 'var(--hmw-surface)', raised: 'var(--hmw-surface-2)' },
        content: { DEFAULT: 'var(--hmw-text)', muted: 'var(--hmw-text-muted)' },
        line: { DEFAULT: 'var(--hmw-border)', strong: 'var(--hmw-border-strong)' },
        accent: {
          DEFAULT: 'var(--hmw-accent)',
          hi: 'var(--hmw-accent-hi)',
          ink: 'var(--hmw-accent-ink)',
        },
        danger: 'var(--hmw-danger)',
        spirit: 'var(--hmw-spirit)',
        focus: 'var(--hmw-focus)',
        overlay: 'var(--hmw-overlay)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      borderRadius: {
        sm: 'var(--hmw-radius-sm)',
        md: 'var(--hmw-radius-md)',
        lg: 'var(--hmw-radius-lg)',
        scroll: 'var(--radius-scroll)',
      },
      boxShadow: {
        seal: 'var(--shadow-seal)',
        panel: 'var(--hmw-shadow-1)',
      },
      borderWidth: {
        token: 'var(--hmw-border-w)',
      },
      spacing: {
        nav: 'var(--hmw-nav-h)',
        sidebar: 'var(--hmw-sidebar-w)',
        'sidebar-collapsed': 'var(--hmw-sidebar-w-collapsed)',
      },
      transitionDuration: {
        fast: 'var(--hmw-duration-fast)',
        base: 'var(--hmw-duration-base)',
      },
      maxWidth: {
        page: 'var(--hmw-page-max)',
      },
    },
  },
  plugins: [],
};

export default config;
