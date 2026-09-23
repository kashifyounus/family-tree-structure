import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        urdu: ["var(--font-urdu)", "serif"],
      },
    },
  },
};

export default config;
