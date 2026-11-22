---
name: review-pr
description: "Выполните комплексную проверку кода запроса на включение"
argument-hint: "[PR_number|URL]"
effort: high
disable-model-invocation: true
---

# Проверить запрос на включение

Выполните комплексную проверку кода запроса на включение.

## Инструкции

1. Получить PR-информацию: `gh pr view $ARGUMENTS --json title,body,files,additions,deletions`
2. Просмотрите каждый измененный файл
3. Предоставляйте структурированную обратную связь

## Контрольный список проверки

### Качество кода
- [ ] Код читаем и хорошо организован.
- [ ] Функции имеют соответствующий размер
- [ ] Никакого дублирования кода
- [ ] Значимые имена variable/function

### Функциональность
- [ ] Логика верна
- [ ] Краевые случаи обработаны
- [ ] Обработка ошибок является комплексной
- [ ] Нет явных ошибок

### Безопасность
- [ ] Никаких жестко запрограммированных секретов
- [ ] Проверка ввода присутствует
- [ ] Отсутствие уязвимостей для инъекций
- [ ] Наличие проверок авторизации

### Тестирование
- [ ] Добавлены тесты для нового кода
- [ ] Существующие тесты все еще проходят
- [ ] Краевые случаи протестированы

### Документация
- [ ] Код самодокументируется или комментируется.
- [ ] README обновляется при необходимости.
- [ ] Изменения API задокументированы.

## Выходной формат

```markdown
## PR Review: #[number] - [title]

### Summary
[1-2 sentence overview]

### Approval Status
[ ] Approved
[ ] Approved with suggestions
[ ] Changes requested

### Findings

#### Critical (Must Fix)
- [ ] [Issue description] - `file:line`

#### Suggestions (Should Consider)
- [ ] [Improvement] - `file:line`

#### Nitpicks (Optional)
- [ ] [Minor suggestion] - `file:line`

### Positive Highlights
- [What's done well]

### Questions
- [Clarifications needed]
```

## Использование

```
/review-pr 123
/review-pr https://github.com/owner/repo/pull/123
```

---

## Дополнительно: многоагентный просмотр

Для обзоров производственного уровня, требующих специального подхода и мер защиты от галлюцинаций.

### Предполетная проверка

Прежде чем просматривать, проверьте, является ли это дополнительным проходом, чтобы не повторять предложения:

```bash
# Detect if Claude already reviewed this PR
git log --oneline -10 | grep "Co-Authored-By: Claude"
```

В случае обнаружения обратите внимание: «Похоже, это дополнительный этап. Я сосредоточусь на новых проблемах и не буду повторять предыдущие предложения».

### Обнаружение дрейфа прицела

Сопоставьте разницу PR с первоначальным планом, чтобы выявить непреднамеренные изменения.

```bash
# Detect current branch
BRANCH=$(git branch --show-current)

# Search for a plan file associated with this branch
ls ~/.claude/plans/ 2>/dev/null | grep -i "$BRANCH" | head -3

# Files actually changed in this PR
git diff --stat origin/main...HEAD | head -30
```

Если файл плана существует для этой ветви:
1. Прочтите файл плана: каков был заявленный объем?
2. Сравните заявленный объем с фактическим `git diff --stat`
3. Изменены файлы флагов, которые НЕ были упомянуты в плане

Выходной формат:
```
SCOPE DRIFT CHECK
─────────────────────────────────────────
Plan scope:    [what the plan said would change]
Actual diff:   [files actually changed]
Drift:         [files changed outside plan scope, if any]
Verdict:       IN SCOPE / DRIFT DETECTED
```

Если файл плана не существует: обратите внимание: «Для этой ветви файл плана не найден, проверка отклонения объема пропускается».

### Мультиагентная специализация

