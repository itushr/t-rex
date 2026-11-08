(() => {
    const r = Runner.getInstance();
    if (!r || !r.tRex || !r.horizon) throw new Error("Dino game not ready");
    if (window.__dinoRecorder?.uninstall) window.__dinoRecorder.uninstall();

    const queue = [];
    let duckHeld = false;

    function classifyKey(e) {
        const k = e.key, kc = e.keyCode || e.which;
        if (kc === 40 || k === "ArrowDown") return "duck";
        if (kc === 38 || kc === 32 || k === "ArrowUp" || k === " ") return "jump";
        return null;
    }

    function snapshot(action) {
        const rn = Runner.getInstance();
        if (!rn || !rn.tRex || !rn.horizon) return null;
        const obs = [...(rn.horizon.obstacles || [])]
            .map(o => ({ x: Number(o.xPos), y: Number(o.yPos), type: o.typeConfig?.type ?? "none", size: Number(o.size) || 1 }))
            .filter(o => Number.isFinite(o.x)).sort((a, b) => a.x - b.x);
        const f = obs[0] || { x: -1, y: -1, type: "none", size: 0 };
        const s = obs[1] || { x: -1, y: -1, type: "none", size: 0 };
        const spd = Number(rn.currentSpeed) || 0;
        return {
            obstacle1_x: f.x, obstacle1_y: f.y, obstacle1_type: f.type, obstacle1_size: f.size,
            obstacle2_x: s.x, obstacle2_y: s.y, obstacle2_type: s.type, obstacle2_size: s.size,
            speed: spd, jumping: Number(Boolean(rn.tRex.jumping)), ducking: Number(Boolean(rn.tRex.ducking)),
            time_to_impact: (f.x > 0 && spd > 0) ? Number((f.x / spd).toFixed(3)) : -1,
            action: action
        };
    }

    function onKeyDown(e) {
        const k = classifyKey(e);
        if (!k) return;
        if (k === "duck") duckHeld = true;
        if (e.repeat) return;
        const rn = Runner.getInstance();
        if (!rn || rn.crashed || rn.paused || !(rn.playing || rn.activated)) return;
        if (k === "jump" && rn.tRex.jumping) return;
        const row = snapshot(k);
        if (row) queue.push(row);
    }

    function onKeyUp(e) {
        if (classifyKey(e) === "duck") duckHeld = false;
    }

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);

    window.__dinoRecorder = {
        nextSample() {
            if (queue.length > 0) return queue.shift();
            const rn = Runner.getInstance();
            if (!rn || rn.crashed || rn.paused || !(rn.playing || rn.activated)) return null;
            return snapshot(duckHeld ? "duck" : "none");
        },
        uninstall() {
            window.removeEventListener("keydown", onKeyDown, true);
            window.removeEventListener("keyup", onKeyUp, true);
            delete window.__dinoRecorder;
        }
    };
    return { ok: true };
})();
