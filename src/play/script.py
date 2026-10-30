BRIDGE_SCRIPT = r"""
(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    window.__pythonDino = {
        getState() {
            const r = Runner.getInstance();

            if (!r) {
                return { error: "Runner unavailable" };
            }

            const obstacles = [
                ...(r.horizon?.obstacles ?? [])
            ]
                .map(o => ({
                    x: Number(o.xPos),
                    y: Number(o.yPos),
                    type: o.typeConfig?.type ?? "none",
                    size: Number(o.size) || 1
                }))
                .filter(o => Number.isFinite(o.x))
                .sort((a, b) => a.x - b.x);

            return {
                activated: Boolean(r.activated),
                crashed: Boolean(r.crashed),
                paused: Boolean(r.paused),
                speed: Number(r.currentSpeed) || 0,
                jumping: Boolean(r.tRex.jumping),
                ducking: Boolean(r.tRex.ducking),
                obstacles: obstacles.slice(0, 2)
            };
        },

        act(action) {
            const r = Runner.getInstance();

            if (!r || !r.tRex) {
                return {
                    ok: false,
                    error: "T-Rex unavailable"
                };
            }

            if (r.crashed || r.paused) {
                return {
                    ok: false,
                    error: r.crashed ? "game over" : "paused"
                };
            }

            try {
                // Release ducking before every non-duck action.
                if (action !== "duck" && r.tRex.ducking) {
                    if (typeof r.tRex.setDuck !== "function") {
                        return {
                            ok: false,
                            error: "T-Rex setDuck() unavailable"
                        };
                    }

                    r.tRex.setDuck(false);
                }

                if (action === "duck") {
                    if (!r.tRex.ducking) {
                        if (typeof r.tRex.setDuck !== "function") {
                            return {
                                ok: false,
                                error: "T-Rex setDuck() unavailable"
                            };
                        }

                        r.tRex.setDuck(true);
                    }

                    return {
                        ok: true,
                        action: "duck",
                        ducking: Boolean(r.tRex.ducking)
                    };
                }

                if (action === "jump") {
                    if (r.tRex.jumping) {
                        return {
                            ok: true,
                            action: "jump",
                            skipped: "already jumping",
                            jumping: true
                        };
                    }

                    if (typeof r.tRex.startJump !== "function") {
                        return {
                            ok: false,
                            error: "T-Rex startJump() unavailable"
                        };
                    }

                    r.tRex.startJump(r.currentSpeed);

                    // Release the jump after a short hold.
                    setTimeout(() => {
                        try {
                            r.tRex.endJump();
                        } catch (_) {}
                    }, 100);

                    return {
                        ok: true,
                        action: "jump",
                        jumping: Boolean(r.tRex.jumping)
                    };
                }

                if (action === "none") {
                    return {
                        ok: true,
                        action: "none"
                    };
                }

                return {
                    ok: false,
                    error: "Unknown action: " + action
                };

            } catch (error) {
                return {
                    ok: false,
                    error: String(error)
                };
            }
        },

        restart() {
            const r = Runner.getInstance();

            if (!r) {
                return {
                    ok: false,
                    error: "Runner unavailable"
                };
            }

            try {
                if (r.crashed) {
                    r.restart();

                    return {
                        ok: true,
                        action: "restart"
                    };
                }

                return {
                    ok: true,
                    action: "already-running"
                };

            } catch (error) {
                return {
                    ok: false,
                    error: String(error)
                };
            }
        }
    };

    return {
        ok: true,
        message: "Dino classifier control bridge installed"
    };
})()
"""
