# Troubleshooting and migration

| Symptom | Check/action |
|---|---|
| No matching wheel or native module import failure | Check CPython version, OS and architecture. Use the matching 2.1.1 wheel; do not copy native modules between Python versions. |
| First use takes longer | First-use runtime setup and downloads can add latency. Prefetch browser data with `python -m camoufox fetch`. |
| Generation fails | Confirm network access and upstream availability, then retry in a clean application lifecycle. Use `Goblin(verbose=True)` for SDK diagnostics. |
| Server says initializing | Poll `/health`; generation returns 503 until initialization succeeds. |
| Server initialization failed | `/health` reports `failed=true`; address setup/network failures and restart the server. |
| CPU extra unavailable on Intel macOS/Python 3.14 | Use CPython 3.13 for neural upscaling, or use the base install with `fast`/`off`. |
| Missing `onnxruntime` | Install the CPU or GPU extra in the same environment, or select `fast`/`off`. |
| GPU requested but unavailable | Verify the correct runtime, NVIDIA driver and actual model inference. Use `auto` or `cpu` if acceleration is unavailable. |
| Model download failure | Retry the download; failed downloads do not replace an existing cached file. |
| Unsupported image depth | Convert 16-bit or floating-point images to 8-bit grayscale, RGB or RGBA before local processing. |
| Large neural request rejected | Use a smaller input, SPAN 2×, or a non-AI preset. Final dimensions are limited to 4096 per axis. |
| Image saved with the wrong extension | Enhanced/upscaled output is normally PNG; original provider bytes can use another format. Inspect the response media type or encode explicitly. |
| HTTP 429 | Respect `Retry-After`, reduce concurrency and retry with backoff. |
| Shutdown/loop reuse errors | Keep a generator in one async lifecycle, use its context manager, and close it before ending the event loop. |

## Changes from earlier releases

- Wheels now identify their CPython ABI, OS and architecture. The older universal-wheel metadata could install on unsupported interpreters.
- The module version and package metadata agree.
- The base install no longer needs ONNX merely to finish default generation and PNG enhancement.
- Automatic upscaling favors SPAN. Quality presets use the curated MoSR, DAT2 and RealPLKSR options; automatic restoration was removed.
- CPU compatibility extras no longer install the old PyTorch/BasicSR stack. The GPU extra selects ONNX Runtime's CUDA package.
- The CLI, server helper and UI bind to localhost by default. Pass `--host 0.0.0.0` explicitly for a container or other network deployment.
- The bundled UI uses managed initialization. Existing custom clients should follow the current HTTP schema and readiness checks.
- API request validation, readiness, rate limits and processing limits are explicit. Prompt variations accept counts 1–10.

When reporting an issue, include the Goblin version, CPython version, OS/architecture, install extra, operation, and a minimal harmless example. Include the HTTP status or exception type. Keep session keys and cache contents out of public issue reports.

[Issue tracker](https://github.com/Itachi-1824/goblin-ai/issues) · [Documentation index](index.md)
