/* ============================================================
   THE CRYPT — app.js
   Built on top of existing structure.
   Libraries: GSAP (animation timeline)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* --------------------------------------------------------
       ELEMENT REFS
    -------------------------------------------------------- */
    const landingScreen   = document.getElementById("landing-screen");
    const skeletonScreen  = document.getElementById("skeleton-screen");
    const terminalScreen  = document.getElementById("terminal-screen");
    const skullTrigger    = document.getElementById("skull-trigger");
    const skeletonWrap    = document.getElementById("skeleton-puppet-wrap");
    const sceneDesk       = document.getElementById("scene-desk");
    const terminalOutput  = document.getElementById("terminal-output");
    const terminalTyped   = document.getElementById("terminal-typed");

    /* ---- audio refs (graceful — files may not exist yet) ---- */
    const audioClick   = document.getElementById("audio-click");
    const audioAmbient = document.getElementById("audio-ambient");
    const audioType    = document.getElementById("audio-type");

    function playSound(el) {
        if (!el) return;
        try { el.currentTime = 0; el.play(); } catch(e) {}
    }


    /* --------------------------------------------------------
       FILM GRAIN CANVAS
       Draws animated noise on a canvas overlay
    -------------------------------------------------------- */
    const grainCanvas = document.getElementById("grain-canvas");
    const grainCtx    = grainCanvas.getContext("2d");
    let   grainAnimId = null;

    function resizeGrain() {
        grainCanvas.width  = window.innerWidth;
        grainCanvas.height = window.innerHeight;
    }

    function drawGrain() {
        const w = grainCanvas.width;
        const h = grainCanvas.height;
        const imageData = grainCtx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255 | 0;
            data[i]   = v;
            data[i+1] = v;
            data[i+2] = v;
            data[i+3] = Math.random() * 60 | 0; // low alpha = subtle
        }

        grainCtx.putImageData(imageData, 0, 0);
        grainAnimId = requestAnimationFrame(drawGrain);
    }

    resizeGrain();
    window.addEventListener("resize", resizeGrain);
    drawGrain();


    /* --------------------------------------------------------
       SKULL CLICK → PHASE 2 (skeleton scene)
    -------------------------------------------------------- */
    skullTrigger.addEventListener("click", () => {
        playSound(audioClick);

        /* Fade out landing */
        landingScreen.style.transition = "opacity 0.7s ease";
        landingScreen.style.opacity    = "0";

        setTimeout(() => {
            landingScreen.classList.add("hidden");
            showSkeletonScene();
        }, 700);
    });


    /* --------------------------------------------------------
       PHASE 2: SKELETON SCENE
       GSAP timeline: walk in → sit → zoom to monitor → terminal
    -------------------------------------------------------- */
    function showSkeletonScene() {
        skeletonScreen.classList.remove("hidden");
        skeletonScreen.classList.add("current");

        /* Try ambient audio */
        try { audioAmbient && audioAmbient.play(); } catch(e) {}

        /* Fade desk in */
        gsap.to(sceneDesk, { opacity: 1, duration: 0.8, delay: 0.3 });

        /* --- WALK-IN TIMELINE --- */
        const tl = gsap.timeline({ delay: 0.5 });

        /* 1. Walk in from left — skeleton slides in with a bob */
        tl.to(skeletonWrap, {
            left: "38%",
            duration: 2.8,
            ease: "none",
            onStart: () => {
                skeletonWrap.classList.add("walking");
                animateLegsWalk(true);
            }
        });

        /* 2. Slow down near desk */
        tl.to(skeletonWrap, {
            left: "44%",
            duration: 1.0,
            ease: "power2.out",
            onComplete: () => {
                skeletonWrap.classList.remove("walking");
                animateLegsWalk(false);
            }
        });

        /* 3. Sit down — body lowers, legs fold */
        tl.add(() => sitDownAnimation());
        tl.to({}, { duration: 1.4 }); // wait for sit anim

        /* 4. Arms reach to keyboard */
        tl.add(() => reachForKeyboard());
        tl.to({}, { duration: 0.8 });

        /* 5. Skeleton "types" - small keyboard sound loop */
        tl.add(() => skeletonTyping());
        tl.to({}, { duration: 1.8 });

        /* 6. ZOOM INTO MONITOR — camera punches into the desk screen */
        tl.add(() => zoomToTerminal());
    }


    /* ---- LEG WALK CYCLE via GSAP ---- */
    let legAnim = { ll: null, rl: null };

    function animateLegsWalk(active) {
        const legLeft  = document.getElementById("leg-left");
        const legRight = document.getElementById("leg-right");
        if (!legLeft || !legRight) return;

        if (active) {
            /* Alternate leg swing using GSAP yoyo */
            legAnim.ll = gsap.to(legLeft, {
                rotation: 22,
                transformOrigin: "top center",
                duration: 0.22,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut"
            });
            legAnim.rl = gsap.to(legRight, {
                rotation: -22,
                transformOrigin: "top center",
                duration: 0.22,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
                delay: 0.11
            });

            /* Arm swing opposite to legs */
            gsap.to("#arm-left", {
                rotation: -18,
                transformOrigin: "top center",
                duration: 0.22,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
                delay: 0.11
            });
            gsap.to("#arm-right", {
                rotation: 18,
                transformOrigin: "top center",
                duration: 0.22,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut"
            });

        } else {
            /* Kill all and reset */
            gsap.killTweensOf([legLeft, legRight, "#arm-left", "#arm-right"]);
            gsap.to([legLeft, legRight, "#arm-left", "#arm-right"], {
                rotation: 0, duration: 0.3, ease: "power2.out"
            });
        }
    }


    /* ---- SIT DOWN ANIMATION ---- */
    function sitDownAnimation() {
        const legLeft  = document.getElementById("leg-left");
        const legRight = document.getElementById("leg-right");
        const pelvis   = document.getElementById("pelvis");

        /* Legs fold forward like sitting on a chair */
        gsap.to(legLeft, {
            rotation: -70,
            transformOrigin: "top center",
            duration: 0.9,
            ease: "power2.inOut"
        });
        gsap.to(legRight, {
            rotation: -70,
            transformOrigin: "top center",
            duration: 0.9,
            ease: "power2.inOut"
        });

        /* Body drops slightly */
        gsap.to(skeletonWrap, {
            y: 40,
            duration: 0.9,
            ease: "power2.inOut"
        });

        /* Skull tilts slightly down toward screen */
        gsap.to("#skull-head", {
            rotation: 12,
            transformOrigin: "bottom center",
            duration: 0.7,
            delay: 0.5,
            ease: "power2.out"
        });
    }


    /* ---- REACH FOR KEYBOARD ---- */
    function reachForKeyboard() {
        /* Arms swing forward/down toward keyboard */
        gsap.to("#arm-left", {
            rotation: 40,
            transformOrigin: "top center",
            duration: 0.6,
            ease: "power2.out"
        });
        gsap.to("#arm-right", {
            rotation: -40,
            transformOrigin: "top center",
            duration: 0.6,
            ease: "power2.out"
        });
    }


    /* ---- SKELETON "TYPES" (jitter) ---- */
    function skeletonTyping() {
        /* Quick finger jitter on both hands */
        gsap.to("#la-fore-group", {
            y: -4, rotation: 5,
            duration: 0.1,
            yoyo: true, repeat: 16,
            ease: "power1.inOut"
        });
        gsap.to("#ra-fore-group", {
            y: -4, rotation: -5,
            duration: 0.1,
            yoyo: true, repeat: 16,
            ease: "power1.inOut",
            delay: 0.05
        });

        /* Skull bobs as if reading */
        gsap.to("#skull-head", {
            rotation: 15,
            transformOrigin: "bottom center",
            duration: 0.4,
            yoyo: true, repeat: 4,
            ease: "power1.inOut"
        });
    }


    /* ---- ZOOM TO TERMINAL ---- */
    function zoomToTerminal() {
        /* Get desk monitor position — zoom camera toward it */
        const deskRect    = sceneDesk.getBoundingClientRect();
        const monitorRect = sceneDesk.querySelector(".monitor-bezel").getBoundingClientRect();

        /* Calculate offset from center */
        const targetX = monitorRect.left + monitorRect.width / 2 - window.innerWidth / 2;
        const targetY = monitorRect.top  + monitorRect.height / 2 - window.innerHeight / 2;

        const zoomTl = gsap.timeline({
            onComplete: () => {
                /* Switch to terminal screen */
                skeletonScreen.classList.remove("current");
                skeletonScreen.classList.add("hidden");
                showTerminalScreen();
            }
        });

        /* Scale up scene toward monitor */
        zoomTl.to("#skeleton-screen", {
            scale: 14,
            transformOrigin: `${monitorRect.left + monitorRect.width/2}px ${monitorRect.top + monitorRect.height/2}px`,
            duration: 1.4,
            ease: "power3.in"
        });

        zoomTl.to("#skeleton-screen", {
            opacity: 0,
            duration: 0.3
        }, "-=0.2");
    }


    /* --------------------------------------------------------
       PHASE 3: TERMINAL SCREEN
    -------------------------------------------------------- */
    function showTerminalScreen() {
        terminalScreen.classList.remove("hidden");
        terminalScreen.classList.add("current");

        /* Fade in */
        gsap.fromTo(terminalScreen,
            { opacity: 0, filter: "brightness(3)" },
            { opacity: 1, filter: "brightness(1)", duration: 0.6, ease: "power2.out" }
        );

        /* Boot sequence then HELP */
        runBootSequence();
    }


    /* --------------------------------------------------------
       TERMINAL ENGINE
    -------------------------------------------------------- */

    /* All terminal text lines queued for printing */
    let printQueue  = [];
    let isPrinting  = false;
    let charDelay   = 22;  /* ms per character */
    let lineDelay   = 120; /* ms between lines */
    let inputLocked = true;

    /* Add a line to the output with optional class */
    function addOutputLine(text, className = "", delay = 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                const span = document.createElement("span");
                span.classList.add("t-line");
                if (className) span.classList.add(className);
                span.textContent = text;
                terminalOutput.appendChild(span);
                scrollTerminal();

                /* Trigger the CSS appear animation */
                void span.offsetWidth;
                resolve();
            }, delay);
        });
    }

    /* Typewriter effect for a single line */
    function typewriterLine(text, className = "") {
        return new Promise(resolve => {
            const span = document.createElement("span");
            span.classList.add("t-line");
            if (className) span.classList.add(className);
            terminalOutput.appendChild(span);
            scrollTerminal();

            let i = 0;
            function typeChar() {
                if (i < text.length) {
                    span.textContent += text[i];
                    i++;
                    if (Math.random() > 0.85) playSound(audioType);
                    scrollTerminal();
                    setTimeout(typeChar, charDelay + Math.random() * 18);
                } else {
                    setTimeout(resolve, lineDelay);
                }
            }
            typeChar();
        });
    }

    function scrollTerminal() {
        const vp = document.getElementById("terminal-viewport");
        if (vp) vp.scrollTop = vp.scrollHeight;
    }

    /* BOOT SEQUENCE */
    async function runBootSequence() {
        inputLocked = true;

        const bootLines = [
            { text: "",                                          cls: "" },
            { text: "C R Y P T  O S   v 1 . 9 3 . 1",         cls: "t-title" },
            { text: "═══════════════════════════════════════",   cls: "t-dim" },
            { text: "",                                          cls: "" },
            { text: "BIOS initialising...",                      cls: "" },
            { text: "Memory check:      [████████████] 640K OK", cls: "" },
            { text: "Shadow RAM:        [HAUNTED]",              cls: "t-error" },
            { text: "Paranormal device: [DETECTED]",             cls: "t-error" },
            { text: "Soul integrity:    [NOMINAL]",              cls: "t-success" },
            { text: "",                                          cls: "" },
            { text: "Loading CRYPT.SYS .....",                   cls: "" },
            { text: "Loading SÉANCE.DRV ...",                    cls: "" },
            { text: "Loading SPIRIT.EXE ..",                     cls: "t-success" },
            { text: "",                                          cls: "" },
            { text: "THE CRYPT OS — ready.",                     cls: "t-success" },
            { text: "Type HELP to see available commands.",       cls: "t-dim" },
            { text: "",                                          cls: "" },
        ];

        for (const line of bootLines) {
            await typewriterLine(line.text, line.cls);
        }

        /* After boot: auto-type HELP */
        await autoTypeCommand("HELP");
        runHelpOutput();
    }


    /* Simulate the user typing a command into the input field */
    function autoTypeCommand(cmd) {
        return new Promise(resolve => {
            terminalTyped.textContent = "";
            inputLocked = true;
            let i = 0;
            function t() {
                if (i < cmd.length) {
                    terminalTyped.textContent += cmd[i];
                    playSound(audioType);
                    i++;
                    setTimeout(t, 90 + Math.random() * 40);
                } else {
                    setTimeout(() => {
                        /* echo the command as output */
                        addOutputLine(">> " + cmd, "cmd-echo");
                        terminalTyped.textContent = "";
                        resolve();
                    }, 400);
                }
            }
            setTimeout(t, 500);
        });
    }


    /* HELP OUTPUT */
    async function runHelpOutput() {
        const helpLines = [
            { text: "",                                                   cls: "" },
            { text: "┌─────────────────────────────────────────────┐",   cls: "t-dim" },
            { text: "│         AVAILABLE COMMANDS                  │",   cls: "t-dim" },
            { text: "├─────────────────────────────────────────────┤",   cls: "t-dim" },
            { text: "│  DIAGNOSTICS  — who / what is this entity   │",   cls: "" },
            { text: "│  ARCHIVE      — experiment files 199X       │",   cls: "" },
            { text: "│  TRANSMIT     — intercepted signal logs      │",   cls: "" },
            { text: "│  SÉANCE       — establish contact           │",   cls: "" },
            { text: "│  CLEAR        — clear terminal              │",   cls: "" },
            { text: "│  HELP         — show this again             │",   cls: "" },
            { text: "└─────────────────────────────────────────────┘",   cls: "t-dim" },
            { text: "",                                                   cls: "" },
            { text: "Enter command below ▼",                             cls: "t-dim" },
            { text: "",                                                   cls: "" },
        ];

        for (const line of helpLines) {
            await addOutputLine(line.text, line.cls, 60);
        }

        inputLocked = false;
        enableKeyboardInput();
    }


    /* --------------------------------------------------------
       KEYBOARD INPUT
    -------------------------------------------------------- */
    let userInput    = "";
    let inputEnabled = false;

    function enableKeyboardInput() {
        if (inputEnabled) return;
        inputEnabled = true;
        document.addEventListener("keydown", handleKeyDown);
    }

    function handleKeyDown(e) {
        if (inputLocked) return;

        if (e.key === "Enter") {
            const cmd = userInput.trim().toUpperCase();
            terminalTyped.textContent = "";
            userInput = "";
            processCommand(cmd);

        } else if (e.key === "Backspace") {
            userInput = userInput.slice(0, -1);
            terminalTyped.textContent = userInput;

        } else if (e.key.length === 1 && userInput.length < 20) {
            userInput += e.key;
            terminalTyped.textContent = userInput;
            playSound(audioType);
        }
    }


    /* --------------------------------------------------------
       COMMAND PROCESSOR
    -------------------------------------------------------- */
    async function processCommand(cmd) {
        inputLocked = true;
        await addOutputLine(">> " + cmd, "cmd-echo");
        await addOutputLine("", "");

        switch(cmd) {
            case "HELP":
                await runHelpOutput();
                break;

            case "DIAGNOSTICS":
                await addOutputLine("ACCESSING DIAGNOSTICS.LOG ...", "", 0);
                await delay(600);
                openSection("section-diagnostics");
                inputLocked = false;
                break;

            case "ARCHIVE":
                await addOutputLine("MOUNTING EXPERIMENT_ARCHIVE_199X ...", "", 0);
                await delay(600);
                openSection("section-archive");
                inputLocked = false;
                break;

            case "TRANSMIT":
                await addOutputLine("DECODING TRANSMISSIONS.TXT ...", "", 0);
                await delay(600);
                openSection("section-transmissions");
                inputLocked = false;
                break;

            case "SÉANCE":
            case "SEANCE":
                await addOutputLine("INITIALISING SÉANCE.EXE ...", "", 0);
                await delay(800);
                openSection("section-seance");
                inputLocked = false;
                break;

            case "CLEAR":
                terminalOutput.innerHTML = "";
                await addOutputLine("Terminal cleared.", "t-dim");
                await addOutputLine("Type HELP for commands.", "t-dim");
                await addOutputLine("", "");
                inputLocked = false;
                break;

            case "":
                inputLocked = false;
                break;

            default:
                await addOutputLine("ERROR: Unknown command '" + cmd + "'", "t-error");
                await addOutputLine("Type HELP for available commands.", "t-dim");
                await addOutputLine("", "");

                /* Spooky random response sometimes */
                if (Math.random() > 0.5) {
                    const spooky = [
                        "...the entity does not recognise this command.",
                        "...something stirred in the dark.",
                        "...try again. it is listening.",
                        "...incorrect. but it noticed you.",
                    ];
                    await addOutputLine(
                        spooky[Math.floor(Math.random() * spooky.length)],
                        "t-dim"
                    );
                    await addOutputLine("", "");
                }
                inputLocked = false;
                break;
        }
    }


    /* --------------------------------------------------------
       SECTION OVERLAY SYSTEM
    -------------------------------------------------------- */
    function openSection(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove("hidden");
        playSound(audioClick);
    }

    function closeSection(id) {
        const el = document.getElementById(id);
        if (!el) return;
        gsap.to(el, {
            x: "100%", opacity: 0, duration: 0.35, ease: "power2.in",
            onComplete: () => {
                el.classList.add("hidden");
                gsap.set(el, { x: 0, opacity: 1 });
            }
        });
        inputLocked = false;
    }

    /* Wire up all close buttons */
    document.querySelectorAll(".close-section").forEach(btn => {
        btn.addEventListener("click", () => {
            closeSection(btn.dataset.target);
        });
    });


    /* --------------------------------------------------------
       FLOPPY DISK SYSTEM
    -------------------------------------------------------- */
    const projectData = {
        project1: {
            title: "DDOS_ATTACK_MAP.EXE",
            content: `
PROJECT: DDoS Attack Map
STATUS:  OPERATIONAL
──────────────────────────────
Real-time visualisation of
distributed denial-of-service
attack traffic across global
network nodes.

[Link your project URL here]
            `.trim()
        },
        project2: {
            title: "PROJECT_02.EXE",
            content: `
PROJECT: [Your Project Name]
STATUS:  [IN PROGRESS / LIVE]
──────────────────────────────
Add your project description
here. Replace this placeholder
with your actual work.

[Link your project URL here]
            `.trim()
        }
    };

    document.querySelectorAll(".floppy-disk:not(.locked)").forEach(disk => {
        disk.addEventListener("click", () => {
            const key  = disk.dataset.project;
            const data = projectData[key];
            if (!data) return;

            const viewer = document.getElementById("floppy-viewer");
            const title  = document.getElementById("floppy-viewer-title");
            const content= document.getElementById("floppy-viewer-content");

            viewer.classList.remove("hidden");
            title.textContent   = "▶ READING: " + data.title;
            content.textContent = "";
            playSound(audioClick);

            /* Typewriter into viewer */
            let i = 0;
            const txt = data.content;
            function t() {
                if (i < txt.length) {
                    content.textContent += txt[i++];
                    setTimeout(t, 12);
                }
            }
            t();
        });
    });

    document.getElementById("floppy-eject").addEventListener("click", () => {
        document.getElementById("floppy-viewer").classList.add("hidden");
        playSound(audioClick);
    });

    /* Locked disk */
    document.querySelectorAll(".floppy-disk.locked").forEach(disk => {
        disk.addEventListener("click", () => {
            addOutputLine("ERROR: DISK CORRUPTED. ACCESS DENIED.", "t-error");
        });
    });


    /* --------------------------------------------------------
       REDACTED TEXT REVEAL (DIAGNOSTICS)
    -------------------------------------------------------- */
    document.querySelectorAll(".redacted").forEach(el => {
        el.addEventListener("click", () => {
            el.classList.toggle("revealed");
        });
    });


    /* --------------------------------------------------------
       SÉANCE FORM
    -------------------------------------------------------- */
    document.getElementById("seance-send").addEventListener("click", () => {
        const name  = document.getElementById("seance-name").value.trim();
        const email = document.getElementById("seance-email").value.trim();
        const msg   = document.getElementById("seance-msg").value.trim();

        if (!name || !email || !msg) {
            const res = document.getElementById("seance-response");
            res.classList.remove("hidden");
            res.querySelector(".blink-text").textContent =
                "ERROR: INCOMPLETE TRANSMISSION. ALL FIELDS REQUIRED.";
            res.style.color = "var(--red-accent)";
            return;
        }

        const res = document.getElementById("seance-response");
        res.classList.remove("hidden");
        res.style.color = "";
        res.querySelector
            ? (res.innerHTML = '<span class="blink-text">CONNECTION ESTABLISHED... THE ENTITY HAS BEEN NOTIFIED.</span>')
            : (res.textContent = "CONNECTION ESTABLISHED...");

        playSound(audioClick);

        /* You can wire up a real email service here (Formspree, EmailJS, etc.) */
        console.log("Séance transmission:", { name, email, msg });
    });


    /* --------------------------------------------------------
       SKULL HOVER — subtle eye glow on landing
    -------------------------------------------------------- */
    const skull = document.querySelector(".landing-skull");
    if (skull) {
        skull.addEventListener("mousemove", (e) => {
            const rect = skull.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            skull.style.transform = `perspective(400px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.04)`;
        });
        skull.addEventListener("mouseleave", () => {
            skull.style.transform = "";
        });
    }


    /* --------------------------------------------------------
       UTILITY
    -------------------------------------------------------- */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

});