Запустите 3 параллельных специализированных агента (см. [Split Role Sub-Agents](../../../guide/ultimate-guide.md#split-role-sub-agents)):

**Агент 1: Аудитор согласованности**
```
Focus: DRY violations, duplicate logic, pattern inconsistencies
Check for:
- Duplicated code blocks (>5 lines similar)
- Inconsistent naming conventions
- Pattern violations (if project uses X pattern, enforce it)
```

**Агент 2: Аналитик по принципам SOLID**
```
Focus: Single Responsibility Principle violations, complexity
Check for:
- Functions >50 lines (likely doing too much)
- Nested conditionals >3 levels deep
- Cyclomatic complexity >10
- Mixed concerns in single component
```

**Агент 3: Аудитор защитного кода**
```
Focus: Silent failures, masked bugs, hidden fallbacks, LLM output trust boundary
Check for:
- Empty catch blocks: try { } catch (e) { } // swallows error
- Silent fallbacks: return data || DEFAULT // hides missing data
- Unchecked null/undefined: user.name without validation
- Ignored promise rejections: async fn without .catch()

LLM Output Trust Boundary (especially relevant in AI-assisted codebases):
- LLM-generated values (emails, URLs, names, IDs) written to DB or passed to
  downstream functions without format validation; add lightweight guards
  (email regex, URL parsing, .trim()) before persisting
- Structured tool output (arrays, objects from AI tools) accepted without
  type/shape checks before database writes or rendering
- AI-generated SQL or code strings executed without sanitization
```

### <a name="anti-hallucination-rules"></a>Правила борьбы с галлюцинациями

**Проверьте перед утверждением**:
- Используйте `Grep` или `Glob` для проверки шаблонов, прежде чем рекомендовать их.
- Если вы предлагаете «использовать существующий шаблон UserService», сначала подтвердите существование UserService.
- Никогда не заявляйте, что «проект использует X», не проверив реальную кодовую базу.

**Правило возникновения**:
- Шаблон с >10 повторениями = установлен (уровень предложения)
- Шаблон с <3 повторениями = не установлен (можно пропустить или спросить у сопровождающего)
- Чтение полного контекста файла, а не только строк сравнения

**Маркеры неопределенности**:
- Используйте «❓ Чтобы проверить:», если не уверены в соглашениях проекта.
- Используйте «💡 Рассмотреть:» для дополнительных улучшений.
- Используйте «🔴 Необходимо исправить:» только для критического bugs/security.

### Примирение

После того, как агенты сообщают о результатах:

1. **Deduulate**: удаление перекрывающихся предложений между агентами.
2. **Установить приоритет существующих шаблонов**: если в кодовой базе используется шаблон X, рекомендуйте X (не идеальный шаблон Y).
3. **Отметить пропущенные предложения**: «Пропуск [предложения], поскольку в проекте используется [альтернативный шаблон]»
4. **Отслеживать обоснование**: Задокументируйте, почему предложение было сохранено или пропущено.

### Классификация серьезности

```
🔴 Must Fix (Blockers)
- Security vulnerabilities
- Data loss risks
- Breaking changes without migration
- Silent failures masking bugs

🟡 Should Fix (Improvements)
- SOLID violations causing maintenance issues
- DRY violations (>3 duplicates)
- Performance bottlenecks (N+1 queries)
- Missing error handling for critical paths

🟢 Can Skip (Nice-to-haves)
- Style inconsistencies (if no linter)
- Minor naming improvements
- Overly nested code (if <3 levels)
- Documentation gaps (if code self-documenting)
```

### Эвристика «сначала исправить»

Определите, следует ли автоматически исправлять каждый результат или предоставлять его на усмотрение пользователя.

```
AUTO-FIX (apply without asking):          ASK (needs human judgment):
├─ Dead code / unused variables            ├─ Security changes (auth, XSS, injection)
├─ N+1 queries (missing eager loading)     ├─ Race conditions
├─ Stale comments contradicting code       ├─ Design decisions
├─ Magic numbers → named constants         ├─ Large fixes (>20 lines changed)
├─ Missing import / path mismatches        ├─ Enum completeness
├─ Variables assigned but never read       ├─ Anything removing functionality
└─ Obvious version/doc mismatches          └─ User-visible behavior changes
```

**Rule**: Если старший инженер применит исправление за 30 секунд без обсуждения, это АВТО-ИСПРАВЛЕНИЕ. Если разумные инженеры могут не согласиться, то это СПРОСИТЬ.

После того, как агенты сообщают о результатах:
1. Немедленно примените все элементы AUTO-FIX с минимальными целевыми изменениями.
2. Объедините все элементы ASK в одно пользовательское решение (не по одному вопросу на каждый элемент)

### Петля автоматической фиксации (опция)

Для автоматической конвергенции:

```
Review → Identify issues → Fix → Re-review → Repeat until minimal changes

Safeguards:
- Max 3 iterations to prevent infinite loops
- Run tsc/lint check before each iteration
- Skip auto-fix for protected files (package.json, migrations, etc.)
```

**Пример запроса**:
```
Review this PR with auto-fix enabled:
1. Review using 3 agents above
2. Fix all 🔴 Must Fix issues
3. Re-review to verify fixes
4. Repeat for 🟡 Should Fix (max 2 more iterations)
5. Stop when only 🟢 Can Skip remain
```

### Условная загрузка контекста

Загрузите дополнительный контекст на основе содержимого различий (независимо от стека):

| Если diff содержит... | Тогда проверьте... |
|---------------------|---------------|
| Запросы к базе данных | Индексы, шаблоны N+1, оптимизация запросов |
| Конечные точки API | Промежуточное программное обеспечение аутентификации, проверка ввода, ограничение скорости |
| Логика аутентификации | Хеширование паролей, управление сеансами, токены CSRF |
| Загрузка файлов | Ограничения размера, проверка MIME, безопасность хранения |
| Date/time операции | Обработка часового пояса, крайние случаи летнего времени |
| Внешние вызовы API | Конфигурации тайм-аута, логика повтора, обработка ошибок |
| Переменные среды | Присутствие в .env.example, проверка при запуске |

### Интеграция с существующими инструментами

Плагин **SE-CoVe**: используется для общей проверки фактов отзывов (в дополнение к правилам борьбы с галлюцинациями, указанным выше).

**Worktrunk**: для анализа шаблонов всей кодовой базы перед предложением изменений.

**AST-grep**: для сопоставления структурных шаблонов (например, найти все похожие блоки try/catch)

---

## <a name="sources"></a>Источники

- Базовый шаблон: Claude Code Ultimate Guide.
- Мультиагентный обзор: [Pat Cullen](https://gist.github.com/patyearone/c9a091b97e756f5ed361f7514d88ef0b) (январь 2026 г.)
- Паттерны борьбы с галлюцинациями: система проверки кода [Méthode Aristote](https://github.com/FlorianBruniaux)

$ARGUMENTS
