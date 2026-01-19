"""
Build script for Goblin - Maximum protection with Nuitka
Compiles Python to C to native machine code
"""
import os
import sys
import shutil
import subprocess
import tempfile
import random
import string

PACKAGE_DIR = "goblin"
DIST_DIR = "dist"
BUILD_DIR = "build"
NUITKA_BUILD = "goblin.build"
NUITKA_DIST = "goblin.dist"

# Files to compile with Nuitka (core logic)
COMPILE_MODULES = ["_guard.py", "_core.py", "generator.py", "models.py", "parameters.py", "server.py", "easy.py"]

# Files to keep as .py (minimal loaders only)
KEEP_PY = ["__init__.py", "__main__.py", "prompts.py"]


def generate_xor_key(length=32):
    """Generate random XOR key"""
    return bytes(random.randint(1, 255) for _ in range(length))


def xor_encrypt(data: bytes, key: bytes) -> bytes:
    """XOR encrypt data with key"""
    return bytes(data[i] ^ key[i % len(key)] for i in range(len(data)))


def obfuscate_strings_in_file(filepath: str, key: bytes) -> str:
    """Replace string literals with XOR-encrypted versions"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # This is a simplified version - for production you'd want AST-based transformation
    # For now we rely on Nuitka's own string obfuscation
    return content


def clean():
    """Remove build artifacts"""
    for d in [DIST_DIR, BUILD_DIR, NUITKA_BUILD, NUITKA_DIST,
              f"{PACKAGE_DIR}.egg-info", "goblin_ai.egg-info", "._obfuscated"]:
        if os.path.exists(d):
            shutil.rmtree(d, ignore_errors=True)
            print(f"Removed {d}")

    # Remove .c, .pyd files from source
    for f in os.listdir(PACKAGE_DIR):
        if f.endswith((".c", ".pyd", ".so")):
            try:
                os.remove(os.path.join(PACKAGE_DIR, f))
                print(f"Removed {f}")
            except PermissionError:
                print(f"WARNING: Could not remove {f} (in use?) - will be replaced")


def compile_with_nuitka(module_path: str, output_dir: str):
    """Compile a single module with Nuitka"""
    module_name = os.path.splitext(os.path.basename(module_path))[0]

    cmd = [
        sys.executable, "-m", "nuitka",
        "--module",
        "--output-dir=" + output_dir,
        # Optimization
        "--lto=yes",
        "--remove-output",
        # Protection
        "--no-pyi-file",
        # No debug
        "--python-flag=no_site",
        "--python-flag=no_warnings",
        module_path
    ]

    print(f"Compiling {module_name}...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"ERROR compiling {module_name}:")
        print(result.stderr)
        return False

    return True


def build_all_modules():
    """Compile all modules with Nuitka"""
    output_dir = os.path.abspath("._nuitka_out")
    os.makedirs(output_dir, exist_ok=True)

    success = True
    for module in COMPILE_MODULES:
        module_path = os.path.join(PACKAGE_DIR, module)
        if os.path.exists(module_path):
            if not compile_with_nuitka(module_path, output_dir):
                success = False
                break

    if success:
        # Move compiled .pyd/.so files to package directory
        for f in os.listdir(output_dir):
            if f.endswith((".pyd", ".so")):
                src = os.path.join(output_dir, f)
                dst = os.path.join(PACKAGE_DIR, f)
                # Remove existing file first if it exists
                if os.path.exists(dst):
                    try:
                        os.remove(dst)
                    except PermissionError:
                        # File is locked - rename it instead
                        old_name = dst + ".old"
                        try:
                            if os.path.exists(old_name):
                                os.remove(old_name)
                        except:
                            pass
                        try:
                            os.rename(dst, old_name)
                            print(f"Renamed locked {f} to {f}.old")
                        except PermissionError:
                            print(f"ERROR: Cannot replace {f} - stop the server first!")
                            success = False
                            break
                shutil.copy2(src, dst)
                print(f"Copied {f} to {PACKAGE_DIR}/")

    # Cleanup
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

    # Remove any .build directories Nuitka creates
    for item in os.listdir("."):
        if item.endswith(".build"):
            shutil.rmtree(item)

    return success


def prepare_distribution():
    """Move source .py files out before building wheel"""
    backup_dir = "._py_backup"
    os.makedirs(backup_dir, exist_ok=True)

    moved = []
    for f in COMPILE_MODULES:
        src = os.path.join(PACKAGE_DIR, f)
        dst = os.path.join(backup_dir, f)
        if os.path.exists(src):
            shutil.move(src, dst)
            moved.append(f)
            print(f"Backed up {f}")

    return moved


def restore_source(moved_files):
    """Restore source .py files after building"""
    backup_dir = "._py_backup"

    for f in moved_files:
        src = os.path.join(backup_dir, f)
        dst = os.path.join(PACKAGE_DIR, f)
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"Restored {f}")

    if os.path.exists(backup_dir):
        shutil.rmtree(backup_dir)


def build_wheel():
    """Build the wheel distribution"""
    print("\nBuilding wheel...")
    subprocess.run([sys.executable, "-m", "build", "--wheel"], check=True)


def verify_wheel():
    """Verify the wheel doesn't contain source code"""
    import zipfile

    wheels = [f for f in os.listdir(DIST_DIR) if f.endswith(".whl")]
    if not wheels:
        print("ERROR: No wheel found!")
        return False

    wheel_path = os.path.join(DIST_DIR, wheels[0])
    print(f"\nVerifying {wheels[0]}...")

    exposed_source = []
    with zipfile.ZipFile(wheel_path, 'r') as z:
        for name in z.namelist():
            basename = os.path.basename(name)
            # Check for source files that shouldn't be there
            if basename in COMPILE_MODULES:
                exposed_source.append(name)
            elif name.endswith(".c") and "goblin/" in name:
                exposed_source.append(name)

    if exposed_source:
        print("WARNING: Source files found in wheel!")
        for f in exposed_source:
            print(f"  - {f}")
        return False
    else:
        print("SUCCESS: No source code exposed!")
        # List what's in the wheel
        with zipfile.ZipFile(wheel_path, 'r') as z:
            print("\nWheel contents:")
            for name in sorted(z.namelist()):
                if "goblin/" in name:
                    print(f"  {name}")
        return True


def main():
    print("=" * 60)
    print("Goblin MAXIMUM PROTECTION Build (Nuitka)")
    print("=" * 60)
    print("\nThis compiles Python -> C -> Native machine code")
    print("Much harder to reverse engineer than Cython!\n")

    # Clean previous builds
    print("Step 1: Cleaning...")
    clean()

    # Compile with Nuitka
    print("\nStep 2: Compiling with Nuitka...")
    if not build_all_modules():
        print("\nERROR: Nuitka compilation failed!")
        sys.exit(1)

    # Move source files out
    print("\nStep 3: Preparing distribution...")
    moved = prepare_distribution()

    try:
        # Build wheel
        print("\nStep 4: Building wheel...")
        build_wheel()

        # Verify
        print("\nStep 5: Verifying...")
        success = verify_wheel()

    finally:
        # Always restore source files
        print("\nStep 6: Restoring source files...")
        restore_source(moved)

    if success:
        print("\n" + "=" * 60)
        print("BUILD SUCCESSFUL - Maximum protection enabled!")
        print("Binaries are TRUE native code (not bytecode)")
        print("Run: twine upload dist/*")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("BUILD FAILED - Source code exposed!")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
