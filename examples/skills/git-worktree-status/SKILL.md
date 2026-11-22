---
name: git-worktree-status
description: "Проверьте состояние задач фоновой проверки, выполняемых в рабочем дереве git."
effort: low
when_to_use: "Use to see all active worktrees and their current branch status."
disable-model-invocation: true
---

# Статус рабочего дерева Git

Проверьте задачи фоновой проверки (проверка типа, тесты, сборка), запущенные `/git-worktree`.

**Основной принцип:** Неблокирующая обратная связь о состоянии рабочего дерева без прерывания процесса разработки.

**Часть:** [Worktree Lifecycle Suite](../../commands/git-worktree.md) | [`/git-worktree`](../../commands/git-worktree.md) | [`/git-worktree-remove`](../../commands/git-worktree-remove.md) | [`/git-worktree-clean`](../../commands/git-worktree-clean.md)

## Процесс

1. **Определить текущее рабочее дерево**: убедиться, что мы находимся внутри рабочего дерева git.
2. **Проверьте файлы журнала**: прочтите `.worktree-logs/` для получения результатов фоновых задач.
3. **Результаты анализа**: Извлечение счетчиков pass/fail, ошибок
4. **Состояние отчета**: сводная информация с цветовой кодировкой и последующими действиями.

## Обнаружение рабочего дерева

```bash
# Check if inside a worktree (not main repo)
git rev-parse --git-common-dir 2>/dev/null | grep -q "\.git/worktrees" || {
  echo "Not inside a worktree. Use from a worktree directory."
  exit 1
}

# Get worktree info
WORKTREE_PATH=$(git rev-parse --show-toplevel)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
MAIN_REPO=$(git rev-parse --git-common-dir | sed 's|/\.git/worktrees/.*||')
```

## Проверка фоновых задач

### Тип статуса проверки

```bash
LOG=".worktree-logs/typecheck.log"

if [ -f "$LOG" ]; then
  if grep -q "error TS" "$LOG"; then
    ERROR_COUNT=$(grep -c "error TS" "$LOG")
    echo "Type check: FAIL ($ERROR_COUNT errors)"
    # Show first 5 errors
    grep "error TS" "$LOG" | head -5
  else
    echo "Type check: PASS"
  fi
elif pgrep -f "tsc --noEmit" > /dev/null; then
  echo "Type check: RUNNING..."
else
  echo "Type check: NOT RUN"
fi
```

### Статус теста

```bash
LOG=".worktree-logs/tests.log"

if [ -f "$LOG" ]; then
  if grep -q '"numFailedTests":0' "$LOG"; then
    TOTAL=$(grep -o '"numTotalTests":[0-9]*' "$LOG" | cut -d: -f2)
    echo "Tests: PASS ($TOTAL tests)"
  else
    FAILED=$(grep -o '"numFailedTests":[0-9]*' "$LOG" | cut -d: -f2)
    echo "Tests: FAIL ($FAILED failures)"
    # Show failed test names
    grep '"fullName"' "$LOG" | head -5
  fi
elif pgrep -f "vitest run" > /dev/null; then
  echo "Tests: RUNNING..."
else
  echo "Tests: NOT RUN"
fi
```

### Статус сборки

```bash
LOG=".worktree-logs/build.log"

if [ -f "$LOG" ]; then
  if [ $? -eq 0 ]; then
    echo "Build: PASS"
  else
    echo "Build: FAIL"
    tail -10 "$LOG"
  fi
elif pgrep -f "cargo build\|next build\|go build" > /dev/null; then
  echo "Build: RUNNING..."
else
  echo "Build: NOT RUN"
fi
```

## Формат отчета

```
Worktree Status: .worktrees/feat/auth
Branch: feat/auth (from main, 3 commits ahead)

Checks:
  Type check:  PASS
  Tests:       PASS (142 tests)
  Build:       NOT RUN

Dependencies: symlinked from main
Disk usage: 2.3 MB (excl. node_modules)

Log files: .worktree-logs/
```

**При обнаружении сбоев:**

```
Worktree Status: .worktrees/feat/auth
Branch: feat/auth (from main, 3 commits ahead)

Checks:
  Type check:  FAIL (3 errors)
    src/auth.ts:42 - error TS2345: Argument of type 'string' is not assignable
    src/auth.ts:67 - error TS2304: Cannot find name 'AuthConfig'
    src/middleware.ts:12 - error TS7006: Parameter 'req' implicitly has an 'any' type
  Tests:       FAIL (2 failures)
    auth.test.ts > should validate token
    auth.test.ts > should reject expired token
  Build:       NOT RUN

Action: Fix type errors before proceeding. Run `npx tsc --noEmit` for full output.
```

## Управление журналами

```bash
# Clean old logs (useful for re-running checks)
rm -rf .worktree-logs/*.log

# Re-run all checks
npx tsc --noEmit > .worktree-logs/typecheck.log 2>&1 &
npx vitest run --reporter=json > .worktree-logs/tests.log 2>&1 &
```

## <a name="quick-reference"></a>Шпаргалка

| Ситуация | Выход |
|-----------|--------|
| Все проверки проходят | Зеленый статус, готов к работе. |
| Проверки все еще выполняются | «РАБОТАЕТ...» с PID |
| Обнаружены ошибки типа | Количество ошибок + первые 5 ошибок |
| Неудачные тесты | Количество неудач + названия неудачных тестов |
| Журналы не найдены | «НЕ ЗАПУСКАТЬ» (используйте `--fast` или удаляйте журналы) |
| Не в рабочем дереве | Сообщение об ошибке с инструкциями |

## Использование

```
/git-worktree-status
```

Никаких аргументов не нужно. Запускайте из любого каталога рабочего дерева.