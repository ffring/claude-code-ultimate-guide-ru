---
name: git-worktree-remove
description: "Безопасное удаление рабочего дерева git с помощью очистки ветвей и проверки безопасности."
argument-hint: <worktree_name>
effort: low
when_to_use: "Use when removing a specific worktree by name."
disable-model-invocation: true
---

# Удаление рабочего дерева Git

Безопасное удаление одного рабочего дерева git с помощью очистки ветвей, проверки слияния и удаления ветвей базы данных.

**Основной принцип:** Сначала проверяется безопасность, затем чистое удаление рабочего дерева + ветки + ресурсов БД.

**Часть:** [Worktree Lifecycle Suite](../../commands/git-worktree.md) | [`/git-worktree`](../../commands/git-worktree.md) | [`/git-worktree-status`](../../commands/git-worktree-status.md) | [`/git-worktree-clean`](../../commands/git-worktree-clean.md)

## Процесс

1. **Validate Target**: Определить рабочее дерево, которое нужно удалить.
2. **Проверка безопасности**: Защитите ветки main/develop
3. **Проверить статус слияния**: Предупреждать, если в ветке есть несвязанные изменения.
4. **Проверить незафиксированные изменения**: Предупреждать, если рабочее дерево находится в грязном состоянии.
5. **Удалить рабочее дерево**: `git worktree remove`
6. **Удалить локальный филиал**: `git branch -d` (или `-D` с подтверждением)
7. **Удалить удаленную ветку**: `git push origin --delete` (с подтверждением)
8. **Напоминание об очистке базы данных**: предложите удалить ветку БД, если это применимо.
9. **Ссылки на чернослив**: `git worktree prune`

## Проверки безопасности

### Защищенные ветки

```bash
# Never remove worktrees for these branches (configurable)
PROTECTED_BRANCHES="main master develop staging production"

if echo "$PROTECTED_BRANCHES" | grep -qw "$BRANCH"; then
  echo "BLOCKED: Cannot remove worktree for protected branch '$BRANCH'"
  echo "Protected branches: $PROTECTED_BRANCHES"
  exit 1
fi
```

### Незафиксированные изменения

```bash
cd "$WORKTREE_PATH"
if [ -n "$(git status --porcelain)" ]; then
  echo "WARNING: Worktree has uncommitted changes:"
  git status --short
  echo ""
  echo "Options:"
  echo "  1. Commit changes first"
  echo "  2. Force remove (--force)"
  echo "  3. Cancel"
  # Wait for user decision
fi
```

### Объединить статус

```bash
# Check if branch is merged into main
MAIN_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')

if git merge-base --is-ancestor "$BRANCH" "$MAIN_BRANCH" 2>/dev/null; then
  echo "Branch '$BRANCH' is merged into $MAIN_BRANCH. Safe to delete."
  MERGED=true
else
  echo "WARNING: Branch '$BRANCH' is NOT merged into $MAIN_BRANCH."
  echo "You may lose work if you delete this branch."
  MERGED=false
fi
```

## Действия по удалению

```bash
# 1. Remove the worktree
git worktree remove "$WORKTREE_PATH"
# If dirty state and user confirmed force:
# git worktree remove --force "$WORKTREE_PATH"

# 2. Delete local branch
if [ "$MERGED" = true ]; then
  git branch -d "$BRANCH"
else
  echo "Delete unmerged branch '$BRANCH'? (requires confirmation)"
  # On confirmation:
  git branch -D "$BRANCH"
fi

# 3. Delete remote branch (with confirmation)
if git ls-remote --heads origin "$BRANCH" | grep -q "$BRANCH"; then
  echo "Delete remote branch 'origin/$BRANCH'?"
  # On confirmation:
  git push origin --delete "$BRANCH"
fi

# 4. Prune stale references
git worktree prune
```

## Очистка ветки базы данных

**После удаления рабочего дерева напомните о связанных ветках базы данных:**

```bash
# Detect database provider (same logic as /git-worktree)
if [ -f ".env" ] && grep -q "neon" ".env"; then
  echo ""
  echo "DB Cleanup: neonctl branches delete $BRANCH_SLUG"
elif [ -f ".pscale.yml" ]; then
  echo ""
  DB_NAME=$(grep 'database:' .pscale.yml | awk '{print $2}')
  echo "DB Cleanup: pscale branch delete $DB_NAME $BRANCH_SLUG"
elif [ -f ".env" ] && grep -q "postgresql" ".env"; then
  echo ""
  echo "DB Cleanup: psql \$DATABASE_URL -c \"DROP SCHEMA ${BRANCH_SLUG} CASCADE;\""
fi
```

## Формат отчета

**Успешное удаление (объединенная ветка):**

```
Removed worktree: .worktrees/feat/auth
  Worktree directory: deleted
  Local branch feat/auth: deleted (was merged)
  Remote branch origin/feat/auth: deleted
  References: pruned

DB reminder: neonctl branches delete feat-auth
```

**Удаление с предупреждениями (необъединенная ветка):**

```
Removed worktree: .worktrees/feat/experimental
  Worktree directory: deleted
  Local branch feat/experimental: deleted (was NOT merged - forced)
  Remote branch: no remote branch found
  References: pruned

WARNING: Branch was not merged. Changes may be lost.
Last commit: a1b2c3d "WIP: experimental auth flow"
```

## Флаги

| Флаг | Эффект |
|------|--------|
| `--force` | Пропустить предупреждение о незафиксированных изменениях |
| `--keep-branch` | Удалить рабочее дерево, но сохранить ветку |
| `--keep-remote` | Не удалять удаленную ветку |

## <a name="quick-reference"></a>Шпаргалка

| Ситуация | Действие |
|-----------|--------|
| Филиал объединен | Безопасное удаление (ветвь -d) |
| Филиал не объединен | Предупреждать + требовать подтверждения (ветвь -D) |
| Незафиксированные изменения | Предупредить + предложить force/cancel |
| Защищенная ветка (main/develop) | Удаление блока |
| Удаленный филиал существует | Попросить удалить удаленный |
| Обнаружена ветка БД | Напомнить точной командой |
| Устаревшие ссылки | Auto-prune |

## Распространенные ошибки

**Удаление рабочего дерева для main/develop**
- Всегда блокируется проверкой безопасности. При необходимости перенастройте защищенные ветки.

**Удаление несвязанной ветки без проверки**
- Всегда проверяйте статус слияния. Необъединенные ветки требуют явного `--force` или `-D`.

**Забыть об очистке ветки базы данных**
- Остаются потерянные ветки БД, потребляющие ресурсы. Команда напоминает автоматически.

**Использование `rm -rf` вместо `git worktree remove`**
- Оставляет устаревшие ссылки на рабочее дерево в `.git/worktrees/`. Всегда используйте команды git.

## Использование

```
/git-worktree-remove feat/auth
/git-worktree-remove fix/login-bug --force
/git-worktree-remove refactor/db --keep-branch
```

Путь ветки или рабочего дерева: $ARGUMENTS.