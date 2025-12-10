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
		fontFamily: {
        sans: [
          'var(--font-geist-sans)', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'sans-serif'
        ],
        vazir: ['Vazir', 'Tahoma', 'sans-serif'],
      	},
  		colors: {
  			red: '#E14048',
			background: '#BBB8AF',
  			black: '#0F1217',
  			cardWhite: '#E2E0D1',
			gradWhite:'#A5918A',
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
  plugins: [require("tailwindcss-animate")],
};

export default config;
