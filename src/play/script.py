SCRIPT = r"""
(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    const JUMP_COOLDOWN_MS = 250;
    const JUMP_HOLD_MS = 100;
    const MAX_OBSTACLES = 2;
    const OBSTACLE_TYPES = new Set([
        "none", "cactusSmall", "cactusLarge", "pterodactyl", "collectable"
    ]);

    // Game-logic state lives in the browser.
    const control = {
        lastJumpAt: 0,
        jumpLatched: false
    };

    const emptyObstacle = () => ({ x: -1, y: -1, type: "none", size: 0 });

    function readObstacles(r) {
        const list = [...(r.horizon?.obstacles ?? [])]
            .map(o => {
                const type = o.typeConfig?.type ?? "none";
                return {
                    x: Number(o.xPos),
                    y: Number(o.yPos),
                    type: OBSTACLE_TYPES.has(type) ? type : "none",
                    size: Number(o.size) || 1
                };
            })
            .filter(o => Number.isFinite(o.x))
            .sort((a, b) => a.x - b.x)
            .slice(0, MAX_OBSTACLES);

        // Pad so the model always receives exactly MAX_OBSTACLES entries.
        while (list.length < MAX_OBSTACLES) list.push(emptyObstacle());
        return list;
    }

    window.__pythonDino = {
        getState() {
            const r = Runner.getInstance();

            if (!r || !r.tRex) {
                return { error: "Runner unavailable" };
            }

            const activated = Boolean(r.activated);
            const crashed = Boolean(r.crashed);
            const paused = Boolean(r.paused);

            return {
                activated,
                crashed,
                paused,
                // True only when an action should be predicted and sent.
                ready: activated && !crashed && !paused,
                speed: Number(r.currentSpeed) || 0,
                jumping: Boolean(r.tRex.jumping),
                ducking: Boolean(r.tRex.ducking),
                obstacles: readObstacles(r)
            };
        },

        act(action) {
            const r = Runner.getInstance();

            if (!r || !r.tRex) {
                return { ok: false, error: "T-Rex unavailable" };
            }

            if (r.crashed || r.paused) {
                return {
                    ok: false,
                    error: r.crashed ? "game over" : "paused"
                };
            }
            
            if (action === "none") {
                control.jumpLatched = false;

                return {
                    ok: true,
                    requested: "none",
                    executed: "none",
                    suppressed: null
                };
            }

            try {
                const now = performance.now();
                const requested = action;

                if (!["none", "jump", "duck"].includes(action)) {
                    return { ok: false, error: "Unknown action: " + action };
                }

                // Any non-jump request releases the jump latch.
                if (action !== "jump") {
                    control.jumpLatched = false;
                }

                // Suppress repeated / too-frequent jumps.
                let suppressed = null;
                if (action === "jump") {
                    if (control.jumpLatched) {
                        suppressed = "latched";
                    } else if (r.tRex.jumping) {
                        suppressed = "already jumping";
                    } else if (now - control.lastJumpAt < JUMP_COOLDOWN_MS) {
                        suppressed = "cooldown";
                    }

                    if (suppressed) action = "none";
                }

                // Release ducking before every non-duck action.
                if (action !== "duck" && r.tRex.ducking) {
                    if (typeof r.tRex.setDuck !== "function") {
                        return { ok: false, error: "T-Rex setDuck() unavailable" };
                    }
                    r.tRex.setDuck(false);
                }

                if (action === "duck") {
                    let started = false;

                    if (!r.tRex.ducking) {
                        if (typeof r.tRex.setDuck !== "function") {
                            return { ok: false, error: "T-Rex setDuck() unavailable" };
                        }
                        r.tRex.setDuck(true);
                        started = true;
                    }

                    return {
                        ok: true,
                        requested,
                        executed: "duck",
                        started,
                        ducking: Boolean(r.tRex.ducking)
                    };
                }

                if (action === "jump") {
                    if (typeof r.tRex.startJump !== "function") {
                        return { ok: false, error: "T-Rex startJump() unavailable" };
                    }

                    r.tRex.startJump(r.currentSpeed);
                    control.jumpLatched = true;
                    control.lastJumpAt = now;

                    // Release the jump after a short hold.
                    setTimeout(() => {
                        try { r.tRex.endJump(); } catch (_) {}
                    }, JUMP_HOLD_MS);

                    return {
                        ok: true,
                        requested,
                        executed: "jump",
                        started: true,
                        jumping: Boolean(r.tRex.jumping)
                    };
                }

                return {
                    ok: true,
                    requested,
                    executed: "none",
                    suppressed
                };

            } catch (error) {
                return { ok: false, error: String(error) };
            }
        },

        restart() {
            const r = Runner.getInstance();

            if (!r) {
                return { ok: false, error: "Runner unavailable" };
            }

            try {
                if (r.crashed) {
                    r.restart();
                    return { ok: true, action: "restart" };
                }
                return { ok: true, action: "already-running" };
            } catch (error) {
                return { ok: false, error: String(error) };
            }
        }
    };

    return {
        ok: true,
        message: "Dino classifier control bridge installed"
    };
})()
"""