---
model: sonnet
description: "Retex — фиксируйте усвоенный урок в памяти после исправления, отката или ошибки."
---

# Retex – зафиксируйте полученный урок

**Arguments**: $ARGUMENTS

Захватите и сохраните полученный урок (ложная трасса, введение ошибки, откат, решение о возобновлении) в памяти для будущих сеансов.

---

## Шаг 1. Сбор контекста Git

Запустить параллельно:

- `rtk git status`
- `rtk git log --oneline -5`
- `git branch --show-current`

---

## Шаг 2: Сбор входных данных

**Mode 1 — Direct** (если `$ARGUMENTS` не виден):

- Утилизатор `$ARGUMENTS` как описание инцидента
- Сделайте вывод о категории и основной причине из текста

**Mode 2 — Интерактивный** (без аргументов):

- Утилизатор `AskUserQuestion` с двумя вопросами:
  1. «Что прошло?» — опции: Fausse piste, Bug de script/hook, Rollback, Décision doc à revoir, Piège outil/stack, Autre
  2. «Опишите 1–3 фразы: ce qui s'est passé et ce que tu aurais dû faire»

---

## Шаг 3: Структурируйте ретекс

Синтезатор из контекста git + ввод пользователя в этом формате:

| Чемпион                          | Описание                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Название**                      | 3–5 слов, образующих существительное (например: «Quarto отображает неправильный формат»)                                                                                                                                           |
| **Что случилось**              | 1-3 фразы «факты», «pas de jugement»                                                                                                                                                                 |
| **Основная причина**                 | Причина расовой техники — PAS lesymtôme                                                                                                                                                                |
| **Что нужно было сделать** | Правильный подход, возможность действия                                                                                                                                                                        |
| **Правило предотвращения**            | Règle emrative Courte, commençant par un verbe (например: «Toujours utiliser --to whitepaper-typst pour les PDFs»)                                                                                          |
| **Теги**                       | 1-4 тега парми: `documentation`, `markdown`, `yaml`, `versioning`, `release`, `landing-sync`, `whitepaper`, `template`, `hook`, `script`, `quarto`, `typst`, `writing`, `structure`, `configuration` |
| **Серьезность**                   | `critical` (синхронизация кассеты/блокировка выпуска), `high` (функция кассеты), `medium` (время >1 ч)                                                                                                       |
| **Объем**                      | `project` (специальное руководство) или `general` (весь проект doc/Quarto)                                                                                                                                   |

---

## Шаг 4: Вычисление имени памяти

Формат: `retex-{YYYY-MM-DD}-{slug}`

- Слизняк = 2–4 слова кебаб-кебаб по основной причине
- Если вы дублируете свой мем: суффикс `-2`, `-3`...
- Пример: `retex-2026-03-03-quarto-wrong-format`

---

## Шаг 5: Запись Retex-памяти

С помощью инструмента Write создайте документ `.claude/memories/retex-{slug}.md` с точным содержанием:

```
# Retex: {Title}

**Date**: {YYYY-MM-DD} | **Severity**: {severity} | **Scope**: {scope}
**Tags**: {tag1, tag2, tag3}

## What Happened

{description factuelle}

## Root Cause

{analyse technique du root cause}

## What Should Have Been Done

{approche correcte et actionnable}

## Prevention Rule

> {règle impérative}

## Context

- Branch: `{current-branch}`
- Files: {fichiers clés impliqués si connus}
- Commit: {hash court si applicable}
```

---

## Шаг 6: Обновите индекс Retex

1. Лира `.claude/memories/retex-index.md` (или создана, если не существует)
2. Добавьте новый вход в таблицу:

```markdown
# Retex Index

| Date   | Slug   | Title   | Severity   | Tags   | Scope   |
| ------ | ------ | ------- | ---------- | ------ | ------- |
| {date} | {slug} | {title} | {severity} | {tags} | {scope} |

Total: {N} | Last updated: {date}
```

3. На 50 блюд (supprimer les plus anciennes si dépassement)
4. Напишите индекс за день

---

## Шаг 7: Подтвердите

Афиша компактного резюме:

```
✓ Retex capturé :
  Fichier    : .claude/memories/retex-{slug}.md
  Title      : {title}
  Severity   : {severity}
  Prevention : "{prevention rule}"
  Tags       : [{tags}]
```

---

## Краевые случаи

- **Premier retex** : создать `retex-index.md` с нуля (заголовок + премьера)
- **Pas de contexte git**: скрыть раздел «Контекст» без ошибок
- **$ARGUMENTS три суда** (<10 символов): баскулер в интерактивном режиме
