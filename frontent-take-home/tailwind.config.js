/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#4b5563",
        card: "#f9fafb",
        "card-foreground": "#4b5563",
        popover: "#ffffff",
        "popover-foreground": "#4b5563",
        primary: "#0891b2",
        "primary-foreground": "#ffffff",
        secondary: "#f59e0b",
        "secondary-foreground": "#ffffff",
        muted: "#f9fafb",
        "muted-foreground": "#6b7280",
        accent: "#f59e0b",
        "accent-foreground": "#ffffff",
        destructive: "#dc2626",
        "destructive-foreground": "#ffffff",
        border: "#e5e7eb",
        input: "#ffffff",
        ring: "rgba(8, 145, 178, 0.5)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
}