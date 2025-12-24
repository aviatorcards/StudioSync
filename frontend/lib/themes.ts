export type ThemeColors = {
    background: string;
    foreground: string;
    primary: string;
    "primary-foreground": string;
    secondary: string;
    "secondary-foreground": string;
    muted: string;
    "muted-foreground": string;
    accent: string;
    "accent-foreground": string;
    border: string;
    input: string;
    ring: string;
};

export type Theme = {
    id: string;
    name: string;
    colors: ThemeColors;
};

export const THEMES: Record<string, Theme> = {
    default: {
        id: "default",
        name: "Classic Indigo",
        colors: {
            background: "0 0% 100%",
            foreground: "222.2 84% 4.9%",
            primary: "262 83% 58%",
            "primary-foreground": "210 40% 98%",
            secondary: "210 40% 96.1%",
            "secondary-foreground": "222.2 47.4% 11.2%",
            muted: "210 40% 96.1%",
            "muted-foreground": "215.4 16.3% 46.9%",
            accent: "210 40% 96.1%",
            "accent-foreground": "222.2 47.4% 11.2%",
            border: "214.3 31.8% 91.4%",
            input: "214.3 31.8% 91.4%",
            ring: "262 83% 58%",
        },
    },
    emerald: {
        id: "emerald",
        name: "Emerald Garden",
        colors: {
            background: "0 0% 100%",
            foreground: "240 10% 3.9%",
            primary: "142 76% 36%",
            "primary-foreground": "355.7 100% 97.3%",
            secondary: "240 4.8% 95.9%",
            "secondary-foreground": "240 5.9% 10%",
            muted: "240 4.8% 95.9%",
            "muted-foreground": "240 3.8% 46.1%",
            accent: "240 4.8% 95.9%",
            "accent-foreground": "240 5.9% 10%",
            border: "240 5.9% 90%",
            input: "240 5.9% 90%",
            ring: "142 76% 36%",
        },
    },
    midnight: {
        id: "midnight",
        name: "Midnight Jazz",
        colors: {
            background: "222.2 84% 4.9%",
            foreground: "210 40% 98%",
            primary: "210 40% 98%",
            "primary-foreground": "222.2 47.4% 11.2%",
            secondary: "217.2 32.6% 17.5%",
            "secondary-foreground": "210 40% 98%",
            muted: "217.2 32.6% 17.5%",
            "muted-foreground": "215 20.2% 65.1%",
            accent: "217.2 32.6% 17.5%",
            "accent-foreground": "210 40% 98%",
            border: "217.2 32.6% 17.5%",
            input: "217.2 32.6% 17.5%",
            ring: "212.7 26.8% 83.9%",
        },
    },
    rose: {
        id: "rose",
        name: "Rose Harmony",
        colors: {
            background: "0 0% 100%",
            foreground: "240 10% 3.9%",
            primary: "346 84% 61%",
            "primary-foreground": "355.7 100% 97.3%",
            secondary: "240 4.8% 95.9%",
            "secondary-foreground": "240 5.9% 10%",
            muted: "240 4.8% 95.9%",
            "muted-foreground": "240 3.8% 46.1%",
            accent: "240 4.8% 95.9%",
            "accent-foreground": "240 5.9% 10%",
            border: "240 5.9% 90%",
            input: "240 5.9% 90%",
            ring: "346 84% 61%",
        },
    },
};
