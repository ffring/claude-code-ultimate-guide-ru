# Шаблон раздела CHANGELOG

Используйте этот шаблон для создания записей CHANGELOG.md.

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Objective
[1-2 sentence summary of this release]

### New Features

#### [Feature Name] (#PR_NUMBER)
- **Description** : [Clear functional description]
- **Spec link** : [Link to spec if available]
- **Impacted components** : `component-a`, `service-b`, etc.
- **Impact** : [Who is affected: End-users / Admins / All]

### Bug Fixes

#### [Module/Component] (#PR_NUMBER)
- **Issue** : [Bug description]
- **Cause** : [Root cause identified]
- **Fix** : [Fix description]
- **[Error tracker]** : PROJECT-XX (if applicable)

### Technical Improvements

#### Performance
- [Optimization description with measurable impact if possible]

#### UI/UX
- [Interface improvement description]

#### Architecture
- [Significant refactoring description]

### Security
- **[CVE-XXXX-XXXXX]** : [Description and impact]

### Database Migrations

#### Deployment Process

**Step 1: Apply migrations**
```bash
[migration-command]
```

**Шаг 2. Скрипты переноса данных** (если применимо)
```bash
[data-migration-command]
```

**Проверка после миграции**
```sql
-- Verification queries
SELECT COUNT(*) FROM [table];
```

### Критические изменения

**None** или:

- **[Component/API]** : Описание критического изменения.
  - **Требуется миграция** : Как выполнить миграцию
  - **Impact** : Кто затронут

### Устаревания

**None** или:

- **[Функция X]**: в этой версии устарело.
  - **Причина** : Почему
  - **Alternative** : Что использовать вместо этого?
  - **Планируемое удаление** : Версия X.Y.Z

### Тесты
- [X] модульные тесты для [функции]
- [X] интеграционные тесты для [модуля]

### Статистика
- **PRs** : #XX, #YY, #ZZ
- **Затронутые файлы** : XX+
- **Новые таблицы** : [перечислить, если применимо]
- **Migrations** : X-миграции
- **Критические изменения** : 0

### Ссылки
- PR: https://github.com/{owner}/{repo}/pull/XXX
- Включенные PR: #XX, #YY, #ZZ.
- Проблемы с [отслеживанием ошибок]: PROJECT-XX
```
