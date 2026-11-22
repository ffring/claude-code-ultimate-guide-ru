---
title: "Шаблон оптимизации токена RTK"
description: "Конфигурация CLAUDE.md для минимизации потребления токенов с помощью прокси RTK CLI"
tags: [claude-md, template, performance]
---

# Оптимизация токена RTK

**Context**: использование RTK (Rust Token Killer) для минимизации потребления токенов из выходных команд.

## Команды для оптимизации

Всегда используйте оболочку RTK для этих команд с высокой степенью детализации:

### Git Operations (среднее сокращение на 92,3%)
- `rtk git log` вместо `git log`
- `rtk git status` вместо `git status`
- `rtk git diff` вместо `git diff`

### Операции с файлами (среднее сокращение на 69,4%)
- `rtk find "*.md" .` вместо `find . -name "*.md"`
- `rtk read <file>` вместо `cat <file>` (для больших файлов >10 тыс. строк)
- `rtk ls .` вместо `ls -la`
- `rtk grep "pattern"` вместо `grep -r "pattern"`

### Стек JS/TS (снижение на 70-90%)
- `rtk vitest run` вместо `pnpm test`
- `rtk pnpm list` вместо `pnpm list`
- `rtk pnpm outdated` вместо `pnpm outdated`
- `rtk prisma migrate status` вместо `pnpm prisma migrate status`

### Rust Toolchain (сокращение на 80-90%)
- `rtk cargo test` вместо `cargo test`
- `rtk cargo build` вместо `cargo build`
- `rtk cargo clippy` вместо `cargo clippy`

### Питон (снижение 90%)
- `rtk python pytest` вместо `pytest`

### Вперед (скидка 90%)
- `rtk go test` вместо `go test`

### GitHub CLI (снижение на 79-87%)
- `rtk gh pr view <num>` вместо `gh pr view <num>`
- `rtk gh pr checks <num>` вместо `gh pr checks <num>`

## Цель экономии токенов

**Baseline**: ~150 тыс. токенов за 30-минутный сеанс.
**С RTK**: ~45 тыс. токенов (скидка 70%)

## Установка

```bash
# Homebrew (macOS/Linux)
brew install rtk-ai/tap/rtk

# Cargo (all platforms)
cargo install rtk

# Hook-first install
rtk init
```

## Проверка

Проверьте наличие RTK:
```bash
rtk --version  # Should show: rtk 0.16.0+
```

## Когда НЕ использовать RTK

- Быстрое исследование (1-2 команды): накладные расходы того не стоят
- Уже использую такие инструменты, как Grep/Read (родные инструменты Claude оптимизированы)
- Маленькие выходные данные (<100 символов): минимальный выигрыш

## Автоматизация

Используйте RTK автоматически через перехватчик (см. `.claude/hooks/bash/rtk-wrapper.sh`) или `rtk init` для настройки по первому перехвату.
