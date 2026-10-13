# Complete Python API reference

Reference for Goblin 2.1.2. All 67 names in `goblin.__all__` are listed below. Import them from `goblin` unless a submodule is explicitly shown.

Signatures describe the supported public interface. `Optional`, `Union` and `Callable` below use their normal Python typing meanings. Async functions must be awaited. See the guides for behavior, errors and compatibility fields.

## Simple generation

### `generate`

```text
await goblin.generate(prompt: str, model: Optional[str] = None, negative_prompt: str = '', output: Optional[Union[str, Path]] = None, width: int = 768, height: int = 768, seed: int = -1, guidance_scale: Optional[float] = None, quality: str = 'ultra', enhance_output: bool = True, upscale_output: bool = False, upscale_model: str = 'span', restore_model: Optional[str] = None, request = None, user_id: Optional[str] = None, user_key: Optional[str] = None, **kwargs) -> bytes
```

Create an image and optionally process/save it. Await this function; see the generation guide for defaults and output behavior.

### `generate_batch`

```text
await goblin.generate_batch(prompts: list[str], model: Optional[str] = None, **kwargs) -> list[bytes]
```

Create images for a list of prompts, preserving order. Await this function; failures raise.

### `detect_model`

```text
goblin.detect_model(prompt: str) -> str
```

Return the selected model ID without generation or network access.

### `close`

```text
await goblin.close()
```

Close the shared simple-SDK generator. Await before ending its event loop.

### `set_web_mode`

```text
goblin.set_web_mode(enabled: bool = True)
```

Select the shared SDK wrapper mode. Call before initializing the shared generator.

## Automatic selection

### `auto_map`

```text
goblin.auto_map(prompt: str) -> AutoMapResult
```

Return AutoMapResult with model, style, shape, negative_boost, nsfw and confidence.

### `AutoMapResult`

Dataclass fields:

| Field | Type | Default |
|---|---|---|
| `model` | `str` | `required` |
| `style` | `str` | `required` |
| `shape` | `str` | `required` |
| `negative_boost` | `str` | `required` |
| `nsfw` | `bool` | `required` |
| `confidence` | `float` | `required` |

## Advanced generation

### `Goblin`

```text
goblin.Goblin(headless: bool = True, verbose: bool = False)
```

```text
await goblin.Goblin.start()
```

```text
await goblin.Goblin.close()
```

- `Goblin.models`: read-only property.

- `Goblin.available_options`: read-only property.

```text
goblin.Goblin.get_model(model_id: str) -> dict
```

```text
goblin.Goblin.get_model_styles(model_id: str) -> list
```

```text
await goblin.Goblin.generate(prompt: str, negative_prompt: str = '', model: str = 'goblin-sd', shape: str = 'square', seed: int = -1, guidance_scale: Optional[float] = None, style: str = 'default', quality: str = 'standard', lighting: str = 'auto', camera: str = 'auto', composition: str = 'auto', expression: str = 'auto', style_strength: float = 1.0, remove_background: bool = False, reference_image: Optional[str] = None, return_bytes: bool = True, **extras) -> bytes | dict
```

```text
await goblin.Goblin.generate_base64(prompt: str, **kwargs) -> str
```

```text
await goblin.Goblin.generate_from_request(request: GenerateRequest) -> bytes | dict
```

```text
await goblin.Goblin.generate_photo(prompt: str, camera: str = 'portrait-85mm', lighting: str = 'natural', **kwargs) -> bytes
```

```text
await goblin.Goblin.generate_anime(prompt: str, style: str = 'anime', expression: str = 'auto', **kwargs) -> bytes
```

```text
await goblin.Goblin.generate_portrait(prompt: str, expression: str = 'neutral', **kwargs) -> bytes
```

```text
await goblin.Goblin.generate_concept_art(prompt: str, **kwargs) -> bytes
```

```text
await goblin.Goblin.generate_cinematic(prompt: str, **kwargs) -> bytes
```

Supports `async with Goblin() as client`. `generate()` returns provider bytes, or metadata when return_bytes=False. `generate_base64()` returns a base64 string. Convenience methods return bytes. See [advanced generation](generation.md).

