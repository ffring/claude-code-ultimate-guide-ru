---
name: ci-tests
description: "Запустите набор тестов для текущего репозитория с автоматическим обнаружением Python (pytest/uv), Node (vitest/pnpm) или Rust (грузовой тест)."
argument-hint: "[file or folder target]"
allowed-tools: [Bash]
model: haiku
effort: low
disable-model-invocation: true
---

# /ci:tests: Запуск тестов.

Обнаруживает стек и запускает тесты с помощью правильной команды.

## Обнаружение стека

```bash
if [ -f "uv.lock" ]; then
  STACK="python"
elif [ -f "pnpm-lock.yaml" ] || [ -f "package.json" ]; then
  STACK="node"
elif [ -f "Cargo.toml" ]; then
  STACK="rust"
else
  STACK="unknown"
fi
```

## Команды по стеку

### Python (uv + pytest)

```bash
# All tests
uv run pytest --tb=short -q $ARGUMENTS

# With coverage
uv run pytest --cov=src --cov-report=term-missing -q

# Specific file or folder
uv run pytest $ARGUMENTS -v
```

### Узел (pnpm + витест)

```bash
# All tests
pnpm vitest run $ARGUMENTS

# With coverage
pnpm vitest run --coverage

# Watch mode (dev)
pnpm vitest
```

### Узел (npm + шутка)

```bash
npm test -- --passWithNoTests $ARGUMENTS
```

### Ржавчина (груз)

```bash
cargo test --quiet $ARGUMENTS 2>&1
```

## Ожидаемый результат

```
Tests: my-api (Python/pytest)
───────────────────────────────

uv run pytest --tb=short -q

[pytest output]

✅ 42 passed in 3.1s  →  Ready to push
```

При неудаче:
```
❌ 2 failed

FAILED tests/test_billing.py::TestInvoice::test_promo_expired
AssertionError: expected discount=0, got discount=10

→ Fix before pushing.
```

## Использование

```
/ci:tests
/ci:tests tests/test_orders.py
/ci:tests src/components/Button.test.tsx
```

Цель: $ARGUMENTS