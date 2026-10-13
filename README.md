<div align="center">

# 🎨 Goblin AI

### Image generation from Python or a local browser interface

[![PyPI version](https://img.shields.io/pypi/v/goblin-ai?color=blue&label=PyPI)](https://pypi.org/project/goblin-ai/)
[![Python](https://img.shields.io/pypi/pyversions/goblin-ai?color=green)](https://pypi.org/project/goblin-ai/)
[![Downloads](https://img.shields.io/pypi/dm/goblin-ai?color=orange)](https://pypi.org/project/goblin-ai/)
[![License](https://img.shields.io/badge/license-Proprietary-red)](https://github.com/Itachi-1824/goblin-ai/blob/main/LICENSE)

<br>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=9B59B6&center=true&vCenter=true&width=500&lines=Generate+anything...;Anime+%F0%9F%8C%B8;Portraits+%F0%9F%93%B7;Fantasy+%F0%9F%90%89;Cyberpunk+%F0%9F%8C%83;Pixel+Art+%F0%9F%8E%AE" alt="Goblin image styles" />

<br>

[**Install**](#install) · [**Generate**](#generate) · [**Server and UI**](#server-and-ui)

</div>

---

Generate AI images from Python or a local browser interface, with optional CPU/GPU upscaling. No account or personal API key is needed for ordinary use. First use performs setup; later calls reuse a managed session.

**[Read the documentation](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/index.md)** · [Complete Python API](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/api-reference.md) · [HTTP API](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/server.md) · [Troubleshooting](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/troubleshooting.md)

## Install

Use **CPython 3.11–3.14** with a wheel matching your OS and architecture. Release targets are Windows/Linux x86-64 and macOS Intel/Apple Silicon. PyPy and other Python ABIs are unsupported.

```sh
pip install goblin-ai
```

The base install includes generation, prompt tools, PNG enhancement, interpolation, CLI, UI and HTTP API. Install one AI inference backend for neural upscaling:

```sh
pip install "goblin-ai[cpu]"
# Or, in a separate environment for NVIDIA CUDA:
pip install "goblin-ai[gpu]"
```

On Intel macOS with CPython 3.14, the base install works, but the CPU neural extra has no compatible ONNX Runtime wheel. Use CPython 3.13 for neural upscaling on Intel macOS, or use another supported platform.

Choose CPU or GPU, rather than installing both runtimes in the same environment. The `quality`, `best` and `all` extras remain CPU aliases; they no longer install the old PyTorch/BasicSR stack. Models download on their first explicit use and are cached in the user's cache directory. `GOBLIN_MODEL_DIR` can select another writable cache directory.

See [installation and first image](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/getting-started.md) for environment setup and device verification.

## Generate

```python
import asyncio
from goblin import generate, close

async def main():
    try:
        image = await generate("a red ceramic teapot", model="goblin-flux", output="teapot.png")
        print(f"Saved {len(image)} bytes")
    finally:
        await close()

asyncio.run(main())
```

`generate()` returns image bytes. Use `enhance_output=False` to keep the provider's original bytes. Model aliases include `goblin-flux`, `goblin-anime`, `goblin-realistic` and `goblin-sd`; use `list_models()` for the catalog.

Default enhanced output is PNG at 768×768. Local processing accepts 8-bit grayscale, RGB and RGBA images; PNG output preserves transparency, resizing alpha to match the output dimensions. Set `width` and `height` for another size. First-use setup, remote queueing and image generation take additional time; session reuse avoids repeating setup.

## What you can do

| Feature | Entry points | Guide |
|---|---|---|
| Simple/batch generation | `generate`, `generate_batch` | [Generation](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/generation.md) |
| Explicit lifecycle and metadata | `Goblin`, `GenerateRequest` | [Advanced generation](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/generation.md#advanced-lifecycle) |
| Automatic model selection | `auto_map`, `detect_model` | [Models and prompts](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/models-and-prompts.md) |
| Catalog discovery and presets | `list_models`, `get_model_*`, preset dictionaries | [Models and prompts](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/models-and-prompts.md) |
| Local prompt tools | `random_prompt`, `create_variations`, `build_prompt` | [Prompt tools](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/models-and-prompts.md#prompt-utilities) |
| Resize/neural upscaling | `enhance`, `upscale`, `upscale_default`, `upscale_ultra` | [Upscaling](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/upscaling.md) |
| Device/cache management | `set_device`, `get_device_info`, `download_model` | [Upscaling](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/upscaling.md#device-selection-and-caching) |
| CLI, UI and REST API | `goblin server`, `goblin ui`, `create_app` | [Server](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/server.md) |

The [API reference](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/api-reference.md) documents every public export, constructor and class method, including argument defaults and return behavior.

## Upscaling

`upscale_default(image_bytes, width, height, preset="auto")` selects a practical preset. `fast` uses interpolation without a neural model; `balanced` uses compact SPAN, `quality` uses MoSR, `photo` uses 2× RealPLKSR, and `best` uses DAT2. Neural models require a CPU or GPU extra. No single preset is best for every image; see [model attribution](https://github.com/Itachi-1824/goblin-ai/blob/main/MODEL_LICENSES.md) for model origins and attribution.

```python
from pathlib import Path
from goblin import upscale_default

image = Path("teapot.png").read_bytes()
larger = upscale_default(image, 1536, 1536, preset="auto")
Path("teapot-large.png").write_bytes(larger)
```

Automatic processing prioritizes speed. Restoration is opt-in. See the [upscaling guide](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/upscaling.md) for measured timings, direct models, progress callbacks, CPU/GPU selection and cache management.

## Server and UI

```sh
goblin server --port 8000
goblin ui --port 8000
goblin --port 8000
```

The legacy flag-only CLI remains supported. The server binds to localhost by default. `/health` reports initialization and readiness; generation returns HTTP 503 while initialization is incomplete, has failed, or the managed session is unavailable. Generation and upscaling requests have resource and per-client request limits. Use an authenticated reverse proxy when exposing the service publicly.

```sh
curl -X POST http://127.0.0.1:8000/generate -H "Content-Type: application/json" -d '{"prompt":"a red ceramic teapot","model":"goblin-flux","width":768,"height":768,"upscale_preset":"fast"}' --output teapot.png
```

Use `curl.exe` in Windows PowerShell when `curl` is an alias. `/docs` provides an interactive HTTP reference; see [all endpoints and request/response examples](https://github.com/Itachi-1824/goblin-ai/blob/main/docs/server.md).

## Distribution and support

Releases distribute platform-specific compiled wheels, with no source distribution. Compiled modules cannot make reverse engineering impossible.

Generation depends on an upstream service. Setup, queueing and network latency can vary, and upstream changes can affect availability.

Report a minimal example with Goblin/Python versions, OS and chosen extra in the [issue tracker](https://github.com/Itachi-1824/goblin-ai/issues). Keep credentials and session cache contents out of public reports. Goblin uses a [proprietary license](https://github.com/Itachi-1824/goblin-ai/blob/main/LICENSE); downloaded models retain their [separate author licenses](https://github.com/Itachi-1824/goblin-ai/blob/main/MODEL_LICENSES.md).
