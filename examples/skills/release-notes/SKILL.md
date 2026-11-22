---
name: release-notes
description: "Создание примечаний к выпуску в нескольких форматах на основе коммитов git."
argument-hint: "[--from <tag>] [--format md|slack]"
effort: medium
when_to_use: "Use when preparing a release and need notes in multiple formats."
disable-model-invocation: true
---

# Генератор примечаний к выпуску

Создавайте примечания к выпуску в трех форматах на основе коммитов git для производственных выпусков.

## Процесс

1. **Анализ истории Git**: сканирование коммитов с момента последнего тега выпуска
2. **Получить сведения о PR**: получить заголовки и описания через `gh api`
3. **Категоризировать изменения**: Группировать по типу (исполнение, исправление, производительность и т. д.)
4. **Проверить миграцию**: Обнаружение файлов миграции базы данных
5. **Создать 3 выхода**: CHANGELOG, тело PR, коммуникационное сообщение
6. **Transform Language**: преобразование технического жаргона в язык продукта.

## Выходные форматы

### 1. Раздел CHANGELOG.md

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Summary
[1-2 sentence overview of this release]

### New Features
#### [Feature Name] (#PR)
- **Description**: User-facing functionality added
- **Impact**: How it benefits users

### Bug Fixes
- **[Module]**: Description (#issue, tracking-ID)

### Technical Improvements
- [Internal improvements, refactoring, performance]

### Database Migrations
[If applicable - list migration files]

### Statistics
- PRs: X | Features: Y | Fixes: Z | Files changed: N
```

### 2. Тело PR-релиза

Использует шаблон выпуска вашего проекта:
- `.github/PULL_REQUEST_TEMPLATE/release.md`
- `.github/pull_request_template_release.md`
- Или пользовательское местоположение, указанное в конфигурации проекта.

### 3. Сообщение о связи

Создайте объявление для пользователя (Slack, электронная почта и т. д.):
- Нетехнический язык
- Сосредоточьтесь на влиянии на пользователя
- Читабельное форматирование (смайлики необязательно)

Примеры расположения шаблонов:
- `.github/COMMUNICATION_TEMPLATE/slack-release.md`
- `docs/templates/release-announcement.md`

## Оповещение о миграции

**Если обнаружена миграция:**

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  [ATTENTION] DATABASE MIGRATIONS REQUIRED                    ║
╠══════════════════════════════════════════════════════════════════╣
║  This release contains X migration(s):                           ║
║  • 20250110_add_user_preferences                                 ║
║  • 20250112_create_audit_log_table                               ║
║  Action required: Run migration command after deployment         ║
╚══════════════════════════════════════════════════════════════════╝
```

**Если нет миграции:**
```
✅ [OK] No database migrations required
```

## Преобразование технологии в продукт

Преобразование технических коммитов в удобные для пользователя описания:

| Технический | Product/User Язык |
|-----------|----------------------|
| «Оптимизация запросов N+1 с помощью DataLoader» | «Ускоренная загрузка списков» |
| «Реализация встраивания ИИ с помощью pgvector» | «Новая функция интеллектуального поиска» |
| «Исправить ошибку с областью разрешений» | «Решена проблема доступа для определенных пользователей» |
| «Веб-пакет миграции -> Турбопак» | *Только внутренний – не связываться* |
| «Рефакторинг архитектуры перехватов React» | *Только внутренний – не связываться* |
| «Добавьте ограничение скорости на конечные точки API» | «Улучшенная стабильность и безопасность системы» |

## Категории коммитов

| Префикс | Категория | Включить в объявление? |
|--------|----------|--------------------------|
| `feat:` | Новые возможности | Да |
| `fix:` | Исправления ошибок | Да (если ориентирован на пользователя) |
| `perf:` | Производительность | Да (упрощенно) |
| `security:` | Безопасность | Да |
| `refactor:` | Архитектура | Нет |
| `chore:` | Обслуживание | Нет |
| `docs:` | Документация | Нет |
| `test:` | Тесты | Нет |
| `build:` | Система сборки | Нет |
| `ci:` | CI/CD | Нет |

## Команды для выполнения

```bash
# 1. Get last release tag
LAST_TAG=$(git tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1)

# 2. List commits since tag (excluding merges)
git log $LAST_TAG..HEAD --oneline --no-merges

# 3. Get commit details with PR numbers
git log $LAST_TAG..HEAD --format="%h %s" --no-merges

# 4. Check for migrations (adjust path to your ORM)
# Prisma:
git diff $LAST_TAG..HEAD --name-only -- prisma/migrations/
# Sequelize:
git diff $LAST_TAG..HEAD --name-only -- migrations/
# Django:
git diff $LAST_TAG..HEAD --name-only -- '**/migrations/*.py'
# Alembic:
git diff $LAST_TAG..HEAD --name-only -- alembic/versions/

# 5. Get PR details via GitHub CLI
gh api repos/{owner}/{repo}/pulls/{number}

# 6. Count statistics
TOTAL_PRS=$(git log $LAST_TAG..HEAD --oneline --merges | wc -l)
FEATURES=$(git log $LAST_TAG..HEAD --oneline --no-merges | grep -c 'feat:')
FIXES=$(git log $LAST_TAG..HEAD --oneline --no-merges | grep -c 'fix:')
```

## Семантическое управление версиями

Определите номер версии на основе изменений:

| Тип изменения | Версия | Пример |
|-------------|--------------|---------|
| Критические изменения | МАЙОР (X.0.0) | API удален, несовместимое изменение. |
| Новая функция | МИНОР (0.X.0) | Новая функциональность, обратная совместимость |
| Исправление ошибок/патч | ПАТЧ (0.0.X) | Только исправления ошибок |

**Indicators**:
- `BREAKING CHANGE:` в теле коммита → MAJOR
- `feat:` совершает настоящее → MINOR
- Только `fix:` / `perf:` → ПАТЧ

## Интеграция рабочих процессов

Типичный рабочий процесс выпуска:

```
1. Verify all PRs merged to develop branch
2. Run: /release-notes (or specify version/range)
3. Review generated outputs for accuracy
4. Create PR: develop -> main with "release" label
5. Add generated CHANGELOG section to CHANGELOG.md
6. Use generated PR body as PR description
7. After merge: Create and push git tag
8. Post communication announcement (Slack/email/etc.)
9. Monitor deployment and migrations
```

## Создание тега Git

После слияния PR создайте аннотированный тег:

```bash
# Create annotated tag
git tag -a v1.2.3 -m "Release v1.2.3: Brief description"

# Push tag to remote
git push origin v1.2.3

# Or push all tags
git push --tags
```

## Индивидуальная настройка проекта

Адаптируйте эти пути к своему проекту:

```
# Migration detection (adjust ORM path)
prisma/migrations/        → Your ORM migration directory
db/migrate/               → Rails migrations
alembic/versions/         → Alembic migrations

# Template files (create if needed)
.github/PULL_REQUEST_TEMPLATE/release.md
.github/COMMUNICATION_TEMPLATE/announcement.md
docs/templates/release-notes.md
```

## <a name="tips"></a>Советы

- **Запуск из корня репозитория**: обеспечивает правильную работу команд git.
- **Аутентификация GitHub CLI**: при необходимости запустите `gh auth login`.
- **Проверка перед публикацией**: Всегда проверяйте созданный контент.
- **Критические изменения**: Поиск сообщений о фиксации для `BREAKING CHANGE:`
- **Связанные проблемы**: включите номера issue/ticket для отслеживания.
- **Миграция баз данных**: тестирование на этапе подготовки перед производством

## Краевые случаи

| Сценарий | Поведение |
|----------|----------|
| Теги не найдены | Начать с первого коммита |
| Никаких коммитов с момента последнего тега | Ошибка: «Нет изменений в выпуске» |
| Несколько тегов в одном коммите | Использовать самые последние по дате |
| Предварительные теги (v1.0.0-beta.1) | Исключить из поиска «последний выпуск» |
| Фиксирует без обычного формата | Отнести к категории «Другие изменения». |

## Примеры использования

```bash
# Generate release notes from last tag to HEAD
/release-notes

# Specify version manually
/release-notes v1.5.0

# Specify range
/release-notes from v1.4.0 to HEAD

# Preview without creating files
/release-notes --preview

# Include pre-release commits
/release-notes --include-pre-release
```

Version/Range: $АРГУМЕНТЫ