### `GenerateRequest`

Dataclass fields:

| Field | Type | Default |
|---|---|---|
| `prompt` | `str` | `required` |
| `negative_prompt` | `str` | `''` |
| `model` | `str` | `'goblin-sd'` |
| `shape` | `str` | `'square'` |
| `seed` | `int` | `-1` |
| `guidance_scale` | `Optional[float]` | `None` |
| `style` | `str` | `'default'` |
| `quality` | `str` | `'standard'` |
| `lighting` | `str` | `'auto'` |
| `camera` | `str` | `'auto'` |
| `composition` | `str` | `'auto'` |
| `expression` | `str` | `'auto'` |
| `style_strength` | `float` | `1.0` |
| `remove_background` | `bool` | `False` |
| `reference_image` | `Optional[str]` | `None` |
| `extras` | `dict` | `field(default_factory=dict)` |

### `KeyInvalidError`

Exception raised when an externally supplied generation session is invalid. Managed sessions attempt recovery.

## Session-aware wrapper

### `GoblinWeb`

```text
goblin.GoblinWeb(max_users: int = 500, session_ttl: int = 1800)
```

```text
await goblin.GoblinWeb.start()
```

```text
goblin.GoblinWeb.get_session_config() -> dict
```

```text
await goblin.GoblinWeb.generate(prompt: str, *, user_key: Optional[str] = None, request = None, **kwargs)
```

- `GoblinWeb.stats`: read-only property.

- `GoblinWeb.models`: read-only property.

- `GoblinWeb.available_options`: read-only property.

```text
goblin.GoblinWeb.get_model(model_id: str) -> dict
```

```text
goblin.GoblinWeb.get_model_styles(model_id: str) -> list
```

```text
await goblin.GoblinWeb.close()
```

Session-aware wrapper used by the server. `generate()` forwards documented generation options; `stats` reports active_users, total_sessions, max_users and session_ttl. See [server integration](server.md).

## Server

### `create_app`

```text
goblin.create_app(static_dir: str = None) -> FastAPI
```

Build a FastAPI application. Lifecycle initializes the backend; optional static_dir serves the UI.

### `run_server`

```text
goblin.run_server(host: str = '127.0.0.1', port: int = 8000, static_dir: str = None)
```

Run the application with Uvicorn. Binds to localhost unless host is explicitly changed.

## Model catalog

### `MODELS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `CATEGORIES`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `list_models`

```text
goblin.list_models() -> dict
```

Return {total_models, categories}; each category group contains info and a models list.

### `get_model`

```text
goblin.get_model(model_id: str) -> dict
```

Return model metadata, or None for an unknown ID.

### `get_model_styles`

```text
goblin.get_model_styles(model_id: str) -> list
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_model_params`

```text
goblin.get_model_params(model_id: str) -> list
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_model_defaults`

```text
goblin.get_model_defaults(model_id: str) -> dict
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

## Preset catalogs and prompt composition

### `STYLES`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `QUALITY_PRESETS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `LIGHTING_PRESETS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `CAMERA_PRESETS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `COMPOSITION_PRESETS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `EXPRESSION_PRESETS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `RESOLUTIONS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `AVAILABLE_OPTIONS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `build_prompt`

```text
goblin.build_prompt(base_prompt, style = 'default', quality = 'standard', lighting = 'auto', camera = 'auto', composition = 'auto', expression = 'auto')
```

Return (positive_prompt, negative_prompt) without generating an image.

### `get_style`

```text
goblin.get_style(name)
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_quality`

```text
goblin.get_quality(name)
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_lighting`

```text
goblin.get_lighting(name)
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_camera`

```text
goblin.get_camera(name)
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_composition`

```text
goblin.get_composition(name)
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_expression`

```text
goblin.get_expression(name)
```

Return the requested catalog/preset data. See the models and prompt guide for return shapes and defaults.

### `get_resolution`

```text
goblin.get_resolution(shape)
```

Return the provider resolution string; unknown names fall back to square.

## Local prompt utilities

### `random_prompt`

```text
goblin.random_prompt(category = 'random', style = 'random', include_quality = True, include_lighting = True, include_environment = True)
```

