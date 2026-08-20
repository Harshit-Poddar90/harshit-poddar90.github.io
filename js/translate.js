/**
 * Language picker.
 *
 * Google's TranslateElement renders a <select> plus a branding node that no
 * amount of CSS reliably contains. Rather than style it, we hide the widget
 * entirely and proxy a styled menu onto its hidden combo box.
 *
 * The only contract with Google is the `.goog-te-combo` selector. If that ever
 * changes, the picker degrades to a no-op menu — never a broken layout.
 */
import { $, $$ } from './config.js';

/** Google injects its widget asynchronously; poll briefly rather than guess. */
const COMBO_POLL_MS = 200;
const COMBO_POLL_ATTEMPTS = 40; // ~8s, then give up silently

/** @returns {Promise<HTMLSelectElement|null>} */
function waitForCombo() {
    return new Promise((resolve) => {
        let tries = 0;
        const poll = () => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) return resolve(combo);
            if (++tries >= COMBO_POLL_ATTEMPTS) return resolve(null);
            setTimeout(poll, COMBO_POLL_MS);
        };
        poll();
    });
}

/** Google reads its own cookie on load; mirror it so the menu opens in sync. */
function activeLangFromCookie() {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    return match ? decodeURIComponent(match[1]).split('/').filter(Boolean).pop() || 'en' : 'en';
}

export function initTranslate() {
    const toggle = $('#lang-toggle');
    const menu = $('#lang-menu');
    if (!toggle || !menu) return;

    const options = $$('button[data-lang]', menu);

    const setOpen = (open) => {
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
    };

    const markActive = (lang) =>
        options.forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));

    markActive(activeLangFromCookie());

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(menu.hidden);
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    let comboPromise = null;

    options.forEach((button) => {
        button.addEventListener('click', async () => {
            const lang = button.dataset.lang;
            markActive(lang);
            setOpen(false);

            comboPromise ??= waitForCombo();
            const combo = await comboPromise;
            if (!combo) return;

            combo.value = lang;
            // Google listens for a real change event, not a property write.
            combo.dispatchEvent(new Event('change'));
        });
    });
}
