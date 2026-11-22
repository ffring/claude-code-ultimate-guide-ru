---
title: "Claude Code: Диаграммы управления предприятием"
description: "Предлагаемые уровни риска, средства контроля утверждения MCP, политики данных организации, атрибуция ИИ посредством переписывания истории"
tags: [security, enterprise, governance, compliance, mcp]
---

# Управление предприятием

На этих диаграммах предлагаются организационные политики для Claude Code. Адаптируйте их к фактическим данным, действиям, развернутым средствам управления и договорным обязательствам. Они не устанавливают соответствие или сертификацию.

---

### <a name="governance-risk-tiers-what-to-control-and-when"></a>Уровни управленческого риска: что контролировать и когда

Выберите элементы управления по эффектам и чувствительности работы, а затем убедитесь, что политика достигает соответствующего сеанса. Четыре уровня представляют собой предлагаемые организационные модели, а не уровни продуктов Anthropic или нормативные сертификаты.

```mermaid
flowchart TD
    A([Assess data, actions and environment]) --> B{Work context?}
    B -->|Personal isolated work| C[Starter proposal<br/>Scoped access and relevant verification]
    B -->|Shared team repository| D[Team proposal<br/>Shared conventions, review gates<br/>and approved MCP configuration]
    B -->|Production or sensitive effects| E[Strict proposal<br/>Managed permissions and sandbox controls<br/>Approval and audit evidence]
    B -->|Regulated work| F[Regulated proposal<br/>Applicable obligations and contract review<br/>Validated technical controls]
    C --> G[Verify the applicable controls]
    D --> G
    E --> G
    F --> G
    H[Managed sessions can constrain permissions,<br/>models, login and MCP<br/>Unmanaged devices/accounts need a separate boundary] -.-> B
    G --> I([Assess the evidence before expanding use])

    classDef diagramNode fill:#F5E6D3,color:#333,stroke:#A64B00
    class A,B,C,D,E,F,G,H,I diagramNode
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click D href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click F href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click G href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click H href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
    click I href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#1-local-vs-shared-the-governance-split" "View in guide"
```

<details>
<summary>ASCII версия</summary>

```text
Personal isolated work -> scoped access + relevant verification
Shared team repository -> shared conventions + review/MCP controls
Production/sensitive effects -> managed permissions + sandbox + approvals
Regulated work -> obligations/contracts + validated controls
    -> verify actual deployment and effects before expanding use

Managed sessions can constrain permissions, models, login and MCP
Unmanaged devices/accounts are outside that deployment's boundary
These are proposed policies; no setup duration or compliance is guaranteed
```

</details>

