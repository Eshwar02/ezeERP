import type { Config } from "tailwindcss";

// ezeERP brand palette: green / white / blue
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#21c25e",
          greenDark: "#179549",
          blue: "#00a8ec",
          blueDark: "#0080bd",
        },
      },
    },
  },
  plugins: [],
};
export default config;
