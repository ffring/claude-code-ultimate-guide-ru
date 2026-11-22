---
name: land-and-deploy
description: "Объедините PR, дождитесь CI, проверьте развертывание, запустите canary. Полный посадочный трубопровод."
argument-hint: "[--skip-checks] [--env staging|production]"
effort: high
disable-model-invocation: true
---

# Приземлиться и развернуть

Полный посадочный конвейер: объедините PR, дождитесь CI, проверьте развертывание, запустите проверку работоспособности.

Начинает с того места, где остановился `/ship`. `/ship` создает PR. Эта команда объединяет его и проверяет производство.

**По умолчанию неинтерактивен.** Пользователь сказал «приземли это», так что приземли его. Останавливайтесь только за воротами критической готовности и жесткими блокирующими.

## Инструкции

### Шаг 1. Подготовка к полету

```bash
# Verify GitHub CLI is authenticated
gh auth status

# Detect PR from current branch (or use argument if provided)
gh pr view --json number,state,title,url,mergeStateStatus,mergeable,baseRefName,headRefName
```

**Условия остановки:**
- GitHub CLI не аутентифицирован → «Сначала запустите `gh auth login`»
- PR не существует → «Для этой ветки PR не найден. Сначала запустите `/ship`».
- Пиар уже слит → «Пиар уже слит».
- ПР закрыт → «ПР закрыт. Сначала откройте заново».

---

### Шаг 2. Проверка статуса ЭК

```bash
# Check current CI status
gh pr checks --json name,state,status,conclusion

# Check for merge conflicts
gh pr view --json mergeable -q .mergeable
```

**Условия остановки:**
- Обязательные проверки FAILING → показать неудавшиеся проверки, остановить
- `mergeable` — это `CONFLICTING` → «PR имеет конфликты слияния. Решайте их и продвигайте перед приземлением».
- Обязательные проверки ОЖИДАЮТСЯ → перейдите к шагу 3 (дождитесь CI)
- Все проверки пройдены → перейдите к шагу 3.5 (ворота готовности)

---

### Шаг 3. Дождитесь CI (если он ожидает)

```bash
# Watch CI checks with 15-minute timeout
gh pr checks --watch --fail-fast
```

- CI пройден → перейдите к шагу 3.5.
- Сбой CI → остановить, показать сбои
- Таймаут (15 минут) → «CI работает уже 15 минут. Проверьте вручную».

Запишите продолжительность ожидания CI для отчета о развертывании.

---

### Шаг 3.5: Ворота готовности перед слиянием

**Это единственное важное подтверждение перед необратимым слиянием.** Соберите все доказательства, а затем получите явное одобрение.

#### Проверка проверки устаревания

```bash
# How many commits since the last review in this branch?
git log --oneline $(git merge-base HEAD origin/main)..HEAD | wc -l

# What changed after any review was done?
git log --oneline -10
```

Пороги устаревания:
- 0–3 коммита с момента проверки → ТЕКУЩИЙ (зеленый)
- 4+ коммита, новый код → УСТАРЕВШИЙ (желтый, проверка может не отражать текущий код)
- Обзор не найден → НЕ ВЫПУСКАТЬ (желтый)

#### Результаты испытаний

```bash
# Run tests now (fast tests only)
npm test 2>/dev/null || pnpm test 2>/dev/null || \
  pytest --tb=short -q 2>/dev/null || \
  go test ./... 2>/dev/null

# Check exit code
echo "Tests exit code: $?"
```

Неудачные тесты = БЛОКЕР. Невозможно объединиться с неудачными тестами.

#### Проверка документации

```bash
# Were CHANGELOG and docs updated on this branch?
git diff --name-only $(git merge-base HEAD origin/main)...HEAD -- \
  README.md CHANGELOG.md ARCHITECTURE.md CONTRIBUTING.md CLAUDE.md VERSION
```

Если CHANGELOG.md и VERSION НЕ были изменены и разница включает в себя новые функции → ПРЕДУПРЕЖДЕНИЕ.

#### Отчет о готовности

Представьте резюме и попросите явного подтверждения:

