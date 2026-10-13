import importlib.machinery
import platform
import sys
from pathlib import Path

from setuptools import Distribution, setup
from setuptools.command.bdist_wheel import bdist_wheel
from setuptools.command.build_py import build_py

MODULES = {"_cli", "_core", "_guard", "auto_map", "easy", "generator", "models",
           "parameters", "pool", "prompts", "server", "upscaler", "web"}
machine = platform.machine().lower()
machine = {"amd64": "x86_64", "aarch64": "arm64"}.get(machine, machine)
abi = f"cp{sys.version_info.major}{sys.version_info.minor}"
native = Path(__file__).parent / "goblin" / "_native" / f"{sys.platform}-{machine}" / abi


class BinaryDistribution(Distribution):
    def has_ext_modules(self):
        return True


class BinaryBuild(build_py):
    def run(self):
        if sys.implementation.name != "cpython":
            raise RuntimeError("Goblin requires CPython")
        super().run()
        for module in sorted(MODULES):
            files = [native / (module + suffix) for suffix in importlib.machinery.EXTENSION_SUFFIXES]
            files = [file for file in files if file.is_file()]
            if len(files) != 1:
                raise RuntimeError(f"A compatible native module is missing: {module}")
            self.copy_file(str(files[0]), str(Path(self.build_lib) / "goblin" / files[0].name))


class BinaryWheel(bdist_wheel):
    def get_tag(self):
        interpreter, abi_tag, platform_tag = super().get_tag()
        if sys.platform == "darwin" and platform_tag.endswith("_universal2"):
            platform_tag = platform_tag.removesuffix("universal2") + machine
        return interpreter, abi_tag, platform_tag


setup(distclass=BinaryDistribution, cmdclass={"build_py": BinaryBuild, "bdist_wheel": BinaryWheel})
