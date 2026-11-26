#!/usr/bin/env python3
"""Migrate published Quarto .qmd posts (plus rendered cell outputs & figures) into Astro content collection."""

import json
import os
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path
import yaml

SCRATCH = Path("/home/beomdo/.gemini/antigravity-cli/brain/cd76792e-dc37-465b-a795-f1e001a40f34/scratch")
QUARTO_MAIN = SCRATCH / "quarto-main"
QUARTO_GHP = SCRATCH / "quarto-gh-pages"
SITE_ROOT = Path("/home/beomdo/박범도/양자연구/beomdo-site")
OUT_BLOG = SITE_ROOT / "src" / "content" / "blog"
OUT_ASSETS = SITE_ROOT / "public" / "blog-assets"

OUT_BLOG.mkdir(parents=True, exist_ok=True)
OUT_ASSETS.mkdir(parents=True, exist_ok=True)


def extract_rendered_cells(html_path: Path):
    """Extract ordered cell outputs (stdout text and figure image basenames) from Quarto rendered HTML."""
    if not html_path.exists():
        return []
    html = html_path.read_text(encoding="utf-8", errors="ignore")
    # Split by quarto code cell containers
    # Quarto wraps each python chunk in <div id="cell-..." class="cell" ...> ... </div>
    # Simpler & reliable: find each <div ... class="cell" ...> block using tag depth tracking
    cells = []
    pos = 0
    pattern = re.compile(r'<div\b[^>]*class="[^"]*\bcell\b[^"]*"[^>]*>', re.I)
    while True:
        m = pattern.search(html, pos)
        if not m:
            break
        start = m.start()
        depth = 0
        i = start
        tag_re = re.compile(r'</?div\b[^>]*>', re.I)
        end = len(html)
        for tm in tag_re.finditer(html, start):
            tok = tm.group(0)
            if tok.startswith("</"):
                depth -= 1
                if depth == 0:
                    end = tm.end()
                    break
            else:
                depth += 1
        block = html[start:end]
        pos = end

        # Extract cell label/id
        id_m = re.search(r'id="cell-([^"]+)"', block)
        label = id_m.group(1) if id_m else ""

        # Extract output stdout (<div class="cell-output cell-output-stdout"><pre><code>...</code></pre>)
        stdouts = []
        for om in re.finditer(
            r'<div[^>]*class="[^"]*cell-output-stdout[^"]*"[^>]*>.*?<pre[^>]*><code>(.*?)</code></pre>',
            block,
            re.S | re.I,
        ):
            txt = re.sub(r"<[^>]+>", "", om.group(1))
            txt = (
                txt.replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&")
                .replace("&quot;", '"')
                .strip()
            )
            if txt:
                stdouts.append(txt)

        # Extract rendered plot images inside cell-output-display
        imgs = []
        for im in re.finditer(r'<img\b[^>]*src="([^"]+)"[^>]*>', block, re.I):
            src = im.group(1)
            if "figure-html/" in src or src.endswith((".png", ".jpg", ".jpeg", ".svg", ".webp")):
                imgs.append(src)

        # Extract simple dataframe HTML tables inside cell-output-display
        tables = []
        for tm in re.finditer(r'<table\b[^>]*class="dataframe[^"]*"[^>]*>.*?</table>', block, re.S | re.I):
            tables.append(tm.group(0))

        cells.append({"label": label, "stdouts": stdouts, "imgs": imgs, "tables": tables})
    return cells


def copy_post_assets(slug: str):
    """Copy all static images and rendered figure-html outputs for a post into public/blog-assets/<slug>/."""
    dest = OUT_ASSETS / slug
    dest.mkdir(parents=True, exist_ok=True)
    copied = {}

    # 1. Static files from quarto-main/posts/<slug>
    src_main = QUARTO_MAIN / "posts" / slug
    for p in src_main.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}:
            rel = p.relative_to(src_main).as_posix()
            target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, target)
            copied[rel] = f"/blog-assets/{slug}/{rel}"

    # 2. Rendered figure-html files from quarto-gh-pages/posts/<slug>
    src_ghp = QUARTO_GHP / "posts" / slug
    if src_ghp.exists():
        for p in src_ghp.rglob("*"):
            if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}:
                rel = p.relative_to(src_ghp).as_posix()
                target = dest / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(p, target)
                copied[rel] = f"/blog-assets/{slug}/{rel}"

    return copied


def convert_callouts(md: str) -> str:
    """Convert Quarto ::: {.callout-xxx title="..."} ... ::: blocks into clean HTML <aside> blocks."""
    pattern = re.compile(
        r'^:::\s*\{\.callout-([a-zA-Z]+)(?:\s+title="([^"]*)")?[^}]*\}\s*\n(.*?)\n:::\s*$',
        re.M | re.S,
    )

    def repl(m):
        kind = m.group(1).lower()
        title = m.group(2) or kind.capitalize()
        body = m.group(3).strip()
        # Keep markdown inside callout by using blank lines so Astro/remark parses markdown inside <aside>
        return f'\n<aside class="callout callout-{kind}">\n<div class="callout-title">{title}</div>\n\n{body}\n\n</aside>\n'

    # Apply repeatedly for any nested/sequential callouts
    prev = None
    while prev != md:
        prev = md
        md = pattern.sub(repl, md)
    return md


