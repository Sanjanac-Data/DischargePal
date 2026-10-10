"""Vercel serverless entry point that re-exposes the existing FastAPI app.

Vercel builds any .py file inside /api as a function and (via the rewrites in
vercel.json) forwards /api/* requests here. backend/main.py defines its routes
WITHOUT the /api prefix (e.g. /medications), so this drops a leading /api before
handing the request on. backend/main.py and the React frontend stay unchanged.
"""
import os
import sys

# Make the repo-root "backend" package importable from this file.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app as backend_app  # noqa: E402


class _StripApiPrefix:
    """ASGI wrapper: remove a leading '/api' from the request path if present."""

    def __init__(self, app, prefix="/api"):
        self.app = app
        self.prefix = prefix

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path == self.prefix or path.startswith(self.prefix + "/"):
                scope = dict(scope)
                scope["path"] = path[len(self.prefix):] or "/"
                scope["root_path"] = scope.get("root_path", "") + self.prefix
        await self.app(scope, receive, send)


app = _StripApiPrefix(backend_app)
