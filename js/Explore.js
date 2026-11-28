/* ============================================================
   EXPLORE.JS
   Film grain + GSAP entrance animations for the explore page
============================================================ */

/* ---- Film grain canvas ---- */
const canvas = document.getElementById("grain-canvas");
const ctx    = canvas.getContext("2d");

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawGrain() {
    const w = canvas.width, h = canvas.height;
    const img = ctx.createImageData(w, h);
    const d   = img.data;
    for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = Math.random() * 50 | 0;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(drawGrain);
}

resize();
window.addEventListener("resize", resize);
drawGrain();


/* ---- Entrance animations + bottom back btn hover ---- */
document.addEventListener("DOMContentLoaded", () => {

    /* Comic panels stagger in */
    const panels = document.querySelectorAll(".comic-panel");
    gsap.fromTo(panels,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out", delay: 0.2 }
    );

    /* Manga table rows stagger in */
    const rows = document.querySelectorAll(".manga-table tbody tr");
    gsap.fromTo(rows,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: "power2.out", delay: 0.6 }
    );

    /* Bottom back button hover (JS-driven since it was inline in original) */
    const bb = document.getElementById("back-btn-bottom");
    if (bb) {
        bb.addEventListener("mouseenter", () => {
            bb.style.borderColor = "#555";
            bb.style.color = "var(--bone-white)";
        });
        bb.addEventListener("mouseleave", () => {
            bb.style.borderColor = "#222";
            bb.style.color = "#444";
        });
    }

});
