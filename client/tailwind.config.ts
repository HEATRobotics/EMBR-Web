import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      height: {
        // utility class `h-nav-content` -> calc(100vh - var(--nav-height))
        'nav-content': 'calc(100vh - var(--nav-height))',
      },
      colors: {
        // Brand palette
        brand: {
          black: '#2C2C2C',
          gold: '#D39831',
          blue: '#002145',
          orange: '#EE2C24',
          white: '#F4F4F4',
        },

        // Override the orange scale to align with brand orange-red
        // Keep DEFAULT so classes like `text-orange` continue to work
        orange: {
          50: '#FFF1F0',
          100: '#FDEAEA',
          200: '#FAC6C3',
          300: '#F59A96',
          400: '#F06E69',
          500: '#F04A43',
          600: '#EE2C24', // brand primary
          700: '#C5221B',
          800: '#991A14',
          900: '#7A150F',
          950: '#410A08',
          DEFAULT: '#EE2C24',
        },
      },
    },
  },
  plugins: [],
};
export default config;
