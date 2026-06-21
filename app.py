# -*- coding: utf-8 -*-
"""Le Blog IA — par Eduservices. Flask backend (SPA hash routing côté front)."""
import json
from pathlib import Path
from flask import Flask, render_template, jsonify, send_from_directory, abort

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

app = Flask(__name__)

def _load(name):
    p = DATA_DIR / name
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8"))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/healthz")
def healthz():
    return "ok", 200

@app.route("/robots.txt")
def robots():
    return send_from_directory(BASE_DIR / "static", "robots.txt", mimetype="text/plain")

@app.route("/api/bootstrap")
def api_bootstrap():
    """Single payload pour le front : édition, thèmes, dernières actus, récap, formations."""
    return jsonify({
        "edition": _load("edition.json"),
        "themes": _load("themes.json"),
        "blog": _load("blog.json"),
        "recap": _load("recap.json"),
        "pedagogie": _load("pedagogie.json"),
    })

@app.route("/api/formation/<niveau>")
def api_formation(niveau):
    if niveau not in ("n1", "n2"):
        abort(404)
    pedagogie = _load("pedagogie.json")
    return jsonify(pedagogie.get(niveau, {}))

@app.route("/api/formation/<niveau>/module/<int:num>")
def api_module(niveau, num):
    pedagogie = _load("pedagogie.json")
    modules = pedagogie.get(niveau, {}).get("modules", [])
    for m in modules:
        if m.get("num") == num:
            # Add linked blog posts (matching by tags)
            blog = _load("blog.json").get("articles", [])
            module_tags = set(m.get("tags", []))
            m = dict(m)
            m["linked_actus"] = [
                a for a in blog
                if module_tags & set(a.get("tags", []))
            ][:3]
            return jsonify(m)
    abort(404)

@app.route("/api/blog/<theme>")
def api_blog_theme(theme):
    blog = _load("blog.json")
    articles = [a for a in blog.get("articles", []) if theme in a.get("themes", [])]
    return jsonify({"theme": theme, "articles": articles})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
