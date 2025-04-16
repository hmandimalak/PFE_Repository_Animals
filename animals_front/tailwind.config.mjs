/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Add this line
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {

        primary: '#6A89A7',    // Main brand color
        secondary: '#BDDDFC',   // Light background/container
        accent: '#88BDF2',      // Interactive elements
        dark: '#384959',        // Dark text/headers
      },
    },
  },

  plugins: [],
};