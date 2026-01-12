import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'custom-dark': '#313647',
        'custom-slate': '#435663',
        'custom-green': '#A3B087',
        'custom-cream': '#FFF8D4',
      },
    },
  },
  plugins: [],
};

export default config;