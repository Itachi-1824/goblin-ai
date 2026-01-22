#!/usr/bin/env python3
"""
Encrypt source files for GitHub secrets - split into 2 parts
"""
import base64
import tarfile
import lzma
import io
import os

SOURCE_FILES = [
    '_core.py',
    '_guard.py',
    'easy.py',
    'generator.py',
    'models.py',
    'parameters.py',
    'server.py',
    'prompts.py',
]

def create_encrypted_bundle():
    # Create tar in memory
    tar_buffer = io.BytesIO()

    with tarfile.open(fileobj=tar_buffer, mode='w') as tar:
        for filename in SOURCE_FILES:
            filepath = os.path.join('goblin', filename)
            if os.path.exists(filepath):
                tar.add(filepath, arcname=filename)
                print(f"Added: {filename}")

    # LZMA compress
    tar_buffer.seek(0)
    compressed = lzma.compress(tar_buffer.read(), preset=9)
    encoded = base64.b64encode(compressed).decode('utf-8')

    # Split in half
    mid = len(encoded) // 2
    part1 = encoded[:mid]
    part2 = encoded[mid:]

    with open('GOBLIN_SOURCE_1.txt', 'w') as f:
        f.write(part1)
    with open('GOBLIN_SOURCE_2.txt', 'w') as f:
        f.write(part2)

    print(f"\n=== Done ===")
    print(f"Part 1: {len(part1)} chars -> GOBLIN_SOURCE_1.txt")
    print(f"Part 2: {len(part2)} chars -> GOBLIN_SOURCE_2.txt")
    print(f"\nAdd both to GitHub Secrets as GOBLIN_SOURCE_1 and GOBLIN_SOURCE_2")

if __name__ == '__main__':
    create_encrypted_bundle()
