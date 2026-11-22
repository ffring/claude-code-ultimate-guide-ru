---
name: git-worktree-clean
description: "Очистите устаревшие рабочие деревья git с помощью функции обнаружения объединенных ветвей и отчета об использовании диска."
argument-hint: "[--dry-run]"
effort: low
when_to_use: "Use when cleaning up merged or stale worktrees."
disable-model-invocation: true
---

# Очистка рабочего дерева Git

Пакетная очистка устаревших рабочих деревьев git. Безопасно удаляет объединенные ветки, сообщает об использовании диска и интерактивно обрабатывает неслитые ветки.

**Основной принцип:** Автоматическая очистка объединенных рабочих деревьев, интерактивный просмотр неслитых данных, всегда сообщать о том, что было возвращено.

**Часть:** [Worktree Lifecycle Suite](../../commands/git-worktree.md) | [`/git-worktree`](../../commands/git-worktree.md) | [`/git-worktree-status`](../../commands/git-worktree-status.md) | [`/git-worktree-remove`](../../commands/git-worktree-remove.md)

## Процесс

1. **Перечислить все рабочие деревья**: `git worktree list`
2. **Классифицировать каждый**: объединенные, несвязанные и защищенные
3. **Расчет использования диска**: Размер каждого рабочего дерева
4. **Автоматический режим**: удалить все объединенные рабочие деревья (безопасно)
5. **Интерактивный режим**: просмотр несвязанных рабочих деревьев одно за другим.
6. **Напоминание об очистке базы данных**: список ветвей БД, которые необходимо очистить
7. **Report**: сводка предпринятых действий и освобожденного пространства.

## Флаги

| Флаг | Эффект |
|------|--------|
| `--dry-run` | Предварительный просмотр того, что будет очищено, без изменений |
| `--all` | Включить несвязанные рабочие деревья (интерактивное подтверждение каждого) |
| `--force` | Удалить все рабочие деревья без подтверждения (опасно) |

## Открытие рабочего дерева

```bash
# Get main branch name
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
MAIN_BRANCH=${MAIN_BRANCH:-main}

# Protected branches (never auto-clean)
PROTECTED="main master develop staging production"

# List all worktrees (skip main working tree)
git worktree list --porcelain | while read line; do
  # Parse worktree path and branch
  # Skip the main worktree (first entry)
done
```

## Классификация

```bash
for WORKTREE in $WORKTREES; do
  BRANCH=$(git -C "$WORKTREE" rev-parse --abbrev-ref HEAD)

  # Skip protected
  if echo "$PROTECTED" | grep -qw "$BRANCH"; then
    echo "PROTECTED: $BRANCH (skipped)"
    continue
  fi

  # Check merge status
  if git merge-base --is-ancestor "$BRANCH" "$MAIN_BRANCH" 2>/dev/null; then
    echo "MERGED: $BRANCH → safe to remove"
    MERGED_LIST="$MERGED_LIST $WORKTREE"
  else
    echo "UNMERGED: $BRANCH → requires review"
    UNMERGED_LIST="$UNMERGED_LIST $WORKTREE"
  fi
done
```

## Расчет использования диска

```bash
for WORKTREE in $ALL_WORKTREES; do
  # Calculate size excluding symlinked node_modules
  SIZE=$(du -sh --exclude='node_modules' "$WORKTREE" 2>/dev/null | cut -f1)
  # Or on macOS:
  SIZE=$(du -sh -I 'node_modules' "$WORKTREE" 2>/dev/null | cut -f1)
  echo "  $WORKTREE: $SIZE"
done
```

## Режим пробного запуска

```bash
# --dry-run: show what would happen without making changes

echo "=== Dry Run ==="
echo ""
echo "Would remove (merged):"
for WT in $MERGED_LIST; do
  echo "  $WT ($BRANCH) - $SIZE"
done
echo ""
echo "Would ask about (unmerged):"
for WT in $UNMERGED_LIST; do
  echo "  $WT ($BRANCH) - $SIZE - last commit: $(git log -1 --format='%s' $BRANCH)"
done
echo ""
echo "Total space to reclaim: $TOTAL_SIZE"
echo ""
echo "Run without --dry-run to execute."
```

## Автоматический режим (по умолчанию)

