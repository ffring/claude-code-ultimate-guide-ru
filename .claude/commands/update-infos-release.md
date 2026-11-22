---
name: update-infos-release
description: "Отслеживание выпусков обновлений Claude Code (руководство + посадка + обновление версии)"
argument-hint: "[bump-type]"
---

# Рабочий процесс управления релизами

Автоматизируйте отслеживание выпусков Claude Code и руководство по управлению версиями.

## Использование

```
/update-infos-release          # Update CC releases only (no guide version bump)
/update-infos-release patch    # Update CC + bump guide patch (3.9.11 → 3.9.12)
/update-infos-release minor    # Update CC + bump guide minor (3.9.11 → 3.10.0)
/update-infos-release major    # Update CC + bump guide major (3.9.11 → 4.0.0)
```

## Этапы рабочего процесса

### 1. Проверьте наличие новых выпусков Claude Code.

```bash
./scripts/update-cc-releases.sh
```

Если обнаружены новые версии, продолжайте. В противном случае остановитесь.

### 2. Обновление отслеживания выпусков Claude Code

**Файлы для обновления:**
- `machine-readable/claude-code-releases.yaml`
- `guide/core/claude-code-releases.md`
- `mcp-server/content/claude-code-releases.yaml` (байтовая копия)
- `llms.txt`, `machine-readable/llms.txt`, `mcp-server/content/llms.txt` (предложение отслеживаемой версии)
- Лендинг: `src/data/releases.ts`, `src/data/seo-editorial-contract.mjs` (`LATEST_CLAUDE_CODE_RELEASE_DATE`) и его закрепленный тест `src/data/seo-editorial-contract.test.ts`

**Process:**
1. Прочтите последние примечания к выпуску из вывода команды; в сводке, которую он печатает, могут быть пропущены версии, поэтому перечислите все заголовки `## ` сохраненного журнала изменений, более новые, чем отслеживаемая версия.
2. Дата каждой версии из метаданных публикации npm (поле `https://registry.npmjs.org/@anthropic-ai%2Fclaude-code`, `time`); пропускать версии без записи в журнале изменений вышестоящей версии
3. Обновление YAML со сжатыми бликами.
4. Обновите Markdown с расширенными деталями.
5. Добавьте новые записи на лендинг `releases.ts` (сначала самые новые, на самых новых `latest: true`, пять `initiallyVisible: true`) и переместите последнюю дату выпуска в `seo-editorial-contract.mjs` и его тест.

**Правила уплотнения для YAML:**
- ⭐ Основные функции получают звездные смайлы
- Критические изменения → Массив `breaking:`
- Исправления ошибок → одна строка
- Максимум 2–4 основных момента (фокус на изменениях, касающихся пользователей)
- Пропускать изменения internal/SDK, если они не сломаны.

### 3. Обновление версии руководства (по запросу)

**Если указан тип выступа:**

```bash
# Read current version
cat VERSION

# Bump version
# patch: 3.9.11 → 3.9.12
# minor: 3.9.11 → 3.10.0
# major: 3.9.11 → 4.0.0

# Update VERSION file
echo "X.Y.Z" > VERSION

# Sync version across docs
./scripts/sync-version.sh
```

**Файлы, синхронизируемые скриптом:**
- `README.md`
- `guide/cheatsheet.md`
- `guide/ultimate-guide.md`
- `machine-readable/reference.yaml`

### 4. Обновите CHANGELOG.md

**Добавить запись:**

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Documentation

- **Claude Code Releases**: Updated tracking to vA.B.C
  - [Feature 1]
  - [Feature 2]
  - [Feature 3]

[If guide version bump:]
### Version Bump

- Bumped guide version: [old] → [new]
- Reason: [major features added / significant updates / breaking changes in CC]
```

### 4.5. Проверьте автоматический источник RSS Claude Code.

Реализация целевого RSS в `src/pages/rss.xml.ts` автоматически генерирует элементы выпуска Claude Code из `src/data/releases.ts`. Обновить этот реестр выпусков в пределах разрешенного объема приземления; не добавляйте второй элемент выпуска Claude Code вручную в `src/data/rss-entries.ts`.

Ручные записи RSS остаются доступными для новостей, связанных с руководством, включая выпуск самого руководства. Следуйте `docs/workflows/landing-sync.md` для этой отдельной ветки. Выпуск Claude Code CLI и выпуск руководства — это разные события.

Проверьте текущую реализацию RSS на предмет созданной ссылки на выпуск вместо копирования исторического примера привязки. После авторизованной целевой сборки проверьте сгенерированный канал на наличие дубликатов элементов для обновленной версии CLI и убедитесь, что его ссылка соответствует реализации. Сообщите о недоступной сборке или канале как о непроверенных.

Выполняется, когда обновленная версия CLI поставляется из автоматического источника, не было введено ни одного дублирующего элемента, созданного вручную, и проверка канала прошла успешно или было сообщено о его ограничении.

### 4.7. Синхронизировать содержимое сервера MCP

`mcp-server/content/` — это объединенная копия трех исходных файлов, опубликованная в npm как `claude-code-ultimate-guide-mcp`. Он НЕ обновляется автоматически, синхронизируется каждый раз, когда изменяется трекинг YAML:

```bash
cp machine-readable/claude-code-releases.yaml mcp-server/content/claude-code-releases.yaml
cp machine-readable/reference.yaml mcp-server/content/reference.yaml
cp llms.txt mcp-server/content/llms.txt