def convert_post(qmd_path: Path):
    slug = qmd_path.parent.name
    raw = qmd_path.read_text(encoding="utf-8")

    # Split frontmatter
    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", raw, re.S)
    if not fm_match:
        print(f"SKIP (no frontmatter): {slug}")
        return
    fm = yaml.safe_load(fm_match.group(1)) or {}
    body = fm_match.group(2)

    if fm.get("draft", False) is True:
        print(f"SKIP (draft): {slug}")
        return

    copied_assets = copy_post_assets(slug)
    rendered_cells = extract_rendered_cells(QUARTO_GHP / "posts" / slug / "index.html")

    # Series detection
    series = None
    series_order = None
    m_roqet = re.match(r"project-roqet-(\d+)-", slug)
    m_abc = re.match(r"project-abc-(\d+)-", slug)
    if m_roqet:
        series = "ROQET"
        series_order = int(m_roqet.group(1))
    elif m_abc:
        series = "ABC-2025"
        series_order = int(m_abc.group(1))

    # Build clean Astro frontmatter
    out_fm = {
        "title": str(fm.get("title", slug)),
        "description": str(fm.get("description", "")),
        "pubDate": str(fm.get("date", "2025-01-01")).strip().strip('"'),
        "author": str(fm.get("author", "Beomdo Park")),
        "categories": list(fm.get("categories", []) or []),
        "tags": list(fm.get("tags", []) or []),
        "lang": "ko",
        "legacySlug": slug,
        "draft": False,
    }
    if series:
        out_fm["series"] = series
        out_fm["seriesOrder"] = series_order
    if fm.get("image"):
        img_rel = str(fm["image"]).lstrip("./")
        if img_rel in copied_assets:
            out_fm["heroImage"] = copied_assets[img_rel]

    # Convert executable ```{python} blocks and inject rendered outputs/figures
    cell_idx = 0

    def repl_code_chunk(m):
        nonlocal cell_idx
        lang = m.group(1).strip()
        code = m.group(2)
        lines = code.splitlines()

        echo = True
        label = ""
        code_lines = []
        for ln in lines:
            if ln.startswith("#|"):
                opt = ln[2:].strip()
                if opt.startswith("echo:") and "false" in opt.lower():
                    echo = False
                elif opt.startswith("label:"):
                    label = opt.split(":", 1)[1].strip()
            else:
                code_lines.append(ln)

        # Match rendered cell
        matched_cell = None
        if label:
            for c in rendered_cells:
                if c["label"] == label:
                    matched_cell = c
                    break
        if matched_cell is None and cell_idx < len(rendered_cells):
            matched_cell = rendered_cells[cell_idx]
        cell_idx += 1

        parts = []
        clean_code = "\n".join(code_lines).strip("\n")
        if echo and clean_code:
            parts.append(f"```{lang}\n{clean_code}\n```")

        if matched_cell:
            # Attach generated plots
            for img_src in matched_cell["imgs"]:
                rel = img_src.lstrip("./")
                asset_url = copied_assets.get(rel, f"/blog-assets/{slug}/{rel}")
                parts.append(f"\n![Execution output plot]({asset_url})\n")

            # Attach dataframe tables if present (keep compact)
            for tbl in matched_cell["tables"]:
                parts.append(f'\n<div class="code-output-table">\n{tbl}\n</div>\n')

            # Attach stdout text output (truncate extreme verbosity > 40 lines cleanly)
            for out_txt in matched_cell["stdouts"]:
                out_lines = out_txt.splitlines()
                if len(out_lines) > 45:
                    out_txt = "\n".join(out_lines[:40]) + f"\n... ({len(out_lines) - 40} more lines)"
                parts.append(f"```text\n{out_txt}\n```")

        return "\n\n".join(parts)

    body = re.sub(r"```\{([a-zA-Z0-9_+-]+)[^}]*\}\n(.*?)```", repl_code_chunk, body, flags=re.S)

    # Convert Quarto callouts
    body = convert_callouts(body)

    # Strip Pandoc image attributes e.g. ![alt](figs/a.png){#fig-a width=85%} -> ![alt](/blog-assets/<slug>/figs/a.png)
    def repl_img(m):
        alt = m.group(1)
        src = m.group(2).strip()
        if not src.startswith(("http://", "https://", "/")):
            rel = src.lstrip("./")
            src = copied_assets.get(rel, f"/blog-assets/{slug}/{rel}")
        return f"![{alt}]({src})"

    body = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]*\})?", repl_img, body)

    # Rewrite internal /posts/<slug>/ links to /blog/<slug>/
    body = re.sub(r"\]\(/posts/([^/)]+)/?(?:index\.html)?\)", r"](/blog/\1/)", body)

    # Remove Pandoc heading attributes {#sec-foo .unnumbered}
    body = re.sub(r"^(#{1,6}\s+[^\n]+?)\s*\{[^}]+\}\s*$", r"\1", body, flags=re.M)

    # Remove stray Quarto fenced divs like ::: {.column-page} or bare :::
    body = re.sub(r"^:::\s*\{[^}]*\}\s*$", "", body, flags=re.M)
    body = re.sub(r"^:::\s*$", "", body, flags=re.M)

    # Ensure KaTeX display math blocks have clean spacing
    fm_yaml = yaml.safe_dump(out_fm, allow_unicode=True, sort_keys=False).strip()
    out_md = f"---\n{fm_yaml}\n---\n\n{body.strip()}\n"
    out_path = OUT_BLOG / f"{slug}.md"
    out_path.write_text(out_md, encoding="utf-8")
    print(f"MIGRATED: {slug} -> {out_path.name} (assets={len(copied_assets)}, cells={cell_idx}/{len(rendered_cells)})")


def main():
    qmds = sorted((QUARTO_MAIN / "posts").glob("*/index.qmd"))
    for q in qmds:
        convert_post(q)
    print(f"TOTAL MIGRATED: {len(list(OUT_BLOG.glob('*.md')))}")


if __name__ == "__main__":
    main()
