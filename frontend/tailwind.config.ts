import type { Config } from "tailwindcss";

// ezeERP brand palette: green / white / blue
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#50C69E",
          greenDark: "#3AA683",
          blue: "#3574B9",
          blueDark: "#285A91",
        },
      },
    },
  },
  plugins: [],
};
export default config;
