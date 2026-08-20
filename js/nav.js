/**
 * Navigation chrome: mobile menu, active-section highlighting, scroll progress,
 * auto-hiding navbar, back-to-top.
 *
 * Section highlighting uses IntersectionObserver rather than reading offsetTop
 * for every section on every scroll event, which forced a layout on each frame.
 */
import { $, $$, rafThrottle } from './config.js';

export function initNav() {
    initMobileMenu();
    initActiveSection();
    initScrollChrome();
    initBackToTop();

    const yearEl = $('#footer-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function initMobileMenu() {
    const toggle = $('#mobile-menu-toggle');
    const menu   = $('#nav-links');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after navigating, on Escape, and on any click outside the menu —
    // the old build left the panel open covering the section you jumped to.
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
}

function initActiveSection() {
    const sections = $$('main section[id]');
    if (!sections.length) return;

    const dots     = $$('.dot-link');
    const navLinks = $$('.nav-link');

    const setActive = (id) => {
        dots.forEach((d) => d.classList.toggle('is-active', d.getAttribute('href') === `#${id}`));
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
    };

    const visible = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
        });

        // Several sections can straddle the band at once; the topmost wins.
        const topmost = sections.find((s) => visible.has(s.id));
        if (topmost) setActive(topmost.id);
    }, {
        // A band across the middle of the viewport, so the highlight changes
        // when a section is genuinely what you are looking at.
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
    });

    sections.forEach((s) => observer.observe(s));
}

function initScrollChrome() {
    const bar    = $('#scroll-progress-bar');
    const navbar = $('#navbar');
    const top    = $('#back-to-top');
    let lastY = 0;

    const onScroll = rafThrottle(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        if (bar) bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

        // Hide the navbar while scrolling down past the hero, show on scroll up.
        if (navbar) navbar.classList.toggle('is-hidden', y > 140 && y > lastY);

        if (top) top.classList.toggle('is-visible', y > 500);

        lastY = y;
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initBackToTop() {
    $('#back-to-top')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
