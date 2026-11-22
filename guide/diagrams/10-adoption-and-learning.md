---
title: "Claude Code: Диаграммы внедрения и обучения"
description: "Пути адаптации, предлагаемая практика понимания UVAL, калибровка доверия, проверка одобрения изменений агента"
tags: [adoption, learning, onboarding, teams, trust]
---

# Принятие и обучение

Примите Claude Code посредством поставленных задач, соответствующей проверки и явных проверок человеческого понимания. Повышение уровня обучения и производительности требует свидетельств со стороны людей и участвующих задач.

---

### <a name="onboarding-adaptive-learning-paths"></a>Адаптивные траектории обучения

Выберите стартовый путь, исходя из обязанностей и имеющихся навыков. Прогресс, когда наблюдаемые критерии удовлетворяются; фиксированная продолжительность обучения или внедрения в команду не подразумевается.

```mermaid
flowchart TD
    A([New to Claude Code]) --> B{Your responsibilities?}
    B -->|Developer| C[First scoped task]
    C --> D[Practice a workflow with relevant verification]
    D --> E[Add agents, hooks or MCP when the task needs them]
    E --> F([Explain and verify the change; recover safely])
    B -->|Non-technical user| G[Learn concepts and access boundaries]
    G --> H[Practice reversible edits and explanations]
    H --> I[Use a scope appropriate to skills and permissions]
    I --> J([Explain the result and respect access boundaries])
    B -->|Team lead| K[Define acceptance criteria and a cost baseline]
    K --> L[Share concise conventions and controls]
    L --> M[Run a small pilot and collect evidence]
    M --> N[Review quality, rework, cost and feedback]
    N --> O([Expand only when pilot criteria pass])

    classDef diagramNode fill:#F5E6D3,color:#333,stroke:#A64B00
    class A,B,C,D,E,F,G,H,I,J,K,L,M,N,O diagramNode
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click D href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#41-what-are-agents" "View in guide"
    click F href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click G href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click H href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click I href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click J href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click K href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click L href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#31-memory-files-claudemd" "View in guide"
    click M href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click N href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
    click O href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer" "View in guide"
```

<details>
<summary>ASCII версия</summary>

```text
Developer:
  Scoped task -> verified workflow -> add needed capabilities
  Gate: explain/verify the change and recover safely

Non-technical user:
  Concepts/access boundaries -> reversible practice -> suitable scope
  Gate: explain the result and respect access boundaries

Team lead:
  Acceptance/cost baseline -> shared conventions -> small pilot
  Gate: review quality, rework, cost and feedback before expansion
```

</details>

