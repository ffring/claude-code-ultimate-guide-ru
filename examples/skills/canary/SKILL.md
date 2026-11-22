---
name: canary
description: "Мониторинг после развертывания: следите за производством после развертывания и предупреждайте о регрессах."
argument-hint: "[--baseline]"
effort: medium
disable-model-invocation: true
---

# Canary: мониторинг после развертывания

Посмотрите живое приложение после развертывания. Оповещение об ошибках и регрессиях. Сравните с базовым уровнем перед развертыванием.

**Два режима:**
- `--baseline`: зафиксировать текущее состояние ПЕРЕД развертыванием
- *(по умолчанию)*: отслеживать ПОСЛЕ развертывания и сравнивать с базовым уровнем.

## Инструкции

### Этап 1: Настройка

Проанализируйте аргументы пользователя и определите контекст развертывания.

```bash
# Detect current branch and recent deploy commit
git branch --show-current
git log --oneline -5

# Auto-detect platform from config files
[ -f fly.toml ]         && echo "PLATFORM: fly"
[ -f render.yaml ]      && echo "PLATFORM: render"
[ -f vercel.json ]      && echo "PLATFORM: vercel"
[ -f netlify.toml ]     && echo "PLATFORM: netlify"
[ -f Procfile ]         && echo "PLATFORM: heroku"
[ -f railway.toml ]     && echo "PLATFORM: railway"

# Check for health endpoint
curl -sf "${URL}/health" -w "\n%{http_code}" 2>/dev/null | tail -1
curl -sf "${URL}/api/health" -w "\n%{http_code}" 2>/dev/null | tail -1
```

Создайте рабочий каталог:

```bash
mkdir -p .canary/baselines .canary/reports .canary/screenshots
```

---

### Этап 2: Захват базовой линии (режим `--baseline`)

Запустите это ПЕРЕД развертыванием, чтобы зафиксировать текущее работоспособное состояние.

Для каждой страницы, которую нужно отслеживать, запишите:

1. **HTTP status**: страница возвращает 200?
2. **Время ответа**: сколько времени занимает загрузка?
3. **Снимок содержимого**: ключевое текстовое содержимое для последующего обнаружения пустых страниц.

```bash
# For each page URL
for PAGE_PATH in "/" "/dashboard" "/settings" "/api/health"; do
  SLUG=$(echo "$PAGE_PATH" | tr '/' '_' | tr -d '?&=')
  RESULT=$(curl -sf -o /dev/null -w "%{http_code}|%{time_total}" "${BASE_URL}${PAGE_PATH}" 2>/dev/null)
  STATUS=$(echo "$RESULT" | cut -d'|' -f1)
  TIME_MS=$(echo "$RESULT" | awk -F'|' '{printf "%.0f", $2 * 1000}')
  echo "  ${PAGE_PATH}: HTTP ${STATUS}, ${TIME_MS}ms"
done
```

Сохраните базовую линию в `.canary/baselines/baseline.json`:

```json
{
  "url": "<base-url>",
  "timestamp": "<ISO-8601>",
  "branch": "<branch-name>",
  "commit": "<git-SHA>",
  "pages": {
    "/": { "status": 200, "time_ms": 450 },
    "/dashboard": { "status": 200, "time_ms": 680 },
    "/api/health": { "status": 200, "time_ms": 45 }
  }
}
```

Затем **STOP** и сообщите пользователю: «Базовые показатели сохранены. Разверните изменения, затем запустите `/canary <url>` для мониторинга».

---

### Этап 3. Открытие страницы.

Если страницы не указаны, выполняется автоматическое обнаружение страниц для мониторинга.

**Из приложения:**

```bash
# Check sitemap if available
curl -sf "${URL}/sitemap.xml" 2>/dev/null | grep -oP '(?<=<loc>)[^<]+' | head -10

# Check robots.txt for known paths
curl -sf "${URL}/robots.txt" 2>/dev/null | grep -i "allow\|disallow" | head -10

# Common paths to always check
echo "Always check: / /login /dashboard /settings /api/health"
```

Страницы по умолчанию для отслеживания, если ничего не найдено: `/` и только домашняя страница.

---

### Этап 4: Цикл мониторинга

Мониторинг в течение указанной продолжительности (по умолчанию: 10 минут). Запускайте проверку каждые 60 секунд.

**Каждый цикл проверки:**

```bash
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
CHECK_NUM=$((CHECK_NUM + 1))

for PAGE_PATH in "${PAGES[@]}"; do
  # Check HTTP status and response time
  RESULT=$(curl -sf -o /dev/null -w "%{http_code}|%{time_total}" \
    --max-time 10 "${BASE_URL}${PAGE_PATH}" 2>/dev/null || echo "0|0")
  STATUS=$(echo "$RESULT" | cut -d'|' -f1)
  TIME_MS=$(echo "$RESULT" | awk -F'|' '{printf "%.0f", $2 * 1000}')

  # Compare against baseline
  BASELINE_STATUS=$(jq -r ".pages[\"${PAGE_PATH}\"].status // 200" .canary/baselines/baseline.json 2>/dev/null)
  BASELINE_TIME=$(jq -r ".pages[\"${PAGE_PATH}\"].time_ms // 1000" .canary/baselines/baseline.json 2>/dev/null)

  echo "  [Check #${CHECK_NUM}] ${PAGE_PATH}: HTTP ${STATUS} (${TIME_MS}ms)"
done
```

