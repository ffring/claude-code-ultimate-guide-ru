---
name: pr-triage
description: "Четырехэтапное управление резервом PR с аудитом, глубоким анализом кода, проверенными комментариями и дополнительной настройкой рабочего дерева. Используйте при сортировке запросов на включение, проверке ожидающих проверок кода или управлении очередью открытых запросов на подачу заявок. Аргументы: «all» для просмотра всех, номера PR для фокусировки (например, «42 57»), «en»/«fr» для языка, без аргументов = только аудит."
allowed-tools: Bash Read
effort: medium
---

# PR-сортировка

Четырехэтапный рабочий процесс для сопровождающих: автоматический аудит всех открытых запросов на запросы, глубокая проверка с помощью параллельных агентов, публикация проверенных комментариев и дополнительная настройка рабочего дерева для локальной проверки.

## Когда использовать этот навык

| Навык | Использование | Выход |
|-------|-------|--------|
| `/pr-triage` | Сортируйте, просматривайте и комментируйте невыполненную работу по PR. | Таблица сортировки + отзывы + опубликованные комментарии |
| `/review-pr` | Подробно изучите один PR | Онлайн-пиар-обзор |

**Triggers**:
- Вручную: `/pr-triage` или `/pr-triage all` или `/pr-triage 42 57`.
- Проактивно: когда более 5 заявок открываются без проверки или обнаруживаются устаревшие заявки > 14 дней.

---

## Язык

- Проверьте аргумент, переданный навыку
- Если `en` или `english` → таблицы и резюме на английском языке
- Если `fr`, `french` или нет аргументов → французский (по умолчанию).
- Примечание. Комментарии GitHub (этап 3) ВСЕГДА на английском языке (международная аудитория).

---

## Конфигурация

Пороговые значения, используемые на протяжении всего рабочего процесса. Отредактируйте в соответствии с вашим проектом:

| Параметр | По умолчанию | Описание |
|-----------|---------|-------------|
| `staleness_days` | 14 | Количество дней без активности, прежде чем оно будет помечено как устаревшее |
| `overlap_threshold` | 50% | % общих файлов, которые следует пометить как перекрывающиеся |
| `cluster_min_prs` | 3 | Подсчет PR автора, вызывающий предложение кластера |
| `xl_cutoff_additions` | 1000 | Дополнения, выше которых PR относится к категории XL |
| `xl_cutoff_files` | 10 | Изменены файлы, над которыми PR "слишком большой" |

---

## Предварительные условия

```bash
git rev-parse --is-inside-work-tree
gh auth status
```

Если что-то не получается, остановитесь и объясните, чего не хватает.

---

## Этап 1: Аудит (всегда выполняется)

### Сбор данных (параллельные команды)

```bash
gh repo view --json nameWithOwner -q .nameWithOwner
gh pr list --state open --limit 50 \
  --json number,title,author,createdAt,updatedAt,additions,deletions,changedFiles,isDraft,mergeable,reviewDecision,statusCheckRollup,body
gh api "repos/{owner}/{repo}/collaborators" --jq '.[].login'
```

Резервный вариант **Collaborators**: если `gh api .../collaborators` возвращает 403/404:
```bash
gh pr list --state merged --limit 10 --json author --jq '.[].author.login' | sort -u
```
Если все еще неясно, спросите через `AskUserQuestion`.

Для каждого PR получите отзывы и измененные файлы:

```bash
gh api "repos/{owner}/{repo}/pulls/{num}/reviews" \
  --jq '[.[] | .user.login + ":" + .state] | join(", ")'
gh pr view {num} --json files --jq '[.files[].path] | join(",")'
```

**Notes**: Для получения файлов требуется 1 вызов API на каждый PR; для 20+ ОР отдавайте приоритет дублирующим кандидатам. Поле `author` является объектом; всегда извлекайте `.author.login`.

### Анализ

**Классификация размеров**:
| Этикетка | Дополнения |
|-------|-----------|
| XS | < 50 |
| S | 50–200 |
| M | 200–500 |
| L | 500–1000 |
| XL | > 1000 |

