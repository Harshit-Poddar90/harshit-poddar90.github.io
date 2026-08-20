/**
 * Two Three.js scenes:
 *   - hero:       a neural sphere that ignites bottom-up, then pulses and
 *                 shuttles "data packets" along its synapses.
 *   - background: a slow drifting particle field behind the whole page.
 *
 * Both bail out silently if the CDN failed, both recolour with the theme, and
 * both stop rendering when they are off-screen or the tab is hidden — the old
 * build kept two WebGL loops running at 60fps for the entire visit.
 */
import { $, hasFinePointer, prefersReducedMotion } from './config.js';
import { onThemeChange } from './theme.js';

const COLORS = {
    dark:  { node: 0xffffff, line: 0xc9724f, dust: 0xffffff },
    light: { node: 0x1c1917, line: 0x9e4624, dust: 0x44403c },
};

/**
 * Dust blending, per theme.
 *
 * Additive blending only ever ADDS light, so on the light page a dark particle
 * contributed nothing and the whole dust field was invisible no matter what
 * colour it was set to. Normal blending is the only mode that can darken a
 * pixel, so light mode uses that — and needs a little more opacity, since it
 * no longer gets the glow additive gave it for free.
 */
const DUST_BLEND = {
    dark:  { mode: 'additive', opacity: 0.55 },
    light: { mode: 'normal',   opacity: 0.72 },
};

export function initScenes() {
    // Heavy WebGL is desktop-only; phones get the static gradient instead.
    if (typeof THREE === 'undefined' || prefersReducedMotion() ||
        window.innerWidth < 1024 || !hasFinePointer()) {
        $('#three-ai-canvas')?.remove();
        $('#hero-model-canvas')?.remove();
        return;
    }

    initHeroSphere();
    initBackgroundDust();
}

/**
 * Drive a render loop that pauses when `element` leaves the viewport or the
 * tab is backgrounded. Returns nothing; the loop owns its own lifetime.
 */
function createLoop(element, render) {
    let visible = true;
    let running = false;

    const frame = () => {
        if (!visible || document.hidden) { running = false; return; }
        render();
        requestAnimationFrame(frame);
    };

    const start = () => {
        if (running) return;
        running = true;
        requestAnimationFrame(frame);
    };

    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
    }, { threshold: 0 }).observe(element);

    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    start();
}

function initHeroSphere() {
    const canvas = $('#hero-model-canvas');
    if (!canvas) return;

    try {
        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(460, 460, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const group = new THREE.Group();
        const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const lineTemplate = new THREE.LineBasicMaterial({ color: 0xc9724f, transparent: true, opacity: 0 });

        // Fibonacci-ish sphere so nodes stay evenly spread.
        const NODE_COUNT = 75;
        const RADIUS = 1.8;
        const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const nodes = [];

        for (let i = 0; i < NODE_COUNT; i++) {
            const phi   = Math.acos(-1 + (2 * i) / NODE_COUNT);
            const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
            const jitter = 1 + (Math.random() - 0.5) * 0.15;

            const mesh = new THREE.Mesh(nodeGeo, nodeMaterial);
            mesh.position.set(
                RADIUS * Math.cos(theta) * Math.sin(phi) * jitter,
                RADIUS * Math.sin(theta) * Math.sin(phi) * jitter,
                RADIUS * Math.cos(phi) * jitter,
            );
            mesh.scale.setScalar(0);
            group.add(mesh);
            nodes.push({ mesh, phase: Math.random() * Math.PI * 2, lit: false, scale: 0 });
        }

        const edges = [];
        const THRESHOLD = 1.1;
        const lineMaterials = [];

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i].mesh.position;
                const b = nodes[j].mesh.position;
                if (a.distanceTo(b) >= THRESHOLD) continue;

                const material = lineTemplate.clone();
                lineMaterials.push(material);
                group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), material));
                edges.push({ material, phase: Math.random() * Math.PI * 2, start: a, end: b, lit: false, opacity: 0 });
            }
        }

        const packetGeo = new THREE.SphereGeometry(0.035, 6, 6);
        const packets = Array.from({ length: 25 }, () => {
            const mesh = new THREE.Mesh(packetGeo, nodeMaterial);
            mesh.visible = false;
            group.add(mesh);
            return { mesh, edge: edges[(Math.random() * edges.length) | 0], progress: Math.random() };
        });

        scene.add(group);
        camera.position.z = 5.5;

        onThemeChange((theme) => {
            const c = COLORS[theme];
            nodeMaterial.color.setHex(c.node);
            lineMaterials.forEach((m) => m.color.setHex(c.line));
        });

        let t = 0;
        let waveY = -2.5;   // ignition sweeps upward through the sphere

        createLoop(canvas, () => {
            t += 0.015;
            group.rotation.y += 0.003;
            group.rotation.x = Math.sin(t * 0.5) * 0.1;

            if (waveY < 2.5) waveY += 0.04;
            else packets.forEach((p) => { p.mesh.visible = true; });

            for (const node of nodes) {
                if (node.mesh.position.y < waveY) node.lit = true;
                if (!node.lit) continue;
                const target = 1 + Math.sin(t * 3 + node.phase) * 0.3;
                node.scale += (target - node.scale) * 0.1;
                node.mesh.scale.setScalar(node.scale);
            }

            for (const edge of edges) {
                if ((edge.start.y + edge.end.y) / 2 < waveY) edge.lit = true;
                if (!edge.lit) continue;
                const target = 0.05 + Math.max(0, Math.sin(t * 4 + edge.phase) * 0.6);
                edge.opacity += (target - edge.opacity) * 0.1;
                edge.material.opacity = edge.opacity;
            }

            for (const p of packets) {
                if (!p.mesh.visible) continue;
                p.progress += 0.02;
                if (p.progress >= 1) {
                    p.progress = 0;
                    p.edge = edges[(Math.random() * edges.length) | 0];
                }
                p.mesh.position.lerpVectors(p.edge.start, p.edge.end, p.progress);
            }

            renderer.render(scene, camera);
        });
    } catch (err) {
        console.warn('Hero scene disabled:', err);
        canvas.remove();
    }
}

/** Soft radial dot, generated once, so particles are round instead of square. */
function createDotTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function initBackgroundDust() {
    const canvas = $('#three-ai-canvas');
    if (!canvas) return;

    try {
        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const COUNT = 700;
        const positions = new Float32Array(COUNT * 3);
        for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 10;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.022,
            map: createDotTexture(),
            transparent: true,
            // Points render as hard squares without a map, which read as dead
            // pixels on a dark page rather than as dust.
            alphaTest: 0.01,
            depthWrite: false,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
        });
        onThemeChange((theme) => {
            const { mode, opacity } = DUST_BLEND[theme];
            material.color.setHex(COLORS[theme].dust);
            material.blending = mode === 'additive'
                ? THREE.AdditiveBlending
                : THREE.NormalBlending;
            material.opacity = opacity;
            // Blending is compiled into the material; without this the change
            // is ignored until something else forces a recompile.
            material.needsUpdate = true;
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        camera.position.z = 3;

        let mx = 0;
        let my = 0;
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX / window.innerWidth  - 0.5;
            my = e.clientY / window.innerHeight - 0.5;
        }, { passive: true });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        createLoop(canvas, () => {
            points.rotation.y += 0.001;
            points.rotation.x += 0.0005;
            points.position.x += (mx * 0.5 - points.position.x) * 0.05;
            points.position.y += (-my * 0.5 - points.position.y) * 0.05;
            renderer.render(scene, camera);
        });
    } catch (err) {
        console.warn('Background scene disabled:', err);
        canvas.remove();
    }
}
