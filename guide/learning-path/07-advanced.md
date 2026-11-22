---
title: "Модуль 07: Расширенные шаблоны"
description: "Модуль 07: организация многоагентных рабочих процессов Claude Code, устранение ошибок и применение шаблонов автоматизации производственного уровня для рабочих процессов группы. 2-3 часа, продвинутый."
---

# Модуль 07: Расширенные шаблоны

**Время**: 2-3 часа | **Complexity**: ⭐⭐⭐ Продвинутый

## Цель

Организуйте рабочие процессы с участием нескольких агентов. Создайте сложную систему автоматизации, координирующую работу нескольких специализированных агентов.

---

## Что вы узнаете

- Шаблоны многоагентной архитектуры
- Стратегии оркестровки
- Обработка ошибок и восстановление
- Автоматизация производственного уровня
- Рабочие процессы команды
- Реальные сценарии

---

## Мультиагентные системы

A **многоагентная система** это когда несколько специализированных агентов работают вместе над одной целью.

Прежде чем выбирать шаблон команды, разделите уровни: модель создает токены, среда выполнения владеет циклом модели и инструмента сеанса, система репозитория предоставляет инструкции и проверки, а оркестратор координирует сеансы. [Agent Harness Engineering](../core/agent-harness.md) объясняет эту модель; [Agent Harness Map](../ecosystem/agent-harness-landscape.md) сравнивает среды выполнения, владеющие циклами, и сохраняет более широкий каталог отдельно. Используйте [Agent Tools: помимо Claude Code](../ecosystem/agentic-tools.md) для платформ и плоскостей управления, [glossary](../core/glossary.md) для терминов, [Agent Evaluation](../roles/agent-evaluation.md) для оценки результата, [Session Observability](../ops/observability.md) для проверки выполнения и [Усиление безопасности](../security/security-hardening.md) перед запуском работы в автоматическом режиме.

### Пример: рабочий процесс выпуска кода

Вместо одного Claude, обрабатывающего все:

```
You: "Release version 3.5.0"
    ↓
    ├─→ [Version Agent] Updates VERSION file
    │
    ├─→ [Changelog Agent] Creates release notes
    │
    ├─→ [Test Agent] Runs full test suite
    │
    ├─→ [Security Agent] Security audit
    │
    ├─→ [Docs Agent] Updates documentation
    │
    └─→ [Release Agent] Tags, builds, publishes

Result: Complete, tested, documented release
```

Каждый агент быстро справляется со своей специализированной задачей.

---

## Шаблоны оркестровки

### Шаблон 1: последовательный (конвейер)

Агенты бегут друг за другом. Выход агента N становится входом для агента N+1.

```
Input
  ↓
[Agent 1: Parse Requirements] → Output: structured requirements
  ↓
[Agent 2: Design Schema] → Output: database schema
  ↓
[Agent 3: Generate Code] → Output: code skeleton
  ↓
[Agent 4: Write Tests] → Output: test suite
  ↓
Final Result
```

**Когда использовать**: Рабочие процессы, в которых каждый шаг зависит от предыдущего.

**Example**:
```bash
/agent requirements-parser
Parse the feature request into specifications

# Later, once we have specifications:
/agent database-designer
Design the schema based on these specs

# Once schema is approved:
/agent code-generator
Generate models based on the schema
```

### Схема 2: Параллельное (вилочное соединение)

Несколько агентов работают одновременно, результаты суммируются.

```
         Input
           ↓
    ┌──────┼──────┐
    ↓      ↓      ↓
 [Unit   [Int.  [Sec.
  Tests] Tests] Audit]
    ↓      ↓      ↓
    └──────┼──────┘
           ↓
      Combine Results
           ↓
      Final Report
```

**Когда использовать**: Независимые проверки или задачи.

**Example**:
```
Request: "Review my code changes"

Parallel tasks:
- Code quality agent reviews
- Security agent scans
- Test coverage agent checks
- Performance agent analyzes

(All run at the same time)

Results combined into one report
```

### Шаблон 3: Условный (если-то)

Маршрут к разным агентам в зависимости от условий.

```
Input: "Fix the bug"
  ↓
[Analyzer: Is it security?]
  ├─ YES → [Security Agent]
  ├─ PERFORMANCE → [Performance Agent]
  └─ LOGIC → [Logic Agent]
  ↓
Result
```

**Example**:
```bash
/agent bug-classifier
Categorize this bug: security, performance, or logic

# Based on response:
# If security:
/agent security-patcher
Fix the security vulnerability

# If performance:
/agent perf-optimizer
Optimize this code
```

---

## Построение рабочего процесса выпуска

### Сценарий

Вы хотите автоматизировать процесс выпуска. Прямо сейчас вы:
1. Обновить файл VERSION
2. Обновить ИЗМЕНЕНИЯ
3. Запуск тестов
4. Запустить сканирование безопасности
5. Создать тег git
6. Отправить в исходное положение
7. Развертывание в промежуточной версии

