---
name: handoff-create
description: "Создайте структурированный документ передачи обслуживания из текущего сеанса. Фиксирует область действия, соответствующие файлы с номерами строк, ключевые открытия, завершенную работу, текущий статус, следующие шаги и фрагменты кода. Используйте перед завершением сеанса или передачей работы другому агенту."
argument-hint: "[optional-filename]"
effort: low
disable-model-invocation: true
---

Создайте структурированный документ передачи из нашего текущего разговора и сохраните его в `claudedocs/handoffs/handoff_YYYYMMDD_HHMMSS.md` (или используйте указанное имя файла как `$ARGUMENTS[0]`, если оно указано).

Создайте каталог `claudedocs/handoffs/`, если он не существует.

## Структура документа

Включите именно эти разделы:

```markdown
# Handoff: [Task Name] - [YYYY-MM-DD HH:MM]

## Task

[One sentence: what is being accomplished]

## Scope

[In-scope behavior and exclusions. Include the contract revision, base commit and relevant working-tree state, acceptance criteria, applicable ADRs, blockers, permitted actions, and next owner. Mark unknowns explicitly.]

## Files

[All relevant files touched or needed. Format: `path/to/file:line` when a specific line matters]

- `src/auth/middleware.ts:45` - token validation logic
- `tests/auth.spec.ts` - test suite for this change
- `docs/api.md` - needs update after implementation

## Discoveries

[Key findings and insights from the work so far. Things the next agent needs to know that are not obvious from the code]

- [Discovery 1]
- [Discovery 2]

## Work Done

[Historical completion claims. Append-only: never remove prior entries. Include revisions, checks actually run, and evidence links when available.]

- [x] Task A completed (commit: abc1234)
- [x] Task B completed

## Status

[Last observed state and observation time: what is done, what remains, checks and their scope, blockers. Distinguish ticket state, run state, and acceptance.]

## Next Steps

[Actionable checklist of remaining tasks, in order]

1. [ ] Step 1
2. [ ] Step 2
3. [ ] Step 3

## Code

[Relevant code snippets with context. Focus on the parts a resuming agent needs to understand immediately]

\`\`\`typescript
// Key implementation detail
\`\`\`
```

## Правила

- Не превышайте 600 слов. Агент, возобновляющий чтение, должен иметь возможность загрузить его и продолжить в течение 30 секунд после прочтения.
- Используйте реальные пути и символы; добавляйте `:line` только после проверки записанной версии.
- Сделайте передачу автономной, не копируя исследовательскую стенограмму. Сохраняйте ссылки на источники и отличайте наблюдение от интерпретации.
- Разрешение на передачу записей; он не предоставляет новые разрешения.
- «Работа выполнена» доступна только для добавления. Никогда не удаляйте предыдущие записи.
- Не включайте полный git diff или полное содержимое файла. Включайте только те фрагменты кода, которые не очевидны.

После сохранения подтвердите путь к файлу.
