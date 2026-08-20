/**
 * AI assistant widget.
 *
 * Answer strategy, in order:
 *   1. Suggestion chip clicked  → instant local answer, 0 ms, no network.
 *   2. Free text that clearly matches an FAQ entry → instant local answer.
 *   3. Anything else → the RAG backend.
 *
 * Every answer ships with a visible execution trace. The timings are real and
 * client-measured — that is the whole point. A portfolio that claims "run
 * tracing so every output is auditable" should show its own.
 *
 * Model output is inserted with textContent, never innerHTML — an LLM
 * response is untrusted input and must not be able to inject markup.
 */
import { CONFIG, $, $$, prefersReducedMotion } from './config.js';
import { FAQ, matchFAQ } from './faq.js';

const TYPE_SPEED_MS = 8;

/** Steps shown in the trace, per route. */
const PLAN_LOCAL = ['parse question', 'match local index', 'answer from CV'];
const PLAN_REMOTE = ['parse question', 'check local index', 'query RAG service', 'render answer'];

let panel, fab, log, input, sendBtn, statusDot, substatus;
let sprites = [];
let isOpen = false;
let isBusy = false;
let warmed = false;
let isSpeaking = false;
/** Last known backend health. Kept separate from busy state so finishing a
 *  failed request does not reset the indicator back to green. */
let health = 'unknown';

export function initAssistant() {
    panel     = $('#assistant-panel');
    fab       = $('#assistant-fab');
    log       = $('#assistant-log');
    input     = $('#assistant-input');
    sendBtn   = $('#assistant-send');
    statusDot = $('#assistant-status-dot');
    substatus = $('#assistant-substatus');
    sprites   = $$('.agent-sprite');

    if (!panel || !fab || !log || !input) return;

    fab.addEventListener('click', () => toggle());
    $('#assistant-close')?.addEventListener('click', () => toggle(false));

    // Any "Ask about my work" button on the page opens the same panel.
    $$('[data-open-assistant]').forEach((btn) => btn.addEventListener('click', () => toggle(true)));

    $('#assistant-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const question = input.value.trim();
        if (question) ask(question);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) toggle(false);
    });

    // Wake the dyno on intent, not on page load — no point spinning up a
    // server for every visitor who never opens the chat.
    ['pointerenter', 'focus'].forEach((evt) => fab.addEventListener(evt, warmBackend));

    renderChips();
    setAgentState('idle', 'idle');
}

function toggle(force) {
    isOpen = force ?? !isOpen;
    panel.hidden = !isOpen;
    fab.setAttribute('aria-expanded', String(isOpen));
    fab.classList.toggle('is-open', isOpen);

    if (!isOpen) { fab.focus(); return; }

    warmBackend();
    if (!log.children.length) {
        addMessage(
            'Hi — I answer questions about Harshit\'s work from an index of his CV. ' +
            'Pick a suggestion below for an instant answer, or ask anything.',
            'assistant',
        );
    }
    input.focus();
}

/* --------------------------------------------------------------- agent -- */

/**
 * Drive the sprite's expression and the header status line together, so the
 * character always reflects what the system is actually doing.
 */
function setAgentState(state, label) {
    isSpeaking = state === 'speaking';
    sprites.forEach((s) => s.setAttribute('data-state', state));
    if (substatus) substatus.textContent = label;
}

/**
 * Return the agent to rest. Never interrupts an in-flight typewriter, and
 * shows "offline" rather than "idle" when we know the backend is unreachable.
 */
function settleAgent() {
    if (isSpeaking) return;
    if (health === 'is-down') setAgentState('offline', 'offline');
    else setAgentState('idle', 'idle');
}

/* ---------------------------------------------------------------- trace -- */

/**
 * Render a checklist of the steps this answer will take, then tick them off
 * with measured timings as they actually complete.
 */
