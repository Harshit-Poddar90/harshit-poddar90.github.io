/**
 * Projects coverflow.
 *
 * CSS does all the 3D. This module only decides which card is in front, by
 * giving every card --o (its offset from the front card) and --a (|offset|).
 * It turns one step every few seconds, and holds still while the visitor is
 * pointing at it, has focus in it, is on another tab, or pressed pause. It
 * never auto-plays under reduced motion.
 */
import { $, $$, prefersReducedMotion } from './config.js';

const EVERY_MS = 6_000;
/** Horizontal travel that counts as a swipe rather than a tap. */
const SWIPE_PX = 50;

export function initCarousel() {
    const region = $('.projects-carousel');
    if (!region) return;

    const stage = $('.projects-grid', region);
    const cards = $$('.project-card', stage);
    const n = cards.length;
    const half = Math.floor(n / 2);
    const pauseBtn = $('[data-carousel="pause"]', region);

    let active = 0;
    let paused = false;
    let held = false;     // pointer over it, or focus inside it
    let swiped = false;   // swallow the click that ends a swipe

    const dots = cards.map((card, i) => {
        card.setAttribute('aria-roledescription', 'slide');
        card.setAttribute('aria-label', `${i + 1} of ${n}`);

        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show ${$('h3', card).textContent}`);
        dot.addEventListener('click', () => show(i));
        $('.carousel-dots', region).append(dot);
        return dot;
    });

    function show(next) {
        active = (next + n) % n;
        cards.forEach((card, i) => {
            const o = ((i - active + n + half) % n) - half;
            const was = Number(card.style.getPropertyValue('--o') || o);
            // A card wrapping round the back would sweep across the front; snap it.
            const snap = Math.abs(o - was) > 1;
            if (snap) card.style.transition = 'none';
            card.style.setProperty('--o', o);
            card.style.setProperty('--a', Math.abs(o));
            card.inert = o !== 0;   // only the front card is clickable and tabbable
            if (snap) {
                void card.offsetWidth;   // commit the jump before transitions return
                card.style.transition = '';
            }
        });
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
    }

    function setPaused(value) {
        paused = value;
        pauseBtn.setAttribute('aria-label', paused ? 'Play rotation' : 'Pause rotation');
        $('i', pauseBtn).className = `fa-solid fa-${paused ? 'play' : 'pause'}`;
    }

    $('[data-carousel="prev"]', region).addEventListener('click', () => show(active - 1));
    $('[data-carousel="next"]', region).addEventListener('click', () => show(active + 1));
    pauseBtn.addEventListener('click', () => setPaused(!paused));

    $('.carousel-controls', region).addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') show(active - 1);
        if (e.key === 'ArrowRight') show(active + 1);
    });

    // Side cards are inert, so a click on one lands on the stage itself.
    stage.addEventListener('click', (e) => {
        if (swiped) { swiped = false; return; }
        if (e.target !== stage) return;
        const { left, width } = stage.getBoundingClientRect();
        show(active + (e.clientX < left + width / 2 ? -1 : 1));
    });

    let x0 = null;
    stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
        if (x0 !== null && Math.abs(e.clientX - x0) > SWIPE_PX) {
            swiped = true;
            show(active + (e.clientX < x0 ? 1 : -1));
        }
        x0 = null;
    });

    region.addEventListener('pointerenter', () => { held = true; });
    region.addEventListener('pointerleave', () => { held = false; });
    region.addEventListener('focusin', () => { held = true; });
    region.addEventListener('focusout', () => { held = false; });

    setPaused(prefersReducedMotion());
    show(0);
    setInterval(() => {
        if (!paused && !held && !document.hidden) show(active + 1);
    }, EVERY_MS);
}
