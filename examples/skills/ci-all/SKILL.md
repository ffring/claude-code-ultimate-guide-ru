---
name: ci-all
description: "Полный конвейер CI: запускайте локальные тесты, проверку типов, отправку ветки и возврат URL-адреса конвейера. Единственная команда, которая вам понадобится перед открытием ПР."
argument-hint: "[--skip-tests | --e2e]"
allowed-tools: [Bash]
model: haiku
effort: medium
disable-model-invocation: true
---

# /ci:all: Полный CI перед PR

Выполняет все по порядку: локальные тесты → проверка типа → push → URL-адрес конвейера.

Один `/ci:all` заменяет: ручные тесты + git push + копирование URL-адреса конвейера.

## Обнаружение стека

```bash
if [ -f "uv.lock" ]; then STACK="python"
elif [ -f "pnpm-lock.yaml" ]; then STACK="node"
elif [ -f "package-lock.json" ]; then STACK="node-npm"
elif [ -f "Cargo.toml" ]; then STACK="rust"
fi
```

## Шаг 1. Локальные тесты (блокировка)

**Python (uv/pytest):**
```bash
uv run pytest --tb=short -q
# Failure → STOP + print failing tests
```

**Узел (pnpm/vitest):**
```bash
pnpm vitest run
pnpm tsc --noEmit
# Failure → STOP
```

**Rust:**
```bash
cargo test --quiet 2>&1
```

Если `--skip-tests` передан → перейдите к шагу 2.

## Шаг 2: Push + конвейер

```bash
BRANCH=$(git branch --show-current)

# Verify commits exist to push
AHEAD=$(git rev-list --count origin/$BRANCH..HEAD 2>/dev/null || echo "1")
if [ "$AHEAD" = "0" ]; then
  echo "Branch already up to date on origin."
else
  git push origin "$BRANCH"
fi
```

## Шаг 3. URL-адрес конвейера

### GitLab CI

```bash
REMOTE=$(git remote get-url origin)
WEB_URL=$(echo "$REMOTE" | sed 's/git@gitlab\.com:/https:\/\/gitlab.com\//' | sed 's/\.git$//')
echo "Pipeline: $WEB_URL/-/pipelines?ref=$BRANCH"

# Optional: live status via glab CLI
if command -v glab &>/dev/null; then
  sleep 3
  glab ci status --branch "$BRANCH" 2>/dev/null || true
fi
```

### GitHub Actions

```bash
REMOTE=$(git remote get-url origin)
WEB_URL=$(echo "$REMOTE" | sed 's/git@github\.com:/https:\/\/github.com\//' | sed 's/\.git$//')
echo "Actions: $WEB_URL/actions?query=branch%3A$BRANCH"

# Optional: live status via gh CLI
if command -v gh &>/dev/null; then
  sleep 5
  gh run list --branch "$BRANCH" --limit 3 2>/dev/null || true
fi
```

## Ожидаемый результат

```
CI: my-app (Node/Vitest)
──────────────────────────

① Local tests
  ✅ 47 passed in 8.2s

② Type check
  ✅ No errors

③ Push
  ✅ origin/feat/my-feature

④ Pipeline
  🔗 https://gitlab.com/org/my-app/-/pipelines?ref=feat/my-feature

Next step: open a PR with /pr or directly on GitLab/GitHub.
```

Если тесты не пройдены:
```
CI: my-api (Python/pytest)
────────────────────────────

① Local tests
  ❌ 2 failed

  FAILED tests/test_orders.py::TestOrderService::test_refund_validation
  AssertionError: expected 400, got 500

→ Fix tests before pushing. Pipeline not triggered.
```

## Использование

```
/ci:all
/ci:all --skip-tests    # push without re-running tests
/ci:all --e2e           # include E2E tests (if configured)
```

Цель: $ARGUMENTS