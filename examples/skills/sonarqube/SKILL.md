---
name: sonarqube
description: "Анализ проблем с качеством SonarCloud для конкретного PR"
argument-hint: "[project_key]"
effort: medium
when_to_use: "Use when running SonarQube analysis or interpreting SonarQube findings."
disable-model-invocation: true
---

# Анализ SonarQube

Анализируйте проблемы качества SonarCloud для конкретного PR. Формирует подробный отчет с показателями, основными нарушителями и планом действий.

**Основной принцип:** Только анализ = никаких изменений кода, чистое понимание.

## Процесс

1. **Verify Token**: проверьте переменную среды `$SONARQUBE_TOKEN`.
2. **Проблемы с получением**: По вопросам связи с общественностью звоните в SonarCloud API.
3. **Parse Data**: группировка по серьезности, типу, файлу и правилу.
4. **Создать отчет**: структурированный вывод с планом действий
5. **Cleanup**: удалить временные файлы.

## <a name="prerequisites"></a>Предварительные условия

### Переменная среды

```bash
# Set SonarQube token (add to ~/.bashrc or ~/.zshrc)
export SONARQUBE_TOKEN="your_token_here"

# Verify token is set
echo $SONARQUBE_TOKEN
```

**Чтобы получить токен:**
1. Перейдите в SonarCloud → Моя учетная запись → Безопасность.
2. Создать новый токен
3. Скопировать и экспортировать как переменную среды

### Конфигурация проекта

Настройте детали вашего проекта SonarCloud:

```bash
# Add to project's CLAUDE.md or as environment variables
SONAR_ORGANIZATION="your-org-name"
SONAR_PROJECT_KEY="your-org_your-project"
SONAR_BASE_URL="https://sonarcloud.io/api"
```

**Если не установлено:** Попросите пользователя предоставить ключ организации и проекта.

## Проблемы с получением

**Важно:** Прямое скручивание с `-u "$SONARQUBE_TOKEN:"` не выполняется в zsh из-за анализа аутентификации. Используйте оболочку bash-скрипта:

```bash
# Create temporary bash script to handle authentication
cat > /tmp/fetch_sonar.sh << 'SCRIPT'
#!/bin/bash
curl -s -u "${SONARQUBE_TOKEN}:" \
  "https://sonarcloud.io/api/issues/search?componentKeys=${SONAR_PROJECT_KEY}&pullRequest=$1&issueStatuses=OPEN,CONFIRMED&sinceLeakPeriod=true&ps=500"
SCRIPT

chmod +x /tmp/fetch_sonar.sh
/tmp/fetch_sonar.sh $PR_NUMBER > /tmp/sonar_pr_$PR_NUMBER.json
```

**API Параметры:**
- `componentKeys`: ключ вашего проекта
- `pullRequest`: номер заказа
- `issueStatuses`: ОТКРЫТО, ПОДТВЕРЖДЕНО (исключить решенное)
- `sinceLeakPeriod`: В этом PR только новые выпуски.
- `ps`: Размер страницы (максимум 500)

## Скрипт анализа

Создайте сценарий анализа Node.js в `/tmp/sonar_analyze.js`:

```javascript
const fs = require('fs');
const prNumber = process.argv[2];
const data = JSON.parse(fs.readFileSync(`/tmp/sonar_pr_${prNumber}.json`, 'utf8'));
const issues = data.issues || [];

// Group by severity
const bySeverity = issues.reduce((acc, i) => {
  acc[i.severity] = (acc[i.severity] || 0) + 1;
  return acc;
}, {});

// Group by type
const byType = issues.reduce((acc, i) => {
  acc[i.type] = (acc[i.type] || 0) + 1;
  return acc;
}, {});

// Group by file
const byFile = issues.reduce((acc, i) => {
  const file = i.component.split(':')[1] || i.component;
  acc[file] = (acc[file] || 0) + 1;
  return acc;
}, {});

// Group by rule
const byRule = issues.reduce((acc, i) => {
  if (!acc[i.rule]) {
    acc[i.rule] = {
      count: 0,
      severity: i.severity,
      message: i.message
    };
  }
  acc[i.rule].count++;
  return acc;
}, {});

// Output structured data
console.log(JSON.stringify({
  total: data.total,
  bySeverity,
  byType,
  topFiles: Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10),
  topRules: Object.entries(byRule)
    .map(([rule, d]) => ({ rule, ...d }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}, null, 2));
```

