import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'tract-green':        '#2D5016',
        'tract-green-light':  '#EAF3DE',
        'tract-gold':         '#D4AF37',
        'tract-gold-light':   '#FFF8E7',
        'tract-obsidian':     '#0B0E11',
        'tract-graphite':     '#2C2C2E',
        'tract-alabaster':    '#F5F5F1',
        'tract-red':          '#C0392B',
        'tract-red-light':    '#FDECEA',
        'tract-orange':       '#E67E22',
        'tract-rose':         '#B76E79',
        'tract-burgundy':     '#6B1F2A',
        // shadcn tokens (keep these — shadcn components need them)
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter:    ['Inter', 'sans-serif'],
        dancing:  ['"Dancing Script"', 'cursive'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%':     { transform: 'translateX(-6px)' },
          '40%':     { transform: 'translateX(6px)' },
          '60%':     { transform: 'translateX(-4px)' },
          '80%':     { transform: 'translateX(4px)' },
        },
        'slide-in': {
          '0%':    { opacity: '0', transform: 'translateY(-8px)' },
          '100%':  { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ping-once': {
          '0%':       { transform: 'scale(1)',   opacity: '1' },
          '75%,100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'compliance-orbit': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'compliance-bar-flow': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shake:            'shake 0.4s ease-in-out',
        'slide-in':       'slide-in 0.2s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
        'ping-once':      'ping-once 0.6s ease-out forwards',
        'compliance-orbit': 'compliance-orbit 10s linear infinite',
        'compliance-bar-flow': 'compliance-bar-flow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
