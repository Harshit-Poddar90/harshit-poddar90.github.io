/**
 * Entry point.
 *
 * The old build loaded script.js twice and wrapped everything in one 800-line
 * DOMContentLoaded callback, so every listener, both WebGL contexts and the
 * boot animation were created twice over. Each concern now lives in its own
 * module and is started exactly once, here.
 *
 * `type="module"` scripts are deferred by definition, so the DOM is ready.
 */
import { initTheme } from './theme.js';
import { runBootSequence } from './boot.js';
import { initCursor } from './cursor.js';
import { initScenes } from './scenes.js';
import { initMotion, revealWithoutMotion } from './motion.js';
import { initNav } from './nav.js';
import { initContactForm } from './contact.js';
import { initAssistant } from './assistant.js';
import { initTranslate } from './translate.js';
import { initCompanion, initScrollHints } from './companion.js';
import { initBubble, startChatter } from './bubble.js';
import { initNoticing } from './notice.js';

/** One broken module must never take the whole page down with it. */
function safely(name, fn) {
    try {
        fn();
    } catch (err) {
        console.error(`[portfolio] ${name} failed:`, err);
    }
}

safely('theme', initTheme);
safely('nav', initNav);
safely('contact form', initContactForm);
safely('assistant', initAssistant);
safely('translate', initTranslate);
safely('companion', initCompanion);
safely('bubble', initBubble);
// Cursor proximity is the good trigger; the scroll fallback only runs where
// there is no cursor to be near (touch devices, reduced motion).
safely('notice', () => { if (!initNoticing()) initScrollHints(); });
safely('cursor', initCursor);

// Content animations wait for the intro so the reveal is not wasted behind it.
// `finally`, not `then`: a broken intro must not leave the page frozen at its
// pre-animation state, which is `opacity: 0` for most of the content.
runBootSequence()
    .catch((err) => console.error('[portfolio] boot failed:', err))
    .finally(() => {
        try {
            initMotion();
        } catch (err) {
            console.error('[portfolio] motion failed:', err);
            revealWithoutMotion();
        }
        safely('scenes', initScenes);
        // Greeting waits for the intro: a hello delivered behind the boot
        // screen is a hello nobody sees.
        safely('chatter', startChatter);
    });
