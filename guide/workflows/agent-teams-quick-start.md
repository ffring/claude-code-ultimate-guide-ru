---
title: "Краткое руководство по работе с командами агентов"
description: "Практическое 5-минутное руководство по настройке с шаблонами копирования и вставки для команд агентов"
tags: [workflow, agents, tutorial]
---

# Краткое руководство для групп агентов

> **Практическое руководство по использованию команд агентов в ваших проектах**
> **Время чтения**: 8-10 мин | **Полная документация**: [Команды агентов](./agent-teams.md) (30-минутный обзор)

## Что это?

Вы знаете, что существуют команды агентов. Вы прочитали теорию. Но **когда вам действительно следует использовать их в своих проектах?**

Это руководство дает вам:
- ✅ **5-минутная настройка** (среда → первый тест)
- ✅ **4 копировать-вставить шаблоны** для реальных проектов (Руководство + RTK)
- ✅ **Матрица решений** (когда ДА, когда НЕТ)
- ✅ **Metrics** для измерения рентабельности инвестиций
- ✅ **Красные флажки**, чтобы избежать отходов

**Пропустить, если**: Хотите теорию → Читать [Полная документация по командам агентов](./agent-teams.md) instead.

---

## Оглавление

1. [5-минутная установка](#1-5-minute-setup)
2. [Шаблоны для ваших проектов](#2-patterns-for-your-projects)
   - 2.1 Руководство по [Claude Code — обзор предварительного выпуска](#21-claude-code-guide---pre-release-review)
   - 2.2 Руководство по [Claude Code — синхронизация приземления](#22-claude-code-guide---landing-sync)
   - 2.3 Руководство по [Claude Code — обновление многофайлового документа](#23-claude-code-guide---multi-file-doc-update)
   - 2.4 [RTK – PR-обзор безопасности](#24-rtk---security-pr-review)
3. [Матрица решений: когда использовать](#3-decision-matrix-when-to-use)
4. [Минимальный шаблон рабочего процесса](#4-minimal-workflow-template)
5. [Показатели успеха](#5-success-metrics)
6. [Ограничения и тревожные сигналы](#6-limitations--red-flags)

---

## <a name="1-5-minute-setup"></a>1. 5-минутная настройка

### Шаг 1. Проверка предварительных требований

```bash
# Check Claude Code version (v2.1.32+ required)
claude --version

# Check model availability
claude
> /model opus
# Check the resolved model in /model; provider aliases can differ
```

**Минимальные требования**:
- Claude Code v2.1.32+
- Модель, доступная в вашем аккаунте; Opus не является обязательным, и товарищи по команде могут использовать разные модели.
- Репозиторий Git (команды агентов используют git для координации)

### Шаг 2. Включите функцию

```bash
# Set environment variable (add to ~/.bashrc or ~/.zshrc for persistence)
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Launch Claude Code
claude
```

### Шаг 3: Проверка

```
> Are agent teams enabled?
```

**Ожидаемый ответ**:
```
Yes, agent teams are enabled in this session. I can create teams
of agents to work in parallel on complex tasks using:
- Multi-agent coordination
- Git-based task claiming
- Autonomous team coordination
```

**Если отключено**: проверьте, установлена ​​ли переменная среды (`echo $CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`).

### Шаг 4: Первый тест (2 агента)

```
> Create a simple test team to analyze this README:
> - Agent 1: Check structure (sections, TOC, badges)
> - Agent 2: Check content quality (clarity, examples, completeness)
```

**Что происходит**:
1. Claude порождает 2 агентов (вы увидите сообщение «Создание команды...»)
2. Агенты работают параллельно (вы можете видеть сообщения "Idle" - это нормально)
3. Claude представляет консолидированные результаты (конвергенция + уникальные идеи)

**Navigation**:
- `Shift+Down`: Циклическое переключение результатов товарища по команде (режим в процессе)
- Основной вид: Консолидированный синтез

**Duration**: 1–2 минуты для простой задачи с двумя агентами.

---

## <a name="2-patterns-for-your-projects"></a>2. Шаблоны для ваших проектов

### <a name="21-claude-code-guide---pre-release-review"></a>2.1 Руководство по Claude Code — предварительный обзор

**Случай использования**: систематический аудит перед обновлением версии для выявления проблем согласованности (неработающие ссылки, счетчики рассинхронизации, неправильные версии).

**Trigger**: перед каждым выполнением команды `/release`.

**Продолжительность**: 3–5 мин.

**Состав команды**:
```
Team: pre-release-audit (3 agents)
├─ accuracy-auditor → Verify claims, stats, versions, external links
├─ consistency-checker → Check template count, eval count, guide lines match across files
└─ breaking-checker → Identify breaking changes vs last release
```

**Скопировать-вставить**:
```
> Create a pre-release audit team:
> - Accuracy: Check all claims, stats, version numbers, external links in CHANGELOG.md, README.md, and guide/ultimate-guide.md
> - Consistency: Verify template count (count examples/ files), eval count (count docs/resource-evaluations/ files), guide lines (wc -l guide/ultimate-guide.md) match across README.md, guide/cheatsheet.md, machine-readable/reference.yaml
> - Breaking: Identify breaking changes vs v3.23.0 by analyzing CHANGELOG.md [Unreleased] section
```

**ROI**: обнаруживает такие ошибки, как:
- Повреждение URL-адреса LinkedIn (выявлено сегодня в ходе реального аудита)
- Рассинхронизация между guide/landing (количество шаблонов)
- Неправильные номера версий в нескольких файлах
- Неработающие внешние ссылки

**Когда пропускать**: простые исправления опечаток (без изменений version/count/link).

**Реальный пример** (тест от 08.02.2026):
```
Findings:
- Accuracy: 1 critical (LinkedIn URL malformed), 3 warnings (external links to verify)
- Consistency: 2 criticals (template count mismatch README vs landing, line numbers outdated in reference.yaml)
- Breaking: 0 breaking changes detected vs v3.23.0 (clean release)

Convergence: 2 agents flagged template count issue (high confidence)
Time: 4 min 12 sec
Verdict: ✅ High value, found 3 criticals that would've shipped
```

---

### <a name="22-claude-code-guide---landing-sync"></a>2.2 Руководство по Claude Code – синхронизация приземления

**Случай использования**: проверьте синхронизацию guide/landing (версия, количество, содержимое) без запуска сценария вручную.

**Trigger**: После значительных изменений руководства (увеличение версии, добавление шаблонов, изменение часто задаваемых вопросов)

**Продолжительность**: 2–3 мин.

**Состав команды**:
```
Team: landing-sync (2 agents)
├─ guide-scanner → Extract version, template count, eval count, guide lines, FAQ content
└─ landing-scanner → Compare with index.html, examples.html, check sync status
```

**Скопировать-вставить**:
```
> Validate guide/landing synchronization:
> - Guide scanner: Extract version from VERSION file, template count (find examples/ -type f | wc -l), eval count (find docs/resource-evaluations/ -name "*.md" | wc -l), guide lines (wc -l guide/ultimate-guide.md), FAQ entries from README.md
> - Landing scanner: Check ../claude-code-ultimate-guide-landing/index.html and examples.html for version in footer+FAQ, template count in badges, eval count, guide lines approximation (~9800+)
>
> Report: Synced ✅ / Mismatches with line numbers
```

**ROI**:
- Нулевая рассинхронизация отправлена ​​в производство
- Избегает ручного выполнения `./scripts/check-landing-sync.sh`
- Быстрее, чем скрипт (2 минуты против 5 минут на запуск скрипта + исправление)

**Когда пропускать**: Изменения чистого кода (docs/counts не затрагивается).

**Критерии успеха**:
```
✅ All synced: Version, template count, eval count match
⚠️ Mismatch: Specific line numbers in index.html to fix
```

---

### <a name="23-claude-code-guide---multi-file-doc-update"></a>2.3 Руководство по Claude Code — обновление многофайлового документа

**Сценарий использования**: добавление новой документации по функциям в несколько файлов (ultimate-guide.md, reference.yaml, README.md) с согласованностью перекрестных ссылок.

**Trigger**: раздел новых функций (>50 строк), критические изменения, обновления архитектуры.

**Продолжительность**: 5–8 мин.

**Состав команды**:
```
Team: doc-update (3 agents)
├─ content-writer → Write main section in ultimate-guide.md with examples
├─ index-updater → Update TOC, reference.yaml entries, README navigation
└─ consistency-checker → Verify cross-references, line numbers, anchors work
```

**Скопировать-вставить**:
```
> Update documentation for new "[FEATURE NAME]" feature:
> - Content Scope: Write section [X.Y] in guide/ultimate-guide.md with:
>   - Overview (what/why/when)
>   - 2-3 concrete examples
>   - Best practices + gotchas
>   - Links to related sections
>   Context: guide/ultimate-guide.md section [X.Y] only
> - Index Scope: Update:
>   - guide/ultimate-guide.md TOC (add section [X.Y])
>   - machine-readable/reference.yaml (add entry with line numbers)
>   - README.md navigation (add link if major feature)
>   Context: Index files only (TOC, reference.yaml, README.md)
> - Consistency Scope: Verify:
>   - All cross-references resolve correctly
>   - Line numbers in reference.yaml match actual content
>   - Anchors in README point to correct sections
>   - No broken internal links
>   Context: All modified files for cross-reference validation
```

**ROI**:
- Ноль неработающих ссылок (проверка целостности фиксирует все)
- На 60 % быстрее, чем последовательный (запись → индексирование → проверка)
- Параллельная работа сокращает время ожидания

**Когда пропускать**: Редактирование отдельных файлов (<50 строк), перекрестные ссылки не требуются.

**Реальный пример** (дополнение раздела «Команды агентов»):
```
Task: Add "Agent Teams" as section 9.20 (300 lines)
Files touched: 3 (ultimate-guide.md, reference.yaml, README.md)

Sequential estimate: 12-15 min (write → index → verify)
Agent Teams: 7 min 30 sec (3 agents parallel)
Savings: 40% time + zero manual cross-ref checks
```

---

### <a name="24-rtk---security-pr-review"></a>2.4 РТК – PR-обзор безопасности

**Сценарий использования**: просмотрите PR внешнего участника на предмет проблем безопасности (внедрение, утечка токенов), идиом Rust и производительности.

**Trigger**: PR открыт неосновным участником, PR затрагивает конфиденциальный код (аутентификация, внешние команды, регулярное выражение)

**Продолжительность**: 5–8 мин.

**Состав команды**:
```
Team: security-pr-review (3 agents)
├─ rust-expert → Check ownership patterns, error handling (anyhow/thiserror), idiomatic code
├─ security-auditor → Scan for injection risks, token leaks, input sanitization
└─ perf-analyzer → Review allocations, async patterns, compiled regex
```

**Скопировать-вставить**:
```
> Review PR #[NUMBER] with scope-focused analysis:
> - Rust Scope: Check:
>   - Ownership patterns (prefer &str over String, minimize clones)
>   - Error handling (anyhow::Result with .context(), no unwrap outside tests)
>   - Idiomatic code (impl after type, #[cfg(test)] mod tests)
>   - Clippy compliance (zero warnings)
>   Context: All modified .rs files
> - Security Scope: Scan for:
>   - Command injection (shell escapes, argument sanitization)
>   - Token/credential leaks (hardcoded secrets, logs, error messages)
>   - Input sanitization (path traversal, regex DoS)
>   - File operations (path validation, permissions)
>   Context: Input handling, auth, file I/O code
> - Performance Scope: Review:
>   - Unnecessary allocations (String::from vs &str)
>   - Async patterns (spawn_blocking for CPU-bound work)
>   - Compiled regex (lazy_static! for hot paths)
>   - Algorithm complexity (O(n) vs O(n²))
>   Context: Hot paths, loops, async functions
```

**ROI**:
- Обнаружение «слепых зон»: Безопасность + Rust + Производительность = области, которые одиночный рецензент мог бы пропустить.
- Постоянное качество рецензий (не зависит от рецензента mood/focus)
- Быстрее, чем последовательный (параллельная проверка 3 агентов против трехпроходной проверки)

**Когда пропустить**: Внутренние запросы от доверенных участников, тривиальные изменения (только документы, комментарии, тесты).

**Критерии успеха**:
```
✅ Convergence: 2+ agents flag same critical issue (high confidence)
✅ Unique insights: Each agent finds domain-specific issues (Rust/Security/Perf)
❌ False positives: <20% of findings are invalid
```

**Реальный пример** (гипотетический внешний PR):
```
PR: Add new git filter command
Agents findings:
- Rust: 3 issues (unwrap in production code, missing .context(), non-idiomatic error handling)
- Security: 2 criticals (shell injection via user input, token leak in error message)
- Perf: 1 issue (regex compiled on every call, not lazy_static)

Convergence: Security + Rust both flagged missing input sanitization (high confidence)
Time: 6 min 40 sec
Verdict: ✅ Critical security issues caught, PR requires revision
```

---

## <a name="3-decision-matrix-when-to-use"></a>3. Матрица решений: когда использовать

| Ситуация | Агентские команды? | Разум |
|-----------|---------------|--------|
| **Предварительный обзор (Руководство)** | ✅ ДА | Многоуровневый аудит (точность + последовательность + нарушение) требует параллельных точек зрения. |
| **Простое исправление опечатки** | ❌ НЕТ | Избыточное убийство, 1 агент = 10 секунд, 3 агента = раздувание затрат |
| **Внешний PR (RTK)** | ✅ ДА | Безопасность + Rust + Производительность = обнаружение слепых зон, проверка с высокими ставками |
| **Обновление многофайлового документа (Руководство)** | ✅ ДА | Контент + Индекс + Согласованность = отсутствие битых ссылок, параллельная работа |
| **Проверка синхронизации приземления** | ⚠️МОЖЕТ | Используйте команды агентов, если есть подозрение на рассинхронизацию, иначе `./scripts/check-landing-sync.sh` быстрее. |
| Обновление **CHANGELOG** | ❌ НЕТ | Последовательная задача (линейное письмо), без преимуществ распараллеливания |
| **Редактирование одного файла (RTK)** | ❌ НЕТ | Координация не требуется, последовательная ОК |
| **Небольшая настройка README (<50 строк)** | ❌ НЕТ | Никаких перекрестных ссылок, никаких сложностей, один агент быстрее |
| **Архитектурный проект** | ✅ ДА | Множественные перспективы (интерфейс, серверная часть, инфраструктура, безопасность) выявляют «слепые зоны» |
| **Расследование ошибок** | ⚠️МОЖЕТ | Простые ошибки → НЕТ, сложные многокомпонентные сбои → ДА |

### Эмпирическое правило

**Используйте команды агентов, когда**:
- ✅ Вы, естественно, думаете: «Мне следует проверить X, Y и Z».
- ✅ Высокие ставки (производственный выпуск, внешний участник, безопасность)
- ✅ Требуется многоуровневый анализ (область Rust + область безопасности + область производительности)
- ✅ Межфайловая согласованность имеет значение (ссылки, количество, синхронизация версий)
- ✅ Возможна параллельная работа (независимые задачи, нет последовательной зависимости)

**Не используйте команды агентов, когда**:
- ❌ Простая задача (<5 файлов, <100 строк, 1 домен)
- ❌ Последовательный рабочий процесс (шаг Б зависит от результата шага А)
- ❌ Ограниченный бюджет (3 токена, резерв для важных задач)
- ❌ Высокая интенсивность записи (много изменений в одних и тех же файлах = конфликты слияния)

### Официальные размеры и ограничения (проверено 1 ноября 2026 г.)

В документации [Agent Teams](https://code.claude.com/docs/en/agent-teams) рекомендуется начинать с **3 до 5 товарищей по команде** и **5 до 6 задач на каждого товарища по команде**. Два ограничения меняют способ планирования сеанса:

- `/resume` и `/rewind` не восстанавливают товарищей по команде в процессе; после возобновления лидерства порождайте замены.
- По умолчанию товарищи по команде не изолированы в рабочих деревьях; назначьте непересекающиеся файлы или дайте каждому свое собственное рабочее дерево.

Прежде чем вообще создавать команду, прочитайте [Один агент, субагенты или команда: доказательства за октябрь 2026 г.](../ultimate-guide.md#single-agent-subagents-or-a-team-the-october-2026-evidence): для ограниченных задач один цикл агента с навыками, часто совпадающими или превосходящими многоагентные схемы.

---

## <a name="4-minimal-workflow-template"></a>4. Минимальный шаблон рабочего процесса

### Шаблон Bash (многоразовый)

```bash
# 1. Setup (once per session)
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# 2. Launch Claude
claude

# 3. Create team (prompt template)
> Create a team to [TASK]:
> - Agent 1 ([SCOPE/CONTEXT]): [SPECIFIC MISSION]
> - Agent 2 ([SCOPE/CONTEXT]): [SPECIFIC MISSION]
> - Agent 3 ([SCOPE/CONTEXT]): [SPECIFIC MISSION]
>
> [FILES/DIRECTORIES TO ANALYZE]

# 4. Observe (optional)
# Shift+Down to cycle through teammate outputs (in-process mode)

# 5. Synthesis
# Claude presents consolidated findings automatically

# 6. Act
# Fix critical findings, skip minor ones
```

### Примеры подсказок (готовы для копирования и вставки)

#### Аудит руководства перед выпуском

```
> Create a pre-release audit team:
> - Accuracy: Check all claims, stats, version numbers, external links in CHANGELOG.md, README.md, and guide/ultimate-guide.md
> - Consistency: Verify template count (count examples/ files), eval count (count docs/resource-evaluations/ files), guide lines (wc -l guide/ultimate-guide.md) match across README.md, guide/cheatsheet.md, machine-readable/reference.yaml
> - Breaking: Identify breaking changes vs v3.23.0 by analyzing CHANGELOG.md [Unreleased] section
```

#### PR-обзор безопасности (RTK)

```
> Review PR #42 with scope-focused analysis:
> - Rust Scope: Check ownership patterns, error handling (anyhow/thiserror), idiomatic code in modified files (context: src/**/*.rs)
> - Security Scope: Scan for injection risks, token leaks, input sanitization (context: auth, input handling code)
> - Performance Scope: Review allocations, async patterns, compiled regex (context: hot paths, loops)
```

#### Обновление многофайлового документа

```
> Update documentation for new "Agent Teams Quick Start" feature:
> - Content Scope: Write guide/workflows/agent-teams-quick-start.md with overview, 4 patterns, decision matrix, metrics
> - Index Scope: Update guide/ultimate-guide.md (add reference section 9.20), machine-readable/reference.yaml (add entry), CHANGELOG.md (add "Added" entry)
> - Consistency Scope: Verify all cross-refs work, line numbers match, no broken links (context: all modified files)
```

#### Проверка синхронизации лендинга

```
> Validate guide/landing synchronization:
> - Guide scanner: Extract version from VERSION file, template count (find examples/ -type f | wc -l), eval count (find docs/resource-evaluations/ -name "*.md" | wc -l), guide lines (wc -l guide/ultimate-guide.md)
> - Landing scanner: Check ../claude-code-ultimate-guide-landing/index.html and examples.html for version, counts, guide lines approximation
```

---

## <a name="5-success-metrics"></a>5. Показатели успеха

### Как измерить рентабельность инвестиций агентских команд

| Метрика | Цель | Как измерить |
|--------|--------|----------------|
| **Скорость сходимости** | >50% | Подсчитайте результаты, отмеченные более чем двумя агентами/общее количество результатов. Высокая конвергенция = высокая уверенность. |
| **Уникальные идеи** | Каждый агент ≥1 | Каждый агент должен найти хотя бы одну уникальную проблему в своем домене. Если агент находит 0 уникальных = токены потрачены впустую. |
| **Доля ложных срабатываний** | <20% | Подсчитайте неверные результаты/общее количество результатов. Слишком много ложных срабатываний = плохие подсказки. |
| **Экономия времени** | 60-70% | Сравните время команд агентов и последовательное время (оцените 3-кратное время одного агента для 3 задач). |
| **Показатель обнаружения ошибок** | >80% | Подсчитайте критические ошибки, обнаруженные агентами, / общее количество ошибок, обнаруженных после отправки. Высокий = эффективная профилактика. |

### Реальный пример: обзорное тестирование предварительного выпуска (08 февраля 2026 г.)

```
Task: Pre-release audit for v3.23.1
Agents: 3 (accuracy-auditor, consistency-checker, breaking-checker)
Duration: 4 min 12 sec

Findings (raw): 45 total
├─ Accuracy: 12 (1 critical: LinkedIn URL malformed, 11 warnings)
├─ Consistency: 18 (2 criticals: template count desync, line numbers outdated)
└─ Breaking: 15 (0 breaking changes, 15 informational notes)

Findings (deduplicated): ~30 unique issues

Convergence analysis:
├─ High confidence (2-3 agents): 4 issues
│   ├─ Template count mismatch (consistency + accuracy)
│   ├─ Line numbers outdated (consistency + accuracy)
│   ├─ External link verification needed (accuracy + breaking)
│   └─ Version sync across files (all 3 agents)
└─ Unique insights:
    ├─ Accuracy: LinkedIn URL corruption (only this agent caught it)
    ├─ Consistency: TOC structure deviation (only this agent)
    └─ Breaking: Changelog format improvement suggestion (only this agent)

Metrics:
├─ Convergence rate: 4/30 = 13% (lower than target, but 4 criticals flagged by multiple agents = high confidence on what matters)
├─ Unique insights: 3/3 agents = 100% (each agent found unique issues in their domain)
├─ False positive rate: 2/30 = 6.6% (below 20% target ✅)
├─ Time saving: 4 min vs estimated 12 min sequential = 66% savings ✅
├─ Bug catch rate: 3 critical bugs caught that would've shipped = prevented production issues ✅

Verdict: ✅ High value for pre-release audits
```

### Как отслеживать свои показатели

**После выполнения задания каждой команды агентов**:

1. **Подсчет результатов**: запишите необработанные результаты для каждого агента, затем выполните дедупликацию.
2. **Mark сходимости**: Какие проблемы были отмечены более чем двумя агентами?
3. **Проверьте уникальную информацию**: Каждый агент обнаружил хотя бы одну проблему, связанную с конкретным доменом?
4. **Проверка ложных срабатываний**: Сколько результатов было invalid/noise?
5. **Сравнение времени**: продолжительность команд агентов по сравнению с расчетным последовательным временем
6. **Проверка после отправки**: Обнаружили ли команды агентов ошибки, которые могли бы быть отправлены?

**Сохраняйте журнал** (таблица уценки в документации проекта):

```markdown
| Date | Task | Agents | Duration | Findings | Convergence | Unique | False+ | Time Saved | Bugs Caught |
|------|------|--------|----------|----------|-------------|--------|--------|------------|-------------|
| 2026-02-08 | Pre-release v3.23.1 | 3 | 4m12s | 30 | 13% (4 critical) | 3/3 | 6.6% | 66% | 3 |
```

**Настройте подсказки**, если метрики не работают:
- Низкая сходимость (<30%) → Области слишком узкие, границы контекста больше перекрываются.
- Нет уникальных идей → Области слишком схожи, необходимо разнообразить углы анализа.
- Высокий уровень ложных срабатываний (>20%) → Подсказки слишком расплывчаты, добавьте конкретные критерии.

---

## <a name="6-limitations--red-flags"></a>6. Ограничения и красные флажки

### Что НЕ делают агентские команды

| Ограничение | Что это значит | смягчение последствий |
|------------|---------------|-----------|
| **3x токена** | Каждый агент = отдельный вызов модели = 3-кратная стоимость | Зарезервируйте для важных задач (предварительная версия, PR по безопасности, а не исправления опечаток) |
| **Пустой спам** | Агенты показывают сообщения «Неактивен» во время координации. | Нормальное поведение, не ошибка, игнорируйте спам |
| **Экспериментальный** | Предварительный просмотр исследования = стабильность не гарантирована | Ожидайте ошибок, не полагайтесь на команды агентов в критически важных рабочих процессах. |
| **Накладные расходы на координацию** | Максимум 3-5 агентов, а не 10 (сложность координации возрастает) | Придерживайтесь 2–4 агентов, избегайте подсказок «команда из 10 человек». |
| **Изоляция контекста** | Агенты не видят находки друг друга (работают независимо) | Claude обобщает результаты, но агенты не могут опираться на работу друг друга в середине задания. |

### Красные флажки: когда НЕ использовать

❌ **Простая задача** (<5 файлов, <100 строк, 1 домен)
- Пример: исправить опечатку в README.md.
- Почему следует избегать: 3 жетона за 10-секундное задание = трата

❌ **Последовательный рабочий процесс** (шаг Б зависит от результата шага А)
- Пример: Реализация функции → Написание тестов → Развертывание.
- Почему следует избегать: агенты работают параллельно, не могут обрабатывать зависимости.

❌ **Бюджет ограничен** (3 токена, оптимизация затрат)
- Пример: Личный проект с ограниченным количеством кредитов API.
- Почему следует избегать: команды агентов = роскошь для решения важных задач, а не для ежедневного рабочего процесса

❌ **Write-heavy** (много изменений в одних и тех же файлах)
- Пример: Рефакторинг всей структуры кодовой базы
- Почему следует избегать: конфликты слияний, накладные расходы на координацию, агенты, наступающие друг на друга.

❌ **Обзор с низкими ставками** (внутренний PR, доверенный участник, простое изменение)
- Пример: член команды исправляет небольшую ошибку.
- Почему следует избегать: перебор, проверка одним агентом быстрее и дешевле

### Когда СЛЕДУЕТ использовать (несмотря на затраты)

✅ **High-stakes** (рабочая версия, чувствительная к безопасности, внешний участник)
✅ **Мультидоменный** (Rust + Безопасность + Производительность = слепые зоны)
✅ **Параллельный** (независимые задачи, без последовательных зависимостей)
✅ **Consistency-critical** (межфайловая синхронизация, счетчики, версии)
✅ **Возможность обучения** (понять слепые зоны, улучшить подсказки)

---

## Резюме: Краткая справка

### Настройка (5 минут один раз)

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude
> Are agent teams enabled?  # Verify
```

### Когда использовать (правило принятия решения)

**YES если**:
- Высокие ставки + Мультидоменность + Возможность параллельного использования

**НО если**:
- Простая задача + Последовательная + Ограниченный бюджет

### Выкройки (4 готовых к использованию)

1. **Предварительный обзор** (Руководство) → Точность + последовательность + нарушение
2. **Landing Sync** (Руководство) → Сканер руководства + Сканер приземления
3. **Обновление многофайлового документа** (Руководство) → Содержание + Индекс + Согласованность
4. **Security PR Review** (RTK) → Rust + Безопасность + Производительность

### Метрики (отслеживание рентабельности инвестиций)

- Сходимость: >50% (данные 2+ агентов)
- Уникальная информация: каждый агент ≥1
- Ложные срабатывания: <20%
- Экономия времени: 60-70%
- Обнаружение ошибок: > 80 %

### Красные флажки (избегайте отходов)

- ❌ Простая задача (<5 файлов)
- ❌ Последовательный рабочий процесс
- ❌ Бюджет ограничен
- ❌ Тяжелая запись (конфликты слияния)

---

## Следующие шаги

1. **Попробуйте первый тест** (5 минутная настройка + простая задача для двух агентов)
2. **Выберите 1 шаблон** из вашего проекта (Guide или RTK)
3. **Измерение показателей** (конвергенция, уникальная аналитика, экономия времени)
4. **Настроить подсказки** на основе результатов
5. **Прочитайте полный документ** для получения дополнительных шаблонов: [Команды агентов](./agent-teams.md)

**Есть вопросы?** Ознакомьтесь с полной документацией [](./agent-teams.md):
- Глубокое погружение в архитектуру (как работает координация git)
- Расширенные варианты использования (более 15 производственных сценариев)
- Устранение неполадок (частые проблемы + решения)
- Лучшие практики (размер команды, быстрое проектирование, разрешение конфликтов)
