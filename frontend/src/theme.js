// Small helpers for light/dark mode
const KEY = "theme";

export const getInitialTheme = () => {
    try {
        const saved = localStorage.getItem(KEY);
        if (saved === "light" || saved === "dark") return saved;
    } catch {
        /* storage unavailable */
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

export const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
};

export const saveTheme = (theme) => {
    try {
        localStorage.setItem(KEY, theme);
    } catch {
        /* storage unavailable */
    }
};
