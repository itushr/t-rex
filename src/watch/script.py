SCRIPT = r"""
(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    if (window.__pythonDinoRecorder) {
        return {
            ok: true,
            message: "Recorder already installed"
        };
    }

    const queue = [];

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
                return {
                    x: -1,
                    y: -1,
                    type: "none",
                    size: 0
                };
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

            // Capture the state BEFORE the game's key handler.
            jumping: Number(Boolean(r.tRex.jumping)),
            ducking: Number(Boolean(r.tRex.ducking)),

            action: action
        };
    }

    function onKeyDown(event) {
        if (event.repeat) {
            return;
        }

        // Detect jump and duck key presses.
        if (
            event.code !== "ArrowUp" &&
            event.code !== "Space" &&
            event.code !== "ArrowDown"
        ) {
            return;
        }

        const r = Runner.getInstance();

        if (!r || !r.tRex || !r.horizon) {
            return;
        }

        if (!r.activated || r.crashed || r.paused) {
            return;
        }

        let action;

        if (
            event.code === "ArrowUp" ||
            event.code === "Space"
        ) {
            // Ignore jump if Dino is already jumping.
            if (r.tRex.jumping) {
                return;
            }

            action = "jump";
        }

        if (event.code === "ArrowDown") {
            // Ignore duck if Dino is already ducking.
            if (r.tRex.ducking) {
                return;
            }

            action = "duck";
        }

        // Capture the state before the game processes the key.
        const row = snapshot(action);

        if (row) {
            queue.push(row);
        }
    }

    // Capture phase: record state before game input processing.
    window.addEventListener("keydown", onKeyDown, true);

    window.__pythonDinoRecorder = {
        nextSample() {
            // Return recorded jump/duck action first.
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
                !r.activated
            ) {
                return null;
            }

            // No new jump/duck command was recorded.
            return snapshot("none");
        },

        getQueueLength() {
            return queue.length;
        }
    };

    return {
        ok: true,
        message: "Recorder installed: jump and duck capture enabled"
    };
})()
"""