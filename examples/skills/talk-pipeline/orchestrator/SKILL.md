---
name: talk-pipeline
description: "Организует весь процесс подготовки доклада, от исходного материала до листов ревизии, последовательно выполняя 6 этапов с контрольными точками, выполняемыми человеком, для переговоров в режиме REX или в концептуальном режиме. Используйте при запуске нового конвейера обсуждения, возобновлении конвейера с определенного этапа или выполнении полного рабочего процесса сквозной подготовки."
allowed-tools: Write Read AskUserQuestion Task
effort: high
---

# Обсуждение оркестратора конвейера

Организует весь процесс подготовки доклада, от исходного материала до листов рецензирования. Может запускать весь конвейер или одну изолированную стадию.

## Режимы

- `--rex`: разговор REX с доказательством git/code (журнал изменений, коммиты, измеренные метрики)
- `--concept`: Концептуальный доклад на основе статьи, идей, заметок (пропускает этап 2).

## Использование

```
/talk-pipeline                          # full pipeline, asks for context
/talk-pipeline --stage=extract          # run a single isolated stage
/talk-pipeline --rex                    # REX mode (git archaeology included)
/talk-pipeline --concept                # Concept mode (skip research)
/talk-pipeline --rex --slug=my-talk --event="Conf 2026" --date=2026-06-15 --duration=30
```

## Коллекция контекстов

Спросите с помощью AskUserQuestion, если он не указан:

```
- slug         : kebab-case identifier (e.g., my-talk-topic)
- event        : event name (e.g., Conf 2026, Tech Meetup)
- date         : talk date (YYYY-MM-DD)
- duration     : duration in minutes (e.g., 30)
- audience     : audience profile (e.g., senior devs, tech leads, non-tech)
- type         : --rex or --concept
- source_path  : path to source material (article .mdx, transcript .md, notes)
- repo_path    : (REX only) path to git repository for archaeology
```

## <a name="workflow"></a>Рабочий процесс

1. **Соберите контекст** с помощью AskUserQuestion для получения необходимых метаданных.
2. **Маршрутизация по режиму** (`--rex` против `--concept`, пропустите этап 2, если есть концепция)
3. **Выполнить этап 1** (`/talk-stage1-extract`, всегда первым)
4. **Выполнять этапы 2–4 параллельно** (после подтверждения этапа 1)
   - REX: экстракт -> исследование + концепции + позиция (параллельно)
   - Концепция: экстракт -> концепции + позиция (параллельно пропустить исследование)
5. **CHECKPOINT**: дождаться выбора ракурса + заголовка (выход этапа 4)
6. **Выполнить этап 5** (`/talk-stage5-script` с подтвержденным выбором)
7. **Выполнить этап 6** (`/talk-stage6-revision`)
8. **Итоговое резюме**: список всех сгенерированных файлов с указанием их путей.

## Граф зависимостей

```
         extract (Stage 1)
               |
    +----------+-----------+
    v          v           v
research    concepts   position
(Stage 2)   (Stage 3)  (Stage 4)
[--rex only]            [CHECKPOINT]
    |          |           |
    +----------+-----------+
               v
          script (Stage 5)
               |
               v
         revision (Stage 6)
```

## Маршрутизация этапов (--stage=X)

Если указан `--stage`, запустите только соответствующий навык:

| Этап | Умение вызывать |
|-------|----------------|
| извлекать | /talk-stage1-extract |
| исследовать | /talk-stage2-research |
| концепции | /talk-stage3-concepts |
| позиция | /talk-stage4-position |
| сценарий | /talk-stage5-script |
| пересмотр | /talk-stage6-revision |

## Соглашение об именовании выходов

```
talks/{YYYY}-{slug}-summary.md           # extract
talks/{YYYY}-{slug}-git-archaeology.md   # research
talks/{YYYY}-{slug}-changelog-analysis.md
talks/{YYYY}-{slug}-timeline.md
talks/{YYYY}-{slug}-concepts.md          # concepts
talks/{YYYY}-{slug}-concepts-enriched.md
talks/{YYYY}-{slug}-angles.md            # position
talks/{YYYY}-{slug}-titre.md
talks/{YYYY}-{slug}-descriptions.md
talks/{YYYY}-{slug}-feedback-draft.md
talks/{YYYY}-{slug}-pitch.md             # script
talks/{YYYY}-{slug}-slides.md
talks/{YYYY}-{slug}-kimi-prompt.md
talks/{YYYY}-{slug}-revision-sheets.md   # revision
```

## Окончательный формат резюме

После завершения этапа 6 отобразите:

```
Pipeline complete. Files generated:

Stage 1: Extract
  v talks/{YYYY}-{slug}-summary.md

Stage 2: Research (REX only)
  v talks/{YYYY}-{slug}-git-archaeology.md
  v talks/{YYYY}-{slug}-changelog-analysis.md
  v talks/{YYYY}-{slug}-timeline.md

Stage 3: Concepts
  v talks/{YYYY}-{slug}-concepts.md
  v talks/{YYYY}-{slug}-concepts-enriched.md (if repo available)

Stage 4: Position
  v talks/{YYYY}-{slug}-angles.md
  v talks/{YYYY}-{slug}-titre.md
  v talks/{YYYY}-{slug}-descriptions.md
  v talks/{YYYY}-{slug}-feedback-draft.md

Stage 5: Script
  v talks/{YYYY}-{slug}-pitch.md
  v talks/{YYYY}-{slug}-slides.md
  v talks/{YYYY}-{slug}-kimi-prompt.md   <- copy-paste into kimi.com

Stage 6: Revision
  v talks/{YYYY}-{slug}-revision-sheets.md

Next step: open kimi-prompt.md, verify no {PLACEHOLDER} remains, paste into kimi.com.
```

## Anti-patterns

- Не запускайте этап 5 без явного выбора угла обзора и названия пользователем.
- Не запускайте этап 2 (исследование) в режиме `--concept`.
- Не переходите к следующему этапу, если на предыдущем этапе произошел сбой.
- Не придумывайте показатели или даты, которых нет в исходном материале.

## Валидация

- [ ] Все исходные файлы существуют до запуска нижестоящего этапа.
- [ ] Этап 4 CHECKPOINT соблюдается перед сценарием.
- [ ] Выходы названы согласно соглашению `talks/{YYYY}-{slug}-{stage}.md`
- [ ] Нет пустых заполнителей в сгенерированных файлах.

## <a name="tips"></a>Советы

- Оркестратор — рекомендуемая точка входа для первого использования.
- Для постоянных пользователей, которые знают конвейер, выполнение отдельных этапов навыков происходит быстрее.
- Флаг `--stage=X` полезен для повторного запуска одного этапа без повторного выполнения всего конвейера.

## Связанный

- [Этап 1: Извлечение](../stage-1-extract/SKILL.md)
- [Этап 2: Исследование](../stage-2-research/SKILL.md)
- [Этап 3: Концепции](../stage-3-concepts/SKILL.md)
- [Этап 4: Позиция](../stage-4-position/SKILL.md)
- [Этап 5: Сценарий](../stage-5-script/SKILL.md)
- [Этап 6: Редакция](../stage-6-revision/SKILL.md)
- [Полное руководство по рабочему процессу](../../../../guide/workflows/talk-pipeline.md)