Формат размера: `+{additions}/-{deletions}, {files} files ({label})`

**Detections**:
- **Overlaps**: сравнивать списки файлов по PR; если общих файлов >50 % → перекрестная ссылка
- **Кластеры**: автор с 3+ открытыми PR → предложите порядок рассмотрения (сначала наименьший)
- **Staleness**: нет активности более 14 дней → пометить «устаревший»
- Статус **CI**: через `statusCheckRollup` → `clean` / `unstable` / `dirty`
- **Reviews**: одобрено/запрошены изменения/нет

**PR ↔ Связывание проблемы**:
- Сканируйте каждый PR `body` на наличие `fixes #N`, `closes #N`, `resolves #N` (регистронезависимо)
- Если найден, отобразите в таблице: `Fixes #42` в столбце Action/Status.

**Categorization**:

_Внутренние PRs_: автор в списке соавторов

_External, Ready_: добавления ≤ 1000 И файлы ≤ 10 И `mergeable` ≠ `CONFLICTING` И CI clean/unstable

_Внешний, Проблемный_: любой из:
- дополнения > 1000 ИЛИ файлы > 10
- ИЛИ `mergeable` == `CONFLICTING` (конфликт слияния)
- ИЛИ CI загрязнен (statusCheckRollup содержит ошибки)
- ИЛИ пересекается с другим открытым PR (>50 % общих файлов)

### Выход: таблица сортировки.

```
## Open PRs ({count})

### Internal PRs
| PR | Title | Size | CI | Status |
| -- | ----- | ---- | -- | ------ |

### External: Ready for Review
| PR | Author | Title | Size | CI | Reviews | Action |
| -- | ------ | ----- | ---- | -- | ------- | ------ |

### External: Problematic
| PR | Author | Title | Size | Problem | Recommended Action |
| -- | ------ | ----- | ---- | ------- | ------------------ |

### Summary
- Quick wins: {XS/S PRs ready to merge}
- Risks: {overlaps, XL sizes, CI dirty}
- Clusters: {authors with 3+ PRs}
- Stale: {PRs with no activity >14d}
- Overlaps: {PRs touching the same files}
```

0 PR → отобразить `No open PRs.` и остановиться.

### Навигация после этапа 1

После отображения таблицы сортировки спросите через `AskUserQuestion`:

```
question: "What would you like to do next?"
header: "Next Step"
options:
  - label: "Phase 2: Deep review"
    description: "Analyze selected PRs with code-reviewer agents and generate comment drafts"
  - label: "Phase 4: Create worktrees"
    description: "Set up local worktrees for hands-on review (skips comment generation)"
  - label: "Done"
    description: "End the workflow here"
```

Примечание. Этап 3 (публикация комментариев) здесь НЕ предлагается, поскольку для него требуются черновики, созданные на этапе 2. Если пользователь выбирает «Этап 4», этап 2 → Этап 3 остается доступным и после этого.

### Автоматическое копирование

После отображения таблицы сортировки скопируйте ее в буфер обмена с помощью команды, соответствующей платформе:

```bash
UNAME=$(uname -s)
if [ "$UNAME" = "Darwin" ]; then
  pbcopy <<'EOF'
{full triage table}
EOF
elif command -v xclip &>/dev/null; then
  echo "{full triage table}" | xclip -selection clipboard
elif command -v wl-copy &>/dev/null; then
  echo "{full triage table}" | wl-copy
elif command -v clip.exe &>/dev/null; then
  echo "{full triage table}" | clip.exe
fi
```

Подтвердите: `Triage table copied to clipboard.` (EN) / `Tableau copié dans le presse-papier.` (FR)

---

## Этап 2. Глубокая проверка (согласие)

### PR-подбор

**Если аргумент передан**:
- `"all"` → все внешние PR
- Числа (`"42 57"`) → только эти PR
- Нет аргументов → предложить через `AskUserQuestion`

**Если аргумента нет**, отобразить:

