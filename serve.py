"""
Dev server for the portfolio. Always serves current code.

    python serve.py            # picks a free port, opens your browser
    python serve.py 8080       # start looking from 8080 instead

Three things it does that `python -m http.server` does not:

1. Sends `Cache-Control: no-store` on every response, so the browser cannot
   reuse a stale style.css or ES module. Without this an edit lands on disk,
   the server sends the new bytes, and the page still paints the old ones —
   which looks exactly like "my change did nothing".
2. Picks the first free port instead of dying on "address already in use",
   so a forgotten server from an earlier session cannot serve you old files.
   Nothing gets killed; the stale one is simply stepped over.
3. Opens the browser on the port it actually got, with a cache-busting query
   so the very first document load cannot come from cache either.

Serves this file's own directory, so it works from any working directory.
Local only — GitHub Pages sets its own caching in production.
"""

import os
import socket
import sys
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


def first_free_port(start, tries=25):
    """First port from `start` with nothing listening on it."""
    for port in range(start, start + tries):
        with socket.socket() as probe:
            if probe.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise SystemExit(f"No free port in {start}-{start + tries - 1}.")


if __name__ == "__main__":
    wanted = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    port = first_free_port(wanted)
    if port != wanted:
        print(f"Port {wanted} is busy (something else is still running there).")

    url = f"http://localhost:{port}/?fresh={int(time.time())}"
    with ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler) as httpd:
        print(f"Serving {ROOT}")
        print(f"  {url}")
        print("  no-store: a plain reload always shows current code. Ctrl+C to stop.")
        # Serving is the job; opening a window is a convenience. A misconfigured
        # BROWSER env var raises here and would otherwise kill the server.
        try:
            webbrowser.open(url)
        except Exception as err:
            print(f"  (could not open a browser: {err} — open the URL above yourself)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")
