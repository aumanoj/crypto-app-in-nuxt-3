import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "selector",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    fontFamily: {
      serif: ["Nunito", ...defaultTheme.fontFamily.sans],
    },
    extend: {
      transitionProperty: {
        "max-height": "max-height",
      },
      backgroundImage: {
        body: "linear-gradient(178deg, #ffffff00, #ffeed9)",
      },
      colors: {
        "primary-50-dark": "#f7931a2b",
        base: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200) !important",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },
      },
      height: {
        scrollable: "calc(100% - 160px)",
        "m-scrollable": "80%",
        "m-table": "65%",
        "tax-calculation-stepper": "calc(100vh - 365px)"
      },
      container: {
        screens: {
          'xl': '1400px', // This will set max-width to 1600px for 1080p monitors
          '2xl': '1700px', // This will set max-width to 1900px for 2K and above
        },
      },
    },
  },
  plugins: [],
} satisfies Config;