**Only удаляет объединенные рабочие деревья. Безопасно по умолчанию.**

```bash
echo "Cleaning merged worktrees..."

for WORKTREE in $MERGED_LIST; do
  BRANCH=$(git -C "$WORKTREE" rev-parse --abbrev-ref HEAD)

  # Remove worktree
  git worktree remove "$WORKTREE"

  # Delete local branch
  git branch -d "$BRANCH" 2>/dev/null

  # Delete remote branch
  git push origin --delete "$BRANCH" 2>/dev/null

  echo "  Removed: $WORKTREE ($BRANCH)"
done

# Report unmerged (not touched)
if [ -n "$UNMERGED_LIST" ]; then
  echo ""
  echo "Unmerged worktrees (kept):"
  for WT in $UNMERGED_LIST; do
    echo "  $WT - use /git-worktree-remove or --all to review"
  done
fi
```

## Интерактивный режим (--все)

**Просматривает несвязанные рабочие деревья одно за другим:**

```bash
for WORKTREE in $UNMERGED_LIST; do
  BRANCH=$(git -C "$WORKTREE" rev-parse --abbrev-ref HEAD)
  LAST_COMMIT=$(git log -1 --format='%h %s (%cr)' "$BRANCH")
  AHEAD=$(git rev-list --count "$MAIN_BRANCH".."$BRANCH")

  echo ""
  echo "Unmerged: $WORKTREE"
  echo "  Branch: $BRANCH ($AHEAD commits ahead of $MAIN_BRANCH)"
  echo "  Last commit: $LAST_COMMIT"
  echo "  Size: $SIZE"
  echo ""
  echo "  [r]emove  [k]eep  [s]kip remaining"

  # Wait for user decision per worktree
done
```

## Формат отчета

**После очистки:**

```
=== Worktree Cleanup Report ===

Removed (merged):
  .worktrees/feat/auth (feat/auth) - 2.3 MB
  .worktrees/fix/login-bug (fix/login-bug) - 1.1 MB
  .worktrees/chore/deps-update (chore/deps-update) - 0.8 MB

Kept (unmerged):
  .worktrees/feat/experimental (feat/experimental) - 4.2 MB
    Last commit: a1b2c3d "WIP: new auth flow" (3 days ago)

Kept (protected):
  .worktrees/develop (develop)

Space reclaimed: 4.2 MB
Worktrees remaining: 2
References pruned: yes

DB branches to clean:
  neonctl branches delete feat-auth
  neonctl branches delete fix-login-bug
  neonctl branches delete chore-deps-update
```

**Отчет о пробном запуске:**

```
=== Dry Run - No Changes Made ===

Would remove (3 merged):
  .worktrees/feat/auth - 2.3 MB
  .worktrees/fix/login-bug - 1.1 MB
  .worktrees/chore/deps-update - 0.8 MB

Would keep (1 unmerged):
  .worktrees/feat/experimental - 4.2 MB

Would keep (1 protected):
  .worktrees/develop

Potential space savings: 4.2 MB
```

## <a name="quick-reference"></a>Шпаргалка

| Ситуация | Действие |
|-----------|--------|
| По умолчанию (без флагов) | Удалить только объединенные рабочие деревья |
| `--dry-run` | Предварительный просмотр без изменений |
| `--all` | Объединено (авто) + объединено (интерактивно) |
| `--force` | Удалить все, кроме защищенного |
| Защищенная ветка | Всегда хранился |
| Объединенная ветка | Auto-removed |
| Необъединенная ветка | Сохраняется (по умолчанию) или интерактивно (--all) |
| Обнаружены ветки БД | Напоминание с точными командами |

## Распространенные ошибки

**Запуск `--force` без `--dry-run` сначала**
- Всегда выполняйте предварительный просмотр с помощью `--dry-run` перед принудительной очисткой.

**Забыть об очистке ветки БД**
- Очистка рабочего дерева не удаляет ветки БД автоматически. Следуйте командам напоминания.

**Очистка не выполняется регулярно**
- Устаревшие рабочие деревья занимают дисковое пространство. Запускайте `/git-worktree-clean --dry-run` еженедельно.

## Использование

```
/git-worktree-clean
/git-worktree-clean --dry-run
/git-worktree-clean --all
```

Флаги: $ARGUMENTS