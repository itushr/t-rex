from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect, command


script = """
(() => {
    const runner = Runner.getInstance();

    window.cliDino = {
        keyDown(key, code, keyCode) {
            document.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key,
                    code,
                    keyCode,
                    bubbles: true
                })
            );
        },

        keyUp(key, code, keyCode) {
            document.dispatchEvent(
                new KeyboardEvent("keyup", {
                    key,
                    code,
                    keyCode,
                    bubbles: true
                })
            );
        },

        jump() {
            this.keyDown("ArrowUp", "ArrowUp", 38);
        },

        duck() {
            this.keyDown("ArrowDown", "ArrowDown", 40);
        },

        unduck() {
            this.keyUp("ArrowDown", "ArrowDown", 40);
        },

        pause() {
            if (runner.paused) runner.play();
            else runner.stop();
        },

        restart() {
            if (!runner.activated || runner.crashed) {
                runner.restart();
            } else {
                runner.restart();
            }
        }
    };

    return "Dino controls ready";
})();
"""


def main():
    debug_tabs = get_debug_tabs()

    if not debug_tabs:
        print("DINO >> error: debug tabs not detected")
        return

    dino_tabs = get_dino_tabs(debug_tabs)

    if len(dino_tabs) != 1:
        print(
            f"DINO >> error: expected one Dino tab, found {len(dino_tabs)}"
        )
        return

    connection = connect(dino_tabs[0])

    if not connection:
        print("DINO >> error: websocket connection failed")
        return

    command(connection, 1, "Runtime.enable")
    command(
        connection,
        2,
        "Runtime.evaluate",
        {"expression": script}
    )

    print("""
DINO >> CLI controls ready

  j  - Jump
  d  - Duck
  u  - Unduck
  p  - Pause / Play
  r  - Restart / Start
  q  - Quit
""")

    commands = {
        "j": "window.cliDino.jump()",
        "d": "window.cliDino.duck()",
        "u": "window.cliDino.unduck()",
        "p": "window.cliDino.pause()",
        "r": "window.cliDino.restart()",
    }

    command_id = 3

    try:
        while True:
            key = input("DINO >> ").strip().lower()

            if key == "q":
                break

            expression = commands.get(key)

            if expression:
                command(
                    connection,
                    command_id,
                    "Runtime.evaluate",
                    {"expression": expression}
                )
                command_id += 1
            else:
                print("DINO >> unknown command")

    except (KeyboardInterrupt, EOFError):
        pass

    finally:
        disconnect(connection)
        print("DINO >> disconnected")


if __name__ == "__main__":
    main()