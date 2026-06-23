# -*- coding: utf-8 -*-
"""Apprendre & transmettre avec les outils numériques — Flask backend (SPA hash routing)."""
import json
from pathlib import Path
from flask import Flask, render_template, jsonify, send_from_directory, abort

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

app = Flask(__name__)

def _load(name):
    p = DATA_DIR / name
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}

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
    return jsonify({
        "edition": _load("edition.json"),
        "themes": _load("themes.json"),
        "veille": _load("blog.json"),     # renommé Blog → Veille
        "recap": _load("recap.json"),
        "pedagogie": _load("pedagogie.json"),
    })

@app.route("/api/module/<int:num>")
def api_module(num):
    peda = _load("pedagogie.json")
    for m in peda.get("modules", []):
        if m.get("num") == num:
            return jsonify(m)
    abort(404)

@app.route("/api/module/<int:num>/partie/<int:p>")
def api_partie(num, p):
    peda = _load("pedagogie.json")
    for m in peda.get("modules", []):
        if m.get("num") != num:
            continue
        for part in m.get("parties", []):
            if part.get("num") == p:
                # Linked actus depuis la veille
                tags = set(m.get("tags", []))
                veille = _load("blog.json").get("articles", [])
                linked = [a for a in veille if tags & set(a.get("tags", []))][:3]
                out = dict(part)
                out["linked_actus"] = linked
                out["module_title"] = m.get("title")
                out["module_num"] = num
                return jsonify(out)
        abort(404)
    abort(404)

@app.route("/api/veille/<theme>")
def api_veille_theme(theme):
    veille = _load("blog.json")
    articles = [a for a in veille.get("articles", []) if theme in a.get("themes", [])]
    return jsonify({"theme": theme, "articles": articles})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
