#!/usr/bin/env bash
# Install these skills and agents into ~/.claude/ for use in every local project.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${HOME}/.claude"

mkdir -p "$DEST/skills" "$DEST/agents"

echo "Installing skills into $DEST/skills ..."
for d in "$SRC"/skills/*/; do
  name=$(basename "$d")
  rm -rf "$DEST/skills/$name"
  cp -r "$d" "$DEST/skills/"
  echo "  + $name"
done

echo "Installing agents into $DEST/agents ..."
count=0
for f in "$SRC"/agents/*.md; do
  cp "$f" "$DEST/agents/"
  count=$((count + 1))
done
echo "  + $count agents"

echo
echo "Done. Restart Claude Code to load them."
