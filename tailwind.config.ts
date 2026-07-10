import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

// All values from recly_complete_context.pdf v2.0 §04 (color) and §05 (type).
// Spacing uses Tailwind's default 4px scale, which covers the locked
// 4·8·12·16·24·32·48·64 steps (spacing-1/2/3/4/6/8/12/16).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // brand palette — green is signal only: scan line, dot, CTA
        ink: {
          DEFAULT: "#1A1A18", // brand/ink · text/primary
          secondary: "#8A877F", // text/secondary
          tertiary: "#C0BDB6", // text/tertiary
        },
        cream: "#FAF7F2", // brand/cream
        green: {
          DEFAULT: "#1A6B45", // brand/green
          light: "#D6EDE2", // brand/green-light — badge/pill fills
          dark: "#0F4A2E", // brand/green-dark — text on green-light
        },
        surface: {
          page: "#FAF7F2", // surface/page
          card: "#FFFFFF", // surface/card
          faint: "#F2EFE9", // surface/faint — input bgs
        },
        danger: {
          DEFAULT: "#C4544C", // text/danger
          bg: "#FDF0EF", // bg/danger
        },
        // category palette — in-product UI only (charts, tags, receipt rows).
        // Ten categories: addendum v1.1's nine plus pets (July 2026 expansion
        // to general household shopping); dining-out deliberately reuses the
        // text/secondary grey so it doesn't compete with food categories.
        category: {
          produce: "#4A9E6B",
          dairy: "#4A7EC4",
          meat: "#D4697A",
          bakery: "#E8A830",
          pantry: "#B08968",
          beverages: "#5FA8A0",
          snacks: "#E07840",
          household: "#8B6EC4",
          pets: "#C4915C", // muted terracotta
          "dining-out": "#8A877F",
        },
        // shadcn semantic slots, mapped straight onto the brand palette
        background: "#FAF7F2",
        foreground: "#1A1A18",
        card: { DEFAULT: "#FFFFFF", foreground: "#1A1A18" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#1A1A18" },
        primary: { DEFAULT: "#1A6B45", foreground: "#FAF7F2" },
        secondary: { DEFAULT: "#F2EFE9", foreground: "#1A1A18" },
        muted: { DEFAULT: "#F2EFE9", foreground: "#8A877F" },
        accent: { DEFAULT: "#D6EDE2", foreground: "#0F4A2E" },
        destructive: { DEFAULT: "#C4544C", foreground: "#FDF0EF" },
        border: { DEFAULT: "#D8D4CC", light: "#EDEAE4" },
        input: "#D8D4CC",
        ring: "#1A6B45",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-dm-mono)", ...defaultTheme.fontFamily.mono],
      },
      // §05 type stack. DM Mono (font-mono) for every numeric value.
      fontSize: {
        display: ["64px", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "300" }],
        "heading-lg": ["24px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" }],
        "heading-md": ["18px", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "500" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["11px", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "500" }],
        caption: ["11px", { lineHeight: "1.4", fontWeight: "400" }],
        data: ["13px", { lineHeight: "1.4", fontWeight: "400" }],
        "data-sm": ["11px", { lineHeight: "1.3", fontWeight: "400" }],
      },
      keyframes: {
        scan: {
          "0%": { width: "0%" },
          "75%": { width: "100%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        scan: "scan 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
