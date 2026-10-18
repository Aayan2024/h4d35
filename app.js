document.addEventListener("DOMContentLoaded", () => {
    const landingScreen = document.getElementById("landing-screen");
    const experienceScreen = document.getElementById("experience-screen");
    const skullTrigger = document.querySelector(".skull-container");
    
    const introVideo = document.getElementById("skeleton-intro");
    const idleVideo = document.getElementById("skeleton-idle");

    // Click trigger on the Landing Page
    skullTrigger.addEventListener("click", () => {
        // Switch screens instantly
        landingScreen.classList.add("hidden");
        experienceScreen.classList.remove("hidden");
        
        // Start the introductory skeleton animation
        introVideo.play().catch(error => {
            console.log("Audio/Video playback interaction error: ", error);
            // Fallback: If video fails, skip straight to idle
            handleIntroEnded();
        });
    });

    // Detect when the skeleton finishes sitting down
    introVideo.onended = () => {
        handleIntroEnded();
    };

    function handleIntroEnded() {
        // Seamlessly swap the single play video for the looping idle animation
        introVideo.classList.add("hidden");
        idleVideo.classList.remove("hidden");
        idleVideo.play();

        console.log("Phase 1 Complete. Ready to initialize Terminal Systems.");
        // Phase 2 Terminal Initialization functions will hook in right here!
    }
});