### Решение: многоагентный рабочий процесс

**Шаг 1. Создайте агентов** (каждый специализируется на одной задаче)

`.claude/agents/version-manager.md`:
```markdown
---
name: version-manager
description: Manages version files and tags
capabilities:
  - read_files
  - write_files
  - NO: push
---

# Version Manager

## Purpose
Update VERSION files and create git tags

## Tasks
- Bump version (patch, minor, major)
- Update VERSION file
- Update version in package.json, pyproject.toml, etc
- Create annotated git tags
```

`.claude/agents/changelog-generator.md`:
```markdown
---
name: changelog-generator
description: Generates release notes
---

# Changelog Generator

## Purpose
Create readable release notes from commits

## Output Format
- Version header
- Breaking changes (if any)
- New features
- Bug fixes
- Deprecations
```

`.claude/agents/test-validator.md`:
```markdown
---
name: test-validator
description: Runs full test suite
---

# Test Validator

## Purpose
Execute all tests and verify coverage

## Minimum Requirements
- All tests pass
- Coverage >80%
- No flaky tests
```

`.claude/agents/release-publisher.md`:
```markdown
---
name: release-publisher
description: Publishes and deploys
---

# Release Publisher

## Purpose
Tag and push to origin

## Steps
1. Create git tag
2. Push to origin
3. Trigger CI/CD pipeline
4. Monitor deployment
```

**Шаг 2. Создайте команду рабочего процесса выпуска**

`.claude/commands/release-workflow.md`:
```markdown
# /release-workflow

Orchestrate a complete release process.

Usage:
```
/release-workflow патч|второстепенный|большой
```

## Process

1. Validate release readiness
2. Update version (version-manager agent)
3. Generate changelog (changelog-generator agent)
4. Run tests (test-validator agent)
5. Security scan (security-auditor agent)
6. Publish and deploy (release-publisher agent)

## Requirements
- All tests passing
- No outstanding security issues
- Changelog updated
```

**Шаг 3. Используйте рабочий процесс**

```bash
/release-workflow patch
```

Claude тогда:
1. Вызывает менеджер версий → обновляет ВЕРСИЯ
2. Вызывает генератор журнала изменений → создает примечания к выпуску
3. Вызывает тест-валидатор → проверяет прохождение тестов
4. Вызывает охранного-аудитора → сканирует на уязвимости
5. Вызывает релиз-издателя → создает тег, отправляет
6. Вы просматриваете, а затем утверждаете каждый шаг

---

## Обработка ошибок в многоагентных системах

### Выкройка: изящная деградация

Если один агент терпит неудачу, другие продолжают:

```
[Test Agent] ❌ FAILED: 3 test failures
  ↓
[Security Agent] ✅ PASSED: No vulnerabilities
  ↓
[Docs Agent] ✅ PASSED: Docs updated
  ↓
[Aggregate Results]
  ⚠️  Release blocked (tests failed)
  ✅ Security passed
  ✅ Docs ready
  [Instructions to fix tests first]
```

### Шаблон: Повторить попытку в случае неудачи

Для временных сбоев (сеть, тайм-ауты):

```bash
#!/bin/bash
# In a hook or skill

max_retries=3
retry=0

while [ $retry -lt $max_retries ]; do
  if /agent test-validator run-tests; then
    echo "✅ Tests passed"
    exit 0
  fi
  
  retry=$((retry + 1))
  if [ $retry -lt $max_retries ]; then
    echo "⚠️  Retry $retry/$max_retries"
    sleep 5
  fi
done

echo "❌ Tests failed after $max_retries attempts"
exit 1
```

### Шаблон: Откат при ошибке

Если что-то пойдет не так, отмените изменения:

```bash
#!/bin/bash
# Rollback helper

ORIGINAL_VERSION=$(git rev-parse HEAD:VERSION)
ORIGINAL_TAG=$(git describe --tags --abbrev=0)

cleanup_and_exit() {
  echo "Rolling back..."
  git reset --hard HEAD~1
  git tag -d "$NEW_TAG"
  echo "VERSION restored to: $ORIGINAL_VERSION"
  exit 1
}

# Run release steps
if ! /agent version-manager bump-version patch; then
  cleanup_and_exit
fi

if ! /agent test-validator validate-all; then
  cleanup_and_exit
fi

# If we get here, release succeeded
exit 0
```

---

## Модели производства

### Схема 1. Поэтапное внедрение

Постепенно выпускайте в разные среды:

```
/release major
  ↓
[Dev] Deploy and test
  ✅ Verified
  ↓
[Staging] Deploy and test
  ✅ Verified
  ↓
[Prod] Deploy with monitoring
  ✅ Monitoring green
  ↓
Release Complete
```

### Схема 2: Ворота одобрения

Блокировать продвижение до проверки:

