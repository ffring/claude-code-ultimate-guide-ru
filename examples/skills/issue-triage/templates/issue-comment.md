# Выпуск шаблонов комментариев

Используйте эти шаблоны для создания комментариев к проблемам GitHub на этапе `/issue-triage` 3. Комментарии публикуются на языке **English** (международная аудитория).

---

## Шаблон 1 — запрос подтверждения/информации

Используйте, когда: проблема `Unclear` или `needs-info`, в тексте отсутствует контекст, отсутствуют шаги воспроизведения.

```markdown
Thanks for opening this issue!

To help us investigate, could you provide the following?

- **Steps to reproduce**: A minimal sequence of actions that triggers the behavior
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, version, relevant config (if applicable)

Once we have this information, we can prioritize and route the issue appropriately.

---
*Triaged via Claude Code /issue-triage*
```

---

## Шаблон 2 — дубликат

Используйте, когда: сходство Жаккара >= 60 % с существующей открытой или недавно закрытой проблемой.

```markdown
Thanks for reporting this! After reviewing the backlog, this appears to be a duplicate of #{original_number}.

{original_number} is tracking the same underlying behavior: {one-sentence description of original}.

I'm closing this issue to consolidate discussion there. If you believe this is a distinct issue with different root cause or scope, please reopen with additional context explaining the difference.

---
*Triaged via Claude Code /issue-triage*
```

---

## Шаблон 3 — закрыть устаревший

Используйте, когда: по проблеме не было активности в течение > 90 дней и нет правопреемника, или нет ответа на предыдущий запрос информации в течение > 30 дней.

```markdown
This issue has been inactive for {days} days without updates or response.

We're closing it to keep the backlog actionable. If this is still relevant to you, please reopen and provide:

- Current status: is this still reproducible?
- Any additional context or workarounds you've found

We're happy to pick this back up if it's still blocking you.

---
*Triaged via Claude Code /issue-triage*
```

---

## Шаблон 4 – закрытие границ

Используйте, когда: проблема описывает функциональность, явно выходящую за рамки заявленного объема проекта.

```markdown
Thanks for the suggestion! After review, this falls outside the current scope of this project.

{Briefly explain why — e.g., "This project focuses on X; Y is handled by Z" or "This would require changes to the underlying architecture that are not planned."}

You might find what you're looking for in:
- {alternative project or tool if known}
- {documentation link if relevant}

Feel free to open a discussion if you'd like to explore this further.

---
*Triaged via Claude Code /issue-triage*
```

---

## Правила форматирования

**Tone**: Профессионально, прямо, уважительно. Репортер потратил время на изложение проблемы.

**Rules**:
- Никогда не намекайте, что репортер ошибается или зря тратит время.
- Будьте конкретны при упоминании дубликатов (название + номер, а не только номер).
- Для закрытия устаревшего: всегда приглашайте на повторное открытие — не создавайте впечатление, что это навсегда.
- Для ООС: предложите альтернативу, если это возможно, даже если она расплывчата.
- Никаких превосходных степеней («отличный выпуск», «потрясающий отчет») — только факты.

**Точки настройки** (заменить во всех шаблонах):
- `{original_number}`: номер выпуска канонического дубликата.
- `{one-sentence description}`: краткое содержание оригинального выпуска.
- `{days}`: количество дней с момента последней активности (начиная с `updatedAt`)
- Встроенные пояснения, отмеченные `{...}`: всегда заполняются перед публикацией.

**Подпись** (обязательно для всех комментариев):
```
*Triaged via Claude Code /issue-triage*
```
