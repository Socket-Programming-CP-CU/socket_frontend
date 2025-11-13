import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}", // ต้องมีบรรทัดนี้
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