```
question: "Which PRs do you want to review in depth?"
header: "Deep Review"
multiSelect: true
options:
  - label: "All external"
    description: "Review {N} external PRs with parallel code-reviewer agents"
  - label: "Problematic only"
    description: "Focus on {M} risky PRs (CI dirty, too large, overlaps)"
  - label: "Ready only"
    description: "Review {K} PRs ready to merge"
  - label: "Skip"
    description: "Stop here, audit only"
```

**Проект PR-поведения**:
- Черновики PR ИСКЛЮЧЕНЫ из категорий «Все внешние» и «Только готовность».
- Проекты ТР ВКЛЮЧЕНЫ в «Только проблемные» (они требуют внимания)
- Чтобы просмотреть черновик: введите его номер явно (например, `42`).

Если «Пропустить» → завершить рабочий процесс.

### Проведение проверок

Для каждого выбранного PR запустите агент `code-reviewer` через инструмент **Task параллельно**:

```
subagent_type: code-reviewer
model: sonnet
prompt: |
  Review PR #{num}: "{title}" by @{author}

  **Metadata**: +{additions}/-{deletions}, {changedFiles} files ({size_label})
  **CI**: {ci_status} | **Reviews**: {existing_reviews} | **Draft**: {isDraft}

  **PR Body**:
  {body}

  **Diff**:
  {gh pr diff {num} output}

  Apply your security and architecture expertise. Use the project-specific checklist
  from the SKILL.md Configuration section if available.

  Return structured review:
  ### Critical Issues
  ### Important Issues
  ### Suggestions
  ### What's Good

  Be specific: quote file:line, explain the issue, suggest the fix.
```

**Резервный вариант, если параллельные агенты недоступны.**: выполнять проверки последовательно, по одному PR за раз. Уведомить пользователя: `Running sequential review (parallel agents not available).`

Получить разницу через:
```bash
gh pr diff {num}
gh pr view {num} --json body,title,author -q '{body: .body, title: .title, author: .author.login}'
```

Объедините все отчеты. Отображение сводки после завершения всех проверок.

---

## Этап 3: Комментарии (обязательная проверка)

### Генерация проекта

Для каждого проверенного PR создайте комментарий GitHub, используя шаблон `templates/review-comment.md`.

**Rules**:
- Язык: **English** (международная аудитория)
- Тон: профессиональный, конструктивный, фактологический.
- Всегда указывайте хотя бы 1 положительный момент.
- Цитировать строки кода, если это необходимо (формат `file:42`)

### Отображение и проверка

**Показать ВСЕ черновые комментарии** в формате:

```
---
### Draft: PR #{num}: {title}

{full comment}

---
```

Затем запросите проверку через `AskUserQuestion`:

```
question: "These comments are ready. Which ones do you want to post?"
header: "Post Comments"
multiSelect: true
options:
  - label: "All ({N} comments)"
    description: "Post on all reviewed PRs"
  - label: "PR #{x}: {title_truncated}"
    description: "Post only on this PR"
  - label: "None"
    description: "Cancel, post nothing"
```

(Создайте один вариант для каждого PR + «Все» + «Нет»)

### Публикация

Для каждого проверенного комментария:

```bash
gh pr comment {num} --body-file - <<'REVIEW_EOF'
{comment}
REVIEW_EOF
```

Подтверждаем каждое сообщение: `Comment posted on PR #{num}: {title}`

Если «Нет» → `No comments posted. Workflow complete.`

---

## Контрольный список для конкретного проекта

Добавьте контрольный список своего стека в приглашение агента на этапе 2. Примеры по стек:

**Node.js / TypeScript**:
- Нет типа `any` без явного обоснования.
- Обработка ошибок `async/await` (try/catch или `.catch()`)
- Никаких необработанных отказов от обещаний
- Проверка ввода на границах API

**Python**:
- Введите подсказки для всех общедоступных функций.
- Специфичность исключений (без голого `except:`)
- Очистка ресурсов (операторы `with`, контекстные менеджеры)
- Нет изменяемых аргументов по умолчанию

**Rust**:
- `Result<T, E>` с `.context()` для цепочки ошибок (в производственном коде `.unwrap()` нет)
- Никаких `clone()` на горячих путях без обоснования
- `lazy_static!` или `once_cell` для статического регулярного выражения
- Пожизненные аннотации, право собственности на которые неочевидно.

