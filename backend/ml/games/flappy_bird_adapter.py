from typing import Any, Dict, List, Tuple
import pandas as pd
from ml.base.game_adapter import BaseGameAdapter
from ml.games.flappy_bird_constants import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
    TARGET_COLUMN,
    VALID_ACTIONS,
)


class FlappyBirdGameAdapter(BaseGameAdapter):
    """Game adapter for Flappy Bird imitation learning."""

    @property
    def game_id(self) -> str:
        return "flappy-bird"

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
        for col in self.numeric_features:
            if col not in clean.columns:
                clean[col] = 0.0
            clean[col] = pd.to_numeric(clean[col], errors="coerce").fillna(0.0)
        return clean

    def prepare_inference_frame(
        self,
        raw_state: Dict[str, Any],
        expected_features: List[str]
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        raw = {col: float(raw_state.get(col, 0.0)) for col in self.numeric_features}
        frame = pd.DataFrame([raw]).reindex(columns=expected_features, fill_value=0.0)
        return frame, raw