> **Источник**: [Разделение управления](../security/enterprise-governance.md#1-local-vs-shared-the-governance-split)

> Политики организации могут ограничивать сеансы с помощью управляемых параметров, списков разрешенных моделей и ограничений входа в систему. Применимость зависит от развертывания и поверхности; соглашение о репозитории само по себе не является доказательством принудительного исполнения. [Управляемые настройки](https://code.claude.com/docs/en/managed-settings), [Приоритет настроек](https://code.claude.com/docs/en/settings#settings-precedence).


---

### <a name="mcp-governance-workflow"></a>Рабочий процесс управления MCP

Рассматривайте реестр как бухгалтерский учет организации, а развернутую конфигурацию MCP — как отдельный элемент управления. Проверьте целостность источника, разрешения, места назначения данных и рекомендации; популярность или версия исправления не доказывают безопасность сервера.

```mermaid
sequenceDiagram
    participant DEV as Developer
    participant SEC as Reviewer and Security
    participant REG as Organization MCP registry
    participant CFG as MCP config and managed policy
    DEV->>SEC: Request server, source/version, use case and data scope
    SEC->>SEC: Review integrity, permissions, destinations and advisories
    alt Unacceptable risk or missing required evidence
        SEC->>DEV: Refuse or request evidence, record reason
    else Acceptable within approved scope
        SEC->>SEC: Test in an isolated environment if required
        SEC->>REG: Record exact version, restrictions and review criteria
        REG->>CFG: Deploy .mcp.json and applicable managed restrictions
        CFG->>SEC: Verify effective policy and server behavior
        SEC->>REG: Record deployment evidence or stop if checks fail
    end
    loop On a version, permission, destination or advisory change
        SEC->>SEC: Review relevant change and replay required checks
        SEC->>REG: Renew approval, restrict or revoke
    end
```

<details>
<summary>ASCII версия</summary>

```text
Request: source/version, use case, data scope
  -> review integrity, permissions, destinations, advisories
  -> unacceptable risk or missing evidence? Refuse/request evidence
  -> acceptable scope? Test in isolation when required
  -> registry: version, restrictions, review criteria
  -> deploy .mcp.json + applicable managed restrictions
  -> verify effective policy and server behavior; stop on failed checks

Change/advisory -> review relevant delta -> verify -> renew/restrict/revoke
No automatic approval merely because the version increment is a patch
```

</details>

> **Источник**: [MCP Рабочий процесс управления](../security/enterprise-governance.md#3-mcp-governance-workflow)

> Серверы проекта определены в `.mcp.json`. Ограничения, налагаемые организацией, требуют управляемой конфигурации MCP или управляемых настроек; фиксация общей конфигурации сама по себе не запрещает локальные переопределения. Реестр организации не является собственным форматом конфигурации Claude Code. [Объем проекта MCP](https://code.claude.com/docs/en/mcp#project-scope), [Управляемая конфигурация MCP](https://code.claude.com/docs/en/mcp#managed-mcp-configuration).

> Частота пересмотра, истечение срока действия и требования к пробному периоду определяются решениями организации. Установите их на основе фактического риска и измените триггеры; не подразумевается фиксированная продолжительность рассмотрения или универсальный интервал утверждения.


---

### <a name="data-classification--claude-code-access-rules"></a>Классификация данных и правила доступа Claude Code

Это пример политики классификации организации. Утвердите маршрут обработки и протестируйте средства контроля доступа к фактическим данным и интеграции. Общедоступный контент по-прежнему требует разрешения на действие и может содержать вредоносные инструкции.

```mermaid
flowchart LR
    A[PUBLIC<br/>Public code and documentation] --> B[Policy: permitted within action permissions]
    C[INTERNAL<br/>Non-sensitive organization material] --> D[Policy: organization-approved route and controls]
    E[CONFIDENTIAL<br/>Business secrets and private IP] --> F[Policy: verify contracts, retention,<br/>provider and integration controls]
    G[RESTRICTED<br/>Customer PII, regulated data or credentials] --> H[Example policy: prohibit in AI context<br/>Enforce and test boundaries]
    I[Permissions plus OS sandbox and MCP review<br/>A Read rule alone does not prove no disclosure] -.-> H

    classDef diagramNode fill:#F5E6D3,color:#333,stroke:#A64B00
    class A,B,C,D,E,F,G,H,I diagramNode
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click D href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click F href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click G href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click H href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
    click I href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/security/enterprise-governance.md#2-ai-usage-charter" "View in guide"
```

<details>
<summary>ASCII версия</summary>

```text
Example organization policy:
  PUBLIC -> permitted within action permissions
  INTERNAL -> approved processing route and controls
  CONFIDENTIAL -> verify contracts, retention, provider and integrations
  RESTRICTED -> prohibited in AI context under this example policy
      -> enforce and test file, shell, network and MCP boundaries

Separate deny examples: Read(./.env), Read(./secrets/**)
Read rules alone do not prove that restricted data cannot enter context
```

</details>

> **Источник**: Устав использования [AI](../security/enterprise-governance.md#2-ai-usage-charter)

> ZDR для Claude Code на предприятии требует определенных прав и возможностей; он не распространяется на сторонние инструменты или службы MCP. По умолчанию коммерческое обучение, удержание и утверждение организационной обработки — это отдельные вопросы. Область действия [ZDR](https://code.claude.com/docs/en/zero-data-retention#what-zdr-does-not-cover), [Политики данных](https://code.claude.com/docs/en/data-usage#data-policies).

> Разрешения и песочница являются взаимодополняющими элементами управления. Используйте отдельные правила для отдельных шаблонов файлов, проверяйте доступ к оболочке и интеграции, а также тестируйте как разрешенные, так и заблокированные сценарии. Ни инструкция, ни одно правило `Read` не доказывают полного ограничения данных. [Синтаксис разрешений](https://code.claude.com/docs/en/permissions#permission-rule-syntax), [Разрешения и песочница](https://code.claude.com/docs/en/permissions#how-permissions-interact-with-sandboxing).

---

### <a name="ai-attribution-through-history-rewrites"></a>Атрибуция ИИ через переписывание истории

Там, где атрибуция ИИ, хранящаяся в заметках git, сохраняется, по данным локального теста git-ai 1.7.7 и простых заметок git 2.56.0 для этого руководства. Кнопка слияния Forge перезаписывает историю на сервере вне обоих механизмов; этот путь не был проверен.

```mermaid
flowchart TD
    A([Agent writes code]) --> B[git-ai checkpoint<br/>from agent hooks]
    B --> C[Commit: note on refs/notes/ai<br/>line ranges per agent session]
    C --> D{Local rewrite?}
    D -->|amend, rebase,<br/>merge --squash| E[git-ai daemon reads trace2<br/>and moves the note: held in test]
    D -->|plain git notes with<br/>notes.rewriteRef| F[amend and rebase held<br/>squash merge lost the note]
    E --> G[git push origin refs/notes/ai<br/>notes are not pushed by default]
    F --> G
    G --> H{Squash or rebase<br/>by the forge merge button?}
    H -->|Yes| I[Server-side rewrite<br/>check the tool's CI handling: not tested]
    H -->|No| J([Reviewers and CI read the notes])
    I --> J

    classDef diagramNode fill:#F5E6D3,color:#333,stroke:#A64B00
    class A,B,C,D,E,F,G,H,I,J diagramNode
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click D href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click F href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click G href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click H href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click I href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
    click J href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ops/ai-traceability.md#35-provenance-in-git-notes" "View in guide"
```

<details>
<summary>ASCII версия</summary>

```text
Agent writes code -> git-ai checkpoint -> commit with a note on refs/notes/ai
Local rewrite:
  git-ai daemon (trace2)       amend, rebase, merge --squash: note held in test
  plain git + notes.rewriteRef amend, rebase held; squash merge lost the note
Push notes explicitly: git push origin refs/notes/ai
Forge merge button squash or rebase: server-side, check the tool's CI handling (not tested)
```

</details>

> **Источник**: [Происхождение в примечаниях git](../ops/ai-traceability.md#35-provenance-in-git-notes) и оценка [git-ai](../../docs/resource-evaluations/git-ai-provenance-notes.md)
