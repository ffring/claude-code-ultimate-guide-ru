---
title: "Claude Code: Диаграммы многоагентных шаблонов"
description: "Концептуальные топологии, изолированные рабочие деревья, планирование, делегирование и обмен сообщениями."
tags: [multi-agent, patterns, worktrees, orchestration, scaling]
---

# Мультиагентные шаблоны

Координируйте независимую работу с четкими проверками владения и интеграции. Собственные особенности, концептуальные модели и измеряемые результаты различны.

---

### <a name="agent-teams-conceptual-orchestration-topologies"></a>Команды агентов: топологии концептуальной оркестровки

Оркестратор, конвейер и специализированная маршрутизация — это концептуальные шаблоны, а не три встроенных режима команд агентов. Native Agent Teams использует ведущего и общающихся товарищей по команде; он является экспериментальным и отключен по умолчанию. Это добавляет координацию и стоимость токенов. Последовательные задачи и редактирование одних и тех же файлов часто лучше подходят для одного сеанса или для целевых субагентов.

```mermaid
flowchart TD
    CHOOSE["Choose a coordination pattern"] --> ORCH["Orchestrator + workers<br/>Native teams: lead + teammates<br/>Experimental, opt-in"]
    CHOOSE --> PIPE["Pipeline pattern<br/>Stages depend on prior results"]
    CHOOSE --> ROUTE["Specialist routing pattern<br/>Choose worker by task"]
    ORCH --> FRONT["Worker owns frontend files"]
    ORCH --> BACK["Worker owns backend files"]
    FRONT --> INTEG["Lead integrates and verifies"]
    BACK --> INTEG
    PIPE --> REQ["Requirements"]
    REQ --> IMPL["Implementation"]
    IMPL --> REVIEW["Review against criteria"]
    ROUTE --> SELECT{"Needed expertise?"}
    SELECT --> CODE["Code worker"]
    SELECT --> TEST["Test worker"]
    SELECT --> DOC["Documentation worker"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click CHOOSE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click ORCH href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click PIPE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click ROUTE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click FRONT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click BACK href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click INTEG href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click REQ href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click IMPL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click REVIEW href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click SELECT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click CODE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click TEST href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
    click DOC href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/agent-teams.md" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
Conceptual coordination patterns
├─ Orchestrator → workers with explicit ownership → integration checks
│  Native Agent Teams: lead + communicating teammates, experimental opt-in
├─ Pipeline → requirements → implementation → review
│  Workflow pattern; often a single session or subagents suffices
└─ Router → needed specialist (code / tests / docs)
   Workflow pattern, not a dedicated native team mode

Teams cost more tokens and require coordination.
```

</details>

