#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INTEGRITY_FILE = ROOT / "shared" / "integrity.json"


def verify_integrity():
    with open(INTEGRITY_FILE, "r") as f:
        data = json.load(f)

    global_games = set(data["globalGames"])
    global_models = set(data["globalModels"])

    # 1. Verify app integrity subsets
    for app_name, app_conf in data["apps"].items():
        for g in app_conf["supportedGames"]:
            if g not in global_games:
                raise ValueError(f"App {app_name} references unregistered game: {g}")
        for m in app_conf["supportedModels"]:
            if m not in global_models:
                raise ValueError(f"App {app_name} references unregistered model: {m}")

    # 2. Check line count rule (<= 100 lines) across frontend/src and backend
    violators = []
    scan_paths = [ROOT / "frontend" / "src", ROOT / "backend"]
    skip_dirs = {"__pycache__", "data", "venv", "node_modules", ".git"}

    for p in scan_paths:
        for f in p.rglob("*"):
            if not f.is_file() or any(s in f.parts for s in skip_dirs):
                continue
            if f.suffix in [".ts", ".tsx", ".py"]:
                with open(f, "r", encoding="utf-8", errors="ignore") as fh:
                    count = sum(1 for _ in fh)
                if count > 100:
                    violators.append((str(f.relative_to(ROOT)), count))

    if violators:
        print("Line count violations (> 100 lines):")
        for file_path, count in violators:
            print(f"  {file_path}: {count} lines")
        sys.exit(1)

    print("Integrity & 100-line limit check PASSED across monorepo.")


if __name__ == "__main__":
    verify_integrity()
