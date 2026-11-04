SCRIPT = r"""
(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    // Remove any previously installed recorder so re-running always
    // installs the latest version of this script.
    if (window.__pythonDinoRecorder && window.__pythonDinoRecorder.uninstall) {
        window.__pythonDinoRecorder.uninstall();
    }

    const queue = [];
    let duckHeld = false;

    // Same keys the game itself uses (keyCode 38/32 = jump, 40 = duck).
    // Checks keyCode, key and code, so it works whichever one the
    // input source (real keyboard, CDP, Selenium, pyautogui) provides.
    function classifyKey(event) {
        const kc = event.keyCode || event.which;
        const key = event.key;
        const code = event.code;

        if (kc === 40 || key === "ArrowDown" || key === "Down" || code === "ArrowDown") {
            return "duck";
        }
        if (
            kc === 38 || kc === 32 ||
            key === "ArrowUp" || key === "Up" || key === " " || key === "Spacebar" ||
            code === "ArrowUp" || code === "Space"
        ) {
            return "jump";
        }
        return null;
    }

    function snapshot(action) {
        const r = Runner.getInstance();

        if (!r || !r.tRex || !r.horizon) {
            return null;
        }

        const obstacles = [...(r.horizon.obstacles || [])]
            .map(o => ({
                x: Number(o.xPos),
                y: Number(o.yPos),
                type: o.typeConfig?.type ?? "none",
                size: Number(o.size) || 1
            }))
            .filter(o => Number.isFinite(o.x))
            .sort((a, b) => a.x - b.x);

        function getObstacle(index) {
            if (index >= obstacles.length) {
                return { x: -1, y: -1, type: "none", size: 0 };
            }
            return obstacles[index];
        }

        const first = getObstacle(0);
        const second = getObstacle(1);

        return {
            obstacle1_x: first.x,
            obstacle1_y: first.y,
            obstacle1_type: first.type,
            obstacle1_size: first.size,

            obstacle2_x: second.x,
            obstacle2_y: second.y,
            obstacle2_type: second.type,
            obstacle2_size: second.size,

            speed: Number(r.currentSpeed) || 0,

            jumping: Number(Boolean(r.tRex.jumping)),
            ducking: Number(Boolean(r.tRex.ducking)),

            action: action
        };
    }

    function onKeyDown(event) {
        const kind = classifyKey(event);
        if (!kind) {
            return;
        }

        // Track held duck regardless of repeat/game state.
        if (kind === "duck") {
            duckHeld = true;
        }

        if (event.repeat) {
            return;
        }

        const r = Runner.getInstance();

        if (!r || !r.tRex || !r.horizon) {
            return;
        }

        // Only require the game to be running (not crashed / paused).
        if (r.crashed || r.paused || !(r.playing || r.activated)) {
            return;
        }

        let action = null;

        if (kind === "jump") {
            if (r.tRex.jumping) {
                return;
            }
            action = "jump";
        } else if (kind === "duck") {
            // Don't filter on tRex.ducking or tRex.jumping:
            // ducking mid-air is a speed drop and still a duck input.
            action = "duck";
        }

        // Capture state before the game's key handler processes input.
        const row = snapshot(action);

        if (row) {
            queue.push(row);
        }
    }

    function onKeyUp(event) {
        if (classifyKey(event) === "duck") {
            duckHeld = false;
        }
    }

    // Capture phase on window: runs before the game's document-level handler.
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    // Also listen on document in capture mode in case a source dispatches
    // events directly on document (they wouldn't pass through window capture
    // in some synthetic cases).
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);

    window.__pythonDinoRecorder = {
        nextSample() {
            // Return recorded action samples first.
            if (queue.length > 0) {
                return queue.shift();
            }

            const r = Runner.getInstance();

            if (
                !r ||
                !r.tRex ||
                !r.horizon ||
                r.crashed ||
                r.paused ||
                !(r.playing || r.activated)
            ) {
                return null;
            }

            // No jump or duck keydown was captured.
            return snapshot("none");
        },

        getQueueLength() {
            return queue.length;
        },

        getQueue() {
            return [...queue];
        },

        clearQueue() {
            queue.length = 0;
            return true;
        },

        isDuckHeld() {
            return duckHeld;
        },

        uninstall() {
            window.removeEventListener("keydown", onKeyDown, true);
            window.removeEventListener("keyup", onKeyUp, true);
            document.removeEventListener("keydown", onKeyDown, true);
            document.removeEventListener("keyup", onKeyUp, true);
            delete window.__pythonDinoRecorder;
            return true;
        }
    };

    return {
        ok: true,
        message: "Recorder installed: jump and duck capture enabled"
    };
})()
"""