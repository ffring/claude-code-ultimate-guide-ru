---
name: release
description: "Версия руководства по выпуску (CHANGELOG + VERSION + README + синхронизация приземления + фиксация + push)"
argument-hint: "<patch|minor|major>"
---

# Рабочий процесс выпуска руководства

Выпустите новую версию полного руководства Claude Code.

## Использование

```
/release patch    # 3.20.4 → 3.20.5
/release minor    # 3.20.4 → 3.21.0
/release major    # 3.20.4 → 4.0.0
```

## Шаг 1. Подтвердите

1. Разобрать `$ARGUMENTS` — должен быть ровно один из: `patch`, `minor`, `major`. Если отсутствует или недействителен, спросите.
2. Запустите `git status` в репозитории руководств. Если рабочее дерево чистое и без поэтапных изменений, прервите: «Нечего выпускать».
3. Читать файл `VERSION` → текущая версия.

## Шаг 2: Вычислить новую версию

Примените семверный удар к текущей версии:
- `patch`: X.Y.Z → X.Y.(Z+1)
- `minor`: X.Y.Z → X.(Y+1).0
- `major`: X.Y.Z → (X+1).0.0

Запишите новую версию в `VERSION`.
Дисплей: `3.20.4 → 3.20.5 (patch)`

## Шаг 3. Черновик записи CHANGELOG

**НЕ генерировать автоматически из diff.**. Вместо этого:

1. Запустите `git diff --stat` и `git diff --name-only`, чтобы определить измененные области.
2. Запустите `git log --oneline` с момента последнего tag/release, чтобы увидеть последние коммиты.
3. Прочтите измененные файлы, чтобы понять, что изменилось.
4. **Draft** структурированная запись CHANGELOG:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- [new features, new files, new sections]

### Changed
- [modifications to existing content]

### Fixed
- [corrections, bug fixes]
```

5. **Представьте черновик пользователю** и попросите подтверждения или внесения изменений.
6. Только после одобрения вставьте в `CHANGELOG.md` после строки `## [Unreleased]`.

## Шаг 4. Обновление счетчиков

Рассчитаем текущие показатели:

```bash
# Quiz questions count (sum across all YAML files)
grep -r '  - id:' quiz/questions/ | wc -l
# Templates count
find examples/ -type f \( -name "*.md" -o -name "*.sh" -o -name "*.ps1" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" \) -not -name "README.md" -not -name "index.md" | wc -l
# Guide lines
wc -l guide/ultimate-guide.md
```

Обновите эти счетчики, где бы они ни появлялись:
- `README.md`
- `machine-readable/reference.yaml`
- `CLAUDE.md` (ссылка на ВЕРСИЮ в таблице ключевых файлов)
- `llms.txt` (корневой) — версия, последнее обновление, строки, шаблоны, тест (всего 3 экземпляра)
- `llms-full.txt` (корневой) — те же поля метаданных + следующие дополнительные вхождения:
  - Раздел «Для обучения»: текст URL-адреса `Interactive Quiz (N questions)`.
  - Заголовок раздела «Библиотека шаблонов (N шаблонов)»
  - Ответ на часто задаваемые вопросы (первая запись в часто задаваемых вопросах, строка начинается с «A: Наиболее полный...»)
  - Комментарий к дереву репо: `quiz/ # N-question interactive quiz`
- `machine-readable/llms.txt` — всегда должен быть идентичен корневому `llms.txt`.

Обновляйте только те значения, которые действительно изменились. Не трогайте счетчики, которые все еще верны.

**Verification Gate — запустите после обновления, прежде чем перейти к шагу 5:**

```bash
VERSION=$(cat VERSION)
QUIZ=$(grep -r '  - id:' quiz/questions/ | wc -l | tr -d ' ')
TEMPLATES=$(find examples/ -type f \( -name "*.md" -o -name "*.sh" -o -name "*.ps1" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" \) -not -name "README.md" -not -name "index.md" | wc -l | tr -d ' ')

echo "=== llms.txt check ==="
grep "Version:\|Quiz Questions:\|Production Templates:" llms.txt

echo "=== llms-full.txt check ==="
grep "Version:\|Quiz Questions:\|Production Templates:\|Template Library\|question interactive" llms-full.txt

echo "=== machine-readable/llms.txt check ==="
grep "Version:\|Quiz Questions:\|Production Templates:" machine-readable/llms.txt

echo "=== Expected: VERSION=$VERSION QUIZ=$QUIZ TEMPLATES=$TEMPLATES ==="
```

Во всех трех файлах должны быть одинаковые значения. Если есть несоответствия, исправьте их, прежде чем продолжить.

## Шаг 5. Синхронизация версии

```bash
./scripts/sync-version.sh
```