Return prompt, negative_prompt, category and style in a dictionary.

### `random_character_prompt`

```text
goblin.random_character_prompt(gender = 'random', fantasy = True)
```

Return a dictionary with prompt and negative_prompt.

### `random_landscape_prompt`

```text
goblin.random_landscape_prompt(time = 'random', weather = 'random')
```

Return a dictionary with prompt and negative_prompt.

### `random_anime_prompt`

```text
goblin.random_anime_prompt(style = 'random')
```

Return a dictionary with prompt and negative_prompt.

### `create_variations`

```text
goblin.create_variations(prompt, count = 4)
```

Return up to ten prompt strings, starting with the original prompt.

### `list_categories`

```text
goblin.list_categories()
```

Return available names or catalog data without generating an image.

### `list_art_styles`

```text
goblin.list_art_styles()
```

Return available names or catalog data without generating an image.

### `list_environments`

```text
goblin.list_environments()
```

Return available names or catalog data without generating an image.

### `list_model_types`

```text
goblin.list_model_types()
```

Return available names or catalog data without generating an image.

## Local image processing

### `upscale`

```text
goblin.upscale(image_bytes: bytes, target_width: int, target_height: int, model: Union[str, UpscaleModel] = 'lanczos', progress_callback: Optional[Callable[[float, str], None]] = None) -> bytes
```

Select a direct model or classic interpolator. Neural models need an inference backend; output is PNG. Local image-processing entry points accept encoded 8-bit grayscale, RGB or RGBA images. PNG retains resized alpha; JPEG does not retain transparency.

### `upscale_default`

```text
goblin.upscale_default(image_bytes: bytes, target_width: int, target_height: int, preset: str = 'best', progress_callback: Optional[Callable[[float, str], None]] = None) -> bytes
```

Apply a named preset. Pass preset="auto" for automatic speed-oriented selection; the signature retains the explicit default "best".

### `upscale_ultra`

```text
goblin.upscale_ultra(image_bytes: bytes, target_width: int, target_height: int, restore_model: Union[str, UpscaleModel, None] = None, upscale_model: Union[str, UpscaleModel] = 'nomos2-dat2', output_format: str = 'png', progress_callback: Optional[Callable[[float, str], None]] = None) -> bytes
```

Run the optional-restoration/neural pipeline. output_format selects PNG or JPEG.

### `enhance`

```text
goblin.enhance(image_bytes, target_width = None, target_height = None, restore_model = None, upscale_model_2x = 'span-x2', upscale_model_4x = 'span', progress_callback = None)
```

Resize and encode, skipping neural inference when enlargement is unnecessary. Missing inference runtime uses classic resizing.

### `UpscaleStrategy`

Compatibility alias for UpscaleModel.

### `UpscaleModel`

String enum for direct upscaling model names. Curated IDs are `span-x2`, `span`, `nomos2-mosr`, `nomos2-dat2` and `realplksr-x2`; other values are legacy compatibility options.

| Member | Value |
|---|---|
| `LANCZOS` | `lanczos` |
| `BICUBIC` | `bicubic` |
| `REALESRGAN_X2PLUS` | `realesrgan-x2plus` |
| `REALESRGAN_X4V3` | `realesrgan-x4v3` |
| `REALESRGAN_X4PLUS` | `realesrgan-x4plus` |
| `REALESRGAN_ANIME` | `realesrgan-anime` |
| `REMACRI` | `remacri` |
| `ULTRASHARP` | `ultrasharp` |
| `ULTRAMIX` | `ultramix` |
| `SWINIR` | `swinir` |
| `NOMOS2_MOSR` | `nomos2-mosr` |
| `NOMOS2_DAT2` | `nomos2-dat2` |
| `RESTORE_1X` | `restore-1x` |
| `REALCUGAN` | `realcugan` |
| `ANIMESHARP` | `animesharp` |
| `QUICKSR_SMALL` | `quicksr-small` |
| `QUICKSR_MEDIUM` | `quicksr-medium` |
| `QUICKSR_LARGE` | `quicksr-large` |
| `ABPN` | `abpn` |
| `NAFNET` | `nafnet` |
| `SCUNET` | `scunet` |
| `RESTORE_FAST` | `restore-fast` |
| `NMKD_SIAX` | `nmkd-siax` |
| `NMKD_SUPERSCALE` | `nmkd-superscale` |
| `SPAN` | `span` |
| `SPAN_X2` | `span-x2` |
| `REALPLKSR_X2` | `realplksr-x2` |
| `WAIFU2X_CUNET` | `waifu2x-cunet` |
| `DAT2` | `dat2` |
| `HAT_S` | `hat-s` |
| `HAT_L` | `hat-l` |

