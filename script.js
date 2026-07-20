/**
 * HARSHIT PODDAR - AI/ML ENGINEER PORTFOLIO
 * Core JavaScript Architecture (Optimized Build)
 */
// Global Theme Toggle Function 
window.toggleTheme = function() {
    const htmlEl = document.documentElement;
    const currentTheme = htmlEl.getAttribute('data-theme');
    const themeIcon = document.getElementById('theme-icon');

    if (currentTheme === 'dark') {
        // --- SWITCH TO LIGHT MODE ---
        htmlEl.setAttribute('data-theme', 'light');
        
        // Change Sun to Moon
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        
        if (window.particlesMaterialRef) window.particlesMaterialRef.color.setHex(0x000000); 
        if (window.networkNodeMat) window.networkNodeMat.color.setHex(0x0f172a); 
        if (window.networkLineMat) window.networkLineMat.color.setHex(0x9e4624); 

    } else {
        // --- SWITCH TO DARK MODE ---
        htmlEl.setAttribute('data-theme', 'dark');
        
        // Change Moon to Sun
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        
        if (window.particlesMaterialRef) window.particlesMaterialRef.color.setHex(0xffffff);
        if (window.networkNodeMat) window.networkNodeMat.color.setHex(0xffffff); 
        if (window.networkLineMat) window.networkLineMat.color.setHex(0xb05b3d); 
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Global references for Theme Toggling
    window.particlesMaterialRef = null;
    window.heroMaterialRef = null;
    // Safe-mount custom cursor to prevent blocking navigation if CDN fails
    if (window.matchMedia('(pointer: fine)').matches) {
        document.body.classList.add('custom-cursor-active');
    }

    /* ==========================================================================
       01. BOOT SEQUENCE & MATRIX RAIN
       ========================================================================== */
    const bootScreen = document.getElementById('boot-screen');
    const bootLogs = document.getElementById('boot-logs');
    const bootProgress = document.getElementById('boot-progress-fill');
    const bootPercentage = document.getElementById('boot-percentage');
    
    const createMatrixRain = () => {
        const matrixContainer = document.getElementById('boot-matrix');
        if (!matrixContainer) return null;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        matrixContainer.appendChild(canvas);
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*'.split('');
        const drops = Array(Math.floor(canvas.width / 14)).fill(1);
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#22c55e'; 
            ctx.font = '14px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 14, drops[i] * 14);
                if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        return setInterval(draw, 33);
    };

    const matrixInterval = createMatrixRain();

    const logs = [
        "Initializing Neural Network...",
        "Loading EfficientNet-B3 Model... [OK]",
        "Connecting GPU Cluster (RTX 4090)... [OK]",
        "Loading RAG Vector Database...",
        "Building Knowledge Graph...",
        "Loading Swin Transformer Attention Maps...",
        "Optimizing Parameters...",
        "Launching AI Portfolio... [SUCCESS]"
    ];

    let logIndex = 0;
    const runBootSequence = () => {
        if (logIndex < logs.length) {
            if (bootLogs) {
                const p = document.createElement('p');
                p.textContent = `> ${logs[logIndex]}`;
                bootLogs.appendChild(p);
            }
            
            const progress = ((logIndex + 1) / logs.length) * 100;
            if (bootProgress) bootProgress.style.width = `${progress}%`;
            if (bootPercentage) bootPercentage.textContent = `${Math.floor(progress)}%`;
            
            logIndex++;
            setTimeout(runBootSequence, Math.random() * 300 + 150);
        } else {
            setTimeout(() => {
                clearInterval(matrixInterval);
                if (bootScreen) {
                    gsap.to(bootScreen, { 
                        opacity: 0, 
                        duration: 1, 
                        ease: "power2.out",
                        onComplete: () => {
                            bootScreen.style.display = 'none';
                            initHeroAnimations();
                        }
                    });
                } else {
                    initHeroAnimations();
                }
            }, 800);
        }
    };

    runBootSequence();

    /* ==========================================================================
       02. CUSTOM CURSOR & MOUSE TRAIL
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    const trailCanvas = document.getElementById('cursor-trail-canvas');
    let tCtx = null;
    
    if (trailCanvas) {
        tCtx = trailCanvas.getContext('2d');
        const resizeTrail = () => {
            trailCanvas.width = window.innerWidth;
            trailCanvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeTrail);
        resizeTrail();
    }

    let mouse = { x: -100, y: -100 };
    let trail = [];

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        if (cursor) {
            cursor.style.left = `${mouse.x}px`;
            cursor.style.top = `${mouse.y}px`;
        }
        
        trail.push({ x: mouse.x, y: mouse.y, alpha: 1, size: 3 });
    });

    document.querySelectorAll('a, button, .interactive, .skill-node').forEach(el => {
        el.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('hovering') });
        el.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('hovering') });
    });

    const animateTrail = () => {
        if (!tCtx) return;
        tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
        for (let i = 0; i < trail.length; i++) {
            let p = trail[i];
            tCtx.beginPath();
            tCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            tCtx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
            tCtx.fill();
            p.alpha -= 0.04; 
            p.size += 0.1;
        }
        trail = trail.filter(p => p.alpha > 0);
        requestAnimationFrame(animateTrail);
    };
    
    if (window.innerWidth > 1024 && window.matchMedia('(pointer: fine)').matches) {
        animateTrail();
    }

   const initHeroModel = () => {
        try {
            const canvas = document.getElementById('hero-model-canvas');
            if (!canvas || typeof THREE === 'undefined') return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setSize(500, 500);

            const group = new THREE.Group();

            // --- 1. MATERIALS ---
            const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
            const lineMaterialBase = new THREE.LineBasicMaterial({
                color: 0xb05b3d, 
                transparent: true,
                opacity: 0.15
            });

            window.networkNodeMat = nodeMaterial;
            window.networkLineMat = lineMaterialBase;

            // --- 2. BUILD THE SPHERICAL DISTRIBUTION ---
            const numNodes = 75; 
            const radius = 1.8;  
            const nodes = [];

            for (let i = 0; i < numNodes; i++) {
                const phi = Math.acos(-1 + (2 * i) / numNodes);
                const theta = Math.sqrt(numNodes * Math.PI) * phi;
                const noise = 1 + (Math.random() - 0.5) * 0.15;

                const x = radius * Math.cos(theta) * Math.sin(phi) * noise;
                const y = radius * Math.sin(theta) * Math.sin(phi) * noise;
                const z = radius * Math.cos(phi) * noise;

                const sphereGeo = new THREE.SphereGeometry(0.06, 16, 16);
                const sphere = new THREE.Mesh(sphereGeo, nodeMaterial);
                sphere.position.set(x, y, z);

                nodes.push({ mesh: sphere, phase: Math.random() * Math.PI * 2 });
                group.add(sphere);
            }

            // --- 3. BUILD THE SYNAPSES ---
            const edges = [];
            const connectThreshold = 1.1; 

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
                    
                    if (dist < connectThreshold) {
                        const points = [nodes[i].mesh.position, nodes[j].mesh.position];
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        
                        const edgeMat = lineMaterialBase.clone(); 
                        const line = new THREE.Line(geometry, edgeMat);
                        
                        // We store the start and end coordinates so our data packets know where to travel
                        edges.push({ 
                            mat: edgeMat, 
                            phase: Math.random() * Math.PI * 2,
                            start: nodes[i].mesh.position,
                            end: nodes[j].mesh.position
                        });
                        group.add(line);
                    }
                }
            }

            // --- 4. RADIATING DATA PACKETS (The "Electrons") ---
            const packets = [];
            // Make them slightly smaller than the main nodes
            const packetGeo = new THREE.SphereGeometry(0.035, 8, 8); 
            
            // Generate 25 high-speed packets
            for (let i = 0; i < 25; i++) {
                // They use the nodeMaterial so they instantly support Light/Dark mode!
                const packet = new THREE.Mesh(packetGeo, nodeMaterial); 
                group.add(packet);
                
                packets.push({
                    mesh: packet,
                    edge: edges[Math.floor(Math.random() * edges.length)], // Pick a random starting path
                    progress: Math.random() // Start at a random point on that path
                });
            }

            // --- 5. STAGING ---
            scene.add(group);
            camera.position.z = 5.5;

            // --- 6. THE ANIMATION LOOP ---
            let time = 0;
            const animate = () => {
                requestAnimationFrame(animate);
                time += 0.015;

                // Smooth rotation
                group.rotation.y += 0.003;
                group.rotation.x = Math.sin(time * 0.5) * 0.1;

                // Breathing Nodes
                nodes.forEach(node => {
                    const scale = 1 + Math.sin(time * 3 + node.phase) * 0.3;
                    node.mesh.scale.set(scale, scale, scale);
                });

                // Firing Synapses
                edges.forEach(edge => {
                    edge.mat.opacity = 0.05 + Math.max(0, Math.sin(time * 4 + edge.phase) * 0.6);
                });

                // HIGH SPEED DATA TRANSMISSION (Electrons)
                packets.forEach(p => {
                    p.progress += 0.02; // Speed of the transmission
                    if (p.progress >= 1) {
                        p.progress = 0; // Reset progress
                        p.edge = edges[Math.floor(Math.random() * edges.length)]; // Grab a completely new random path to travel
                    }
                    // Mathematically slide the packet from the start of the line to the end of the line
                    p.mesh.position.lerpVectors(p.edge.start, p.edge.end, p.progress);
                });

                renderer.render(scene, camera);
            };
            animate();

        } catch (e) {
            console.error("Hero model initialization bypassed.", e);
        }
    };
    
    const initThreeJS = () => {
        try {
            const canvas = document.getElementById('three-ai-canvas');
            if (!canvas) return;
            if (typeof THREE === 'undefined') return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            const particlesGeometry = new THREE.BufferGeometry();
            const particlesCount = 700;
            const posArray = new Float32Array(particlesCount * 3);
            
            for(let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 10;
            }
            
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            
            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.015,
                color: 0xffffff, // Set to white for dark mode contrast
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            window.particlesMaterialRef = particlesMaterial; // Save reference
            
            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);
            camera.position.z = 3;

            let mouseX = 0;
            let mouseY = 0;
            window.addEventListener('mousemove', (event) => {
                mouseX = event.clientX / window.innerWidth - 0.5;
                mouseY = event.clientY / window.innerHeight - 0.5;
            });

            const animateThree = () => {
                requestAnimationFrame(animateThree);
                particlesMesh.rotation.y += 0.001;
                particlesMesh.rotation.x += 0.0005;
                
                particlesMesh.position.x += (mouseX * 0.5 - particlesMesh.position.x) * 0.05;
                particlesMesh.position.y += (-mouseY * 0.5 - particlesMesh.position.y) * 0.05;
                
                renderer.render(scene, camera);
            };
            animateThree();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        } catch (e) {
            console.error("Background AI canvas initialization bypassed.");
        }
    };

    if (window.innerWidth > 1024 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initHeroModel();
        initThreeJS();
    } else {
        const canvasBg = document.getElementById('three-ai-canvas');
        const canvasHero = document.getElementById('hero-model-canvas');
        if (canvasBg) canvasBg.style.display = 'none';
        if (canvasHero) canvasHero.style.display = 'none';
    }

    /* ==========================================================================
       04. GSAP ANIMATIONS & SCROLL TRIGGER
       ========================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    const initHeroAnimations = () => {
        if (document.getElementById('typed-roles')) {
            new Typed('#typed-roles', {
                strings: [
                    'Computer Vision Engineer', 
                    'Multimodal AI Specialist', 
                    'MLOps Architect',
                    'RAG Systems Developer',
                    'LLM Researcher'
                ],
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 2000,
                loop: true,
                cursorChar: ''
            });
        }

        const tl = gsap.timeline();
        tl.to(".fade-up", {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out"
        });

        initScrollAnimations();
    };

    const initScrollAnimations = () => {
        gsap.utils.toArray('.reveal-card').forEach(card => {
            gsap.to(card, {
                scrollTrigger: { trigger: card, start: "top 85%" },
                y: 0, opacity: 1, duration: 0.8, ease: "power3.out"
            });
        });

        gsap.utils.toArray('.reveal-text').forEach(text => {
            gsap.to(text, {
                scrollTrigger: { trigger: text, start: "top 85%" },
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                opacity: 1, duration: 1, ease: "power3.out"
            });
        });

        gsap.utils.toArray('.timeline-item').forEach((item) => {
            gsap.to(item, {
                scrollTrigger: { trigger: item, start: "top 85%" },
                x: 0, opacity: 1, duration: 0.8, ease: "power3.out"
            });
        });

        gsap.utils.toArray('.counter').forEach(counter => {
            ScrollTrigger.create({
                trigger: counter,
                start: "top 90%",
                once: true,
                onEnter: () => {
                    const target = +counter.getAttribute('data-target');
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 2,
                        snap: { innerHTML: 1 },
                        ease: "power2.out"
                    });
                }
            });
        });

        let lastScroll = 0;
        const navbar = document.getElementById('navbar');
        const scrollProgress = document.getElementById('scroll-progress-bar');
        const backToTop = document.getElementById('back-to-top');

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const totalScroll = document.body.scrollHeight - window.innerHeight;
            
            if (scrollProgress) scrollProgress.style.width = `${(currentScroll / totalScroll) * 100}%`;

            if (navbar && currentScroll > 100) {
                if (currentScroll > lastScroll) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            if (backToTop) {
                if (currentScroll > 500) backToTop.classList.add('visible');
                else backToTop.classList.remove('visible');
            }

            lastScroll = currentScroll;
            
            const sections = document.querySelectorAll('section');
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            document.querySelectorAll('.dot-link').forEach(dot => {
                dot.classList.remove('active');
                if (current && dot.getAttribute('href').includes(current)) {
                    dot.classList.add('active');
                }
            });
        });
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    const b2t = document.getElementById('back-to-top');
    if (b2t) {
        b2t.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ==========================================================================
       05. 3D TILT EFFECT
       ========================================================================== */
    const tiltElements = document.querySelectorAll('.tilt-3d');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            el.style.transition = `transform 0.5s ease`;
        });
        
        el.addEventListener('mouseenter', () => {
            el.style.transition = `none`;
        });
    });

    /* ==========================================================================
       09. CONTACT FORM TRANSMISSION (API INTEGRATION)
       ========================================================================== */
    const form = document.getElementById('contact-form');
    const successMsg = document.querySelector('.form-success-msg');
    const submitBtn = document.querySelector('.submit-btn .btn-text');

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            if (submitBtn) submitBtn.textContent = 'Transmitting...';
            
            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    if (submitBtn) submitBtn.textContent = 'Execute Transmission';
                    form.reset();
                    if (successMsg) successMsg.classList.remove('hidden');
                    setTimeout(() => { if (successMsg) successMsg.classList.add('hidden') }, 5000);
                } else {
                    if (submitBtn) submitBtn.textContent = 'Transmission Failed';
                    setTimeout(() => { if (submitBtn) submitBtn.textContent = 'Execute Transmission' }, 3000);
                }
            } catch (error) {
                if (submitBtn) submitBtn.textContent = 'Network Error';
                setTimeout(() => { if (submitBtn) submitBtn.textContent = 'Execute Transmission' }, 3000);
            }
        });
    }

    /* ==========================================================================
       10. MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if(mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', () => {
            navLinksContainer.style.display = navLinksContainer.style.display === 'flex' ? 'none' : 'flex';
            navLinksContainer.style.flexDirection = 'column';
            navLinksContainer.style.position = 'absolute';
            navLinksContainer.style.top = '80px';
            navLinksContainer.style.right = '4%';
            navLinksContainer.style.background = 'var(--bg-glass)';
            navLinksContainer.style.padding = '2rem';
            navLinksContainer.style.borderRadius = 'var(--border-radius-sm)';
            navLinksContainer.style.border = '1px solid var(--border-glass)';
        });
    }

    /* ==========================================================================
       11. THEME TOGGLER (LIGHT/DARK MODE)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const htmlEl = document.documentElement;
            const currentTheme = htmlEl.getAttribute('data-theme');
            const themeIcon = themeToggleBtn.querySelector('i');

            if (currentTheme === 'dark') {
                // Switch to Light Mode
                htmlEl.setAttribute('data-theme', 'light');
                
                // If using sun/moon icons, swap them. (Ignored if using gear)
                if(themeIcon && themeIcon.classList.contains('fa-sun')) {
                    themeIcon.classList.replace('fa-sun', 'fa-moon');
                }
                
                // Make Three.js background particles black for visibility on white bg
                if (window.particlesMaterialRef) {
                    window.particlesMaterialRef.color.setHex(0x000000);
                }
            } else {
                // Switch to Dark Mode
                htmlEl.setAttribute('data-theme', 'dark');
                
                if(themeIcon && themeIcon.classList.contains('fa-moon')) {
                    themeIcon.classList.replace('fa-moon', 'fa-sun');
                }
                
                // Make Three.js background particles white for visibility on dark bg
                if (window.particlesMaterialRef) {
                    window.particlesMaterialRef.color.setHex(0xffffff);
                }
            }
        });
    }




});