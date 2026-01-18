"""
Goblin - Free AI Image Generation
34 Models including Stable Diffusion, Flux, Anime, Realistic, and more!
"""
# Runtime protection
from . import _guard

from .generator import Goblin, GenerateRequest
from .server import create_app, run_server
from .models import MODELS, CATEGORIES, list_models, get_model, get_model_styles, get_model_params, get_model_defaults
from .parameters import (
    STYLES, QUALITY_PRESETS, LIGHTING_PRESETS, CAMERA_PRESETS,
    COMPOSITION_PRESETS, EXPRESSION_PRESETS, RESOLUTIONS, AVAILABLE_OPTIONS,
    build_prompt, get_style, get_quality, get_lighting, get_camera,
    get_composition, get_expression, get_resolution
)

__version__ = "1.0.0"
__all__ = [
    # Main class
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
]
