# Goblin documentation

These guides describe Goblin AI 2.1.2. The implementation is compiled; the examples, API reference and HTTP schema explain the supported interface without requiring implementation source.

| Start here | What you will learn |
|---|---|
| [Installation and first image](getting-started.md) | Python support, virtual environments, CPU/GPU extras, first-use setup |
| [Python generation guide](generation.md) | Simple SDK, batches, model selection, advanced requests, image formats and cleanup |
| [Models, presets and prompt tools](models-and-prompts.md) | Discover the catalog, build prompts and create variations locally |
| [Upscaling guide](upscaling.md) | Choose speed/quality presets, configure inference, cache models and process images |
| [CLI, UI and HTTP server](server.md) | Start the server, call endpoints, handle readiness and limits |
| [Complete Python API reference](api-reference.md) | Every package export, public class method and constructor |
| [HTTP schema](openapi.json) | Machine-readable request fields, query parameters and response schemas |
| [Troubleshooting and migration](troubleshooting.md) | Installation, generation, inference and changes from older releases |

For an interactive HTTP reference, start `goblin server` and open `http://127.0.0.1:8000/docs`. The browser interface is available through `goblin ui`.

Generation is remote; prompt utilities and upscaling run locally. First-use runtime setup, model downloads, inference initialization and remote generation add latency. Reusing cached resources avoids repeated setup, but generation and neural processing still take time.

[README](../README.md) · [Model attribution](../MODEL_LICENSES.md) · [Issue tracker](https://github.com/Itachi-1824/goblin-ai/issues)
