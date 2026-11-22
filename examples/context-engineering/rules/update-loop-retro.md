# Шаблон ретроспективы сессии

Структурированное приглашение, запускаемое в конце сеанса Claude Code. Цель – захватить
знания, пока они свежие, и превратите их в прочные правила, сохраняя свой `CLAUDE.md`
точно по мере развития проекта.

## Подсказка

Скопируйте это и вставьте в Claude в конце сеанса:

```
Session complete. Before we close, run a quick retrospective:

1. What patterns did we establish that should be permanent rules in CLAUDE.md?
2. What did I correct that Claude got wrong? Should a rule prevent that?
3. What worked well that we should replicate in future sessions?
4. Were any architectural decisions made that CLAUDE.md should record?
5. Is there anything currently in CLAUDE.md that this session proved wrong or outdated?

Output a knowledge feed — 3 to 5 bullets max, high-signal items only.
Skip anything obvious, generic, or already in CLAUDE.md.
Format each item as an actionable rule ready to copy in.
```

## Когда его запускать

| Курок | Бегать в стиле ретро? |
|---------|-----------|
| Функция или капитальный рефакторинг завершены | Да |
| Сеанс отладки, обнаруживший системный пробел | Да |
| Архитектурное решение принято. | Да |
| Сеанс адаптации, на котором кто-то отметил отсутствие контекста | Да |
| Ежемесячно, даже если ничего серьезного не произошло | Да — улавливает накопление |
| Тривиальная сессия (исправление опечатки, редактирование документа) | Нет |

Ежемесячно — это минимальная частота даже для тихих проектов. Мелкие сугробы накапливаются бесшумно.

## Как выглядит хороший результат

Claude должен вернуть что-то вроде этого (не дословно, но с такой степенью детализации):

```
Knowledge Feed — 2025-09-15

1. Pattern established: All database queries go through the repository layer, never called
   directly from route handlers. Rule to add: "Never call Prisma directly from route
   handlers — use the repository functions in src/db/."

2. Correction: I suggested lodash for array manipulation. You redirected to native array
   methods. Rule to add: "Don't import lodash — use native JS array methods. The bundle
   cost isn't worth it for our use case."

3. Architecture decision: We decided to keep auth logic in middleware, not in individual
   route handlers. Rule to add: "Auth checks belong in src/middleware/auth.ts — not in
   route handlers. If a route needs special auth logic, extend the middleware."

4. Stale rule: CLAUDE.md still references the old Express v4 error handler signature.
   We're on v5. Remove: "Express error handlers take 4 arguments (err, req, res, next)."
   Update to: "Express v5 error handlers: async errors propagate automatically — no need
   to call next(err)."
```

## После ретро

### Просмотрите выходные данные

Не все поверхности Claude принадлежат `CLAUDE.md`. Просить:

- Это специфично для нашего проекта или общий совет, который Claude уже знает?
- Это действенно? Без этого правила новая сессия Claude совершит ту же ошибку?
- Это уже покрыто? Искать перед добавлением — дубликаты снижают приверженность.

### Обновление CLAUDE.md

Добавляйте новые правила в наиболее актуальный раздел. Удалите все устаревшие правила, помеченные Claude.

### Зафиксируйте с отслеживаемым сообщением

```bash
git add CLAUDE.md
git commit -m "context: [what changed and why]"
```

Значимые сообщения о фиксации создают отслеживаемую историю развития вашего контекста ИИ. Полезный
для отладки: «Claude начал делать X неправильно после того, как мы внесли изменение Y» становится диагностируемым
из журнала git.

Примеры хороших сообщений о коммитах:

```
context: add lodash ban — use native array methods
context: clarify auth middleware pattern after refactor
context: remove Express v4 error handler rule — now on v5
context: document payment webhook idempotency requirement
context: add Prisma-direct query ban after code review
```

## Использование команды

Когда несколько человек работают с Claude над одним проектом, ретро становится особенно ценным.
Каждый разработчик может получить разные исправления — разные пробелы в поверхности `CLAUDE.md` от
разные углы. Учитывать:

- Запуск ретроспективы в конце любого PR, который включал значительную работу с помощью Claude.
- Включение `CLAUDE.md` в PR-обзоры в качестве постоянного пункта повестки дня.
- Проведение ежеквартального совместного ретроспективного анализа всей командой для анализа накопленных изменений.

Файл `CLAUDE.md` является общим ресурсом. Его качество отражает то, насколько хорошо команда его поддерживает.
