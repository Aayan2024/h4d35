/* ============================================================
   THE CRYPT — js/archive.js
   Handles: EXPERIMENT_ARCHIVE floppy disk viewer
   Depends on: main.js (window.Crypt)
   ============================================================ */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        const audioClick = document.getElementById("audio-click");

        /* ---- PROJECT DATA — add your projects here ---- */
        const projectData = {
            project1: {
                title: "DDOS_ATTACK_MAP.EXE",
                content: `PROJECT: DDoS Attack Map
STATUS:  OPERATIONAL
──────────────────────────────
Real-time visualisation of
distributed denial-of-service
attack traffic across global
network nodes.

[Link your project URL here]`
            },
            project2: {
                title: "PROJECT_02.EXE",
                content: `PROJECT: [Your Project Name]
STATUS:  [IN PROGRESS / LIVE]
──────────────────────────────
Add your project description
here. Replace this placeholder
with your actual work.

[Link your project URL here]`
            }
        };


        /* ---- FLOPPY CLICK → open viewer ---- */
        document.querySelectorAll(".floppy-disk:not(.locked)").forEach(disk => {
            disk.addEventListener("click", () => {
                const key  = disk.dataset.project;
                const data = projectData[key];
                if (!data) return;

                const viewer  = document.getElementById("floppy-viewer");
                const title   = document.getElementById("floppy-viewer-title");
                const content = document.getElementById("floppy-viewer-content");

                viewer.classList.remove("hidden");
                title.textContent   = "▶ READING: " + data.title;
                content.textContent = "";
                Crypt.playSound(audioClick);

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


        /* ---- EJECT button ---- */
        const ejectBtn = document.getElementById("floppy-eject");
        if (ejectBtn) {
            ejectBtn.addEventListener("click", () => {
                document.getElementById("floppy-viewer").classList.add("hidden");
                Crypt.playSound(audioClick);
            });
        }


        /* ---- LOCKED disk ---- */
        document.querySelectorAll(".floppy-disk.locked").forEach(disk => {
            disk.addEventListener("click", () => {
                if (window.Crypt.terminalPrint) {
                    Crypt.terminalPrint("ERROR: DISK CORRUPTED. ACCESS DENIED.", "t-error");
                }
                Crypt.playSound(audioClick);
            });
        });

    });

})();
