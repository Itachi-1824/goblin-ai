# Models, presets and prompt tools

Discover current model IDs rather than guessing names:

```python
from goblin import list_models, get_model_defaults, get_model_styles, get_model_params

catalog = list_models()
print(catalog["total_models"])
for category, group in catalog["categories"].items():
    print(category, [model["id"] for model in group["models"]])

print(get_model_defaults("goblin-flux"))
print(get_model_styles("goblin-flux"))
print(get_model_params("goblin-flux"))
```

The catalog includes general-purpose, Flux, anime, photo, portrait, illustration, landscape and asset models. Some categories include adult content; choose models and prompts appropriate to your application. Catalog availability does not guarantee that every upstream model is available at all times.

`get_model(id)` returns the model metadata or `None` for an unknown ID. `list_models()` returns a dictionary with `total_models` and category groups; it is not a flat list. The generation API raises `ValueError` for an unknown model.

## Automatic selection

```python
from goblin import auto_map, detect_model

mapping = auto_map("watercolor mountain landscape at sunset")
print(mapping.model, mapping.style, mapping.shape)
print(mapping.negative_boost, mapping.nsfw, mapping.confidence)
print(detect_model("a product photograph of a ceramic cup"))
```

`auto_map()` is a local heuristic. Its confidence is a selection score, not a calibrated probability of image quality. The simple `generate(model=None)` API uses the recommended **model**; to apply the suggested shape and style too, pass them explicitly to `Goblin.generate()`.

## Preset catalogs

`STYLES`, `QUALITY_PRESETS`, `LIGHTING_PRESETS`, `CAMERA_PRESETS`, `COMPOSITION_PRESETS`, `EXPRESSION_PRESETS`, `RESOLUTIONS` and `AVAILABLE_OPTIONS` expose the preset catalogs. Treat these dictionaries as read-only.

```python
from goblin import STYLES, QUALITY_PRESETS, RESOLUTIONS, build_prompt, get_resolution

print(list(STYLES))
print(list(QUALITY_PRESETS))
print(RESOLUTIONS)
print(get_resolution("landscape"))
positive, negative = build_prompt(
    "a mountain cabin",
    style="watercolor",
    quality="high",
    lighting="golden-hour",
)
print(positive, negative)
```

`build_prompt()` returns a `(positive_prompt, negative_prompt)` tuple and performs no image generation. `get_style`, `get_quality`, `get_lighting`, `get_camera`, `get_composition` and `get_expression` return preset dictionaries. Unknown preset names currently fall back to the corresponding default; inspect the catalogs to avoid accidental fallback. `get_resolution()` returns the provider's resolution string; `SHAPE_RESOLUTIONS` contains width/height pairs for local sizing.

Generation shapes include `square`, `square-sm`, `square-lg`, `portrait`, `portrait-lg`, `landscape`, `landscape-lg`, `wide` and `tall`. Use `RESOLUTIONS` for the exact available names and dimensions in your installed version.

## Prompt utilities

```python
from goblin import (
    random_prompt, random_character_prompt, random_landscape_prompt,
    random_anime_prompt, create_variations, list_categories,
    list_art_styles, list_environments, list_model_types,
)

print(list_categories())
print(list_art_styles())
print(list_environments())
print(list_model_types())
suggestion = random_prompt(category="landscape", style="watercolor")
print(suggestion["prompt"], suggestion["negative_prompt"])
print(random_character_prompt())
print(random_landscape_prompt(time="sunset"))
print(random_anime_prompt())
print(create_variations("a mountain cabin", count=4))
```

Random prompt functions return dictionaries, not plain strings. Use their `prompt` and `negative_prompt` fields when generating an image. `random_prompt()` also returns the selected category and style. Variations return a list of strings, with the original prompt first, and at most ten entries. These tools run locally without acquiring a generation session.

[Generation](generation.md) · [API reference](api-reference.md)
