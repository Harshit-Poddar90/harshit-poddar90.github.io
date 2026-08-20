/**
 * Shared configuration and tiny DOM helpers.
 * Every other module imports from here so there is exactly one place
 * to change the backend URL, the timings, or the motion policy.
 */

export const CONFIG = {
    /** RAG backend. Swap this one string when you redeploy the API. */
    apiBase: 'https://portfolio-rag-api-o416.onrender.com',

    /** Free-tier dynos sleep; a cold start can take most of a minute. */
    requestTimeoutMs: 60_000,

    /** Boot animation total runtime before the page is revealed. */
    bootDurationMs: 3_400,

    /** sessionStorage key so the intro plays once per browser session. */
    bootSeenKey: 'hp.boot.seen',

    /** localStorage key for the colour theme. */
    themeKey: 'hp.theme',
};

export const $  = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** True when the visitor has asked their OS to minimise animation. */
export const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True on devices with a real mouse — gates the custom cursor and heavy 3D. */
export const hasFinePointer = () =>
    window.matchMedia('(pointer: fine)').matches;

/**
 * Run `fn` at most once per animation frame.
 * Scroll handlers that read layout must be throttled or they cause jank.
 */
export function rafThrottle(fn) {
    let queued = false;
    return (...args) => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            fn(...args);
        });
    };
}