**Выполнить анализ:**
```bash
node /tmp/sonar_analyze.js $PR_NUMBER > /tmp/sonar_analysis_$PR_NUMBER.json
```

## Формат отчета

Создать форматированный отчет на основе анализа:

```
📊 SonarCloud Analysis - PR #XXX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Issues: {TOTAL}

By Severity:
🔴 Blocker/Critical: {COUNT} ({PERCENTAGE}%)
🟡 Major: {COUNT} ({PERCENTAGE}%)
🔵 Minor/Info: {COUNT} ({PERCENTAGE}%)

By Type:
🐛 Bugs: {COUNT}
🛡️ Vulnerabilities: {COUNT}
🧹 Code Smells: {COUNT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 TOP 10 FILES WITH ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. src/components/UserProfile.tsx - 8 issues
2. src/services/auth.service.ts - 5 issues
3. src/utils/validation.ts - 4 issues
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ TOP 5 VIOLATED RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. typescript:S1854 (MAJOR) - 12 occurrences
   "Dead stores should be removed"

2. typescript:S3776 (CRITICAL) - 8 occurrences
   "Cognitive Complexity of functions should not be too high"

3. typescript:S1186 (MINOR) - 6 occurrences
   "Functions should not be empty"
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ACTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 - CRITICAL/BLOCKER ({COUNT} issues):
  • Fix immediately before merge
  • Focus on: {TOP_FILES}

Priority 2 - MAJOR ({COUNT} issues):
  • Address in this PR if possible
  • Consider technical debt ticket if extensive

Priority 3 - MINOR/INFO ({COUNT} issues):
  • Can be addressed in follow-up PR
  • Add to backlog for refactoring sprint

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View in SonarCloud:
https://sonarcloud.io/project/pull_requests_list?id={PROJECT_KEY}&pullRequest={PR_NUMBER}
```

## Сопоставление серьезности

| SonarCloud | Символ | Приоритет | Действие |
|------------|--------|----------|--------|
| БЛОКЕР | 🔴 | P0 | Исправьте немедленно |
| КРИТИЧЕСКИЙ | 🔴 | P0 | Исправьте немедленно |
| ГЛАВНЫЙ | 🟡 | P1 | Исправьте в этом PR |
| НЕЗНАЧИТЕЛЬНЫЙ | 🔵 | P2 | Рассмотрите возможность дальнейшего наблюдения |
| ИНФОРМАЦИЯ | 🔵 | P3 | Дополнительное улучшение |

## Типы проблем

| Тип | Символ | Описание |
|------|--------|-------------|
| ОШИБКА | 🐛 | Код, который явно неправильный |
| УЯЗВИМОСТЬ | 🛡️ | Проблемы безопасности |
| CODE_SMELL | 🧹 | Проблема ремонтопригодности |
| SECURITY_HOTSPOT | 🔒 | Чувствительный к безопасности код для проверки |

## Очистка

Всегда очищайте временные файлы после выполнения:

```bash
rm -f /tmp/fetch_sonar.sh
rm -f /tmp/sonar_pr_$PR_NUMBER.json
rm -f /tmp/sonar_analyze.js
rm -f /tmp/sonar_analysis_$PR_NUMBER.json
```

## Обработка ошибок

| Ошибка | Причина | Действие |
|-------|-------|--------|
| Токен не установлен | `$SONARQUBE_TOKEN` отсутствует | Попросить пользователя экспортировать токен |
| 401 Несанкционированный | Недействительный или просроченный токен | Запросить новый токен у SonarCloud |
| 404 Не найден | PR не существует в SonarCloud | Проверьте номер заказа и ключ проекта. |
| Пустой ответ | Проблем не обнаружено | Сообщите о чистом пиаре, поздравьте команду |
| >500 выпусков | Достигнут предел нумерации страниц | Предупреждать о неполных данных, предлагать фильтрацию |
| Ошибка сети | API недоступен | Проверьте подключение к Интернету, повторите попытку. |

