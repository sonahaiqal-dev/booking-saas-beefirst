import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Baris ini yang akan memberitahu Vercel untuk membaca folder admin kamu
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Kamu bisa menambahkan kustomisasi warna agensi kamu di sini nanti
    },
  },
  plugins: [],
};
export default config;