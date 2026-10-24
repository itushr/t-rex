script = """
        (() => {
            if (window.__pythonGameHooksInstalled) {
                return "Game hooks already installed";
            }

            const runner = Runner.getInstance();

            const hooks = {
                start: "startGame",
                restart: "restart",
                over: "gameOver",
                pause: "stop",
                resume: "play"
            };

            const emit = (type) => {
                const data = {};

                if (type === "jump" || type === "over") {
                    data.currentSpeed = runner.currentSpeed;

                    data.obstacles = runner.horizon.obstacles
                        .filter(obstacle =>
                            obstacle.typeConfig.type === "cactusSmall" ||
                            obstacle.typeConfig.type === "cactusLarge"
                        )
                        .map(obstacle => ({
                            xPos: obstacle.xPos,
                            type: obstacle.typeConfig.type
                        }));
                }

                window.pythonSend(JSON.stringify({
                    type,
                    data
                }));
            };

            for (const [event, method] of Object.entries(hooks)) {
                const original = runner[method];

                if (typeof original !== "function") {
                    console.warn("Method not found:", method);
                    continue;
                }

                runner[method] = function (...args) {
                    const result = original.apply(this, args);
                    emit(event);
                    return result;
                };
            }

            const trex = runner.tRex;

            for (const [method, event] of [
                ["startJump", "jump"],
                ["setDuck", "duck"]
            ]) {
                const original = trex[method];

                if (typeof original !== "function") {
                    console.warn("T-Rex method not found:", method);
                    continue;
                }

                trex[method] = function (...args) {
                    const result = original.apply(this, args);

                    if (method === "setDuck") {
                        emit(args[0] ? "bend" : "unbend");
                    } else {
                        emit(event);
                    }

                    return result;
                };
            }

            window.__pythonGameHooksInstalled = true;

            return "Game hooks installed";
        })();
    """