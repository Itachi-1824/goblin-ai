# Python image generation

## Simple SDK

`await generate(prompt, ...)` shares one managed generator. Omit `model` for prompt-based model selection, or select an ID from `list_models()` explicitly. Keep calls within one asynchronous application lifecycle and call `await close()` when finished.

| Option | Behavior |
|---|---|
| `prompt` | Nonblank text, up to 4000 characters |
| `model=None` | Automatically selects a catalog model from the prompt |
| `negative_prompt=""` | Additional things to avoid |
| `width=768`, `height=768` | Exact final dimensions, each 64–4096 |
| `seed=-1` | Provider-selected seed; use an integer for a requested seed |
| `guidance_scale=None` | Model default; explicit values 1–30 |
| `quality="ultra"` | Prompt quality preset |
| `output=None` | Optional destination path; returns bytes even when saving |
| `enhance_output=True` | Resize/encode to PNG; use AI only when enlarging and available |
| `upscale_output=False` | Explicit neural pipeline instead of ordinary enhancement |
| `upscale_model="span"` | Model for explicit neural processing |
| `restore_model=None` | Opt-in restoration; see the upscaling guide |

Generate a batch:

```python
import asyncio
from pathlib import Path
from goblin import generate_batch, close

async def main():
    try:
        images = await generate_batch(
            ["a blue ceramic cup", "a watercolor forest", "a small orange robot"],
            model="goblin-flux",
        )
        for index, image in enumerate(images):
            Path(f"image-{index}.png").write_bytes(image)
    finally:
        await close()

asyncio.run(main())
```

Results preserve input order. A failure raises an exception rather than returning a partially successful result list. Concurrent calls share the provider session's generation slot; concurrency does not guarantee simultaneous upstream generation.

## Advanced lifecycle

`Goblin` provides explicit ownership, native generation shapes, metadata, convenience methods and reference-image arguments. Its `generate()` returns original provider bytes unless `return_bytes=False`. Unlike the simple SDK, it does not automatically resize or enhance the result.

```python
import asyncio
from pathlib import Path
from goblin import Goblin, GenerateRequest, enhance

async def main():
    request = GenerateRequest(
        prompt="a mountain cabin at sunrise",
        model="goblin-realistic",
        shape="landscape",
        quality="high",
        lighting="golden-hour",
        seed=42,
    )
    async with Goblin() as client:
        image = await client.generate_from_request(request)
        Path("cabin.png").write_bytes(enhance(image))
        metadata = await client.generate("a ceramic cup", model="goblin-flux", return_bytes=False)
        print(metadata["image_id"], metadata["seed"])

asyncio.run(main())
```

The metadata call creates another image. `generate_base64()` also creates an image and returns a base64 string, without a data-URL prefix.

Convenience methods include `generate_photo`, `generate_anime`, `generate_portrait`, `generate_concept_art` and `generate_cinematic`. They select a model/style combination; pass `model=` to override the model. `start()` initializes the session, while `close()` cancels background work and releases connections. The asynchronous context manager handles both.

Use `reference_image` with an appropriate model for an image-to-image request. It accepts a base64 data URL or an image URL; provider/model support varies. `remove_background=True` requests background removal, with provider-dependent results. A fixed seed is a request to the provider, not a cross-model reproducibility guarantee.

`style_strength` and arbitrary `extras` remain compatibility fields; they do not currently act as independent generation controls. Use the documented style, quality, lighting, camera, composition and expression presets. Inspect `get_model_params()` and `get_model_styles()` before selecting a model-specific option.

`GoblinWeb` is the server's session-aware wrapper. Ordinary SDK usage does not require setting web mode or supplying a key. Credential arguments remain available for compatibility; read credentials from environment variables when your integration requires them.

[Models and prompts](models-and-prompts.md) · [Full signatures](api-reference.md) · [Upscaling](upscaling.md)
