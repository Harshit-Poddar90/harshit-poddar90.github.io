/**
 * Boot intro: particles swirl, snap into "HARSHIT PODDAR", then blow apart.
 *
 * Three rules keep it from being a liability on a recruiter's first visit:
 *   1. It plays once per session (sessionStorage), not on every navigation.
 *   2. It is skippable — button, Escape, or any click.
 *   3. It does not play at all under prefers-reduced-motion.
 */
import { CONFIG, $, prefersReducedMotion } from './config.js';

const PALETTE = ['#e0906c', '#c9724f', '#f5c6a5'];
const MAX_PARTICLES = 3500;   // caps the per-frame arc() cost on weak GPUs

/**
 * @returns {Promise<void>} resolves once the page is safe to reveal.
 */
export function runBootSequence() {
    const screen = $('#boot-screen');
    if (!screen) return Promise.resolve();

    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(CONFIG.bootSeenKey) === '1'; } catch { /* ignore */ }

    // A zero-sized viewport (restored background tab, hidden preview pane)
    // makes the canvas pixel-sampling below throw. Nothing to animate anyway.
    const tooSmall = window.innerWidth < 200 || window.innerHeight < 200;

    if (alreadySeen || prefersReducedMotion() || tooSmall) {
        screen.remove();
        return Promise.resolve();
    }

    try { sessionStorage.setItem(CONFIG.bootSeenKey, '1'); } catch { /* ignore */ }

    screen.hidden = false;
    return new Promise((resolve) => playIntro(screen, resolve));
}

function playIntro(screen, done) {
    const host    = $('#boot-canvas-host', screen);
    const caption = $('#boot-caption', screen);
    const skipBtn = $('#boot-skip', screen);

    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d');
    host.appendChild(canvas);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const particles = buildParticles(w, h);

    let phase = 'SWIRL';
    let shockwave = 0;
    let rafId = 0;
    const timers = [];
    let finished = false;

    const draw = () => {
        rafId = requestAnimationFrame(draw);

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = phase === 'EXPLODE' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';

        const cx = w / 2;
        const cy = h / 2;

        for (const p of particles) {
            if (phase === 'SWIRL') {
                p.angle += p.speed;
                const r = 240 + Math.sin(p.angle * 3) * 100;
                p.x += (cx + Math.cos(p.angle) * r - p.x) * 0.07;
                p.y += (cy + Math.sin(p.angle) * r - p.y) * 0.07;
            } else if (phase === 'FORM') {
                p.x += (p.tx - p.x) * 0.14;
                p.y += (p.ty - p.y) * 0.14;
            } else {
                p.x += p.vx * 4;
                p.y += p.vy * 4;
                p.size += 0.3;
            }

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (phase === 'EXPLODE') {
            shockwave += 42;
            ctx.strokeStyle = 'rgba(224,144,108,0.8)';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(cx, cy, shockwave, 0, Math.PI * 2);
            ctx.stroke();
        }
    };

    /** Tear everything down exactly once, whether we finished or were skipped. */
    const finish = () => {
        if (finished) return;
        finished = true;

        cancelAnimationFrame(rafId);
        timers.forEach(clearTimeout);
        skipBtn?.removeEventListener('click', finish);
        document.removeEventListener('keydown', onKey);
        screen.removeEventListener('click', finish);

        screen.style.transition = 'opacity 0.6s ease-out';
        screen.style.opacity = '0';
        setTimeout(() => { screen.remove(); done(); }, 600);
    };

    const onKey = (e) => { if (e.key === 'Escape') finish(); };

    skipBtn?.addEventListener('click', finish);
    screen.addEventListener('click', finish);
    document.addEventListener('keydown', onKey);

    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const D = CONFIG.bootDurationMs;

    at(D * 0.42, () => { phase = 'FORM';    caption.textContent = 'Forging neural pathways…'; });
    at(D * 0.78, () => { caption.textContent = 'Inference maximised.'; caption.style.color = '#fff'; });
    at(D,        () => { phase = 'EXPLODE'; caption.style.display = 'none'; });
    at(D + 420,  finish);

    draw();
}

/** Sample the pixels of the rendered name and turn each hit into a particle. */
function buildParticles(w, h) {
    const text = document.createElement('canvas');
    text.width = w;
    text.height = h;
    const tctx = text.getContext('2d', { willReadFrequently: true });

    tctx.fillStyle = '#fff';
    // Canvas fonts must be absolute units — `vw` is silently ignored here.
    const fontSize = Math.round(w * (w > 768 ? 0.1 : 0.15));
    tctx.font = `900 ${fontSize}px "Syncopate", sans-serif`;
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';

    // Half the baseline-to-baseline distance. Must scale with the font — a
    // fixed pixel offset let the two words collide once the viewport grew.
    const offset = fontSize * 0.62;
    tctx.fillText('HARSHIT', w / 2, h / 2 - offset);
    tctx.fillText('PODDAR',  w / 2, h / 2 + offset);

    const data = tctx.getImageData(0, 0, w, h).data;
    const targets = [];
    for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
            if (data[(y * w + x) * 4 + 3] > 128) targets.push([x, y]);
        }
    }

    // Uniformly thin out rather than truncating, so the name stays legible.
    const stride = Math.max(1, Math.ceil(targets.length / MAX_PARTICLES));

    const particles = [];
    for (let i = 0; i < targets.length; i += stride) {
        const [tx, ty] = targets[i];
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            tx, ty,
            color: PALETTE[(Math.random() * PALETTE.length) | 0],
            size: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.08 + 0.02,
        });
    }
    return particles;
}
