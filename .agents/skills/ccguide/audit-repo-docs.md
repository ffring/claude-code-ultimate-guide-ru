---
name: audit-repo-docs
description: "Аудит документации репозитория на предмет соответствия более чем 85 лучшим практикам из claude-code-ultimate-guide"
---

# Навыки аудита документации

Анализируйте качество документации репозитория и создавайте рекомендации по улучшению на основе более чем 85 шаблонов из полного руководства Claude Code.

## Использование

```
/audit-repo-docs              # Audit only, generate markdown report
/audit-repo-docs --generate   # Audit + propose creating missing files
```

## <a name="workflow"></a>Рабочий процесс

### Этап 1: обнаружение (только чтение)

Сканируйте структуру репозитория, чтобы обнаружить существующие файлы документации.

**Файлы для проверки:**

```bash
# Root files
ls -la README.md VERSION CHANGELOG.md CLAUDE.md CONTRIBUTING.md LICENSE .gitignore 2>/dev/null

# Documentation structure
ls -la docs/ guide/ documentation/ 2>/dev/null

# Machine-readable
ls -la machine-readable/ llms.txt robots.txt 2>/dev/null

# Automation
ls -la scripts/*.sh 2>/dev/null

# Examples
find examples/ -type f 2>/dev/null | head -20
```

**Обнаружение шаблона:**

```bash
# Check README Quick Start
grep -n "Quick Start\|Getting Started\|Installation" README.md 2>/dev/null | head -3

# Check for badges
grep -c "\!\[.*\](.*badge.*)" README.md 2>/dev/null || echo "0"

# Check CHANGELOG format
head -20 CHANGELOG.md 2>/dev/null

# Check VERSION format
cat VERSION 2>/dev/null

# Check for TOC
grep -n "Table of Contents\|## Contents" README.md 2>/dev/null

# Check for metadata in docs
grep -rn "^---$\|author:\|date:\|version:" docs/ guide/ 2>/dev/null | head -10
```

### Этап 2: Оценка (30 критериев)

Оцените каждый критерий следующим образом: ✅ (присутствует), ⚠️ (частично), ❌ (отсутствует).

#### Категория 1: Корневые файлы (8 критериев, вес ×3)

| # | Критерий | Обнаружение | Очки |
|---|-----------|-----------|--------|
| 1.1 | README.md с быстрым запуском <40 строк | `head -50 README.md | grep -n "Quick Start"` | 3 |
| 1.2 | ВЕРСИЯ (одна семверная строка) | `cat VERSION` соответствует `^\d+\.\d+\.\d+$` | 3 |
| 1.3 | CHANGELOG.md (сохранять формат журнала изменений) | Имеет разделы `## [Unreleased]` или `## [x.y.z]`. | 3 |
| 1.4 | CLAUDE.md (инструкции по проекту) | Файл существует и содержит > 10 строк | 3 |
| 1.5 | CONTRIBUTING.md | Файл существует | 3 |
| 1.6 | ЛИЦЕНЗИЯ | Файл существует | 3 |
| 1.7 | .gitignore (разделы по категориям) | Имеет разделы комментариев `# Category` | 3 |
| 1.8 | Функциональные значки в README | Минимум 2 изображения значка | 3 |

#### Категория 2: Структура документации (7 критериев, вес ×2)

| # | Критерий | Обнаружение | Очки |
|---|-----------|-----------|--------|
| 2.1 | Отдельная папка с документами | `docs/` или `guide/` существует | 2 |
| 2.2 | Метаданные в документах (автор, дата, версия) | Фронтальная часть YAML в файлах .md | 2 |
| 2.3 | Оглавление с якорями | `## Table of Contents` или `## Contents` со ссылками | 2 |
| 2.4 | TL;DR или раздел быстрого запуска | Раздел существует в основном документе | 2 |
| 2.5 | Оценка времени | Упоминаются `Time:` или `minutes` или `hours` | 2 |
| 2.6 | Шпаргалка доступна | Файл с именем `cheatsheet.md` или аналогичный. | 2 |
| 2.7 | Примеры в отдельной папке | `examples/` с > 3 файлами | 2 |

