"""
Goblin Prompt Tools - Random Prompt Generator & Prompt Enhancer

Research-backed prompt engineering for maximum quality output.
Based on 2026 best practices for Stable Diffusion, Flux, and SDXL models.
"""

import random
from typing import Optional

# === SUBJECT POOLS ===
SUBJECTS = {
    "character": [
        "a warrior", "a mage", "a princess", "a knight", "an assassin",
        "a samurai", "a pirate", "a witch", "a dragon rider", "an elf",
        "a cyberpunk hacker", "a space pilot", "a detective", "a vampire",
        "a werewolf", "a goddess", "a demon", "an angel", "a robot",
        "a ninja", "a cowboy", "a viking", "a pharaoh", "a shaman",
    ],
    "creature": [
        "a dragon", "a phoenix", "a unicorn", "a griffin", "a kraken",
        "a wolf", "a lion", "a tiger", "an owl", "a fox",
        "a mechanical beast", "an alien creature", "a spirit animal",
        "a mythical serpent", "a celestial being", "a forest guardian",
    ],
    "scene": [
        "a mystical forest", "an ancient temple", "a futuristic city",
        "a medieval castle", "an underwater kingdom", "a space station",
        "a haunted mansion", "a cherry blossom garden", "a volcanic landscape",
        "a crystal cave", "a floating island", "a cyberpunk street",
        "a peaceful village", "a battle scene", "a throne room",
    ],
    "object": [
        "an ancient sword", "a magical staff", "a treasure chest",
        "a crystal ball", "an enchanted book", "a mechanical heart",
        "a glowing orb", "a mystical artifact", "a steampunk device",
        "a sacred relic", "a futuristic weapon", "an alchemist's potion",
    ],
    "portrait": [
        "a beautiful woman", "a handsome man", "an elderly sage",
        "a young child", "a mysterious stranger", "a battle-worn hero",
        "a royal figure", "an artist", "a musician", "a scholar",
    ],
}

# === DESCRIPTORS ===
ADJECTIVES = {
    "mood": [
        "epic", "dramatic", "serene", "mysterious", "ethereal",
        "majestic", "haunting", "whimsical", "intense", "peaceful",
        "dark", "radiant", "ancient", "futuristic", "mystical",
    ],
    "visual": [
        "glowing", "shimmering", "intricate", "ornate", "sleek",
        "weathered", "pristine", "crystalline", "metallic", "organic",
        "translucent", "iridescent", "textured", "smooth", "rugged",
    ],
    "color": [
        "golden", "silver", "crimson", "azure", "emerald",
        "obsidian", "ivory", "sapphire", "amber", "violet",
        "coral", "teal", "burgundy", "bronze", "pearl",
    ],
}

# === ENVIRONMENTS ===
ENVIRONMENTS = [
    "in a mystical forest at dawn",
    "under a starry night sky",
    "in an ancient temple",
    "surrounded by cherry blossoms",
    "in a futuristic cityscape",
    "on a floating island",
    "in a crystal cavern",
    "during a thunderstorm",
    "at golden hour sunset",
    "in a misty mountain valley",
    "underwater in a coral reef",
    "in a steampunk workshop",
    "on an alien planet",
    "in a grand throne room",
    "amidst falling autumn leaves",
    "in a neon-lit cyberpunk alley",
    "on a battlefield at dusk",
    "in a peaceful zen garden",
    "inside an abandoned cathedral",
    "on a ship in stormy seas",
]

# === LIGHTING CONDITIONS ===
LIGHTING = [
    "dramatic lighting",
    "soft ambient light",
    "golden hour lighting",
    "moonlit",
    "neon glow",
    "volumetric fog",
    "backlit silhouette",
    "studio lighting",
    "candlelit",
    "bioluminescent glow",
    "cinematic lighting",
    "rim lighting",
    "ethereal light rays",
    "firelight",
    "northern lights",
]

# === ART STYLES ===
ART_STYLES = [
    "digital painting",
    "concept art",
    "oil painting style",
    "watercolor style",
    "anime style",
    "photorealistic",
    "fantasy art",
    "sci-fi art",
    "dark fantasy",
    "art nouveau",
    "baroque style",
    "impressionist style",
    "surrealist",
    "cyberpunk aesthetic",
    "steampunk aesthetic",
]

