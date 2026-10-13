# Model attribution

The curated ONNX weights are published by **Philip Hofmann (Phhofm / Phips)**. Goblin does not bundle the weights. Downloads are unchanged, with recorded SHA-256 checksums; resizing, tiling and output encoding happen locally.

| Preset/model | Author release | Weight license |
|---|---|---|
| balanced / SPAN 4x | [4xNomosUni span multijpg](https://github.com/Phhofm/models/releases/tag/4xNomosUni_span_multijpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| SPAN 2x | [2xNomosUni span multijpg](https://github.com/Phhofm/models/releases/tag/2xNomosUni_span_multijpg) | CC BY 4.0 |
| quality / MoSR | [4xNomos2 hq mosr](https://github.com/Phhofm/models/releases/tag/4xNomos2_hq_mosr) | CC BY 4.0 |
| best / DAT2 | [4xNomos2 hq dat2](https://github.com/Phhofm/models/releases/tag/4xNomos2_hq_dat2) | CC BY 4.0 |
| photo / RealPLKSR | [2xPublic realplksr](https://github.com/Phhofm/models/releases/tag/2xPublic_realplksr_dysample_layernorm_real_nn) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) |

Keep the author's attribution and the applicable license when redistributing model weights. Model licenses are separate from Goblin's proprietary software license. Legacy model names remain for compatibility; the curated presets above are the tested paths for this release.

## Measured performance

A local comparison used two images downsampled to 128x128, four timed runs after warmup, CPU inference with 16 threads and an RTX 5070 Laptop GPU. These are small-image inference measurements, not download, first-load or full-resolution generation times.

| Model | CPU median | GPU median |
|---|---:|---:|
| SPAN 2x | 27 ms | 4 ms |
| SPAN 4x | 32 ms | 13 ms |
| MoSR 4x | 359 ms | 35 ms |
| RealPLKSR 2x | 2167 ms | 222 ms |
| DAT2 4x | 4341 ms | 214 ms |

CPU/GPU output differences on these samples were at most one 8-bit channel level. Quality depends on image content; the preset name `best` is a compatibility name, not a claim that DAT2 always outperforms the alternatives. Larger images and tiled inference take longer.

A compiled-package benchmark at 512x512 input and 1024x1024 output, including conversion, inference, resizing and PNG encoding, measured warm CPU medians of 0.76 s for SPAN 2x, 0.89 s for SPAN 4x, and 9.31 s for MoSR. After GPU tile and thread tuning, warm GPU medians were 0.173 s for SPAN 2x, 0.214 s for SPAN 4x, 0.745 s for MoSR, and 5.337 s for DAT2. First-load time is additional. Automatic selection prioritizes SPAN; quality presets are explicit alternatives.