function renderTrace(host, labels) {
    const el = document.createElement('div');
    el.className = 'agent-trace code-font';

    const rows = labels.map((label) => {
        const row = document.createElement('div');
        row.className = 'agent-step';

        const dot = document.createElement('span');
        dot.className = 'agent-step-dot';

        const name = document.createElement('span');
        name.className = 'agent-step-label';
        name.textContent = label;

        const time = document.createElement('span');
        time.className = 'agent-step-time';
        time.textContent = '·';

        row.append(dot, name, time);
        el.appendChild(row);
        return { row, time };
    });

    host.appendChild(el);

    return {
        start(i) { rows[i]?.row.classList.add('is-active'); },
        done(i, note) {
            const entry = rows[i];
            if (!entry) return;
            entry.row.classList.remove('is-active');
            entry.row.classList.add('is-done');
            if (note) entry.time.textContent = note;
        },
        skip(i, note) {
            const entry = rows[i];
            if (!entry) return;
            entry.row.classList.remove('is-active');
            entry.row.classList.add('is-skipped');
            if (note) entry.time.textContent = note;
        },
        fail(i, note) {
            const entry = rows[i];
            if (!entry) return;
            entry.row.classList.remove('is-active');
            entry.row.classList.add('is-failed');
            if (note) entry.time.textContent = note;
        },
    };
}

/* ---------------------------------------------------------------- chips -- */

function renderChips() {
    const host = $('#assistant-chips');
    if (!host) return;

    FAQ.forEach((entry) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'assistant-chip';
        btn.textContent = entry.chip;
        btn.addEventListener('click', () => {
            if (isBusy) return;
            addMessage(entry.question, 'you');
            answerLocally(entry, performance.now());
        });
        host.appendChild(btn);
    });
}

/* -------------------------------------------------------------- routing -- */

function answerLocally(entry, startedAt) {
    const { wrapper, body, traceHost } = createBotShell();
    const trace = renderTrace(traceHost, PLAN_LOCAL);

    const parsedAt = performance.now();
    trace.done(0, `${Math.max(1, Math.round(parsedAt - startedAt))} ms`);
    trace.done(1, `hit · 0 tokens`);
    trace.done(2, 'instant');

    setAgentState('speaking', 'answering');
    revealAnswer(body, entry.answer, () => { isSpeaking = false; settleAgent(); });
    return wrapper;
}

