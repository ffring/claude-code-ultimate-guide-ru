# Протокол подачи знаний

Контекстное проектирование — это не единовременная установка. Со временем его ценность накапливается, поскольку Claude изучает, что лучше всего подходит для вашего проекта. Этот файл определяет, когда и как зафиксировать полученные знания обратно в `CLAUDE.md`.

## Когда кормить знаниями

Запускайте этот протокол в конце любого сеанса, который:

- Завершена функция или значимое изменение кода.
- Обнаружен новый шаблон, который хорошо работает и должен стать стандартом.
- Допустили ошибку, требующую исправления (особенно, если ошибка повторялась)
- Принято архитектурное решение, которое повлияет на будущую работу
- Установлено предпочтение библиотеки, инструмента или подхода.

Пропустите его для тривиальных сеансов (исправление опечаток, редактирование документации, незначительные изменения конфигурации).

## Подсказка в ленте знаний

Вставьте это в Claude в конце квалификационных сессий:

```
Before we close this session, run a knowledge feed:

1. What patterns did we establish that should become permanent rules?
2. What did I correct or redirect that should be a rule to prevent recurrence?
3. Were any architectural decisions made that CLAUDE.md should record?
4. Is there anything in CLAUDE.md that this session proved wrong or outdated?

Output only high-signal items (3-5 max). Use the knowledge feed format below.
Skip anything obvious or already covered.
```

## Формат вывода ленты знаний

Claude должен выводить открытия в такой структуре:

```markdown
## Knowledge Feed — [YYYY-MM-DD]

### New Pattern (if applicable)
**What**: [One sentence describing the pattern]
**Why**: [Why this is the right approach for this project]
**Rule to add**:
> [Exact text to paste into CLAUDE.md, ready to copy]

### Anti-Pattern Found (if applicable)
**What happened**: [What Claude did wrong or what was corrected]
**Why it's wrong here**: [Project-specific reason, not generic best practice]
**Rule to add**:
> Never: [specific behavior to avoid and why]

### Architecture Decision (if applicable)
**Decision**: [What was decided]
**Rationale**: [Why — especially if it goes against common practice]
**Rule to add**:
> [Exact text to paste into CLAUDE.md]

### Stale Rule to Remove (if applicable)
**Rule**: [Current rule in CLAUDE.md]
**Why remove**: [What changed that makes this obsolete]
```

## <a name="integration-workflow"></a>Рабочий процесс интеграции

После получения канала знаний:

1. **Проверьте перед добавлением**: не все шаблоны обобщаются. Спросите: «Нужно ли это знать новому члену команды или это зависит от контекста данного сеанса?»
2. **Скопируйте соответствующие правила** в соответствующий раздел `CLAUDE.md`.
3. **Удалить все правила** Claude помечены как устаревшие
4. **Зафиксируйте обновление** со содержательным сообщением:

```bash
git add CLAUDE.md
git commit -m "context: [short description of what was learned]"

# Examples:
# context: add zod validation rule after form refactor
# context: remove Redux rule — migrated to Zustand
# context: document payment webhook idempotency pattern
```

## Качественный фильтр

Прежде чем добавлять какое-либо правило в `CLAUDE.md`, проверьте:

- **Это специфично для этого проекта?** Общие передовые методы здесь неуместны — Claude их уже знает.
- **Практично ли это?** «Будьте осторожны с асинхронным кодом» бесполезно. «Всегда проверять состояние гонки в конечном автомате заказа» полезно.
- **Это уже обсуждалось?** Прежде чем добавлять, найдите похожие правила. Дубликаты ослабляют приверженность.
- **Будет ли это актуально через 6 месяцев?** Избегайте правил, связанных с временными состояниями («мы переходим на X, поэтому пока не используйте Y»).

## Право собственности

Подача знаний работает лучше всего, когда это командная привычка, а не работа одного человека. Любой член команды, работающий с Claude, может поделиться своими знаниями. За качественную фильтрацию отвечает человек, просматривающий PR на изменения `CLAUDE.md`.
