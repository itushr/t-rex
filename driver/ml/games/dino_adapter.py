from typing import Any, Dict, List, Tuple
import pandas as pd

from driver.ml.base.game_adapter import BaseGameAdapter
from driver.ml.games.dino_constants import (
    NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    VALID_ACTIONS,
    OBSTACLE_TYPES,
    TARGET_COLUMN,
)


def compute_time_to_impact(obs_x: float, speed: float) -> float:
    """Computes time_to_impact = obs_dist / speed, returning -1.0 if invalid."""
    try:
        x, s = float(obs_x), float(speed)
        if x > 0 and s > 0:
            return round(x / s, 3)
    except (TypeError, ValueError, ZeroDivisionError):
        pass
    return -1.0


class DinoGameAdapter(BaseGameAdapter):
    """Concrete game adapter for Chrome T-Rex runner."""

    @property
    def game_id(self) -> str:
        return "dino"

    @property
    def numeric_features(self) -> List[str]:
        return list(NUMERIC_FEATURES)

    @property
    def categorical_features(self) -> List[str]:
        return list(CATEGORICAL_FEATURES)

    @property
    def valid_actions(self) -> List[str]:
        return list(VALID_ACTIONS)

    @property
    def target_column(self) -> str:
        return TARGET_COLUMN

    def transform_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        clean = df.copy()
        if "time_to_impact" not in clean.columns or clean["time_to_impact"].isnull().any():
            tti = [
                compute_time_to_impact(x, s)
                for x, s in zip(clean.get("obstacle1_x", []), clean.get("speed", []))
            ]
            clean["time_to_impact"] = tti if "time_to_impact" not in clean.columns else clean["time_to_impact"].fillna(pd.Series(tti))
        return clean

    def prepare_inference_frame(
        self,
        raw_state: Dict[str, Any],
        expected_features: List[str]
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        obstacles = raw_state.get("obstacles", [])
        obs1 = obstacles[0] if len(obstacles) > 0 else {"x": -1, "y": -1, "type": "none", "size": 0}
        obs2 = obstacles[1] if len(obstacles) > 1 else {"x": -1, "y": -1, "type": "none", "size": 0}

        speed = float(raw_state.get("speed", 0))
        dist = float(obs1.get("x", -1))
        tti = compute_time_to_impact(dist, speed)

        raw = {
            "obstacle1_x": dist,
            "obstacle1_y": float(obs1.get("y", -1)),
            "obstacle1_type": str(obs1.get("type", "none")),
            "obstacle1_size": int(obs1.get("size", 0)),
            "obstacle2_x": float(obs2.get("x", -1)),
            "obstacle2_y": float(obs2.get("y", -1)),
            "obstacle2_type": str(obs2.get("type", "none")),
            "obstacle2_size": int(obs2.get("size", 0)),
            "speed": speed,
            "jumping": int(bool(raw_state.get("jumping", False))),
            "ducking": int(bool(raw_state.get("ducking", False))),
            "time_to_impact": tti,
        }

        frame = pd.get_dummies(pd.DataFrame([raw]), columns=self.categorical_features, dtype=int)
        frame = frame.reindex(columns=expected_features, fill_value=0)
        return frame, raw
