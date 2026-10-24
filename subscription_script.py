script = r"""
(() => {
    if (window.__pythonGameHooksInstalled) {
        return "Game hooks already installed";
    }

    const runner = Runner.getInstance();
    const trex = runner.tRex;

    function emit(type, data = {}) {
        window.pythonSend(JSON.stringify({ type, data }));
    }

    function getSnapshot() {
        const obstacles = runner.horizon?.obstacles ?? [];

        return {
            obstacle_x: obstacles
                .map(obstacle => obstacle.xPos)
                .filter(Number.isFinite)
                .sort((a, b) => a - b),

            speed: Number(runner.currentSpeed) || 0
        };
    }

    function emitAction(action) {
        emit("action", {
            action,
            ...getSnapshot()
        });
    }

    function hook(target, method, callback) {
        const original = target[method];

        if (typeof original !== "function") {
            console.warn("DINO >> method not found:", method);
            return false;
        }

        target[method] = function (...args) {
            const result = original.apply(this, args);
            callback.apply(this, args);
            return result;
        };

        return true;
    }

    // Record each actual jump.
    hook(trex, "startJump", function () {
        emitAction("jump");
    });

    // Record only changes in ducking state.
    let isDucking = false;

    hook(trex, "setDuck", function (ducking) {
        ducking = Boolean(ducking);

        if (ducking === isDucking) {
            return;
        }

        isDucking = ducking;
        emitAction(ducking ? "duck" : "unduck");
    });

    // Run lifecycle events manage the success labels in Python.
    hook(runner, "startGame", function () {
        emit("run_started");
    });

    hook(runner, "restart", function () {
        emit("run_started");
    });

    hook(runner, "gameOver", function () {
        emit("game_over");
    });

    window.__pythonGameHooksInstalled = true;

    return "Game hooks installed";
})();
"""