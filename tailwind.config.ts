import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pyjama: {
          burgundy: "#8A2B43",
          "burgundy-dark": "#7A1C32",
          "burgundy-light": "#A33753",
          pink: "#E8A5B8",
          "pink-light": "#F4C2D0",
          "pink-soft": "#FDEDF1",
          cream: "#FAF7F5",
          "cream-dark": "#F2EBE5",
          charcoal: "#222222",
          gray: "#666666",
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(138, 43, 67, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        card: "0 10px 30px -5px rgba(138, 43, 67, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
