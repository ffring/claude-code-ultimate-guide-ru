---
model: haiku
description: "Автоматически удалять все объединенные рабочие деревья (безопасно, подтверждение не требуется)"
---

# Очистка рабочих деревьев (автоматически)

Удалите все рабочие деревья для ветвей, уже объединенных в `main`. Никаких интерактивных подсказок.

**Разница с `/remove-worktree`**:
- `/remove-worktree <branch>`: Целевое удаление, запрашивает подтверждение для несвязанных ветвей.
- `/clean-worktrees`: Пакетное удаление только объединенных ветвей, полностью автоматическое.

## Использование

```bash
/clean-worktrees              # Remove all merged worktrees
/clean-worktrees --dry-run    # Preview without deleting
```

## Выполнение

Выполните этот скрипт:

```bash
#!/bin/bash
set -euo pipefail

DRY_RUN=false
if [[ "${ARGUMENTS:-}" == *"--dry-run"* ]]; then
  DRY_RUN=true
fi

echo "🧹 Cleaning Merged Worktrees"
echo "============================="
echo ""

# Resolve repo root
GIT_COMMON_DIR="$(git rev-parse --git-common-dir 2>/dev/null)"
REPO_ROOT="$(cd "$GIT_COMMON_DIR/.." && pwd)"

# Step 1: Prune stale git references
echo "1️⃣  Pruning stale references..."
PRUNED=$(git worktree prune -v 2>&1 || true)
if [ -n "$PRUNED" ]; then
  echo "$PRUNED"
  echo "✅ Stale references pruned"
else
  echo "✅ No stale references"
fi
echo ""

# Step 2: Find merged worktrees
echo "2️⃣  Finding merged worktrees..."
MERGED_ITEMS=()

while IFS= read -r line; do
  WT_PATH=$(echo "$line" | awk '{print $1}')
  WT_BRANCH=$(echo "$line" | grep -oE '\[.*\]' | tr -d '[]' || true)

  [ -z "$WT_BRANCH" ] && continue
  [ "$WT_BRANCH" = "main" ] && continue
  [ "$WT_BRANCH" = "develop" ] && continue
  [ "$WT_PATH" = "$REPO_ROOT" ] && continue

  if git branch --merged main 2>/dev/null | grep -q "^[* ] ${WT_BRANCH}$"; then
    MERGED_ITEMS+=("$WT_BRANCH|$WT_PATH")
    echo "  ✓ $WT_BRANCH (merged into main)"
  fi
done < <(git worktree list)

if [ ${#MERGED_ITEMS[@]} -eq 0 ]; then
  echo "✅ No merged worktrees to clean"
  echo ""
  echo "📊 Active worktrees:"
  git worktree list
  exit 0
fi

echo ""
echo "📋 Found ${#MERGED_ITEMS[@]} merged worktree(s)"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "🔍 DRY RUN — nothing will be deleted"
  echo ""
  echo "Would remove:"
  for item in "${MERGED_ITEMS[@]}"; do
    branch=$(echo "$item" | cut -d'|' -f1)
    path=$(echo "$item" | cut -d'|' -f2)
    echo "  - $branch"
    echo "    $path"
  done
  echo ""
  echo "Run without --dry-run to delete."
  exit 0
fi

# Step 3: Remove merged worktrees
echo "3️⃣  Removing..."
REMOVED=0

for item in "${MERGED_ITEMS[@]}"; do
  branch=$(echo "$item" | cut -d'|' -f1)
  path=$(echo "$item" | cut -d'|' -f2)

  echo ""
  echo "🗑️  $branch"

  if git worktree remove "$path" 2>/dev/null; then
    echo "   ✅ Worktree removed"
  else
    rm -rf "$path" 2>/dev/null || true
    git worktree prune 2>/dev/null || true
    echo "   ✅ Removed (forced)"
  fi

  if git branch -d "$branch" 2>/dev/null; then
    echo "   ✅ Branch deleted"
  else
    echo "   ⚠️  Branch already gone"
  fi

  REMOVED=$((REMOVED + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done — removed $REMOVED worktree(s)"
echo ""
echo "📊 Remaining:"
git worktree list
```

## Безопасность

- Удаляет только ветки, объединенные в `main`.
- Никогда не касается `main` или `develop`.
- Никогда не удаляет текущий рабочий каталог (основной репозиторий)
- `--dry-run` для предварительного просмотра перед действием

## <a name="when-to-use"></a>Когда использовать

- После слияния PR: `/clean-worktrees`
- Перед созданием нового рабочего дерева (уборкой беспорядка): `/clean-worktrees`
- Еженедельное обслуживание: `/clean-worktrees`
