# CLI, UI and HTTP API

Goblin includes an optional local FastAPI server for the bundled browser UI and applications written in other languages. Python SDK calls can be used directly.

## Start the server

```sh
goblin server --port 8000
goblin ui --port 8000
python -m goblin --port 8000
```

`ui` serves the bundled interface and opens your browser. `--no-browser` suppresses opening it. `--static PATH` selects a directory containing `index.html`. `--host` chooses the address; the default is **127.0.0.1**. The legacy flag-only command still starts the server. Use `--help` or `--version` for CLI information.

For a container, explicitly pass `--host 0.0.0.0`. Use an authenticated reverse proxy before network exposure. Goblin does not provide account authentication. Concurrent callers share the managed provider session's generation slot.

## Use the browser UI

Enter a prompt and choose a canvas shape, then generate when the server reports Online. **Auto** is the default image model: it uses Goblin's local prompt mapping to choose a matching catalog model, and displays the recommendation below the picker. Open the image-model menu to search by name or category and choose a model manually. Filtering never changes the current selection. Auto routes the model; your canvas, negative prompt and other explicit settings remain yours.

Enable **Custom size** to set width and height from 64 to 4096 pixels. The preview canvas changes immediately as you edit valid dimensions; the size shown describes the next output. **Custom-size processing** appears directly beside the dimensions and chooses how the generated image reaches that size. You can edit settings while an image is generating; changes apply to the next image. After generation, choose an upscaling preset and use **Upscale 2×** to enlarge the result within the 4096-pixel limit.

Neural presets remain selectable before their weights are cached. Choosing one opens a setup dialog showing the required models and download sizes. Confirm **Download models** to prepare those weights once; presets sharing them reuse the cache. If a neural backend is missing, copy either `python -m pip install "goblin-ai[cpu]"` or `python -m pip install "goblin-ai[gpu]"`, run it in Goblin's environment, then restart Goblin and reload the page. Choose one backend; CUDA also needs a suitable NVIDIA driver. **Use fast resize** continues without a neural backend or model download. Closing setup restores the previous selection.

Open a gallery thumbnail to browse with the previous/next buttons, left/right arrow keys, mouse wheel over the image, or a horizontal touch swipe. Navigation stops at the first and last image. The gallery belongs to this browser page session and keeps at most 24 results, dropping older images when their combined base64 data exceeds 64 MiB. Refreshing or **Clear gallery** clears it. Download images you want to keep; the gallery is not saved to disk.

**Stop waiting** cancels the browser's wait and preserves the previous image. It does not guarantee that server generation, upscaling or a model download stops. Closing model setup during a download has the same limitation; completed weights may remain cached for later use.

## Embed the application

Embed the application:

```python
from goblin import create_app

app = create_app()
```

Save as `app.py` and run `uvicorn app:app --host 127.0.0.1 --port 8000`. Alternatively, call `run_server(host="127.0.0.1", port=8000)` for a blocking embedded server. Application lifespan owns initialization and shutdown; each app owns its backend.

## Readiness and errors

`GET /health` is available while initialization runs. Check `ready`, `initializing` and `failed`; the catalog count varies by version. Generation returns 503 until readiness succeeds. After startup, an unavailable managed session reports `status="degraded"` and `ready=false` while recovery retries. `failed` indicates failed initialization. If initialization fails, address setup/network problems and restart the server.

```json
{"status":"ok","models_loaded":50,"ready":true,"initializing":false,"failed":false}
```

| HTTP status | Meaning/action |
|---|---|
| 400 | Correct an invalid generation/processing value |
| 401 | An externally supplied session is invalid |
| 404 | Unknown catalog model or route |
| 422 | Correct a request-schema validation error |
| 429 | Respect `Retry-After` and reduce concurrency |
| 503 | Initializing, failed initialization, or provider/processing failure |

Validation responses identify the field and error type without echoing input values. Failure responses provide safe diagnostics. Goblin's server helper does not enable request-access logging by default.

## Generate an image

Use `curl.exe` in Windows PowerShell if `curl` is aliased. Explicit dimensions and `fast` processing in this example produce PNG:

```sh
curl -X POST http://127.0.0.1:8000/generate -H "Content-Type: application/json" -d '{"prompt":"a red ceramic teapot","model":"goblin-flux","width":768,"height":768,"upscale_preset":"fast"}' --output teapot.png
```

The JSON body supports `prompt`, `negative_prompt`, `model`, `shape`, `seed`, `guidance_scale`, `style`, `quality`, `lighting`, `camera`, `composition`, `expression`, `remove_background`, optional paired `width`/`height`, and `upscale_preset`. Omit dimensions for original provider bytes. Supply both dimensions together. See the generation guide for compatibility fields.

`POST /generate/base64` accepts the same body and returns JSON containing `image_base64`, `format`, `model`, `prompt`, `style`, `quality`, `width` and `height`. Base64 strings have no data-URL prefix. Raw responses report the actual image type in `Content-Type`.

