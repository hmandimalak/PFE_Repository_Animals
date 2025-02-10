/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#FAD0C4',
        'pastel-blue': '#A9C8D8',
        'pastel-green': '#A8E6CF',
        'pastel-yellow': '#FFD700',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
 
  
  plugins: [],
};
