"""
Goblin - Free AI Image Generation
50 Models. No API key. No sign-up. Just generate.

Simple usage:
    from goblin import generate
    image = await generate("a beautiful sunset")

That's it. We handle model selection, optimal settings, everything.
"""
# Runtime protection
from . import _guard

# Simple API (recommended)
from .easy import generate, generate_batch, detect_model, close

# Advanced API
from .generator import Goblin, GenerateRequest
from .server import create_app, run_server
from .models import MODELS, CATEGORIES, list_models, get_model, get_model_styles, get_model_params, get_model_defaults
from .parameters import (
    STYLES, QUALITY_PRESETS, LIGHTING_PRESETS, CAMERA_PRESETS,
    COMPOSITION_PRESETS, EXPRESSION_PRESETS, RESOLUTIONS, AVAILABLE_OPTIONS,
    build_prompt, get_style, get_quality, get_lighting, get_camera,
    get_composition, get_expression, get_resolution
)
from .prompts import (
    random_prompt, enhance_prompt, enhance_for_model,
    random_character_prompt, random_landscape_prompt, random_anime_prompt,
    create_variations, list_categories, list_art_styles, list_environments,
    list_model_types
)

__version__ = "1.1.0"
__all__ = [
    # Simple API (recommended)
    "generate",
    "generate_batch",
    "detect_model",
    "close",

    # Advanced API
    "Goblin",
    "GenerateRequest",

    # Server
    "create_app",
    "run_server",

    # Models
    "MODELS",
    "CATEGORIES",
    "list_models",
    "get_model",
    "get_model_styles",
    "get_model_params",
    "get_model_defaults",

    # Parameters
    "STYLES",
    "QUALITY_PRESETS",
    "LIGHTING_PRESETS",
    "CAMERA_PRESETS",
    "COMPOSITION_PRESETS",
    "EXPRESSION_PRESETS",
    "RESOLUTIONS",
    "AVAILABLE_OPTIONS",
    "build_prompt",
    "get_style",
    "get_quality",
    "get_lighting",
    "get_camera",
    "get_composition",
    "get_expression",
    "get_resolution",

    # Prompt Tools
    "random_prompt",
    "enhance_prompt",
    "enhance_for_model",
    "random_character_prompt",
    "random_landscape_prompt",
    "random_anime_prompt",
    "create_variations",
    "list_categories",
    "list_art_styles",
    "list_environments",
    "list_model_types",
]
