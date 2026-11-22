# Карты резюме: полное руководство Claude Code

См. [карточки для повторения на русском](ru/).

Одностраничные тематические листы для заметок формата А4, которые можно распечатать и держать под рукой. Каждый лист охватывает определенную концепцию из руководства с командами, таблицами и конкретными примерами.

58 листов на каждом языке, организованных в 3 визуальные серии. Исходники QMD и PDF-файлы формата A4 доступны на французском и английском языках, включая карту оснащения агента C14.

**Языки и форматы:**

| Формат | RU | В |
|--------|----|----|
| PDF (`recap-card-typst`) | 58 | 58 |
| EPUB/HTML | Непригодный | Непригодный |

## Строить

```bash
# Une fiche
cd fr && quarto render t01-commandes-essentielles.qmd --to recap-card-typst

# Toute la série FR
cd .. && ./render-recap-cards.sh fr

# FR + EN
./render-recap-cards.sh all
```

Проверка страниц (везде должно возвращать 1):

```bash
cd fr && for pdf in *.pdf; do echo "$pdf: $(pdfinfo "$pdf" | grep Pages | awk '{print $2}')"; done
```

## Технический стек

Выделенное расширение Quarto `recap-card-typst` в `../_extensions/recap-card/`. Bold Guy Palette (теплый беж + жженый оранжевый). Тот же набор, что и в развернутых технических документах.

---

## Техническая серия — 22 листа.

Краткая справка. Команды, конфигурация, инструменты, разрешения.

| Форма | Файл | Заголовок | Сложность |
|-------|---------|-------|------------|
| T01 | `01-commandes-essentielles.qmd` | Основные команды и сочетания клавиш | Новичок |
| T02 | `t02-mode-non-interactif.qmd` | Неинтерактивный и безголовый режим | Средний |
| T03 | `03-permission-modes.qmd` | Режимы разрешений | Новичок |
| T04 | `t04-permissions-glob-patterns.qmd` | Разрешения: шаблоны Glob и белый список | Средний |
| T05 | `06-hierarchie-configuration.qmd` | Иерархия конфигурации | Новичок |
| T06 | `t06-settings-json.qmd` | Settings.json — Полная структура | Средний |
| T07 | `t07-claudemd-best-practices.qmd` | CLAUDE.md Лучшие практики | Средний |
| T08 | `t08-auto-memories.qmd` | Автозапоминания — когда и как | Средний |
| T09 | `t09-workspace-hygiene.qmd` | Гигиена рабочего места и .claudeignore | Новичок |
| T10 | `t10-config-multi-machine.qmd` | Многомашинная конфигурация и резервное копирование | Средний |
| T11 | `t11-search-tools-decision.qmd` | Инструменты поиска Дерево решений | Средний |
| T12 | `t12-mcp-servers-overview.qmd` | Обзор серверов MCP | Средний |
| T13 | `t13-context7-sequential.qmd` | Контекст7 и последовательный MCP | Средний |
| T14 | `t14-grepai-semantic-search.qmd` | Grepai — Семантический поиск | Средний |
| T15 | `t15-mcp-secrets-management.qmd` | MCP Управление секретами | Передовой |
| T16 | `t16-sandbox-natif-architecture.qmd` | Нативная песочница — Архитектура | Передовой |
| T17 | `t17-sandbox-natif-vs-docker.qmd` | Песочница: Натив против Docker | Передовой |
| T18 | `t18-modeles-thinking-modes.qmd` | Модели и режимы мышления | Новичок |
| T19 | `t19-context-window-200k-1m.qmd` | Контекстное окно: 200 тыс. против 1 млн. | Средний |
| T20 | `t20-token-optimization.qmd` | Оптимизация токенов | Средний |
| T21 | `t21-fast-mode-api.qmd` | Быстрый режим и критические изменения API | Средний |
| T22 | `t22-third-party-tools.qmd` | Сторонние инструменты | Средний |

---

## Серия «Методология» — 22 листа.

Как работать. Рабочие процессы, агенты, CI/CD, отладка.