**Go**:
- Явная обработка ошибок (отбрасывание `_` без комментариев)
- `defer` для очистки ресурсов
- Распространение контекста в параллельном коде
- Никаких утечек горутины

**Generic** (независимо от стека):
- Никаких секретов или жестко запрограммированных учетных данных.
- Новые публичные функции имеют тесты
- Серьезные изменения задокументированы в органе по связям с общественностью
- Добавленные зависимости имеют четкое обоснование

---

---

## Этап 4. Настройка рабочего дерева (по желанию)

Создает локальные рабочие деревья git для каждого выбранного PR, чтобы вы могли запускать, тестировать или просматривать код, не переключая ветки.

**Никогда не активируется автоматически.** Только через навигацию фазы 1 или явный запрос пользователя.

### Шаг 4.1: Проверка кэша + список PR

**Проверка кэша**: перед использованием данных этапа 1 убедитесь, что им не более 30 минут:

```bash
CACHE_FILE="/tmp/pr-triage-prs.json"
CACHE_AGE=$(( $(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || echo 0) ))
if [ "$CACHE_AGE" -gt 1800 ]; then
  echo "STALE_CACHE"
fi
```

Если `STALE_CACHE` → повторно запустите сбор данных этапа 1, прежде чем продолжить.

**Filter**: исключить черновые PR и PR для ботов (Dependabot, renovate и т. д.):

```bash
python3 -c "
import json
prs = json.load(open('/tmp/pr-triage-prs.json'))
filtered = [
  p for p in prs
  if not p['isDraft']
  and not any(bot in p['author']['login'].lower() for bot in ['dependabot', 'renovate', 'snyk'])
]
import sys; json.dump(filtered, sys.stdout, indent=2)
" > /tmp/pr-triage-phase4.json
```

Если после фильтрации 0 PR → отобразить `No reviewable PRs available for worktree (all are drafts or bots).` + завершить фазу 4.

**Отображение сгруппировано по автору** (используйте отображаемое имя, если оно доступно, возврат к входу в систему):

```
## PRs available for worktree (non-draft)

### Alice Martin (@alice)
  [1] #123: feat(auth): add OAuth2 support
      Branch: feat/oauth2  |  Size: M  |  CI: clean

### Bob Chen (@bob)
  [2] #456: fix(api): handle empty response
      Branch: fix/empty-response  |  Size: S  |  CI: dirty ⚠️
```

### Шаг 4.2: Выбор

Спросите через `AskUserQuestion` (multiSelect):

```
question: "Which PRs do you want to create a worktree for?"
header: "Worktree Setup"
multiSelect: true
options:
  - label: "All"
    description: "Create worktrees for all {N} listed PRs"
  - label: "[1] #{num}: {title} ({author})"
    description: "Branch: {branch} | Size: {size} | CI: {ci}"
  - label: "None"
    description: "Cancel, return to menu"
```

Если «Нет» → завершите Фазу 4.

### Шаг 4.3: Последовательное создание

**Модель выполнения**: Claude запускает команду **one bash для PR**, считывает ее выходные данные, обновляет свое внутреннее состояние (создано/существующее/не удалось), затем переходит к следующему. Никогда не используйте цикл bash, охватывающий все PR.

Для каждого выбранного PR Claude явно устанавливает переменные, а затем выполняет:

