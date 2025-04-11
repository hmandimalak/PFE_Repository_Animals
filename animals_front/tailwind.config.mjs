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
<<<<<<< HEAD
        'pastel-pink': '#EBE3F5',
        'pastel-blue': '#A5C4D4',
        'pastel-green': '#A8E6CF',
        'pastel-yellow': '#FFD700',
        "pastel-purple": "#CABBE9",
        "pastel-purple-dark": "#A89EC9",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },

 
  
=======
        primary: '#6A89A7',    // Main brand color
        secondary: '#BDDDFC',   // Light background/container
        accent: '#88BDF2',      // Interactive elements
        dark: '#384959',        // Dark text/headers
      },
    },
  },
>>>>>>> b933fadcf0c868458d290d45f107c9c34431fe2a
  plugins: [],
};