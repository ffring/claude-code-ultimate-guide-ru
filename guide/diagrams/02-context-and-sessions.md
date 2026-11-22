---
title: "Claude Code: Диаграммы контекста и сеансов"
description: "Рекомендации по контексту, объемы памяти, собственное возобновление сеанса и целевые сеансы"
tags: [context, sessions, memory, optimization]
---

# Контекст и сессии

Рекомендации по управлению контекстом, постоянные инструкции и непрерывность сеанса.

---

### <a name="context-management-zones"></a>Зоны управления контекстом

Эти четыре ситуации представляют собой рабочий процесс автора для управления контекстом, а не собственными процентными зонами или состояниями разрешений. Claude автоматически управляет контекстом; здесь не утверждается универсальный процент автоуплотнения.

```mermaid
flowchart LR
    G[Focused work<br/>Keep relevant context] --> B[Growing context<br/>Inspect with /context]
    B --> O[Noise or lost focus<br/>Use /compact with a focus]
    O --> R[Task boundary<br/>Resume later or start fresh<br/>with a written handoff]
    style G fill:#6DB3F2,color:#222
    click G href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style B fill:#6DB3F2,color:#222
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style O fill:#6DB3F2,color:#222
    click O href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style R fill:#6DB3F2,color:#222
    click R href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
```

<details>
<summary>ASCII версия</summary>

```
Focused work   -> Growing context    -> Noise or lost focus -> Task boundary
Relevant input    Inspect /context      /compact with focus    Resume or start fresh

Author recommendations, not fixed percentages or reduced tool permissions.
Automatic context management does not guarantee every detail survives.
```

</details>