# Bump mcp-server/package.json version (patch, unless server code also changed → minor)
cd mcp-server && npm run build && cd ..
```

Зафиксируйте `mcp-server/content/*` + `mcp-server/package.json` (dist/ игнорируется, перестраивается во время публикации). Спросите пользователя перед запуском `npm publish` (необратимый, общедоступный).

### 5. Проверьте синхронизацию.

```bash
./scripts/check-landing-sync.sh
```

**Ожидаемый результат:**
```
✅ Version guide:    X.Y.Z
✅ Templates:        N
✅ Quiz questions:   N
✅ Guide lines:      N
✅ Claude Code:      vA.B.C
```

Если несоответствия, исправьте перед фиксацией.

### 6. Подтвердите и нажмите

**Два репозитория для обновления:**

#### Репозиторий руководств

```bash
cd /path/to/claude-code-ultimate-guide

git add \
  VERSION \
  CHANGELOG.md \
  README.md \
  guide/cheatsheet.md \
  guide/ultimate-guide.md \
  guide/core/claude-code-releases.md \
  machine-readable/reference.yaml \
  machine-readable/claude-code-releases.yaml \
  mcp-server/content/claude-code-releases.yaml \
  llms.txt machine-readable/llms.txt mcp-server/content/llms.txt

# If version bump:
git commit -m "release: vX.Y.Z

- Update Claude Code releases tracking (vOLD → vNEW)
- [Bump type]: vOLD_GUIDE → vNEW_GUIDE
- Update CHANGELOG with release details

[attribution line provided by your host]"

# If CC releases only:
git commit -m "docs: update Claude Code releases to vA.B.C

- Update latest tracked version: vOLD → vNEW
- Add vNEW highlights: [feature1], [feature2], [feature3]
- [Any breaking changes or fixes]
- Update dates: YYYY-MM-DD

[attribution line provided by your host]"

git push
```

#### Репозиторий лендинга

```bash
cd ../claude-code-ultimate-guide-landing

pnpm test   # the release-date contract test pins the latest date
git add src/data/releases.ts src/data/seo-editorial-contract.mjs src/data/seo-editorial-contract.test.ts

git commit -m "docs: sync Claude Code vA.B.C release history

- Add vNEW to releases.ts and move the latest release date

[attribution line provided by your host]"

git push
```

### 7. Итоговый вывод

Показать пользователю:

```
✅ Release Update Complete

Guide Repository:
- Version: [old] → [new]
- Claude Code: vA.B.C
- Commit: [hash]
- Files: [count] updated

Landing Repository:
- Claude Code release history: vA.B.C
- Commit: [hash]
- Files: [count] updated

Synchronization: ✅ All synced

Next Steps:
1. Verify the deploy run: gh run list -R FlorianBruniaux/claude-code-ultimate-guide-landing --workflow deploy.yml --limit 1 (its smoke job checks that /releases/ announces the latest version)
2. Check https://cc.bruniaux.com/releases/
3. [If major release] Update social media / announcements
```

## Обработка ошибок

**Если нет новых версий Claude Code:**
```
ℹ️ No new Claude Code releases detected.
Current tracked: vX.Y.Z
Latest available: vX.Y.Z

Aborting. Nothing to update.
```

**Если проверка синхронизации не удалась:**
```
❌ Synchronization check failed:
[List mismatches]

Please fix manually before committing.
Run: ./scripts/check-landing-sync.sh
```

**Если операции git завершаются неудачно:**
```
❌ Git operation failed: [error]

Manual intervention required.
Check: git status
```

## Примеры

### Пример 1. Обновление только выпусков CC

```
User: /update-infos-release

Output:
✅ New Claude Code release detected: v2.1.15
   Date: 2026-01-22
   Highlights:
   - New feature X
   - Fix for Y
   - Improvement Z

Updating tracking files...
✅ YAML updated
✅ Markdown updated
✅ Landing releases.ts updated

Verifying sync... ✅ All synced

Committing changes...
✅ Guide: commit abc1234
✅ Landing: commit def5678

✅ Release Update Complete
```

### Пример 2: Обновление CC + незначительное изменение

```
User: /update-infos-release minor

Output:
✅ New Claude Code release detected: v2.2.0
   Major release with significant features

Current guide version: 3.9.11
Bumping to: 3.10.0 (minor)

Updating files...
✅ Claude Code tracking updated
✅ Guide version bumped
✅ CHANGELOG updated
✅ All docs synced

Verifying sync... ✅ All synced

Committing changes...
✅ Guide: commit abc1234 (8 files)
✅ Landing: commit def5678 (1 file)

✅ Release Update Complete (v3.10.0)
```

## Замечания по реализации

- **Recovery**: Если на этапе произошел сбой, остановитесь и сообщите о частичном состоянии. Сохранять ранее существовавшие и одновременные изменения; восстановить только изменения, принадлежащие этой операции, после проверки того, что их текущее состояние по-прежнему соответствует записанному. Не используйте `git reset --hard`.
- **Idempotency**: можно безопасно запускать несколько раз.
- **Validation**: всегда проверять синхронизацию перед фиксацией.
- **Подтверждение пользователя**: Спросите перед обновлением версии, если она неоднозначна.
- **Умные настройки по умолчанию**: Нет рельефа = только обновление CC

## Связанные команды

- `/version` - Проверить текущие версии (руководство + CC)
- `/changelog` — просмотр последних записей CHANGELOG.
- `/sync` - Запустить проверку синхронизации без обновлений.
