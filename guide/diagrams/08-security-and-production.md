---
title: "Claude Code: Диаграммы безопасности и производства"
description: "Принудительная защита, границы песочницы, доказательства и ворота выпуска CI"
tags: [security, production, sandbox, ci-cd, defense]
---

# Безопасность и производство

Используйте принудительные границы выполнения и наблюдаемые доказательства при запуске Claude Code в чувствительных средах. Ни одна диаграмма не обеспечивает универсальную безопасность сдерживания или развертывания.

---

### <a name="security-3-layer-defense-model"></a>Трехуровневая модель защиты безопасности

Предотвращение, обнаружение и реагирование снижают различные риски. Установите принудительные разрешения и изоляцию процессов, прежде чем запускать ненадежную работу. CLAUDE.md управляет моделью, но не обеспечивает соблюдение границ безопасности. Для защиты конфиденциальных файлов необходимы правила разрешений файловых инструментов и ограничения операционной системы, а не предполагаемая функция игнорирования файлов. Необходимо настроить журналы и проверить их покрытие. Обход разрешений уместен только в изолированной среде, а не только потому, что задание помечено как CI.

```mermaid
flowchart TD
    THREAT["Untrusted code or content"] --> PREV["Prevention before execution"]
    PREV --> VET["Vet MCP/skills/plugins<br/>review updates and pin versions"]
    PREV --> PERM["Minimal tool permissions<br/>managed deny/ask policies"]
    PREV --> FILES["Protect sensitive files<br/>file-tool denies + OS access restrictions"]
    PREV --> ISOLATE["Isolate whole process when needed<br/>container / VM, limited network"]
    VET --> RUN["Run within configured boundaries"]
    PERM --> RUN
    FILES --> RUN
    ISOLATE --> RUN
    RUN --> DETECT["Detection<br/>hooks + audit collection + alerts<br/>verify logging coverage"]
    DETECT --> INCIDENT{"Suspicious action or exposure?"}
    INCIDENT -->|No| CONTINUE["Continue monitoring<br/>Residual risk remains"]
    INCIDENT -->|Yes| RESP["Response<br/>stop access, preserve evidence<br/>rollback and rotate exposed secrets"]
    RESP --> REVIEW["Investigate exposure<br/>and strengthen controls"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click THREAT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click PREV href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click VET href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click PERM href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click FILES href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click ISOLATE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click RUN href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click DETECT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click INCIDENT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click CONTINUE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click RESP href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
    click REVIEW href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/security-hardening.md" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
PREVENTION (before execution)
  Vet servers and updates; minimal permissions; managed policies
  File-tool denies + OS sensitive-file restrictions
  Whole-process isolation and limited network where needed
                        │
DETECTION
  Configured hooks/log collection/alerts; verify coverage
                        │
Suspicious action or exposure?
├─ No → monitor residual risk
└─ Yes → RESPONSE: stop access, preserve evidence,
                  rollback, rotate exposed secrets, investigate

CLAUDE.md guides behavior; it does not enforce a security boundary.
Bypass only in an isolated environment, not simply any CI job.
```

</details>

