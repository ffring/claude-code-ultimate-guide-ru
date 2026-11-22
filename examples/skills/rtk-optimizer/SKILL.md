---
name: rtk-optimizer
description: "Оберните команды оболочки с высокой степенью детализации с помощью RTK, чтобы уменьшить потребление токенов. Используйте при запуске git log, git diff, Cargo Test, pytest или другого подробного вывода CLI, который тратит впустую токены контекстного окна."
allowed-tools: Bash
effort: low
metadata:
  version: 1.0.0
---

# Навыки оптимизатора RTK

**Purpose**: автоматически предлагать оболочки RTK для команд с высокой степенью детализации, чтобы уменьшить потребление токенов.

## <a name="how-it-works"></a>Как это работает

1. **Обнаружение команд с высоким уровнем детализации** в запросах пользователей
2. **Предложить оболочку RTK**, если применимо
3. **Выполнить с помощью RTK**, когда пользователь подтвердит
4. **Отслеживать экономию** за сеанс

## Поддерживаемые команды

### Git (снижение >70%)
- `git log` → `rtk git log` (снижение на 92,3%)
- `git status` → `rtk git status` (снижение на 76,0%)
- `find` → `rtk find` (снижение на 76,3%)

### Средняя стоимость (снижение на 50-70%)
- `git diff` → `rtk git diff` (снижение на 55,9%)
- `cat <large-file>` → `rtk read <file>` (снижение на 62,5%)

### Стек JS/TS (снижение на 70-90%)
- `pnpm list` → `rtk pnpm list` (снижение на 82%)
- `pnpm test` / `vitest run` → `rtk vitest run` (снижение на 90%)

### Rust Toolchain (сокращение на 80-90%)
- `cargo test` → `rtk cargo test` (снижение на 90%)
- `cargo build` → `rtk cargo build` (снижение на 80%)
- `cargo clippy` → `rtk cargo clippy` (снижение на 80%)

### Python и Go (скидка 90 %)
- `pytest` → `rtk python pytest` (снижение на 90%)
- `go test` → `rtk go test` (снижение на 90%)

### GitHub CLI (снижение на 79-87%)
- `gh pr view` → `rtk gh pr view` (снижение на 87%)
- `gh pr checks` → `rtk gh pr checks` (снижение на 79%)

### Операции с файлами
- `ls` → `rtk ls` (сокращенный вывод)
- `grep` → `rtk grep` (фильтрованный вывод)

## Примеры активации

**User**: «Покажи мне историю git»
**Skill**: обнаруживает `git log` → предлагает `rtk git log` → объясняет экономию токенов 92,3%.

**User**: «Найти все файлы уценки»
**Skill**: Обнаруживает `find` → Предлагает `rtk find "*.md" .` → Объясняет экономию 76,3 %

## Проверка установки

Перед первым использованием убедитесь, что RTK установлен:
```bash
rtk --version  # Should output: rtk 0.16.0+
```

Если не установлено:
```bash
# Homebrew (macOS/Linux)
brew install rtk-ai/tap/rtk

# Cargo (all platforms)
cargo install rtk
```

## Схема использования

```markdown
# When user requests high-verbosity command:

1. Acknowledge request
2. Suggest RTK optimization:
   "I'll use `rtk git log` to reduce token usage by ~92%"
3. Execute RTK command
4. Track savings (optional):
   "Saved ~13K tokens (baseline: 14K, RTK: 1K)"
```

## Отслеживание сеансов

Необязательно: Отслеживайте совокупную экономию за сеанс:

```bash
# At session end
rtk gain  # Shows total token savings for session (SQLite-backed)
```

## Краевые случаи

- **Малые выходные данные** (<100 символов): пропустить RTK (накладные расходы того не стоят)
- **Уже пользуюсь инструментами Claude**: инструменты Grep/Read уже оптимизированы
- **Несколько команд**: пакетная обработка с оболочкой RTK один раз, а не для каждой команды

## Конфигурация

Включить через CLAUDE.md:
```markdown
## Token Optimization

Use RTK (Rust Token Killer) for high-verbosity commands:
- git operations (log, status, diff)
- package managers (pnpm, npm)
- build tools (cargo, go)
- test frameworks (vitest, pytest)
- file finding and reading
```

## Метрики (проверенные)

На основе реальных испытаний:
- `git log`: 13 994 символов → 1 076 символов (сокращение на 92,3%).
- `git status`: 100 символов → 24 символа (снижение на 76,0%).
- `find`: 780 символов → 185 символов (уменьшение на 76,3%).
- `git diff`: 15 815 символов → 6 982 символа (сокращение на 55,9%).
- `read file`: 163 587 символов → 61 339 символов (сокращение на 62,5%).

**В среднем: снижение количества токенов на 72,6%**

## <a name="limitations"></a>Ограничения

- 446 звезд на GitHub, активно поддерживается (30 выпусков за 23 дня)
- Не подходит для интерактивных команд
- Быстрый темп разработки (проверьте наличие критических изменений)

## Рекомендация

**Используйте RTK для**: рабочие процессы git, файловые операции, среды тестирования, инструменты сборки, менеджеры пакетов.
**Пропустить RTK для**: небольшие выходные данные, быстрое исследование, интерактивные команды

## Ссылки

- РТК GitHub: https://github.com/rtk-ai/rtk
- Веб-сайт РТК: https://www.rtk-ai.app/
- Оценка: `docs/resource-evaluations/rtk-evaluation.md`
- Шаблон CLAUDE.md: `examples/claude-md/rtk-optimized.md`
