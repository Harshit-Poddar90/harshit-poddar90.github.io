/**
 * Paints the agent sprite. It does not move — at all.
 *
 * Everything animated has been removed in turn: the idle float, the breathing
 * shadow, hover lift, poke squash, idle waving, and finally cursor-gaze and
 * blinking. A character fidgeting in the corner of a CV competes with the CV.
 * What is left is expression without motion — the sprite changes how it LOOKS
 * (eye shape, colour, cheeks, antenna pulse) when state changes, and then
 * holds that pose.
 *
 * Speech lives in bubble.js; notice.js decides when to talk.
 *
 * WHY EVERYTHING IS A CSS VARIABLE
 * --------------------------------
 * The sprite is a <use> reference, which clones into a shadow tree. Verified
 * empirically in-browser:
 *     simple class selectors  (.ag-eye)                       DO match inside
 *     descendant selectors    (.agent-sprite[data-x] .ag-eye) DO NOT
 * An earlier version drove expressions with `[data-state] .ag-eye` rules and
 * every one of them was silently inert — the character rendered but never
 * moved. Custom properties are the only channel that crosses the boundary, so
 * all of it is funnelled through `applyLook()`.
 *
 * Division of labour:
 *   assistant.js -> writes data-state (idle | thinking | speaking | offline)
 *   this module  -> observes it, owns the mood, and renders the result
 * A MutationObserver keeps them decoupled: assistant.js needs no knowledge here.
 */
import { $, $$ } from './config.js';
import { say } from './bubble.js';

/** How each state paints. Missing keys fall back to the CSS defaults. */
const STATE_LOOK = {
    idle: { '--ag-spark-dur': '2.6s' },
    thinking: { '--ag-spark-dur': '0.5s', '--ag-eye-sy': '0.42' },
    speaking: { '--ag-spark-dur': '1s' },
    offline: {
        '--ag-spark-dur': '0s',
        '--ag-eye-sy': '0.3',
        '--ag-body-fill': 'var(--text-faint)',
        '--ag-eye-fill': 'var(--text-faint)',
        '--ag-spark-fill': 'var(--text-faint)',
    },
};

/**
 * Moods used to lift, squash and scale the whole body. They do not any more:
 * the character holds completely still. Cheeks are what is left, because a
 * colour change is not motion.
 */
const MOOD_LOOK = {
    happy: { '--ag-blush': '0.45' },
};

const ALL_VARS = [
    '--ag-spark-dur', '--ag-eye-sy', '--ag-body-fill', '--ag-eye-fill', '--ag-spark-fill',
    '--ag-blush',
];

let sprites = [];
let mood = null;

export function initCompanion() {
    sprites = $$('.agent-sprite');
    if (!sprites.length) return;

    // assistant.js changes data-state whenever it works; repaint when it does.
    const observer = new MutationObserver(applyLook);
    sprites.forEach((s) => observer.observe(s, { attributes: true, attributeFilter: ['data-state'] }));

    applyLook();
    initPokeReactions();
}

/* ----------------------------------------------------------------- paint -- */

/**
 * Collapse state + mood into one set of custom properties per sprite.
 * Single writer, so nothing can half-apply or fight anything else.
 */
function applyLook() {
    for (const sprite of sprites) {
        const state = sprite.dataset.state || 'idle';
        const look = { ...(STATE_LOOK[state] ?? {}), ...(MOOD_LOOK[mood] ?? {}) };

        for (const name of ALL_VARS) {
            if (name in look) sprite.style.setProperty(name, look[name]);
            else sprite.style.removeProperty(name);
        }
    }
}


/* ------------------------------------------------------------------ poke -- */

export function setMood(next) {
    mood = next;
    applyLook();
}

function initPokeReactions() {
    const fab = $('#assistant-fab');
    if (!fab) return;

    // Approach brightens the cheeks. The poke-squash that used to fire on
    // pointerdown is gone with the rest of the body motion.
    fab.addEventListener('pointerenter', () => setMood('happy'));
    fab.addEventListener('pointerleave', () => setMood(null));
}

/* ----------------------------------------------------------------- hints -- */

/**
 * Scroll-triggered fallback for when proximity noticing is unavailable (touch
 * devices, narrow viewports, reduced motion). notice.js handles this on pointer
 * devices, where proximity is a far better trigger than "this scrolled into view".
 * Rate limiting and the mute switch live in bubble.js, so both paths obey them.
 */
export function initScrollHints() {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const message = entry.target.dataset.agentSay;
            if (message && say(message)) observer.unobserve(entry.target);
        }
    }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 });

    $$('[data-agent-say]').forEach((el) => observer.observe(el));
}
