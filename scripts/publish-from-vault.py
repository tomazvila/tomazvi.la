#!/usr/bin/env python3
"""Publish an approved Obsidian post note into the live blog.

Usage:
    python3 scripts/publish-from-vault.py <note-path-or-title> [--dry-run]

The note is a markdown file in <vault>/Blog/ whose frontmatter follows the
blog-pipeline contract (status/title/lang/type/slug/date/coverImage/tags).
Deterministic by design: no LLM output reaches production through this path.

Pipeline: validate -> copy assets -> write post file -> check-assets ->
git commit -> docker build -> compose up -> write status/url back to the note.
--dry-run stops after validation and prints the plan.
"""
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from datetime import date

VAULT = os.environ.get("OBSIDIAN_VAULT_PATH", "/srv/obsidian/vaults/Themis 2.0")
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOMELAB = os.path.expanduser("~/homelab")
SITE = "https://tomazvi.la"
DEFAULT_LOCALE = "lt"  # keep in sync with next-i18next.config.js


def die(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def run(cmd, cwd):
    print(f"+ {' '.join(cmd)}  (cwd={cwd})")
    proc = subprocess.run(cmd, cwd=cwd)
    if proc.returncode != 0:
        die(f"command failed ({proc.returncode}): {' '.join(cmd)}")


def parse_note(path):
    text = open(path, encoding="utf-8").read()
    if not text.startswith("---"):
        die(f"{path}: no frontmatter")
    end = text.find("\n---", 3)
    if end == -1:
        die(f"{path}: unterminated frontmatter")
    fm, body = {}, text[end + 4:].lstrip("\n")
    for line in text[3:end].splitlines():
        if ":" not in line or line.startswith((" ", "\t", "#")):
            continue
        key, _, value = line.partition(":")
        fm[key.strip()] = value.strip().strip("'\"")
    return fm, body, text[: end + 4]


def slugify(title):
    trans = str.maketrans("ąčęėįšųūžĄČĘĖĮŠŲŪŽ", "aceeisuuzACEEISUUZ")
    s = unicodedata.normalize("NFKD", title.translate(trans))
    s = s.encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or die(f"cannot derive slug from title {title!r}")


def main():
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry = "--dry-run" in sys.argv
    if len(args) != 1:
        die("usage: publish-from-vault.py <note-path-or-title> [--dry-run]")

    # --- resolve note ---
    blog_dir = os.path.join(VAULT, "Blog")
    note = args[0]
    if not os.path.isfile(note):
        candidate = os.path.join(blog_dir, note if note.endswith(".md") else note + ".md")
        if not os.path.isfile(candidate):
            die(f"note not found: {note} (also tried {candidate})")
        note = candidate
    note = os.path.abspath(note)

    fm, body, _ = parse_note(note)

    # --- validate ---
    errors = []
    if fm.get("status") != "approved":
        errors.append(f"status is {fm.get('status')!r}, must be 'approved'")
    title = fm.get("title")
    if not title:
        errors.append("missing title")
    lang = fm.get("lang")
    if lang not in ("en", "lt"):
        errors.append(f"lang is {lang!r}, must be en|lt")
    ptype = fm.get("type", "posts")
    if ptype not in ("posts", "shitposts"):
        errors.append(f"type is {ptype!r}, must be posts|shitposts")
    dirty = subprocess.run(["git", "status", "--porcelain"], cwd=REPO,
                           capture_output=True, text=True).stdout.strip()
    if dirty:
        errors.append(f"git working tree in {REPO} is not clean:\n{dirty}")
    if errors:
        for e in errors:
            print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    slug = fm.get("slug") or slugify(title)
    pub_date = (fm.get("date") or "")[:10] or date.today().isoformat()
    post_rel = f"_posts/{ptype}/{lang}/{pub_date}-{slug}.md"
    post_path = os.path.join(REPO, post_rel)
    if os.path.exists(post_path):
        die(f"target already exists: {post_rel}")
    asset_dir_rel = f"assets/blog/{slug}"
    asset_dir = os.path.join(REPO, "public", asset_dir_rel)

    # --- collect assets (body images + coverImage), rewrite refs ---
    copies = []  # (src_abs, dst_basename)

    def resolve_asset(ref):
        if ref.startswith(("http://", "https://")):
            return ref
        if ref.startswith("/assets/"):
            if not os.path.exists(os.path.join(REPO, "public", ref.lstrip("/"))):
                die(f"referenced repo asset missing: {ref}")
            return ref
        src = os.path.normpath(os.path.join(os.path.dirname(note), ref))
        if not os.path.isfile(src):
            die(f"image not found in vault: {ref} (resolved {src})")
        base = os.path.basename(src)
        copies.append((src, base))
        return f"/{asset_dir_rel}/{base}"

    body = re.sub(r"(!\[[^\]]*\]\()([^)]+)(\))",
                  lambda m: m.group(1) + resolve_asset(m.group(2)) + m.group(3), body)
    if re.search(r"!\[\[", body):
        die("body contains ![[wikilink]] image embeds; use ![alt](assets/<slug>/file.png)")
    cover = fm.get("coverImage")
    cover_ref = resolve_asset(cover) if cover else None

    # --- repo frontmatter ---
    out_fm = ["---", f"title: '{title.replace(chr(39), chr(39)*2)}'"]
    if cover_ref:
        out_fm.append(f"coverImage: '{cover_ref}'")
    out_fm.append(f"date: '{pub_date}T00:00:00.000Z'")
    tags = re.findall(r"[\w-]+", fm.get("tags", "")) if ptype == "shitposts" else []
    if tags:
        out_fm.append("tags:\n" + "\n".join(f"  - {t}" for t in tags))
    out_fm.append("---\n")
    post_text = "\n".join(out_fm) + "\n" + body.rstrip() + "\n"

    url_path = ("" if lang == DEFAULT_LOCALE else f"/{lang}") + \
               ("/posts/" if ptype == "posts" else "/shits/") + slug
    url = SITE + url_path

    # --- plan ---
    print(f"note:    {note}")
    print(f"post:    {post_rel}")
    for src, base in copies:
        print(f"asset:   {src} -> public/{asset_dir_rel}/{base}")
    print(f"url:     {url}")
    if dry:
        print("dry run: no files written, nothing deployed.")
        return

    # --- execute ---
    os.makedirs(asset_dir, exist_ok=True)
    for src, base in copies:
        shutil.copy2(src, os.path.join(asset_dir, base))
    os.makedirs(os.path.dirname(post_path), exist_ok=True)
    with open(post_path, "w", encoding="utf-8") as f:
        f.write(post_text)

    run(["node", "scripts/check-assets.js"], cwd=REPO)
    run(["git", "add", post_rel] + ([f"public/{asset_dir_rel}"] if copies else []), cwd=REPO)
    run(["git", "commit", "-m", f"Publish {slug}"], cwd=REPO)
    run(["docker", "build", "-t", "tomazvila-blog:latest", "."], cwd=REPO)
    run(["docker", "compose", "up", "-d", "blog"], cwd=HOMELAB)

    # --- write back to the vault note ---
    text = open(note, encoding="utf-8").read()
    text = re.sub(r"^status:.*$", "status: published", text, count=1, flags=re.M)
    if re.search(r"^url:", text, flags=re.M):
        text = re.sub(r"^url:.*$", f"url: {url}", text, count=1, flags=re.M)
    else:
        text = text.replace("\n---", f"\nurl: {url}\n---", 1)
    if not re.search(r"^date:.*\S", text, flags=re.M):
        text = re.sub(r"^date:.*$", f"date: {pub_date}", text, count=1, flags=re.M)
    with open(note, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"published: {url}")


if __name__ == "__main__":
    main()
