#!/usr/bin/env python3
"""Test script for goblin-ai image generation"""
import asyncio
from goblin import Goblin
from datetime import datetime


async def test():
    print("Starting test...")
    async with Goblin() as g:
        print(f"Key obtained: {g._k[:20]}...")

        # Generate image
        img_bytes = await g.generate("a beautiful mountain landscape at sunset")

        # Save to outputs
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        filename = f"outputs/{timestamp}.jpg"
        with open(filename, "wb") as f:
            f.write(img_bytes)

        print(f"Image saved to {filename}")
        print("TEST PASSED!")


if __name__ == "__main__":
    asyncio.run(test())
