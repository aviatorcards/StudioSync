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
                    primary: '#6366F1', // Vibrant Indigo
                    dark: '#4F46E5',    // Deep Indigo
                    light: '#A5B4FC',   // Soft Indigo
                    lighter: '#EEF2FF', // Very Light Indigo
                },
                olive: {
                    primary: '#8B5CF6', // Purple
                    dark: '#7C3AED',    // Deep Purple
                    light: '#C4B5FD',   // Soft Purple
                },
                neutral: {
                    light: '#F8FAFC',   // Very Light Slate
                    medium: '#E2E8F0',  // Light Slate
                    dark: '#475569',    // Slate Gray
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
