---
name: release-notes-generator
description: "Создавайте примечания к выпуску в трех форматах (CHANGELOG.md, тело PR, объявление Slack) на основе коммитов git. Автоматически классифицирует изменения и преобразует технический язык в удобный для пользователя формат сообщений. Используйте для выпусков, журналов изменений, примечаний к версиям, сводок новостей или объявлений о выпуске."
allowed-tools: Bash
effort: low
---

# Генератор примечаний к выпуску

Создавайте подробные примечания к выпуску в трех форматах на основе коммитов git.

## <a name="workflow"></a>Рабочий процесс

1. **Анализ истории git** с момента последнего тега выпуска или указанной версии
2. **Получить сведения о PR** (названия, описания, метки) через `gh api`
3. **Разделить изменения** на функции, исправления ошибок, улучшения, безопасность и критические изменения.
4. **Создать 3 выходных данных**: раздел CHANGELOG.md (технический), текст PR-релиза (полутехнический), сообщение Slack (удобный для пользователя)
5. **Преобразование языка** из технического жаргона в доступный обмен сообщениями
6. **Оповещать о миграции**, если обнаружена миграция базы данных

## Как использовать

### Основное использование

```
Generate release notes since last release
```

```
Create release notes for version 0.18.0
```

### С конкретным диапазоном

```
Generate release notes from v0.17.0 to HEAD
```

### Только предварительный просмотр

```
Preview release notes without writing files
```

## Выходные форматы

### 1. Раздел CHANGELOG.md

Технический формат для разработчиков:

```markdown
## [0.18.0] - 2025-12-08

### Objective
[1-2 sentence summary]

### New Features
#### [Feature Name] (#PR)
- **Description**: ...
- **Impact**: ...

### Bug Fixes
- **[Module]**: Description (#issue, [error-tracker] ISSUE-XX)

### Technical Improvements
#### Performance / UI/UX / Architecture
- [Description]

### Database Migrations
[If applicable]

### Statistics
- PRs: X
- Features: Y
- Bugs: Z
```

### 2. Тело PR-релиза

Использует шаблон из `.github/PULL_REQUEST_TEMPLATE/release.md`:
- Краткое описание цели
- Характеристики со ссылками на характеристики
- Исправлены ошибки со ссылками на трекер ошибок.
- Улучшения по категориям
- Инструкции по миграции
- Контрольный список развертывания

### 3. Слабое объявление

Продуктоориентированный формат от `.github/COMMUNICATION_TEMPLATE/slack-release.md`:
- Ссылка **PR** включена для отслеживания
- Нетехнический язык
- Сосредоточьтесь на влиянии на пользователей (конечных пользователей, администраторов, заинтересованных сторон)
- Эмодзи для удобства чтения
- Сводная статистика

## Интеграция рабочих процессов

Этот навык интегрируется с рабочим процессом выпуска:

```
1. Analyze commits: git log <last-tag>..HEAD
2. Determine version number (MAJOR.MINOR.PATCH)
3. Generate 3 outputs
4. Create PR develop -> main with "Release" label
5. Update CHANGELOG.md
6. After merge: create git tag
7. Generate Slack announcement
```

## Преобразование технологии в продукт

Навык автоматически преобразует технический язык:

| Технический | Продукт |
|-----------|---------|
| «Оптимизация запросов N+1 с помощью DataLoader» | «Быстрая загрузка списка» |
| «Реализация встраивания ИИ с помощью pgvector» | «Новый интеллектуальный поиск» |
| «Исправить разрешения области в getPermissionScope()» | «Исправлена ​​ошибка с правами доступа» |
| «Веб-пакет миграции -> Турбопак» | *Не общаться* |
| «Рефакторинг хуков React» | *Не общаться* |
| «Исправить N+1 в загрузчиках пользователей» | «Улучшение производительности» |
| «Добавить логику повтора при ошибках подключения к БД» | «Лучшая стабильность соединения» |

## Категории коммитов

Коммиты классифицируются по обычному префиксу фиксации:

| Префикс | Категория | Включить в Slack? |
|--------|----------|-------------------|
| `feat:` | Новые возможности | Да |
| `fix:` | Исправления ошибок | Да (если ориентирован на пользователя) |
| `perf:` | Производительность | Да (упрощенно) |
| `security:` | Безопасность | Да |
| `refactor:` | Архитектура | Нет |
| `chore:` | Обслуживание | Нет |
| `docs:` | Документация | Нет |
| `test:` | Тесты | Нет |
| `style:` | Стиль | Нет |

## Формат вывода консоли

При создании примечаний к выпуску ВСЕГДА отображайте в консоли четкое описание:

### Оповещение о миграции (КРИТИЧНО)

Если обнаружены миграции, отобразите их на видном месте:

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  [WARNING] DATABASE MIGRATIONS REQUIRED                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This release contains X migration(s):                           ║
║                                                                  ║
║  • 20251210123456_add_feature_description                        ║
║  • 20251211094532_update_status_enum                             ║
║                                                                  ║
║  Action required BEFORE deployment:                              ║
║  → Run: [migration-command]                                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

Если НЕТ миграции:

```
✅ [OK] No database migrations required
```

### Метод обнаружения

Проверьте наличие новых файлов миграции с момента последнего выпуска:

```bash
# Find new migrations since last tag
git diff <last-tag>..HEAD --name-only -- migrations/
```

## Пример

**User**: «Создавать примечания к выпуску, начиная с версии 0.17.0»

**Output**:

```
Analyzing commits from v0.17.0 to HEAD...

Found:
- 15 commits
- 8 PRs merged
- 2 new features
- 5 bug fixes
- 3 improvements

╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  [WARNING] DATABASE MIGRATIONS REQUIRED                      ║
╠══════════════════════════════════════════════════════════════════╣
║  This release contains 1 migration(s):                           ║
║  • 20251208143021_add_user_preferences                           ║
║  Action required: [migration-command]                             ║
╚══════════════════════════════════════════════════════════════════╝

--- CHANGELOG.md Section ---
[Technical format output]

--- PR Release Body ---
[Semi-technical format output]

--- Slack Announcement ---
[Product-focused format output]

Write to files? (CHANGELOG.md, clipboard for PR/Slack)
```

## Используемые команды

```bash
# Get last release tag
git tag --sort=-v:refname | head -n 1

# List commits since tag
git log <tag>..HEAD --oneline --no-merges

# Get PR details
gh api repos/{owner}/{repo}/pulls/{number}

# Get commit details
git show --stat <sha>
```

## <a name="tips"></a>Советы

- Запуск из корня репозитория
- Убедитесь, что `gh` CLI аутентифицирован.
- Просматривайте созданный контент перед публикацией
- Настройте язык продукта для вашей аудитории
- Используйте `--preview`, чтобы увидеть вывод без записи.

## Справочные файлы

- `assets/changelog-template.md` - Шаблон раздела CHANGELOG
- `assets/slack-template.md` — шаблон объявления Slack
- `references/tech-to-product-mappings.md` — Правила трансформации
- `references/commit-categories.md` — Правила категоризации

## Сопутствующие навыки

- `github-actions-templates` — для рабочих процессов CI/CD.
- `changelog-generator` — Оригинальное вдохновение (ComposioHQ)
