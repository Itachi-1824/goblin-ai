#!/bin/bash
# Build script for Linux - run this on your VPS
# Usage: ./build_linux.sh

set -e

echo "=== Goblin Linux Build ==="

# Install dependencies
pip install nuitka ordered-set zstandard

# Clean old builds
rm -rf build/ goblin/*.so

# Compile each module with Nuitka
for module in _core _guard easy generator models parameters server prompts; do
    echo "Compiling $module..."
    python -m nuitka --module goblin/${module}.py --output-dir=goblin --remove-output
done

echo ""
echo "=== Build complete ==="
ls -la goblin/*.so

# Build wheel
echo ""
echo "=== Building wheel ==="

# Temporarily hide source files
mkdir -p .src_backup
for f in _core _guard easy generator models parameters server prompts; do
    mv goblin/${f}.py .src_backup/ 2>/dev/null || true
done
rm -f goblin/*.pyi

# Get Python version and platform for wheel name
PY_VER=$(python -c "import sys; print(f'cp{sys.version_info.major}{sys.version_info.minor}')")
PLATFORM=$(python -c "import sysconfig; print(sysconfig.get_platform().replace('-', '_').replace('.', '_'))")

# Build wheel
pip wheel . --no-deps -w dist/

# Restore source files
for f in _core _guard easy generator models parameters server prompts; do
    mv .src_backup/${f}.py goblin/ 2>/dev/null || true
done
rmdir .src_backup

echo ""
echo "=== Wheel created ==="
ls -la dist/*.whl
