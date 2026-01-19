# Goblin AI

Unlimited free AI image generation. No sign-up required.

## Installation

```bash
pip install goblin-ai
```

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
