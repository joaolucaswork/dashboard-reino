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
      // shadcn-svelte color system with CSS variables
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Legacy colors for backward compatibility
        "bg-primary": "#0a0a0a",
        "bg-secondary": "#111111",
        "bg-tertiary": "#1a1a1a",
        "bg-elevated": "#222222",
        "text-primary": "#ffffff",
        "text-secondary": "#a1a1aa",
        "text-tertiary": "#71717a",
        "text-muted": "#52525b",
        "accent-blue": "#007aff",
        "accent-blue-hover": "#0056cc",
        "accent-green": "#30d158",
        "accent-orange": "#ff9500",
        "accent-red": "#ff3b30",
        "border-primary": "#2a2a2a",
        "border-secondary": "#333333",
        "border-focus": "#007aff",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