```bash
PR_NUM="123"
BRANCH_NAME="feat/oauth2"
WORKTREE_NAME="${BRANCH_NAME//\//-}"
REPO_ROOT="$(cd "$(git rev-parse --git-common-dir)/.." && pwd)"
WORKTREE_DIR="$REPO_ROOT/.worktrees/$WORKTREE_NAME"

# Already exists?
if [ -d "$WORKTREE_DIR" ]; then
  echo "STATUS:EXISTING:$PR_NUM:$WORKTREE_DIR"
  exit 0
fi

# .gitignore check (fail-fast)
if ! grep -qE "^\.worktrees/?$" "$REPO_ROOT/.gitignore" 2>/dev/null; then
  echo "STATUS:GITIGNORE_MISSING:$PR_NUM"
  exit 1
fi

# Fetch remote branch
if ! git fetch origin "$BRANCH_NAME" 2>/tmp/wt-fetch-$PR_NUM.log; then
  echo "STATUS:FETCH_FAILED:$PR_NUM"
  exit 1
fi

mkdir -p "$REPO_ROOT/.worktrees"

# Create worktree (branch local exists or not)
if ! git branch --list "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
  git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "origin/$BRANCH_NAME" \
    2>/tmp/wt-err-$PR_NUM.log
else
  git worktree add "$WORKTREE_DIR" "$BRANCH_NAME" \
    2>/tmp/wt-err-$PR_NUM.log
fi

if [ $? -ne 0 ]; then
  if grep -q "already checked out" /tmp/wt-err-$PR_NUM.log; then
    echo "STATUS:ALREADY_CHECKED_OUT:$PR_NUM"
  else
    echo "STATUS:CREATE_FAILED:$PR_NUM"
  fi
  exit 1
fi

# Optional: symlink node_modules (Node.js projects, avoids reinstall)
[ -d "$REPO_ROOT/node_modules" ] && ln -sf "$REPO_ROOT/node_modules" "$WORKTREE_DIR/node_modules"

# Copy project-specific files listed in .worktreeinclude (if present)
if [ -f "$REPO_ROOT/.worktreeinclude" ]; then
  while IFS= read -r entry || [ -n "$entry" ]; do
    [[ "$entry" =~ ^#.*$ || -z "$entry" ]] && continue
    entry="$(echo "$entry" | xargs)"
    [ -e "$REPO_ROOT/$entry" ] && {
      mkdir -p "$(dirname "$WORKTREE_DIR/$entry")"
      cp -R "$REPO_ROOT/$entry" "$WORKTREE_DIR/$entry"
    }
  done < "$REPO_ROOT/.worktreeinclude"
fi

echo "STATUS:CREATED:$PR_NUM:$WORKTREE_DIR"
```

**Обработка статуса** (Claude поддерживает внутреннее состояние между PR):

| Статус | Claude действие |
|--------|--------------|
| `STATUS:CREATED:NUM:PATH` | Добавить в список «созданных» |
| `STATUS:EXISTING:NUM:PATH` | Добавить в «существующий» список → запросить предложение на шаге 4.4. |
| `STATUS:FETCH_FAILED:NUM` | Предупреждать + перейти к следующему пиару |
| `STATUS:GITIGNORE_MISSING:NUM` | Быстрое реагирование: показать инструкции по исправлению + остановить этап 4. |
| `STATUS:ALREADY_CHECKED_OUT:NUM` | Предупреждение: «Ветка уже извлечена в другом рабочем дереве. Запустите `git worktree list`, чтобы найти ее». |
| `STATUS:CREATE_FAILED:NUM` | Предупреждать + перейти к следующему пиару |

**GITIGNORE_MISSING инструкция по исправлению**:
```
.worktrees/ is not in .gitignore. Add it to avoid accidentally committing worktree files:
  echo ".worktrees/" >> .gitignore
Then re-run Phase 4.
```

### Шаг 4.4. Обновите существующие рабочие деревья.

Если собран `STATUS:EXISTING`, предложите одну подсказку:

```
Existing worktrees detected:
  PR #123: .worktrees/feat-oauth2
  PR #789: .worktrees/fix-session-leak

- [Pull all] git pull --ff-only in all existing worktrees
- [#123] Pull PR #123 only
- [Skip] Leave as-is
```

Для каждого выбранного запроса запускается Claude (одна команда на каждое рабочее дерево):

```bash
PR_NUM="123"
BRANCH_NAME="feat/oauth2"
WORKTREE_DIR="/abs/path/.worktrees/feat-oauth2"

cd "$WORKTREE_DIR" && git pull origin "$BRANCH_NAME" --ff-only 2>/tmp/wt-pull-$PR_NUM.log
echo "PULL_STATUS:$?:$PR_NUM"
```

Если `PULL_STATUS` ≠ 0:
```
⚠️ PR #123: --ff-only failed (branches have diverged)
   Manual fix: cd .worktrees/feat-oauth2 && git pull --rebase
```

