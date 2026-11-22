---
title: "Claude Code: Визуальный справочник"
description: "Диаграммы ASCII, объединяющие ключевые концепции Claude Code в одном визуальном обзоре"
tags: [reference, architecture, cheatsheet]
---

# Claude Code: Визуальная ссылка

Все схемы в одном месте. Краткий визуальный обзор ключевых концепций Claude Code.
Подробную документацию → [Полное руководство](../ultimate-guide.md) | [Шпаргалка](../cheatsheet.md)

> **Доступны интерактивные диаграммы Mermaid**: 40 интерактивных диаграмм, охватывающих выбор модели, жизненный цикл агента, иерархию памяти, многоагентные шаблоны, угрозы безопасности и многое другое, см. в **[guide/diagrams/](../diagrams/)**. Этот файл содержит версии ASCII ключевых концепций.

> **20 диаграмм**: 8 новых (этот файл) + 12 из существующих руководств, все они собраны здесь.

---

## Руководство по чтению карты упряжи

Эти диаграммы ASCII охватывают некоторые концепции Claude Code. Для таксономии связок используйте три цифры на карте [Agent Harness Map](../ecosystem/agent-harness-landscape.md): строгая и широкая область применения, четыре слоя и воронка выбора. [Agent Harness Engineering](./agent-harness.md) объясняет модель, среду выполнения, систему репозитория и оркестратор. [Agent Tools: Beyond Claude Code](../ecosystem/agentic-tools.md) охватывает платформы и плоскости управления. Используйте [Agent Evaluation](../roles/agent-evaluation.md), [Session Observability](../ops/observability.md)и [Security Hardening](../security/security-hardening.md) для тестирования, проверки и ограничения выбранной конструкции. Определения приведены в глоссарии [](./glossary.md).

---

## Оглавление

