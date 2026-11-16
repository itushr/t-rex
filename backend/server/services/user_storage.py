import re
from fastapi import HTTPException

SAFE_PATTERN = re.compile(r"^[a-zA-Z0-9_\-]+$")


def sanitize_name(name: str) -> str:
    clean = name.strip().replace(" ", "_")
    if not SAFE_PATTERN.match(clean):
        raise HTTPException(
            status_code=400,
            detail="Invalid resource name. Use alphanumeric, dashes, underscores.",
        )
    return clean
