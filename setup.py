"""
Goblin - Setup script for Cython compilation
"""
import os
import sys
from setuptools import setup, Extension

# Check if we're building with Cython
try:
    from Cython.Build import cythonize
    from Cython.Distutils import build_ext
    USE_CYTHON = True
except ImportError:
    USE_CYTHON = False

# Modules to compile
CYTHON_MODULES = [
    "goblin/_guard.py",
    "goblin/_core.py",
    "goblin/generator.py",
    "goblin/models.py",
    "goblin/parameters.py",
    "goblin/server.py",
]

# Cython compiler directives
COMPILER_DIRECTIVES = {
    'language_level': "3",
    'always_allow_keywords': True,
    'annotation_typing': False,
    'emit_code_comments': False,
    'embedsignature': False,
}

def get_extensions():
    """Get extension modules for compilation"""
    if not USE_CYTHON:
        return []

    existing = [m for m in CYTHON_MODULES if os.path.exists(m)]
    if not existing:
        return []

    return cythonize(
        existing,
        compiler_directives=COMPILER_DIRECTIVES,
        nthreads=4,
        quiet=False,
    )

# Clean up .c files after build
class CleanBuildExt(build_ext if USE_CYTHON else object):
    def run(self):
        super().run()
        # Remove generated .c files
        for module in CYTHON_MODULES:
            c_file = module.replace('.py', '.c')
            if os.path.exists(c_file):
                os.remove(c_file)

setup(
    ext_modules=get_extensions(),
    cmdclass={'build_ext': CleanBuildExt} if USE_CYTHON else {},
)
