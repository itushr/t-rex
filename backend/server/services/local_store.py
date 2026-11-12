from typing import Any, Dict, Optional

LOCAL_STORAGE: Dict[str, Any] = {
    "model_bundle": None,
    "model_graph": None,
    "onnx_bytes": None,
    "onnx_meta": None,
    "playback": None,
}


def set_local_model(
    bundle: Dict[str, Any],
    graph: Dict[str, Any],
    onnx_bytes: bytes,
    onnx_meta: Dict[str, Any]
) -> None:
    LOCAL_STORAGE["model_bundle"] = bundle
    LOCAL_STORAGE["model_graph"] = graph
    LOCAL_STORAGE["onnx_bytes"] = onnx_bytes
    LOCAL_STORAGE["onnx_meta"] = onnx_meta


def get_local_bundle() -> Optional[Dict[str, Any]]:
    return LOCAL_STORAGE.get("model_bundle")


def get_local_graph() -> Optional[Dict[str, Any]]:
    return LOCAL_STORAGE.get("model_graph")


def get_local_onnx_bytes() -> Optional[bytes]:
    return LOCAL_STORAGE.get("onnx_bytes")


def get_local_onnx_meta() -> Optional[Dict[str, Any]]:
    return LOCAL_STORAGE.get("onnx_meta")


def set_local_playback(playback: Dict[str, Any]) -> None:
    LOCAL_STORAGE["playback"] = playback


def get_local_playback() -> Optional[Dict[str, Any]]:
    return LOCAL_STORAGE.get("playback")
