import type { Config } from "tailwindcss";

const INK = {
  50:  "#EEF3F9",
  100: "#D6E2EF",
  200: "#ADC4DC",
  300: "#7D9CC0",
  400: "#4B71A0",
  500: "#2B5480",
  600: "#1B3F66",
  700: "#143152",
  800: "#0F2540",
  900: "#0A1B2F",
  950: "#060F1B",
} as const;

const AURUM = {
  50:  "#FDF9EC",
  100: "#FAF0CE",
  200: "#F4E19C",
  300: "#EBCE68",
  400: "#D9B441",
  500: "#C9A227",
  600: "#A8831D",
  700: "#836318",
  800: "#5F471A",
  900: "#422F14",
  950: "#2A1E0D",
} as const;

const PARCHMENT = {
  50:  "#FFFDF8",
  100: "#FBF7EA",
  200: "#F4EDD9",
  300: "#E8DDBF",
  400: "#D9CBA4",
  500: "#C4B287",
  600: "#A8956B",
  700: "#877654",
  800: "#635740",
  900: "#42392A",
} as const;

const SAND = {
  50:  "#FAF8F3",
  100: "#F1EEE6",
  200: "#E1DED4",
  300: "#C6C4BB",
  400: "#A0A2A2",
  500: "#666B72",
  600: "#5C616A",
  700: "#444A55",
  800: "#2F3540",
  900: "#1D222C",
  950: "#11151D",
} as const;

const AURUM_DEEP = {
  50:  "#F4E19C",
  100: "#EBCE68",
  200: "#D9B441",
  300: "#C9A227",
  400: "#A8831D",
  500: "#836318",
  600: "#5F471A",
  700: "#4C3915",
  800: "#422F14",
  900: "#2A1E0D",
  950: "#1C1409",
} as const;

export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    
  ],
  theme: {
    extend: {
      colors: {
        blue: INK, indigo: INK, sky: INK, violet: INK, purple: INK,
        cyan: INK, fuchsia: INK, teal: INK,
        green: INK, emerald: INK, lime: INK,

        yellow: AURUM, amber: AURUM, orange: AURUM,

        red: AURUM_DEEP, rose: AURUM_DEEP, pink: AURUM_DEEP,

        gray: SAND, slate: SAND, zinc: SAND, neutral: SAND, stone: SAND,

        white: "#FFFDF8",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        ink: { DEFAULT: "#143152", ...INK },
        aurum: { DEFAULT: "#C9A227", ...AURUM },
        parchment: { DEFAULT: "#FBF7EA", ...PARCHMENT },
        sand: { DEFAULT: "#666B72", ...SAND },

        payroll: {
          DEFAULT: "#2B5480",
          50:  "#EEF3F9",
          100: "#D6E2EF",
          200: "#ADC4DC",
          300: "#7D9CC0",
          400: "#4B71A0",
          500: "#2B5480",
          600: "#1B3F66",
          700: "#143152",
          800: "#0F2540",
          900: "#0A1B2F",
        },
        reporting: {
          DEFAULT: "#3F7EA8",
          50:  "#EEF6FA",
          100: "#D6EAF3",
          200: "#AED4E6",
          300: "#7FB6D2",
          400: "#5896BC",
          500: "#3F7EA8",
          600: "#2F6389",
          700: "#254D6C",
          800: "#1B3A52",
          900: "#12283A",
        },
        invoice: {
          DEFAULT: "#C9A227",
          50:  "#FDF9EC",
          100: "#FAF0CE",
          200: "#F4E19C",
          300: "#EBCE68",
          400: "#D9B441",
          500: "#C9A227",
          600: "#A8831D",
          700: "#836318",
          800: "#5F471A",
          900: "#422F14",
        },
        agreement: {
          DEFAULT: "#8A6A34",
          50:  "#FAF5EC",
          100: "#F1E7D2",
          200: "#E2CDA6",
          300: "#CFAF76",
          400: "#B08F4E",
          500: "#8A6A34",
          600: "#6E5429",
          700: "#544020",
          800: "#3C2E17",
          900: "#261D0F",
        },
        payslip: {
          DEFAULT: "#4B71A0",
          50:  "#F2F6FB",
          100: "#E1EAF4",
          200: "#C2D3E7",
          300: "#9BB6D3",
          400: "#7091BC",
          500: "#4B71A0",
          600: "#3A5B84",
          700: "#2C4667",
          800: "#20334B",
          900: "#152233",
        },
      },

      fontFamily: {
        sans:  ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:  ["var(--font-dm-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        outfit:  ["var(--font-outfit)", "sans-serif"],
        "dm-mono": ["var(--font-dm-mono)", "monospace"],
        syne:  ["var(--font-syne)", "var(--font-outfit)", "sans-serif"],
      },

      width: {
        sidebar: "280px",
        "sidebar-collapsed": "72px",
      },

      transitionProperty: {
        sidebar: "width, transform, opacity",
      },
    },
  },
  plugins: [],
} satisfies Config;
