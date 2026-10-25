/* ============================================================
   THE CRYPT — js/creation.js
   Handles: CREATION_CHAMBER — Ink Machine room, door interaction,
            cel carousel (art), projector (writing).
   Depends on: main.js (window.Crypt), GSAP
   ============================================================ */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        const audioClick = document.getElementById("audio-click");

        /* Elements */
        const inkDoor      = document.getElementById("ink-door");
        const inkDoorPanel = document.getElementById("ink-door-panel");
        const inkPrompt    = document.getElementById("ink-door-prompt");
        const gaugeNeedle  = document.getElementById("gauge-needle");
        const inkContent   = document.getElementById("ink-content");
        const inkWarning   = document.getElementById("ink-warning");
        const inkRoom      = document.getElementById("ink-room");

        if (!inkDoor) return;

        let doorOpen   = false;
        let projTyping = false;
        let projIndex  = 0;
        let celIndex   = 0;


        /* --------------------------------------------------------
           DOOR — hover + click
        -------------------------------------------------------- */
        inkDoor.addEventListener("mouseenter", () => {
            if (doorOpen) return;
            inkPrompt.classList.add("visible");
            gsap.to(gaugeNeedle, {
                rotation: 85,
                transformOrigin: "bottom center",
                duration: 0.3,
                ease: "elastic.out(1, 0.3)",
                yoyo: true,
                repeat: 3
            });
        });

        inkDoor.addEventListener("mouseleave", () => {
            if (doorOpen) return;
            inkPrompt.classList.remove("visible");
            gsap.to(gaugeNeedle, {
                rotation: 20,
                transformOrigin: "bottom center",
                duration: 0.5,
                ease: "power2.out"
            });
        });

        inkDoor.addEventListener("click", () => {
            if (doorOpen) return;
            doorOpen = true;
            inkPrompt.classList.remove("visible");
            Crypt.playSound(audioClick);

            /* Door slides up */
            gsap.to(inkDoorPanel, {
                y: "-100%",
                duration: 1.4,
                ease: "power3.inOut",
                onComplete: () => { inkDoorPanel.style.display = "none"; }
            });

            /* Ink splatter flash */
            const splatter = document.createElement("div");
            splatter.className = "ink-splatter-flash";
            inkRoom.appendChild(splatter);
            gsap.fromTo(splatter,
                { opacity: 0.9, scale: 0.5 },
                { opacity: 0,   scale: 3, duration: 0.8, ease: "power2.out",
                  onComplete: () => splatter.remove() }
            );

            /* Sepia deepens */
            gsap.to("#ink-sepia", { opacity: 0.6, duration: 0.8 });

            /* Warning fades */
            gsap.to(inkWarning, { opacity: 0, duration: 0.5 });

            /* Reveal mode buttons */
            setTimeout(() => {
                inkContent.classList.remove("hidden");
                gsap.fromTo(inkContent,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
            }, 1200);
        });


        /* --------------------------------------------------------
           MODE BUTTONS
        -------------------------------------------------------- */
        const btnSketches    = document.getElementById("btn-sketches");
        const btnManuscripts = document.getElementById("btn-manuscripts");

        if (btnSketches) {
            btnSketches.addEventListener("click", () => {
                showGallery("cel-carousel");
                Crypt.playSound(audioClick);
                Crypt.showBackButton();
            });
        }

        if (btnManuscripts) {
            btnManuscripts.addEventListener("click", () => {
                showGallery("projector-view");
                initProjector();
                Crypt.playSound(audioClick);
                Crypt.showBackButton();
                gsap.to("#ink-sepia", { opacity: 0.82, duration: 1.0 });
            });
        }

        function showGallery(id) {
            document.querySelectorAll(".ink-gallery").forEach(g => g.classList.add("hidden"));
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.remove("hidden");
            gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        }


        /* --------------------------------------------------------
           CEL CAROUSEL — artwork
        -------------------------------------------------------- */
        const celTrack = document.getElementById("cel-track");

        function updateCarousel() {
            if (!celTrack) return;
            const items = celTrack.querySelectorAll(".cel-item");
            const w     = items[0] ? items[0].offsetWidth + 32 : 320;
            gsap.to(celTrack, { x: -(celIndex * w), duration: 0.6, ease: "power2.inOut" });
        }

        const celPrev = document.getElementById("cel-prev");
        const celNext = document.getElementById("cel-next");

        if (celPrev) {
            celPrev.addEventListener("click", () => {
                celIndex = Math.max(0, celIndex - 1);
                updateCarousel();
                Crypt.playSound(audioClick);
            });
        }

        if (celNext) {
            celNext.addEventListener("click", () => {
                const items = celTrack ? celTrack.querySelectorAll(".cel-item").length : 0;
                celIndex = Math.min(items - 1, celIndex + 1);
                updateCarousel();
                Crypt.playSound(audioClick);
            });
        }


        /* --------------------------------------------------------
           PROJECTOR — writing / manuscripts
           Add your writing pieces to this array.
        -------------------------------------------------------- */
        const manuscripts = [
            {
                title: "MANUSCRIPT_001 // [UNTITLED]",
                body:  `Add your poem, story, or writing here.
This is the first entry.

The machine produced it.
Or maybe you did.
It's hard to tell anymore.`
            },
            {
                title: "MANUSCRIPT_002 // [REDACTED]",
                body:  `A second piece of writing goes here.
Replace this placeholder with your own words.

...static... signal lost... ...static...`
            }
        ];

        function initProjector() {
            gsap.to(".reel-circle", {
                rotation: 360,
                transformOrigin: "center center",
                duration: 3,
                repeat: -1,
                ease: "none"
            });
            renderManuscript(0);
        }

        function renderManuscript(idx) {
            if (projTyping) return;
            const projContent = document.getElementById("proj-content");
            if (!projContent) return;

            const ms = manuscripts[idx];
            if (!ms) return;

            projTyping = true;
            projContent.innerHTML = "";

            const titleEl = document.createElement("div");
            titleEl.className   = "proj-title";
            titleEl.textContent = ms.title;
            projContent.appendChild(titleEl);

            const bodyEl = document.createElement("div");
            bodyEl.className = "proj-body";
            projContent.appendChild(bodyEl);

            let i = 0;
            const txt = ms.body;

            function typeChar() {
                if (i < txt.length) {
                    bodyEl.textContent += txt[i++];
                    setTimeout(typeChar, 28);
                } else {
                    projTyping = false;
                }
            }

            gsap.fromTo("#proj-screen",
                { opacity: 0.1 },
                { opacity: 1, duration: 0.4, onComplete: typeChar }
            );
        }

        const projPrev = document.getElementById("proj-prev");
        const projNext = document.getElementById("proj-next");

        if (projPrev) {
            projPrev.addEventListener("click", () => {
                if (projTyping) return;
                projIndex = Math.max(0, projIndex - 1);
                renderManuscript(projIndex);
                Crypt.playSound(audioClick);
            });
        }

        if (projNext) {
            projNext.addEventListener("click", () => {
                if (projTyping) return;
                projIndex = Math.min(manuscripts.length - 1, projIndex + 1);
                renderManuscript(projIndex);
                Crypt.playSound(audioClick);
            });
        }


        /* --------------------------------------------------------
           BACK from gallery → back to mode buttons
           Overrides the global back button behaviour when inside
           a gallery view so it goes to mode buttons, not terminal.
        -------------------------------------------------------- */
        window.addEventListener("crypt:creationBack", () => {
            document.querySelectorAll(".ink-gallery").forEach(g => g.classList.add("hidden"));
            gsap.to("#ink-sepia", { opacity: 0.6, duration: 0.5 });
        });

    });

})();
