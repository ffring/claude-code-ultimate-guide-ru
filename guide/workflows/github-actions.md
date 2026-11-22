---
title: "GitHub Actions Рабочие процессы с Claude Code"
description: "Пошаговая настройка действия claude-code в GitHub Actions: проверка PR-кода при упоминании, автоматическая проверка при отправке, сортировка проблем. Включает конфигурацию разрешений и реальные примеры YAML."
tags: [workflow, ci-cd, github-actions, automation]
---

# Рабочие процессы GitHub Actions с Claude Code

> **Confidence**: Уровень 1, официальное действие Anthropic (`anthropics/claude-code-action`, 8,5 тыс. звезд по состоянию на 27 июля 2026 г., 6,2 тыс., v1.0).

Автоматизируйте проверку кода, сортировку проблем и контроль качества, подключив Claude непосредственно к рабочему процессу GitHub. Две модели триггера: упоминание `@claude` (инициируется человеком) и автоматизация scheduled/event (полностью автономная).

---

## Оглавление

1. [TL;DR](#tldr)
2. [Две модели](#two-models)
3. [Настройка](#setup)
4. [Шаблон 1: Обзор PR-кода на @claude Mention](#pattern-1-pr-code-review-on-claude-mention)
5. [Шаблон 2: Автоматический PR-анализ Push](#pattern-2-automatic-pr-review-on-push)
6. [Шаблон 3: сортировка проблем и маркировка](#pattern-3-issue-triage-and-labeling)
7. [Шаблон 4: Обзор, ориентированный на безопасность](#pattern-4-security-focused-review)
8. [Шаблон 5: Плановое обслуживание репо](#pattern-5-scheduled-repo-maintenance)
9. [Альтернативы аутентификации](#authentication-alternatives)
10. [Контроль затрат](#cost-control)
11. [Контрольный список безопасности](#security-checklist)
12. [См. также](#see-also)

---

## <a name="tldr"></a>ТЛ;ДР

```yaml
# Minimal working example — paste into .github/workflows/claude.yml
name: Claude Code Review
on:
  issue_comment:
    types: [created]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Комментируйте `@claude review this PR` в любом пиаре → Claude читает различия и публикует обзор.

---

## <a name="two-models"></a>Две модели

| Модель | Курок | Вариант использования |
|-------|---------|----------|
| **Интерактивный** | Упоминание `@claude` в комментарии PR/issue | Обзоры по запросу, вопросы, исправления |
| **Автоматизированный** | Push, PR открыт, расписание, ярлык | Ворота непрерывного качества, сортировка |

Оба используют одно и то же действие: разница заключается в блоке `on:` и в том, включаете ли вы условие `if:`.

---

## <a name="setup"></a>Настройка

### Быстрый старт (30 секунд)

В вашем терминале Claude Code внутри любого проекта, подключенного к репозиторию GitHub:

```
/install-github-app
```

Это поможет вам создать приложение GitHub, добавить `ANTHROPIC_API_KEY` в секреты вашего репозитория и создать базовый рабочий процесс `claude.yml`.

### Ручная настройка

1. Добавьте `ANTHROPIC_API_KEY` в секреты вашего репозитория GitHub.
2. Создайте `.github/workflows/claude.yml` (см. шаблоны ниже)
3. Предоставьте разрешения рабочего процесса: `contents: write`, `pull-requests: write`, `issues: write`.

---

## <a name="pattern-1-pr-code-review-on-claude-mention"></a>Схема 1. Проверка PR-кода при упоминании @claude

По инициативе человека. Комментарии разработчика `@claude review this PR` и Claude отвечают в режиме онлайн.

```yaml
# .github/workflows/claude-review.yml
name: Claude Interactive Review
on:
  issue_comment:
    types: [created, edited]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    if: |
      contains(github.event.comment.body, '@claude') ||
      contains(github.event.review_comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_env: |
            GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
```

**Примеры использования:**
- `@claude review this PR`: полный анализ различий с предложениями
- `@claude is this change backwards compatible?`: целевой вопрос
- `@claude fix the failing test in src/auth.test.ts`: Claude открывает следующий PR с исправлением.

---

## <a name="pattern-2-automatic-pr-review-on-push"></a>Схема 2. Автоматический PR-анализ при нажатии

Каждый PR получает обзор в момент его открытия или обновления. Никаких упоминаний не требуется.

```yaml
# .github/workflows/claude-auto-review.yml
name: Claude Auto PR Review
on:
  pull_request:
    types: [opened, synchronize]
    # Optional: only trigger on specific paths
    # paths:
    #   - 'src/**'
    #   - '!**/*.md'

jobs:
  claude-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Review this pull request. Focus on:
            - Logic errors and edge cases
            - Security issues (injection, auth, secrets)
            - Performance regressions
            - Missing error handling

            Format your response as:
            ## Summary
            One paragraph describing the change.

            ## Issues Found
            Numbered list, severity (Critical/Major/Minor), file:line reference.

            ## Suggestions
            Optional improvements.

            Keep it under 400 words. Be direct.
```

**Tip**: добавьте `paths:`, чтобы избежать срабатывания PR только для документов, или `if: github.event.pull_request.draft == false`, чтобы пропускать черновики.

---

## <a name="pattern-3-issue-triage-and-labeling"></a>Схема 3: сортировка проблем и маркировка

Claude читает новые проблемы, присваивает им ярлыки и публикует структурированные комментарии по сортировке.

```yaml
# .github/workflows/claude-triage.yml
name: Issue Triage
on:
  issues:
    types: [opened]

jobs:
  triage:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Triage this GitHub issue:

            1. Assign one label from: bug, enhancement, question, documentation, performance, security
            2. Assign a priority label: priority:critical, priority:high, priority:medium, priority:low
            3. Post a comment with:
               - Issue type classification
               - Which component is likely affected (based on the issue description)
               - Next step recommendation for the reporter (reproduce steps needed? version info missing?)

            Be brief. One sentence per point.
```

---

## <a name="pattern-4-security-focused-review"></a>Схема 4: Проверка, ориентированная на безопасность

Работает специально для PR, затрагивающих конфиденциальные пути (аутентификация, платежи, конфигурация).

```yaml
# .github/workflows/claude-security.yml
name: Security Review
on:
  pull_request:
    paths:
      - 'src/auth/**'
      - 'src/payments/**'
      - '**/config/**'
      - '**/.env*'
      - '**/secrets/**'

jobs:
  security-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Perform a security-focused review of this PR. Check for:

            - Injection vulnerabilities (SQL, command, LDAP)
            - Authentication and authorization bypasses
            - Secrets or credentials in code or comments
            - Insecure direct object references
            - Missing input validation
            - Unsafe deserialization
            - OWASP Top 10 patterns

            Rate overall risk: Low / Medium / High / Critical.
            If High or Critical, add the label 'security-review-required'.
            List each finding with: file:line, vulnerability type, and recommended fix.
```

---

## <a name="pattern-5-scheduled-repo-maintenance"></a>Схема 5: Плановое обслуживание репо

Еженедельная проверка работоспособности: выполняется без участия человека.

```yaml
# .github/workflows/claude-maintenance.yml
name: Weekly Repo Health Check
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am UTC
  workflow_dispatch:       # Also allows manual trigger

jobs:
  maintenance:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
    steps:
      - uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Perform a weekly repository health check:

            1. Scan package.json (or equivalent) for outdated major dependencies
            2. Check for TODO/FIXME comments older than 30 days in src/
            3. Identify any test files without corresponding implementation files
            4. List any documentation files that reference deleted or renamed files

            Open a GitHub issue titled "Weekly Health Check - [date]" with your findings.
            If nothing requires attention, post a comment "Health check passed — no issues found."
```

---

## <a name="authentication-alternatives"></a>Альтернативы аутентификации

В приведенных выше примерах `ANTHROPIC_API_KEY` используется напрямую. Для команд, использующих облачных провайдеров:

**Коренная порода Амазонки:**
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    use_bedrock: 'true'
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: us-east-1
    ANTHROPIC_MODEL: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
```

**Google Vertex AI:**
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    use_vertex: 'true'
  env:
    ANTHROPIC_VERTEX_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
    CLOUD_ML_REGION: us-east5
    ANTHROPIC_MODEL: 'claude-3-5-sonnet-v2@20241022'
```

Поставщики облачных услуг получают выгоду от соответствия требованиям к местонахождению данных и могут использовать существующие политики IAM вместо управления отдельным ключом API.

---

## <a name="cost-control"></a>Контроль затрат

Автоматизированные рабочие процессы выполняются без участия человека: установите четкие ограничения.

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    # Cap spend per workflow run
    claude_args: '--max-budget-usd 0.50'
    # Use Haiku for triage, Sonnet for reviews — don't default to Opus
    prompt: |
      ...
```

**Руководство по бюджету по шаблону:**

| Шаблон | Модель | Прибл. стоимость/пробег |
|---------|-------|--------------------|
| PR-обзор (средний PR) | Sonnet | $0.05–0.15 |
| Сортировка проблем | Haiku | $0.01–0.03 |
| Обзор безопасности (большой PR) | Sonnet | $0.10–0.25 |
| Плановое обслуживание | Sonnet | $0.05–0.20 |

Отслеживайте фактические расходы с помощью `ccusage` или информационной панели использования консоли Anthropic.

**Предотвратить неконтролируемые расходы:**
- Используйте фильтры `paths:`, чтобы избежать срабатывания нерелевантных изменений.
- Добавьте `if: github.event.pull_request.draft == false`, чтобы пропустить черновики PR.
- Установите `concurrency:`, чтобы предотвратить параллельное выполнение одного и того же PR.

```yaml
jobs:
  claude-review:
    concurrency:
      group: claude-${{ github.event.pull_request.number }}
      cancel-in-progress: true
```

---

## <a name="security-checklist"></a>Контрольный список безопасности

Перед развертыванием в командном репозитории:

- [ ] `ANTHROPIC_API_KEY` хранится как секрет GitHub и никогда не используется в рабочем процессе YAML.
- [ ] Разрешения рабочего процесса минимальны: используйте `contents: read`, если не требуется запись.
- [ ] Для общедоступных репозиториев: добавьте `if: github.event.pull_request.head.repo.full_name == github.repository`, чтобы запретить PR-форкам запускать вызовы API.
- [ ] Просматривайте общедоступные публикации рабочего процесса: комментарии Claude видны всем участникам.
- [ ] Используйте `pull_request_target` с осторожностью: он запускается с правами на запись даже из форков.

**Шаблон безопасности вилки (публичные репозитории):**
```yaml
jobs:
  claude:
    # Only run on PRs from the same repo, not forks
    if: github.event.pull_request.head.repo.full_name == github.repository
```

---

## <a name="see-also"></a>См. также

- [AI Шаблоны проектирования: каналы и фильтры](../core/ai-design-patterns.md#pipes-and-filters): `claude -p` как один фильтр в оболочке или конвейере CI
- [Monitor, каналы и безопасное делегирование Codex](./monitor-event-delegation.md): безопасный шаблон разделения заданий Codex и почему размещенный исполнитель отделен от локального монитора

- [Раздел 9.3 CI/CD Интеграция](#93-cicd-integration): безголовый режим, конвейерная обработка Unix, `--output-format json`
- [Производственная безопасность](../security/production-safety.md): ограждения для автоматических агентов
- [Усиление безопасности](../security/security-hardening.md): MCP и безопасность веб-перехватчика
- [Официальные документы](https://github.com/anthropics/claude-code-action): руководство по решениям, миграция, облачные провайдеры
- [Схема рабочих процессов сообщества](https://github.com/alirezarezvani/claude-code-github-workflow): 8 рабочих процессов + 4 автономных агента для продвинутых команд