async function ask(question) {
    if (isBusy) return;

    input.value = '';
    addMessage(question, 'you');

    const startedAt = performance.now();
    const local = matchFAQ(question);
    if (local) {
        answerLocally(local, startedAt);
        return;
    }

    setBusy(true);
    setAgentState('thinking', 'retrieving');

    const { body, traceHost } = createBotShell();
    const trace = renderTrace(traceHost, PLAN_REMOTE);
    trace.done(0, `${Math.max(1, Math.round(performance.now() - startedAt))} ms`);
    trace.skip(1, 'no match');
    trace.start(2);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
    const sentAt = performance.now();

    try {
        const response = await fetch(`${CONFIG.apiBase}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
            signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));
        const ms = Math.round(performance.now() - sentAt);

        if (response.status === 429) {
            trace.fail(2, 'rate limited');
            trace.skip(3, '—');
            body.textContent = data.detail || 'Easy there — one question every few seconds, please.';
        } else if (!response.ok) {
            trace.fail(2, `${response.status} · ${ms} ms`);
            trace.skip(3, '—');
            body.textContent =
                'The answering service is having a moment. Everything it would tell you is on this ' +
                'page, or email harshit10233@gmail.com.';
            setStatus('is-down');
        } else if (data.answer) {
            trace.done(2, `${data.grounded === false ? 'no context' : 'grounded'} · ${ms} ms`);
            trace.start(3);
            setStatus('is-warm');
            setAgentState('speaking', 'answering');
            revealAnswer(body, data.answer, () => {
                trace.done(3, 'done');
                isSpeaking = false;
                settleAgent();
            });
            return;
        } else {
            trace.done(2, `${ms} ms`);
            trace.skip(3, 'empty');
            body.textContent =
                'I did not find anything on that. Try asking about a project, a role, or the tech stack.';
        }
    } catch (err) {
        const aborted = err.name === 'AbortError';
        trace.fail(2, aborted ? 'timed out' : 'unreachable');
        trace.skip(3, '—');
        setStatus('is-down');
        body.textContent = aborted
            ? 'That took too long — the backend was probably cold-starting. Try again, or use a suggestion above for an instant answer.'
            : 'Could not reach the answering service. The suggestions above still work offline, and everything is on this page.';
    } finally {
        clearTimeout(timeout);
        setBusy(false);
        settleAgent();
        scrollToBottom();
    }
}

/* ------------------------------------------------------------ rendering -- */

/** Build an empty assistant message and hand back the pieces to fill in. */
function createBotShell() {
    const wrapper = document.createElement('div');
    wrapper.className = 'assistant-msg is-bot';

    const traceHost = document.createElement('div');
    wrapper.appendChild(traceHost);

    const bubble = document.createElement('div');
    bubble.className = 'assistant-bubble';

    const body = document.createElement('span');
    bubble.appendChild(body);
    wrapper.appendChild(bubble);

    log.appendChild(wrapper);
    scrollToBottom();

    return { wrapper, body, traceHost };
}

/**
 * @param {string} text
 * @param {'you'|'assistant'} sender
 * @returns {HTMLElement} the message node.
 */
function addMessage(text, sender) {
    const isBot = sender === 'assistant';

    const wrapper = document.createElement('div');
    wrapper.className = `assistant-msg ${isBot ? 'is-bot' : 'is-user'}`;

    const bubble = document.createElement('div');
    bubble.className = 'assistant-bubble';
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    log.appendChild(wrapper);
    scrollToBottom();

    return wrapper;
}

function revealAnswer(el, text, onDone) {
    if (prefersReducedMotion()) {
        el.textContent = text;
        scrollToBottom();
        onDone?.();
        return;
    }
    typeInto(el, text, onDone);
}

/**
 * Typewriter reveal. Writes the full string up front and slides a slice, so the
 * cost is one textContent assignment per frame regardless of message length —
 * the old `innerHTML += char` version was quadratic and mangled entities.
 */
function typeInto(el, text, onDone) {
    let index = 0;
    const step = Math.max(1, Math.round(text.length / 220));

    const tick = () => {
        index = Math.min(text.length, index + step);
        el.textContent = text.slice(0, index);
        scrollToBottom();
        if (index < text.length) setTimeout(tick, TYPE_SPEED_MS);
        else onDone?.();
    };
    tick();
}

function scrollToBottom() {
    log.scrollTop = log.scrollHeight;
}

function setBusy(busy) {
    isBusy = busy;
    if (sendBtn) sendBtn.disabled = busy;
    if (input) input.disabled = busy;
    paintStatus(busy ? 'is-busy' : null);
    if (!busy) input?.focus();
}

/** Record backend health and repaint. */
function setStatus(state) {
    health = state;
    paintStatus(null);
}

/** `override` wins for transient states (busy); otherwise health decides. */
function paintStatus(override) {
    const state = override || (health === 'unknown' ? null : health);
    statusDot?.classList.remove('is-warm', 'is-busy', 'is-down');
    if (state) statusDot?.classList.add(state);
    if (health === 'is-down' && !override) setAgentState('offline', 'offline');
}

/** Cheap GET that wakes a sleeping dyno while the visitor is still reading. */
function warmBackend() {
    if (warmed) return;
    warmed = true;

    fetch(`${CONFIG.apiBase}/`, { method: 'GET', mode: 'cors' })
        .then((r) => setStatus(r.ok ? 'is-warm' : 'is-down'))
        .catch(() => setStatus('is-down'));
}
