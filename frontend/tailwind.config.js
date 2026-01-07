/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "var(--color-primary, #C4704F)",
                    hover: "var(--color-primary-hover, #A25A3D)",
                    light: "var(--color-primary-light, #E5B299)",
                    dark: "var(--color-primary-dark, #A25A3D)",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                earth: {
                    primary: '#C4704F', // Warm Terracotta
                    dark: '#A25A3D',    // Deep Terracotta
                    light: '#E5B299',   // Peachy Terracotta
                    lighter: '#E8F5E9', // Soft Mint
                },
                olive: {
                    primary: '#6B8E23', // OliveDrab
                    dark: '#556B2F',    // DarkOliveGreen
                    light: '#B8D490',   // Light Olive
                },
                neutral: {
                    light: '#EFF7F0',   // Very Light Sage
                    medium: '#D8E4C8',  // Light Sage
                    dark: '#5A6B4F',    // Muted Olive Gray
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
