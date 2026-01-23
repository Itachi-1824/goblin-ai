"""
Goblin CLI Entry Point

Usage:
    goblin                    # Start server with web UI
    goblin ui                 # Start server and open browser
    goblin --port 7777        # Custom port
    goblin --no-ui            # API only (no web interface)
    python -m goblin          # Same as above
"""
import argparse
import os
import sys
import webbrowser
import threading


def open_browser_delayed(url, delay=1.5):
    """Open browser after a short delay to let server start"""
    import time
    time.sleep(delay)
    webbrowser.open(url)


def main():
    # Check for subcommand first
    if len(sys.argv) > 1 and sys.argv[1] == "ui":
        # Remove 'ui' from args and set flag
        sys.argv.pop(1)
        open_browser = True
    else:
        open_browser = False

    parser = argparse.ArgumentParser(
        description="Goblin AI - Free Image Generation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  goblin                    Start server with web UI
  goblin ui                 Start server and auto-open browser

Options:
  goblin --port 7777        Start on custom port
  goblin --no-ui            API-only mode (no web interface)
  goblin --host 0.0.0.0     Bind to all interfaces
        """
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to (default: 127.0.0.1)")
    parser.add_argument("--port", "-p", type=int, default=7865, help="Port to bind to (default: 7865)")
    parser.add_argument("--no-ui", action="store_true", help="Disable web UI, API only")
    parser.add_argument("--static", help="Custom path to static files directory")
    parser.add_argument("--no-browser", action="store_true", help="Don't auto-open browser (with ui command)")

    args = parser.parse_args()

    # Determine static directory
    if args.no_ui:
        static_dir = None
    elif args.static:
        static_dir = args.static
    else:
        # Use bundled web UI
        static_dir = os.path.join(os.path.dirname(__file__), "web")
        if not os.path.exists(static_dir):
            static_dir = None

    # Build URL
    url = f"http://{args.host}:{args.port}/"
    if args.host == "0.0.0.0":
        browser_url = f"http://127.0.0.1:{args.port}/"
    else:
        browser_url = url

    # Print startup banner
    print()
    print("  +-----------------------------------------+")
    print("  |   Goblin AI v2.0.0                      |")
    print("  |   Free AI Image Generation              |")
    print("  +-----------------------------------------+")
    print()
    print("  [*] Initializing...")

    # Auto-open browser if 'ui' command was used
    if open_browser and not args.no_browser and static_dir:
        thread = threading.Thread(target=open_browser_delayed, args=(browser_url, 2.0))
        thread.daemon = True
        thread.start()

    from .server import run_server
    run_server(host=args.host, port=args.port, static_dir=static_dir)


if __name__ == "__main__":
    main()
