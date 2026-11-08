# Generalization Guide: Adding Games and Models

Dino ML is designed with abstract interfaces so new games and learning models can be added without modifying the core orchestrator or visualizer.

## 1. Adding a New Game

Inherit from `ml.base.game_adapter.BaseGameAdapter` and register the instance:

```python
from ml.base.game_adapter import BaseGameAdapter
from ml.registry import register_game

class FlappyBirdAdapter(BaseGameAdapter):
    @property
    def game_id(self) -> str:
        return "flappy"

    @property
    def numeric_features(self) -> list[str]:
        return ["pipe_dist", "pipe_gap_y", "bird_y", "velocity"]

    @property
    def categorical_features(self) -> list[str]:
        return []

    @property
    def valid_actions(self) -> list[str]:
        return ["flap", "none"]

    @property
    def target_column(self) -> str:
        return "action"

    def transform_dataset(self, df):
        return df

    def prepare_inference_frame(self, state, expected_features):
        ...

register_game(FlappyBirdAdapter())
```

## 2. Adding a New Model

Inherit from `ml.base.model_adapter.BaseModelAdapter` and register the instance:

```python
from ml.base.model_adapter import BaseModelAdapter
from ml.registry import register_model

class GradientBoostingAdapter(BaseModelAdapter):
    @property
    def model_type(self) -> str:
        return "gradient_boosting"

    def create_instance(self, **kwargs):
        ...

    def fit(self, model, X, y):
        ...

    def predict(self, model, X):
        ...

    def extract_graph(self, model, feature_names, class_names):
        ...

    def trace_path(self, model, frame, feature_names, class_names):
        ...

register_model(GradientBoostingAdapter())
```