Set `model` to `"auto"` for prompt-based model routing. `POST /models/route` with a JSON body such as `{"prompt":"a watercolor mountain landscape"}` previews the same routing without generating an image or acquiring a provider session. Its `model` field identifies the selected catalog model. Manual model IDs remain supported. The router is a local prompt matcher; it cannot guarantee one model will produce the best image for every prompt.

Convenience generation routes use **query parameters**, rather than a JSON request body. For example:

```sh
curl -X POST 'http://127.0.0.1:8000/generate/photo?prompt=a%20ceramic%20cup' --output photo.jpg
```

## Upscale an existing image

This example uses the base install and Python's standard library:

```python
import base64
import json
from pathlib import Path
from urllib.request import Request, urlopen

body = {
    "image_base64": base64.b64encode(Path("teapot.png").read_bytes()).decode(),
    "width": 1536,
    "height": 1536,
    "preset": "fast",
}
request = Request("http://127.0.0.1:8000/upscale/raw",
                  data=json.dumps(body).encode(),
                  headers={"Content-Type": "application/json"})
with urlopen(request, timeout=120) as response:
    Path("teapot-large.png").write_bytes(response.read())
```

`/upscale` returns base64 JSON; `/upscale/raw` returns image bytes. Use `preset="balanced"` for SPAN with an installed backend, or `model="span-x2"` for a direct model. `/upscale/ultra` accepts optional `restore_model`, `upscale_model` and `output_format` alongside the image and dimensions.

For one-time model setup, inspect `GET /upscale/models`, then call `POST /upscale/models/{model_id}/download` with `Content-Type: application/json` and body `{"confirm":true}`. Missing, false or malformed confirmation returns 400. Only `span`, `span-x2`, `nomos2-mosr`, `nomos2-dat2` and `realplksr-x2` are accepted. Downloads verify the pinned SHA-256 and reuse a verified cached file. Success returns `{"name":"span","downloaded":true,"size_mb":1.64}`; the size is the actual file size in MiB rounded to two decimals. Unsupported IDs return 400; download or verification failures return 503 with a static error message. This endpoint downloads model weights; install inference dependencies separately using the documented package extras.

## Endpoint map

<!-- endpoint-map -->

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Root |
| GET | `/health` | Health |
| GET | `/stats` | Stats |
| GET | `/session` | Get Session Config |
| GET | `/device` | Device Info |
| GET | `/models` | Get Models |
| POST | `/models/route` | Route Model |
| GET | `/models/{model_id}` | Get Model Info |
| GET | `/models/{model_id}/styles` | Get Styles For Model |
| GET | `/options` | Get All Options |
| GET | `/options/styles` | Get Styles |
| GET | `/options/resolutions` | Get Resolutions |
| GET | `/upscale/presets` | Get Upscale Presets |
| GET | `/upscale/models` | Get Upscale Models |
| POST | `/upscale/models/{model_id}/download` | Download Upscale Model |
| POST | `/upscale` | Upscale Image |
| POST | `/upscale/raw` | Upscale Image Raw |
| POST | `/upscale/ultra` | Upscale Ultra Endpoint |
| GET | `/upscale/ultra/test` | Test Ultra Pipeline |
| POST | `/generate` | Generate |
| POST | `/generate/base64` | Generate Base64 |
| POST | `/generate/metadata` | Generate With Metadata |
| POST | `/generate/photo` | Generate Photo |
| POST | `/generate/anime` | Generate Anime |
| POST | `/generate/portrait` | Generate Portrait |
| POST | `/generate/cinematic` | Generate Cinematic |
| GET | `/prompts/random` | Get Random Prompt |
| GET | `/prompts/random/character` | Get Random Character |
| GET | `/prompts/random/landscape` | Get Random Landscape |
| GET | `/prompts/random/anime` | Get Random Anime |
| POST | `/prompts/variations` | Get Prompt Variations |
| GET | `/prompts/categories` | Get Prompt Categories |
| GET | `/prompts/art-styles` | Get Art Styles |
| GET | `/prompts/environments` | Get Environments |
| POST | `/generate/random` | Generate Random Image |

<!-- /endpoint-map -->

The generated table lists the installed API surface. `/docs`, `/redoc` and `/openapi.json` are also available. The [checked-in HTTP schema](openapi.json) gives all request fields and query parameters; a running application's schema is authoritative for its installed version. `/session` returns public session capabilities, without connection details.

Browser POST requests are supported from the same loopback origin as the server (`localhost`, `127.0.0.1` or `[::1]`, including its port). Cross-origin browser requests are denied. Python and other API clients without an Origin header remain supported.

## Limits

Generation/upscale POST routes allow 60 requests per minute per client and at most eight in-flight requests per app. Encoded image fields are limited to 32 MiB of base64 text. Dimensions are 64–4096; neural intermediates have a separate processing bound. Prompts are at most 4000 characters and variations counts are 1–10. The provider has additional queueing/availability limits.

[Generation](generation.md) · [Upscaling](upscaling.md) · [Complete Python API](api-reference.md)
