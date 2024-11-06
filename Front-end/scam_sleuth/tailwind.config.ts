// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        red: '#E14048',
        background: '#BBB8AF',
        black: '#0F1217',
        cardWhite: '#E2E0D1',
		white:'#FFFFFF'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
	  fontFamily: {
        sans: ['Montserrat'], 
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