# === QUALITY BOOSTERS (Research-backed for 2026 models) ===
QUALITY_TAGS = {
    "universal": [
        "masterpiece", "best quality", "highly detailed", "sharp focus",
        "professional", "8k resolution", "intricate details",
    ],
    "artistic": [
        "trending on artstation", "award winning", "stunning composition",
        "by renowned artist", "gallery quality", "museum piece",
    ],
    "photo": [
        "RAW photo", "DSLR", "8k uhd", "high quality", "film grain",
        "Fujifilm XT3", "professional photography",
    ],
    "anime": [
        "masterpiece", "best quality", "detailed anime illustration",
        "vibrant colors", "clean lines", "studio quality animation",
    ],
    "flux": [
        "highly detailed", "sharp", "professional quality",
        "stunning", "beautiful", "excellent composition",
    ],
}

# === NEGATIVE PROMPT TEMPLATES ===
NEGATIVE_TEMPLATES = {
    "universal": "low quality, worst quality, blurry, distorted, watermark, text, signature, jpeg artifacts, grainy, noisy, deformed",
    "realistic": "cartoon, anime, 3d render, cgi, plastic skin, airbrushed, doll-like, uncanny valley, smooth skin, fake, oversaturated",
    "anime": "3d, cgi, realistic, photorealistic, low quality, bad anatomy, extra limbs, fused fingers, grainy, watermark, bad hands",
    "photo": "painting, illustration, drawing, cartoon, anime, 3d render, oversaturated, overexposed, underexposed",
    "artistic": "photo, realistic, amateur, low quality, blurry, bad composition, watermark",
}


def random_prompt(
    category: str = "random",
    style: str = "random",
    include_quality: bool = True,
    include_lighting: bool = True,
    include_environment: bool = True,
) -> dict:
    """
    Generate a random creative prompt for AI image generation.

    Args:
        category: Subject category (character, creature, scene, object, portrait, random)
        style: Art style (or "random" for random style)
        include_quality: Add quality boosting tags
        include_lighting: Add lighting description
        include_environment: Add environment/setting

    Returns:
        dict with 'prompt' and 'negative_prompt'
    """
    # Select subject
    if category == "random":
        category = random.choice(list(SUBJECTS.keys()))
    subjects = SUBJECTS.get(category, SUBJECTS["character"])
    subject = random.choice(subjects)

    # Build prompt parts
    parts = []

    # Add mood/visual adjectives
    mood = random.choice(ADJECTIVES["mood"])
    visual = random.choice(ADJECTIVES["visual"])
    color = random.choice(ADJECTIVES["color"])

    # Construct subject with adjectives
    parts.append(f"{mood} {visual} {subject} with {color} accents")

    # Add environment
    if include_environment:
        parts.append(random.choice(ENVIRONMENTS))

    # Add lighting
    if include_lighting:
        parts.append(random.choice(LIGHTING))

    # Add art style
    if style == "random":
        style = random.choice(ART_STYLES)
    parts.append(style)

    # Add quality boosters
    if include_quality:
        quality_type = "anime" if "anime" in style.lower() else "universal"
        quality_tags = random.sample(QUALITY_TAGS[quality_type], min(4, len(QUALITY_TAGS[quality_type])))
        parts.extend(quality_tags)

    prompt = ", ".join(parts)

    # Select appropriate negative prompt
    if "anime" in style.lower():
        negative = NEGATIVE_TEMPLATES["anime"]
    elif "photo" in style.lower() or "realistic" in style.lower():
        negative = NEGATIVE_TEMPLATES["realistic"]
    else:
        negative = NEGATIVE_TEMPLATES["universal"]

    return {
        "prompt": prompt,
        "negative_prompt": negative,
        "category": category,
        "style": style,
    }


