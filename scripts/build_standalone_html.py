# -*- coding: utf-8 -*-
"""
Build standalone self-contained HTML builds of QChinese:
  - QChinese.html  (double-click standalone HTML app, auto-connects to 24/7 Vercel + Supabase Cloud)
  - index.html     (GitHub Pages direct entry HTML, no redirect delay, auto-connects to 24/7 Cloud)
"""
import re
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"


def safe_inline_script(js_text: str) -> str:
    # Escape closing </script tags inside JS strings so the HTML parser never terminates early
    return re.sub(r"</(script)", r"<\/\1", js_text, flags=re.I)


def build_html() -> str:
    src_html = (PUBLIC / "index.html").read_text(encoding="utf-8")

    # Inline favicon.svg as data URI
    fav_path = PUBLIC / "favicon.svg"
    if fav_path.exists():
        svg_raw = fav_path.read_text(encoding="utf-8").strip()
        data_uri = "data:image/svg+xml," + urllib.parse.quote(svg_raw)
        src_html = src_html.replace('href="favicon.svg"', f'href="{data_uri}"')

    # Inline CSS stylesheet
    css_path = PUBLIC / "css" / "styles.css"
    css_text = css_path.read_text(encoding="utf-8")
    src_html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="css/styles\.css"\s*/?>',
        lambda _: f"<style>\n{css_text}\n</style>",
        src_html,
    )

    # Inline all local <script src="..."> tags
    def _replace_script(m: re.Match) -> str:
        rel = m.group(1).strip()
        if rel.startswith("http://") or rel.startswith("https://"):
            return m.group(0)
        target = PUBLIC / rel
        if not target.exists():
            raise FileNotFoundError(f"Missing script referenced in public/index.html: {target}")
        js_code = safe_inline_script(target.read_text(encoding="utf-8"))
        return f"<script data-bundle=\"{rel}\">\n{js_code}\n</script>"

    bundled = re.sub(r'<script\s+src="([^"]+)"></script>', _replace_script, src_html)
    return bundled


def main() -> None:
    html = build_html()
    targets = [
        ROOT / "QChinese.html",
        ROOT / "index.html",
        PUBLIC / "QChinese.html",
        PUBLIC / "public" / "index.html",
        PUBLIC / "public" / "QChinese.html",
    ]
    for out_path in targets:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(html, encoding="utf-8")
        rel = out_path.relative_to(ROOT)
        print(f"Wrote {rel}: {len(html):,} chars ({out_path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
