(() => {
    function getRunner() {
        return (typeof Runner !== "undefined" && typeof Runner.getInstance === "function")
            ? Runner.getInstance()
            : null;
    }

    if (window.__dinoBot?.uninstall) window.__dinoBot.uninstall();

    function readObstacles(rn) {
        return [...(rn.horizon?.obstacles || [])]
            .map(o => ({ x: Number(o.xPos), y: Number(o.yPos), type: o.typeConfig?.type ?? "none", size: Number(o.size) || 1 }))
            .filter(o => Number.isFinite(o.x)).sort((a, b) => a.x - b.x).slice(0, 2);
    }

    window.__dinoBot = {
        getState() {
            const rn = getRunner();
            if (!rn || !rn.tRex) return { error: "Runner unavailable" };
            const obstacles = readObstacles(rn);
            while (obstacles.length < 2) obstacles.push({ x: -1, y: -1, type: "none", size: 0 });
            return {
                ready: Boolean(rn.activated && !rn.crashed && !rn.paused),
                crashed: Boolean(rn.crashed),
                speed: Number(rn.currentSpeed) || 0,
                jumping: Boolean(rn.tRex.jumping),
                ducking: Boolean(rn.tRex.ducking),
                obstacles: obstacles
            };
        },
        act(action) {
            const rn = getRunner();
            if (!rn || !rn.tRex || rn.crashed || rn.paused) return { ok: false };
            if (action === "jump") {
                if (rn.tRex.ducking && typeof rn.tRex.setDuck === "function") rn.tRex.setDuck(false);
                if (typeof rn.tRex.startJump === "function") rn.tRex.startJump(rn.currentSpeed);
                return { ok: true, executed: "jump" };
            }
            if (action === "duck") {
                if (typeof rn.tRex.setDuck === "function") rn.tRex.setDuck(true);
                return { ok: true, executed: "duck" };
            }
            if (rn.tRex.ducking && typeof rn.tRex.setDuck === "function") rn.tRex.setDuck(false);
            return { ok: true, executed: "none" };
        },
        uninstall() {
            delete window.__dinoBot;
        }
    };
    return { ok: true };
})();
