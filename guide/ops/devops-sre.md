---
title: "DevOps и SRE с Claude Code"
description: "Платформа FIRE для диагностики инфраструктуры и рабочие процессы DevOps с Claude Code"
tags: [devops, guide, ci-cd, workflows]
---

# DevOps и SRE с Claude Code

**Время чтения**: 30 минут
**Уровень навыков**: Средний (предполагается знание основ DevOps)
**Предварительные требования**: основы Claude Code ([Разделы 1–2](#getting-started) основного руководства)

---

> **The FIRE Framework**: систематический подход к диагностике инфраструктуры с помощью Claude Code.
>
> **F**первый ответ → **I**исследовать → **R**исправить → **E**оценивать

---

## Оглавление

1. [Быстрый старт](#quick-start)
2. [Шаблон: Диагностика инфраструктуры](#pattern-infrastructure-diagnosis)
3. [Шаблон: Реагирование на инцидент](#pattern-incident-response)
4. [Шаблон: Инфраструктура как код](#pattern-infrastructure-as-code)
5. [Ограждения и внедрение](#guardrails--adoption)
6. [Краткая справка](#quick-reference)

---

# <a name="quick-start"></a>Быстрый старт

**Цель**: повысьте продуктивность с Claude Code для DevOps за 5 минут.

## Быстрая самопроверка

| Ситуация | Перейти к |
|-----------|---------|
| Я СЕЙЧАС нахожусь в активном инциденте | [Чрезвычайная ситуация: устранение неполадок K8s](#kubernetes-troubleshooting) |
| Впервые использую Claude для DevOps | [Руководство: Первая диагностика](#your-first-infrastructure-diagnosis) |
| Хотите автоматизировать свои Runbook | [Шаблон: Реагирование на инцидент](#pattern-incident-response) |
| Оценка для моей команды | [Ограждения и внедрение](#guardrails--adoption) |
| Нужны готовые подсказки | [Краткая справка](#quick-reference) |

## Система FIRE

Каждая диагностика инфраструктуры с помощью Claude выполняется по следующему шаблону:

```
F - First Response   → Give Claude the symptom + context
I - Investigate      → Claude analyzes logs, metrics, config
R - Remediate        → Claude proposes fix (with human approval)
E - Evaluate         → Postmortem, documentation, prevention
```

### Почему ОГОНЬ?

| Фаза | Роль человека | Claude Роль |
|-------|------------|-------------|
| **F**первый ответ | Опишите симптом, предоставьте контекст | Сортировка, определение приоритетности проверок |
| **I**расследовать | Запустить команды, вставить вывод | Анализируйте, сопоставляйте, выдвигайте гипотезы |
| **R**emediate | **Одобрить или отклонить** | Предложите исправление, объясните последствия |
| **E**оценить | Обзор, поделитесь знаниями | Создать вскрытие, документы |

**Critical**: Claude предлагает, вы одобряете. Это особенно важно для:
- Деструктивные операции (удаление, уменьшение масштаба, перезапуск)
- Производственная среда
- Изменения, чувствительные к безопасности

## <a name="your-first-infrastructure-diagnosis"></a>Ваша первая диагностика инфраструктуры

### Пример: Pod CrashLoopBackOff

```bash
# Step 1: FIRST RESPONSE - Give context
claude "I have a pod in CrashLoopBackOff in the payment-service namespace.
Environment: production
Cluster: gke-prod-us-east1
Started: 10 minutes ago
What are the first 3 things I should check?"

# Step 2: INVESTIGATE - Run suggested commands and share output
kubectl describe pod payment-api-7d4b8c6f5-x2j9k -n payment-service
# Copy output and paste to Claude

# Step 3: REMEDIATE - Claude proposes, you approve
claude "Based on this describe output, what's the fix?
CONSTRAINT: Show me the exact command but don't execute anything."

# Step 4: EVALUATE - Document the incident
claude "Create a brief incident note for our wiki:
- What happened
- Root cause
- Fix applied
- Prevention recommendation"
```

### Что возвращает Claude (первый пример ответа)

```markdown
## CrashLoopBackOff Triage (Priority Order)

1. **Check exit code and last logs**
   ```bash
   kubectl logs payment-api-7d4b8c6f5-x2j9k -n payment-service --previous
   ```
   Наиболее распространенные: OOM (выход 137), ошибки конфигурации (выход 1), сбои зависимостей.

2. **Проверьте события модуля и ограничения ресурсов**
   ```bash
   kubectl describe pod payment-api-7d4b8c6f5-x2j9k -n payment-service
   ```
   Ищите: OOMKilled, ImagePullBackOff, сбои проверки работоспособности.

3. **Проверьте последние изменения в развертывании**
   ```bash
   kubectl rollout history deployment/payment-api -n payment-service
   ```
   Если недавно: рассмотрите возможность отката во время расследования.
```

---

# Pattern: Infrastructure diagnosis

**Goal**: Systematic troubleshooting for common infrastructure issues.

## Kubernetes troubleshooting

### K8s MCP server setup

For persistent K8s context, install the K8s MCP server:

```json
// ~/.claude.json (or .mcp.json)
{
  "mcpServers": {
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "kubernetes-mcp-server@latest"]
    }
  }
}
```

**Преимущества**: Claude может напрямую запрашивать состояние кластера, сокращая циклы копирования и вставки.

**Без MCP**: вы будете вручную перенаправлять вывод kubectl в Claude (все еще эффективно).

### Подсказки по симптомам

Скопируйте и вставьте эти подсказки, заменив значения `<bracketed>`.

#### CrashLoopBackOff

```bash
kubectl describe pod <pod> -n <ns> | claude "Analyze this CrashLoopBackOff:
1. What's the exit code and what does it mean?
2. Check the last 5 restarts pattern (timing, consistent or escalating?)
3. Suggest 3 most likely root causes based on the events
4. Give me the exact commands to investigate each hypothesis"
```

**Общие причины, по которым Claude выявляет**:
- Выход 137: OOMKilled (достигнут предел памяти)
- Выход 1: ошибка приложения (плохая конфигурация, отсутствие зависимости)
- Выход 143: SIGTERM (тайм-аут плавного выключения)

#### ООМУбит

```bash
kubectl top pods -n <ns> && kubectl describe pod <pod> -n <ns> | claude "This pod was OOMKilled:
1. Compare requests vs limits vs actual usage
2. Is this a memory leak or under-provisioning?
3. If leak: what patterns in the container suggest investigation paths?
4. If under-provisioned: suggest optimal resource settings based on this data"
```

**Для устранения утечек памяти**:
```bash
claude "The pod has been restarting every 2 hours with OOMKilled.
Memory grows linearly from 200Mi to 512Mi limit before crash.
Language: Node.js 18
What are the top 3 things to check for memory leaks in this stack?"
```

#### ИзображениеPullBackOff

```bash
kubectl describe pod <pod> -n <ns> | claude "ImagePullBackOff diagnosis:
1. Is this an auth issue, network issue, or wrong image name?
2. What's the exact error message telling us?
3. Give me commands to verify the image exists and credentials work"
```

#### Ожидающий модуль (не запланирован)

```bash
kubectl describe pod <pod> -n <ns> && kubectl describe nodes | claude "Pod stuck in Pending:
1. Is this resource constraints, node selectors, or affinity rules?
2. Which nodes were considered and why rejected?
3. What's the quickest fix vs proper solution?"
```

#### Сервис недоступен

```bash
kubectl get svc,endpoints -n <ns> && kubectl describe svc <svc> -n <ns> | claude "Service not reachable:
1. Are there healthy endpoints?
2. Is the selector matching pods correctly?
3. Is it a network policy blocking traffic?
Give me diagnostic commands for each possibility"
```

### Практический пример: основная причина простоя производства

**Ситуация**: Платформа электронной коммерции, страница в 3 часа ночи, служба оформления заказа, возвращающая 503.

**FIRE в действии**:

```bash
# F - First Response
claude "INCIDENT: checkout-service returning 503s, started 10 min ago.
Impact: 100% of checkout attempts failing.
Environment: AWS EKS production, us-east-1.
Recent changes: deployment 2 hours ago (new feature flag logic).
What's the fastest diagnostic path?"

# I - Investigate (Claude suggested checking pods first)
kubectl get pods -n checkout -l app=checkout-service
# Output: 3/5 pods in CrashLoopBackOff

kubectl logs checkout-service-xxx --previous | tail -50 | claude "Analyze crash logs"
# Claude identifies: panic: nil pointer dereference in feature flag code

# R - Remediate
claude "Root cause identified: nil pointer in feature flag logic from recent deploy.
Options:
A) Rollback to previous version
B) Hotfix the nil check
Which is faster and safer at 3 AM?"
# Claude recommends: Rollback (faster, proven state, fix properly tomorrow)

kubectl rollout undo deployment/checkout-service -n checkout
# Service restored in 2 minutes

# E - Evaluate (next day)
claude "Create postmortem from this incident:
Timeline: 3:02 AM alert, 3:15 AM root cause found, 3:17 AM rollback, 3:19 AM resolved
Root cause: Feature flag nil pointer from commit abc123
Impact: 15 minutes checkout downtime
Format: Blameless, focused on prevention"
```

**Результат**: MTTR 15 минут, вскрытие ясно, определены меры по предотвращению.

## Анализ журналов и корреляция

### Мультисервисная корреляция журналов

```bash
# Collect logs from related services
kubectl logs -l app=api-gateway -n ingress --since=10m > gateway.log
kubectl logs -l app=auth-service -n auth --since=10m > auth.log
kubectl logs -l app=payment-service -n payment --since=10m > payment.log

# Analyze correlation
cat gateway.log auth.log payment.log | claude "Correlate these logs:
1. Find the request flow for failed transactions
2. Identify where the failure originates
3. Are there patterns in timing or specific endpoints?
4. Create a timeline of events"
```

### Обнаружение шаблонов журналов

```bash
# Find anomalies in error patterns
grep -E "ERROR|WARN|Exception" app.log | claude "Analyze error patterns:
1. Cluster similar errors (group by type, not timestamp)
2. What's the most frequent vs most severe?
3. Which errors are correlated (same root cause)?
4. Prioritize investigation order"
```

### Справка по запросу Prometheus/Grafana

```bash
claude "I need a PromQL query to:
- Show p99 latency for the payment-service
- Group by endpoint
- Alert if > 500ms for 5 minutes
Include the alert rule YAML too"
```

## Что Claude НЕ МОЖЕТ сделать (ограничения)

Понимание ограничений предотвращает разочарование и небезопасную зависимость.

| Ограничение | Влияние | Обходной путь |
|------------|--------|------------|
| **Нет состояния кластера в реальном времени** | Не могу увидеть текущий статус модуля | Используйте K8s MCP или вставьте вывод kubectl. |
| **Нет прямого доступа к API** | Не могу вызвать API AWS/GCP | Используйте серверы MCP или поделитесь выходными данными CLI. |
| **Ограничения контекстного окна** | ~100 тыс. токенов максимум | Сосредоточьтесь на соответствующих журналах, а не на полных дампах. |
| **Нет постоянной памяти** | Забывает между сеансами | Используйте CLAUDE.md для контекста проекта. |
| **Риск галлюцинаций** | Может предлагать недопустимые флаги | Всегда проверяйте команды перед запуском |
| **Нет показателей в реальном времени** | Не могу увидеть текущие графики | Скриншот Grafana или вставка значений метрик |
| **Без доступа к секретам** | Не могу прочитать vault/secrets | Хороший! Никогда не делитесь секретами с LLM. |

### Когда НЕ использовать Claude

- **Срочные решения менее чем за 30 секунд**: ваша мышечная память работает быстрее
- **Совершенно конфиденциальные инциденты**: Расследование утечки данных (юридические последствия)
- **Простые и очевидные исправления**: если вы знаете ответ, просто сделайте это.
- **Среды с ограниченным соответствием требованиям**: проверьте, разрешены ли инструменты искусственного интеллекта.
- **AI инциденты безопасности, специфичные для**: обнаружено быстрое внедрение, MCP скомпрометирован, агент крадет данные → см. [Усиление безопасности: ответ](../security/security-hardening.md#part-3-response-when-things-go-wrong) для получения информации о специальных процедурах (архитектура аварийного выключателя, уровни сдерживания, сроки инцидента).

### Когда Claude превосходит

- **Комплексный анализ первопричин**: Несколько взаимодействующих систем
- **Генерация документации**: вскрытие, runbook, процедуры
- **Изучение новых инструментов**: незнакомые облачные сервисы, новые функции k8s
- **Второе мнение**: Проверка вашей гипотезы
- **Массовые операции**: создание конфигураций для нескольких сред

---

# <a name="pattern-incident-response"></a>Шаблон: Реагирование на инциденты

**Goal**: Структурированные рабочие процессы для управления инцидентами.

## Рабочий процесс одиночного инцидента

**Реальность**: В 3 часа ночи ты один. Этот рабочий процесс рассчитан на одного человека.

### ОГОНЬ в действии: одиночный инцидент

#### F – Первый ответ (30 секунд)

```bash
claude "INCIDENT: [symptom - be specific]
Context: [service], [environment], [time started]
Recent changes: [deploys, infra changes, traffic spikes]
Current impact: [% users affected, revenue impact if known]
What are the 3 most critical things to check first?"
```

**Example**:
```bash
claude "INCIDENT: API returning 500 errors on /checkout endpoint
Context: checkout-service, production-us-east-1, started 5 min ago
Recent changes: deployed v2.3.4 at 2:45 AM, added new payment provider
Current impact: ~30% of checkout requests failing
What are the 3 most critical things to check first?"
```

#### Я – Расследование (2–5 минут)

Запустите предложенные Claude команды, поделитесь выводом:

```bash
# Claude suggested checking pod health first
kubectl get pods -n checkout | claude "Quick assessment of this pod list"

# Then checking recent logs
kubectl logs -l app=checkout --since=5m | head -100 | claude "Analyze for error patterns"

# Then checking the deployment diff
kubectl rollout history deployment/checkout-service -n checkout | claude "What changed in the last deployment?"
```

**Совет для профессионала**: оставьте один терминал для запуска команд, а другой — для общения Claude.

#### R – исправить (с одобрения)

```bash
claude "Based on investigation:
- Root cause: [your understanding]
- Evidence: [key findings]

Propose remediation options:
1. Quick mitigation (restore service)
2. Proper fix (address root cause)

CONSTRAINT: I need to approve before any action. Show exact commands."
```

**Пример ворот утверждения**:
```
Claude: "Recommended: Rollback to v2.3.3
Command: kubectl rollout undo deployment/checkout-service -n checkout
Risk: Low - previous version was stable for 2 weeks
Alternative: Scale down the new payment provider feature flag

Which approach do you want to take?"

You: "Proceed with rollback"
```

#### E – Оценка (после инцидента, а не во время)

```bash
claude "Create incident postmortem:

Timeline:
- 2:45 AM: Deployed v2.3.4
- 3:00 AM: First alerts fired
- 3:05 AM: Incident declared
- 3:12 AM: Root cause identified (nil pointer in new payment provider code)
- 3:15 AM: Rollback initiated
- 3:17 AM: Service restored

Format: Blameless, focus on systems not people
Include: Action items with owners"
```

## Коммуникация во время инцидентов

### Генератор обновлений заинтересованных сторон

```bash
claude "Generate incident update for stakeholders:

Incident: Checkout service degradation
Current status: Mitigated, monitoring
Impact: 15 minutes of 30% checkout failures
ETA to full resolution: 2 hours (proper fix in next deploy)

Audience: Non-technical executives
Tone: Professional, reassuring, factual
Length: 3 sentences max"
```

**Пример вывода**:
> У нас произошел 15-минутный сбой в работе нашей службы оформления заказа, затронувший примерно 30 % транзакций, который сейчас устранен. Проблема была вызвана программной ошибкой в ​​недавнем обновлении, и ее быстро откатили. Мы внедрим постоянное исправление во время следующего планового периода обслуживания без ожидаемого воздействия на клиентов.

### Подсказка о мосте инцидентов

Для каналов об инцидентах в реальном времени:

```bash
claude "I'm managing an incident bridge. Help me:
1. Maintain a running timeline of events
2. Suggest next investigation steps when we hit dead ends
3. Draft comms updates every 15 minutes
4. Flag when I should escalate

Current status: [paste latest update]
What should I communicate to the bridge now?"
```

## Многоагентный шаблон: анализ после инцидента

**Когда использовать мультиагент**: Не во время активных инцидентов. Используйте для последующего комплексного анализа.

```bash
# Agent 1: Timeline Reconstruction
claude "You are an incident timeline analyst.
From these logs and Slack messages, reconstruct a precise timeline:
[paste logs and comms]
Output: Timestamped events, who did what when"

# Agent 2: Root Cause Analysis
claude "You are a root cause analyst.
Given this timeline and system architecture, perform 5-whys analysis:
[paste timeline from Agent 1]
Output: Root cause chain, contributing factors"

# Agent 3: Prevention Recommendations
claude "You are an SRE process improvement specialist.
Given this root cause analysis:
[paste RCA from Agent 2]
Output: Prioritized prevention measures, effort estimates, ownership suggestions"
```

### Практический пример: сокращение MTTR с помощью OpsWorker.ai

**Context**: команда SRE, управляющая более чем 200 микросервисами, 5 дежурных инженеров.

**До Claude**:
- Среднее время восстановления: 45 минут.
- Вскрытие: часто откладывается или пропускается.
- Разрозненность знаний: каждый инженер знал разные услуги.

**Claude Интеграция**:
1. Система FIRE принята для всех инцидентов
2. Claude создает первоначальный черновой вариант в течение 1 часа.
3. Runbook дополнены средствами устранения неполадок с помощью Claude

**Через 3 месяца**:
- Среднее время восстановления: 18 минут (снижение на 60%).
- Посмертное завершение: 95% в течение 24 часов.
- Обмен знаниями: созданные Claude Runbook доступны всем

**Key Insight**: Самым большим достижением стала последовательность и документация, а не скорость.

---

# <a name="pattern-infrastructure-as-code"></a>Шаблон: инфраструктура как код

**Goal**: используйте Claude для рабочих процессов Terraform, Ansible и GitOps.

## Терраформировать с помощью Claude

### Справка: Терраформирование Антона Бабенко.

Самый полный навык Terraform для Claude Code:

**Репозиторий**: [antonbabenko/terraform-skill](https://github.com/antonbabenko/terraform-skill)
**Автор**: Антон Бабенко (создатель terraform-aws-модулей, 1 млрд+ загрузок)

```bash
# Install
cd ~/.claude/skills/
git clone https://github.com/antonbabenko/terraform-skill.git terraform
```

**Что он дает**:
- Рекомендации по структуре модулей
- AWS, GCP, шаблоны Azure
- Руководство по государственному управлению
- Шаблоны интеграции CI/CD

### Общие подсказки по терраформированию

#### Обзор плана

```bash
terraform plan -out=plan.txt && cat plan.txt | claude "Review this Terraform plan:
1. Any dangerous changes? (data loss, downtime)
2. Are the changes what we expect?
3. Any missing changes we should add?
4. Cost implications if visible"
```

#### Генерация модулей

```bash
claude "Generate a Terraform module for:
- AWS ECS Fargate service
- With ALB and target group
- Auto-scaling based on CPU
- Secrets from SSM Parameter Store

Follow these conventions:
- Use for_each over count
- All resources tagged with var.tags
- Output the service URL and ARN"
```

#### Государственный помощник хирурга

```bash
claude "I need to move a resource to a different state file:
Current state: terraform-prod/terraform.tfstate
Resource: aws_s3_bucket.logs
Target state: terraform-shared/terraform.tfstate

What's the safest procedure? Include rollback steps."
```

### Рабочий процесс обнаружения дрейфа

```bash
# Detect drift
terraform plan -detailed-exitcode 2>&1 | tee drift.txt

# Analyze with Claude
cat drift.txt | claude "Analyze this Terraform drift:
1. What changed outside of Terraform?
2. Is this drift expected (manual change) or concerning?
3. Should we import the changes or revert to Terraform state?
4. What's the safest remediation path?"
```

## Ansible с Claude

### Обзор игровой книги

```bash
cat playbook.yml | claude "Review this Ansible playbook:
1. Idempotency issues?
2. Security concerns?
3. Error handling gaps?
4. Performance optimizations?"
```

### Генерация ролей

```bash
claude "Generate an Ansible role for:
- Installing and configuring Nginx
- SSL certificates via Let's Encrypt (certbot)
- Hardened configuration (disable server tokens, etc.)
- Log rotation

Follow best practices:
- Use handlers for service restarts
- Variables in defaults/main.yml
- Include molecule tests structure"
```

## GitOps с Claude

### Обзор приложения ArgoCD

```bash
cat application.yaml | claude "Review this ArgoCD Application:
1. Sync policy appropriate for the environment?
2. Resource health checks defined?
3. Any sync wave ordering issues?
4. Namespace and project permissions correct?"
```

### Генерация ценностей Helm

```bash
claude "Generate Helm values for deploying [application] to:
- Environment: staging
- Resources: Limited (cost-conscious)
- Replicas: 2
- Ingress: Internal only
- Secrets: From external-secrets operator

Base chart: [chart name]
Include comments explaining each value"
```

## Автоматизация проверки безопасности

### Сканирование безопасности инфраструктуры

```bash
# Run tfsec or checkov, analyze results
tfsec . --format=json | claude "Analyze these security findings:
1. Prioritize by severity and exploitability
2. Which are false positives in our context?
3. For real issues: what's the fix?
4. Which can we ignore with a documented reason?"
```

### Обзор политики IAM

```bash
cat iam-policy.json | claude "Review this IAM policy:
1. Does it follow least privilege?
2. Any overly permissive actions? (*, admin, etc.)
3. Resource constraints appropriate?
4. Suggest a more restrictive version that still works"
```

---

# <a name="guardrails--adoption"></a>Ограждения и усыновление

**Цель**: безопасно внедрить Claude Code и заручиться поддержкой команды.

## Осведомленность о затратах

### Claude Code затраты

| Модель | Ввод (1 млн токенов) | Выход (1 млн токенов) |
|-------|-------------------|-------------------|
| Sonnet 5.5 | $2 | $10 |
| Opus 5.5 | $4 | $20 |

Стандартные тарифы API проверены 24 сентября 2026 г. Для счета за сеанс требуется отдельный счетчик ввода, вывода, кэша и повторов. [Официальные цены](https://platform.claude.com/docs/en/about-claude/pricing).

**Стратегии контроля затрат**:
1. Оцените Sonnet для рутинных задач; это выбор маршрутизации, а не учетная запись по умолчанию
2. Резервный Opus для комплексного мультисистемного анализа.
3. Используйте `/compact`, чтобы уменьшить контекст, когда разговор затягивается.
4. Избегайте вставки целых файлов журналов; сначала выполните grep соответствующие разделы

### Расходы на инфраструктуру из предложений Claude

**Beware**: Claude не видит ваш счет за облако. Всегда спрашивайте:

```bash
claude "Before I apply these changes, estimate:
1. Monthly cost impact (compute, storage, network)
2. Any resources that could scale unbounded?
3. Cost optimization alternatives?"
```

## Границы безопасности

### Никогда не делитесь с Claude

| Тип данных | Почему нет | Альтернатива |
|-----------|---------|-------------|
| API ключи, жетоны | Может быть cached/logged | Используйте заполнители: `<API_KEY>`. |
| Секреты производства | Риск безопасности | Описывайте тип секрета, а не значение |
| Личные данные клиента | Privacy/compliance | Используйте анонимные примеры |
| Собственные алгоритмы | IP-защита | Описывайте поведение, а не код |
| Подробности инцидента с личными данными | Юридическая ответственность | Продезинфицируйте перед публикацией |

### Шаблон безопасного запроса

```bash
claude "Debug this authentication issue:
- Service: auth-service
- Error: 401 Unauthorized for valid tokens
- Environment: staging (not production)
- Token format: JWT with claims [user_id, org_id, exp]
- NOTE: I've redacted all actual token values

Here's the sanitized log:
[paste log with secrets replaced]"
```

### Разрешительные ворота для производства

Всегда требуйте одобрения человека для:

```yaml
# Example: Production change checklist
approval_required:
  - kubectl delete
  - kubectl scale (down)
  - terraform destroy
  - DROP TABLE / DELETE FROM
  - rm -rf (outside tmp directories)
  - Any production database write
  - Any IAM policy change
  - Any security group modification
```

## Контрольный список развертывания команды

### Этап 1: Пилотный проект (1–2 инженера, 2 недели)

- [ ] Установите Claude Code для пилотных пользователей.
- [ ] Создайте команду CLAUDE.md с общим контекстом.
- [ ] Задокументируйте первые 5 успешных сценариев использования
- [ ] Определите один рабочий процесс для стандартизации
- [ ] Отслеживать сэкономленное время (before/after)

### Этап 2: Расширение (команда, 4 недели)

- [ ] Поделитесь пилотными знаниями на собрании команды
- [ ] Создайте библиотеку подсказок для конкретной команды.
- [ ] Установите правила безопасности (чем поделиться share/not)
- [ ] Настройте общий репозиторий skills/commands.
- [ ] Определите, когда использовать Claude, а когда нет.

### Этап 3: Оптимизация (текущий)

- [ ] Ежемесячный обзор оперативной библиотеки
- [ ] Тест A/B: тест с помощью Claude против традиционного для аналогичных инцидентов
- [ ] Внесите свой вклад в сообщество (потрясающие списки, это руководство).
- [ ] Отслеживайте MTTR, посмертное завершение, качество документации

### Ловушки усыновления, которых следует избегать

| ловушка | Почему это происходит | Профилактика |
|---------|---------------|------------|
| **Over-reliance** | Claude очень полезен | Укажите время обучения, а не только результат |
| **Слепое доверие** | Команды обычно работают | Всегда проверяйте перед запуском |
| **Сброс контекста** | Надеюсь, Claude во всем разберется. | Предоставляйте сфокусированный контекст, а не все |
| **Пропуск проверки** | Давление времени | Встройте проверку в рабочий процесс |
| **Использование теней** | Нет видимости команды | Делитесь победами, нормализуйте использование |

---

# <a name="quick-reference"></a>Шпаргалка

## Краткое описание структуры FIRE

```
┌─────────────────────────────────────────────────────────────┐
│ F - FIRST RESPONSE                                          │
│   "INCIDENT: [symptom]. Context: [service, env, time].      │
│    Recent changes: [what]. Impact: [who affected].          │
│    What are the 3 most critical things to check?"           │
├─────────────────────────────────────────────────────────────┤
│ I - INVESTIGATE                                             │
│   Run Claude's suggested commands                           │
│   Share output: "[output] | claude 'Analyze this'"          │
│   Iterate until root cause identified                       │
├─────────────────────────────────────────────────────────────┤
│ R - REMEDIATE                                               │
│   "Based on [findings], propose remediation.                │
│    CONSTRAINT: I need to approve before any action."        │
│   APPROVE → Execute │ REJECT → More investigation           │
├─────────────────────────────────────────────────────────────┤
│ E - EVALUATE                                                │
│   "Create postmortem: Timeline, root cause, prevention.     │
│    Format: Blameless, action items with owners."            │
└─────────────────────────────────────────────────────────────┘
```

## Подсказки по симптомам

### Kubernetes

| Симптом | Промпт |
|---------|--------|
| CrashLoopBackOff | `kubectl describe pod <pod> -n <ns> \| claude "Exit code meaning? 3 likely causes? Commands to investigate?"` |
| ООМУбит | `kubectl top pods && describe pod \| claude "Leak or under-provisioned? Optimal resources?"` |
| ИзображениеPullBackOff | `kubectl describe pod \| claude "Auth, network, or wrong image? Verification commands?"` |
| В ожидании | `kubectl describe pod && describe nodes \| claude "Resource, selector, or affinity issue?"` |
| Сервис недоступен | `kubectl get svc,endpoints \| claude "Healthy endpoints? Selector matching? Network policy?"` |

### Cloud/infrastructure

| Симптом | Промпт |
|---------|--------|
| Высокая задержка | `[metrics] \| claude "Bottleneck location? Is it compute, network, or dependency?"` |
| Диск заполнен | `df -h && du -sh /* \| claude "What's consuming space? Safe to delete?"` |
| В соединении отказано | `netstat -tlnp \| claude "Service listening? Port correct? Firewall rules?"` |
| Срок действия SSL-сертификата истек | `openssl s_client -connect host:443 \| claude "Days until expiry? Renewal steps?"` |
| проблемы с DNS | `dig +trace domain \| claude "Where does resolution fail?"` |

### Терраформировать

| Задача | Промпт |
|------|--------|
| Обзор плана | `terraform plan \| claude "Dangerous changes? Missing changes? Cost impact?"` |
| Анализ дрейфа | `terraform plan -detailed-exitcode \| claude "What drifted? Expected? Remediation?"` |
| Запрос модуля | `claude "Generate Terraform module for [resource] with [requirements]"` |

## Серверы MCP для DevOps

| Сервер | Цель | Установка |
|--------|---------|---------|
| Kubernetes | Прямой доступ к кластеру | `npx -y kubernetes-mcp-server@latest` |
| АВС | Доступ к AWS API | `uvx awslabs.aws-api-mcp-server@latest` (Питон) |
| GCP | Доступ к GCP API | `npx -y @google-cloud/gcloud-mcp` |
| Прометей | Прямые запросы метрик | Сообщество: поиск Awesome-MCP-серверов |
| Терраформировать | State/plan анализ | Сообщество: поиск Awesome-MCP-серверов |

Ни один из этих серверов не принадлежит Anthropic: сервер Kubernetes обслуживается организацией [containers](https://github.com/containers/kubernetes-mcp-server) (Red Hat), сервер AWS — [AWS Labs](https://github.com/awslabs/mcp), а сервер GCP — [Google](https://github.com/googleapis/gcloud-mcp).

**Расположение конфигурации**: `~/.claude.json` (поле `"mcpServers"`)

```json
{
  "mcpServers": {
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "kubernetes-mcp-server@latest"]
    }
  }
}
```

## <a name="external-resources"></a>Внешние ресурсы

### Потрясающие списки

- **[awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)** (23,8 тыс. звезд, подтверждено 27 июля 2026 г., было 8,1 тыс.): Персонажи агентов, включая SRE
- **[awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)** (14,4 тыс. звезд, подтверждено 27 июля 2026 г., было 4,6 тыс.): Навыки, включая инфра-связанные.

### Официальные ресурсы

- **[terraform-skill](https://github.com/antonbabenko/terraform-skill)**: навык терраформирования производственного уровня от Антона Бабенко.
- **[Claude Code Docs](https://code.claude.com/docs)**: Официальная документация

### Сообщество

- **Anthropic Discord**: канал #claude-code
- **Reddit**: r/ClaudeAI
- **GitHub**: открытые проблемы в списках Awesome для запросов функций.

---

## <a name="see-also"></a>См. также

- **[Agent Template](../../examples/agents/devops-sre.md)**: Персона агента DevOps/SRE для Claude
- **[CLAUDE.md Template](../../examples/claude-md/devops-sre.md)**: конфигурация проекта для команд DevOps.
- **[Руководство по усилению безопасности](../security/security-hardening.md)**: Дополнительные меры безопасности
- **[Руководство по архитектуре](../core/architecture.md)**: Как Claude Code работает внутри

---

*Вклад приветствуется! Если у вас есть подсказки DevOps, которые хорошо работают, рассмотрите возможность добавления их в списки удивительных или отправки PR для этого руководства.*