## Варианты конфигурации

### Конфигурация уровня проекта

Создайте `.sonarcloud.properties` или добавьте в `CLAUDE.md`:

```properties
# SonarCloud Configuration
SONAR_ORGANIZATION=your-org
SONAR_PROJECT_KEY=your-org_your-project
SONAR_EXCLUSIONS=**/*.test.ts,**/*.spec.ts,**/migrations/**
SONAR_COVERAGE_EXCLUSIONS=**/*.test.ts,src/test/**
```

### Ограничения скорости API

Ограничения SonarCloud API:
- Уровень бесплатного пользования: 10 000 requests/day
- Платный уровень: Без ограничений

**Tip:** Кэшируйте результаты повторных запросов к одному и тому же PR.

## Примеры интеграции

### GitHub Actions

```yaml
- name: SonarQube Analysis
  run: |
    export SONARQUBE_TOKEN=${{ secrets.SONAR_TOKEN }}
    export SONAR_PROJECT_KEY="${{ secrets.SONAR_PROJECT }}"
    claude -p "/sonarqube ${{ github.event.pull_request.number }}"
```

### Хук перед слиянием

Добавьте в `.claude/hooks/pre-merge.sh`:

```bash
#!/bin/bash
PR_NUMBER=$(gh pr view --json number -q .number)
claude -p "/sonarqube $PR_NUMBER"
```

## Красные флажки – НИКОГДА не делайте

**Never:**
- ❌ Изменение кода или автоматическое исправление проблем (команда только для анализа)
- ❌ Пропустить проверку токена (риск безопасности)
- ❌ Оставьте временные файлы в `/tmp` (требуется очистка)
- ❌ Зафиксируйте токен SonarQube в репозитории (используйте переменные env)
- ❌ Запуск без проверки срока действия токена

**Always:**
- ✅ Создать структурированный, действенный отчет
- ✅ Уборка после выполнения
- ✅ Грамотно обрабатывайте ошибки API.
- ✅ Убедитесь, что токен действителен перед вызовом API.
- ✅ Четко анализируйте и представляйте данные

## Расширенное использование

### Пользовательские фильтры

```bash
# Only show critical/blocker issues
/sonarqube 123 --severity BLOCKER,CRITICAL

# Only show bugs and vulnerabilities
/sonarqube 123 --types BUG,VULNERABILITY

# Specific file pattern
/sonarqube 123 --files "src/services/**"
```

### Несколько PR

```bash
# Compare issues across PRs
/sonarqube 123,124,125 --compare
```

## <a name="troubleshooting"></a>Поиск неисправностей

### Проблема: «curl: (22) Запрошенный URL-адрес вернул ошибку: 401»

**Причина:** Неверный или отсутствующий токен

**Fix:**
```bash
# Regenerate token in SonarCloud
# Export new token
export SONARQUBE_TOKEN="new_token_here"
```

### Проблема: «Пустой ответ или нет проблем»

**Причина:** Анализ еще не завершен или PR не проанализирован

**Fix:** Дождитесь завершения анализа SonarCloud (~ 2–5 минут после создания PR)

### Проблема: «ComponentKeys не найден»

**Причина:** Неправильный ключ проекта

**Fix:** Проверьте ключ проекта в URL-адресе SonarCloud:
```
https://sonarcloud.io/project/overview?id=YOUR_PROJECT_KEY
```

## Примеры использования

```bash
# Basic usage
/sonarqube 170

# With PR prefix
/sonarqube PR #234

# Using PR URL
/sonarqube https://github.com/org/repo/pull/170

# Custom severity filter (if implemented)
/sonarqube 170 --critical-only
```

Номер заказа: $ARGUMENTS
