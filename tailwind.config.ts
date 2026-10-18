import type { Config } from "tailwindcss";

/* ═══════════════════════════════════════════════════════════════════════════
   SORMALITICS PALETTE OVERRIDE
   ───────────────────────────────────────────────────────────────────────────
   The app carries ~21,000 Tailwind colour-class usages accumulated before the
   rebrand (bg-blue-600, text-gray-500, border-emerald-200, …). Rather than
   rewrite every one of those call sites — a many-thousand-line diff with real
   regression risk — we REDEFINE the underlying colour families so every
   existing class resolves to a brand colour.

   The brand runs on two hues, per the SORMALITICS brand sheet:

     INK    (navy, from the owl's body)  — chrome, primary actions, positive
                                           and informational states
     AURUM  (gold, from the coin eyes)   — attention: warnings, destructive
                                           actions, overdue, anything that
                                           wants the eye

   Everything that used to be blue / indigo / sky / violet / purple / cyan /
   green / emerald / teal / lime now resolves to INK.
   Everything that used to be yellow / amber / orange resolves to AURUM.
   Everything that used to be red / rose / pink resolves to the DEEP end of
   AURUM — shifted darker so a destructive control still reads distinctly
   heavier than a warning badge sitting next to it.

   Greys (gray / slate / zinc / neutral / stone) resolve to a warm, faintly
   navy-tinted neutral ramp so surfaces sit on the parchment field instead of
   fighting it with cool blue-grey, and `white` is a hair warm for the same
   reason. True #ffffff is still reachable via arbitrary values.

   ── Reversing this ─────────────────────────────────────────────────────────
   Delete the PALETTE object and the families that spread it inside
   theme.extend.colors. Nothing else in the codebase depends on it; every
   class name goes back to stock Tailwind.
   ═════════════════════════════════════════════════════════════════════════ */

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

/* Warm, navy-tinted neutral ramp. Replaces gray / slate / zinc / neutral /
   stone. Light steps lean parchment, dark steps lean ink, so the ramp reads
   as one material from background to body copy. */
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

/* Destructive / negative. The deep end of AURUM, shifted two steps darker than
   the warning ramp so "delete" and "overdue" never read as the same weight as
   "due soon". */
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
      // ─── Design tokens ──────────────────────────────────────────────────
      colors: {
        // ── Palette override: legacy families → brand ramps ───────────────
        blue: INK, indigo: INK, sky: INK, violet: INK, purple: INK,
        cyan: INK, fuchsia: INK, teal: INK,
        green: INK, emerald: INK, lime: INK,

        yellow: AURUM, amber: AURUM, orange: AURUM,

        red: AURUM_DEEP, rose: AURUM_DEEP, pink: AURUM_DEEP,

        gray: SAND, slate: SAND, zinc: SAND, neutral: SAND, stone: SAND,

        // Warm white so cards sit on the parchment field rather than punching
        // a cold hole in it. True white remains available as `bg-[#fff]`.
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
        // ── SORMALITICS brand ──────────────────────────────────────────────
        // ink   = the owl mark's navy    aurum = its gold
        // parchment = the cream field the mark sits on
        ink: { DEFAULT: "#143152", ...INK },
        aurum: { DEFAULT: "#C9A227", ...AURUM },
        parchment: { DEFAULT: "#FBF7EA", ...PARCHMENT },
        sand: { DEFAULT: "#666B72", ...SAND },

        // ── Module colours ────────────────────────────────────────────────
        payroll: {
          DEFAULT: "#2B5480",   // ink
          50:  "#EEF3F9",
          100: "#D6E2EF",
          200: "#ADC4DC",
          300: "#7D9CC0",
          400: "#4B71A0",
          500: "#2B5480",       // primary
          600: "#1B3F66",
          700: "#143152",
          800: "#0F2540",
          900: "#0A1B2F",
        },
        reporting: {
          DEFAULT: "#3F7EA8",   // ink-teal
          50:  "#EEF6FA",
          100: "#D6EAF3",
          200: "#AED4E6",
          300: "#7FB6D2",
          400: "#5896BC",
          500: "#3F7EA8",       // primary
          600: "#2F6389",
          700: "#254D6C",
          800: "#1B3A52",
          900: "#12283A",
        },
        invoice: {
          DEFAULT: "#C9A227",   // aurum
          50:  "#FDF9EC",
          100: "#FAF0CE",
          200: "#F4E19C",
          300: "#EBCE68",
          400: "#D9B441",
          500: "#C9A227",       // primary
          600: "#A8831D",
          700: "#836318",
          800: "#5F471A",
          900: "#422F14",
        },
        agreement: {
          DEFAULT: "#8A6A34",   // bronze
          50:  "#FAF5EC",
          100: "#F1E7D2",
          200: "#E2CDA6",
          300: "#CFAF76",
          400: "#B08F4E",
          500: "#8A6A34",       // primary
          600: "#6E5429",
          700: "#544020",
          800: "#3C2E17",
          900: "#261D0F",
        },
        payslip: {
          DEFAULT: "#4B71A0",   // ink pale
          50:  "#F2F6FB",
          100: "#E1EAF4",
          200: "#C2D3E7",
          300: "#9BB6D3",
          400: "#7091BC",
          500: "#4B71A0",       // primary
          600: "#3A5B84",
          700: "#2C4667",
          800: "#20334B",
          900: "#152233",
        },
      },

      // ─── Typography ───────────────────────────────────────────────────
      fontFamily: {
        sans:  ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:  ["var(--font-dm-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        outfit:  ["var(--font-outfit)", "sans-serif"],
        "dm-mono": ["var(--font-dm-mono)", "monospace"],
        // `font-syne` is used as a class in ~10 dashboard/legal pages but was
        // never declared here, so it compiled to nothing and those pages fell
        // back to inherited body type. Points at the same next/font Outfit face.
        syne:  ["var(--font-syne)", "var(--font-outfit)", "sans-serif"],
      },

      // ─── Sidebar / layout tokens ─────────────────────────────────────
      width: {
        sidebar: "280px",
        "sidebar-collapsed": "72px",
      },

      // ─── Animation ───────────────────────────────────────────────────
      transitionProperty: {
        sidebar: "width, transform, opacity",
      },
    },
  },
  plugins: [],
} satisfies Config;
