/* ============================================================
   THE CRYPT — js/webcomic.js
   Handles: THE WEBCOMIC CRYPT — 5 Junji Ito panel grid,
            hover ink effects, panel click routing,
            EXPLORE COMIC 88x31 button.
   Depends on: main.js (window.Crypt), GSAP
   ============================================================ */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        const audioClick = document.getElementById("audio-click");

        /* ---- Panel definitions ---- */
        /* background-position values crop the manga image to each panel */
        const panels = [
            {
                id:       "panel-tomie",
                title:    "PANEL 1",
                subtitle: "TOMIE",
                tag:      "GitHub Repos",
                /* top-left portrait — Tomie face */
                bgPos:    "0% 0%",
                bgSize:   "340% 220%",
                href:     "#tomie"   /* replace with real URL */
            },
            {
                id:       "panel-uzumaki",
                title:    "PANEL 2",
                subtitle: "UZUMAKI",
                tag:      "Tech Stack",
                /* top-centre — spiral eye */
                bgPos:    "47% 0%",
                bgSize:   "260% 220%",
                href:     "#uzumaki"
            },
            {
                id:       "panel-drhead",
                title:    "PANEL 3",
                subtitle: "DR. HEAD",
                tag:      "Cursed R&D",
                /* top-right — boy with bow/monster */
                bgPos:    "100% 0%",
                bgSize:   "260% 220%",
                href:     "#drhead"
            },
            {
                id:       "panel-park",
                title:    "PANEL 4",
                subtitle: "THE PARK",
                tag:      "Curated Dev Blogs",
                /* bottom-left — girl facing playground monsters */
                bgPos:    "0% 100%",
                bgSize:   "260% 220%",
                href:     "#park"
            },
            {
                id:       "panel-roof",
                title:    "PANEL 5",
                subtitle: "THE ROOF",
                tag:      "YouTube Pipeline",
                /* bottom-right — rooftop children panels */
                bgPos:    "100% 100%",
                bgSize:   "260% 220%",
                href:     "#roof"
            }
        ];


        /* ---- Build panel elements ---- */
        const topRow    = document.getElementById("webcomic-top-row");
        const bottomRow = document.getElementById("webcomic-bottom-row");

        if (!topRow || !bottomRow) return;

        panels.forEach((p, i) => {
            const panel = document.createElement("div");
            panel.className  = "comic-panel";
            panel.id         = p.id;
            panel.dataset.href = p.href;

            panel.innerHTML = `
                <div class="panel-bg" style="
                    background-image: url('webcomic_panels.jpg');
                    background-position: ${p.bgPos};
                    background-size: ${p.bgSize};
                "></div>
                <div class="panel-ink-overlay"></div>
                <div class="panel-halftone"></div>
                <div class="panel-info">
                    <span class="panel-num">${p.title}</span>
                    <span class="panel-name">${p.subtitle}</span>
                    <span class="panel-tag">${p.tag}</span>
                </div>
                <div class="panel-hover-text">ENTER →</div>
            `;

            /* Hover — ink bleed effect */
            panel.addEventListener("mouseenter", () => {
                gsap.to(panel.querySelector(".panel-ink-overlay"), {
                    opacity: 0.72, duration: 0.4, ease: "power2.out"
                });
                gsap.to(panel.querySelector(".panel-hover-text"), {
                    opacity: 1, y: 0, duration: 0.3, ease: "power2.out"
                });
                gsap.to(panel.querySelector(".panel-info"), {
                    y: -6, duration: 0.3, ease: "power2.out"
                });
            });

            panel.addEventListener("mouseleave", () => {
                gsap.to(panel.querySelector(".panel-ink-overlay"), {
                    opacity: 0, duration: 0.5, ease: "power2.inOut"
                });
                gsap.to(panel.querySelector(".panel-hover-text"), {
                    opacity: 0, y: 10, duration: 0.3, ease: "power2.in"
                });
                gsap.to(panel.querySelector(".panel-info"), {
                    y: 0, duration: 0.3, ease: "power2.out"
                });
            });

            /* Click — navigate to panel page */
            panel.addEventListener("click", () => {
                Crypt.playSound(audioClick);

                /* Ink flash transition */
                const flash = document.createElement("div");
                flash.className = "ink-flash-transition";
                document.body.appendChild(flash);

                gsap.fromTo(flash,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.25, ease: "power2.in",
                      onComplete: () => {
                          /* Navigate — replace with real routing later */
                          window.location.href = p.href;
                          setTimeout(() => flash.remove(), 500);
                      }
                    }
                );
            });

            /* Append to correct row */
            if (i < 3) {
                topRow.appendChild(panel);
            } else {
                bottomRow.appendChild(panel);
            }
        });


        /* ---- Entrance animation when section opens ---- */
        window.addEventListener("crypt:webcomicOpen", () => {
            const allPanels = document.querySelectorAll(".comic-panel");
            gsap.fromTo(allPanels,
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0,
                  duration: 0.5,
                  stagger: 0.08,
                  ease: "power2.out",
                  delay: 0.2
                }
            );
        });


        /* ---- EXPLORE COMIC button ---- */
        const exploreBtn = document.getElementById("explore-comic-btn");
        if (exploreBtn) {
            exploreBtn.addEventListener("click", () => {
                Crypt.playSound(audioClick);
                /* Replace with your actual comic URL */
                window.open("#explore-comic", "_blank");
            });

            /* Pixel flicker on hover */
            exploreBtn.addEventListener("mouseenter", () => {
                gsap.to(exploreBtn, {
                    filter: "brightness(1.3) contrast(1.1)",
                    duration: 0.1,
                    yoyo: true,
                    repeat: 3,
                    ease: "none",
                    onComplete: () => {
                        gsap.set(exploreBtn, { filter: "none" });
                    }
                });
            });
        }

    });

})();
