/* ============================================================
   THE CRYPT — js/skeleton.js
   Handles: skull click → skeleton walks in → sits → zooms
            to terminal screen.
   Depends on: main.js (window.Crypt), GSAP
   ============================================================ */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        const skullTrigger   = document.getElementById("skull-trigger");
        const landingScreen  = document.getElementById("landing-screen");
        const skeletonScreen = document.getElementById("skeleton-screen");
        const skeletonWrap   = document.getElementById("skeleton-puppet-wrap");
        const sceneDesk      = document.getElementById("scene-desk");
        const audioClick     = document.getElementById("audio-click");
        const audioAmbient   = document.getElementById("audio-ambient");

        if (!skullTrigger) return;

        /* ---- SKULL HOVER parallax ---- */
        const skull = document.querySelector(".landing-skull");
        if (skull) {
            skull.addEventListener("mousemove", (e) => {
                const rect = skull.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width  - 0.5;
                const y = (e.clientY - rect.top)  / rect.height - 0.5;
                skull.style.transform =
                    `perspective(400px) rotateY(${x*8}deg) rotateX(${-y*8}deg) scale(1.04)`;
            });
            skull.addEventListener("mouseleave", () => {
                skull.style.transform = "";
            });
        }


        /* ---- SKULL CLICK ---- */
        skullTrigger.addEventListener("click", () => {
            Crypt.playSound(audioClick);

            landingScreen.style.transition = "opacity 0.7s ease";
            landingScreen.style.opacity    = "0";

            setTimeout(() => {
                landingScreen.classList.add("hidden");
                landingScreen.classList.remove("current");
                showSkeletonScene();
            }, 700);
        });


        /* ---- SKELETON SCENE ---- */
        function showSkeletonScene() {
            skeletonScreen.classList.remove("hidden");
            skeletonScreen.classList.add("current");

            try { audioAmbient && audioAmbient.play(); } catch(e) {}

            gsap.to(sceneDesk, { opacity: 1, duration: 0.8, delay: 0.3 });

            const tl = gsap.timeline({ delay: 0.5 });

            /* Walk in */
            tl.to(skeletonWrap, {
                left: "38%",
                duration: 2.8,
                ease: "none",
                onStart: () => {
                    skeletonWrap.classList.add("walking");
                    animateLegsWalk(true);
                }
            });

            /* Slow near desk */
            tl.to(skeletonWrap, {
                left: "44%",
                duration: 1.0,
                ease: "power2.out",
                onComplete: () => {
                    skeletonWrap.classList.remove("walking");
                    animateLegsWalk(false);
                }
            });

            /* Sit */
            tl.add(() => sitDownAnimation());
            tl.to({}, { duration: 1.4 });

            /* Reach for keyboard */
            tl.add(() => reachForKeyboard());
            tl.to({}, { duration: 0.8 });

            /* Type */
            tl.add(() => skeletonTyping());
            tl.to({}, { duration: 1.8 });

            /* Zoom into monitor */
            tl.add(() => zoomToTerminal());
        }


        /* ---- WALK CYCLE ---- */
        function animateLegsWalk(active) {
            const legLeft  = document.getElementById("leg-left");
            const legRight = document.getElementById("leg-right");
            if (!legLeft || !legRight) return;

            if (active) {
                gsap.to(legLeft, {
                    rotation: 22, transformOrigin: "top center",
                    duration: 0.22, yoyo: true, repeat: -1, ease: "power1.inOut"
                });
                gsap.to(legRight, {
                    rotation: -22, transformOrigin: "top center",
                    duration: 0.22, yoyo: true, repeat: -1,
                    ease: "power1.inOut", delay: 0.11
                });
                gsap.to("#arm-left", {
                    rotation: -18, transformOrigin: "top center",
                    duration: 0.22, yoyo: true, repeat: -1,
                    ease: "power1.inOut", delay: 0.11
                });
                gsap.to("#arm-right", {
                    rotation: 18, transformOrigin: "top center",
                    duration: 0.22, yoyo: true, repeat: -1, ease: "power1.inOut"
                });
            } else {
                gsap.killTweensOf([legLeft, legRight, "#arm-left", "#arm-right"]);
                gsap.to([legLeft, legRight, "#arm-left", "#arm-right"], {
                    rotation: 0, duration: 0.3, ease: "power2.out"
                });
            }
        }


        /* ---- SIT DOWN ---- */
        function sitDownAnimation() {
            const legLeft  = document.getElementById("leg-left");
            const legRight = document.getElementById("leg-right");

            gsap.to(legLeft,  {
                rotation: -70, transformOrigin: "top center",
                duration: 0.9, ease: "power2.inOut"
            });
            gsap.to(legRight, {
                rotation: -70, transformOrigin: "top center",
                duration: 0.9, ease: "power2.inOut"
            });
            gsap.to(skeletonWrap, { y: 40, duration: 0.9, ease: "power2.inOut" });
            gsap.to("#skull-head", {
                rotation: 12, transformOrigin: "bottom center",
                duration: 0.7, delay: 0.5, ease: "power2.out"
            });
        }


        /* ---- REACH FOR KEYBOARD ---- */
        function reachForKeyboard() {
            gsap.to("#arm-left",  {
                rotation: 40, transformOrigin: "top center",
                duration: 0.6, ease: "power2.out"
            });
            gsap.to("#arm-right", {
                rotation: -40, transformOrigin: "top center",
                duration: 0.6, ease: "power2.out"
            });
        }


        /* ---- SKELETON TYPING JITTER ---- */
        function skeletonTyping() {
            gsap.to("#la-fore-group", {
                y: -4, rotation: 5, duration: 0.1,
                yoyo: true, repeat: 16, ease: "power1.inOut"
            });
            gsap.to("#ra-fore-group", {
                y: -4, rotation: -5, duration: 0.1,
                yoyo: true, repeat: 16, ease: "power1.inOut", delay: 0.05
            });
            gsap.to("#skull-head", {
                rotation: 15, transformOrigin: "bottom center",
                duration: 0.4, yoyo: true, repeat: 4, ease: "power1.inOut"
            });
        }


        /* ---- ZOOM TO TERMINAL ---- */
        function zoomToTerminal() {
            if (!sceneDesk) return;
            const monitorRect = sceneDesk.querySelector(".monitor-bezel")
                                         .getBoundingClientRect();

            const zoomTl = gsap.timeline({
                onComplete: () => {
                    skeletonScreen.classList.add("hidden");
                    skeletonScreen.classList.remove("current");
                    // Tell terminal module to start
                    window.dispatchEvent(new CustomEvent("crypt:showTerminal"));
                }
            });

            zoomTl.to("#skeleton-screen", {
                scale: 14,
                transformOrigin: `${monitorRect.left + monitorRect.width/2}px ${monitorRect.top + monitorRect.height/2}px`,
                duration: 1.4,
                ease: "power3.in"
            });

            zoomTl.to("#skeleton-screen", {
                opacity: 0, duration: 0.3
            }, "-=0.2");
        }

    }); // DOMContentLoaded

})();