> **Источник**: [Руководство: Модель трехуровневой защиты](../security/security-hardening.md); Ограничения соответствия [CLAUDE.md](https://code.claude.com/docs/en/memory), [Разрешения](https://code.claude.com/docs/en/permissions), [MCP безопасность](https://code.claude.com/docs/en/security)

---

### <a name="sandbox-decision-tree"></a>Дерево решений песочницы

Выберите границу, охватывающую процесс, подверженный риску. Собственная песочница оболочки поддерживает macOS (ремни безопасности) и Linux/WSL2 (пузырчатая пленка и socat); родному Windows требуется WSL2 или другая изолирующая среда. Файловые инструменты, локальные серверы MCP и перехватчики работают за пределами изолированной программной среды оболочки. Неизвестные MCP или хуки требуют проверки и, при необходимости, изоляции всего процесса Claude Code. AcceptEdits автоматически одобряет изменения, поэтому он не является более строгой альтернативой разрешениям, предоставляемым вручную. Чтения по умолчанию в собственной песочнице могут включать учетные данные, если это явно не ограничено.

```mermaid
flowchart TD
    START["Choose execution boundary"] --> PROCESS{"Untrusted MCP, hooks<br/>or whole-process access?"}
    PROCESS -->|Yes| WHOLE["Vet first, then isolate whole process<br/>container / VM or dedicated runtime<br/>restrict credentials and network"]
    PROCESS -->|No, shell commands only| PLATFORM{"Platform?"}
    PLATFORM -->|macOS| MAC["Native shell sandbox<br/>Seatbelt, enable via /sandbox"]
    PLATFORM -->|Linux or WSL2| LINUX["Native shell sandbox<br/>bubblewrap + socat dependencies"]
    PLATFORM -->|Native Windows| WIN["Use WSL2, container or VM<br/>no native shell sandbox"]
    MAC --> CONFIG["Restrict filesystem and network<br/>verify actual boundaries"]
    LINUX --> CONFIG
    WIN --> CONFIG
    WHOLE --> CONFIG
    CONFIG --> PERM["Keep appropriate permissions<br/>manual + narrow allowlist when needed<br/>review changes and evidence"]
    PERM --> PROD{"Production or CI environment?"}
    PROD -->|Yes| CI["Ephemeral/isolated execution<br/>limited secrets and deployment gates"]
    PROD -->|No| LOCAL["Apply boundary for project risk<br/>monitor residual exposure"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click START href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click PROCESS href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click WHOLE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click PLATFORM href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click MAC href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click LINUX href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click WIN href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click CONFIG href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click PERM href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click PROD href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click CI href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
    click LOCAL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/sandbox-native.md" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
What needs isolation?
├─ Untrusted MCP/hooks/full process → vet first + whole-process isolation
│                                    restrict secrets and network
└─ Shell commands → native sandbox by platform
   ├─ macOS → Seatbelt, /sandbox
   ├─ Linux/WSL2 → bubblewrap + socat, /sandbox
   └─ Native Windows → WSL2/container/VM
               │
Restrict filesystem/network; verify enforced boundary
Keep appropriate permissions and review changes
├─ Production/CI → isolated execution + limited secrets + release gates
└─ Local project → boundary suited to project risk

Shell sandbox does not contain file tools, MCP servers or hooks.
acceptEdits automatically accepts edits, not stronger pre-edit review.
Credential reads need explicit restrictions.
```

</details>

> **Источник**: [Guide: дерево решений песочницы](../security/sandbox-native.md); [Встроенная область песочницы и платформы](https://code.claude.com/docs/en/sandboxing), [Режимы разрешений](https://code.claude.com/docs/en/permissions)

---

### <a name="the-verification-paradox"></a>Парадокс проверки

Запрос у генератора неподтвержденного мнения не проверяет его работу. Claude может запускать детерминированные тесты и показывать результаты; эти проверки доказывают только то, что они осуществляют. Независимо проверяйте критическое поведение и отличайте проверки кода от готовности к развертыванию и наблюдаемого поведения во время выполнения. Прохождение проверок само по себе не гарантирует безопасного освобождения.

```mermaid
flowchart TD
    CODE["Claude writes code"] --> OPINION["Opinion-only self-review<br/>No runnable evidence"]
    OPINION --> RISK["Defects may remain undetected"]
    CODE --> TEST["Run behavior/regression tests<br/>inspect assertions and output"]
    CODE --> STATIC["Run relevant static/security checks"]
    CODE --> HUMAN["Independent review of critical behavior"]
    TEST --> GATE{"Evidence meets acceptance criteria?"}
    STATIC --> GATE
    HUMAN --> GATE
    GATE -->|No| FIX["Fix and rerun relevant checks"]
    FIX --> TEST
    GATE -->|Yes| RELEASE["Release decision<br/>known evidence scope and residual risks"]
    RELEASE --> RUNTIME["Deployment checks<br/>runtime verification and monitoring"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click CODE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click OPINION href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click RISK href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click TEST href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click STATIC href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click HUMAN href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click GATE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click FIX href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click RELEASE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
    click RUNTIME href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/production-safety.md" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
Opinion only: generated code → "looks good" → defects may remain

Evidence: generated code → behavior tests + relevant static checks
                         → independent review of critical sections
                         → acceptance criteria met?
                           ├─ No → fix and rerun checks
                           └─ Yes → release decision for known scope
                                    → deployment checks
                                    → runtime verification/monitoring

A runnable check executed by Claude is evidence within its coverage.
Passing checks does not guarantee a safe release.
```

</details>

> **Источник**: [Guide: Парадокс проверки](../security/production-safety.md); [Проверка работоспособности и состязательный обзор](https://code.claude.com/docs/en/best-practices)

---

### Конвейер интеграции CI/CD

CI должен запускать анализы, тесты и проверки безопасности как явные задания и использовать их статусы в качестве шлюзов. Claude Code может прочитать эти доказательства и составить рекомендательный обзор в неинтерактивном режиме печати, используя claude -p или --print. Приглашение само по себе не гарантирует параллельное выполнение или надежную агрегацию pass/fail. Явно настройте аутентификацию, разрешения инструментов и выходные данные заданий; обеспечивать соблюдение решений о выпуске посредством CI и проверки человеком, а не на основании мнения агента.

```mermaid
flowchart TD
    PR["PR created or updated"] --> ENV["CI configures isolated runner<br/>auth secret + minimal permissions"]
    ENV --> LINT["CI lint job<br/>record exit status"]
    ENV --> TEST["CI test job<br/>record assertions and exit status"]
    ENV --> SCAN["CI security scan job<br/>record findings and exit status"]
    LINT --> GATE{"Required CI jobs pass?"}
    TEST --> GATE
    SCAN --> GATE
    GATE -->|No| FAIL["Report failing jobs<br/>developer fixes and reruns CI"]
    FAIL --> ENV
    LINT --> EVIDENCE["Collect job evidence"]
    TEST --> EVIDENCE
    SCAN --> EVIDENCE
    EVIDENCE --> CLAUDE["claude -p<br/>Review quality-check evidence"]
    CLAUDE --> REPORT["Advisory agent review<br/>not a replacement for CI status"]
    GATE -->|Yes| HUMAN["Human review and branch rules"]
    REPORT --> HUMAN
    HUMAN --> RELEASE["Merge/release gate<br/>deployment and runtime checks"]
    classDef default fill:#F5E6D3,color:#333,stroke:#E87E2F
    click PR href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click ENV href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click LINT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click TEST href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click SCAN href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click GATE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click FAIL href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click EVIDENCE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click CLAUDE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click REPORT href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click HUMAN href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
    click RELEASE href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#93-cicd-integration" "View this pattern in the guide"
```

<details>
<summary>ASCII версия</summary>

```
PR → isolated CI runner + auth secret + minimal permissions
   → configured jobs (parallel only if CI declares it)
     ├─ Lint → exit status
     ├─ Tests → assertion results + exit status
     └─ Security scan → findings + exit status
           │
           ├─ Required CI jobs pass?
           │  ├─ No → report failure → fix → rerun CI
           │  └─ Yes → human review + branch rules → release gate
           │                                      → runtime checks
           └─ Job evidence → claude -p "Review quality-check evidence"
                           → advisory review for human

CI job status is the gate; an agent's opinion is not that status.
```

</details>

> **Источник**: [Guide: конвейер интеграции CI/CD](../ultimate-guide.md#93-cicd-integration); [Режим печати CLI](https://code.claude.com/docs/en/cli-reference), [Выполняемая проверка](https://code.claude.com/docs/en/best-practices)
