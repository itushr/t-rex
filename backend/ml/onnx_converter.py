import json
from pathlib import Path
import sys
from typing import Any, Dict, Optional
import joblib
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "data" / "models"
ONNX_DIR = BASE_DIR / "data" / "onnxs"


def convert_model_to_onnx(
    model_path_or_name: str | Path, output_dir: Optional[Path] = None
) -> Path:
    """Converts a trained sklearn .pkl model bundle to ONNX format."""
    target_dir = Path(output_dir) if output_dir else ONNX_DIR
    target_dir.mkdir(parents=True, exist_ok=True)

    src = Path(model_path_or_name)
    if not src.exists():
        src = MODELS_DIR / f"{src.stem}.pkl"
    if not src.exists():
        raise FileNotFoundError(f"Model file not found: {model_path_or_name}")

    bundle: Dict[str, Any] = joblib.load(src)
    model = bundle["model"]
    features = list(bundle.get("features", []))
    model_name = src.stem

    initial_types = [("float_input", FloatTensorType([None, len(features)]))]
    onx = convert_sklearn(model, initial_types=initial_types, options={id(model): {"zipmap": False}})

    onnx_file = target_dir / f"{model_name}.onnx"
    onnx_file.write_bytes(onx.SerializeToString())

    meta = {
        "name": model_name,
        "model_type": bundle.get("model_type", "unknown"),
        "game_id": bundle.get("game_id", "dino"),
        "features": features,
        "numeric_features": list(bundle.get("numeric_features", [])),
        "type_features": list(bundle.get("type_features", [])),
        "categories": bundle.get("categories", {}),
        "actions": list(bundle.get("actions", [])),
    }
    json_file = target_dir / f"{model_name}.json"
    json_file.write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print(f"Successfully converted {model_name} to ONNX:")
    print(f"  Model: {onnx_file} ({onnx_file.stat().st_size} bytes)")
    print(f"  Meta:  {json_file}")
    return onnx_file


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print("Usage: python backend/ml/onnx_converter.py [<model_name_or_path>]")
        sys.exit(0)
    target = sys.argv[1] if len(sys.argv) > 1 else None
    if not target:
        models = sorted(MODELS_DIR.glob("*.pkl"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not models:
            print("No .pkl models found in backend/data/models.")
            sys.exit(1)
        target = models[0]
        print(f"No model specified. Using latest model: {target.stem}")

    convert_model_to_onnx(target)
