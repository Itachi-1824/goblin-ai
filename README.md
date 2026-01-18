# Goblin

Free AI Image Generation with 34 Models. No API key. No limits. Just vibes.

## Installation

```bash
pip install goblin-ai
```

## Quick Start

### Python API

```python
import asyncio
from goblin import Goblin

async def main():
    async with Goblin() as g:
        # Generate an image
        image_bytes = await g.generate("a beautiful sunset over mountains")

        # Save it
        with open("sunset.jpg", "wb") as f:
            f.write(image_bytes)

        # Use different models
        anime_img = await g.generate("cute anime girl", model="goblin-anime")
        realistic_img = await g.generate("professional headshot", model="goblin-portrait")

        # With style parameters
        cinematic = await g.generate(
            "epic dragon battle",
            model="goblin-fantasy",
            style="cinematic",
            quality="ultra",
            lighting="dramatic"
        )

asyncio.run(main())
```

### Run as Server

```bash
# Command line
goblin --port 8000

# Or in Python
from goblin import run_server
run_server(port=8000)
```

### API Endpoints

- `GET /health` - Health check
- `GET /models` - List all 34 models
- `GET /options` - All available style/lighting/camera options
- `POST /generate` - Generate image (returns JPEG)
- `POST /generate/base64` - Generate image (returns base64 JSON)

## Available Models (34 Total)

### General Purpose
- `goblin-sd` - Flagship Stable Diffusion
- `goblin-sd-v2` - SD V2 improved
- `goblin-pro` - Professional grade

### Flux Models (12B)
- `goblin-flux` - Flux.1 Schnell
- `goblin-flux-dev` - Development
- `goblin-flux-pro` - Enhanced
- `goblin-laia` - LAIA model
- `goblin-laia-pro` - LAIA Pro

### Anime
- `goblin-anime` - Classic anime
- `goblin-anime-xl` - Advanced
- `goblin-anime-v2` - V2 improved
- `goblin-anime-character` - Character focused

### Realistic
- `goblin-realistic` - Photorealistic
- `goblin-photo` - Camera quality
- `goblin-portrait` - Portraits
- `goblin-portrait-v2` - Portraits V2
- `goblin-portrait-hd` - HD portraits
- `goblin-human` - Full body
- `goblin-portrait-pro` - Professional

### Art Styles
- `goblin-digital` - Digital art
- `goblin-concept` - Concept art
- `goblin-fantasy` - Fantasy
- `goblin-cyberpunk` - Cyberpunk
- `goblin-pixel` - Pixel art
- `goblin-oil` - Oil painting
- `goblin-creative` - Creative AI
- `goblin-character` - Character design

### NSFW (18+)
- `goblin-uncensored` - Realistic
- `goblin-uncensored-v2` - V2
- `goblin-uncensored-v3` - V3
- `goblin-anime-uncensored` - Anime

### Furry
- `goblin-furry` - Furry art
- `goblin-furry-v2` - V2
- `goblin-fursona` - Fursona creator

## Parameters

```python
await g.generate(
    prompt="your prompt",
    model="goblin-sd",           # 34 models available
    style="cinematic",           # 21 style presets
    quality="ultra",             # standard, high, ultra, maximum
    lighting="golden-hour",      # 11 lighting presets
    camera="portrait-85mm",      # 8 camera presets
    composition="closeup",       # 9 composition options
    expression="happy",          # 10 expression presets
    shape="portrait",            # square, portrait, landscape
    seed=-1,                     # -1 for random
    guidance_scale=7.0,          # 1-30
)
```

## License

MIT