| Форма | Файл | Заголовок | Сложность |
|-------|---------|-------|------------|
| M01 | `m01-workflow-quotidien.qmd` | Ежедневный рабочий процесс | Новичок |
| M02 | `04-context-management.qmd` | Управление контекстом | Новичок |
| M03 | `m03-sessions-continuité.qmd` | Сессии и непрерывность | Средний |
| M04 | `m04-compact-vs-clear.qmd` | Компактный и прозрачный | Новичок |
| M05 | `m05-plan-mode.qmd` | Модный план | Средний |
| M06 | `m06-task-management-system.qmd` | Система управления задачами | Средний |
| M07 | `m07-todowrite-vs-tasks-api.qmd` | TodoWrite против задач API | Средний |
| M08 | `m08-agents-custom.qmd` | Пользовательские агенты | Средний |
| M09 | `m09-slash-commands.qmd` | Слэш-команды | Средний |
| M10 | `m10-skills.qmd` | Навыки | Средний |
| M11 | `m11-hooks-evenements-systeme.qmd` | Хуки: события и система | Средний |
| M12 | `m12-hooks-patterns-concrets.qmd` | Хуки: бетонные узоры | Средний |
| M13 | `m13-worktrees.qmd` | Рабочие деревья | Передовой |
| M14 | `m14-plan-validate-execute.qmd` | Конвейер планирования-проверки-выполнения | Передовой |
| M15 | `m15-tdd-bdd-sdd.qmd` | Рабочие процессы TDD/BDD/SDD | Средний |
| M16 | `m16-multi-agent-topologie.qmd` | Мультиагентность: топология и оркестровка | Передовой |
| M17 | `m17-multi-agent-communication-trust.qmd` | Мультиагент: коммуникация и доверие | Передовой |
| M18 | `m18-event-driven-agents.qmd` | Агенты, управляемые событиями | Передовой |
| M19 | `m19-github-actions.qmd` | GitHub Actions + Claude Code | Передовой |
| M20 | `m20-cicd-production.qmd` | CI/CD и безопасность производства | Передовой |
| M21 | `m21-debug-methodique.qmd` | Методическая отладка | Средний |
| M22 | `m22-observabilite-jsonl.qmd` | JSONL и jq Наблюдаемость | Передовой |

---

## Дизайнерская серия: 14 листов.

Как подумать и решить. Ментальные модели, стратегия, безопасность по замыслу.

| Форма | Файл | Заголовок | Сложность |
|-------|---------|-------|------------|
| C01 | `c01-trust-calibration.qmd` | Калибровка доверия и ментальная модель | Новичок |
| C02 | `c02-prompting-basics.qmd` | Основы работы с Claude Code | Новичок |
| C03 | `c03-xml-prompting-anchors.qmd` | XML-подсказки и семантические привязки | Передовой |
| C04 | `c04-commands-skills-plugins-agents.qmd` | Команды, навыки, плагины и агенты | Средний |
| C05 | `c05-memory-stack.qmd` | Стек памяти (4 уровня) | Средний |
| C06 | `c06-configuration-decision-guide.qmd` | Руководство по выбору конфигурации | Средний |
| C07 | `c07-conventions-equipe-scale.qmd` | Крупномасштабные командные съезды | Передовой |
| C08 | `c08-surface-attaque-menaces.qmd` | Поверхность атаки и угрозы | Средний |
| C09 | `c09-prompt-injection-defenses.qmd` | Быстрая инъекция: защита | Средний |
| C10 | `c10-ai-traceability.qmd` | Отслеживание ИИ | Средний |
| C11 | `c11-subscription-vs-api-patterns.qmd` | Подписка против API: структура затрат | Средний |
| C12 | `c12-agent-sdk-integrations-ide.qmd` | Интеграция агента SDK и IDE | Передовой |
| C13 | `25-erreurs-courantes.qmd` | Распространенные ошибки | Новичок |
| C14 | `c14-agent-harness-map.qmd` | Карта снаряжения агента | Передовой |

---

## Добавить запись

1. Создайте файл `.qmd` в `fr/` со следующей заставкой:

```yaml
---
title: "Titre"
subtitle: "Sous-titre"
card-number: "T23"
category: "Technique"
difficulty: "intermediate"
guide-version: "3.37.0"
author: "Florian BRUNIAUX"
version: "3.37.0"
date: "Mars 2026"
layout: "two-col"
lang: fr
format:
  recap-card-typst: default
---
```

2. Компилировать: `cd fr && quarto render ma-fiche.qmd --to recap-card-typst`
3. Проверьте: `pdfinfo ma-fiche.pdf | grep Pages` должен вернуть `1`.
4. Обновите этот README

## Ограничения формата

- 1 страница строгого формата А4 (2 столбца, поля 1,2 см)
- Блоки кода: максимум 6-7 строк.
- Таблицы: максимум 6–7 строк данных.
- Проза: 2-4 предложения в абзаце.
- Никаких выносок Quarto и специальных элементов div.

## Файлы расширения

```
../_extensions/recap-card/
  _extension.yml
  typst-template.typ    -> ../whitepaper/recap-card-template.typ (source)
  typst-show.typ        -> ../whitepaper/recap-card-show.typ (source)
```

Канонические исходники находятся в `../_extensions/whitepaper/`. Обновите оба, если внесены изменения.
