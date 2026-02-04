/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
        // TIER Colors
        tier: {
          S: '#FF7F7F',
          A: '#FFBF7F',
          B: '#FFDF7F',
          C: '#FFFF7F',
          D: '#BFFF7F',
          F: '#7FBFFF',
        },
        // Semantic
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
      },
      backgroundColor: {
        dark: {
          DEFAULT: '#121212',
          surface: '#1E1E1E',
          card: '#1E1E1E',
        },
      },
      textColor: {
        dark: {
          primary: '#FFFFFF',
          secondary: '#9E9E9E',
          disabled: '#757575',
        },
      },
    },
  },
  plugins: [],
};
