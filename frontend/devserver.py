#!/usr/bin/env python3
"""DevHub local static server — like ``python -m http.server`` but with clean URLs.

Why this exists
---------------
Plain ``python -m http.server`` serves files *literally*: a request for the
extension-less URL ``/app`` returns 404 because the file on disk is ``app.html``.

That bites us because ``npx serve`` (a common alternative) does the opposite —
it 301-redirects ``/app.html`` -> ``/app`` (a "clean URL"). **Browsers cache 301
redirects**, so once a browser has talked to ``serve``, it rewrites
``/app.html`` -> ``/app`` on its own *before contacting the server*. Switch back
to ``python -m http.server`` and every hub load 404s on ``/app``.

This server resolves clean URLs: if ``/app`` doesn't exist but ``/app.html``
does, it serves ``app.html``. So the hub loads no matter which URL the browser's
cache decides to ask for — ``/app`` and ``/app.html`` both work, and no 301 is
ever issued (so it can't poison anything either).

Usage
-----
    python devserver.py [PORT]      # default 5500; serves THIS file's folder

Serves the directory the script lives in (``frontend/``), regardless of where
you launch it from. Press Ctrl+C to stop.
"""
import functools
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class CleanUrlHandler(SimpleHTTPRequestHandler):
    """Serve ``foo.html`` for a request to ``/foo`` when ``/foo`` has no file."""

    def translate_path(self, path):
        fs_path = super().translate_path(path)  # already sanitized (no .. escape)
        # Only rewrite when the literal path is missing and "<path>.html" exists.
        # Leaves real files (/config.js, /index.html, …) and directories alone.
        if not os.path.exists(fs_path) and os.path.isfile(fs_path + ".html"):
            return fs_path + ".html"
        return fs_path

    def do_GET(self):
        # Keep logs quiet/clean for the favicon the browser always probes.
        if self.path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        return super().do_GET()

    def end_headers(self):
        # Dev convenience: never let the browser cache HTML/JS/CSS, so edits always
        # show on reload (no more "I changed it but still see the old page"). Also
        # stops a stale index.html/app.html from re-creating the nested-hub bug.
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
    base_dir = os.path.dirname(os.path.abspath(__file__))
    handler = functools.partial(CleanUrlHandler, directory=base_dir)
    try:
        httpd = ThreadingHTTPServer(("", port), handler)
    except OSError as exc:
        print(f"ERROR: can't bind port {port}: {exc}", file=sys.stderr)
        print(f"  Something is already listening on :{port} — usually a leftover", file=sys.stderr)
        print("  static server from an earlier run. Stop it, then re-run:", file=sys.stderr)
        print(f"    Windows  : netstat -ano | findstr :{port}   then  taskkill /PID <pid> /F", file=sys.stderr)
        print(f"    mac/Linux: lsof -ti tcp:{port} | xargs kill", file=sys.stderr)
        sys.exit(1)
    with httpd:
        print(f"DevHub clean-URL server -> http://localhost:{port}/app")
        print(f"  serving: {base_dir}")
        print("  (/app and /app.html both work; Ctrl+C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped.")


if __name__ == "__main__":
    main()
