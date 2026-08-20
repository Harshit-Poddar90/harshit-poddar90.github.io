/**
 * Colour theme.
 *
 * The initial theme is applied by an inline script in <head> so the page never
 * flashes the wrong colours. This module only owns the toggle button and
 * notifying the WebGL scenes, which cannot read CSS variables.
 */
import { CONFIG, $ } from './config.js';

/** Scenes register here so they can recolour when the theme flips. */
const listeners = new Set();

export function onThemeChange(fn) {
    listeners.add(fn);
    fn(currentTheme());          // fire once with the initial value
    return () => listeners.delete(fn);
}

const currentTheme = () =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const icon = $('#theme-icon');
    if (icon) {
        icon.classList.toggle('fa-sun',  theme === 'light');
        icon.classList.toggle('fa-moon', theme === 'dark');
    }

    const toggle = $('#theme-toggle');
    if (toggle) {
        toggle.setAttribute('aria-label',
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }

    try { localStorage.setItem(CONFIG.themeKey, theme); } catch { /* private mode */ }

    listeners.forEach((fn) => fn(theme));
}

export function initTheme() {
    applyTheme(currentTheme());

    const toggle = $('#theme-toggle');
    if (!toggle) return;

    // Exactly one listener. The previous build had an inline onclick *and* an
    // addEventListener on the same button, so every click toggled twice and
    // the theme never appeared to change.
    toggle.addEventListener('click', () => {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });

    // Follow the OS only while the visitor has not made an explicit choice.
    let hasStoredChoice = false;
    try { hasStoredChoice = Boolean(localStorage.getItem(CONFIG.themeKey)); } catch { /* ignore */ }

    if (!hasStoredChoice) {
        window.matchMedia('(prefers-color-scheme: light)')
            .addEventListener('change', (e) => applyTheme(e.matches ? 'light' : 'dark'));
    }
}
