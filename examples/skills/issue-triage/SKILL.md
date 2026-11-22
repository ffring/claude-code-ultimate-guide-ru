---
name: issue-triage
description: "Трехэтапное управление журналом невыполненных задач с аудитом, глубоким анализом и проверенными действиями по сортировке. Используйте при сортировке проблем GitHub, сортировке отчетов об ошибках, очистке устаревших заявок или обнаружении повторяющихся проблем. Аргументы: «all» для анализа всех, номера проблем для фокусировки (например, «42 57»), «en»/«fr» для языка, без аргументов = только аудит."
allowed-tools: Bash
effort: medium
---

# Сортировка проблем

Трехэтапный рабочий процесс для сопровождающих: автоматический аудит всех открытых проблем, глубокий анализ с помощью параллельных агентов и проверенные действия по сортировке (комментарии, метки, закрытия).

## Когда использовать этот навык

| Навык | Использование | Выход |
|-------|-------|--------|
| `/issue-triage` | Сортируйте, анализируйте и действуйте по накопившимся проблемам | Таблицы сортировки + анализ + выполненные действия |
| `/pr-triage` | Сортируйте, просматривайте и комментируйте невыполненную работу по PR. | Таблица сортировки + отзывы + опубликованные комментарии |

**Triggers**:
- Вручную: `/issue-triage` или `/issue-triage all` или `/issue-triage 42 57`.
- Проактивно: при обнаружении> 10 открытых проблем без метки или устаревших проблем> 30 дней.

---

## Язык

- Проверьте аргумент, переданный навыку
- Если `en` или `english` → таблицы и резюме на английском языке
- Если `fr`, `french` или нет аргументов → французский (по умолчанию).
- Примечание. Комментарии и метки GitHub (этап 3) ВСЕГДА на английском языке (международная аудитория).

---

## Конфигурация

Пороговые значения, используемые на протяжении всего рабочего процесса. Отредактируйте в соответствии с вашим проектом:

| Параметр | По умолчанию | Описание |
|-----------|---------|-------------|
| `staleness_days` | 30 | Количество дней без активности, прежде чем оно будет помечено как устаревшее |
| `very_stale_days` | 90 | Количество дней без активности, прежде чем оно будет помечено как очень устаревшее. |
| `jaccard_threshold` | 60% | Минимальное сходство Жаккара, чтобы пометить две проблемы как дубликаты. |
| `closed_compare_count` | 20 | Количество последних закрытых проблем для сравнения на предмет обнаружения дубликатов |
| `open_limit` | 100 | Максимум открытых проблем для извлечения и анализа |

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
# Repo identity
gh repo view --json nameWithOwner -q .nameWithOwner

# Open issues (exclude PRs, limit 100)
gh issue list --state open --limit 100 \
  --json number,title,author,createdAt,updatedAt,labels,body,comments,assignees,milestone

# Recent closed issues (for duplicate detection)
gh issue list --state closed --limit 20 \
  --json number,title,body,labels,stateReason

# Open PRs (bodies for cross-reference detection)
gh pr list --state open --limit 50 --json number,title,body

# Collaborators (to distinguish reporter types)
gh api "repos/{owner}/{repo}/collaborators" --jq '.[].login'
```

Резервный вариант **Collaborators**: если `gh api .../collaborators` возвращает 403/404:
```bash
# Extract authors from last 10 merged PRs
gh pr list --state merged --limit 10 --json author --jq '.[].author.login' | sort -u
```
Если все еще неясно, спросите через `AskUserQuestion`.

**Note**: поле `comments` в `gh issue list --json comments` возвращает количество, а не содержимое. Для этапа 2 получите полный контент отдельно: `gh issue view {num} --json comments`.

### Измерения анализа

Проанализируйте все 6 измерений для каждой открытой проблемы:

#### 1. Категоризация

Классифицируйте каждую проблему, прочитав `title` + первые 200 символов `body`:

| Категория | Этикетка | Критерии |
|----------|-------|----------|
| Ошибка | `bug` | Описывает неправильное поведение, неожиданный результат, сбой. |
| Запрос функции | `enhancement` | Просит новый функционал |
| Вопрос/Поддержка | `question` | Пользователь спрашивает, как что-то работает |
| Документация | `documentation` | Отсутствующие или неправильные документы |
| Вне сферы применения | `wontfix` | Явно за пределами границ проекта |
| Неясно | `needs-info` | Тело пустое, слишком расплывчатое, чтобы его можно было классифицировать. |

Если тело пустое → категория всегда `Unclear` (никогда не предполагайте).

#### 2. Перекрестные ссылки на ОР

Сканируйте каждое открытое тело запроса на наличие ссылки на номер выпуска:
- Шаблоны: `fixes #N`, `closes #N`, `resolves #N`, `fix #N`, `close #N` (регистронезависимо, `N` = номер выпуска)
- Используйте регулярное выражение локально в уже извлеченных полях `body`; НЕ делайте N дополнительных вызовов API
- Если обнаружено: пометить проблему как «связанную с PR» с номером PR.

