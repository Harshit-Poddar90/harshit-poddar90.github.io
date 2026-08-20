/**
 * The character comments on whatever the cursor is nearest to.
 *
 * It used to walk after the pointer as well (this file was roam.js). That is
 * gone: on a CV read by recruiters, something moving in the periphery competes
 * with the text it is supposed to be supporting, and trailing distance only
 * changes how much — not whether. The character now stands in its corner and
 * just speaks up, which is the half that was ever worth having.
 *
 * companion.js still tracks the cursor with its eyes from that fixed spot, so
 * it stays alive without going anywhere.
 *
 * Talking points live on elements as `data-agent-say`, so adding one is an
 * HTML attribute, not a change here.
 */
import { $, $$, prefersReducedMotion, hasFinePointer } from './config.js';
import { say, isSilenced } from './bubble.js';
import { setMood } from './companion.js';

/** How close the cursor must get to a talking point before it comments. */
const NOTICE_RADIUS = 130;

let panel = null;
let targets = [];
let pointerX = 0;
let pointerY = 0;
/** The element currently being commented on, so it is not re-announced. */
let announced = null;

/** @returns {boolean} true if proximity noticing is running. */
export function initNoticing() {
    if (!$('#agent-avatar')) return false;

    // Touch and reduced-motion visitors fall back to companion.js's scroll
    // hints: with no hover there is nothing to be "near".
    if (prefersReducedMotion() || !hasFinePointer()) return false;

    panel = $('#assistant-panel');
    targets = $$('[data-agent-say]');
    if (!targets.length) return false;

    // Called straight from the event, not through rafThrottle: this reads ten
    // rects and writes no styles, so there is no layout thrash to batch away,
    // and routing it through rAF would silently stop it wherever rAF is
    // throttled.
    window.addEventListener('mousemove', (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        notice();
    }, { passive: true });

    window.addEventListener('scroll', notice, { passive: true });

    return true;
}

/** Shortest distance from a point to a rectangle; 0 when inside it. */
function distanceToRect(x, y, r) {
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.hypot(dx, dy);
}

/** Comment on whatever the cursor is closest to, if anything. */
function notice() {
    if (isSilenced() || (panel && !panel.hidden)) return;

    let best = null;
    let bestDistance = NOTICE_RADIUS;

    for (const el of targets) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight || !r.width) continue;

        const d = distanceToRect(pointerX, pointerY, r);
        if (d < bestDistance) {
            bestDistance = d;
            best = el;
        }
    }

    if (!best) { announced = null; return; }
    if (best === announced) return;

    announced = best;
    // Perk up only if the line actually got past the rate limiter.
    if (say(best.dataset.agentSay)) {
        setMood('happy');
        setTimeout(() => setMood(null), 2_400);
    }
}