```
╔══════════════════════════════════════════════════════════╗
║              PRE-MERGE READINESS REPORT                  ║
╠══════════════════════════════════════════════════════════╣
║  PR: #NNN: [title]                                       ║
║  Branch: feature-branch → main                           ║
║                                                          ║
║  REVIEWS                                                 ║
║    Review:     CURRENT / STALE (N commits) / NOT RUN     ║
║                                                          ║
║  TESTS                                                   ║
║    Fast tests: PASS / FAIL (blocker)                     ║
║                                                          ║
║  DOCUMENTATION                                           ║
║    CHANGELOG:  Updated / NOT UPDATED (warning)           ║
║    VERSION:    Bumped / NOT BUMPED (warning)             ║
║                                                          ║
║  WARNINGS: N  |  BLOCKERS: N                             ║
╚══════════════════════════════════════════════════════════╝

Options:
  A) Merge (all checks green)
  B) Don't merge yet, address warnings first
  C) Merge anyway (I understand the risks)
```

Если пользователь выбирает B, перечислите, что именно нужно сделать, и остановитесь.

---

### Шаг 4: Объедините PR

```bash
# Merge (auto-detect method from repo settings, delete branch after)
gh pr merge --auto --delete-branch

# Fallback if auto-merge is not enabled
# gh pr merge --squash --delete-branch
```

Запишите SHA и временную метку фиксации слияния.

Если слияние не удалось с ошибкой разрешения → «У вас нет разрешений на слияние. Попросите специалиста по слиянию выполнить слияние».

Если очередь слияния активна, опрашивайте до тех пор, пока она не будет объединена:

```bash
# Poll every 30 seconds, timeout after 30 minutes
gh pr view --json state -q .state
```

---

### Шаг 5: Обнаружение платформы

Определите, как развертывается этот проект, чтобы мы знали, что проверять.

```bash
# Detect platform from config files
[ -f fly.toml ]         && echo "PLATFORM: fly"
[ -f render.yaml ]      && echo "PLATFORM: render"
[ -f vercel.json ] || [ -d .vercel ] && echo "PLATFORM: vercel"
[ -f netlify.toml ]     && echo "PLATFORM: netlify"
[ -f Procfile ]         && echo "PLATFORM: heroku"
[ -f railway.toml ]     && echo "PLATFORM: railway"

# Detect GitHub Actions deploy workflows
for f in .github/workflows/*.yml .github/workflows/*.yaml; do
  [ -f "$f" ] && grep -qiE "deploy|release|production|cd" "$f" 2>/dev/null && echo "DEPLOY_WORKFLOW: $f"
done

# Classify diff scope (frontend / backend / docs / config)
git diff --name-only $(git merge-base HEAD~1 origin/main)...HEAD | \
  awk '{
    if (/\.(css|scss|tsx|jsx|html|svg)$/ || /components|pages|public\//) f=1;
    if (/api\/|server\/|backend\/|\.(go|py|rb|java)$/) b=1;
    if (/README|CHANGELOG|docs\/|\.(md)$/) d=1;
    if (/\.env|config\/|\.toml$|\.yaml$/) c=1;
  } END {
    if (f) print "SCOPE_FRONTEND=true";
    if (b) print "SCOPE_BACKEND=true";
    if (d) print "SCOPE_DOCS=true";
    if (c) print "SCOPE_CONFIG=true";
  }'
```

**Дерево решений:**
- Разница только для документации → пропустите проверку развертывания, перейдите к шагу 8.
- Нет рабочего процесса развертывания + не указан URL-адрес → спросите пользователя, есть ли в этом проекте веб-развертывание.
- В противном случае → перейдите к шагу 6.

---

### Шаг 6. Дождитесь развертывания.

**GitHub Actions Рабочий процесс развертывания:**

```bash
# Find the run triggered by the merge commit
gh run list --branch main --limit 10 --json databaseId,headSha,status,conclusion,workflowName

# Poll until complete (30s interval, 20 min timeout)
gh run view <run-id> --json status,conclusion
```

**Стратегии, специфичные для платформы:**

| Платформа | Обнаружение | Стратегия ожидания |
|----------|-----------|---------------|
| Версель / Netlify | Автоматическое развертывание при нажатии | Подождите 60 секунд для распространения, затем проверьте |
| Fly.io | `fly.toml` присутствует | `fly status --app <app>`, проверьте статус `started` |
| Оказывать | `render.yaml` присутствует | Опрашивать URL-адрес производства, пока он не ответит 200. |
| Хероку | `Procfile` присутствует | `heroku releases --app <app> -n 1` |
| железная дорога | `railway.toml` присутствует | URL-адрес опроса |
| только GitHub Actions | `.github/workflows/` с шагом развертывания | Опрос `gh run view` |