#### 3. Обнаружение дубликатов с помощью сходства Жаккара.

**Алгоритм (автономный, без внешней библиотеки)**:

Для каждой открытой проблемы вычислите сходство Жаккара со всеми другими открытыми проблемами И 20 последними закрытыми проблемами.

```
Step 1: Normalize title + first 300 chars of body:
  - Lowercase the full text
  - Strip category prefixes: "feat:", "fix:", "bug:", "chore:", "docs:", "test:", "refactor:"
  - Remove punctuation: .,!?;:'"()[]{}-_/\@#

Step 2: Tokenize:
  - Split on whitespace
  - Remove stop words: the a an is in on to for of and or with this that it can not no be
  - Remove tokens shorter than 3 characters

Step 3: Compute Jaccard:
  tokens_A = set of tokens from issue A
  tokens_B = set of tokens from issue B
  jaccard = |tokens_A ∩ tokens_B| / |tokens_A ∪ tokens_B|

Step 4: Flag:
  - If jaccard >= 0.60: mark as potential duplicate
  - Report: "Similar to #N (Jaccard: 0.72)"
  - Keep the OLDER issue as canonical; newer = duplicate candidate
```

Jaccard вычисляется во время выполнения с использованием полученных данных; никаких вызовов API после сбора фазы 1.

#### 4. Классификация рисков

Назначьте красный/желтый/зеленый на основе сигналов в заголовке + теле:

| Уровень | Цвет | Критерии |
|-------|-------|----------|
| Критический | Красный | Уязвимость безопасности, потеря данных, регрессивная блокировка пользователей, сбой в производстве |
| Требует внимания | Желтый | Отсутствие проверки, снижение производительности, недокументированные критические изменения, неясно, нет ответа в течение > 7 дней. |
| Нормальный | Зеленый | Все остальное |

#### 5. Устаревание

| Статус | Критерий |
|--------|-----------|
| Активный | Обновлено в течение 30 дней |
| Несвежий | Отсутствие активности 30–90 дней |
| Очень несвежий | Нет активности >90 дней |

Используйте поле `updatedAt`. Устаревание НЕ зависит от количества комментариев; прокомментированная проблема со старым `updatedAt` все еще устарела.

#### 6. Рекомендации

Одно рекомендуемое действие для каждой проблемы:

| Ситуация | Действие |
|-----------|--------|
| Категория = Непонятно, тело пустое | Комментарий с запросом подробностей |
| Жаккар >= 0,60 с известной проблемой | Закрыть как дубликат, оставить ссылку на оригинал |
| Очень устаревший + нет правопреемника | Статус запроса комментария, предложить закрыть |
| Риск = Красный | Закрепить в верхней части сортировки, немедленно передать на эскалацию |
| Категория = ООС | Завершить объяснением |
| PR-linked | Никаких действий не требуется (отслеживается через PR) |
| Нормальный + с маркировкой | Никаких действий не требуется |

### Результат: таблицы сортировки.

```
## Open Issues ({count})

### Critical: Immediate Attention (Risk: Red)
| # | Title | Category | Reporter | Days Open | Action |
|---|-------|----------|----------|-----------|--------|

### PR-Linked (tracked in open PRs)
| # | Title | Category | PR | Days Open |
|---|-------|----------|----|-----------|

### Active Issues
| # | Title | Category | Labels | Reporter | Days | Action |
|---|-------|----------|--------|----------|------|--------|

### Duplicate Candidates
| # | Title | Similar To | Jaccard | Action |
|---|-------|------------|---------|--------|

### Stale Issues
| # | Title | Category | Last Activity | Reporter | Action |
|---|-------|----------|---------------|----------|--------|

### Summary
- Total open: {N}
- Critical (Red): {count}
- PR-linked: {count}
- Duplicate candidates: {count}
- Stale (30–90d): {count}
- Very stale (>90d): {count}
- Unlabeled: {count}
- Recommended actions: {comment: N, label: N, close: N}
```

0 проблем → отобразить `No open issues.` и остановиться.

