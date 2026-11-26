#!/usr/bin/env python3
"""
Render a Quarto (.qmd) or Jupyter (.ipynb) notebook via local `quarto render`,
then convert its code, stdout outputs, DataFrame tables, plots, math, and callouts
into a clean Astro blog post under `src/content/blog/<slug>.md` + `public/blog-assets/<slug>/`.

Usage:
  pnpm qmd:publish drafts/my-post/index.qmd [--slug custom-slug] [--no-render]
"""

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path
import yaml

SITE_ROOT = Path(__file__).resolve().parent.parent
OUT_BLOG = SITE_ROOT / "src" / "content" / "blog"
OUT_ASSETS = SITE_ROOT / "public" / "blog-assets"


def extract_rendered_cells(html_path: Path):
    if not html_path.exists():
        return []
    html = html_path.read_text(encoding="utf-8", errors="ignore")
    cells = []
    pos = 0
    pattern = re.compile(r'<div\b[^>]*class="[^"]*\bcell\b[^"]*"[^>]*>', re.I)
    tag_re = re.compile(r"</?div\b[^>]*>", re.I)
    while True:
        m = pattern.search(html, pos)
        if not m:
            break
        start = m.start()
        depth = 0
        end = len(html)
        for tm in tag_re.finditer(html, start):
            if tm.group(0).startswith("</"):
                depth -= 1
                if depth == 0:
                    end = tm.end()
                    break
            else:
                depth += 1
        block = html[start:end]
        pos = end

        id_m = re.search(r'id="cell-([^"]+)"', block)
        label = id_m.group(1) if id_m else ""

        stdouts = []
        for om in re.finditer(
            r'<div[^>]*class="[^"]*cell-output-stdout[^"]*"[^>]*>.*?<pre[^>]*><code>(.*?)</code></pre>',
            block,
            re.S | re.I,
        ):
            txt = re.sub(r"<[^>]+>", "", om.group(1))
            txt = txt.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").replace("&quot;", '"').strip()
            if txt:
                stdouts.append(txt)

        imgs = []
        for im in re.finditer(r'<img\b[^>]*src="([^"]+)"[^>]*>', block, re.I):
            src = im.group(1)
            if "figure-html/" in src or src.endswith((".png", ".jpg", ".jpeg", ".svg", ".webp")):
                imgs.append(src)

        tables = []
        for tm in re.finditer(r'<table\b[^>]*class="dataframe[^"]*"[^>]*>.*?</table>', block, re.S | re.I):
            tables.append(tm.group(0))

        cells.append({"label": label, "stdouts": stdouts, "imgs": imgs, "tables": tables})
    return cells


def convert_callouts(md: str) -> str:
    pattern = re.compile(
        r'^:::\s*\{\.callout-([a-zA-Z]+)(?:\s+title="([^"]*)")?[^}]*\}\s*\n(.*?)\n:::\s*$',
        re.M | re.S,
    )

    def repl(m):
        kind = m.group(1).upper()
        title = m.group(2) or kind.capitalize()
        body_lines = m.group(3).strip().splitlines()
        quoted = "\n".join(f"> {ln}" if ln.strip() else ">" for ln in body_lines)
        return f"\n> [!{kind}] {title}\n{quoted}\n"

    prev = None
    while prev != md:
        prev = md
        md = pattern.sub(repl, md)
    return md


