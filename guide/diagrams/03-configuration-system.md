---
title: "Claude Code: Диаграммы системы конфигурации"
description: "Приоритет управляемых настроек, навыки и команды, субагенты и жизненный цикл перехватчика."
tags: [configuration, hooks, agents, skills, commands]
---

# Система конфигурации

Документированный приоритет настроек и упрощенное представление расширяемости и перехватчиков.

---

### Приоритет конфигурации (5 уровней)

Для одного и того же ключа настроек документированный стек имеет пять уровней, начиная с самого высокого. Списки могут объединяться, и могут применяться исключения, связанные с безопасностью. Приоритет переменных среды определяется для каждой настройки; CLAUDE.md принадлежит контексту инструкций, а не этому стеку настроек.

```mermaid
flowchart TD
    A[1. Managed settings<br/>Organization policy] --> B[2. Command-line arguments<br/>Session flags and --settings]
    B --> C[3. Project local settings<br/>.claude/settings.local.json]
    C --> D[4. Shared project settings<br/>.claude/settings.json]
    D --> E[5. User settings<br/>~/.claude/settings.json]
    E -.-> FALL[Built-in fallback<br/>When no source sets the value]
    ENV[Environment variables<br/>Precedence defined per key] -.-> B
    style A fill:#6DB3F2,color:#222
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#34-precedence-rules" "Precedence rules"
    style B fill:#6DB3F2,color:#222
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#34-precedence-rules" "Precedence rules"
    style C fill:#6DB3F2,color:#222
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#34-precedence-rules" "Precedence rules"
    style D fill:#6DB3F2,color:#222
    click D href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#34-precedence-rules" "Precedence rules"
    style E fill:#6DB3F2,color:#222
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#34-precedence-rules" "Precedence rules"
    style FALL fill:#6DB3F2,color:#222
    click FALL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#34-precedence-rules" "Precedence rules"
    style ENV fill:#6DB3F2,color:#222
    click ENV href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#34-precedence-rules" "Precedence rules"
```

<details>
<summary>ASCII версия</summary>

```
Highest precedence
1. Managed settings
2. Command-line arguments
3. .claude/settings.local.json
4. .claude/settings.json
5. ~/.claude/settings.json
Fallback: built-in value when not configured

Environment variables: resolve per key, not as a universal sixth level.
CLAUDE.md: instructions, outside this settings stack.
Lists can merge; consult documented security-sensitive exceptions.
```

</details>

