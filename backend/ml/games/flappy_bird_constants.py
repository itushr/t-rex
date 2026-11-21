"""Constants and feature definitions for Flappy Bird game."""

NUMERIC_FEATURES = [
    "bird_y",
    "bird_vy",
    "pipe1_dist",
    "pipe1_top",
    "pipe1_bottom",
    "dist_to_gap_top",
    "dist_to_gap_bottom",
    "pipe2_dist",
    "pipe2_top",
    "pipe2_bottom",
]

CATEGORICAL_FEATURES = []

VALID_ACTIONS = ["none", "jump"]

TARGET_COLUMN = "action"
