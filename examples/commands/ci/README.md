# CI-команды

Слэш-команды для рабочих процессов CI/CD. Автоматическое определение стека (Python/Node/Rust) и поддержка GitLab CI и GitHub Actions.

## Команды

| Команда | Описание |
|---------|-------------|
| `/ci:all` | Полный конвейер: тесты + проверка типа + push + URL-адрес конвейера. Единственная команда, которая вам нужна перед личным рекордом. |
| `/ci:tests` | Запустите набор тестов. Автоматически обнаруживает pytest, vitest, грузовой тест. |
| `/ci:pipeline` | Отправьте текущую ветку и верните URL-адрес отслеживания конвейера. |
| `/ci:status` | Показать текущий статус конвейера для активной ветки. |

## Схема использования

```
# Before every PR:
/ci:all

# Run only tests:
/ci:tests
/ci:tests tests/test_billing.py   # specific file

# Check pipeline after push:
/ci:status
/ci:status 42   # specific MR/PR number

# Push without re-running tests (e.g. doc-only change):
/ci:all --skip-tests
```

## Поддержка стека

| Куча | Тестовая команда | Тип проверки |
|-------|-------------|------------|
| Питон + УФ | `uv run pytest --tb=short -q` | мойпи (необязательно) |
| Узел + пнпм | `pnpm vitest run` | `pnpm tsc --noEmit` |
| Узел + НПМ | `npm test` | `npx tsc --noEmit` |
| Ржавчина | `cargo test --quiet` | `cargo clippy` |

## Поддержка платформы CI

Обе команды поддерживают **GitLab CI** (через `glab` CLI) и **GitHub Actions** (через `gh` CLI).
Если ни один из CLI не установлен, команды возвращаются к отображению URL-адреса конвейера.