def enhance_prompt(
    prompt: str,
    model_type: str = "general",
    quality_level: str = "ultra",
    add_negative: bool = True,
) -> dict:
    """
    Enhance a simple prompt into a detailed, high-quality prompt.

    Uses research-backed techniques for optimal results:
    - Flux models: Natural language, minimal tags, CFG 1-4
    - SDXL models: Balanced tags, avoid over-prompting, CFG 5-7
    - SD 1.5 models: Dense tags work well, CFG 7-9
    - Anime models: Quality tags + style tags, clip skip 2
    - Furry/Pony: Score tags system

    Args:
        prompt: The base prompt to enhance
        model_type: Type of model (general, flux, sdxl, anime, realistic, furry)
        quality_level: Quality preset (standard, high, ultra, maximum)
        add_negative: Whether to generate negative prompt

    Returns:
        dict with 'prompt', 'negative_prompt', and 'guidance_scale'
    """
    enhanced_parts = []

    # Model-specific enhancement strategies
    if model_type == "flux":
        # Flux prefers natural language, minimal tags
        # Research shows CFG 1-4 is optimal for schnell/dev
        enhanced_parts.append(prompt)
        if quality_level in ["ultra", "maximum"]:
            enhanced_parts.extend(["highly detailed", "sharp", "professional quality"])
        guidance = 1 if "schnell" in prompt.lower() else 3.5
        negative = ""  # Flux often works better without negative prompts

    elif model_type == "anime":
        # Anime models benefit from quality tags + style descriptors
        # Clip skip 2 is standard, CFG 7 is sweet spot
        quality_prefix = "masterpiece, best quality, " if quality_level in ["ultra", "maximum"] else ""
        enhanced_parts.append(f"{quality_prefix}{prompt}")
        enhanced_parts.extend([
            "detailed anime illustration",
            "vibrant colors",
            "clean lines",
        ])
        if quality_level == "maximum":
            enhanced_parts.extend(["studio quality", "award winning"])
        guidance = 7
        negative = NEGATIVE_TEMPLATES["anime"]

    elif model_type == "realistic" or model_type == "photo":
        # Realistic models: avoid over-description, focus on technical quality
        # CFG 5-6 prevents artificial look
        enhanced_parts.append(prompt)
        enhanced_parts.extend([
            "RAW photo",
            "8k uhd",
            "DSLR",
            "high quality",
        ])
        if quality_level in ["ultra", "maximum"]:
            enhanced_parts.extend(["professional photography", "natural skin texture"])
        guidance = 5
        negative = NEGATIVE_TEMPLATES["realistic"]

    elif model_type == "furry":
        # Pony Diffusion score system - CRITICAL for quality
        # CFG 6, Clip Skip 2
        score_prefix = "score_9, score_8_up, score_7_up, source_furry, "
        enhanced_parts.append(f"{score_prefix}{prompt}")
        if quality_level in ["ultra", "maximum"]:
            enhanced_parts.extend(["detailed fur", "expressive", "dynamic pose"])
        guidance = 6
        negative = NEGATIVE_TEMPLATES["universal"] + ", human, realistic human"

    elif model_type == "sdxl":
        # SDXL: balanced approach, CFG 5-7 prevents color burn
        enhanced_parts.append(prompt)
        if quality_level in ["ultra", "maximum"]:
            enhanced_parts.extend([
                "highly detailed",
                "sharp focus",
                "professional",
                "8k resolution",
            ])
        guidance = 6
        negative = NEGATIVE_TEMPLATES["universal"]

    else:  # general / SD 1.5
        # Traditional SD: dense tags work well, CFG 7-9
        if quality_level in ["ultra", "maximum"]:
            enhanced_parts.append("masterpiece, best quality")
        enhanced_parts.append(prompt)
        enhanced_parts.extend([
            "highly detailed",
            "sharp focus",
            "intricate details",
        ])
        if quality_level == "maximum":
            enhanced_parts.extend(["professional", "8k", "award winning"])
        guidance = 7
        negative = NEGATIVE_TEMPLATES["universal"]

    return {
        "prompt": ", ".join(enhanced_parts),
        "negative_prompt": negative if add_negative else "",
        "guidance_scale": guidance,
        "model_type": model_type,
        "quality_level": quality_level,
    }


def enhance_for_model(prompt: str, model_id: str) -> dict:
    """
    Automatically enhance a prompt based on the target model.

    Args:
        prompt: Base prompt
        model_id: Goblin model ID (e.g., "goblin-flux", "goblin-anime")

    Returns:
        dict with enhanced prompt, negative prompt, and optimal settings
    """
    # Determine model type from ID
    model_id_lower = model_id.lower()

    if "flux" in model_id_lower or "laia" in model_id_lower or "imagine" in model_id_lower:
        model_type = "flux"
    elif "anime" in model_id_lower or "chibi" in model_id_lower:
        model_type = "anime"
    elif "realistic" in model_id_lower or "photo" in model_id_lower or "portrait" in model_id_lower or "human" in model_id_lower:
        model_type = "realistic"
    elif "furry" in model_id_lower or "fursona" in model_id_lower:
        model_type = "furry"
    elif "sdxl" in model_id_lower:
        model_type = "sdxl"
    elif "uncensored" in model_id_lower or "nsfw" in model_id_lower:
        model_type = "realistic"  # NSFW models typically realistic
    else:
        model_type = "general"

    return enhance_prompt(prompt, model_type=model_type, quality_level="ultra")


