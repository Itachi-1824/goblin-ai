"""
Goblin Build Script - Compiles to protected binaries
"""
from setuptools import setup, Extension
from Cython.Build import cythonize
from Cython.Distutils import build_ext
import os
import sys

# Modules to compile (all core logic)
MODULES = [
    "goblin/_guard.py",
    "goblin/_core.py",
    "goblin/generator.py",
    "goblin/models.py",
    "goblin/parameters.py",
    "goblin/server.py",
]

# Cython compiler directives for maximum optimization
COMPILER_DIRECTIVES = {
    'language_level': "3",
    'always_allow_keywords': True,
    'annotation_typing': False,
    'emit_code_comments': False,
    'embedsignature': False,
}

def build():
    """Build binary files from Python source"""

    existing_modules = [m for m in MODULES if os.path.exists(m)]

    if not existing_modules:
        print("No modules found to compile!")
        return

    print(f"Compiling {len(existing_modules)} modules to binary...")
    print(f"Platform: {sys.platform}")

    setup(
        name='goblin',
        ext_modules=cythonize(
            existing_modules,
            compiler_directives=COMPILER_DIRECTIVES,
            nthreads=4,
            quiet=False,
        ),
        cmdclass={'build_ext': build_ext},
        script_args=['build_ext', '--inplace'],
    )

    print("\nCompilation complete!")

    # Clean up .c files
    for module in existing_modules:
        c_file = module.replace('.py', '.c')
        if os.path.exists(c_file):
            os.remove(c_file)
            print(f"  Removed: {c_file}")

if __name__ == '__main__':
    build()
