/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        action: {
          DEFAULT: "#8a4d76",
        },
      },
    },
  },
  plugins: [],
};
