/**
 * The character's speech bubble.
 *
 * Owned here rather than in companion.js or notice.js because both of them talk:
 * notice.js when the cursor nears something interesting, companion.js as a
 * scroll-triggered fallback on touch and narrow screens. One owner means one
 * rate limit and one "shut up" switch.
 *
 * Restraint is the whole design. A mascot that chatters over a recruiter
 * reading your CV is worse than no mascot: every line is rate-limited, said at
 * most once, suppressed while the chat panel is open, and the close button
 * silences it for the rest of the session.
 */
import { $ } from './config.js';

/** Minimum quiet time between two utterances. */
const MIN_GAP_MS = 5_500;
/** How long a line stays up before it fades itself out. */
const SHOW_MS = 6_000;

const SILENCED_KEY = 'hp.agent.silenced';

/** Opening line, then the nudges that follow it while the visitor reads. */
const GREETING = "Hi — I'm Harshit's agent. Scroll on, I'll point out the good bits.";

const PITCHES = [
    'Harshit is after graduate and full-time AI roles from summer 2027. Hiring?',
    'Based in Stockholm, happy to relocate anywhere in Europe.',
    'Hiring? Click me and ask me anything about his work.',
    '17 papers, 170+ citations, two patents. He has been busy.',
];

/** Wait for the boot intro to clear, then greet. */
const GREET_DELAY_MS = 2_200;
/** Gap between the nudges. Long on purpose — this is a CV, not an ad. */
const PITCH_EVERY_MS = 45_000;

let bubble = null;
let textEl = null;
let panel = null;
let hideTimer = 0;
/**
 * Seeded one full gap in the past. At 0 the first utterance was compared
 * against a clock that had already passed 5.5s during page load, so every
 * line in the opening seconds — the greeting included — was silently dropped.
 */
let lastSpokeAt = -MIN_GAP_MS;
let silenced = false;
/** Each message is said once per session, keyed by its own text. */
const alreadySaid = new Set();

export function initBubble() {
    bubble = $('#agent-bubble');
    textEl = $('#agent-bubble-text');
    panel = $('#assistant-panel');
    if (!bubble || !textEl) return;

    try { silenced = sessionStorage.getItem(SILENCED_KEY) === '1'; } catch { /* private mode */ }

    $('#agent-bubble-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        silence();
    });
}

export const isSilenced = () => silenced;

function silence() {
    silenced = true;
    try { sessionStorage.setItem(SILENCED_KEY, '1'); } catch { /* private mode */ }
    hideBubble();
}

/**
 * @param {string} message
 * @returns {boolean} true if it was actually said.
 */
export function say(message) {
    if (!bubble || !textEl) return false;
    if (silenced || !message) return false;
    if (alreadySaid.has(message)) return false;
    if (panel && !panel.hidden) return false;                 // chat is open; don't talk over it
    if (performance.now() - lastSpokeAt < MIN_GAP_MS) return false;

    alreadySaid.add(message);
    lastSpokeAt = performance.now();

    textEl.textContent = message;
    bubble.hidden = false;
    // Force a frame so the transition runs from the hidden state.
    requestAnimationFrame(() => bubble.classList.add('is-visible'));

    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideBubble, SHOW_MS);
    return true;
}

function hideBubble() {
    if (!bubble) return;
    clearTimeout(hideTimer);
    bubble.classList.remove('is-visible');
    // Wait for the fade before removing it from the layout.
    setTimeout(() => { if (!bubble.classList.contains('is-visible')) bubble.hidden = true; }, 320);
}

/**
 * Greet on arrival, then work through PITCHES while the visitor reads.
 *
 * Lives here rather than in notice.js because that only runs on pointer devices
 * with motion enabled — a recruiter on a phone should still be greeted. say()
 * enforces the rate limit and the mute switch, so this cannot talk over
 * anything or outlive the close button.
 *
 * A refused line is retried rather than skipped: say() only marks a message as
 * spoken once it actually appears, so a pitch that lands while the chat panel
 * is open is not silently burnt.
 */
export function startChatter() {
    if (!bubble || silenced) return;

    setTimeout(() => say(GREETING), GREET_DELAY_MS);

    let next = 0;
    const tick = () => {
        if (silenced || next >= PITCHES.length) return;
        if (say(PITCHES[next])) next += 1;
        setTimeout(tick, PITCH_EVERY_MS);
    };
    setTimeout(tick, GREET_DELAY_MS + PITCH_EVERY_MS);
}
