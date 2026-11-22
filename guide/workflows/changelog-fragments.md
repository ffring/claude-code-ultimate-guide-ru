---
title: "Фрагменты журнала изменений: обязательная документация по каждому PR"
description: "Трехуровневый шаблон принудительного применения для Claude Code, который гарантирует, что каждый PR документируется во время записи, а не во время выпуска: подталкивания на основе перехватчиков, проверки шаблонов PR и принудительное применение CI."
---

# <a name="changelog-fragments-enforced-per-pr-documentation"></a>Фрагменты журнала изменений: обязательная документация по каждому PR

Трехуровневый шаблон принудительного применения, который гарантирует, что каждый PR документируется во время записи, а не во время выпуска.

---

## <a name="the-problem"></a>Проблема

Одиночные файлы `CHANGELOG.md` разбиваются на активные команды. Три открытые ветки функций, касающиеся одного и того же файла, означают конфликты слияния при каждом слиянии. Кто-то разрешает конфликт, оставляет строчку, и примечания к выпуску оказываются неправильными еще до их публикации.

Более глубокая проблема – это время. «Документ во время выпуска» звучит разумно, пока вы не посмотрите на PR № 840 через три недели после его слияния, пытаясь реконструировать, что изменилось для пользователей. В коммите написано `fix session handling`. Разработчик находится в другом часовом поясе. Контекст пропал.

Обеспечение соблюдения требований без шлюзов CI означает, что журналы изменений становятся утомительной работой. Кто-то должен гоняться за людьми перед каждым релизом, в условиях нехватки времени, заполняя пробелы в журнале git.

Решение: один фрагмент YAML на каждый PR, написанный во время реализации, проверенный CI, автоматически собранный при выпуске.

---

## Трехуровневая архитектура

Система работает, потому что правоприменение происходит на трех независимых уровнях. Каждый уровень фиксирует свой режим отказа.

### <a name="layer-1-claudemd-workflow-rule"></a>Уровень 1: правило рабочего процесса CLAUDE.md

Первый уровень — это правило, загружаемое в контекст Claude Code при каждом сеансе. Он кодирует весь рабочий процесс фрагмента, поэтому Claude может завершить его автономно, когда его попросят создать PR.

```markdown
# git-workflow.md (loaded via CLAUDE.md)

## Changelog Fragment — Required Before Every PR

Before creating a PR, always generate a changelog fragment.

### Steps

1. **Infer from git diff** — analyze `git diff main...HEAD` to determine:
   - `type`: feat | fix | perf | refactor | security | docs | chore
   - `scope`: the functional area affected (auth, sessions, api, etc.)
   - `title`: one-line user-facing summary (< 80 chars)

2. **Create the fragment** — run `pnpm changelog:add` or write directly:
   ```
   changelog/fragments/{PR_NUMBER}-{slug}.yml
   ```

3. **Validate** — run `pnpm changelog:validate changelog/fragments/{file}.yml`

4. **Commit alongside the PR** — include the fragment in the same branch

### Fragment schema

```yaml
pr: 886                    # must match filename prefix
type: fix                  # feat|fix|perf|refactor|security|docs|chore
scope: "visiochat"
title: "Fix empty chat after SSE race condition"   # < 80 chars
description: |             # optional — explain user impact, not implementation
  SSE workplan fires before AI stream completes, causing ChatWrapper
  to mount with 0 messages.
breaking: false
migration: false           # set true if PR adds a DB migration
```

### Обход

Добавьте метку `skip-changelog` для PR, не влияющих на пользователя (конфигурация CI, обновления deps, фиксации выпуска).
```

This rule makes Claude Code a participant in enforcement, not just a coding tool. When a developer says "make the PR," Claude infers the fragment content from the diff and creates it before opening the PR.

### Layer 2: UserPromptSubmit hook (behavioral detection)

The second layer intercepts intent before it becomes action. When the developer types something that signals PR creation intent, the hook checks whether a changelog fragment was mentioned.

```bash
# .claude/hooks/smart-suggest.sh (excerpt — Tier 0 enforcement)

# PR creation intent detected
if echo "$PROMPT_LC" | grep -qE '(create.*pr|open.*pr|make.*pr|pull.?request|push.*pr)'; then
    # Fragment not mentioned → redirect to creation step first
    if ! echo "$PROMPT_LC" | grep -qE '(changelog|fragment|skip-changelog)'; then
        suggest "pnpm changelog:add" \
            "REQUIRED before merge — creates changelog/fragments/{PR}-{slug}.yml"
    else
        # Already mentioned → suggest the PR command normally
        suggest "/pr" "PR creation with structured description"
    fi
fi
```

Хук — `UserPromptSubmit`: неблокирующий, максимум одно предложение на запрос, молчание при отсутствии совпадений. Он запускается до того, как Claude Code обработает приглашение, поэтому разработчик увидит встроенное напоминание до того, как Claude начнет что-либо делать.

Условная логика (`if X without Y`) является здесь ключевым шаблоном. Логика адаптируется к контексту, а не полностью блокирует каждый запрос. Если разработчик уже упомянул фрагмент, он получит обычное предложение. Если они этого не сделали, они получат напоминание о принудительном исполнении.

**Полный перехватчик с трехуровневой архитектурой**: [`examples/hooks/bash/smart-suggest.sh`](../../examples/hooks/bash/smart-suggest.sh)

