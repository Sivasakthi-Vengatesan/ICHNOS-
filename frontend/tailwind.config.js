/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F4F1E8",
        structural: "#111111",
        surface: "#FFFFFF",
        mutedPaper: "#E6E2D8",
        mutedText: "#66635D",
        verified: "#168A52",
        violated: "#D02020",
        unknown: "#D49A00",
        lineage: "#2457C5",
        accent: "#DDE51A",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'bauhaus-sm': '2px 2px 0px 0px #111111',
        'bauhaus': '4px 4px 0px 0px #111111',
        'bauhaus-lg': '8px 8px 0px 0px #111111',
        'bauhaus-red': '4px 4px 0px 0px #D02020',
        'bauhaus-green': '4px 4px 0px 0px #168A52',
        'bauhaus-yellow': '4px 4px 0px 0px #DDE51A',
        'bauhaus-blue': '4px 4px 0px 0px #2457C5',
      },
      borderRadius: {
        none: '0px',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
