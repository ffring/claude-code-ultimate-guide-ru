---
name: update-releases
description: "Синхронизируйте выпуски Claude Code с GitHub CHANGELOG для руководства по YAML + посадка TypeScript"
argument-hint: "[--since <version>] [--dry-run]"
---

# Обновление выпусков Claude Code

Загрузите последние выпуски Claude Code из официального журнала изменений GitHub и синхронизируйте оба:
1. **Руководство YAML**: `/Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide/machine-readable/claude-code-releases.yaml`
2. **Посадка TS**: `/Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide-landing/src/data/releases.ts`

## Шаг 1: Анализ аргументов

- `--since <version>` — обрабатывать только версии строго новее этой
- `--dry-run` — показать запланированные изменения, ничего не писать
- Нет аргументов — автоматическое определение по полю `latest:` в текущем YAML.

## Шаг 2: Прочтите текущее состояние

Прочтите руководство YAML, чтобы получить:
- `latest`: текущая последняя версия (например, «2.1.66»)
- Полный список уже отслеживаемых версий

## Шаг 3. Получите официальный журнал изменений.

Используйте WebFetch для получения:
`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

Разберите все блоки `## X.Y.Z`. Для каждого блока извлеките:
- Строка версии (semver, без префикса «v»)
- Все пункты списка в виде списка основных моментов

## Шаг 4. Получение дат из реестра npm

Для каждой обнаруженной новой версии получайте дату публикации из npm:

```bash
npm view @anthropic-ai/claude-code time --json 2>/dev/null
```

Разберите JSON, чтобы получить даты ISO, преобразуйте в:
- Формат YAML: `YYYY-MM-DD`
- Формат лендинга: `Mon D, YYYY` (например, `Mar 5, 2026`)

Если выборка npm для какой-либо версии не удалась, используйте сегодняшнюю дату и запишите ее.

## Шаг 5. Определите новые версии

Сравните версии CHANGELOG с YAML. Версии в CHANGELOG, но не в YAML, являются новыми.

Если был передан `--since <version>`, учитывайте только версии > этой версии.

Отобразить пользователю:
```
Current latest: v2.1.66
New versions found: N
  - 2.1.67 (Mar 5, 2026): [first highlight]
  - 2.1.68 (Mar 6, 2026): [first highlight]
```

Если новых версий нет → отобразите «Уже обновлено. Последняя версия: vX.Y.Z» и выйдите.

Если `--dry-run`, показать полные запланированные различия для обоих файлов и выйти без записи.

Спросите: **"Обновление руководства YAML + посадка releases.ts? (y/n)"**

## Шаг 6. Руководство по обновлению YAML

Добавляйте новые версии в начало массива `releases:` (сначала самые новые). Отформатируйте каждую запись:

```yaml
- version: "X.Y.Z"
  date: "YYYY-MM-DD"
  highlights:
    - "⭐ Feature description"  # add ⭐ for: new commands, new MCP features, major additions
    - "Regular improvement"
    - "Fixed: bug description"
  breaking: []  # or list breaking changes if present
```

**⭐ эвристика**: добавьте префикс ⭐, если в выделенном фрагменте упоминается новая косая черта, новый тип ловушки, новая переменная API/env, новая функция MCP или существенное изменение рабочего процесса. Исправления НЕ получают ⭐.

Обновите поля верхнего уровня:
```yaml
latest: "X.Y.Z"  # newest version
updated: "YYYY-MM-DD"  # today
```

## Шаг 7. Обновите лендинг releases.ts.

Добавляйте новые выпуски в массив `releases`. Отформатируйте каждую запись:

```typescript
{
  version: 'vX.Y.Z',
  date: 'Mon D, YYYY',
  highlights: [
    '⭐ <strong>Feature Name</strong> — description with <code>command</code>',
    'Improvement description',
    'Fixed: bug description',
  ],
  latest: true,         // only on the newest version
  initiallyVisible: true,  // true if significant (has ⭐ or 3+ highlights), false if bugfix-only
  featured: true,          // only if has a ⭐ highlight
  featuredLabel: '⭐ Feature Name',  // label for the newest featured ⭐ item
},
```

**HTML правила форматирования:**
- Новые слэш-команды → `<code>/command</code>`
- Новые переменные окружения → `<code>ENV_VAR=value</code>`
- Технические термины → `<code>term</code>`
- Основные возможности → `⭐ <strong>Name</strong> — description`
- Исправления ошибок начинаются с → `Fixed: description`.

**`latest` флаг:** Устанавливайте `latest: true` только в самой новой версии. Удалите `latest: true` из предыдущей записи, в которой он был.

Логика **`initiallyVisible`:**
- `true`, если: есть ⭐ элементов, ИЛИ 3+ основных моментов, ИЛИ самая новая версия
- `false`, если: одиночный bugfix/patch

## Шаг 8. Обработка критических изменений

Если в основных моментах какой-либо новой версии упоминаются: «удалена», «устарела», «переименована», «перенесена», «исправление безопасности», «поломка» → проверьте, следует ли добавить ее в `breakingChanges` в `releases.ts`.

Если да, добавьте к `breakingChanges`:
```typescript
{ badge: 'Type', description: 'What changed with <code>code</code> (vX.Y.Z)' }
```

Варианты значков: `Security`, `Removed`, `OAuth`, `Install`, `Syntax`, `Behavior`.

## Шаг 9: Резюме

Показать окончательный итог:

```
✅ Guide YAML updated: +N versions (latest: vX.Y.Z)
✅ Landing releases.ts updated: +N releases
⚠️  Breaking changes added: [list if any, else "none"]

Next steps:
  cd /Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide
  git diff machine-readable/claude-code-releases.yaml

  cd /Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide-landing
  pnpm build  # validate before pushing
```