### Шаг 4.5: Резюме

```
## Worktrees ready

| PR | Author | Branch | Path | Status |
|----|--------|--------|------|--------|
| #123 | Alice | feat/oauth2 | .worktrees/feat-oauth2 | Created |
| #456 | Bob | fix/empty-response | .worktrees/fix-empty-response | Created |
| #789 | Alice | fix/session-leak | .worktrees/fix-session-leak | Updated (pull) |
| #321 | Carol | feat/chat | .worktrees/feat-chat | Fetch failed ⚠️ |

Note: if a PR modifies package.json, install dependencies manually:
  cd .worktrees/<branch-name> && npm install   # or pnpm/yarn/bun

Next steps:
  cd .worktrees/<branch-name>
  claude
```

### Соглашение `.worktreeinclude`

Создайте файл `.worktreeinclude` в корне репозитория, чтобы перечислить файлы, которые Фаза 4 копирует в каждое новое рабочее дерево. Полезно для локальных файлов конфигурации, не отслеживаемых в git:

```
# .worktreeinclude
.env.local
.env.test
config/local.json
```

---

## Краевые случаи

| Ситуация | Поведение |
|-----------|----------|
| 0 открытых PR | Отобразить `No open PRs.` + стоп |
| Проект PR | Показать в таблице, пропустить проверку, если не выбрано явно |
| Неизвестный КИ | Отображение `?` в столбце CI |
| Тайм-аут агента проверки | Показать частичную ошибку, продолжить с другими |
| `gh pr diff` пустой | Пропустить этот PR, уведомить пользователя |
| Очень большой PR (>5000 добавлений) | Предупреждение: «Частичная проверка, разница усечена» |
| Соавторы API 403/404 | Возврат к последним 10 авторам объединенных PR |
| Параллельные агенты недоступны | Запускайте последовательные проверки, уведомляйте пользователя |
| Фаза 4: `.gitignore` отсутствует `.worktrees/` | Быстро, покажите инструкции по исправлению, остановите Фазу 4. |
| Этап 4: ветка уже извлечена | Предупреждаем подсказкой `git worktree list`, пропустите этот пиар |
| Этап 4: устаревший кеш (>30 минут) | Повторно получите список PR перед созданием рабочих деревьев. |
| Этап 4: PR модифицирует `package.json` | Вкратце предупредите, чтобы запустить установку вручную |
| Этап 4: 0 ОР без призыва | Отображение сообщения + завершение фазы 4 |

---

## Примечания

- Всегда извлекайте owner/repo через `gh repo view`, никогда не закодируйте жестко.
- Используйте `gh` CLI (не `curl` GitHub API), за исключением списка соавторов.
- `statusCheckRollup` может быть нулевым → рассматривать как `?`
- `mergeable` может быть `MERGEABLE`, `CONFLICTING` или `UNKNOWN` → воспринимать `UNKNOWN` как `?`
- Никогда не публикуйте сообщения без явной проверки пользователем в чате.
- Черновики комментариев должны быть видны ДО любого `gh pr comment`.

---

## Связанный: /review-pr

| | `/pr-triage` | `/review-pr` |
|--|-------------|--------------|
| **Объем** | Полный портфолио по пиару | Единый пиар |
| **Использовать, когда** | Наверстывание упущенного после накопления, периодическая сортировка | Рассмотрение конкретного входящего PR |
| **Фазы** | 4 (аудит + глубокая проверка + комментарии + рабочие деревья) | 1 (только обзор) |
| **Агенты** | Параллельные субагенты на PR | Один сеанс |
| **Вывод** | Таблица сортировки + отчеты о проверке + комментарии GitHub + локальные рабочие деревья | Встроенный обзор |
| **Проверка** | Задайте вопрос пользователю перед публикацией | Ручное решение |

**Правило принятия решения**: используйте `/pr-triage` для сортировки невыполненных заявок (5+ PR), `/review-pr` для целенаправленного анализа одного PR. Используйте этап 4, если вы хотите запустить код локально, а не просто читать разницу.