**Уровни оповещений:**

| Уровень | Состояние | Курок |
|-------|-----------|---------|
| **КРИТИЧЕСКИЙ** | Ошибка загрузки страницы | Статус HTTP не 2xx, тайм-аут скручивания, сбой DNS |
| **HIGH** | Новые ошибки | Частота ошибок увеличилась по сравнению с базовым уровнем (ошибки консоли, ответы 5xx) |
| **MEDIUM** | Регресс производительности | Время ответа превышает базовый уровень в 2 раза |
| **LOW** | Новые неработающие ссылки | Ранее работавшие маршруты теперь возвращают 404. |

**Основные принципы:**
- **Alert об изменениях, а не об абсолютных значениях.** Страница с 3 ошибками в базовых показателях - это нормально, если еще 3. Одна НОВАЯ ошибка - это предупреждение.
- **Переходный допуск.** Предупреждает только о шаблонах, сохраняющихся в течение 2+ последовательных проверок. Одиночный сигнал сети не является оповещением.

**При срабатывании оповещения КРИТИЧЕСКОГО или ВЫСОКОГО уровня (2 последовательные проверки):**

```
CANARY ALERT
=====================================
Time:     [check #N at Xs elapsed]
Page:     [URL]
Level:    [CRITICAL / HIGH / MEDIUM / LOW]
Finding:  [what changed, be specific]
Baseline: [baseline value]
Current:  [current value]
=====================================
Options:
  A) Investigate now: stop monitoring, focus on this issue
  B) Continue monitoring: wait for next check to confirm
  C) Rollback: revert the deploy
  D) Dismiss: known issue, continue monitoring
```

---

### Этап 5: Отчет о состоянии здоровья

После завершения мониторинга (или остановки пользователя) подготовьте сводную информацию.

```
CANARY REPORT: [url]
=========================================
Duration:    [X minutes]
Checks:      [N total per page]
Pages:       [N pages monitored]
Commit:      [deployed SHA]
Status:      [HEALTHY / DEGRADED / BROKEN]

Per-Page Results:
-----------------------------------------
  Page           Status      Avg Time   Alerts
  /              HEALTHY     450ms      0
  /dashboard     DEGRADED    1100ms     1 medium (was 450ms)
  /settings      HEALTHY     380ms      0
  /api/health    HEALTHY     45ms       0

Alerts Fired: [N] (X critical, Y high, Z medium, W low)

VERDICT: [DEPLOY HEALTHY / DEPLOY HAS ISSUES (see alerts above)]
=========================================
```

Сохраните отчет в `.canary/reports/<date>-canary.md`.

---

### Этап 6: Обновление базовой линии

Если развертывание прошло успешно и пользователь хочет обновить базовые показатели:

```bash
cp .canary/reports/latest-snapshot.json .canary/baselines/baseline.json
echo "Baseline updated to commit $(git rev-parse --short HEAD)"
```

---

## Выходной формат

Полный шаблон CANARY ОТЧЕТА см. выше в Этапе 5.

Формат встроенного оповещения (во время мониторинга):
```
[08:42:15] Check #3: /dashboard: ALERT HIGH, response time 1250ms (baseline: 420ms)
[08:43:15] Check #4: /dashboard: ALERT HIGH, response time 1180ms (baseline: 420ms)
-> Consistent across 2 checks. Firing alert.
```

## Использование

```
/canary https://app.example.com                # Monitor homepage for 10 min
/canary https://app.example.com --baseline     # Capture baseline before deploying
/canary https://app.example.com --duration 5m  # Monitor for 5 minutes
/canary https://app.example.com --quick        # Single-pass health check (no loop)
/canary https://app.example.com --pages /,/dashboard,/api/health
```

## <a name="tips"></a>Советы

1. **Всегда записывайте базовые данные** перед развертыванием в рабочей среде: запустите `/canary <url> --baseline`
2. **Начать мониторинг немедленно** после развертывания; первые 5 минут выявляют 90% регрессов
3. **КРИТИЧЕСКИЕ оповещения** требуют немедленного расследования; не ждите окончания мониторинга
4. Оповещения **MEDIUM (производительность)** может быть связано с перегревом кэша; дайте ему еще 2-3 проверки, прежде чем действовать
5. **Сохраните `.canary/baselines/` в git**, чтобы любой член команды мог запускать Canary с одной и той же базовой версией.

## Связанные команды

- `/ship`: контрольный список перед развертыванием (выполняется перед развертыванием)
- `/land-and-deploy`: полный конвейер слияния для проверки (автоматический запуск canary)
- `/qa`: интерактивное тестирование качества перед отправкой

$ARGUMENTS
