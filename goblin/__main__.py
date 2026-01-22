"""
Goblin CLI Entry Point
"""
import argparse


def main():
    parser = argparse.ArgumentParser(description="Goblin - Free AI Image Generation")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    parser.add_argument("--static", help="Path to static files directory")

    args = parser.parse_args()

    from .server import run_server
    run_server(host=args.host, port=args.port, static_dir=args.static)


if __name__ == "__main__":
    main()
