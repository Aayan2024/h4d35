/* ============================================================
   THE CRYPT — js/diagnostics.js
   Handles: DIAGNOSTICS.LOG redacted text reveal
   Depends on: main.js (window.Crypt)
   ============================================================ */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        /* Redacted text — click to reveal */
        document.querySelectorAll(".redacted").forEach(el => {
            el.addEventListener("click", () => {
                el.classList.toggle("revealed");
                Crypt.playSound(document.getElementById("audio-click"));
            });
        });

    });

})();
