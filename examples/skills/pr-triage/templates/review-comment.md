# Обзор шаблона комментария

Используйте этот шаблон для создания комментариев к PR-обзору GitHub. Заполните каждый раздел на основе выходных данных агента проверки кода. Комментарии публикуются на языке **English** (международная аудитория).

---

## Шаблон

```markdown
## Review

**Scope**: Security, code quality, performance, test coverage, architecture

### Summary

{1–2 sentences: overall assessment. Be direct — what's the main takeaway?}

### Critical Issues

{List blocking issues that must be fixed before merge. For each:}
{- `file:42` — Description of the problem. Why it matters. Suggested fix.}

{If none: "None found."}

### Important Issues

{List significant issues that should be fixed. For each:}
{- `file:42` — Description. Why it matters. Suggested fix.}

{If none: "None found."}

### Suggestions

{List nice-to-haves and minor improvements. For each:}
{- Description. Context. Optional fix.}

{If none: omit this section.}

### What's Good

{Always include at least 1 positive point. Be specific — what works well and why.}
{- Description of what's done right.}

---
*Automated review via Claude Code `/pr-triage` — add your project-specific checks in SKILL.md*
```

---

## Правила форматирования

**Формат цитирования**: `file:42` или `` `фрагмент кода` `` для встроенных ссылок

**Серьезность проблемы**:
- Критично: уязвимость безопасности, риск потери данных, нарушенная функциональность, отсутствие проверки новой функции.
- Важно: пробел в обработке ошибок, снижение производительности, расширение объема, отсутствие проверки.
- Предложение: название, возможность DRY, документация, стиль.

**Tone**: Профессиональный, конструктивный, основанный на фактах. Бросьте вызов коду, а не человеку.
Никаких превосходных степеней («отлично», «потрясающе», «идеально»). Никакого наполнителя («как уже упоминалось», «стоит отметить»).

**Length**: стремитесь к 200–400 словам. Достаточно длинное, чтобы быть полезным, и достаточно короткое, чтобы его можно было прочитать.
