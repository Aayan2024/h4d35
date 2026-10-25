/* ============================================================
   THE CRYPT — js/main.js
   StateManager: owns all screen transitions, back/forward nav,
   grain canvas, audio helpers, shared utilities.
   Every other module calls window.Crypt.* to navigate.
   ============================================================ */

(function () {

    /* --------------------------------------------------------
       STATE MANAGER
       Tracks which screen is active and handles transitions.
       Screens (in order): skull → skeleton → terminal
       Sections (overlays on terminal): diagnostics, archive,
         transmissions, seance, creation
    -------------------------------------------------------- */
    const SCREENS = ["landing-screen", "skeleton-screen", "terminal-screen"];

    const State = {
        currentScreen:  "landing-screen",
        currentSection: null,   // id of open section overlay, or null
        history: [],            // stack of previous states for back nav
    };

    /* Push current state onto history before navigating */
    function pushHistory() {
        State.history.push({
            screen:  State.currentScreen,
            section: State.currentSection,
        });
    }

    /* Show a screen, hide all others. No animation — callers handle that */
    function setScreen(id) {
        SCREENS.forEach(sid => {
            const el = document.getElementById(sid);
            if (!el) return;
            if (sid === id) {
                el.classList.remove("hidden");
                el.classList.add("current");
            } else {
                el.classList.add("hidden");
                el.classList.remove("current");
            }
        });
        State.currentScreen = id;
    }

    /* Navigate forward to a new screen */
    function goTo(screenId) {
        pushHistory();
        setScreen(screenId);
    }

    /* Open a section overlay on top of terminal */
    function openSection(sectionId) {
        pushHistory();
        // Close any open section first
        if (State.currentSection) {
            _closeSection(State.currentSection, false);
        }
        const el = document.getElementById(sectionId);
        if (!el) return;
        el.classList.remove("hidden");
        gsap.fromTo(el,
            { x: "100%", opacity: 0 },
            { x: "0%",   opacity: 1, duration: 0.4, ease: "power2.out" }
        );
        State.currentSection = sectionId;
        showBackButton();
    }

    /* Close a section overlay */
    function _closeSection(sectionId, pushToHistory = true) {
        if (pushToHistory) pushHistory();
        const el = document.getElementById(sectionId);
        if (!el) return;
        gsap.to(el, {
            x: "100%", opacity: 0, duration: 0.35, ease: "power2.in",
            onComplete: () => {
                el.classList.add("hidden");
                gsap.set(el, { x: 0, opacity: 1 });
            }
        });
        State.currentSection = null;
        hideBackButton();
    }

    /* GO BACK — pops the history stack */
    function goBack() {
        if (State.history.length === 0) return;
        const prev = State.history.pop();

        // If we're inside a section, just close it
        if (State.currentSection) {
            _closeSection(State.currentSection, false);
            State.currentSection = prev.section;
            // If previous state also had a section open, reopen it
            if (prev.section && prev.section !== State.currentSection) {
                const el = document.getElementById(prev.section);
                if (el) {
                    el.classList.remove("hidden");
                    gsap.fromTo(el,
                        { x: "-100%", opacity: 0 },
                        { x: "0%", opacity: 1, duration: 0.4, ease: "power2.out" }
                    );
                    State.currentSection = prev.section;
                    showBackButton();
                }
            } else {
                hideBackButton();
            }
            return;
        }

        // Going back a full screen — fade transition
        const prevScreenEl = document.getElementById(prev.screen);
        if (!prevScreenEl) return;

        const currEl = document.getElementById(State.currentScreen);
        if (currEl) {
            gsap.to(currEl, {
                opacity: 0, duration: 0.5,
                onComplete: () => {
                    currEl.classList.add("hidden");
                    currEl.classList.remove("current");
                    gsap.set(currEl, { opacity: 1 });
                }
            });
        }

        prevScreenEl.classList.remove("hidden");
        prevScreenEl.classList.add("current");
        gsap.fromTo(prevScreenEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.5 }
        );

        State.currentScreen  = prev.screen;
        State.currentSection = prev.section;

        // Re-init the previous screen if needed
        if (prev.screen === "terminal-screen") {
            hideBackButton(); // terminal has its own close buttons
        } else {
            hideBackButton();
        }
    }


    /* --------------------------------------------------------
       BACK BUTTON — fixed, bottom-left, appears when needed
    -------------------------------------------------------- */
    function buildBackButton() {
        const btn = document.createElement("button");
        btn.id        = "global-back-btn";
        btn.innerHTML = "⟵ BACK";
        btn.addEventListener("click", () => {
            playSound(document.getElementById("audio-click"));
            goBack();
        });
        document.body.appendChild(btn);
    }

    function showBackButton() {
        const btn = document.getElementById("global-back-btn");
        if (btn) btn.classList.add("visible");
    }

    function hideBackButton() {
        const btn = document.getElementById("global-back-btn");
        if (btn) btn.classList.remove("visible");
    }


    /* --------------------------------------------------------
       FILM GRAIN CANVAS
    -------------------------------------------------------- */
    function initGrain() {
        const canvas = document.getElementById("grain-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function draw() {
            const w = canvas.width;
            const h = canvas.height;
            const img = ctx.createImageData(w, h);
            const d   = img.data;
            for (let i = 0; i < d.length; i += 4) {
                const v = Math.random() * 255 | 0;
                d[i] = d[i+1] = d[i+2] = v;
                d[i+3] = Math.random() * 55 | 0;
            }
            ctx.putImageData(img, 0, 0);
            requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener("resize", resize);
        draw();
    }


    /* --------------------------------------------------------
       AUDIO HELPER
    -------------------------------------------------------- */
    function playSound(el) {
        if (!el) return;
        try { el.currentTime = 0; el.play(); } catch(e) {}
    }


    /* --------------------------------------------------------
       UTILITY
    -------------------------------------------------------- */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /* --------------------------------------------------------
       EXPOSE GLOBAL API — window.Crypt
       All modules use this to navigate and share utilities.
    -------------------------------------------------------- */
    window.Crypt = {
        goTo,
        goBack,
        openSection,
        closeSection: (id) => _closeSection(id, true),
        showBackButton,
        hideBackButton,
        playSound,
        delay,
        State,
    };


    /* --------------------------------------------------------
       BOOT
    -------------------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {
        initGrain();
        buildBackButton();

        // Wire up all × CLOSE buttons generically
        document.querySelectorAll(".close-section").forEach(btn => {
            btn.addEventListener("click", () => {
                Crypt.playSound(document.getElementById("audio-click"));
                Crypt.closeSection(btn.dataset.target);
            });
        });
    });

})();