### `calculate_base_resolution`

```text
goblin.calculate_base_resolution(target_width: int, target_height: int) -> tuple[str, int, int, float]
```

Return (shape_name, base_width, base_height, scale_factor).

### `get_best_shape_for_aspect`

```text
goblin.get_best_shape_for_aspect(target_width: int, target_height: int) -> str
```

Return the matching generation shape name.

### `validate_dimensions`

```text
goblin.validate_dimensions(width: int, height: int) -> tuple[int, int]
```

Return the width/height tuple, or raise ValueError outside 64–4096.

### `needs_upscale`

```text
goblin.needs_upscale(current_width: int, current_height: int, target_width: int, target_height: int, threshold: float = 1.1) -> bool
```

Return whether either dimension exceeds the configured scale threshold.

### `MIN_DIMENSION`

Dimension limit: 64 pixels.

### `MAX_DIMENSION`

Dimension limit: 4096 pixels.

### `SHAPE_RESOLUTIONS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

### `list_upscale_models`

```text
goblin.list_upscale_models() -> list[dict]
```

Return local-processing model metadata and download status. Curated and legacy options are distinguished in the guide.

### `download_model`

```text
goblin.download_model(model: Union[str, UpscaleModel], progress_callback: Optional[Callable[[float, str], None]] = None) -> Optional[str]
```

Prefetch a model. Returns a cache path for neural models and None for classic interpolation.

### `delete_model`

```text
goblin.delete_model(model: Union[str, UpscaleModel]) -> bool
```

Delete this model from the local cache and unload its cached session. Returns whether a file was deleted.

### `get_downloaded_models`

```text
goblin.get_downloaded_models() -> list[str]
```

Return cached model IDs as a list of strings.

### `set_device`

```text
goblin.set_device(device: str)
```

Select auto, cpu or gpu; clears cached inference sessions.

### `get_device`

```text
goblin.get_device() -> str
```

Return the selected preference, rather than the actual execution provider.

### `is_gpu_available`

```text
goblin.is_gpu_available() -> bool
```

Return whether the installed runtime advertises an accelerated provider; this does not prove actual inference initialization.

### `get_device_info`

```text
goblin.get_device_info() -> dict
```

Return provider, provider_id, gpu_available, ram_gb, tile_size, recommended_preset and all_providers.

### `UPSCALE_PRESETS`

Read-only catalog data; inspect keys in your installed version. See the corresponding guide for examples.

## Public submodule utilities

These convenience functions are also available from their named submodules:

```text
goblin.models.get_negative_prompt(category: str) -> str
```

```text
goblin.models.get_quality_boost(style: str) -> str
```

```text
goblin.models.get_all_params() -> dict
```

```text
goblin.parameters.list_styles()
```

```text
goblin.parameters.list_quality_presets()
```

```text
goblin.parameters.list_lighting()
```

```text
goblin.parameters.list_cameras()
```

```text
goblin.parameters.list_compositions()
```

```text
goblin.parameters.list_expressions()
```

```text
goblin.parameters.list_resolutions()
```

```text
goblin.auto_map.auto_map_top(prompt: str, n: int = 10) -> list[AutoMapResult]
```

```text
goblin.upscaler.get_recommended_preset(quality = None)
```

```text
goblin.upscaler.get_execution_provider() -> list
```

```text
goblin.upscaler.resolve_model(name: str) -> UpscaleModel
```

[Documentation index](index.md) · [Generation](generation.md) · [Models and prompts](models-and-prompts.md) · [Upscaling](upscaling.md) · [Server](server.md)
