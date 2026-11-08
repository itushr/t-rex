import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from driver.cli import handle_record, handle_train, handle_play


def handle_server() -> None:
    import uvicorn
    from server.config import HOST, PORT
    print(f"\nStarting Dino ML Visualizer on http://localhost:{PORT}")
    uvicorn.run("server.main:app", host=HOST, port=PORT, reload=False)


def main() -> None:
    intro = """
-------------------------------------------------
  DINO-ML BOT & DRIVER ORCHESTRATOR
  [1] Watch: Record human gameplay via local CDP
  [2] Train: Fit decision tree or random forest
  [3] Play:  Bot autoplay via local CDP
  [4] Serve: Start visualizer server & web UI
  [q] Exit
-------------------------------------------------
"""
    while True:
        print(intro)
        choice = input("Select [1-4, q]: ").strip().lower()
        if choice == "1":
            handle_record()
        elif choice == "2":
            handle_train()
        elif choice == "3":
            handle_play()
        elif choice == "4":
            handle_server()
        elif choice in ["q", "quit", "exit"]:
            print("Exiting.")
            sys.exit(0)
        else:
            print("Invalid selection.")


if __name__ == "__main__":
    main()
