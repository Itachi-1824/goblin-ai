# Upscaling and enhancement

Goblin accepts encoded PNG, JPEG, WebP, BMP, GIF and TIFF images with 8-bit grayscale, RGB or RGBA pixels, and returns encoded image bytes. Input limits are 32 MiB encoded and 16 Mi pixels. Grayscale inputs are processed as RGB. PNG output preserves RGBA transparency: alpha is resized to the final dimensions separately from neural color processing. JPEG output does not retain alpha. Convert 16-bit or floating-point images to 8-bit before processing. Output dimensions range from 64 to 4096 pixels per axis. Large neural intermediates are bounded; use a smaller input or a lower-scale model if a request exceeds the processing limit.

## Choose a preset

| Preset | Processing | Backend |
|---|---|---|
| `auto` | Fast interpolation without an inference backend; SPAN when a backend is installed | Optional |
| `off` | Resize only | Base install |
| `fast` | Lanczos interpolation | Base install |
| `balanced` | SPAN; selects 2× when sufficient, otherwise 4× | CPU/GPU extra |
| `quality`, `sharp` | MoSR 4× | CPU/GPU extra |
| `photo` | RealPLKSR 2× | CPU/GPU extra |
| `best`, `ultra` | DAT2 4×, substantially slower | CPU/GPU extra |
| `anime` | SPAN for illustration | CPU/GPU extra |

Automatic selection favors speed. Generation quality `low` selects resize-only processing; `maximum` can select DAT2 on an accelerated backend. The `best` name is a compatibility preset, not a promise that one model wins on every image. No preset automatically adds restoration. The `anime` preset does not claim a specialized anime model.

```python
from pathlib import Path
from goblin import upscale_default

original = Path("teapot.png").read_bytes()
result = upscale_default(original, 1536, 1536, preset="auto")
Path("teapot-large.png").write_bytes(result)
```

## Direct models and progress

The curated models are `span-x2`, `span`, `nomos2-mosr`, `nomos2-dat2` and `realplksr-x2`. Classic `lanczos` and `bicubic` need no neural backend. Older model names remain compatibility options; the measured comparisons below cover the curated models.

```python
from pathlib import Path
from goblin import upscale, download_model, get_downloaded_models, list_upscale_models

def progress(percent, message):
    print(f"{percent:.0f}% {message}")

print(list_upscale_models())
download_model("span-x2", progress_callback=progress)
print(get_downloaded_models())
result = upscale(Path("teapot.png").read_bytes(), 1536, 1536,
                 model="span-x2", progress_callback=progress)
Path("teapot-span.png").write_bytes(result)
```

Processing and model downloads are synchronous. In an async application, use `await asyncio.to_thread(upscale_default, data, width, height, preset="balanced")`. The simple SDK and HTTP server already offload local processing.

`enhance(data, ...)` produces PNG, preserves an image without neural inference when it does not need enlargement, and uses fast resizing when no backend is installed. `upscale_ultra()` offers an explicit restoration/upscale pipeline and PNG or JPEG encoding; restoration is opt-in and legacy restoration weights should be evaluated separately before production use. Output dimensions are exact even if the neural model's native scale differs from the requested scale.

## Device selection and caching

```python
from goblin import get_device_info, set_device, get_device, is_gpu_available

set_device("cpu")  # "auto" or "gpu" are also accepted
print(get_device())
print(is_gpu_available())
print(get_device_info())
```

`gpu` requires an accelerated provider and raises if inference falls back to CPU. `auto` can fall back to CPU when accelerator initialization fails. Provider availability alone is not proof that inference will run on the GPU; initialize a model and verify actual execution when deploying.

Models download on first use and are cached outside the installed package, so read-only installations work. Set `GOBLIN_MODEL_DIR` before importing Goblin to choose a writable location. `download_model()` prefetches a model; `delete_model()` deletes its cached file and returns whether a file was removed. First download and session initialization are additional to warm processing times.

Measured on an **RTX 5070 Laptop GPU**, warmed 512×512→1024×1024 end-to-end processing, including image conversion, inference, final resizing and PNG encoding, took **0.173 s SPAN 2×**, **0.214 s SPAN 4×**, **0.745 s MoSR**, and **5.337 s DAT2**. Downloads and first-use initialization are excluded. These measurements compare these models on this workload and hardware; they are not guaranteed timings or universal quality rankings. Compare output on your own images before choosing a preset.

See [model origins, licenses and benchmark scope](../MODEL_LICENSES.md). Weights retain their authors' separate licenses; Goblin's proprietary license does not replace them.

[API reference](api-reference.md) · [Troubleshooting](troubleshooting.md)