def main():
    parser = argparse.ArgumentParser(description="Render Quarto .qmd and publish to Astro blog.")
    parser.add_argument("source", help="Path to .qmd file (e.g. drafts/my-post/index.qmd)")
    parser.add_argument("--slug", help="Override output slug (defaults to parent dir name or file stem)")
    parser.add_argument("--no-render", action="store_true", help="Skip running `quarto render` (use existing HTML)")
    args = parser.parse_args()

    src_path = Path(args.source).resolve()
    if not src_path.exists():
        print(f"Error: file not found: {src_path}", file=sys.stderr)
        sys.exit(1)

    slug = args.slug or (src_path.parent.name if src_path.stem == "index" else src_path.stem)
    slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")

    html_path = src_path.with_suffix(".html")
    if not args.no_render:
        quarto = shutil.which("quarto")
        if not quarto:
            print("Error: `quarto` binary not found in PATH.", file=sys.stderr)
            sys.exit(1)
        print(f"Rendering with Quarto: {src_path.name} ...")
        subprocess.run([quarto, "render", str(src_path), "--to", "html"], check=True)

    raw = src_path.read_text(encoding="utf-8")
    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", raw, re.S)
    if not fm_match:
        print("Error: missing YAML frontmatter in .qmd file.", file=sys.stderr)
        sys.exit(1)

    fm = yaml.safe_load(fm_match.group(1)) or {}
    body = fm_match.group(2)

    # Copy all images in source directory (static figs/ + generated *_files/figure-html/)
    dest_assets = OUT_ASSETS / slug
    dest_assets.mkdir(parents=True, exist_ok=True)
    copied = {}
    for p in src_path.parent.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}:
            if "site_libs" in p.parts:
                continue
            rel = p.relative_to(src_path.parent).as_posix()
            target = dest_assets / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, target)
            copied[rel] = f"/blog-assets/{slug}/{rel}"

    rendered_cells = extract_rendered_cells(html_path)
    cell_idx = 0

    def repl_chunk(m):
        nonlocal cell_idx
        lang = m.group(1).strip()
        code = m.group(2)
        echo = True
        label = ""
        code_lines = []
        for ln in code.splitlines():
            if ln.startswith("#|"):
                opt = ln[2:].strip()
                if opt.startswith("echo:") and "false" in opt.lower():
                    echo = False
                elif opt.startswith("label:"):
                    label = opt.split(":", 1)[1].strip()
            else:
                code_lines.append(ln)

        matched = None
        if label:
            for c in rendered_cells:
                if c["label"] == label:
                    matched = c
                    break
        if matched is None and cell_idx < len(rendered_cells):
            matched = rendered_cells[cell_idx]
        cell_idx += 1

        parts = []
        clean_code = "\n".join(code_lines).strip("\n")
        if echo and clean_code:
            parts.append(f"```{lang}\n{clean_code}\n```")
        if matched:
            for img_src in matched["imgs"]:
                rel = img_src.lstrip("./")
                parts.append(f"\n![Execution plot]({copied.get(rel, f'/blog-assets/{slug}/{rel}')})\n")
            for tbl in matched["tables"]:
                parts.append(f'\n<div class="code-output-table">\n{tbl}\n</div>\n')
            for out_txt in matched["stdouts"]:
                parts.append(f"```text\n{out_txt}\n```")
        return "\n\n".join(parts)

    body = re.sub(r"```\{([a-zA-Z0-9_+-]+)[^}]*\}\n(.*?)```", repl_chunk, body, flags=re.S)
    body = convert_callouts(body)

    def repl_img(m):
        alt, src = m.group(1), m.group(2).strip()
        if not src.startswith(("http://", "https://", "/")):
            rel = src.lstrip("./")
            src = copied.get(rel, f"/blog-assets/{slug}/{rel}")
        return f"![{alt}]({src})"

    body = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]*\})?", repl_img, body)
    body = re.sub(r"\]\(/posts/([^/)]+)/?(?:index\.html)?\)", r"](/blog/\1/)", body)
    body = re.sub(r"^(#{1,6}\s+[^\n]+?)\s*\{[^}]+\}\s*$", r"\1", body, flags=re.M)
    body = re.sub(r"^:::\s*(?:\{[^}]*\})?\s*$", "", body, flags=re.M)

    out_fm = {
        "title": str(fm.get("title", slug)),
        "description": str(fm.get("description", "")),
        "pubDate": str(fm.get("date", fm.get("pubDate", "2026-01-01"))).strip().strip('"'),
        "author": str(fm.get("author", "Beomdo Park")),
        "categories": list(fm.get("categories", []) or []),
        "tags": list(fm.get("tags", []) or []),
        "lang": str(fm.get("lang", "ko")),
        "draft": bool(fm.get("draft", False)),
    }
    if fm.get("series"):
        out_fm["series"] = str(fm["series"])
    if fm.get("seriesOrder"):
        out_fm["seriesOrder"] = int(fm["seriesOrder"])
    if fm.get("image"):
        rel = str(fm["image"]).lstrip("./")
        if rel in copied:
            out_fm["heroImage"] = copied[rel]

    OUT_BLOG.mkdir(parents=True, exist_ok=True)
    out_md = OUT_BLOG / f"{slug}.md"
    fm_yaml = yaml.safe_dump(out_fm, allow_unicode=True, sort_keys=False).strip()
    out_md.write_text(f"---\n{fm_yaml}\n---\n\n{body.strip()}\n", encoding="utf-8")

    print(f"Published -> {out_md.relative_to(SITE_ROOT)} (assets={len(copied)}, cells={cell_idx}/{len(rendered_cells)})")
    print(f"Next: git add src/content/blog/{slug}.md public/blog-assets/{slug} && git commit -m 'post: {slug}' && git push")


if __name__ == "__main__":
    main()
