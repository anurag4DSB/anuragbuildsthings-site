#!/bin/sh
# Post-render: keep the revision pack unlisted. The pages carry noindex and are out of the navbar,
# the listing and search; this removes them from sitemap.xml and llms.txt and deletes their
# machine-readable copies. Runs after every `quarto render`.
out="${QUARTO_PROJECT_OUTPUT_DIR:-_site}"
command -v perl >/dev/null 2>&1 || exit 0
if [ -f "$out/sitemap.xml" ]; then
  perl -0pi -e 's#\s*<url>\s*<loc>[^<]*/revision/[^<]*</loc>.*?</url>##gs' "$out/sitemap.xml"
fi
if [ -f "$out/llms.txt" ]; then
  perl -ni -e 'print unless m#/revision/#' "$out/llms.txt"
fi
rm -f "$out"/revision/*.llms.md
