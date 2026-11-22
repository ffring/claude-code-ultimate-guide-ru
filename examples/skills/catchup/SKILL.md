---
name: catchup
description: "Восстановите контекст после /clear, суммируя недавнюю работу и состояние проекта."
argument-hint: "[branch] [--since <date>]"
effort: low
when_to_use: "Use after /clear or at session start to restore context."
disable-model-invocation: true
---

# Подхват контекста

Восстановить контекст после `/clear` — суммировать недавнюю работу и состояние проекта.

## Цель

После очистки контекста с помощью `/clear` используйте эту команду, чтобы быстро восстановить понимание:
- Что было недавно изменено
- Текущее состояние проекта
- Выдающиеся TODO и проблемы
- Где возобновить работу

## Инструкции

### Шаг 1. Анализ истории Git

```bash
# Recent commits (last 10)
git log --oneline -10

# Files modified in last 5 commits
git diff --stat HEAD~5 2>/dev/null || git diff --stat $(git rev-list --max-parents=0 HEAD)

# Current branch and status
git branch --show-current
git status --short
```

### Шаг 2. Сводка последних изменений

```bash
# What changed today
git log --oneline --since="midnight" --author="$(git config user.name)" 2>/dev/null

# Uncommitted work
git diff --name-only
git diff --cached --name-only
```

### Шаг 3: сканирование TODO/FIXME

```bash
# Find outstanding work markers in recently modified files
git diff --name-only HEAD~5 2>/dev/null | head -20 | xargs grep -n "TODO\|FIXME\|XXX\|HACK" 2>/dev/null | head -30
```

### Шаг 4. Проверка состояния проекта

```bash
# Check for common state indicators
[ -f "package.json" ] && echo "📦 Node project: $(jq -r '.name // "unnamed"' package.json)"
[ -f "Cargo.toml" ] && echo "🦀 Rust project: $(grep '^name' Cargo.toml | head -1)"
[ -f "pyproject.toml" ] && echo "🐍 Python project"
[ -f "go.mod" ] && echo "🐹 Go project: $(head -1 go.mod | cut -d' ' -f2)"

# Active branch purpose (from branch name)
BRANCH=$(git branch --show-current)
echo "🌿 Branch: $BRANCH"
```

## Выходной формат

Предоставьте структурированное резюме:

---

### 📍 Контекст восстановлен

**Project**: [имя из package.json/Cargo.toml/etc]
**Branch**: [текущая ветка]
**Last Activity**: [время последней фиксации]

### 🔄 Недавняя работа (последние 5 коммитов)

1. [сообщение о фиксации 1] - [затронутые файлы]
2. [сообщение о фиксации 2] - [затронутые файлы]
...

### 📝 Незафиксированные изменения

- [список модифицированных файлов с кратким описанием изменений]

### ⚠️ Выдающиеся TODO

- [файл:строка] TODO: [описание]
- [файл:строка] FIXME: [описание]

### 🎯 Предлагаемые следующие шаги

На основе недавней активности:
1. [Скорее всего, следующее действие, исходя из закономерностей]
2. [Альтернативная область фокуса]

---

## Примеры использования

**После долгого перерыва:**
```
/catchup
```
→ Полное восстановление контекста

**Быстрая проверка статуса:**
```
/catchup --brief
```
→ Просто фиксирует и не фиксирует изменения

**Фокус на конкретной области:**
```
/catchup auth
```
→ Фильтровать изменения, связанные с аутентификацией.

## Советы профессионалов

1. **Document перед `/clear`**: напишите краткую заметку в сообщении фиксации или CLAUDE.md перед очисткой контекста.
2. **Использовать с банком памяти**: объединить с файлами `.claude/memory/` для постоянного состояния.
3. **Именование ветвей**: используйте описательные имена ветвей (например, `feat/user-auth`), чтобы облегчить восстановление контекста.

$ARGUMENTS
