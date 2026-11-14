from typing import Any, List, Optional
import pandas as pd


class FilteredGameAdapter:
    def __init__(self, ga: Any, selected: Optional[List[str]] = None):
        self._ga = ga
        self.game_id = ga.game_id
        self.target_column = ga.target_column
        self.valid_actions = ga.valid_actions
        if selected:
            sel = set(selected)
            self.numeric_features = [f for f in ga.numeric_features if f in sel]
            self.categorical_features = [f for f in ga.categorical_features if f in sel]
        else:
            self.numeric_features = list(ga.numeric_features)
            self.categorical_features = list(ga.categorical_features)
        if not self.numeric_features and not self.categorical_features:
            raise ValueError("At least one valid feature must be selected")

    def transform_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        return self._ga.transform_dataset(df)

    def prepare_inference_frame(self, raw_state: Any, expected_features: List[str]):
        return self._ga.prepare_inference_frame(raw_state, expected_features)
