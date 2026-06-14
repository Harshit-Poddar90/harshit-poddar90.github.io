/**
 * HARSHIT PODDAR - AI/ML ENGINEER PORTFOLIO
 * Core JavaScript Architecture
 */

document.addEventListener("DOMContentLoaded", () => {
    
    /* ==========================================================================
       01. BOOT SEQUENCE & MATRIX RAIN
       ========================================================================== */
    const bootScreen = document.getElementById('boot-screen');
    const bootLogs = document.getElementById('boot-logs');
    const bootProgress = document.getElementById('boot-progress-fill');
    const bootPercentage = document.getElementById('boot-percentage');
    
    // Matrix Rain Background
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

    // Boot Logs Sequence
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

    // Start Boot
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
        
        // Update main cursor
        cursor.style.left = `${mouse.x}px`;
        cursor.style.top = `${mouse.y}px`;
        
        // Add to trail
        trail.push({ x: mouse.x, y: mouse.y, alpha: 1, size: 3 });
    });

    // Hover effects for links/buttons
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

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 700;
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            color: 0x06b6d4, // Neon Cyan
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        camera.position.z = 3;

        // Mouse interaction for Three.js
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
            
            // Parallax effect
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

    // Initialize Particles.js overlay
    if (window.particlesJS) {
        particlesJS("particles-container", {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#8b5cf6", "#ec4899"] },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#8b5cf6", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interact": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } },
                "modes": { "grab": { "distance": 200, "line_linked": { "opacity": 0.5 } } }
            },
            "retina_detect": true
        });
    }

    /* ==========================================================================
       04. GSAP ANIMATIONS & SCROLL TRIGGER
       ========================================================================== */
    gsap.registerPlugin(ScrollTrigger);

    const initHeroAnimations = () => {
        // Init Typed.js
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
        // Reveal Cards
        gsap.utils.toArray('.reveal-card').forEach(card => {
            gsap.to(card, {
                scrollTrigger: { trigger: card, start: "top 85%" },
                y: 0, opacity: 1, duration: 0.8, ease: "power3.out"
            });
        });

        // Reveal Text (Clip Path)
        gsap.utils.toArray('.reveal-text').forEach(text => {
            gsap.to(text, {
                scrollTrigger: { trigger: text, start: "top 85%" },
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                opacity: 1, duration: 1, ease: "power3.out"
            });
        });

        // Timeline Items
        gsap.utils.toArray('.timeline-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: { trigger: item, start: "top 85%" },
                x: -50, opacity: 0, duration: 0.8, ease: "power3.out"
            });
        });

        // Counters
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

        // Navbar Blur & Hide on Scroll down
        let lastScroll = 0;
        const navbar = document.getElementById('navbar');
        const scrollProgress = document.getElementById('scroll-progress-bar');
        const backToTop = document.getElementById('back-to-top');

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Scroll Progress
            const totalScroll = document.body.scrollHeight - window.innerHeight;
            scrollProgress.style.width = `${(currentScroll / totalScroll) * 100}%`;

            // Navbar hide/show
            if (currentScroll > 100) {
                if (currentScroll > lastScroll) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            // Back to top button
            if (currentScroll > 500) backToTop.classList.add('visible');
            else backToTop.classList.remove('visible');

            lastScroll = currentScroll;
            
            // Active Nav Link updating
            const sections = document.querySelectorAll('section');
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            document.querySelectorAll('.nav-link').forEach(li => {
                li.classList.remove('active');
                if (li.getAttribute('href').includes(current)) {
                    li.classList.add('active');
                }
            });
        });
    };

    // Smooth Scroll for Nav Links & Back to Top
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
       05. 3D TILT EFFECT (Vanilla JS Fallback)
       ========================================================================== */
    const tiltElements = document.querySelectorAll('.3d-tilt');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
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
       06. LIVE AI DASHBOARD & DRAGGABLE
       ========================================================================== */
    const dashboard = document.getElementById('live-ai-dashboard');
    
    // Show dashboard after scroll
    ScrollTrigger.create({
        trigger: "#about",
        start: "top center",
        onEnter: () => { dashboard.style.display = 'block'; gsap.from(dashboard, {x: 100, opacity: 0, duration: 0.5}); }
    });

    // Mock Live Metrics Updates
    setInterval(() => {
        const vram = (22.0 + Math.random() * 0.8).toFixed(1);
        const latency = Math.floor(10 + Math.random() * 5);
        const tps = Math.floor(130 + Math.random() * 20);
        
        document.querySelector('.gpu-val').textContent = `${vram} GB`;
        document.querySelector('.latency-val').textContent = `${latency} ms`;
        document.querySelector('.tps-val').textContent = tps;
        
        drawMiniChart();
    }, 2000);

    // Mini Chart drawing
    let chartData = [1.0, 0.8, 0.6, 0.4, 0.3, 0.25, 0.2];
    const drawMiniChart = () => {
        const c = document.getElementById('mini-loss-chart');
        if(!c) return;
        const ctx = c.getContext('2d');
        ctx.clearRect(0,0,c.width,c.height);
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        
        chartData.push(0.15 + Math.random() * 0.05);
        if(chartData.length > 10) chartData.shift();
        
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
       07. COMMAND PALETTE (CMD + K)
       ========================================================================== */
    const cmdPalette = document.getElementById('command-palette');
    const cmdInput = document.getElementById('cmd-input');
    const cmdTrigger = document.getElementById('cmd-palette-trigger');
    const cmdResults = document.getElementById('cmd-results');

    const commands = [
        { name: "Go to About", action: () => window.location.hash = "#about" },
        { name: "View Projects/Architectures", action: () => window.location.hash = "#projects" },
        { name: "Download CV", action: () => window.open('CV_update.pdf', '_blank') },
        { name: "Toggle Light/Dark Theme", action: () => document.getElementById('theme-toggle').click() },
        { name: "Send Email", action: () => window.location.hash = "#contact" }
    ];

    const toggleCmd = () => {
        cmdPalette.classList.toggle('hidden');
        if(!cmdPalette.classList.contains('hidden')) {
            cmdInput.focus();
            renderCmdResults(commands);
        }
    };

    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            toggleCmd();
        }
        if (e.key === 'Escape' && !cmdPalette.classList.contains('hidden')) {
            toggleCmd();
        }
    });

    cmdTrigger.addEventListener('click', toggleCmd);
    cmdPalette.addEventListener('click', (e) => {
        if(e.target === cmdPalette) toggleCmd();
    });

    const renderCmdResults = (results) => {
        cmdResults.innerHTML = '';
        results.forEach(cmd => {
            const li = document.createElement('li');
            li.className = 'padding-1rem border-bottom-glass cursor-pointer hover-bg-glass text-sm code-font';
            li.style.padding = "1rem"; li.style.borderBottom = "1px solid rgba(255,255,255,0.1)"; li.style.cursor = "pointer";
            li.textContent = `> ${cmd.name}`;
            li.addEventListener('click', () => {
                cmd.action();
                toggleCmd();
            });
            cmdResults.appendChild(li);
        });
    };

    cmdInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = commands.filter(c => c.name.toLowerCase().includes(val));
        renderCmdResults(filtered);
    });

    /* ==========================================================================
       08. AI ASSISTANT CHATBOT
       ========================================================================== */
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    chatToggle.addEventListener('click', () => chatWindow.classList.remove('hidden'));
    chatClose.addEventListener('click', () => chatWindow.classList.add('hidden'));

    const addMessage = (text, isAi = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${isAi ? 'ai-msg' : 'user-msg'}`;
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const getAIResponse = (input) => {
        input = input.toLowerCase();
        if (input.includes('lungmate')) return "LungMate is my hybrid Computer Vision system utilizing EfficientNet-B3, Swin Transformers, and YOLOv11 for multi-metric tumor quantification, integrated with a PyQt GUI.";
        if (input.includes('skills') || input.includes('tech')) return "My primary stack includes PyTorch, YOLOv11, LangChain (RAG), Python, GCP, and MLflow.";
        if (input.includes('hire') || input.includes('why')) return "I transition complex AI research into deployable solutions. I have 15+ publications, 2 patents, and hands-on experience building multimodal systems at KTH and ISRO.";
        if (input.includes('education') || input.includes('kth')) return "I am currently an M.Sc. Machine Learning student at KTH Royal Institute of Technology in Stockholm.";
        return "I am processing your query. Please refer to the specific sections above or contact Harshit directly via the secure form.";
    };

    const handleChat = () => {
        const val = chatInput.value.trim();
        if(!val) return;
        addMessage(val, false);
        chatInput.value = '';
        
        // Typing indicator simulation
        setTimeout(() => {
            addMessage(getAIResponse(val), true);
        }, 600);
    };

    chatSend.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleChat(); });

    /* ==========================================================================
       09. NEURAL SKILLS GRAPH (Canvas connecting DOM nodes)
       ========================================================================== */
    const skillsCanvas = document.getElementById('skills-network-canvas');
    const htmlNodes = document.querySelectorAll('.skill-node');
    
    if (skillsCanvas && htmlNodes.length > 0) {
        const sCtx = skillsCanvas.getContext('2d');
        
        // Randomly position nodes within the container initially
        const container = document.querySelector('.skills-network-wrapper');
        htmlNodes.forEach(node => {
            const x = 10 + Math.random() * 80; // percentage
            const y = 10 + Math.random() * 80;
            node.style.left = `${x}%`;
            node.style.top = `${y}%`;
        });

        const drawSkillConnections = () => {
            const rect = container.getBoundingClientRect();
            skillsCanvas.width = rect.width;
            skillsCanvas.height = rect.height;
            
            sCtx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);
            sCtx.lineWidth = 1;
            
            const nodePositions = Array.from(htmlNodes).map(node => {
                const nRect = node.getBoundingClientRect();
                return {
                    x: nRect.left - rect.left + nRect.width/2,
                    y: nRect.top - rect.top + nRect.height/2,
                    cat: node.getAttribute('data-category')
                };
            });

            // Draw lines between same categories
            for(let i=0; i<nodePositions.length; i++) {
                for(let j=i+1; j<nodePositions.length; j++) {
                    const n1 = nodePositions[i];
                    const n2 = nodePositions[j];
                    const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                    
                    if(dist < 250) {
                        sCtx.beginPath();
                        sCtx.moveTo(n1.x, n1.y);
                        sCtx.lineTo(n2.x, n2.y);
                        
                        if(n1.cat === n2.cat) {
                            if(n1.cat === 'ai') sCtx.strokeStyle = `rgba(6, 182, 212, ${1 - dist/250})`;
                            else if(n1.cat === 'data') sCtx.strokeStyle = `rgba(139, 92, 246, ${1 - dist/250})`;
                            else sCtx.strokeStyle = `rgba(236, 72, 153, ${1 - dist/250})`;
                        } else {
                            sCtx.strokeStyle = `rgba(255, 255, 255, ${0.1 - dist/2500})`; // faint cross-connections
                        }
                        sCtx.stroke();
                    }
                }
            }
        };

        // Redraw on window resize or when hovering (since they scale)
        window.addEventListener('resize', drawSkillConnections);
        htmlNodes.forEach(n => n.addEventListener('mouseenter', () => setTimeout(drawSkillConnections, 300)));
        htmlNodes.forEach(n => n.addEventListener('mouseleave', () => setTimeout(drawSkillConnections, 300)));
        
        // Initial draw
        setTimeout(drawSkillConnections, 500);
    }

    /* ==========================================================================
       10. TERMINAL TYPING ANIMATION
       ========================================================================== */
    const terminalOutput = document.getElementById('terminal-output-container');
    const termLines = [
        { text: "harshit@macbook:~$ git clone https://github.com/harshitpoddar/LungMate.git", type: "cmd" },
        { text: "Cloning into 'LungMate'...", type: "out" },
        { text: "remote: Enumerating objects: 342, done.", type: "out" },
        { text: "harshit@macbook:~/LungMate$ python train.py --epochs 100", type: "cmd" },
        { text: "Loading EfficientNet-B3 checkpoint...", type: "warn" },
        { text: "Training started on CUDA device 0 (RTX 4090)", type: "succ" },
        { text: "Epoch 100/100 - loss: 0.12 - val_accuracy: 0.987", type: "out" },
        { text: "Saving checkpoint...", type: "out" },
        { text: "harshit@macbook:~/LungMate$ ./deploy.sh", type: "cmd" },
        { text: "Deployment to edge device successful.", type: "succ" }
    ];

    let termIndex = 0;
    let terminalStarted = false;

    const typeTerminal = () => {
        if (termIndex < termLines.length) {
            const line = termLines[termIndex];
            const p = document.createElement('p');
            
            if(line.type === 'cmd') {
                p.innerHTML = `<span class="prompt-user">harshit@macbook</span>:<span class="prompt-dir">~</span>$ <span class="typing-text"></span>`;
                terminalOutput.appendChild(p);
                
                // Type character by character
                const textSpan = p.querySelector('.typing-text');
                let charIdx = 0;
                const typeChar = () => {
                    if(charIdx < line.text.split('$ ')[1].length) {
                        textSpan.textContent += line.text.split('$ ')[1].charAt(charIdx);
                        charIdx++;
                        setTimeout(typeChar, 30);
                    } else {
                        termIndex++;
                        setTimeout(typeTerminal, 400);
                    }
                };
                typeChar();
            } else {
                p.className = `terminal-output ${line.type === 'warn' ? 'warning' : line.type === 'succ' ? 'success' : ''}`;
                p.textContent = line.text;
                terminalOutput.appendChild(p);
                termIndex++;
                setTimeout(typeTerminal, 100);
            }
        } else {
            const p = document.createElement('p');
            p.innerHTML = `<span class="prompt-user">harshit@macbook</span>:<span class="prompt-dir">~/LungMate</span>$ <span class="blinking-cursor"></span>`;
            terminalOutput.appendChild(p);
        }
    };

    ScrollTrigger.create({
        trigger: "#terminal-section",
        start: "top 70%",
        onEnter: () => {
            if(!terminalStarted) {
                terminalStarted = true;
                setTimeout(typeTerminal, 500);
            }
        }
    });

    /* ==========================================================================
       11. DARK/LIGHT THEME TOGGLE & FORM SUBMISSION
       ========================================================================== */
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    
    // Check local storage
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        themeBtn.innerHTML = savedTheme === 'light' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }

    themeBtn.addEventListener('click', () => {
        const currTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currTheme === 'dark' ? 'light' : 'dark';
        
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        themeBtn.innerHTML = newTheme === 'light' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });

    // Contact Form
    const form = document.getElementById('contact-form');
    const successMsg = document.querySelector('.form-success-msg');
    const submitBtn = document.querySelector('.submit-btn .btn-text');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBtn.textContent = 'Transmitting...';
            
            // Mock API call delay
            setTimeout(() => {
                submitBtn.textContent = 'Execute Transmission';
                form.reset();
                successMsg.classList.remove('hidden');
                
                // Hide message after 5 seconds
                setTimeout(() => successMsg.classList.add('hidden'), 5000);
            }, 1500);
        });
    }

    /* ==========================================================================
       12. MOBILE MENU TOGGLE
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