> **Источник**: [Подходы к внедрению](../roles/adoption-approaches.md#start--build--scale-a-practical-navigation-layer)

> Это предлагаемые пути, а не измеренные сроки завершения. В официальном кратком руководстве рассказывается об установке, поддерживаемых учетных записях и первых задачах; организация должна оценить результаты своего пилотного проекта. [Официальный краткий старт](https://code.claude.com/docs/en/quickstart).


---

### Протокол обучения UVAL

UVAL — это предлагаемая практика проверки понимания во время работы с помощью ИИ. Он не устанавливает преимущества удержания и не заменяет политику принятия изменений.

```mermaid
flowchart LR
    U[U: Understand First<br/>State the problem and identify gaps] --> V
    V[V: Verify<br/>Check explanation and prediction against evidence] --> A
    A[A: Apply<br/>Test a requirement or diagnose a defect] --> L
    L[L: Learn<br/>Record an insight] --> N{Assess later recall or transfer}
    N -->|Needs more practice| U
    N -->|Assessment recorded| R([Keep evidence; do not assume internalization])

    classDef diagramNode fill:#F5E6D3,color:#333,stroke:#A64B00
    class U,V,A,L,N,R diagramNode
    click U href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#the-uval-protocol" "View in guide"
    click V href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#the-uval-protocol" "View in guide"
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#the-uval-protocol" "View in guide"
    click L href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#the-uval-protocol" "View in guide"
    click N href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#the-uval-protocol" "View in guide"
    click R href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#the-uval-protocol" "View in guide"
```

<details>
<summary>ASCII версия</summary>

```text
UNDERSTAND -> VERIFY -> APPLY -> LEARN
U: State the problem and identify knowledge gaps
V: Check explanation and prediction against evidence
A: Test a requirement or diagnose a defect; adapt when needed
L: Record an insight

Assess later recall/transfer -> practice further or record the result
Retention benefit remains to be evaluated
```

</details>

> **Источник**: [Протокол UVAL](../roles/learning-with-ai.md#the-uval-protocol)


---

### Доверительная калибровочная матрица

Прежде чем принять результат, оцените конфиденциальность данных, безопасность и внешние эффекты. Тесты и откат устанавливают только проверенную область действия; Возврат Git не может отменить раскрытие данных или любое внешнее действие.

```mermaid
flowchart TD
    A([Claude proposes output or an action]) --> B{Sensitive data, security<br/>or external effect?}
    B -->|Yes| C[Qualified review and relevant authorization]
    C --> D{Can the behavior be verified?}
    B -->|No| D
    D -->|Yes| E[Run checks that cover the required behavior]
    E --> F{Evidence meets acceptance criteria?}
    F -->|No| G[Fix, narrow scope or stop]
    F -->|Yes| H{Effects and recovery understood?}
    D -->|No| I[Review with a domain expert<br/>or find another verification method]
    I --> F
    H -->|No| I
    H -->|Yes| J([Accept only within the verified scope])
    K[Claude explanations are hypotheses<br/>check against independent evidence] -.-> I

    classDef diagramNode fill:#F5E6D3,color:#333,stroke:#A64B00
    class A,B,C,D,E,F,G,H,I,J,K diagramNode
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click D href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click F href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click G href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click H href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click I href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click J href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
    click K href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify" "View in guide"
```

<details>
<summary>ASCII версия</summary>

```text
Sensitive data/security/external effect?
  Yes -> qualified review and relevant authorization
  No -> continue to verification
      |
Can behavior be verified?
  Yes -> run relevant checks
  No -> domain review or another verification method
      |
Evidence meets acceptance criteria?
  No -> fix, narrow scope or stop
  Yes -> understand effects and recovery
      -> accept only within the verified scope

An explanation is a hypothesis; Git rollback does not undo disclosure
```

</details>

> **Источник**: [Доверительная калибровка](../ultimate-guide.md#17-trust-calibration-when-and-how-much-to-verify)

> Рецензент продолжает нести ответственность за безопасность предлагаемого кода и команд. Требования к проверке зависят от действия и его последствий. [Anthropic Руководство по безопасности](https://code.claude.com/docs/en/security#user-responsibility).

---

### <a name="approve-only-what-you-can-explain"></a>Одобряйте только то, что можете объяснить

Персональная проверка перед утверждением смены агента. Это практика оценки в вашей команде, а не взвешенное вмешательство. Объяснение агента — это требование сверки с кодом и доказательствами, а не доказательство само по себе.

```mermaid
flowchart TD
    A([Agent change ready for approval]) --> B{Can you explain its intent<br/>in your own words?}
    B -->|No| Q[Ask a question<br/>do not approve yet]
    B -->|Yes| C{Can you name its main risk<br/>and what it could break?}
    C -->|No| Q
    C -->|Yes| D{Does evidence you checked<br/>cover that risk?}
    D -->|No| E[Request a change<br/>or run the missing check]
    D -->|Yes| F([Approve within the checked scope])
    Q --> B
    G[Repeatedly tapping yes, continue<br/>is a warning sign] -.-> B
    K[Agent explanation is a claim<br/>check it against code and evidence] -.-> D

    classDef diagramNode fill:#F5E6D3,color:#333,stroke:#A64B00
    class A,B,C,D,E,F,G,K,Q diagramNode
    click A href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click B href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click C href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click D href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click E href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click F href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click G href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click K href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
    click Q href "https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode" "View in guide"
```

<details>
<summary>ASCII версия</summary>

```text
Agent change ready for approval
  Can you explain its intent in your own words?
    No  -> ask a question, do not approve yet
    Yes -> can you name its main risk and what it could break?
             No  -> ask a question
             Yes -> does evidence you checked cover that risk?
                      No  -> request a change or run the missing check
                      Yes -> approve within the checked scope

Warning sign: repeatedly tapping "yes, continue"
The agent's explanation is a claim, not evidence
```

</details>

> **Источник**: [Просмотр результатов работы машины — это третий режим](../roles/learning-with-ai.md#reviewing-machine-output-is-a-third-mode). Эти три вопроса представляют собой синтез этого руководства, основанный на информации [Resisting Cognitive Surrender](https://knlb.dev/essays/surrender) и [Kaufman и др.](https://arxiv.org/abs/2607.08885), чей результат касается объяснений сгенерированных утверждений; применение его к обоснованию агента является экстраполяцией.
