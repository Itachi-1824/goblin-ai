# Installation and first image

Use **CPython 3.11–3.14** with a wheel matching your Python version, operating system and architecture. Goblin's native modules do not run on PyPy or another Python ABI. Supported release targets are Windows x86-64, Linux x86-64, macOS Intel and macOS Apple Silicon.

Create an isolated environment:

```sh
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install goblin-ai
```

The base install provides generation, prompt tools, the HTTP server/UI, PNG output and interpolation. It does **not** install a neural inference backend.

| Install | Use |
|---|---|
| `pip install goblin-ai` | Generation and fast resizing |
| `pip install "goblin-ai[cpu]"` | Neural upscaling on CPU |
| `pip install "goblin-ai[gpu]"` | NVIDIA CUDA neural upscaling |
| `quality`, `best`, `all` extras | Compatibility aliases for the CPU backend |

On Intel macOS with CPython 3.14, the base install works, but the CPU neural extra has no compatible ONNX Runtime wheel. Use CPython 3.13 for neural upscaling on Intel macOS, or use another supported platform.

Choose CPU or GPU in a separate environment. Both packages provide the same `onnxruntime` module; installing both can create an ambiguous backend. The GPU extra includes runtime dependencies, but an appropriate NVIDIA driver is also required. Verify actual selection with `get_device_info()` and an inference run; advertised providers alone do not prove a working driver.

Save your first image:

```python
import asyncio
from goblin import generate, close

async def main():
    try:
        image = await generate(
            "a red ceramic teapot on a wooden table, soft daylight",
            model="goblin-flux",
            output="teapot.png",
        )
        print(f"Saved {len(image)} bytes")
    finally:
        await close()

asyncio.run(main())
```

`generate()` is asynchronous and returns bytes. The default enhancement outputs PNG at the requested size. Set `enhance_output=False` for the original provider bytes; select the file extension according to the returned format rather than assuming all outputs are JPEG.

First use may need additional runtime setup and downloads. Later calls reuse the managed session. If required browser runtime files are missing, install them in advance:

```sh
python -m camoufox fetch
```

Run this in the same environment as Goblin. Linux installations may also require the browser's system libraries; follow [Camoufox's installation instructions](https://camoufox.com/python/installation/).

Check the installed version and available local processing:

```python
import goblin
from importlib.metadata import version

print(goblin.__version__, version("goblin-ai"))
print(goblin.get_device_info())
```

[Next: generation](generation.md) · [Troubleshooting](troubleshooting.md)