> **Источник**: [Руководство: Команды агентов: топологии концептуальной оркестровки](../workflows/agent-teams.md); [Доступность команд агентов и компромиссы](https://code.claude.com/docs/en/agent-teams)

---

### <a name="git-worktree-multi-instance-pattern"></a>Многоэкземплярный шаблон рабочего дерева Git

Рабочие деревья предоставляют параллельным экземплярам отдельные извлеченные файлы и ветки. Некоторые метаданные репозитория остаются общими, и интеграция их изменений может по-прежнему вызывать конфликты слияния. Приведенные ниже команды предполагают наличие корня клонированного репозитория; каждая команда создает отображаемый путь.

```mermaid
flowchart TD
    REPO["Repository root"] --> WA["git worktree add -b feature-A<br/>../worktrees/feature-A"]
    REPO --> WB["git worktree add -b feature-B<br/>../worktrees/feature-B"]
    REPO --> WC["git worktree add -b bugfix-C<br/>../worktrees/bugfix-C"]
    WA --> CA["Claude 1: ../worktrees/feature-A<br/>Commits to feature-A"]
    WB --> CB["Claude 2: ../worktrees/feature-B<br/>Commits to feature-B"]
    WC --> CC["Claude 3: ../worktrees/bugfix-C<br/>Commits to bugfix-C"]
    CA --> INTEGRATE["Integrate changes<br/>Resolve conflicts if present"]
    CB --> INTEGRATE
    CC --> INTEGRATE
    INTEGRATE --> CHECK["Run integration checks and review"]
    CHECK --> MERGE["Merge when criteria pass"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click REPO href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click WA href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click WB href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click WC href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click CA href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click CB href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click CC href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click INTEGRATE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click CHECK href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
    click MERGE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#912-git-best-practices--workflows" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
From the cloned repository root:
git worktree add -b feature-A ../worktrees/feature-A
git worktree add -b feature-B ../worktrees/feature-B
git worktree add -b bugfix-C ../worktrees/bugfix-C

Each path → its Claude instance → commits on its own branch
         → integrate → resolve conflicts if present
         → integration checks + review → merge

Separate working files; shared repository metadata.
Concurrent editing is isolated, merge conflicts remain possible.
```

</details>

> **Source**: [Guide: Многоэкземплярный шаблон рабочего дерева Git](../ultimate-guide.md#912-git-best-practices--workflows); [Семантика рабочего дерева Git](https://git-scm.com/docs/git-worktree)

---

### Шаблон планирования с двумя экземплярами

Используйте два сеанса, когда полезна отдельная граница планирования. Планировщику, у которого нет инструментов, необходимы соответствующие документы, представленные в его подсказке. Альтернативно, режим «План» позволяет проводить исследование с ограниченными действиями. Настройте ограничение явно; запуск второго сеанса не отключает инструменты. Исполнителю нужен утвержденный план и необходимый контекст, а не автоматическое наследование разговора с планировщиком.

```mermaid
flowchart TD
    DOCS["User supplies requirements<br/>and relevant documents"] --> PLANNER["Planner session<br/>No tools explicitly configured<br/>or restricted Plan mode"]
    PLANNER --> PLAN["Plan: files, steps, checks<br/>and rollback constraints"]
    PLAN --> REVIEW{"Human approves?"}
    REVIEW -->|No| PLANNER
    REVIEW -->|Yes| TRANSFER["Transfer approved plan<br/>and required context"]
    TRANSFER --> EXEC["Executor session<br/>Configured tool permissions"]
    EXEC --> VERIFY["Run checks and compare with plan"]
    VERIFY --> REPORT["Report results and evidence limits"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click DOCS href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
    click PLANNER href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
    click PLAN href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
    click REVIEW href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
    click TRANSFER href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
    click EXEC href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
    click VERIFY href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
    click REPORT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/dual-instance-planning.md" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
Supplied documents → planner
                     (explicit no-tools configuration,
                      or restricted Plan mode for exploration)
                   → plan → human review
                            ├─ Revise → planner
                            └─ Approve → transfer plan + required context
                                       → executor with configured tools
                                       → checks + result report

Two sessions alone do not enforce tool restrictions or transfer context.
```

</details>

> **Source**: [Guide: шаблон планирования с двумя экземплярами](../workflows/dual-instance-planning.md); [Режим разрешений плана](https://code.claude.com/docs/en/permissions), [Ограничения на дополнительные инструменты](https://code.claude.com/docs/en/sub-agents)

---

### Шаблон горизонтального масштабирования

Распараллельте независимую работу с явным владением файлом, а затем измерьте результат после координации и интеграции. Большее количество экземпляров не гарантирует пропорционального ускорения; затраты и зависимости могут перевесить выгоду. Прежде чем делать заявления о производительности, измерьте ускорение и стоимость рабочей нагрузки.

```mermaid
flowchart TD
    TASK["Large task"] --> SPLIT["Identify independent subtasks<br/>and file ownership"]
    SPLIT --> A["Worker A<br/>Owned files and criteria"]
    SPLIT --> B["Worker B<br/>Owned files and criteria"]
    SPLIT --> C["Worker C<br/>Owned files and criteria"]
    A --> AGG["Aggregate outputs and evidence"]
    B --> AGG
    C --> AGG
    AGG --> REVIEW["Resolve dependencies/conflicts<br/>and run integration checks"]
    REVIEW --> MEASURE["Measure elapsed benefit and token cost<br/>for this workload"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click TASK href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click SPLIT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click AGG href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click REVIEW href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click MEASURE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
Large task → independent subtasks with explicit ownership
            → parallel workers A / B / C
            → aggregate evidence
            → resolve dependencies and conflicts
            → integration checks
            → measure elapsed benefit and token cost

No guaranteed multiplier; coordination reduces gains.
```

</details>

> **Source**: [Guide: Шаблон горизонтального масштабирования](../ultimate-guide.md#917-scaling-patterns-multi-instance-workflows); [Размер команды, стоимость и убывающая прибыль](https://code.claude.com/docs/en/agent-teams)

---

### <a name="multi-instance-decision-matrix"></a>Матрица решений для нескольких экземпляров

Прежде чем выбирать количество рабочих, выберите зависимости, потребности в общении и изоляции. Собственный инструмент делегирования — Агент; Задача была ее прежним названием и остается псевдонимом совместимости в настройках и определениях. Для использования субагентов не требуется наличие четырех экземпляров.

```mermaid
flowchart TD
    TASK["Task to complete"] --> INDEP{"Independent work worth delegating?"}
    INDEP -->|No| SINGLE["Single session<br/>Plan and execute stages as needed"]
    INDEP -->|Yes| COMM{"Workers need discussion<br/>and shared coordination?"}
    COMM -->|No| SUB["Agent tool<br/>Focused subagents return results<br/>Former name: Task"]
    COMM -->|Yes| TEAM["Experimental Agent Teams<br/>Lead + communicating teammates"]
    SUB --> EDIT{"Concurrent file edits?"}
    TEAM --> EDIT
    EDIT -->|Yes| WT["Separate ownership<br/>Worktrees for checkout isolation"]
    EDIT -->|No| READ["Parallel research or review"]
    WT --> SIZE["Choose size by task independence<br/>cost and coordination"]
    READ --> SIZE
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click TASK href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click INDEP href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click SINGLE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click COMM href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click SUB href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click TEAM href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click EDIT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click WT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click READ href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
    click SIZE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#917-scaling-patterns-multi-instance-workflows" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
Worth delegating independent work?
├─ No → single session, stages as needed
└─ Yes → need peer discussion / shared coordination?
         ├─ No → Agent tool subagents return results
         │       (Task is the historical compatibility alias)
         └─ Yes → experimental Agent Teams
                    │
         Concurrent file edits?
         ├─ Yes → file ownership + separate worktrees
         └─ No → parallel research/review
                    │
         Size by independence, cost and coordination, not a 4+ rule.
```

</details>

> **Source**: [Guide: Матрица решений для нескольких экземпляров](../ultimate-guide.md#917-scaling-patterns-multi-instance-workflows); [Переименование и делегирование инструментов агентов](https://code.claude.com/docs/en/sub-agents), [Команды и субагенты](https://code.claude.com/docs/en/agent-teams)

---

### <a name="cross-session-messaging-discovery--delivery"></a>Межсеансовый обмен сообщениями: обнаружение и доставка

Подходящие независимые сеансы могут обнаруживать одноранговые узлы с помощью ListAgents и отправлять текст с помощью SendMessage. Доставка на одну машину использует локальные сокеты или именованные каналы; Доставка на другие машины и в облако использует инфраструктуру Anthropic. Явное удержание CrossSessionInbound сохраняет сообщения до тех пор, пока соответствующий прием не освободит их. Диалоговые окна утверждения относятся к некоторым настройкам режима разрешений по умолчанию в поддерживаемых терминалах, а не к явной настройке удержания. Доступность зависит от версии, поставщика и требований удаленного управления.

```mermaid
flowchart TD
    SESSIONS["Eligible sessions<br/>Bind inbox and register locally"] --> LIST["ListAgents / list-agents<br/>Reachable peers and agents"]
    LIST --> SEND["SendMessage text<br/>Target identified"]
    SEND --> WHERE{"Target location?"}
    WHERE -->|Same machine| LOCAL["Unix socket / named pipe<br/>Local delivery"]
    WHERE -->|Other machine or cloud| REMOTE["Anthropic infrastructure<br/>Remote Control or cloud session"]
    LOCAL --> SETTING{"Explicit inbound setting?"}
    REMOTE --> SETTING
    SETTING -->|accept| DELIVER["Delivered to receiving Claude"]
    SETTING -->|hold| HOLD["Undelivered<br/>Later applicable accept releases"]
    SETTING -->|refuse| DROP["Dropped"]
    SETTING -->|Unset| DEFAULT["Permission-mode default<br/>Deliver or hold for approval<br/>where dialog is supported"]
    DEFAULT --> DELIVER
    DEFAULT --> WAIT["Approval/default-held queue<br/>Subject to surface and expiry"]
    DELIVER --> BOUND["Recipient permissions still apply<br/>Peer text cannot approve permissions<br/>or authorize config changes"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click SESSIONS href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click LIST href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click SEND href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click WHERE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click LOCAL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click REMOTE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click SETTING href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click DELIVER href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click HOLD href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click DROP href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click DEFAULT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click WAIT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
    click BOUND href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/workflows/cross-session-messaging.md" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
Eligible sessions → registry/inbox → ListAgents → SendMessage
Target location?
├─ Same machine → Unix socket / named pipe, local delivery
└─ Other machine/cloud → Anthropic infrastructure
                               │
Explicit crossSessionInbound?
├─ accept → delivered
├─ hold   → undelivered; later applicable accept releases
├─ refuse → dropped
└─ unset  → mode-dependent default
            ├─ deliver
            └─ approval hold, depending on terminal/surface and expiry

Peer text does not approve permissions or authorize configuration changes.
Version/provider/Remote Control requirements govern availability.
```

</details>

> **Источник**: [Руководство: Межсеансовый обмен сообщениями: обнаружение и доставка](../workflows/cross-session-messaging.md); [Управление обменом сообщениями и доступность](https://code.claude.com/docs/en/cross-session-messaging)
