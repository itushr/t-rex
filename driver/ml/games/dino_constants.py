"""Constants and configuration for Chrome T-Rex runner game."""

NUMERIC_FEATURES = [
    "obstacle1_x",
    "obstacle1_y",
    "obstacle1_size",
    "obstacle2_x",
    "obstacle2_y",
    "obstacle2_size",
    "speed",
    "jumping",
    "ducking",
    "time_to_impact",
]

CATEGORICAL_FEATURES = [
    "obstacle1_type",
    "obstacle2_type",
]

VALID_ACTIONS = ["none", "jump", "duck"]

OBSTACLE_TYPES = [
    "none",
    "cactusSmall",
    "cactusLarge",
    "pterodactyl",
    "collectable",
]

TARGET_COLUMN = "action"
