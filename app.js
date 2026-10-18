document.addEventListener("DOMContentLoaded", () => {
    const historyContainer = document.getElementById("terminal-history");
    const inputForm = document.getElementById("terminal-form");
    const terminalInput = document.getElementById("terminal-input");

    // Initiate standard boot sequences when the container opens
    runBootSequence();

    function runBootSequence() {
        printLine("SYSTEM RESTORATION MODULE INITIALIZED...");
        setTimeout(() => printLine("RETRIEVING MEMORY RECOVERY TRACKS..."), 400);
        setTimeout(() => printLine("ERROR: CORE FILE BLOCKS ARE ENCRYPTED.\n"), 800);
        
        // Spawn the interactive HELP! click prompt element
        setTimeout(() => {
            const promptSpan = document.createElement("span");
            promptSpan.textContent = "Click ";
            
            const helpLink = document.createElement("span");
            helpLink.textContent = "HELP!";
            helpLink.className = "help-trigger";
            
            // Event listener: Clicking HELP! triggers the next narrative sequence
            helpLink.addEventListener("click", handleHelpActivation);
            
            const actionSpan = document.createElement("span");
            actionSpan.textContent = " to wake the root command interpreter.";
            
            historyContainer.appendChild(promptSpan);
            historyContainer.appendChild(helpLink);
            historyContainer.appendChild(actionSpan);
            historyContainer.appendChild(document.createTextNode("\n\n"));
            scrollToBottom();
        }, 1200);
    }

    function handleHelpActivation(e) {
        // Disallow clicking the same link multiple times
        e.target.replaceWith(e.target.textContent);
        
        printLine("[!] ACCESS SIGNAL DETECTED.");
        setTimeout(() => printLine("To exhume the root directory file nodes, you must talk to the machine."), 300);
        setTimeout(() => {
            printLine("Type 'dir' below and press Enter to list directory modules.\n");
            // Reveal the command line field and auto-focus it
            inputForm.classList.remove("hidden");
            terminalInput.focus();
        }, 600);
    }

    // Capture console input form execution events
    inputForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rawCommand = terminalInput.value.trim().toLowerCase();
        
        // Echo the user's typed input text into history log
        printLine(`> ${terminalInput.value}`);
        terminalInput.value = "";

        if (rawCommand === "dir") {
            executeDirectoryListing();
        } else if (rawCommand === "help!") {
            printLine("Terminal unlocked. Please enter 'dir' to list modules.");
        } else if (rawCommand === "") {
            // Do nothing for blank entries
        } else {
            printLine(`SYSTEM ERROR: COMMAND '${rawCommand}' NOT RECOGNIZED. TRY 'dir'`);
        }
    });

    function executeDirectoryListing() {
        printLine("Volume in drive C is HADES_VAULT");
        printLine("Directory of C:\\\n");
        
        setTimeout(() => printLine("10/18/2026  05:07 PM    <DIR>    HOME...........[Enter Workshop]"), 150);
        setTimeout(() => printLine("10/18/2026  05:07 PM    <DIR>    ABOUT..........[Diagnostics]"), 300);
        setTimeout(() => printLine("10/18/2026  05:07 PM    <DIR>    INSANE_IDEAS...[Experimental Tech]"), 450);
        setTimeout(() => printLine("10/18/2026  05:07 PM    <DIR>    HORROR_FICTION.[Library of Dread]"), 600);
        setTimeout(() => printLine("10/18/2026  05:07 PM    <DIR>    LEAVE_A_MSG....[Digital Ouija]\n"), 750);
        
        setTimeout(() => {
            printLine("Enter a directory path name below to breach that zone (e.g., 'home')");
            scrollToBottom();
        }, 900);
    }

    // Helper utilities
    function printLine(text) {
        const line = document.createTextNode(text + "\n");
        historyContainer.appendChild(line);
        scrollToBottom();
    }

    function scrollToBottom() {
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }

    // Keep console focus locked even if clicking outside fields
    document.addEventListener("click", () => {
        if (!inputForm.classList.contains("hidden")) {
            terminalInput.focus();
        }
    });
});
