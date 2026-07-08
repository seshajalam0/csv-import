import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        field: "#f7f6f0",
        line: "#d8d6c8",
        moss: "#315a45",
        mint: "#d7eadf",
        brass: "#b1842e",
        rust: "#a94d32",
        blueprint: "#2f5e88"
      },
      boxShadow: {
        panel: "0 16px 40px rgba(23, 33, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
