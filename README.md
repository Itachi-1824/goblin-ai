# Goblin AI

Unlimited free AI image generation. No sign-up required.

## Installation

```bash
pip install goblin-ai
```

## Why Are The Binaries Compiled?

This package is distributed as compiled binaries (`.pyd`/`.so`) instead of plain Python source code. Here's why:

**Protecting the Free Service**

Goblin wraps a free image generation API that has rate limits (1 image at a time per user). If the source code were public, bad actors could:
- Bypass rate limits and overload the service
- Run concurrent requests that would get everyone blocked
- Abuse the API and potentially get it shut down

By compiling the code, we ensure fair usage for everyone while keeping the service free and available.

**This Is NOT Malware**

We understand compiled code can seem suspicious. Here's what Goblin does and doesn't do:

| What Goblin Does | What Goblin Does NOT Do |
|------------------|------------------------|
| Generates images via public API | Access your files |
| Downloads AI models for upscaling | Send personal data anywhere |
| Caches API keys for faster generation | Install anything outside its folder |
| Run entirely offline after setup | Require any accounts or signups |

**Open Source Commitment**

While the core is compiled, everything else is transparent:
- The API (`__init__.py`) is readable Python
- All dependencies are standard PyPI packages
- The build process uses [Nuitka](https://nuitka.net/) (legitimate Python compiler)

If you're still concerned, run it in a sandbox or VM first.

## Quick Start

```python
import asyncio
from goblin import generate

async def main():
    # One-liner generation - model auto-selected based on prompt
    await generate("a cute anime girl", output="anime.png")

    # Realistic portrait - auto-detects from keywords
    await generate("professional headshot, studio lighting", output="portrait.png")

    # Specify model explicitly
    await generate("epic dragon", model="goblin-fantasy", output="dragon.png")

asyncio.run(main())
```

## Simple API

```python
from goblin import generate, detect_model

# Auto model selection
model = detect_model("1girl anime")  # Returns "goblin-anime"

# Generate with full control
image = await generate(
    prompt="beautiful sunset",
    model="goblin-landscape",
    quality="ultra",
    width=1024,
    height=768
)
```

## Advanced Usage

```python
from goblin import Goblin

async with Goblin() as g:
    # Full parameter control
    image = await g.generate(
        prompt="cyberpunk city",
        model="goblin-cyberpunk",
        style="neon",
        quality="ultra",
        lighting="dramatic",
        guidance_scale=7.0
    )
```

## Run as Server

```bash
goblin --port 8000
```

## Model Categories

### General Purpose
- `goblin-sd` - Versatile all-rounder
- `goblin-pro` - Professional grade

### Advanced Models
- `goblin-flux` - Best text rendering
- `goblin-flux-pro` - Enhanced quality
- `goblin-sdxl` - High resolution

### Anime & Manga
- `goblin-anime` - Classic anime style
- `goblin-anime-xl` - Advanced anime
- `goblin-chibi` - Kawaii/chibi style

### Photography
- `goblin-realistic` - Photorealistic
- `goblin-portrait` - Portrait photos
- `goblin-portrait-hd` - HD portraits
- `goblin-photo` - Camera quality

### Art Styles
- `goblin-digital` - Digital art
- `goblin-concept` - Concept art
- `goblin-fantasy` - Fantasy scenes
- `goblin-cyberpunk` - Cyberpunk aesthetic
- `goblin-pixel` - Pixel art
- `goblin-oil` - Oil painting style

### Landscapes
- `goblin-landscape` - Nature scenes
- `goblin-background` - Wallpapers

### Game Assets
- `goblin-icon` - App/game icons
- `goblin-sprite` - 2D sprites
- `goblin-pokemon` - Creature design

### Character
- `goblin-character` - Character design
- `goblin-furry` - Furry art

### Adult (18+)
- `goblin-uncensored` - Realistic
- `goblin-anime-uncensored` - Anime style

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `prompt` | What to generate | Required |
| `model` | Model ID | Auto-detected |
| `quality` | standard/high/ultra/maximum | ultra |
| `style` | Style preset | default |
| `lighting` | Lighting preset | auto |
| `width` | Image width | 768 |
| `height` | Image height | 768 |
| `seed` | Random seed (-1 for random) | -1 |
| `guidance_scale` | Prompt adherence (1-30) | Model default |

## License

Proprietary - Personal use only

© 2026 Goblin Team
