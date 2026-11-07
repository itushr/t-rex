(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    if (window.__dinoRecorder && window.__dinoRecorder.uninstall) {
        window.__dinoRecorder.uninstall();
    }

    // Queue for samples to be consumed by Python
    const queue = [];

    // Track the currently held action key
    let heldAction = "none";

    // Track last-recorded none frame time for throttling idle samples
    let lastNoneTime = 0;

    // After an action, record N more context frames before throttling idle again
    let contextFramesLeft = 0;
    const CONTEXT_FRAMES_AFTER_ACTION = 8;

    // Minimum ms between idle (none) samples when no action is happening
    // This prevents the queue from being flooded with none samples
    const IDLE_THROTTLE_MS = 80;

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
                size: Number(o.size) || 1,
                width: Number(o.width || (o.typeConfig && o.typeConfig.width * (o.size || 1)) || 0),
                height: Number(o.typeConfig?.height || o.height || 0)
            }))
            .filter(o => Number.isFinite(o.x))
            .sort((a, b) => a.x - b.x);

        function getObstacle(index) {
            if (index >= obstacles.length) {
                return { x: -1, y: -1, type: "none", size: 0, width: 0, height: 0 };
            }
            return obstacles[index];
        }

        const first = getObstacle(0);
        const second = getObstacle(1);

        const currentSpeed = Number(r.currentSpeed) || 0;
        const timeToImpact = (first.x > 0 && currentSpeed > 0)
            ? Number((first.x / currentSpeed).toFixed(3))
            : -1;

        return {
            obstacle1_x: first.x,
            obstacle1_y: first.y,
            obstacle1_type: first.type,
            obstacle1_size: first.size,
            obstacle1_width: first.width,
            obstacle1_height: first.height,

            obstacle2_x: second.x,
            obstacle2_y: second.y,
            obstacle2_type: second.type,
            obstacle2_size: second.size,
            obstacle2_width: second.width,
            obstacle2_height: second.height,

            speed: currentSpeed,
            jumping: r.tRex.jumping ? 1 : 0,
            ducking: r.tRex.ducking ? 1 : 0,
            dino_y: Number(r.tRex.yPos) || 0,
            score: Number(r.distanceRan) || 0,
            time_to_impact: timeToImpact,

            action: action
        };
    }

    function onKeyDown(event) {
        const kind = classifyKey(event);
        if (!kind) return;

        heldAction = kind;

        // Don't record repeated keydown events (key held)
        if (event.repeat) return;

        const r = Runner.getInstance();
        if (!r || !r.tRex || !r.horizon) return;
        if (r.crashed || r.paused || !(r.playing || r.activated)) return;

        // Record the action frame immediately
        const row = snapshot(kind);
        if (row) {
            queue.push(row);
            // After an action, record context frames without throttling
            contextFramesLeft = CONTEXT_FRAMES_AFTER_ACTION;
        }
    }

    function onKeyUp(event) {
        const kind = classifyKey(event);
        if (kind && kind === heldAction) {
            heldAction = "none";
        }
    }

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);

    window.__dinoRecorder = {
        nextSample() {
            // Always drain explicit action events first
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

            const now = Date.now();

            if (heldAction !== "none") {
                // Actively held key: record every poll
                return snapshot(heldAction);
            }

            // Idle (none) frame: apply throttling logic
            if (contextFramesLeft > 0) {
                // Just after an action: record context frames freely
                contextFramesLeft--;
                return snapshot("none");
            }

            // Throttle idle none frames
            if (now - lastNoneTime >= IDLE_THROTTLE_MS) {
                lastNoneTime = now;
                return snapshot("none");
            }

            return null;
        },

        getQueueLength() {
            return queue.length;
        },

        clearQueue() {
            queue.length = 0;
            return true;
        },

        uninstall() {
            window.removeEventListener("keydown", onKeyDown, true);
            window.removeEventListener("keyup", onKeyUp, true);
            delete window.__dinoRecorder;
            return true;
        }
    };

    return {
        ok: true,
        message: "Dino watch recorder installed"
    };
})()
