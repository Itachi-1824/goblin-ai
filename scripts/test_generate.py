#!/usr/bin/env python3
"""Test script for goblin-ai image generation - BROWSERLESS MODE"""
import asyncio
import os
import platform
from goblin import Goblin
from datetime import datetime


async def test():
    print("Starting test...")
    print(f"Platform: {platform.system()} {platform.release()}")

    try:
        async with Goblin() as g:
            print(f"Key obtained: {g._k[:20]}...")
            print(f"Browser closed: {g._browser_closed}")
            print(f"Using curl_cffi with Firefox impersonation")

            # Wait for previous browser request to finish
            # (the browser triggers a generation during key capture)
            print("Waiting for previous browser request to complete...")
            await asyncio.sleep(10)

            # Generate image (browserless - using curl_cffi)
            print("Generating image (browserless mode)...")
            img_bytes = await g.generate("a beautiful mountain landscape at sunset")

            # Save to outputs
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            filename = f"outputs/{timestamp}.jpg"
            with open(filename, "wb") as f:
                f.write(img_bytes)

            print(f"Image saved to {filename}")
            print(f"Image size: {len(img_bytes)} bytes")
            print("TEST PASSED!")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    asyncio.run(test())
