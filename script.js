/**
 * HARSHIT PODDAR - AI/ML ENGINEER PORTFOLIO
 * Core JavaScript Architecture (Optimized Build)
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // Safe-mount custom cursor to prevent blocking navigation if CDN fails
    document.body.classList.add('custom-cursor-active');

    /* ==========================================================================
       01. BOOT SEQUENCE & MATRIX RAIN
       ========================================================================== */
    const bootScreen = document.getElementById('boot-screen');
    const bootLogs = document.getElementById('boot-logs');
    const bootProgress = document.getElementById('boot-progress-fill');
    const bootPercentage = document.getElementById('boot-percentage');
    
    const createMatrixRain = () => {
        const matrixContainer = document.getElementById('boot-matrix');
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
            const p = document.createElement('p');
            p.textContent = `> ${logs[logIndex]}`;
            bootLogs.appendChild(p);
            
            const progress = ((logIndex + 1) / logs.length) * 100;
            bootProgress.style.width = `${progress}%`;
            bootPercentage.textContent = `${Math.floor(progress)}%`;
            
            logIndex++;
            setTimeout(runBootSequence, Math.random() * 300 + 150);
        } else {
            setTimeout(() => {
                clearInterval(matrixInterval);
                gsap.to(bootScreen, { 
                    opacity: 0, 
                    duration: 1, 
                    ease: "power2.out",
                    onComplete: () => {
                        bootScreen.style.display = 'none';
                        initHeroAnimations();
                    }
                });
            }, 800);
        }
    };

    runBootSequence();

    /* ==========================================================================
       02. CUSTOM CURSOR & MOUSE TRAIL
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    const trailCanvas = document.getElementById('cursor-trail-canvas');
    const tCtx = trailCanvas.getContext('2d');
    
    const resizeTrail = () => {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeTrail);
    resizeTrail();

    let mouse = { x: -100, y: -100 };
    let trail = [];

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        cursor.style.left = `${mouse.x}px`;
        cursor.style.top = `${mouse.y}px`;
        
        trail.push({ x: mouse.x, y: mouse.y, alpha: 1, size: 3 });
    });

    document.querySelectorAll('a, button, .interactive, .skill-node').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    const animateTrail = () => {
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
    animateTrail();

    /* ==========================================================================
       03. THREE.JS AI BACKGROUND
       ========================================================================== */
    const initThreeJS = () => {
        const canvas = document.getElementById('three-ai-canvas');
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
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
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
    };
    initThreeJS();

    /* ==========================================================================
       04. GSAP ANIMATIONS & SCROLL TRIGGER
       ========================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    const initHeroAnimations = () => {
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
            gsap.from(item, {
                scrollTrigger: { trigger: item, start: "top 85%" },
                x: -50, opacity: 0, duration: 0.8, ease: "power3.out"
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
            scrollProgress.style.width = `${(currentScroll / totalScroll) * 100}%`;

            if (currentScroll > 100) {
                if (currentScroll > lastScroll) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            if (currentScroll > 500) backToTop.classList.add('visible');
            else backToTop.classList.remove('visible');

            lastScroll = currentScroll;
            
            const sections = document.querySelectorAll('section');
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            // Update Vertical Dot Nav
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

    document.getElementById('back-to-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ==========================================================================
       05. 3D TILT EFFECT
       ========================================================================== */
    const tiltElements = document.querySelectorAll('.3d-tilt');
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
       06. LIVE AI DASHBOARD & CONVERGENT LOSS CURVE
       ========================================================================== */
    const dashboard = document.getElementById('live-ai-dashboard');
    
    ScrollTrigger.create({
        trigger: "#about",
        start: "top center",
        onEnter: () => { dashboard.style.display = 'block'; gsap.from(dashboard, {x: 100, opacity: 0, duration: 0.5}); }
    });

    // Simulated convergent loss history (asymptotically approaching ~0.08 loss)
    let chartData = [0.85, 0.62, 0.45, 0.31, 0.22, 0.16, 0.12, 0.10, 0.09];
    
    setInterval(() => {
        const vram = (22.0 + Math.random() * 0.8).toFixed(1);
        const latency = Math.floor(10 + Math.random() * 4);
        const tps = Math.floor(138 + Math.random() * 10);
        
        document.querySelector('.gpu-val').textContent = `${vram} GB`;
        document.querySelector('.latency-val').textContent = `${latency} ms`;
        document.querySelector('.tps-val').textContent = tps;
        
        drawMiniChart();
    }, 2000);

    const drawMiniChart = () => {
        const c = document.getElementById('mini-loss-chart');
        if(!c) return;
        const ctx = c.getContext('2d');
        ctx.clearRect(0,0,c.width,c.height);
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        
        // Push micro-fluctuations around converged 0.08 threshold
        const nextLoss = 0.078 + (Math.random() * 0.012);
        chartData.push(nextLoss);
        if(chartData.length > 14) chartData.shift();
        
        const step = c.width / (chartData.length - 1);
        chartData.forEach((val, i) => {
            const x = i * step;
            const y = val * c.height;
            if(i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    };



    /* ==========================================================================
       09. CONTACT FORM TRANSMISSION
       ========================================================================== */
    const form = document.getElementById('contact-form');
    const successMsg = document.querySelector('.form-success-msg');
    const submitBtn = document.querySelector('.submit-btn .btn-text');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBtn.textContent = 'Transmitting...';
            
            setTimeout(() => {
                submitBtn.textContent = 'Execute Transmission';
                form.reset();
                successMsg.classList.remove('hidden');
                
                setTimeout(() => successMsg.classList.add('hidden'), 5000);
            }, 1500);
        });
    }

    /* ==========================================================================
       10. MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if(mobileToggle) {
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

});