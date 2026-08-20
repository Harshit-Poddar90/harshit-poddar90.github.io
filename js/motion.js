/**
 * Entrance animations (GSAP + ScrollTrigger) and the hero role typewriter.
 *
 * Safety net: elements start invisible in CSS. If GSAP fails to load, or the
 * visitor asked for reduced motion, we add `no-motion` to <html>, which the
 * stylesheet uses to reveal everything immediately. The page is never blank.
 */
import { $, $$, prefersReducedMotion } from './config.js';

const ROLES = [
    'AI Engineer',
    'Agentic AI &amp; LLM orchestration',
    'Machine Learning Engineer',
    'Computer Vision',
    'Generative modelling',
];

export function revealWithoutMotion() {
    document.documentElement.classList.add('no-motion');
}

export function initMotion() {
    initTypewriter();

    if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        revealWithoutMotion();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.to('.fade-up', { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' });

    const scrollReveal = (selector, from) => {
        $$(selector).forEach((el) => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: 'top 88%' },
                opacity: 1, duration: 0.7, ease: 'power3.out', ...from,
            });
        });
    };

    scrollReveal('.reveal-card',     { y: 0 });
    scrollReveal('.reveal-timeline', { x: 0 });
    scrollReveal('.reveal-text',     { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 0.9 });

    initCounters();
}

function initTypewriter() {
    const el = $('#typed-roles');
    if (!el) return;

    if (typeof Typed === 'undefined' || prefersReducedMotion()) {
        el.textContent = 'AI Engineer · Agentic AI · Machine Learning';
        $('.typed-cursor')?.remove();
        return;
    }

    new Typed('#typed-roles', {
        strings: ROLES,
        typeSpeed: 45,
        backSpeed: 25,
        backDelay: 1800,
        loop: true,
        cursorChar: '',
    });
}

/** Count 0 → data-target once, when the stat scrolls into view. */
function initCounters() {
    $$('.counter').forEach((el) => {
        const target = Number(el.dataset.target);
        if (!Number.isFinite(target)) return;

        ScrollTrigger.create({
            trigger: el,
            start: 'top 92%',
            once: true,
            onEnter: () => {
                const state = { value: 0 };
                gsap.to(state, {
                    value: target,
                    duration: 1.6,
                    ease: 'power2.out',
                    onUpdate: () => { el.textContent = String(Math.round(state.value)); },
                });
            },
        });
    });
}
