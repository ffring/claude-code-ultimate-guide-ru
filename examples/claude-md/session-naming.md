---
title: "Автоматическое переименование сеанса"
description: "Фрагмент CLAUDE.md, позволяющий Claude автоматически называть сеансы описательными заголовками."
tags: [session, resume, productivity, workflow]
---

# Автоматическое переименование сеанса: фрагмент CLAUDE.md

Добавьте этот блок в свой глобальный `~/.claude/CLAUDE.md`, чтобы Claude автоматически переименовывал сеансы с описательными заголовками после 2-3 обменов. Очень помогает при запуске параллельных сеансов (WebStorm, разделенные терминалы, несколько проектов).

## <a name="the-problem"></a>Проблема

При параллельном запуске нескольких сеансов Claude Code все они отображаются как «claude» или усеченное первое приглашение в средствах выбора сеансов. Поиск подходящей сессии для `/resume` становится догадкой.

## Решение

Поведенческая инструкция в CLAUDE.md — никаких скриптов, никаких хуков, никаких плагинов. Claude заранее понимает тему сеанса и заранее звонит `/rename`.

## Фрагмент

```markdown
# Session Naming (auto-rename)

## Expected behavior

1. **Early rename**: Once the session's main subject is clear (after 2-3 exchanges),
   run `/rename` with a short, descriptive title (max 50 chars)
2. **End-of-session update**: If scope shifted significantly from the initial rename,
   propose a re-rename before closing

## Title format

`[action] [subject]` — examples:
- "fix whitepaper PDF build"
- "add auth middleware + tests"
- "refactor hook system"
- "research terminal tab rename"
- "update CC releases v2.2.0"

## Rules

- Max 50 characters
- No "Session:" prefix, no date
- Action verb first (fix, add, refactor, update, research, debug...)
- Multi-topic: use the dominant subject, not an exhaustive list
- Do NOT ask for confirmation on the early rename (just do it)
- Only propose confirmation for end-of-session re-rename if title changed
```

## Использование

**Global** (все проекты): Добавить в `~/.claude/CLAUDE.md`

**Project-level**: добавить в `.claude/CLAUDE.md` или `CLAUDE.md` в корне проекта.

## <a name="how-it-works"></a>Как это работает

Это чистая поведенческая инструкция — никаких инструментов не требуется. Claude:
1. Определяет основную тему сеанса из первых 2-3 разговоров.
2. Автоматически вызывает `/rename "fix auth middleware"` (без запроса подтверждения)
3. Если работа существенно меняется, предлагает переименовать в конце сеанса.

Именованные сеансы отображаются в средстве выбора `/resume` со своими описательными заголовками, что упрощает поиск и продолжение нужного сеанса.

## <a name="limitations"></a>Ограничения

- **Переименование вкладок**: названия вкладок терминала (WebStorm, iTerm2) НЕ переименовываются. JetBrains фильтрует escape-последовательности ANSI, используемые для изменения заголовка вкладки. Переименовывается сам сеанс Claude, а не вкладка терминала.
- **Timing**: Claude переименовывает после понимания темы, а не сразу при первом сообщении.

## Проверка

```bash
# After a session with this configured:
claude --resume
# → Session list shows descriptive names like "fix auth middleware"
# instead of timestamps or truncated prompts
```

## Trade-offs

| Подход | Плюсы | Минусы |
|----------|------|------|
| Это (поведенческая инструкция) | Отсутствие инструментов, работает везде | Claude должен определить время |
| Руководство `/rename` | Полный контроль | Требует действий пользователя |
| Крюк (Остановить событие) | Автоматический | Нет доступа к контексту разговора |

Поведенческая инструкция выигрывает за счет простоты и мобильности.