> **Источник**: [Правила приоритета](../ultimate-guide.md#34-precedence-rules)
>
> **Официальная ссылка**: [Приоритет настроек](https://code.claude.com/docs/en/settings#settings-precedence) и [Приоритет переменной среды](https://code.claude.com/docs/en/env-vars#precedence).
>
> Для выбора модели используется переменная ANTHROPIC_MODEL. CLAUDE_CONFIG_DIR меняет каталог конфигурации. Выбор модели CLI остается ограниченным управляемыми доступными моделями; это не отменяет политику организации.

---

### Навыки, команды и агенты: когда использовать каждый

Пользовательские команды были объединены в навыки. Оба формата файлов создают косую черту; навыки также поддерживают связанные ресурсы и вызов Claude. Субагенты используют отдельное контекстное окно для делегированной работы. Для этих механизмов существуют области действия пользователя и проекта.

```mermaid
flowchart LR
    Q{Need delegated<br/>reasoning context?} -->|Yes| A[Subagent definition<br/>.claude/agents/name.md<br/>Agent tool, own prompt and tools]
    Q -->|No| S[Skill<br/>.claude/skills/name/SKILL.md<br/>Resources and invocation controls]
    C[Compatible command format<br/>.claude/commands/name.md] --> S
    S --> I[Slash command or Claude invocation<br/>As configured]
    A --> R[Summary returns to parent]
    I --> U[User or project scope]
    R --> U
    style Q fill:#6DB3F2,color:#222
    click Q href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#51-understanding-skills" "Understanding skills"
    style A fill:#6DB3F2,color:#222
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#51-understanding-skills" "Understanding skills"
    style S fill:#6DB3F2,color:#222
    click S href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#51-understanding-skills" "Understanding skills"
    style C fill:#6DB3F2,color:#222
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#51-understanding-skills" "Understanding skills"
    style I fill:#6DB3F2,color:#222
    click I href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#51-understanding-skills" "Understanding skills"
    style R fill:#6DB3F2,color:#222
    click R href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#51-understanding-skills" "Understanding skills"
    style U fill:#6DB3F2,color:#222
    click U href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#51-understanding-skills" "Understanding skills"
```

<details>
<summary>ASCII версия</summary>

```
Reusable instructions / workflow:
  .claude/skills/name/SKILL.md -> /name, or Claude invocation as configured
  .claude/commands/name.md    -> compatible /name format
  Both can use user or project scope.

Delegated work:
  .claude/agents/name.md -> Agent tool -> own context, prompt and permitted tools
  Summary returns to parent; file/service effects can be shared.
```

</details>

> **Источник**: [Навыки понимания](../ultimate-guide.md#51-understanding-skills)
>
> **Официальная ссылка**: [Навыки и совместимость команд](https://code.claude.com/docs/en/skills) и [Определения субагентов](https://code.claude.com/docs/en/sub-agents).

---

### Жизненный цикл агента и изоляция области действия

Отдельное контекстное окно позволяет исключить промежуточную активность инструмента из родительского диалога. Он не изолирует эффекты файлов или служб. Обычные субагенты начинают заново; вилки наследуют диалог. Рабочее дерево может разделять изменения репозитория.

```mermaid
sequenceDiagram
    participant P as Parent Claude
    participant A as Agent tool
    participant S as Subagent
    participant FS as Files and services
    P->>A: Delegate task
    alt Ordinary subagent
        A->>S: Task prompt and agent configuration
        Note over S: Fresh conversation context
    else Fork
        A->>S: Copy parent conversation and configuration
    end
    S->>FS: Allowed reads, edits or external calls
    Note over S,FS: Effects may be shared<br/>Optional worktree separates repository edits
    FS->>S: Results
    S->>A: Final summary
    A->>P: Summary enters parent context
```

<details>
<summary>ASCII версия</summary>

```
Parent -> Agent tool -> Subagent
  Ordinary: task prompt + definition; fresh conversation context
  Fork:     inherits parent conversation and configuration
  Tools:    permitted file/service operations; effects may be shared
  Optional worktree: separate repository checkout, not isolated external services
Subagent -> final summary -> parent context
```

</details>

> **Источник**: [Архитектура субагента](../core/architecture.md#4-sub-agent-architecture)
>
> **Официальная ссылка**: [Форки и обычные субагенты](https://code.claude.com/docs/en/sub-agents#how-forks-differ-from-other-subagents).

---

### <a name="hooks-event-pipeline"></a>Конвейер событий перехватчиков

В этом упрощенном жизненном цикле различаются события сеанса, события поворота и события инструмента. PermissionRequest является условным. Типы перехватчиков и элементы управления принятием решений различаются в зависимости от события; это не исчерпывающий список событий.

```mermaid
flowchart TD
    INIT([Session starts]) --> START[SessionStart]
    START --> A[Prompt submitted]
    A --> UPS[UserPromptSubmit]
    UPS -->|Exit 2 or block| REJECT[Prompt blocked<br/>Reason shown to user]
    UPS -->|Proceed| MODEL[Model processes context]
    MODEL --> TOOL{Tool call?}
    TOOL -->|Yes| B[PreToolUse]
    TOOL -->|No, response finished| STOP[Stop]
    B -->|Block| BLOCK[Tool blocked]
    B -->|Proceed| NEED{Permission prompt needed?}
    NEED -->|No, allowed| C[Tool executes]
    NEED -->|Yes| PR[PermissionRequest]
    PR -->|Allowed| C
    PR -->|Denied| BLOCK
    C --> RESULT{Tool succeeded?}
    RESULT -->|Yes| E[PostToolUse]
    RESULT -->|No| FAIL[PostToolUseFailure]
    E --> MODEL
    FAIL --> MODEL
    BLOCK --> MODEL
    STOP --> WAIT[Await next turn or end session]
    WAIT -->|Next prompt| A
    WAIT -->|Session ends| END[SessionEnd]
    INST[InstructionsLoaded<br/>Async when instruction files load] -.-> A
    SS[SubagentStop<br/>When a subagent finishes] -.-> WAIT
    PRE[PreCompact] --> COMPACT[Compaction] --> POST[PostCompact]
    style INIT fill:#6DB3F2,color:#222
    click INIT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style START fill:#6DB3F2,color:#222
    click START href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style A fill:#6DB3F2,color:#222
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style UPS fill:#6DB3F2,color:#222
    click UPS href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style REJECT fill:#6DB3F2,color:#222
    click REJECT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style B fill:#6DB3F2,color:#222
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style BLOCK fill:#6DB3F2,color:#222
    click BLOCK href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style NEED fill:#6DB3F2,color:#222
    click NEED href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style C fill:#6DB3F2,color:#222
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style PR fill:#6DB3F2,color:#222
    click PR href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style RESULT fill:#6DB3F2,color:#222
    click RESULT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style E fill:#6DB3F2,color:#222
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style FAIL fill:#6DB3F2,color:#222
    click FAIL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style MODEL fill:#6DB3F2,color:#222
    click MODEL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style TOOL fill:#6DB3F2,color:#222
    click TOOL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style STOP fill:#6DB3F2,color:#222
    click STOP href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style WAIT fill:#6DB3F2,color:#222
    click WAIT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style END fill:#6DB3F2,color:#222
    click END href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style INST fill:#6DB3F2,color:#222
    click INST href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style SS fill:#6DB3F2,color:#222
    click SS href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style PRE fill:#6DB3F2,color:#222
    click PRE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style COMPACT fill:#6DB3F2,color:#222
    click COMPACT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
    style POST fill:#6DB3F2,color:#222
    click POST href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#71-the-event-system" "The event system"
```

<details>
<summary>ASCII версия</summary>

```
SessionStart -> prompt -> UserPromptSubmit
  blocked (exit 2 / decision): reason shown to user; prompt not processed
  proceed -> model processes context -> tool call?
    no, response finished -> Stop -> next turn or SessionEnd
    yes -> PreToolUse -> permissions check
              blocked -> tool blocked -> model
              prompt needed -> PermissionRequest -> allow / deny
              already allowed -> execute
  tool success -> PostToolUse -> model
  tool failure -> PostToolUseFailure -> model

Separate events: InstructionsLoaded (async), SubagentStop
Compaction: PreCompact -> compaction -> PostCompact
Hook types: command, http, mcp_tool, prompt, agent; support depends on event.
```

</details>

> **Источник**: [Система событий](../ultimate-guide.md#71-the-event-system)
>
> **Официальная ссылка**: [Жизненный цикл и решения хука](https://code.claude.com/docs/en/hooks#hook-lifecycle).
>
> InstructionsLoaded также срабатывает при отложенной загрузке инструкций. Stop — для каждого ответа, SessionEnd — для каждого сеанса; Ошибки API имеют StopFailure. Некоторые специальные инструменты пропускают обычные хуки для инструментов. В официальном справочнике перечислены эти исключения и поддерживаемые типы перехватчиков каждого события.
