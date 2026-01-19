#!/usr/bin/env python3
"""
Encrypt source files for GitHub secret.
Run this locally, then add the output to GitHub secret named GOBLIN_SOURCE
"""
import base64
import tarfile
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
    # Create tar.gz in memory
    tar_buffer = io.BytesIO()

    with tarfile.open(fileobj=tar_buffer, mode='w:gz') as tar:
        for filename in SOURCE_FILES:
            filepath = os.path.join('goblin', filename)
            if os.path.exists(filepath):
                tar.add(filepath, arcname=filename)
                print(f"Added: {filename}")
            else:
                print(f"WARNING: {filename} not found!")

    # Base64 encode
    tar_buffer.seek(0)
    encoded = base64.b64encode(tar_buffer.read()).decode('utf-8')

    # Save to file
    with open('GOBLIN_SOURCE.txt', 'w') as f:
        f.write(encoded)

    print(f"\n=== Done ===")
    print(f"Encoded size: {len(encoded)} chars")
    print(f"Saved to: GOBLIN_SOURCE.txt")
    print(f"\nAdd this to GitHub Secrets as GOBLIN_SOURCE")
    print(f"Settings -> Secrets and variables -> Actions -> New repository secret")

if __name__ == '__main__':
    create_encrypted_bundle()