**Новые диаграммы:**
1. [Зоны контекстного управления](#1-context-management-zones)
2. [Цикл режимов разрешений](#2-permission-modes-cycle)
3. [Конвейер рабочего процесса (9 шагов)](#3-workflow-pipeline-9-steps)
4. [Дерево быстрых решений](#4-quick-decision-tree)

**Архитектура и внутреннее устройство:**
5. [Главный цикл](#5-master-loop)
6. [Поток событий перехвата](#6-hook-event-flow)
7. [Поток конфиденциальности данных](#7-data-privacy-flow)

**Security:**
8. [MCP Атака по ковру](#8-mcp-rug-pull-attack)
9. [Docker Архитектура песочницы](#9-docker-sandbox-architecture)

**Деревья решений:**
10. [Выбор инструмента поиска](#10-search-tool-selection)
11. [Последовательность доверительной калибровки](#11-trust-calibration-flow)
12. [Дерево решений об усыновлении](#12-adoption-decision-tree)
13. [Выбор метода](#13-methodology-selection)

**Workflows:**
14. [Исследование → Спецификация → Код](#14-research--spec--code)
15. [Просмотр цикла автокоррекции](#15-review-auto-correction-loop)
16. [PDF Трубопроводный стек](#16-pdf-pipeline-stack)

**Развитие и обучение:**
17. [TDD Цикл красно-зеленого рефакторинга](#17-tdd-red-green-refactor-cycle)
18. [UVAL Поток протокола](#18-uval-protocol-flow)

**Security (расширенный):**
19. [Безопасность, 3-уровневая защита](#19-security-3-layer-defense)
20. [Хронология секретного разоблачения](#20-secret-exposure-timeline)

---

## <a name="1-context-management-zones"></a>1. Зоны управления контекстом

Как реагировать в зависимости от использования контекстного окна (проверьте с помощью `/status`):

```
Context Usage
0%          50%         70%         90%       100%
├───────────┼───────────┼───────────┼──────────┤
│   GREEN   │  YELLOW   │  ORANGE   │   RED    │
│  work     │ selective │ /compact  │  /clear  │
│  freely   │ with care │   NOW     │ required │
└───────────┴───────────┴───────────┴──────────┘
              ▲                       ▲
              │                       │
         Be selective            Risk: forgetting
         about reads             instructions,
         and tool use            hallucinations
```

**Действия по зоне:**
- **Зеленый (0–50%)**: Полная скорость. Читайте файлы, исследуйте свободно.
- **Желтый (50-70%)**: Будьте избирательны. Избегайте ненужного чтения файлов.
- **Оранжевый (70–90%)**: Немедленно запустите `/compact`. Контекст деградирует.
- **Red (90%+)**: Запустите `/clear` и перезапустите. Ответы ненадежны.

→ Источник: [ultimate-guide.md:1335](../ultimate-guide.md)

---

## <a name="2-permission-modes-cycle"></a>2. Цикл режимов разрешений

Переключайте режимы с помощью `Shift+Tab`:

```
                 Shift+Tab              Shift+Tab
  ┌──────────┐ ────────────→ ┌───────────────┐ ────────────→ ┌───────────┐
  │ DEFAULT  │               │  AUTO-ACCEPT   │               │ PLAN MODE │
  │          │               │                │               │           │
  │ edit=ask │               │ edit=auto      │               │ edit=no   │
  │ exec=ask │               │ exec=ask       │               │ exec=no   │
  └──────────┘ ←──────────── └───────────────┘ ←──────────── └───────────┘
                 Shift+Tab              Shift+Tab
```

**Когда использовать каждый режим:**

| Режим | Используйте, когда... | Уровень риска |
|------|-------------|------------|
| **По умолчанию** | Нормальное развитие: просмотрите каждое изменение | Низкий |
| **Auto-accept** | Доверенные задачи (форматирование, рефакторинг) | Середина |
| **Режим планирования** | Операции Complex/risky: сначала исследуйте безопасно | Никто |

**Shortcuts:**
- `Shift+Tab`: переход к следующему режиму.
- `Shift+Tab × 2`: переход в режим планирования по умолчанию.
- `/plan`: напрямую войти в режим планирования.
- Выйдите из режима плана: подтвердите план, представленный Claude, или нажмите `Shift+Tab` (команда `/execute` отсутствует)

→ Источник: [ultimate-guide.md:760](../ultimate-guide.md)

---

## <a name="3-workflow-pipeline-9-steps"></a>3. Конвейер рабочего процесса (9 шагов)

Рекомендуемый рабочий процесс для каждой задачи:

```
  ┌─────────┐    ┌──────────┐    ┌────────────┐    ┌─────────────┐
  │ 1.START │───→│ 2./status│───→│ 3. plan?   │───→│ 4. describe │
  │ claude  │    │ check ctx│    │ Shift+Tab×2│    │ WHAT/WHERE  │
  └─────────┘    └──────────┘    │ (if risky) │    │ HOW/VERIFY  │
                                 └────────────┘    └──────┬──────┘
                                                          │
      ┌───────────────────────────────────────────────────┘
      │
      ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ 5.review │───→│ 6. y/n   │───→│ 7. test  │───→│ 8.commit │───→│9./compact│
  │   diff   │    │ accept?  │    │   run    │    │ when done│    │ when >70%│
  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Основные принципы:**
- **Шаг 2**: Всегда проверяйте контекст перед запуском. Если >70%, сначала `/compact`.
- **Шаг 3**: Используйте режим планирования для всего рискованного, сложного или многофайлового.
- **Шаг 4**: Будьте конкретны. Расплывчатые подсказки дают расплывчатые результаты.
- **Шаг 5**: Прочтите все различия. Никогда не принимайте слепо.
- **Шаг 9**: Компактируйте после каждого задания, чтобы оставаться в зеленой зоне.

→ Источник: [ultimate-guide.md:277](../ultimate-guide.md)

---

## <a name="4-quick-decision-tree"></a>4. Дерево быстрых решений

Что делать, исходя из вашей ситуации:

```
What do you need?
│
├─ Simple task ─────────────────→ Just ask Claude
│
├─ Complex task
│  ├─ Single session ───────────→ /plan + Tasks API
│  └─ Multi-session ────────────→ Tasks API + CLAUDE_CODE_TASK_LIST_ID
│
├─ Repeating task ──────────────→ Create agent or command
│
├─ Context >70% ────────────────→ /compact
│
├─ Context >90% ────────────────→ /clear (restart conversation)
│
├─ Need library docs ───────────→ Context7 MCP
│
├─ Deep debugging ──────────────→ Opus model + Alt+T (thinking)
│
├─ UI from design ──────────────→ Figma MCP or screenshot input
│
└─ Team rollout ────────────────→ Read adoption-approaches.md
```

→ Источник: [reference.yaml](../../machine-readable/reference.yaml) (решить раздел)

---

## <a name="5-master-loop"></a>5. Главный цикл

Вся архитектура представляет собой простой цикл `while`: ни DAG, ни классификатора, ни RAG.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE MASTER LOOP                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐                                          │
│   │  Your Prompt │                                          │
│   └──────┬───────┘                                          │
│          │                                                  │
│          ▼                                                  │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                                                      │  │
│   │                  CLAUDE REASONS                      │  │
│   │        (No classifier, no routing layer)             │  │
│   │                                                      │  │
│   └────────────────────────┬─────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│                   ┌────────────────┐                        │
│                   │  Tool Call?    │                        │
│                   └───────┬────────┘                        │
│                           │                                 │
│              YES          │           NO                    │
│         ┌─────────────────┴─────────────────┐               │
│         │                                   │               │
│         ▼                                   ▼               │
│  ┌────────────┐                      ┌────────────┐         │
│  │  Execute   │                      │   Text     │         │
│  │   Tool     │                      │  Response  │         │
│  │            │                      │   (DONE)   │         │
│  └─────┬──────┘                      └────────────┘         │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────┐                                            │
│  │ Feed Result │                                            │
│  │  to Claude  │──────────────────┐                         │
│  └─────────────┘                  │                         │
│                                   │                         │
│                                   ▼                         │
│                          ┌────────────────┐                 │
│                          │   LOOP BACK    │                 │
│                          │  (Next turn)   │                 │
│                          └────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

→ Источник: [architecture.md:84](./architecture.md)

---

## <a name="6-hook-event-flow"></a>6. Перехват потока событий

Как перехваты перехватывают конвейер выполнения Claude Code:

```
┌─────────────────────────────────────────────────────────┐
│                      EVENT FLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   User types message                                    │
│        │                                                │
│        ▼                                                │
│   ┌────────────────────┐                                │
│   │ UserPromptSubmit   │  ← Add context (git status)    │
│   └────────────────────┘                                │
│        │                                                │
│        ▼                                                │
│   Claude decides to run tool (e.g., Edit)               │
│        │                                                │
│        ▼                                                │
│   ┌────────────────────┐                                │
│   │ PreToolUse         │  ← Security check              │
│   └────────────────────┘                                │
│        │                                                │
│        ▼ (if allowed)                                   │
│   Tool executes                                         │
│        │                                                │
│        ▼                                                │
│   ┌────────────────────┐                                │
│   │ PostToolUse        │  ← Auto-format                 │
│   └────────────────────┘                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

→ Источник: [ultimate-guide.md:6327](../ultimate-guide.md)

---

## <a name="7-data-privacy-flow"></a>7. Поток конфиденциальности данных

Какие данные покидают вашу машину при использовании Claude Code:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL MACHINE                       │
├─────────────────────────────────────────────────────────────┤
│  • Prompts you type                                         │
│  • Files Claude reads (including .env if not excluded!)     │
│  • MCP server results (SQL queries, API responses)          │
│  • Bash command outputs                                     │
│  • Error messages and stack traces                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    ANTHROPIC API                            │
├─────────────────────────────────────────────────────────────┤
│  • Processes your request                                   │
│  • Stores conversation based on retention policy            │
│  • May use data for model training (if not opted out)       │
└─────────────────────────────────────────────────────────────┘
```

→ Источник: [data-privacy.md:24](../security/data-privacy.md)

---

## <a name="8-mcp-rug-pull-attack"></a>8. Атака по ковру MCP

Как вредоносный сервер MCP может использовать модель однократного одобрения:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Attacker publishes benign MCP "code-formatter"          │
│                         ↓                                    │
│  2. User adds to ~/.claude.json, approves once               │
│                         ↓                                    │
│  3. MCP works normally for 2 weeks (builds trust)           │
│                         ↓                                    │
│  4. Attacker pushes malicious update (no re-approval!)      │
│                         ↓                                    │
│  5. MCP exfiltrates ~/.ssh/*, .env, credentials             │
└─────────────────────────────────────────────────────────────┘
MITIGATION: Version pinning + hash verification + monitoring
```

→ Источник: [security-hardening.md:33](../security/security-hardening.md)

---

## <a name="9-docker-sandbox-architecture"></a>9. Архитектура песочницы Docker

Полная изоляция для автономных сессий Claude Code:

```
┌──────────────────────────────────────────────────────────┐
│                     HOST MACHINE                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              DOCKER SANDBOX (microVM)               │  │
│  │                                                    │  │
│  │  ┌──────────────┐  ┌───────────────────────────┐  │  │
│  │  │ Claude Code   │  │ Private Docker daemon     │  │  │
│  │  │ (--dsp mode)  │  │ (isolated from host)      │  │  │
│  │  └──────────────┘  └───────────────────────────┘  │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ Workspace: ~/my-project (synced with host)   │  │  │
│  │  │ Same absolute path as host                   │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  Base: Ubuntu, Node.js, Python 3, Go, Git,        │  │
│  │        Docker CLI, GitHub CLI, ripgrep, jq         │  │
│  │  User: non-root 'agent' with sudo                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Host Docker daemon: NOT accessible from sandbox          │
│  Host filesystem: NOT accessible (except workspace)       │
└──────────────────────────────────────────────────────────┘
```

→ Источник: [sandbox-isolation.md:87](../security/sandbox-isolation.md)

---

## <a name="10-search-tool-selection"></a>10. Выбор инструмента поиска

Трехуровневое дерево решений для выбора подходящего инструмента поиска:

**Уровень 1: Что ты знаешь?**

```
Do you know the EXACT text/pattern?
│
├─ YES → Use rg (ripgrep)
│  ├─ Known function name: rg "createSession"
│  ├─ Known import: rg "import.*React"
│  └─ Known pattern: rg "async function"
│
└─ NO → Go to Level 2
```

**Уровень 2: Что вы ищете?**

```
What's your search intent?
│
├─ "Find by MEANING/CONCEPT"
│  → Use grepai
│  └─ Example: grepai search "payment validation logic"
│
├─ "Find FUNCTION/CLASS definition"
│  → Use Serena
│  └─ Example: serena find_symbol --name "UserController"
│
├─ "Find by CODE STRUCTURE"
│  → Use ast-grep
│  └─ Example: async without error handling
│
└─ "Understand DEPENDENCIES"
   → Use grepai trace
   └─ Example: grepai trace callers "validatePayment"
```

**Уровень 3: Оптимизация**

```
Found too many results?
│
├─ rg → Add --type filter or narrow path
├─ grepai → Add --path filter or use trace
├─ Serena → Filter by symbol type (function/class)
└─ ast-grep → Add constraints to pattern
```

→ Источник: [search-tools-mastery.md:75](../workflows/search-tools-mastery.md)

---

## <a name="11-trust-calibration-flow"></a>11. Доверьтесь процессу калибровки

Сколько стоит пересматривать код, сгенерированный ИИ, исходя из уровня риска:

```
┌─────────────────────────────────────────────────────────┐
│                 TRUST CALIBRATION FLOW                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AI generates code                                      │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │ What type?   │                                       │
│  └──────────────┘                                       │
│    │    │    │                                          │
│    ▼    ▼    ▼                                          │
│  Boiler Business Security                               │
│  -plate  logic   critical                               │
│    │      │        │                                    │
│    ▼      ▼        ▼                                    │
│  Skim   Test +   Full review                            │
│  only   review   + tools                                │
│    │      │        │                                    │
│    └──────┴────────┘                                    │
│            │                                            │
│            ▼                                            │
│    Tests pass? ──No──► Debug & fix                      │
│            │                                            │
│           Yes                                           │
│            │                                            │
│            ▼                                            │
│        Ship it                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

→ Источник: [ultimate-guide.md:1182](../ultimate-guide.md)

---

## <a name="12-adoption-decision-tree"></a>12. Дерево решений об усыновлении

Как выбрать стратегию внедрения Claude Code:

```
Starting Claude Code?
│
├─ Need to ship today?
│   └─ YES → Turnkey Quickstart
│   └─ NO ↓
│
├─ Team needs shared conventions?
│   └─ YES → Turnkey + document what matters to you
│   └─ NO ↓
│
├─ Want to understand before configuring?
│   └─ YES → Autonomous Learning Path
│   └─ NO → Turnkey, adjust as you go
```

→ Источник: [adoption-approaches.md:51](../roles/adoption-approaches.md)

---

## <a name="13-methodology-selection"></a>13. Выбор методологии

Какую методологию разработки использовать:

```
┌─ "I want quality code" ────────────→ workflows/tdd-with-claude.md
│
├─ "I want to spec before code" ─────→ workflows/spec-first.md
│
├─ "I need to plan architecture" ────→ workflows/plan-driven.md
│
├─ "I'm iterating on something" ─────→ workflows/iterative-refinement.md
│
└─ "I need methodology theory" ──────→ methodologies.md
```

→ Источник: [methodologies.md:24](./methodologies.md)

---

## <a name="14-research--spec--code"></a>14. Исследования → спецификация → код

Используем Perplexity для исследования, затем Claude Code для реализации:

```
┌─────────────────────────────────────────────────────────┐
│ 1. PERPLEXITY (Deep Research)                           │
│    "Research best practices for JWT refresh tokens      │
│     in Next.js 15. Include security considerations,     │
│     common pitfalls, and library recommendations."      │
│                                                         │
│    → Output: 2000-word spec with sources               │
└───────────────────────────┬─────────────────────────────┘
                            ↓ Export as spec.md
┌─────────────────────────────────────────────────────────┐
│ 2. CLAUDE CODE                                          │
│    > claude                                             │
│    "Implement JWT refresh tokens following spec.md.     │
│     Use the jose library as recommended."               │
│                                                         │
│    → Output: Working implementation with tests         │
└─────────────────────────────────────────────────────────┘
```

→ Источник: [ai-ecosystem.md:155](../ecosystem/ai-ecosystem.md)

---

## <a name="15-review-auto-correction-loop"></a>15. Просмотрите цикл автокоррекции.

Шаблон итеративной проверки кода, при котором Claude проверяет, исправляет и перепроверяет:

```
┌─────────────────────────────────────────┐
│   Review Auto-Correction Loop           │
│                                          │
│   Review (identify issues)               │
│        ↓                                 │
│   Fix (apply corrections)                │
│        ↓                                 │
│   Re-Review (verify fixes)               │
│        ↓                                 │
│   Converge (minimal changes) → Done      │
│        ↑                                 │
│        └──── Repeat (max iterations)     │
└─────────────────────────────────────────┘
```

→ Источник: [iterative-refinement.md:354](../workflows/iterative-refinement.md)

---

## <a name="16-pdf-pipeline-stack"></a>16. Стек конвейера PDF

Стек Quarto + Typst для создания профессиональных PDF-файлов:

```
┌─────────────────────────────────────────────────┐
│                  Your .qmd File                 │
│         (Markdown + YAML frontmatter)           │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                    Quarto                       │
│           (Document rendering engine)           │
│         • Processes YAML metadata               │
│         • Handles extensions                    │
│         • Manages output formats                │
└─────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│       Pandoc        │    │       Typst         │
│   (MD → AST → ?)    │    │  (Typography/PDF)   │
│  • Markdown parser  │    │  • Modern engine    │
│  • AST transforms   │    │  • Fast compilation │
│  • Format bridges   │    │  • No LaTeX needed  │
└─────────────────────┘    └─────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                  document.pdf                   │
│        (Professional typography output)         │
└─────────────────────────────────────────────────┘
```

→ Источник: [pdf-generation.md:58](../workflows/pdf-generation.md)

---

## <a name="17-tdd-red-green-refactor-cycle"></a>17. Цикл TDD красный-зеленый-рефакторинг

Итеративный цикл в основе разработки через тестирование:

```
                    ┌──────────────────────────┐
                    │                          │
                    ▼                          │
            ┌──────────────┐                   │
            │   🔴 RED      │                   │
            │              │                   │
            │  Write a     │                   │
            │  failing     │                   │
            │  test        │                   │
            └──────┬───────┘                   │
                   │                           │
                   │ Tests FAIL                │
                   │ (expected)                │
                   ▼                           │
            ┌──────────────┐                   │
            │   🟢 GREEN   │                   │
            │              │                   │
            │  Write       │                   │
            │  minimal     │                   │
            │  code to     │                   │
            │  pass        │                   │
            └──────┬───────┘                   │
                   │                           │
                   │ Tests PASS                │
                   │ (minimal)                 │
                   ▼                           │
            ┌──────────────┐                   │
            │   🔵 REFACTOR│                   │
            │              │                   │
            │  Clean up    │                   │
            │  while tests │                   │
            │  stay green  │                   │
            └──────┬───────┘                   │
                   │                           │
                   │ Next feature              │
                   └───────────────────────────┘

Key rules:
  RED    → Test must FAIL before writing implementation
  GREEN  → Write ONLY enough code to pass (no more)
  REFACTOR → Improve structure, tests must stay green
  REPEAT → One feature at a time, always in this order
```

> Источник: [workflows/tdd-with-claude.md:78](../workflows/tdd-with-claude.md)

---

## <a name="18-uval-protocol-flow"></a>18. Схема протокола UVAL

Систематическая основа обучения с помощью ИИ, не теряя своих преимуществ:

```
  ┌────────────────────────────────────────────────────────────┐
  │                    UVAL PROTOCOL                           │
  │         (Use AI without losing your edge)                  │
  └────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │    U     │     │    V     │     │    A     │     │    L     │
  │UNDERSTAND│────→│  VERIFY  │────→│  APPLY   │────→│  LEARN   │
  │          │     │          │     │          │     │          │
  │ 15-min   │     │ Can you  │     │ Modify   │     │ Capture  │
  │ rule:    │     │ explain  │     │ the code │     │ insights │
  │          │     │ it back? │     │ yourself │     │ for long │
  │ 1.State  │     │          │     │          │     │ term     │
  │   problem│     │ Test:    │     │ Tasks:   │     │          │
  │ 2.Brain- │     │ explain  │     │ • Extend │     │ Methods: │
  │   storm  │     │ to a     │     │ • Modify │     │ • Notes  │
  │ 3.Find   │     │ colleague│     │ • Debug  │     │ • Teach  │
  │   gaps   │     │ without  │     │ • Adapt  │     │ • Blog   │
  │ 4.Ask    │     │ looking  │     │   to new │     │ • Review │
  │   smart  │     │ at code  │     │   context│     │   later  │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
       │                                                   │
       │              ◄── Repeat per concept ──►           │
       └───────────────────────────────────────────────────┘

  If VERIFY fails → go back to UNDERSTAND (you copied, didn't learn)
  If APPLY fails  → go back to VERIFY (you memorized, didn't understand)
```

> Источник: [learning-with-ai.md:208](../roles/learning-with-ai.md)

---

## <a name="19-security-3-layer-defense"></a>19. Безопасность 3-х уровневая защита

Полный документ безопасности (security-hardening.md), организованный в виде трех уровней защиты:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                  SECURITY 3-LAYER DEFENSE                   │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  TIME ──────────────────────────────────────────────────►   │
  │         Before              During             After        │
  │                                                             │
  │  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
  │  │ LAYER 1         │ │ LAYER 2         │ │ LAYER 3       │ │
  │  │ PREVENTION      │ │ DETECTION       │ │ RESPONSE      │ │
  │  │                 │ │                 │ │               │ │
  │  │ • MCP vetting   │ │ • Prompt inject │ │ • Secret      │ │
  │  │   workflow      │ │   detection     │ │   rotation    │ │
  │  │ • Version       │ │ • Output        │ │ • MCP         │ │
  │  │   pinning       │ │   scanning      │ │   isolation   │ │
  │  │ • .claudeignore │ │ • Anomaly       │ │ • History     │ │
  │  │ • Input hooks   │ │   monitoring    │ │   rewriting   │ │
  │  │ • Safe MCP list │ │ • Secret leak   │ │ • Incident    │ │
  │  │ • Permissions   │ │   detection     │ │   reporting   │ │
  │  │ • Integrity     │ │ • Unicode/ANSI  │ │ • Post-mortem │ │
  │  │   scanning      │ │   filtering     │ │   & rotation  │ │
  │  │                 │ │                 │ │               │ │
  │  │  GOAL: Block    │ │  GOAL: Catch    │ │  GOAL: Limit  │ │
  │  │  threats at     │ │  attacks in     │ │  damage and   │ │
  │  │  entry points   │ │  real-time      │ │  recover fast │ │
  │  └─────────────────┘ └─────────────────┘ └───────────────┘ │
  │                                                             │
  │  Adoption path:                                             │
  │  Solo dev    → Layer 1 basics (output scanner)              │
  │  Team        → Layer 1 + 2 (+ injection hooks)              │
  │  Enterprise  → All 3 layers (+ ZDR + verification)          │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

> Источник: [security-hardening.md:24/205/345](../security/security-hardening.md)

---

## <a name="20-secret-exposure-timeline"></a>20. График секретного разоблачения

Экстренное реагирование при раскрытии секрета (ключ API, токен, пароль):

```
  SECRET EXPOSED — Emergency Response Timeline
  ═══════════════════════════════════════════════════════════

  0 min                15 min              1 hour             24 hours
  │                    │                   │                  │
  ▼                    ▼                   ▼                  ▼
  ┌──────────────────┐ ┌─────────────────┐ ┌────────────────┐
  │ ⏱️ FIRST 15 MIN   │ │ ⏱️ FIRST HOUR    │ │ ⏱️ FIRST 24H    │
  │ Stop the         │ │ Assess damage   │ │ Remediate      │
  │ bleeding         │ │                 │ │                │
  │                  │ │ 3. Audit git    │ │ 6. Rotate ALL  │
  │ 1. REVOKE key    │ │    history      │ │    related     │
  │    immediately   │ │    (rewrite if  │ │    credentials │
  │    (AWS/GH/      │ │     pushed)     │ │                │
  │     Stripe)      │ │                 │ │ 7. Notify team │
  │                  │ │ 4. Scan deps    │ │    /compliance │
  │ 2. Confirm       │ │    for leaked   │ │    (GDPR/SOC2) │
  │    exposure      │ │    keys         │ │                │
  │    scope         │ │                 │ │ 8. Document    │
  │    (local or     │ │ 5. Check CI/CD  │ │    incident    │
  │     pushed?)     │ │    logs         │ │    timeline    │
  │                  │ │                 │ │                │
  └──────────────────┘ └─────────────────┘ └────────────────┘

  SEVERITY GUIDE:
  ┌─────────────────────────────────────────────────────────┐
  │ Local only (not pushed)  → Revoke + rotate (steps 1-2) │
  │ Pushed to remote         → Full timeline (steps 1-8)   │
  │ Public repo exposure     → Assume compromised, rotate  │
  │                            EVERYTHING, check for abuse  │
  └─────────────────────────────────────────────────────────┘
```

> Источник: [security-hardening.md:347](../security/security-hardening.md)

---

*Вернуться к [Руководство README](../README.md) | [Шпаргалка](../cheatsheet.md) | [Основной README](../README.md)*