> **Источник**: [Управление контекстом](../ultimate-guide.md#22-context-management)
>
> **Официальная ссылка**: [Управление контекстом](https://code.claude.com/docs/en/best-practices#manage-context-aggressively) и [автоматическое сжатие](https://code.claude.com/docs/en/how-claude-code-works#when-context-fills-up).

---

### Иерархия памяти (6 типов)

Эта таксономия обучения, состоящая из шести частей, разделяет постоянные инструкции, заученные заметки, историю разговоров и внешнее состояние. Это не шестиуровневый стек переопределения конфигурации. CLAUDE.md и правила формируют контекст; они не обеспечивают соблюдение разрешений инструмента.

```mermaid
flowchart TD
    ROOT[Context and persistence scopes] --> M[1. Organization instructions<br/>Managed CLAUDE.md]
    ROOT --> U[2. User instructions<br/>User CLAUDE.md and rules]
    ROOT --> P[3. Project and nested instructions<br/>CLAUDE.md and scoped rules]
    ROOT --> AM[4. Auto memory<br/>Saved notes for the repository]
    ROOT --> C[5. Conversation history<br/>Saved sessions can be resumed]
    ROOT --> EXT[6. External and tool state<br/>Persistence depends on server or tool]
    U --> SAFE[Preferences and conventions<br/>Keep credentials out of instructions]
    P --> SAFE
    style ROOT fill:#6DB3F2,color:#222
    click ROOT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
    style M fill:#6DB3F2,color:#222
    click M href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
    style U fill:#6DB3F2,color:#222
    click U href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
    style P fill:#6DB3F2,color:#222
    click P href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
    style AM fill:#6DB3F2,color:#222
    click AM href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
    style C fill:#6DB3F2,color:#222
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
    style EXT fill:#6DB3F2,color:#222
    click EXT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
    style SAFE fill:#6DB3F2,color:#222
    click SAFE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "Memory files"
```

<details>
<summary>ASCII версия</summary>

```
1. Organization instructions       managed CLAUDE.md
2. User instructions               user CLAUDE.md and rules
3. Project / nested instructions    CLAUDE.md and scoped rules
4. Auto memory                     saved repository notes
5. Conversation history            saved sessions, resumable
6. External / tool state           persistence depends on implementation

Instruction scopes are not permission enforcement or a strict override stack.
Store preferences and conventions in instructions, not API keys or tokens.
```

</details>

> **Источник**: [Файлы памяти](../ultimate-guide.md#31-memory-files-claudemd)
>
> **Официальная ссылка**: [Файлы инструкций и автоматическая память](https://code.claude.com/docs/en/memory#claude-md-vs-auto-memory), [возобновление сеанса](https://code.claude.com/docs/en/common-workflows#resume-previous-conversations)и [хранилище учетных данных](https://code.claude.com/docs/en/security#additional-safeguards).
>
> Вложенные инструкции и условные правила могут загружаться при доступе к соответствующим файлам. Используйте управляемые настройки, разрешения и перехватчики для обеспечения соблюдения политики.

---

### Непрерывность сеанса: сохранение и возобновление состояния

Claude Code сохраняет разговоры. Повторное открытие терминала может возобновить сохраненный сеанс или начать новый разговор с постоянными инструкциями и дополнительной передачей обслуживания. Передача суммирует прогресс; он не восстанавливает каждое сообщение.

```mermaid
sequenceDiagram
    participant U as User
    participant CC as Claude Code
    participant STORE as Saved conversations
    participant FILE as Handoff file
    CC->>STORE: Save conversation during work
    opt Prepare a fresh session
        U->>CC: Write status, decisions and next steps
        CC->>FILE: Save handoff summary
    end
    Note over U: Open another terminal
    alt Continue saved conversation
        U->>CC: claude --continue or claude --resume
        CC->>STORE: Load selected conversation
        STORE->>CC: Saved history
    else Start fresh
        U->>CC: claude, then read handoff if needed
        Note over CC: Load persistent instructions and available memory
        CC->>FILE: Read handoff when requested
        FILE->>CC: Summary, not full history
    end
```

<details>
<summary>ASCII версия</summary>

```
Work -> conversation saved
  |
  +-> claude --continue / claude --resume -> saved conversation resumes
  |
  +-> write handoff -> start claude fresh -> read handoff summary
      Fresh session also loads persistent instructions and available memory.
      The summary is not the full conversation history.
```

</details>

> **Источник**: [Продолжение и возобновление сеанса](../ultimate-guide.md#session-continuation-and-resume)
>
> **Официальная ссылка**: [Возобновить сохраненные разговоры](https://code.claude.com/docs/en/common-workflows#resume-previous-conversations).

---

### Антипаттерн из свежего контекста против лучшей практики

Несвязанные задачи могут заполнить сеанс нерелевантной историей. Автор рекомендует работать целенаправленными сеансами, использовать уплотнение, когда это полезно, и сохранять передачу, прежде чем начинать все заново. Сохраненные разговоры остаются доступными для возобновления.

```mermaid
flowchart TD
    subgraph BAD[Unfocused session]
        B1[Task A] --> B2[Unrelated task B]
        B2 --> B3[Unrelated task C]
        B3 --> B4[More irrelevant context<br/>Harder to retain instructions]
    end
    subgraph GOOD[Focused workflow]
        G1[Work on task A] --> G2{Natural checkpoint?}
        G2 -->|Yes| G3[Save handoff or resume later]
        G3 --> G4[Fresh session for unrelated task B]
        G2 -->|No| G5{Context needs cleanup?}
        G5 -->|Yes| G6["/compact with a focus"]
        G6 --> G1
        G5 -->|No| G1
    end
    style B1 fill:#6DB3F2,color:#222
    click B1 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style B2 fill:#6DB3F2,color:#222
    click B2 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style B3 fill:#6DB3F2,color:#222
    click B3 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style B4 fill:#6DB3F2,color:#222
    click B4 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style G1 fill:#6DB3F2,color:#222
    click G1 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style G2 fill:#6DB3F2,color:#222
    click G2 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style G3 fill:#6DB3F2,color:#222
    click G3 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style G4 fill:#6DB3F2,color:#222
    click G4 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style G5 fill:#6DB3F2,color:#222
    click G5 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
    style G6 fill:#6DB3F2,color:#222
    click G6 href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#22-context-management" "Context management"
```

<details>
<summary>ASCII версия</summary>

```
Unfocused: Task A -> unrelated B -> unrelated C -> irrelevant context accumulates
Focused:   Task A -> checkpoint -> handoff or resume later -> fresh session for B
                   no checkpoint -> inspect context -> /compact if useful -> continue

Starting fresh does not erase the saved conversation.
No fixed percentage guarantees response quality.
```

</details>

> **Источник**: [Управление контекстом](../ultimate-guide.md#22-context-management)
>
> **Официальная ссылка**: [Контекстные рекомендации](https://code.claude.com/docs/en/best-practices#manage-context-aggressively).