# === THEMED PROMPT GENERATORS ===

def random_character_prompt(gender: str = "random", fantasy: bool = True) -> dict:
    """Generate a random character prompt"""
    genders = ["female", "male", "androgynous"] if gender == "random" else [gender]
    gender = random.choice(genders)

    races = ["human", "elf", "orc", "demon", "angel", "vampire", "werewolf"] if fantasy else ["human"]
    race = random.choice(races)

    classes = ["warrior", "mage", "rogue", "archer", "knight", "witch", "samurai", "ninja"]
    char_class = random.choice(classes)

    features = [
        "flowing hair", "braided hair", "short hair", "long hair",
        "glowing eyes", "heterochromia", "sharp features", "soft features",
        "battle scars", "tattoos", "freckles", "pointed ears",
    ]
    feature = random.choice(features)

    prompt = f"a {gender} {race} {char_class} with {feature}"
    return enhance_prompt(prompt, model_type="general", quality_level="ultra")


def random_landscape_prompt(time: str = "random", weather: str = "random") -> dict:
    """Generate a random landscape prompt"""
    times = ["dawn", "morning", "noon", "sunset", "dusk", "night", "golden hour", "blue hour"]
    weathers = ["clear", "cloudy", "stormy", "misty", "snowy", "rainy", "foggy"]

    time = random.choice(times) if time == "random" else time
    weather = random.choice(weathers) if weather == "random" else weather

    locations = [
        "mountain range", "forest valley", "ocean coastline", "desert dunes",
        "frozen tundra", "tropical jungle", "rolling hills", "volcanic landscape",
        "crystal caves", "floating islands", "ancient ruins", "waterfall canyon",
    ]
    location = random.choice(locations)

    prompt = f"breathtaking {location} at {time}, {weather} weather"

    result = enhance_prompt(prompt, model_type="general", quality_level="ultra")
    result["prompt"] += ", landscape photography, panoramic view, epic scale"
    return result


def random_anime_prompt(style: str = "random") -> dict:
    """Generate a random anime-style prompt"""
    styles = ["shonen", "shoujo", "seinen", "ghibli", "cyberpunk", "fantasy", "slice-of-life"]
    style = random.choice(styles) if style == "random" else style

    characters = [
        "a determined young hero", "a mysterious mage", "a cheerful schoolgirl",
        "a brooding swordsman", "a cute fox girl", "a cool gunslinger",
        "a gentle healer", "a fierce warrior princess", "a shy bookworm",
    ]
    character = random.choice(characters)

    actions = [
        "looking at the viewer", "in dynamic action pose", "sitting peacefully",
        "casting a spell", "drawing a sword", "smiling softly", "gazing at sunset",
    ]
    action = random.choice(actions)

    prompt = f"{character}, {action}, {style} anime style"
    return enhance_prompt(prompt, model_type="anime", quality_level="ultra")


# === PROMPT VARIATION ===

def create_variations(prompt: str, count: int = 4) -> list:
    """
    Create multiple variations of a prompt for batch generation.

    Args:
        prompt: Base prompt
        count: Number of variations (1-10)

    Returns:
        List of varied prompts
    """
    variations = []

    # Variation strategies
    style_variations = [
        "dramatic lighting",
        "soft ambient lighting",
        "cinematic composition",
        "artistic interpretation",
        "highly detailed",
        "ethereal atmosphere",
        "dynamic pose",
        "close-up view",
        "wide shot",
        "golden hour",
    ]

    for i in range(min(count, 10)):
        if i == 0:
            # First is always the original
            variations.append(prompt)
        else:
            # Add variation
            variation = random.choice(style_variations)
            varied_prompt = f"{prompt}, {variation}"
            variations.append(varied_prompt)

    return variations


# === EXPORT FUNCTIONS ===

def list_categories() -> list:
    """List all subject categories"""
    return list(SUBJECTS.keys())


def list_art_styles() -> list:
    """List all available art styles"""
    return ART_STYLES.copy()


def list_environments() -> list:
    """List all environment presets"""
    return ENVIRONMENTS.copy()


def list_model_types() -> list:
    """List supported model types for enhancement"""
    return ["general", "flux", "sdxl", "anime", "realistic", "furry", "photo"]
