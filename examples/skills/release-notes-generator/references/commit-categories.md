# Зафиксировать правила категоризации

Этот документ определяет, как классифицировать коммиты на основе формата обычных коммитов.

## Основные категории

### Особенности (`feat:`)
**CHANGELOG**: новые возможности
**Slack**: Да — всегда включать
**Examples**:
- `feat(dashboard): add export report system`
- `feat(search): add fuzzy matching`
- `feat(api): add batch operations endpoint`

### Исправления ошибок (`fix:`)
**CHANGELOG**: исправления ошибок
**Slack**: Да — если ориентирован на пользователя; Нет, если внутренний
**Examples**:
- `fix(auth): correct token refresh flow` -> Включить в Slack
- `fix(test): correct mock setup` -> НЕ включать в Slack

### Производительность (`perf:`)
**CHANGELOG**: Технические улучшения > Производительность
**Slack**: Да — упрощено («Улучшение производительности»)
**Examples**:
- `perf(api): optimize N+1 queries with batching`
- `perf(build): reduce bundle size by 30%`

### Безопасность (`security:` или `fix(security):`)
**CHANGELOG**: Безопасность
**Slack**: Да — всегда, с соответствующим уровнем детализации.
**Examples**:
- `security: fix CVE-2025-55182 dependency RCE`
- `fix(security): prevent XSS in user input`

## Вторичные категории (только CHANGELOG)

### Рефакторинг (`refactor:`)
**CHANGELOG**: Технические улучшения > Архитектура
**Slack**: Нет
**Examples**:
- `refactor(hooks): migrate to new pattern`
- `refactor(permissions): extract to service layer`

### Документация (`docs:`)
**CHANGELOG**: Документация (если она важна)
**Slack**: Нет
**Examples**:
- `docs: update CLAUDE.md with new patterns`
- `docs(api): add endpoint documentation`

### Тесты (`test:`)
**CHANGELOG**: Тесты (только подсчет)
**Slack**: Нет
**Examples**:
- `test(api): add endpoint integration tests`
- `test(e2e): add workflow tests`

### Домашние дела (`chore:`)
**CHANGELOG**: Нет (если не имеет существенного значения)
**Slack**: Нет
**Examples**:
- `chore: update dependencies`
- `chore(ci): fix workflow permissions`

### Стиль (`style:`)
**CHANGELOG**: Нет
**Slack**: Нет
**Examples**:
- `style: apply prettier formatting`
- `style(eslint): fix linting errors`

## Шаблоны области

Общие области применения:

| Область применения | Область |
|-------|------|
| `auth` | Аутентификация |
| `billing` | Выставление счетов и платежи |
| `api` | Конечные точки API |
| `ui` | Компоненты пользовательского интерфейса |
| `dashboard` | Возможности информационной панели |
| `notifications` | Система уведомлений |
| `search` | Функционал поиска |
| `user` | Управление пользователями |
| `db` | База данных и миграции |
| `permissions` | Система разрешений |
| `admin` | Админ-панель |

## Критические изменения

Обозначается `!` после type/scope или `BREAKING CHANGE:` в нижнем колонтитуле:
- `feat(api)!: change status enum`
- `fix(auth)!: require new token format`

**CHANGELOG**: раздел «Критические изменения»
**Slack**: Да — с инструкциями по миграции.

## Извлечение PR-номера

Извлеките номера PR из:
1. Сообщение фиксации: `(#123)`
2. Коммит слияния: `Merge pull request #123`
3. GitHub API: перекрестная ссылка с SHA фиксации

## Проблема со связью с трекером ошибок

Шаблоны совпадений:
- `[error-tracker]: PROJECT-XX`
- `fixes PROJECT-XX`
- `closes #XX` (проблема GitHub)

## Расчет статистики

Посчитайте для статистики релизов:
- **PRs**: уникальные номера PR.
- **Особенности**: `feat:` фиксирует
- **Bugs**: `fix:` фиксируется (исключая test/internal)
- **Улучшения**: `perf:` + `refactor:` + улучшения пользовательского интерфейса.
- **Security**: `security:` фиксирует
- **Breaking**: фиксируется с помощью `!` или `BREAKING CHANGE`.