**Правила защиты** (применяются ко всем фазам):
- Никогда не закрывайте задачу, созданную соавтором, без явного подтверждения пользователя.
- Никогда не переименовывайте проблему, у которой уже есть метки (только добавляйте недостающие метки).
- Если тело пустое → всегда запрашивайте подробности перед любым другим действием.
- Никогда не закрывайте проблему Red автоматически без подтверждения пользователя.

### Автоматическое копирование

После отображения таблиц сортировки скопируйте их в буфер обмена с помощью команды, соответствующей платформе:

```bash
UNAME=$(uname -s)
if [ "$UNAME" = "Darwin" ]; then
  pbcopy <<'EOF'
{full triage tables}
EOF
elif command -v xclip &>/dev/null; then
  echo "{full triage tables}" | xclip -selection clipboard
elif command -v wl-copy &>/dev/null; then
  echo "{full triage tables}" | wl-copy
elif command -v clip.exe &>/dev/null; then
  echo "{full triage tables}" | clip.exe
fi
```

Подтвердите: `Triage tables copied to clipboard.` (EN) / `Tableaux copiés dans le presse-papier.` (FR)

---

## Этап 2: Глубокий анализ (по желанию)

### Выбор выпуска

**Если аргумент передан**:
- `"all"` → все проблемы с рекомендуемыми действиями
- Числа (`"42 57"`) → только эти проблемы
- Нет аргументов → предложить через `AskUserQuestion`

**Если аргумента нет**, отобразить:

```
question: "Which issues do you want to analyze in depth?"
header: "Deep Analysis"
multiSelect: true
options:
  - label: "All ({N} issues with recommended actions)"
    description: "Launch parallel analysis agents for each actionable issue"
  - label: "Critical only ({M} Red issues)"
    description: "Focus on high-risk issues requiring immediate action"
  - label: "Duplicate candidates ({K} issues)"
    description: "Verify Jaccard similarity with full body + comments"
  - label: "Stale only ({J} stale issues)"
    description: "Decide which stale issues to close vs. revive"
  - label: "Skip"
    description: "Stop here, audit only"
```

Если «Пропустить» → завершить рабочий процесс.

### Выполнение анализа

Для каждой выбранной проблемы запустите агент анализа через инструмент **Task параллельно**:

```
subagent_type: general
model: sonnet
prompt: |
  Analyze GitHub issue #{num}: "{title}"

  **Metadata**: Category={category}, Risk={risk}, Days open={days}, Labels={labels}
  **Reporter**: @{author} ({collaborator? "collaborator" : "external"})
  **Assignees**: {assignees or "none"}

  **Body**:
  {body}

  **Comments** (fetch via: gh issue view {num} --json comments):
  {comments[].body, truncate at 5000 chars total}

  **Duplicate candidates**: {jaccard_results or "none found"}
  **Linked PRs**: {pr_refs or "none"}

  Tasks:
  1. Verify the category assigned in Phase 1 (correct? suggest alternative if not)
  2. If duplicate candidate: confirm or deny similarity with rationale
  3. If Unclear/needs-info: identify exactly what information is missing
  4. Suggest the most appropriate action with exact text if a comment is needed
  5. Estimate effort to fix if it's a Bug or Feature Request (XS/S/M/L/XL)

  Return structured output:
  ### Verification
  ### Duplicate Analysis
  ### Missing Information
  ### Recommended Action
  ### Effort Estimate
```

**Резервный вариант, если параллельные агенты недоступны.**: запускайте анализ последовательно, по одной проблеме за раз. Уведомить пользователя: `Running sequential analysis (parallel agents not available).`

Получите полные комментарии через:
```bash
gh issue view {num} --json comments --jq '.comments[].body'
```

Объедините все отчеты. Отображение сводки после завершения всех анализов.

---

## Этап 3: Действия (обязательная проверка)

### Генерация проекта

Для каждой анализируемой проблемы сгенерируйте соответствующее действие, используя шаблон `templates/issue-comment.md`.

**3 типа действий**:

| Тип | Команда | Когда |
|------|---------|------|
| Комментарий | `gh issue comment {num} --body-file -` | Нужна информация, устаревший пинг, объяснение рассинхрона |
| Этикетка | `gh issue edit {num} --add-label "{label}"` | Непомеченная проблема с четкой категорией |
| Закрывать | `gh issue close {num} --reason "not planned"` | Дубликат, ООС, очень устаревший |