Это распространяет версию на: README.md, cheatsheet.md, ultimate-guide.md, reference.yaml.

**Также обновляет**:
- Значок «Последнее обновление» в README.md (дата + версия)
- Дата в нижнем колонтитуле в формате README.md («Обновляется ежедневно · 10 февраля 2026 г.»)

## Шаг 5.5. Синхронизация содержимого сервера MCP

`mcp-server/content/` — это объединенная копия трех исходных файлов, опубликованная в npm. Он НЕ обновляется автоматически, синхронизируется вручную каждый выпуск:

```bash
cp machine-readable/claude-code-releases.yaml mcp-server/content/claude-code-releases.yaml
cp machine-readable/reference.yaml mcp-server/content/reference.yaml
cp llms.txt mcp-server/content/llms.txt

# Bump mcp-server/package.json version (patch, unless tool code also changed → minor)
cd mcp-server && npm run build && cd ..
```

Зафиксируйте `mcp-server/content/*` + `mcp-server/package.json` (dist/ игнорируется, перестраивается во время публикации).

**Publish** (необратимый, общедоступный — всегда уточняйте у пользователя перед запуском):
```bash
cd mcp-server && npm publish && cd ..
```

## Шаг 6: Синхронизируйте посадку

Рабочий каталог: `/Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide-landing/`

1. Обновить версию руководства в `index.html` (нижний колонтитул + разделы FAQ)
2. Обновить количество вопросов викторины в `index.html`, `quiz/index.html`, `learning/index.html`, если оно изменилось.
3. Шаблоны обновлений учитываются в `index.html`, `examples/index.html`, если они были изменены.
4. Если файлы теста YAML были изменены, скомпилируйте их:
   ```bash
   ./scripts/compile-questions.sh
   ```
5. Обновите `CLAUDE.md` в целевом репозитории, если количество изменилось.

**Ворота проверки:**
```bash
./scripts/check-landing-sync.sh
```
Должен пройти с 0 проблемами. В случае неудачи исправьте несоответствия и повторяйте попытку, пока она не пройдет.

## Шаг 6.5: Добавьте запись RSS

В репозитории лендинга добавьте запись `src/data/rss-entries.ts`:

1. Прочтите только что созданную запись CHANGELOG (Шаг 3).
2. Составьте запись типа `guide_release`:

```typescript
{
  type: 'guide_release',
  title: 'Claude Code Ultimate Guide vX.Y.Z',
  date: 'Mon DD, YYYY',   // today's date, same format as releases.ts
  description: '[1-2 sentences from CHANGELOG highlights, plain text no HTML]',
  link: 'https://cc.bruniaux.com/releases/',
},
```

3. **Prepend** — он находится в верхней части массива `rssEntries` (самые новые — первыми).
4. Представьте проект пользователю. При необходимости скорректируйте формулировку, а затем напишите.

**Rule**: всегда добавляйте запись для patch/minor/major — даже небольшие исправления стоит отслеживать.

## Шаг 7: Зафиксируйте и отправьте оба репозитория

### Руководство по репозиторию

```bash
cd /Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide
git add [all modified files — list them explicitly]
git commit -m "release: vX.Y.Z - [short description from CHANGELOG]

[2-3 line summary of main changes]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push
```

### Лендинг-репо

```bash
cd /Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide-landing
git add [all modified files — list them explicitly]
git commit -m "sync: guide vX.Y.Z - [short description]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push
```

## Шаг 8: Резюме

Display:

```
Release vX.Y.Z Complete

Guide:   commit [hash] ([N] files)
Landing: commit [hash] ([N] files)
Sync:    All checks passed

Changes:
- [CHANGELOG summary, 2-3 bullets]

Tip: Run `/guide-recap latest` to generate social posts for this release.
```

## Обработка ошибок

- **Без аргументов** → Спросите: «Какой тип выступа? (patch/minor/major)»
- **Очистить рабочее дерево** → Прервать: «Нечего выпускать. Сначала зафиксируйте изменения».
- **Проверка синхронизации не удалась** → Исправьте и повторите проверку (не фиксируйте ошибки синхронизации)
- **Git push не удалось** → Показать ошибку, не выполнять откат

## Связь с другими командами

| Команда | Цель |
|---------|---------|
| `/release` | Выпустите само руководство (ЭТО) |
| `/update-infos-release` | Отслеживайте релизы Anthropic Claude Code |
| `/sync` | Проверка статуса синхронизации (только чтение) |
| `/version` | Версии отображения (только чтение) |
| `/changelog` | Просмотр записей CHANGELOG (только чтение) |

Никакого дублирования: `/release` управляет выпусками руководств, `/update-infos-release` управляет отслеживанием выпусков CC.