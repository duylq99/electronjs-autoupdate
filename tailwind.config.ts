import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/src/**/*.{ts,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        canvas: 'var(--color-canvas)',
        'inverse-canvas': 'var(--color-inverse-canvas)',
        'surface-soft': 'var(--color-surface-soft)',
        hairline: 'var(--color-hairline)',
        'hairline-soft': 'var(--color-hairline-soft)',
        ink: 'var(--color-ink)',
        'inverse-ink': 'var(--color-inverse-ink)',
        'accent-magenta': 'var(--color-accent-magenta)',
        'block-lime': 'var(--color-block-lime)',
        'block-lilac': 'var(--color-block-lilac)',
        'block-cream': 'var(--color-block-cream)',
        'block-mint': 'var(--color-block-mint)',
        'block-pink': 'var(--color-block-pink)',
        'block-coral': 'var(--color-block-coral)',
        'block-navy': 'var(--color-block-navy)',
        'semantic-success': 'var(--color-semantic-success)'
      },
      borderRadius: {
        xs: '2px',
        sm: '6px',
        md: '8px',
        lg: '24px',
        xl: '32px',
        pill: '50px',
        full: '9999px'
      },
      spacing: {
        hair: '1px',
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        section: '96px'
      },
      fontFamily: {
        sans: ['Google Sans', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'JetBrains Mono Fallback', 'SF Mono', 'Menlo', 'monospace']
      },
      fontSize: {
        'display-xl': ['86px', { lineHeight: '1.00', letterSpacing: '-1.72px' }],
        'display-lg': ['64px', { lineHeight: '1.10', letterSpacing: '-0.96px' }],
        headline: ['26px', { lineHeight: '1.35', letterSpacing: '-0.26px' }],
        subhead: ['26px', { lineHeight: '1.35', letterSpacing: '-0.26px' }],
        'card-title': ['24px', { lineHeight: '1.45', letterSpacing: '0' }],
        'body-lg': ['20px', { lineHeight: '1.40', letterSpacing: '-0.14px' }],
        body: ['18px', { lineHeight: '1.45', letterSpacing: '-0.26px' }],
        'body-sm': ['16px', { lineHeight: '1.45', letterSpacing: '-0.14px' }],
        link: ['20px', { lineHeight: '1.40', letterSpacing: '-0.10px' }],
        button: ['20px', { lineHeight: '1.40', letterSpacing: '-0.10px' }],
        eyebrow: ['18px', { lineHeight: '1.30', letterSpacing: '0.54px' }],
        caption: ['12px', { lineHeight: '1.00', letterSpacing: '0.60px' }]
      },
      fontWeight: {
        '320': '320',
        '330': '330',
        '340': '340',
        '400': '400',
        '480': '480',
        '540': '540'
      },
      maxWidth: {
        content: '1280px'
      }
    }
  },
  plugins: []
} satisfies Config
