// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
		arial: ['Arial', 'Helvetica', 'sans-serif'],
		'arial-black': ['"Arial Black"', 'sans-serif'],
		'comic-sans': ['"Comic Sans MS"', '"Comic Neue"', 'cursive'],
		courier: ['"Courier New"', 'Courier', 'monospace'],
		georgia: ['Georgia', 'serif'],
		impact: ['Impact', 'Charcoal', 'sans-serif'],
		tahoma: ['Tahoma', 'Geneva', 'sans-serif'],
		times: ['"Times New Roman"', 'Times', 'serif'],
		trebuchet: ['"Trebuchet MS"', 'sans-serif'],
		verdana: ['Verdana', 'Geneva', 'sans-serif'],
		
		montserrat: ['var(--font-montserrat)', 'sans-serif'],
		vazir: ['var(--font-vazir)', 'Vazirmatn', 'Tahoma', 'sans-serif'],
		iranSans: ['IRANSans', 'Tahoma', 'sans-serif'],
		yekan: ['Yekan', 'Tahoma', 'sans-serif'],
		
		sans: [
			'var(--font-vazir)',
			'Vazirmatn',
			'var(--font-montserrat)',
			'Montserrat',
			'sans-serif',
		],
		},
      colors: {
        red: '#E14048',
        background: '#BBB8AF',
        black: '#0F1217',
        cardWhite: '#E2E0D1',
        gradWhite: '#A5918A',
        white: '#FFFFFF',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;