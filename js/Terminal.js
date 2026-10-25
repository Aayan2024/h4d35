/* ============================================================
   THE CRYPT — js/terminal.js
   Handles: terminal screen boot, typewriter, command processor,
            keyboard input, HELP output.
   Depends on: main.js (window.Crypt), GSAP
   ============================================================ */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        const terminalScreen = document.getElementById("terminal-screen");
        const terminalOutput = document.getElementById("terminal-output");
        const terminalTyped  = document.getElementById("terminal-typed");
        const audioType      = document.getElementById("audio-type");
        const audioClick     = document.getElementById("audio-click");

        if (!terminalScreen) return;

        /* ---- Listen for skeleton zoom complete ---- */
        window.addEventListener("crypt:showTerminal", () => {
            showTerminalScreen();
        });


        /* --------------------------------------------------------
           SHOW TERMINAL SCREEN
        -------------------------------------------------------- */
        function showTerminalScreen() {
            terminalScreen.classList.remove("hidden");
            terminalScreen.classList.add("current");
            Crypt.State.currentScreen = "terminal-screen";

            gsap.fromTo(terminalScreen,
                { opacity: 0, filter: "brightness(3)" },
                { opacity: 1, filter: "brightness(1)", duration: 0.6, ease: "power2.out" }
            );

            runBootSequence();
        }


        /* --------------------------------------------------------
           TYPEWRITER ENGINE
        -------------------------------------------------------- */
        const CHAR_DELAY = 22;
        const LINE_DELAY = 110;
        let   inputLocked = true;
        let   inputEnabled = false;
        let   userInput    = "";

        function addOutputLine(text, className = "", delay = 0) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const span = document.createElement("span");
                    span.classList.add("t-line");
                    if (className) span.classList.add(className);
                    span.textContent = text;
                    terminalOutput.appendChild(span);
                    scrollTerminal();
                    resolve();
                }, delay);
            });
        }

        function typewriterLine(text, className = "") {
            return new Promise(resolve => {
                const span = document.createElement("span");
                span.classList.add("t-line");
                if (className) span.classList.add(className);
                terminalOutput.appendChild(span);
                scrollTerminal();

                let i = 0;
                function typeChar() {
                    if (i < text.length) {
                        span.textContent += text[i];
                        i++;
                        if (Math.random() > 0.85) {
                            Crypt.playSound(audioType);
                        }
                        scrollTerminal();
                        setTimeout(typeChar, CHAR_DELAY + Math.random() * 18);
                    } else {
                        setTimeout(resolve, LINE_DELAY);
                    }
                }
                typeChar();
            });
        }

        function scrollTerminal() {
            const vp = document.getElementById("terminal-viewport");
            if (vp) vp.scrollTop = vp.scrollHeight;
        }

        /* Simulate auto-typing a command into the input field */
        function autoTypeCommand(cmd) {
            return new Promise(resolve => {
                terminalTyped.textContent = "";
                inputLocked = true;
                let i = 0;
                function t() {
                    if (i < cmd.length) {
                        terminalTyped.textContent += cmd[i];
                        Crypt.playSound(audioType);
                        i++;
                        setTimeout(t, 90 + Math.random() * 40);
                    } else {
                        setTimeout(() => {
                            addOutputLine(">> " + cmd, "cmd-echo");
                            terminalTyped.textContent = "";
                            resolve();
                        }, 400);
                    }
                }
                setTimeout(t, 500);
            });
        }


        /* --------------------------------------------------------
           BOOT SEQUENCE
        -------------------------------------------------------- */
        async function runBootSequence() {
            inputLocked = true;
            terminalOutput.innerHTML = "";

            const bootLines = [
                { text: "",                                               cls: "" },
                { text: "C R Y P T  O S   v 1 . 9 3 . 1",              cls: "t-title" },
                { text: "═══════════════════════════════════════",        cls: "t-dim" },
                { text: "",                                               cls: "" },
                { text: "BIOS initialising...",                           cls: "" },
                { text: "Memory check:      [████████████] 640K OK",     cls: "" },
                { text: "Shadow RAM:        [HAUNTED]",                   cls: "t-error" },
                { text: "Paranormal device: [DETECTED]",                  cls: "t-error" },
                { text: "Soul integrity:    [NOMINAL]",                   cls: "t-success" },
                { text: "",                                               cls: "" },
                { text: "Loading CRYPT.SYS .....",                        cls: "" },
                { text: "Loading SÉANCE.DRV ...",                         cls: "" },
                { text: "Loading SPIRIT.EXE ..",                          cls: "t-success" },
                { text: "",                                               cls: "" },
                { text: "THE CRYPT OS — ready.",                          cls: "t-success" },
                { text: "Type HELP to see available commands.",            cls: "t-dim" },
                { text: "",                                               cls: "" },
            ];

            for (const line of bootLines) {
                await typewriterLine(line.text, line.cls);
            }

            await autoTypeCommand("HELP");
            await runHelpOutput();
        }


        /* --------------------------------------------------------
           HELP OUTPUT
        -------------------------------------------------------- */
        async function runHelpOutput() {
            const helpLines = [
                { text: "",                                                      cls: "" },
                { text: "┌─────────────────────────────────────────────┐",      cls: "t-dim" },
                { text: "│         AVAILABLE COMMANDS                  │",      cls: "t-dim" },
                { text: "├─────────────────────────────────────────────┤",      cls: "t-dim" },
                { text: "│  DIAGNOSTICS  — who / what is this entity   │",      cls: "" },
                { text: "│  ARCHIVE      — experiment files 199X       │",      cls: "" },
                { text: "│  TRANSMIT     — intercepted signal logs      │",      cls: "" },
                { text: "│  SÉANCE       — establish contact           │",      cls: "" },
                { text: "│  CREATION     — the creation chamber        │",      cls: "" },
                { text: "│  CLEAR        — clear terminal              │",      cls: "" },
                { text: "│  HELP         — show this again             │",      cls: "" },
                { text: "└─────────────────────────────────────────────┘",      cls: "t-dim" },
                { text: "",                                                      cls: "" },
                { text: "Enter command below ▼",                                cls: "t-dim" },
                { text: "",                                                      cls: "" },
            ];

            for (const line of helpLines) {
                await addOutputLine(line.text, line.cls, 60);
            }

            inputLocked = false;
            enableKeyboardInput();
        }


        /* --------------------------------------------------------
           KEYBOARD INPUT
        -------------------------------------------------------- */
        function enableKeyboardInput() {
            if (inputEnabled) return;
            inputEnabled = true;
            document.addEventListener("keydown", handleKeyDown);
        }

        function handleKeyDown(e) {
            if (inputLocked) return;
            // Only handle input when terminal is the active screen
            if (Crypt.State.currentScreen !== "terminal-screen") return;
            // Don't steal typing from section form inputs
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

            if (e.key === "Enter") {
                const cmd = userInput.trim().toUpperCase();
                terminalTyped.textContent = "";
                userInput = "";
                processCommand(cmd);

            } else if (e.key === "Backspace") {
                userInput = userInput.slice(0, -1);
                terminalTyped.textContent = userInput;

            } else if (e.key.length === 1 && userInput.length < 20) {
                userInput += e.key;
                terminalTyped.textContent = userInput;
                Crypt.playSound(audioType);
            }
        }


        /* --------------------------------------------------------
           COMMAND PROCESSOR
        -------------------------------------------------------- */
        async function processCommand(cmd) {
            inputLocked = true;
            await addOutputLine(">> " + cmd, "cmd-echo");
            await addOutputLine("", "");

            switch (cmd) {

                case "HELP":
                    await runHelpOutput();
                    break;

                case "DIAGNOSTICS":
                    await addOutputLine("ACCESSING DIAGNOSTICS.LOG ...", "", 0);
                    await Crypt.delay(600);
                    Crypt.openSection("section-diagnostics");
                    inputLocked = false;
                    break;

                case "ARCHIVE":
                    await addOutputLine("MOUNTING EXPERIMENT_ARCHIVE_199X ...", "", 0);
                    await Crypt.delay(600);
                    Crypt.openSection("section-archive");
                    inputLocked = false;
                    break;

                case "TRANSMIT":
                    await addOutputLine("DECODING TRANSMISSIONS.TXT ...", "", 0);
                    await Crypt.delay(600);
                    Crypt.openSection("section-transmissions");
                    inputLocked = false;
                    break;

                case "SÉANCE":
                case "SEANCE":
                    await addOutputLine("INITIALISING SÉANCE.EXE ...", "", 0);
                    await Crypt.delay(800);
                    Crypt.openSection("section-seance");
                    inputLocked = false;
                    break;

                case "CREATION":
                    await addOutputLine("UNLOCKING CREATION_CHAMBER.EXE ...", "", 0);
                    await addOutputLine("WARNING: Do not touch the ink pipes.", "t-error", 60);
                    await Crypt.delay(900);
                    Crypt.openSection("section-creation");
                    inputLocked = false;
                    break;

                case "CLEAR":
                    terminalOutput.innerHTML = "";
                    await addOutputLine("Terminal cleared.", "t-dim");
                    await addOutputLine("Type HELP for commands.", "t-dim");
                    await addOutputLine("", "");
                    inputLocked = false;
                    break;

                case "":
                    inputLocked = false;
                    break;

                default:
                    await addOutputLine("ERROR: Unknown command '" + cmd + "'", "t-error");
                    await addOutputLine("Type HELP for available commands.", "t-dim");
                    await addOutputLine("", "");
                    if (Math.random() > 0.5) {
                        const spooky = [
                            "...the entity does not recognise this command.",
                            "...something stirred in the dark.",
                            "...try again. it is listening.",
                            "...incorrect. but it noticed you.",
                        ];
                        await addOutputLine(
                            spooky[Math.floor(Math.random() * spooky.length)],
                            "t-dim"
                        );
                        await addOutputLine("", "");
                    }
                    inputLocked = false;
                    break;
            }
        }

        /* Expose addOutputLine so section modules can print to terminal */
        window.Crypt.terminalPrint = addOutputLine;

    }); // DOMContentLoaded

})();