Если развертывание не удалось → предложите изучить журналы или создать возвратную фиксацию.

Запишите продолжительность развертывания отчета.

---

### Шаг 7: Проверка работоспособности производства

Используйте область различий (из шага 5), чтобы определить глубину проверки:

| Область различий | Канарская глубина |
|------------|--------------|
| Только документы | Уже пропущено на шаге 5. |
| Только конфигурация | HTTP 200 только проверка дыма |
| Только серверная часть | Проверка статуса + времени ответа |
| Фронтенд (любой) | Полный: статус + время ответа + проверка контента |
| Смешанный | Полная проверка |

**Полная последовательность проверки работоспособности:**

```bash
# 1. Page loads (200 status)
curl -sf -o /dev/null -w "%{http_code}" "${PROD_URL}" 2>/dev/null

# 2. Response time check
curl -sf -o /dev/null -w "%{time_total}" "${PROD_URL}" 2>/dev/null

# 3. Health endpoint (if exists)
curl -sf "${PROD_URL}/health" 2>/dev/null || \
curl -sf "${PROD_URL}/api/health" 2>/dev/null

# 4. Content check: page is not blank
curl -sf "${PROD_URL}" 2>/dev/null | wc -c
```

Критерии прохождения:
- Статус HTTP 200
- Время отклика менее 10 секунд
- На странице есть контент (>500 байт)
- Конечная точка работоспособности возвращает 200 (если настроено).

Если какая-либо проверка не удалась → предложите вернуться:

```
Post-deploy health check detected issues:
  [finding, specific]

Options:
  A) Investigate (this may be normal: cache warming, eventual consistency)
  B) Rollback (revert the merge commit)
  C) Continue (I'll monitor manually)
```

---

### Шаг 8. Откат (при необходимости).

```bash
# Fetch the latest base branch
git fetch origin main

# Create a revert commit
git checkout main
git revert <merge-commit-sha> --no-edit
git push origin main
```

Если конфликты → «Возврат имеет конфликты. Запустите `git revert <sha>` вручную для разрешения».
Если защита ветки → «Создать возвратный PR: `gh pr create --title 'revert: <title>'`»

---

### Шаг 9. Развертывание отчета

```
LAND & DEPLOY REPORT
═════════════════════════════════════════
PR:           #NNN: [title]
Branch:       feature-branch → main
Merged:       [timestamp] (squash / merge)
Merge SHA:    [short SHA]

Timing:
  CI wait:    [Xm Ys / skipped]
  Deploy:     [Xm Ys / no workflow detected]
  Health:     [Xs / skipped]
  Total:      [end-to-end duration]

CI:           PASSED / FAILED / SKIPPED
Deploy:       PASSED / FAILED / NO WORKFLOW
Production:   HEALTHY / DEGRADED / SKIPPED / REVERTED
  Status:     [HTTP status code]
  Response:   [Xms]

VERDICT: DEPLOYED AND VERIFIED / DEPLOYED (UNVERIFIED) / REVERTED
═════════════════════════════════════════
```

---

### Шаг 10: Последующие предложения

После отчета о развертывании предложите соответствующие следующие шаги:

- Если рабочий URL-адрес подтвержден: «Запустите `/canary <url>` для расширенного 10-минутного мониторинга».
- Если были добавлены новые функции: «Запустите `/document-release`, чтобы обновить документацию проекта».

---

## Важные правила

- **Никогда не нажимайте принудительно.** Используйте `gh pr merge` (это безопасно).
- **Никогда не пропускайте CI.** Неудачные проверки = стоп.
- **Однопроходная производственная проверка.** Для расширенного мониторинга используйте `/canary`.
- **Revert всегда возможен.** В каждой точке отказа предлагайте возврат в качестве аварийного выхода.
- **Удалить ветку функций** после слияния (через `--delete-branch`).
- **Цель**: пользователь вводит `/land-and-deploy`, следующее, что он видит, это отчет о развертывании.

## Использование

```
/land-and-deploy                                    # Auto-detect PR, no canary URL
/land-and-deploy https://app.example.com            # Auto-detect PR + verify this URL
/land-and-deploy 123                                # Specific PR number
/land-and-deploy 123 https://app.example.com        # PR number + verification URL
```

## Связанные команды

- `/ship`: сначала запустите это, чтобы создать PR.
- `/canary`: расширенный цикл мониторинга после развертывания.
- `/review-pr`: просмотрите PR перед приземлением

$ARGUMENTS