#### Категория 3: Машиночитаемые (5 критериев, вес ×1)

| # | Критерий | Обнаружение | Очки |
|---|-----------|-----------|--------|
| 3.1 | llms.txt или эквивалент | Файл существует для индексации AI | 1 |
| 3.2 | Индекс YAML/JSON < 3 тыс. токенов | `machine-readable/` с индексным файлом | 1 |
| 3.3 | Номера строк для навигации | Ссылки типа `file.md:123` в документации | 1 |
| 3.4 | Версия синхронизирована | ВЕРСИЯ соответствует ссылкам в README, документы | 1 |
| 3.5 | Keywords/tags | Теги или ключевые слова в заставке | 1 |

#### Категория 4: Автоматизация (5 критериев, вес ×1)

| # | Критерий | Обнаружение | Очки |
|---|-----------|-----------|--------|
| 4.1 | Скрипт синхронизации версий | `scripts/*version*` или `scripts/*sync*` | 1 |
| 4.2 | Скрипт Check/verify | `scripts/*check*` или `scripts/*verify*` | 1 |
| 4.3 | --проверочный режим (пробный запуск) | Скрипт поддерживает флаг `--check`. | 1 |
| 4.4 | Интеграция CI/CD | `.github/workflows/` с рабочим процессом, связанным с документацией | 1 |
| 4.5 | Команды слэша задокументированы. | `.claude/commands/` с README или в CLAUDE.md | 1 |

#### Категория 5: Качество (5 критериев, вес ×2)

| # | Критерий | Обнаружение | Очки |
|---|-----------|-----------|--------|
| 5.1 | Таблицы для структурированных данных | Как минимум 3 таблицы уценок в документах. | 2 |
| 5.2 | Блоки кода с языковыми подсказками | ` ```language` используемый синтаксис | 2 |
| 5.3 | Складные элементы для дополнительного контента | Использованы теги `<details>` | 2 |
| 5.4 | Функционал перекрестных ссылок | Внутренние ссылки `[text](./path)` присутствуют | 2 |
| 5.5 | Нижний колонтитул с version/date | В последней строке упоминается версия или дата. | 2 |

### Этап 3: Подсчет очков

**Formula:**

```
Score = Σ(criteria_ok × weight) / Σ(max_weights) × 100

Max points:
- Root Files:     8 × 3 = 24
- Structure:      7 × 2 = 14
- Machine-Read:   5 × 1 = 5
- Automation:     5 × 1 = 5
- Quality:        5 × 2 = 10
─────────────────────────────
Total:            58 points
```

**Шкала оценок:**

| Счет | Оценка | Статус |
|-------|-------|--------|
| 90-100 | A | 🟢 Отлично |
| 75-89 | B | 🟢 Хорошо |
| 60-74 | C | 🟡 Нужна работа |
| 40-59 | D | 🟡 Значительные пробелы |
| 0-39 | F | 🔴 Критические проблемы |

### Этап 4: Создание отчета

Выведите этот точный формат:

```markdown
# 📋 Documentation Audit Report

**Repository**: {repo_name}
**Date**: {current_date}
**Score**: {score}/100 ({grade})

## Summary

| Category | Score | Status |
|----------|-------|--------|
| Root Files | {x}/8 | {emoji} {percent}% |
| Structure | {x}/7 | {emoji} {percent}% |
| Machine-Readable | {x}/5 | {emoji} {percent}% |
| Automation | {x}/5 | {emoji} {percent}% |
| Quality | {x}/5 | {emoji} {percent}% |

## 🔴 Critical Issues (Priority 1)

{List missing items from Root Files category - weight ×3}

## 🟡 Recommended Improvements (Priority 2)