**Rules**:
- Язык комментариев: **English** (международная аудитория)
- Добавлены метки: используйте только существующие метки репозитория (выберите с помощью `gh label list`).
- Причина закрытия: `"not planned"` для OOS/duplicate, `"completed"` только в том случае, если исправление было объединено.
- Никогда не оставляйте комментарий И закрывайте одно и то же действие, пока пользователь не увидит оба черновика.
- Всегда прикрепляйте комментарий при закрытии (объясните почему)

### Отображение и проверка

**Отобразить ВСЕ запланированные действия** в формате:

```
---
### Draft: Issue #{num}: {title}

**Action**: {Comment / Label / Close + Comment}
**Reason**: {1 sentence}

{full comment text if applicable}

---
```

Затем запросите проверку через `AskUserQuestion`:

```
question: "These actions are ready. Which ones do you want to execute?"
header: "Execute Triage Actions"
multiSelect: true
options:
  - label: "All ({N} actions)"
    description: "Execute all drafted triage actions"
  - label: "Issue #{x}: {title_truncated} ({action_type})"
    description: "Execute only this action"
  - label: "None"
    description: "Cancel, execute nothing"
```

(Создать один вариант для каждой проблемы + «Все» + «Нет»)

### Исполнение

Для каждого подтвержденного действия:

```bash
# Comment
gh issue comment {num} --body-file - <<'TRIAGE_EOF'
{comment}
TRIAGE_EOF

# Label
gh issue edit {num} --add-label "{label}"

# Close with comment
gh issue comment {num} --body-file - <<'TRIAGE_EOF'
{close comment}
TRIAGE_EOF
gh issue close {num} --reason "not planned"
```

Подтверждайте каждое действие: `Action executed on issue #{num}: {title}`

Если «Нет» → `No actions executed. Workflow complete.`

---

## Краевые случаи

| Ситуация | Поведение |
|-----------|----------|
| 0 открытых вопросов | Отобразить `No open issues.` + стоп |
| Тело пустое | Категория = неясно, действие = запросить подробности, никогда не предполагать |
| Соавтор в качестве репортера | Защищать от автоматического закрытия, явно отмечать в таблице |
| Жаккар безрезультатный (0,55–0,65) | Пометить как «возможный дубликат, проверить вручную» |
| Этикетки нет в репозитории | Пропустить действие над меткой, уведомить пользователя о необходимости сначала создать метку |
| Проблема уже закрыта во время рабочего процесса | Пропустить молча, отметить вкратце |
| `gh api .../collaborators` 403/404 | Возврат к последним 10 авторам объединенных PR |
| Параллельные агенты недоступны | Запустите последовательный анализ, уведомите пользователя |
| Очень большое тело (>5000 символов) | Усечь до 5000 символов с помощью примечания `[truncated]`. |
| Этап назначен | Включить в таблицу, никогда не закрывать важные задачи без подтверждения |

---

## Примечания

- Всегда извлекайте owner/repo через `gh repo view`, никогда не закодируйте жестко.
- Используйте `gh` CLI (не `curl` GitHub API), за исключением списка соавторов.
- `comments` в `gh issue list --json comments` = только подсчет; для полного контента требуется `gh issue view {num} --json comments`
- Никогда не выполняйте никаких действий без явной проверки пользователя в чате.
- Намеченные действия должны быть видны ДО появления любых `gh issue comment` или `gh issue close`.
- Jaccard вычисляется локально: нет внешнего API, нет библиотеки, операции с чистым набором извлеченных данных.
- Подпись под всеми комментариями: `*Triaged via Claude Code /issue-triage*`

---

## Связанный: /pr-triage

| | `/issue-triage` | `/pr-triage` |
|--|----------------|--------------|
| **Объем** | Журнал невыполненных задач | PR-задел |
| **Использовать, когда** | Получение отзывов репортеров, периодическое устранение проблем | Наверстывание упущенного после накопления PR |
| **Фазы** | 3 (аудит + глубокий анализ + действия) | 3 (аудит + глубокая проверка + комментарии) |
| **Агенты** | Параллельные субагенты для каждого выпуска | Параллельные субагенты на PR |
| **Обнаружение дубликатов** | Сходство Жаккара в названии+теле | % перекрытия файлов между PR |
| **Действия** | Комментировать/отметить/закрыть | GitHub обзор комментарий |
| **Проверка** | AskUserQuestion перед выполнением | Задайте вопрос пользователю перед публикацией |

**Правило принятия решения**: используйте `/issue-triage` для управления журналом невыполненных задач, `/pr-triage` для журнала невыполненной проверки кода.
