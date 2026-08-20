/**
 * Custom cursor dot plus a fading comet trail.
 * Desktop + fine pointer + motion allowed, otherwise the native cursor stays.
 */
import { $, hasFinePointer, prefersReducedMotion } from './config.js';

const TRAIL_FADE = 0.05;
const MAX_TRAIL  = 120;

export function initCursor() {
    if (!hasFinePointer() || prefersReducedMotion() || window.innerWidth < 1024) return;

    const dot    = $('#custom-cursor');
    const canvas = $('#cursor-trail-canvas');
    if (!dot || !canvas) return;

    document.body.classList.add('custom-cursor-active');

    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let trail = [];

    window.addEventListener('mousemove', (e) => {
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        trail.push({ x: e.clientX, y: e.clientY, alpha: 1, size: 3 });
        if (trail.length > MAX_TRAIL) trail.shift();
    }, { passive: true });

    // One delegated pair of listeners instead of two per interactive element.
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, input, textarea, .tag')) dot.classList.add('is-hovering');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, input, textarea, .tag')) dot.classList.remove('is-hovering');
    });

    const tick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of trail) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201, 114, 79, ${p.alpha})`;
            ctx.fill();
            p.alpha -= TRAIL_FADE;
            p.size  += 0.1;
        }
        trail = trail.filter((p) => p.alpha > 0);
        requestAnimationFrame(tick);
    };
    tick();
}