{List missing items from Structure and Quality categories - weight ×2}

## 🟢 Quick Wins (Priority 3)

{List easy-to-add items from any category that take < 5 min}

## 📝 Suggested Templates

{For each critical/recommended missing item, provide a collapsible template}

<details>
<summary>{filename} template</summary>

\`\`\`{format}
{template content}
\`\`\`

</details>
```

### Этап 5: Необязательная генерация (флаг --generate)

Если `$ARGUMENTS` содержит `--generate`:

1. Список всех недостающих файлов, которые будут созданы
2. Запросите у пользователя одобрение: «Создать эти {n} файлов? (y/n/select)»
3. После одобрения создайте файлы, используя предоставленные шаблоны.
4. Сообщить о созданном

**Источники шаблонов:**

| Файл | Расположение шаблона |
|------|-------------------|
| Версия | Одна строка: `1.0.0` |
| CHANGELOG.md | `examples/templates/` или сохранить формат журнала изменений |
| CONTRIBUTING.md | Стандартное руководство для участников |
| llms.txt | `machine-readable/llms.txt` в качестве ссылки |
| Шпаргалка | `guide/cheatsheet.md` в качестве ссылки |

## Пример вывода

```markdown
# 📋 Documentation Audit Report

**Repository**: my-awesome-project
**Date**: 2026-01-23
**Score**: 52/100 (D)

## Summary

| Category | Score | Status |
|----------|-------|--------|
| Root Files | 4/8 | 🟡 50% |
| Structure | 3/7 | 🟡 43% |
| Machine-Readable | 0/5 | 🔴 0% |
| Automation | 1/5 | 🔴 20% |
| Quality | 3/5 | 🟡 60% |

## 🔴 Critical Issues (Priority 1)

- Missing `VERSION` file (single source of truth for versioning)
- Missing `CHANGELOG.md` (track changes for users)
- Missing `CLAUDE.md` (AI context for Claude Code)
- No functional badges in README

## 🟡 Recommended Improvements (Priority 2)

- Add Table of Contents to README
- Create `examples/` folder with usage examples
- Add time estimates to documentation sections
- Create a cheatsheet for quick reference

## 🟢 Quick Wins (Priority 3)

- Add 2-3 badges to README (build status, version, license)
- Add `<details>` collapsibles for long code examples
- Add language hints to all code blocks

## 📝 Suggested Templates

<details>
<summary>VERSION template</summary>

```
1.0.0
```

</details>

<details>
<summary>CHANGELOG.md template</summary>

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

## [1.0.0] - YYYY-MM-DD

### Added
- First release
```

</details>

<details>
Шаблон <summary>CLAUDE.md</summary>

```markdown
# {Project Name} - Claude Code Context

## Project Overview

{Brief description of what the project does}

## Tech Stack

- {Language/Framework}
- {Key dependencies}

## Directory Structure

\`\`\`
src/           # Source code
tests/         # Test files
docs/          # Documentation
\`\`\`

## Commands

\`\`\`bash
# Install dependencies
{install_command}

# Run tests
{test_command}

# Build
{build_command}
\`\`\`

## Conventions

- {Coding convention 1}
- {Coding convention 2}

## Current Focus

{What you're currently working on - update this regularly}
```

</details>

<details>
Шаблон <summary>llms.txt</summary>

```
# {Project Name}

> {One-line description}

## Overview

{2-3 sentences explaining what this project does}

## Key Files

- README.md - Project overview
- src/ - Source code
- docs/ - Documentation

## Quick Start

1. {Step 1}
2. {Step 2}
3. {Step 3}

## Keywords

{keyword1}, {keyword2}, {keyword3}
```

</details>
```

## Validation

After implementation, test:

1. **On this repo (claude-code-ultimate-guide)**: Expected score ~95%
2. **On minimal repo**: Create temp repo with just README, verify gap detection
3. **Templates validity**: Ensure generated templates are syntactically correct