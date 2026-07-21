/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#EAF4F3",
          100: "#D2E7E5",
          200: "#A6D0CB",
          300: "#79B8B1",
          400: "#4D9F97",
          500: "#2C847C",
          600: "#0E7C7B",
          700: "#0B4F4A",
          800: "#093D39",
          900: "#062A27",
        },
        ink: "#12211F",
        canvas: "#F6F8F7",
        surface: "#FFFFFF",
        role: {
          admin: "#6D5BD0",
          doctor: "#0E7C7B",
          nurse: "#D0577A",
          staff: "#C8862B",
          patient: "#2F6FDB",
        },
        status: {
          stable: "#2E9E6C",
          critical: "#D64545",
          warning: "#D99A2B",
          info: "#2F6FDB",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(9,61,57,0.06), 0 1px 12px rgba(9,61,57,0.05)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