### Уровень 3: Применение CI (GitHub Actions)

Третий слой – жесткие ворота. Для каждого PR, ориентированного на основную отрасль, выполняются два независимых задания.

**`check-fragment` job**: сначала проверяет метки обхода (закрытый список), затем требует наличия `changelog/fragments/{PR_NUMBER}-*.yml` и прохождения структурной проверки.

```yaml
- name: Check fragment exists and is valid
  env:
    PR_NUMBER: ${{ github.event.pull_request.number }}
    PR_LABELS: ${{ toJson(github.event.pull_request.labels.*.name) }}
  run: |
    SKIP_LABELS=("skip-changelog" "dependencies" "release" "chore: deps")
    for LABEL in "${SKIP_LABELS[@]}"; do
      if echo "$PR_LABELS" | grep -q "\"$LABEL\""; then
        echo "Bypass label detected — fragment not required"
        exit 0
      fi
    done

    FRAGMENT=$(ls "changelog/fragments/${PR_NUMBER}-"*.yml 2>/dev/null | head -1)
    if [ -z "$FRAGMENT" ]; then
      echo "Fragment missing. Run: pnpm changelog:add"
      exit 1
    fi

    pnpm tsx changelog/scripts/validate.ts "$FRAGMENT"
```

**`check-migration-flag` job** (работает независимо, без обхода): обнаруживает новые файлы миграции SQL с помощью `git diff --name-only --diff-filter=A`. Если миграции присутствуют и во фрагменте есть `migration: false`, то произойдет сбой. Эту работу нельзя обойти метками. PR `skip-changelog`, добавляющий миграцию, по-прежнему запускает проверку.

Эти две работы независимы по своей конструкции. PR может обойти создание фрагмента (через метку), но все равно не пройдет проверку миграции.

---

## Сборка фрагментов при выпуске

Фрагменты накапливаются в `changelog/fragments/` по мере слияния PR. Во время выпуска одна команда собирает их в раздел CHANGELOG с поддержкой версий.

```bash
pnpm changelog:assemble --version 1.8.0 [--dry-run]
```

Что он делает:
1. Читает все `changelog/fragments/*.yml`
2. Группы по типу в фиксированном порядке (подвиг, исправление, производительность, рефакторинг, безопасность, документация, рутинная работа).
3. Извлекает записи `breaking: true` в специальный раздел `🔨 Breaking Changes`.
4. Аннотирует записи `migration: true` вместе с `⚠️ Migration DB.`.
5. Заменяет заполнитель `## [Next Release]` в `CHANGELOG.md`.
6. Архивирует фрагменты в `changelog/fragments/released/{version}/`.

Output:
```markdown
## [1.8.0] - 2026-03-15

### 🔨 Breaking Changes
- **Remove legacy token format (#871)** — Tokens issued before v1.6.0 are invalid.

### ✨ New Features
- **Add real-time presence indicators (#892)**

### 🔧 Bug Fixes
- **Fix empty chat after SSE race condition (#886)** — SSE workplan fires before
  AI stream completes, causing ChatWrapper to mount with 0 messages.
```

---

## Почему 3 слоя, а не 1?

Каждый уровень фиксирует свой режим отказа:

| Слой | Ошибка обнаружена | Когда |
|-------|---------------|------|
| Правило CLAUDE.md | Claude забывает рабочий процесс | Каждая сессия |
| Хук UserPromptSubmit | Типы разработчиков "делают пиар" не задумываясь | Pre-prompt |
| ворота CI | Фрагмент пропущен или поврежден. | Pre-merge |

Один шлюз CI обнаруживает проблему слишком поздно. Разработчику приходится переключить контекст обратно после того, как его PR уже открыт. Хук ловит его в момент намерения. Правило CLAUDE.md означает, что Claude обрабатывает его автономно при получении задачи.

Слои не конфликтуют. Они усиливают друг друга. Разработчик, который увидит предложение об хуке, запустит `pnpm changelog:add`. Claude будет следовать правилу CLAUDE.md и проверять выходные данные. CI подтверждает все перед слиянием.

---

## Принятие этого шаблона

Скрипты TypeScript (добавление, проверка, сборка, аудит) специфичны для стека Méthode Aristote. Шаблон трехуровневого применения остается универсальным: он работает с любым форматом фрагмента, любой системой CI, любым ассемблером.

**Минимальная возможная настройка:**

1. **Определите схему фрагмента** (YAML, JSON, все, что подходит вашему стеку)
2. **Добавьте правило CLAUDE.md**, кодирующее рабочий процесс создания, чтобы Claude мог обрабатывать его автономно.
3. **Добавьте хук `UserPromptSubmit`** с узором `if PR-intent without fragment-mention → suggest`.
4. **Добавьте задание CI**, которое проверяет наличие фрагмента перед объединением.

Шаблон перехвата распространяется на любой обязательный этап рабочего процесса. Замените «фрагмент журнала изменений» на «ADR», «флаг миграции», «проверка тестового покрытия». Логика условного обнаружения остается прежней.

---

## Связанный

- Пример хука: [`examples/hooks/bash/smart-suggest.sh`](../../examples/hooks/bash/smart-suggest.sh)
- Документация по хукам: [UserPromptSubmit Hooks](../ultimate-guide.md) (поиск «UserPromptSubmit»)
- Сценарии валидатора фрагментов и ассемблера: доступны в репозитории Méthode Aristote.