```bash
# In .claude/hooks/pre-prod-deploy.sh

echo "🚨 PRODUCTION DEPLOY"
echo "Changes: $CHANGES"
echo "Tests: PASSING"
echo "Security: PASSING"
echo ""
read -p "Type 'I approve' to deploy to production: " approval

if [ "$approval" != "I approve" ]; then
  echo "❌ Deploy cancelled"
  exit 1
fi

exit 0
```

### Схема 3: Мониторинг и откат

После развертывания проверьте работоспособность:

```bash
#!/bin/bash
# Post-deploy hook

sleep 10  # Let services start

# Health checks
if ! curl -f https://api.example.com/health; then
  echo "❌ Health check failed"
  echo "Rolling back..."
  git revert -n HEAD
  git commit -m "Rollback: deployment health check failed"
  exit 1
fi

echo "✅ Deployment successful and healthy"
exit 0
```

---

## <a name="exercise-build-your-first-multi-agent-workflow"></a>Упражнение: Создайте свой первый многоагентный рабочий процесс

### Сценарий

У вас есть проект по науке о данных. Контрольный список релиза:
1. Обновить версию модели
2. Запустите проверочные тесты
3. Создать отчет об эффективности
4. Обновить документацию
5. Создать тег выпуска

### Шаг 1. Создайте агентов

Создайте `.claude/agents/` с помощью:
- `model-versioner.md` — Обновления ВЕРСИИ, метаданные модели.
- `validator.md` — запускает проверочные тесты.
- `report-generator.md` — создает показатели производительности.
- `doc-updater.md` - Обновления документации README, API
- `release-tagger.md` — создает тег git.

### Шаг 2. Создайте команду оркестрации.

`.claude/commands/ml-release.md`:
```markdown
# /ml-release

Release a new model version.

Usage:
```
/ml-release [основной|второстепенный|патч]
```

## Workflow
1. Version agent bumps version
2. Validator runs test suite
3. Report agent generates metrics
4. Doc agent updates documentation
5. Tagger creates release tag
```

### Шаг 3: Проверьте это

```bash
/ml-release patch
```

Смотрите, как агенты координируют выпуск полной версии.

---

## Лучшие практики для продвинутых систем

### ДЕЛАТЬ

✅ Спроектируйте агенты так, чтобы они были **composable** (выходные данные помещаются в следующий агент)

✅ **Записывать все** (помогает отлаживать сбои)

✅ Тестируйте рабочие процессы на **сначала вносите небольшие изменения**

✅ **Задокументируйте процесс оркестрации** (чтобы другие поняли)

✅ Встроить **ворота одобрения** для рискованных операций

✅ **Монитор после автоматизации** (проверьте успех)

### НЕ

❌ Связывайте слишком много агентов (>7 становится трудно отладить)

❌ Сделать агентов **взаимозависимыми** (предпочитать слабую связь)

❌ Пропустить **обработка ошибок** (все потерпит неудачу)

❌ Развертывание автоматизированных выпусков **без предварительного тестирования рабочего процесса**.

❌ Предполагается, что агенты **всегда соглашаются** (разрешение конфликтов)

---

## Проверка: вы готовы, если...

✓ Вы можете объяснить шаблоны многоагентной оркестровки.

✓ Вы создали как минимум 2-3 сотрудничающих агента.

✓ Вы понимаете стратегии обработки ошибок

✓ Вы знаете, как создавать рабочие процессы с возможностью утверждения.

✓ Вы можете создать автоматизацию выпуска для своего проекта.

---

## Что дальше?

Вы прошли курс обучения из 7 модулей! Теперь вы понимаете:

- ✅ Установка и настройка.
- ✅ Основной цикл и контекст
- ✅ Память и конфигурация
- ✅ Специализация агента
- ✅Навыки и знания
- ✅ Хуки и автоматизация
- ✅ Расширенная оркестровка

### Следующие шаги

**Вариант A: глубокое погружение в домен**
- Углубимся в безопасность: `guide/security/`
- Углубимся в DevOps: `guide/ops/`
- Углубимся в архитектуру: `guide/core/architecture.md`

**Вариант Б: построить что-нибудь**
- Создайте мультиагентный рабочий процесс для своего проекта
- Выполните одно из упражнений этого пути.
- Создайте пакет плагинов и поделитесь им с командой

**Вариант C: учитесь на примерах**
- Обзор производственных агентов в `examples/agents/`
- Изучите пакеты плагинов в `examples/plugins/`
- Изучите навыки в `guide/core/skill-design-patterns.md`

**Вариант D: Самооценка**
- Возьмите `/self-assessment comprehensive`, чтобы найти пробелы.
- Получите персональные рекомендации
- Создайте план обучения для слабых мест

---

**Завершен модуль 07?** → Вы опытный пользователь Claude Code.

Изучите полное руководство на `guide/ultimate-guide.md`, чтобы узнать больше, или поделитесь с другими тем, что вы узнали.
