(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    if (window.__dinoController && window.__dinoController.uninstall) {
        window.__dinoController.uninstall();
    }

    const MAX_OBSTACLES = 2;
    const emptyObstacle = () => ({ x: -1, y: -1, type: "none", size: 0, width: 0, height: 0 });

    function readObstacles(r) {
        const list = [...(r.horizon?.obstacles ?? [])]
            .map(o => ({
                x: Number(o.xPos),
                y: Number(o.yPos),
                type: o.typeConfig?.type ?? "none",
                size: Number(o.size) || 1,
                width: Number(o.width || (o.typeConfig && o.typeConfig.width * (o.size || 1)) || 0),
                height: Number(o.typeConfig?.height || o.height || 0)
            }))
            .filter(o => Number.isFinite(o.x))
            .sort((a, b) => a.x - b.x)
            .slice(0, MAX_OBSTACLES);

        while (list.length < MAX_OBSTACLES) {
            list.push(emptyObstacle());
        }
        return list;
    }

    window.__dinoController = {
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
                ready: activated && !crashed && !paused,
                speed: Number(r.currentSpeed) || 0,
                jumping: Boolean(r.tRex.jumping),
                ducking: Boolean(r.tRex.ducking),
                dino_y: Number(r.tRex.yPos) || 0,
                score: Number(r.distanceRan) || 0,
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

            if (action === "jump") {
                if (r.tRex.ducking && typeof r.tRex.setDuck === "function") {
                    r.tRex.setDuck(false);
                }
                if (typeof r.tRex.startJump === "function") {
                    r.tRex.startJump(r.currentSpeed);
                }
                return {
                    ok: true,
                    executed: "jump",
                    jumping: Boolean(r.tRex.jumping),
                    ducking: Boolean(r.tRex.ducking)
                };
            }

            if (action === "duck") {
                if (typeof r.tRex.setDuck === "function") {
                    r.tRex.setDuck(true);
                }
                return {
                    ok: true,
                    executed: "duck",
                    jumping: Boolean(r.tRex.jumping),
                    ducking: Boolean(r.tRex.ducking)
                };
            }

            // action === "none" — release duck if held
            if (r.tRex.ducking && typeof r.tRex.setDuck === "function") {
                r.tRex.setDuck(false);
            }

            return {
                ok: true,
                executed: "none",
                jumping: Boolean(r.tRex.jumping),
                ducking: Boolean(r.tRex.ducking)
            };
        },

        restart() {
            const r = Runner.getInstance();
            if (!r) return { ok: false, error: "Runner unavailable" };
            try {
                if (r.crashed) {
                    r.restart();
                    return { ok: true, action: "restart" };
                }
                return { ok: true, action: "already-running" };
            } catch (error) {
                return { ok: false, error: String(error) };
            }
        },

        start() {
            const r = Runner.getInstance();
            if (!r || !r.tRex) return { ok: false };
            try {
                if (!r.activated) {
                    r.play();
                    r.tRex.startJump(r.currentSpeed);
                }
                return { ok: true };
            } catch (error) {
                return { ok: false, error: String(error) };
            }
        },

        uninstall() {
            delete window.__dinoController;
            return true;
        }
    };

    return {
        ok: true,
        message: "Dino controller bridge installed"
    };
})()
