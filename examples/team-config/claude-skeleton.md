# Инструкции ИИ: {{DEVELOPER_NAME}}
<!-- Generated: {{GENERATED_DATE}} | OS: {{OS}} | Tool: {{TOOL}} -->
<!-- DO NOT EDIT MANUALLY — auto-generated from profile + modules -->
<!-- To update: edit profiles/{{DEVELOPER_SLUG}}.yaml or modules/, then run: -->
<!-- npx ts-node sync-ai-instructions.ts {{DEVELOPER_SLUG}} -->

---

## Контекст проекта

{{MODULE:core-standards}}

---

## <a name="git-workflow"></a>Рабочий процесс Git

{{MODULE:git-workflow}}

---

## Тестирование

{{MODULE:test-conventions}}

---

{{#if typescript}}
## Правила TypeScript

{{MODULE:typescript-rules}}

---
{{/if}}

{{#if python}}
## Правила Python

{{MODULE:python-rules}}

---
{{/if}}

## Окружающая среда и пути

{{МОДУЛЬ:{{OS}}-пути}}

---

{{#if cursor}}
## Инструкции для курсора

{{MODULE:cursor-rules}}

---
{{/if}}

{{#if windsurf}}
## Инструкции по виндсерфингу

{{MODULE:windsurf-rules}}

---
{{/if}}

## Стиль общения

{{#if verbose}}
Дайте подробное объяснение каждому решению. Показать рассмотренные альтернативы. Включите рассуждения.
{{/if}}
{{#if concise}}
Будьте кратки. Одно предложение на каждый пункт. Пропускайте очевидные детали.
{{/if}}
{{#if terse}}
Минимальный выход. Кодируйте только тогда, когда это возможно. Никаких объяснений, если не спросить.
{{/if}}
