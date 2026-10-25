/* ============================================================
   THE CRYPT — js/seance.js
   Handles: SÉANCE.EXE contact form
   Depends on: main.js (window.Crypt)
   ============================================================ */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        const sendBtn = document.getElementById("seance-send");
        const audioClick = document.getElementById("audio-click");
        if (!sendBtn) return;

        sendBtn.addEventListener("click", () => {
            const name  = document.getElementById("seance-name").value.trim();
            const email = document.getElementById("seance-email").value.trim();
            const msg   = document.getElementById("seance-msg").value.trim();
            const res   = document.getElementById("seance-response");

            if (!name || !email || !msg) {
                res.classList.remove("hidden");
                res.innerHTML = '<span class="blink-text" style="color:var(--red-accent)">ERROR: INCOMPLETE TRANSMISSION. ALL FIELDS REQUIRED.</span>';
                return;
            }

            res.classList.remove("hidden");
            res.innerHTML = '<span class="blink-text">CONNECTION ESTABLISHED... THE ENTITY HAS BEEN NOTIFIED.</span>';
            Crypt.playSound(audioClick);

            /* Wire up to Formspree / EmailJS here */
            console.log("Séance transmission:", { name, email, msg });
        });

    });

})();
