---
title: "Поведенческие режимы"
description: "Готовые к использованию файлы поведенческого режима для настройки поведения Claude Code."
tags: [config, template, workflows]
---

# Поведенческие режимы

Готовые к использованию файлы поведенческого режима для Claude Code. Скопируйте в `~/.claude/` и укажите ссылку в `CLAUDE.md`.

## Доступные режимы

| Режим | Файл | Цель |
|------|------|---------|
| **Обучение** | [MODE_Learning.md](./MODE_Learning.md) | Своевременные пояснения при первом использовании методов |

## Установка

### 1. Скопируйте файл режима

```bash
cp MODE_Learning.md ~/.claude/
```

### 2. Ссылка на ваш CLAUDE.md

Добавьте в `~/.claude/CLAUDE.md`:

```markdown
# Behavioral Modes
@MODE_Learning.md
```

### 3. Добавьте флаги (необязательно)

Добавьте в `~/.claude/FLAGS.md` для активации по флагу:

```markdown
**--learn**
- Trigger: User requests learning mode, "why/how" questions
- Behavior: Enable just-in-time explanations with first-occurrence tracking

**--no-learn**
- Trigger: User wants pure execution without educational offers
- Behavior: Suppress all learning mode offers
```

## Использование

```bash
# Activate for entire session
claude --learn

# Focus on specific domain
claude --learn focus:git
claude --learn focus:architecture

# Batch explanations at task end
claude --learn batch
```

## Дополнительные режимы: платформа SuperClaude

В данное руководство входят только **Режим обучения**. Полную поведенческую структуру с дополнительными режимами см. [СуперКлод](https://github.com/SuperClaude-Org/SuperClaude_Framework):

| Режим | Цель |
|------|---------|
| **Оркестрация** | Умный выбор инструмента, оптимизация параллельного выполнения |
| **Управление задачами** | Иерархическое отслеживание задач с постоянной памятью |
| **Эффективность токена** | Улучшенное сжатие символов (уменьшение количества токенов на 30–50 %) |
| **Обучение** | Своевременное развитие навыков (включено сюда) |

SuperClaude также включает в себя:
- `FLAGS.md` (пользовательские поведенческие маркеры, такие как `--delegate`, `--learn`). Это соглашения о подсказках, а не флаги Claude Code CLI. Используйте `/effort` или `--effort` для настроек рассуждения; `ultrathink` добавляет инструкцию без изменения усилия API.
- `PRINCIPLES.md` — Инженерные принципы (SOLID, DRY, научно обоснованные)
- `RULES.md` — Действующие правила с системой приоритетов
- Документация сервера MCP (Context7, Sequential, Serena)

## <a name="see-also"></a>См. также

- [Поведенческие режимы SuperClaude](../../guide/ultimate-guide.md#superclaude-behavioral-modes): Полная документация
- [Репозиторий SuperClaude](https://github.com/SuperClaude-Org/SuperClaude_Framework): Полная структура
