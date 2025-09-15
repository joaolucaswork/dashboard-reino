/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      // Rule of 8 spacing system (8px base unit)
      spacing: {
        1: "8px", // 1 unit = 8px
        2: "16px", // 2 units = 16px
        3: "24px", // 3 units = 24px
        4: "32px", // 4 units = 32px
        5: "40px", // 5 units = 40px
        6: "48px", // 6 units = 48px
        7: "56px", // 7 units = 56px
        8: "64px", // 8 units = 64px
        9: "72px", // 9 units = 72px
        10: "80px", // 10 units = 80px
        12: "96px", // 12 units = 96px
        16: "128px", // 16 units = 128px
        20: "160px", // 20 units = 160px
        24: "192px", // 24 units = 192px
        32: "256px", // 32 units = 256px
      },
      // Premium dark mode color palette
      colors: {
        // Background colors
        "bg-primary": "#0a0a0a", // Deep black
        "bg-secondary": "#111111", // Slightly lighter black
        "bg-tertiary": "#1a1a1a", // Card backgrounds
        "bg-elevated": "#222222", // Elevated surfaces

        // Text colors
        "text-primary": "#ffffff", // Primary text
        "text-secondary": "#a1a1aa", // Secondary text
        "text-tertiary": "#71717a", // Tertiary text
        "text-muted": "#52525b", // Muted text

        // Accent colors
        "accent-blue": "#007aff", // Apple blue
        "accent-blue-hover": "#0056cc",
        "accent-green": "#30d158", // Apple green
        "accent-orange": "#ff9500", // Apple orange
        "accent-red": "#ff3b30", // Apple red

        // Border colors
        "border-primary": "#2a2a2a", // Primary borders
        "border-secondary": "#333333", // Secondary borders
        "border-focus": "#007aff", // Focus states
      },
      // Typography improvements
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        sm: ["14px", { lineHeight: "20px", letterSpacing: "0.01em" }],
        base: ["16px", { lineHeight: "24px", letterSpacing: "0.01em" }],
        lg: ["18px", { lineHeight: "28px", letterSpacing: "0.01em" }],
        xl: ["20px", { lineHeight: "32px", letterSpacing: "0.01em" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em" }],
        "3xl": ["30px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        "4xl": ["36px", { lineHeight: "48px", letterSpacing: "-0.02em" }],
      },
      // Subtle shadows for depth
      boxShadow: {
        subtle:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        elevated:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        premium:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      // Smooth transitions
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
};
