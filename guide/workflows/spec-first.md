---
title: "Первоочередная разработка с использованием Claude"
description: "Определите спецификации в CLAUDE.md перед реализацией для структурированной разработки."
tags: [workflow, architecture, config]
---

# Первая разработка Spec-First с Claude

> **Confidence**: Уровень 2, проверен несколькими производственными группами и соответствует официальным рекомендациям SDD.

Определите, что вы хотите в CLAUDE.md, ПРЕЖДЕ ЧЕМ просить Claude построить. Одна хорошо структурированная итерация равна 8 неструктурированным.

---

## Оглавление

1. [TL;DR](#tldr)
2. [Шаблон](#the-pattern)
3. [Интервью перед спекуляцией (Grill Me)](#interview-before-the-spec-grill-me)
4. [Детализация задач: определение размера работы для агентов](#task-granularity-sizing-work-for-agents)
5. [CLAUDE.md Шаблоны спецификаций](#claudemd-spec-templates)
6. [Пошаговый рабочий процесс](#step-by-step-workflow)
   - [От идеи до прототипа, бизнес-испытания и обзора седьмого дня](#from-idea-to-prototype-business-trial-and-day-7-review)
7. [Интеграция с Tools](#integration-with-tools)
8. [Когда использовать](#when-to-use)
9. [Anti-Patterns](#anti-patterns)
10. [См. также](#see-also)

---

## <a name="tldr"></a>ТЛ;ДР

```
1. Write spec in CLAUDE.md
2. Claude reads spec automatically
3. Implementation follows spec exactly
4. Verify against spec
```

CLAUDE.md — это ваш файл спецификации. Воспринимайте это как договор.

---

## <a name="the-pattern"></a>Узор

Spec-First Development меняет типичный процесс кодирования ИИ:

```
Traditional:        Spec-First:
───────────         ──────────
Prompt → Code       Spec → Prompt → Code → Verify
  │                   │               │       │
  └─ Hope it's       └── Contract    └── Follows spec
     what you want        defined          └── Check against spec
```

Спецификация становится источником истины о том, что:
- Ограничивает то, что строит Claude.
- Документирует решения для команды
- Позволяет проверить полноту

Для более крупных инициатив один файл спецификации можно разделить на более ранние этапы. В встроенном SDLC-сборнике Anthropic [AI](https://claude.com/blog/the-ai-native-sdlc-playbook) (2026 г.) указана цепочка из трех документов, каждый из которых контролируется отдельным рецензентом до того, как будет написан следующий документ:

```
intent.md → spec.md → plan.md
   │            │          │
 PM gate    Tech gate   Approval before
(the "why")  (the "what")  code generation (the "how")
```

`intent.md` излагает проблему простым языком до того, как появится какая-либо техническая формулировка (см. «С intent.md» ниже). `spec.md` — это техническая спецификация, которая уже рассматривается в этом руководстве в оставшейся части этого раздела. `plan.md` — это пофайловый план реализации (порядок, риски, доказательства), утверждаемый до того, как Claude напишет код, отличный от самой спецификации.

> **Примечание к названию: агентный SDLC, AI-native SDLC, «ADLC»**. В учебнике говорится, что «агентный SDLC, AI SDLC или просто агентная разработка программного обеспечения» описывают один и тот же сдвиг. Некоторые публикации практикующих специалистов переименовывают это как «ADLC, жизненный цикл агентной разработки». Будьте осторожны с этой аббревиатурой: Salesforce ([Agentforce — руководство по архитектуре](https://architect.salesforce.com/docs/architect/fundamentals/guide/agent-development-lifecycle.html)) и IBM ([Что такое ADLC?](https://www.ibm.com/think/topics/agent-development-lifecycle-adlc)) уже используют ADLC для жизненного цикла разработки *Agent* — процесса создания, тестирования и эксплуатации ИИ-агентов как продукта. Один ADLC — это агенты, создающие ваше программное обеспечение; другой — вы строите агентов. При оценке агентов как продукта см. [agent-evaluation.md](../roles/agent-evaluation.md).

---

## <a name="interview-before-the-spec-grill-me"></a>Интервью перед спецификацией (зажарь меня)

Прежде чем писать спецификацию, позвольте Claude расспрашивать вас, пока не будут приняты открытые решения. «Поджарь меня» теперь называет три разные практики, которые различаются тем, кто кого и когда задает вопросы:

| Шаблон | Кто спрашивает | Когда | Выход |
|---|---|---|---|
| Привратник ([Подсказка как провокация](../ultimate-guide.md#281-prompting-as-provocation)) | Claude проверяет вас на готовом диффе | После внедрения, до PR | Изменение, которое вы можете защитить |
| Спецификация «сначала собеседование» (официальная лучшая практика) | Claude берет интервью у `AskUserQuestion` | До реализации | `SPEC.md`, затем новая сессия для его реализации. |
| Навык `/grill-me` (Мэтт Покок) | Claude опросит вас по дереву решений | Перед любым планом, спецификацией или кодом, включая решения, не связанные с кодом. | Устоявшиеся решения в разговоре; ничего не написано, если ты не спросишь |

### Интервью-первая спецификация

Официальные рекомендации рекомендуют его для более крупных функций ([дайте Claude взять у вас интервью](https://code.claude.com/docs/en/best-practices)):

```text
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs. Don't ask obvious questions, dig into the hard parts I might not have considered.

Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```

После того, как спецификация написана, в документации рекомендуется начать новый сеанс для ее реализации с чистым контекстом и спецификацией в качестве ссылки.

### Навык `/grill-me`

Первая версия [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, февраль 2026 г.) состояла из двух предложений: «Неустанно расспрашивайте меня о каждом аспекте этого плана, пока мы не достигнем общего понимания. Пройдите по каждой ветви дерева проектирования, разрешая зависимости между решениями одно за другим». В более поздних версиях были добавлены следующие механизмы:

- **Рекомендуемый ответ**: каждый вопрос сопровождается рекомендацией агента, поэтому пользователь реагирует, а не пишет с нуля.
- **Факты и решения**: агент ищет все, на что может ответить база кода или инструменты; только решения принимаются пользователем.
- **Пограничные раунды**: в каждом раунде запрашивается каждое решение, предпосылки которого уже определены. Вопрос, который зависит от другого открытого вопроса, ожидает следующего раунда.
- **Ворота подтверждения**: агент не действует, пока пользователь не подтвердит общее понимание.

Логика теперь находится в навыке `grilling`, а `grill-me` является точкой входа, вызываемой пользователем. Он не записывает файлы: чтобы сохранить решения, запросите спецификацию в том же сеансе. Автор также советует отключать режим планирования во время приготовления на гриле, потому что режим планирования заставляет агента спешить с составлением плана, а не спрашивать.

### Режимы отказа

Задокументировано автором ([grill-me docs](https://github.com/mattpocock/skills/blob/main/docs/productivity/grill-me.md), [Grilling docs](https://github.com/mattpocock/skills/blob/main/docs/productivity/grilling.md), [9 вещей, в которых люди ошибаются](https://www.aihero.dev/things-people-get-wrong-with-grill-me-and-grill-with-docs)):

- **Пассивное соглашение**: принятие каждой рекомендации создает план, написанный агентом. По словам автора: «Сеанс без какого-либо сопротивления с вашей стороны — это сеанс, который вам не нужен».
- **Вопросы не могут быть решены**: внешний вид, ощущения или производительность под нагрузкой требуют одноразового прототипа, а не дополнительных вопросов.
- **Слишком большой объем**: сотни вопросов означают, что работу следует разделить.
- **Более слабые и быстрые модели** по-прежнему пропускают этап подтверждения. Задокументированное исправление — это строка в `CLAUDE.md` или `AGENTS.md`, запрещающая агенту внедрять без разрешения.

Круглый формат используется по умолчанию, но некоторые пользователи, в том числе люди, которые читают медленно или работают на втором языке, сообщают, что для них лучше подходит один вопрос за раз. Задокументированный отказ автора — это одна строка в `CLAUDE.md`: `When grilling, ask one question at a time.`.

### Доказательство

По состоянию на октябрь 2026 года не было обнаружено контролируемых исследований рабочих процессов «допрос на меня» или «сначала собеседование» (переделки, дефекты, стоимость). Соседние контрольные исследования подтверждают эту предпосылку, а не размер выгоды в реальном рабочем процессе. Благодаря десяти участникам, ответившим на уточняющие вопросы модели, [ClarifyGPT](https://github.com/ClarifyGPT/ClarifyGPT) повысил показатель Pass@1 GPT-4 для очищенной MBPP с 70,96% до 80,80%. [HumanEvalComm](https://github.com/jie-jw-wu/human-eval-comm) переписывает задачи HumanEval, чтобы сделать их двусмысленными, противоречивыми или неполными: для этих модифицированных задач Pass@1 ChatGPT составляет 31,34% против 65,58% в оригиналах, и он задает уточняющий вопрос в 14,21% случаев.

### Какой из них использовать

- Дифференциал готов, следующий PR: подсказка Gatekeeper.
- Более крупная функция, требующая письменной спецификации: подсказка перед собеседованием.
- Свободная идея с несколькими зависимыми решениями или решение, не связанное с кодом: `/grill-me`.
- Небольшое, обратимое или уже запланированное изменение: ни одно из них. Задайте один блокирующий вопрос или просто сделайте это.

> **Источник**: [Оценка моделей гриля](../../docs/resource-evaluations/grill-me-interview-patterns.md)

---

## <a name="task-granularity-sizing-work-for-agents"></a>Детализация задач: определение объема работы для агентов

Прежде чем писать спецификацию, убедитесь, что задача имеет правильный размер. Агенты лучше всего работают с **вертикальные срезы**: тонкие, сквозные модули, которые пронизывают все уровни, но реализуют только одно полное поведение пользователя (например, «сброс пароля по электронной почте», а не «систему аутентификации»).

**Правило**: один сеанс агента = один вертикальный срез. Если в описании задачи требуется «и» между двумя вариантами поведения пользователя, разделите его.

### <a name="prd-quality-checklist"></a>Контрольный список качества PRD

Запустите это перед передачей какой-либо задачи агенту. Шесть измерений для проверки:

| Измерение | Вопрос, который стоит задать | Красный флаг |
|-----------|----------------|----------|
| **Прояснение проблемы** | Является ли постановка задачи однозначной? | «Улучшить производительность» |
| **Критерии тестирования** | Может ли завершение проверяться автоматически? | «Хорошо работает» |
| **Границы области действия** | Что явно выходит за рамки? | Ничто не указано как исключенное |
| **Observable Готово** | Как выглядит «готово» для пользователя? | Описание только для внутреннего использования |
| **Требования: Ясность** | Нет подробностей реализации в спецификации? | «Используйте Redis для кэширования» |
| **Терминология** | Повсюду используются одни и те же термины? | «пользователь» и «учетная запись» смешаны |

Задача, которая не проходит по 2+ измерениям, должна быть переработана, прежде чем к ней приступит агент. Обзор спецификации выявляет двусмысленность, которая в противном случае проявится как неправильная реализация в середине сессии.

```
❌ Too big, ambiguous:
"Add user authentication to the app"

✅ One vertical slice:
"Users can log in with email + password.
- POST /auth/login returns JWT on success, 401 on failure
- Invalid credentials show 'Email or password incorrect' (not which is wrong)
- Session expires after 24h
- Out of scope: OAuth, password reset, remember me"
```

### Список функций: машиночитаемый контроль объема

Список функций — это файл JSON, в котором отслеживается область действия и состояние завершения каждой функции в сеансах агента. В отличие от PRD, который описывает намерение, список функций представляет собой операционный контракт агента: он считывается в начале сеанса, обновляется в конце сеанса и сохраняется при передаче обслуживания.

Каждая запись функции имеет три обязательных поля. `description` сообщает агенту, что строить. Поле `verify` — это команда оболочки, которая в случае успеха завершает работу со значением 0, и это важно, поскольку оно заставляет определение Done быть исполняемым, а не просто описательным. Поле `status` отслеживает прогресс через односторонний конечный автомат: `not_started` → `active` → `blocked` → `passing`. Вход может двигаться только вперед, но не назад. Когда функция достигает `passing`, в поле `evidence` записывается то, что ее подтвердило (имя теста, выходные данные команды или конкретная строка журнала).

Здесь применяется правило WIP=1: только один объект может находиться в состоянии `active` в любой момент времени. Множество активных функций приводят к частичной работе и неполной проверке всех из них.

Сохраните `feature_list.json` в корне проекта рядом с `AGENTS.md`. В начале сеанса агент читает его, чтобы узнать, что было сделано и что выбрать дальше. В конце сеанса агент записывает обновленное состояние и доказательства перед фиксацией.

Список функций работает вместе с `claudedocs/handoffs/`. Вместе эти два артефакта дают следующему сеансу как рабочее состояние (какие функции выполнены и проверены), так и повествовательный контекст (что произошло, что было опробовано, что осталось открытым). Ни одно не заменяет другое.

Минимальный пример, показывающий две функции на разных стадиях:

```json
{
  "features": [
    {
      "id": "feat-001",
      "name": "Document Import",
      "description": "Allow users to import PDF and TXT files from local filesystem",
      "verify": "npm test -- --grep 'document import'",
      "status": "passing",
      "evidence": "npm test: 12 passed, 0 failed (2026-05-01 14:22)"
    },
    {
      "id": "feat-002",
      "name": "Document Chunking",
      "description": "Split imported documents into ~500-character chunks with metadata",
      "verify": "npm test -- --grep 'chunking'",
      "status": "not_started",
      "evidence": "",
      "dependencies": ["feat-001"]
    }
  ]
}
```

Поле `evidence` на `feat-001` точно показывает, что и когда запускалось. Запись `feat-002` — это `not_started` с пустым полем `evidence`, ожидающая подтверждения прохождения `feat-001`, прежде чем она станет `active`. Этот шаблон описан в инженерном блоге Anthropic, посвященном проектированию [harness для долго работающих приложений](https://www.anthropic.com/engineering/harness-design-long-running-apps). Готовый шаблон доступен по адресу `examples/workflows/feature-list.json`.

---

## <a name="claudemd-spec-templates"></a>Шаблоны спецификаций CLAUDE.md

### Спецификация функции (наиболее распространенная)

```markdown
## Feature: [Name]

### Description
[2-3 sentences explaining the feature purpose]

### Capabilities
- MUST: [Required functionality]
- MUST: [Another requirement]
- SHOULD: [Nice to have]
- MUST NOT: [Explicit exclusions]

### Tech Stack
- Required: [lib1, lib2, lib3]
- Forbidden: [lib4, lib5]

### Acceptance Criteria
- [ ] Criterion 1: [Specific, testable condition]
- [ ] Criterion 2: [Another condition]
- [ ] Criterion 3: [Edge case handling]

### API Contract (if applicable)
- Endpoint: POST /api/[resource]
- Request: { field1: string, field2: number }
- Response: { id: string, created: timestamp }
- Errors: 400 (validation), 404 (not found), 500 (server)
```

### Спецификация архитектуры

```markdown
## Architecture: [Component Name]

### Purpose
[Why this component exists]

### Boundaries
- Owns: [What this component is responsible for]
- Delegates to: [What other components handle]
- Does NOT: [Explicit non-responsibilities]

### Dependencies
- Upstream: [Components that call this]
- Downstream: [Components this calls]

### Data Flow
```
Ввод → Проверка → Обработка → Вывод.
         │              │
         └─ Ошибки ─────┘
```

### Constraints
- Performance: [Response time, throughput]
- Security: [Auth requirements, data handling]
- Scalability: [Expected load, limits]
```

### Спецификация API

```markdown
## API: [Endpoint Name]

### Endpoint
`POST /api/v1/[resource]`

### Authentication
Bearer token required. Scopes: `read:resource`, `write:resource`

### Request
```json
{
  "field1": "string (required, max 255 chars)",
  "field2": "number (optional, default: 0)",
  "nested": {
    "subfield": "boolean"
  }
}
```

### Ответ
```json
{
  "id": "uuid",
  "created_at": "ISO 8601 timestamp",
  "data": { ... }
}
```

### Коды ошибок
| Код | Значение | Тело ответа |
|------|---------|---------------|
| 400 | Проверка не удалась | `{ "errors": [...] }` |
| 401 | Не аутентифицирован | `{ "message": "..." }` |
| 403 | Не авторизовано | `{ "message": "..." }` |
| 404 | Ресурс не найден | `{ "message": "..." }` |
```

---

## Step-by-step workflow

### Step 1: Write the spec

Before any implementation request, add spec to CLAUDE.md:

```markdown
## Feature: User Authentication

### Capabilities
- MUST: Email/password login
- MUST: JWT token generation
- MUST: Password hashing with bcrypt
- SHOULD: Remember me functionality
- MUST NOT: Store plain text passwords

### Tech Stack
- Required: bcrypt, jsonwebtoken
- Forbidden: passport.js (too heavy for this use case)

### Acceptance Criteria
- [ ] User can login with valid credentials
- [ ] Invalid credentials return 401
- [ ] Token expires after 24h (or 7d with remember me)
- [ ] Passwords hashed with cost factor 12
```

### Шаг 2. Ссылка на спецификацию в командной строке

```
Implement the User Authentication feature as specified in CLAUDE.md.
Follow the acceptance criteria exactly.
```

Claude автоматически читает CLAUDE.md и следует спецификации.

### Шаг 3. Проверьте соответствие спецификации

После внедрения проверьте:

```
Review the implementation against the User Authentication spec.
Check off each acceptance criterion that's satisfied.
List any gaps.
```

### Шаг 4. При необходимости обновите спецификацию

Если требования меняются в ходе реализации:

```
Update the User Authentication spec to include:
- MUST: Rate limiting (5 attempts per minute)
Then implement the rate limiting.
```

---

### <a name="from-idea-to-prototype-business-trial-and-day-7-review"></a>От идеи до прототипа, бизнес-испытание и обзор за 7 дней

Используйте тестируемый артефакт, когда взаимодействие с предложением может принять решение об открытом продукте. Это может быть артефакт Claude, локальный макет или небольшой работоспособный прототип. Четкое исправление ошибок не требует создания прототипа. Следующий пример внутреннего инструмента представляет собой предлагаемый протокол с использованием синтетических заявок в службу поддержки, а не отчет о развернутом инструменте или измеренной выгоде.

Идея заключается в представлении сортировки заявок, которое помогает службе поддержки выявлять случаи, требующие разработки. Сохраните формулировку проблемы, ссылку на прототип, свидетельство о приемке и последующую запись в существующем выпуске или спецификации. Запрашивающая сторона владеет бизнес-пробной версией, технический рецензент — технической приемкой, а указанный сопровождающий — владельцем инструмента после выпуска.

| Этап | Действия и сохранившиеся доказательства | Условия для продолжения |
|---|---|---|
| Идея | Запишите повторяющуюся проблему сортировки, текущий ручной процесс, предполагаемых пользователей, гипотезы и исключения. Используйте фиксированный набор синтетических билетов с ожидаемыми решениями по маршрутизации. | Запрашивающий соглашается, каким будет полезный результат и кто будет его проверять. |
| Прототип | Попросите Claude создать наименьшее интерактивное представление сортировки с синтетическими данными. Покажите обычный случай, обострение и неопределенный случай. Пометьте ложные интеграции и сохраните известные ограничения. | Запрашивающая сторона может проверить рабочий процесс и решить, финансировать ли реализацию. Убедительная демонстрация — это не техническая приемка. |
| Бизнес-проба | После необходимых инженерных проверок и утверждения выпуска дайте заказчику возможность опробовать разрешенный рабочий процесс в согласованной среде. Запишите, пригодна ли маршрутизация, где требуется ручная коррекция и какие случаи остались непроверенными. | Техническую проверку и коммерческую приемку записывайте отдельно. Открытые дефекты сохраняют свой статус. |
| Обзор дня 7 | Через семь дней после того, как функция станет доступна пользователям пробной версии, проверьте доказательства разрешенного использования и соберите отзывы отправителя запроса. Запишите воздействие, фактическое использование, успешную маршрутизацию, исправления и усилия по техническому обслуживанию по сравнению с базовыми показателями, установленными вручную. | Выберите «Продолжить», «Пересмотреть», продлить пробную версию с новой датой проверки, одобренной владельцем, или прекратить использование пробной версии. Отсутствие разоблачения или доказательств означает неубедительность, а не успех. |

Перед выпуском напишите последующую запись с указанием функции и выпущенной версии, владельца пробной версии, даты доступности, даты проверки, предполагаемых пользователей, критерия успеха и местоположения доказательств. День 7 — это пробный период, а не порог всеобщего внедрения. Для нечастых рабочих процессов согласуйте окно проверки, которое может включать реальную возможность использования этой функции. См. показатели внедрения функций [](../ops/team-metrics.md#feature-adoption-rate).

Создайте напоминание в утвержденном планировщике или средстве отслеживания проблем и сохраните его идентификатор и статус выполнения в этой записи. Claude может подготовить напоминание или обзорный отчет из авторизованных источников. Запрос внутри диалога не устанавливает, что будущее задание существует или будет выполнено. Обновление даты доступности должно также обновить дату проверки.

Пример запроса на отзыв:

```text
Perform the day-7 review for the feature in the linked follow-up record.
Read the linked specification, released revision, technical checks,
business-trial feedback and usage evidence available within my access.
Separate technical verification, business acceptance and observed use.
Report eligible users and actual exposure before calculating adoption.
Distinguish observations, assumptions, missing evidence and untested cases.
Recommend continue, revise, extend the trial or retire, with supporting evidence.
Leave the decision to the trial owner. Do not change code or send messages.
```

Держите этот цикл достаточно маленьким, чтобы закрыть одно решение о продукте. Пройденный набор тестов устанавливает только то поведение, которое он демонстрирует. Успешная коммерческая пробная версия не подтверждает продолжительное использование, а активация напоминания не означает, что кто-то протестировал эту функцию.

## <a name="integration-with-tools"></a>Интеграция с инструментами

### <a name="with-intentmd-upstream-problem-statement"></a>С intent.md (постановка задачи восходящего потока)

Anthropic [AI-родной SDLC-плейбук](https://claude.com/blog/the-ai-native-sdlc-playbook) (2026) ставит один документ выше спецификации: `intent.md` излагает проблему на естественном языке, написанную и одобренную человеком, которому принадлежит проблема (обычно менеджер проекта), прежде чем появится какая-либо техническая формулировка. Claude приступает к составлению `spec.md` только после утверждения `intent.md`.

```markdown
# Intent: Reduce checkout abandonment on mobile

## Author
Jane Doe, Product (jane@company.com)

## Problem
32% of mobile checkouts are abandoned at the payment step, versus 11% on desktop.
Support tickets point to the card form timing out on slow connections.

## Constraints
- Must not change the payment provider (Stripe, contractual)
- Must ship before the Q3 promo (2026-09-01)

## Open questions
- Retry silently, or show a "reconnecting" state?
- Is Apple Pay / Google Pay in scope?

## Gate
Approved by: [PM name], [date]
```

Вход намеренно неформальный: премьер-министр подписывает формулировку проблемы, а не какие-либо детали реализации. После утверждения `spec.md` наследует ограничения и открытые вопросы в качестве начальной границы. `plan.md`, третий документ в цепочке, представляет собой пофайловый план реализации (выходные данные Spec Kit `/speckit.plan` или отдельный файл, если Spec Kit не используется) со своими собственными воротами: технический рецензент утверждает его до того, как Claude напишет какой-либо код.

### Со спецкомплектом (с нуля)

```bash
# Install Spec Kit (requires Python 3.11+ and uv)
uv tool install specify-cli
specify init my-project --integration claude

# Use slash commands
/speckit.constitution  # Define project guardrails
/speckit.specify       # Write feature specs
/speckit.plan          # Create implementation plan
/speckit.implement     # Build from spec
```

### С OpenSpec (Браунфилд)

```bash
# Install OpenSpec
npm install -g @fission-ai/openspec@latest
openspec init

# Use slash commands
/openspec:proposal "Add dark mode"  # Create change proposal
/openspec:apply add-dark-mode       # Implement changes
/openspec:archive add-dark-mode     # Merge to specs
```

### <a name="with-bmad-method-multi-role-planning"></a>С BMAD-METHOD (многоцелевое планирование)

BMAD-METHOD ([canonical репозиторий](https://github.com/bmad-code-org/BMAD-METHOD)) может масштабировать объем планирования в соответствии с изменениями. Его документация по текущему рабочему процессу [](https://docs.bmad-method.org/) позволяет внести небольшое ясное исправление, которое можно сразу перейти к `bmad-build`. Более крупное или неопределенное изменение может начаться с `bmad-spec` или использовать более полные артефакты планирования перед реализацией. Существование специализированных агентов не означает, что каждое изменение требует многоролевой цепочки.

```bash
# From the project root, install the method and choose a workflow suited to the change.
npx bmad-method install
```

Используйте более полное планирование, когда решение выигрывает от разделения потребностей пользователя, архитектуры и опыта на проверяемые артефакты. Обновите эти артефакты, когда доказательства изменят требование. Сам по себе метод не обеспечивает изолированное параллельное выполнение; используйте отдельные рабочие деревья, если в противном случае одновременные изменения могут привести к коллизии.

Для стратегического случая (когда затраты на управление BMAD окупаются, а когда нет) см. [methodologies.md § Уровень 1: Стратегическая оркестровка](../core/methodologies.md#tier-1-strategic-orchestration).

### <a name="with-spec-kitty-isolated-parallel-execution"></a>Со spec-kitty (изолированное параллельное выполнение)

Spec-kitty ([Priivacy-ai/spec-kitty](https://github.com/Priivacy-ai/spec-kitty), MIT) добавляет часть, опущенную Spec Kit и BMAD-METHOD: каждый рабочий пакет выполняется в своем собственном рабочем дереве git, с локальной панелью управления канбана, отслеживающей цикл `next → review → accept → merge` и журнал аудита каждого решения по слиянию. Меньшее сообщество, чем Spec Kit или BMAD-METHOD (1449 звезд по состоянию на 27 июля 2026 г.), но это наиболее прямая реализация с открытым исходным кодом «изолированных агентов, управляемого человеком слияния», доступная на сегодняшний день.

```bash
pipx install spec-kitty-cli
```

### В режиме плана

```
[Press Shift+Tab to enter Plan Mode]

I need to implement the Payment Processing feature.
Review the spec in CLAUDE.md and create an implementation plan.
```

---

## <a name="when-to-use"></a>Когда использовать

### Используйте спецификацию в первую очередь

| Сценарий | Зачем |
|----------|-----|
| Новые возможности | Определитесь перед постройкой |
| API дизайн | Контракт должен быть явным |
| Архитектурные решения | Ограничения документа |
| Командное сотрудничество | Общее понимание |
| Сложные требования | Уменьшите двусмысленность |

### Пропустить сначала спецификацию

| Сценарий | Зачем |
|----------|-----|
| Быстрые исправления | Накладные расходы того не стоят |
| Разведка | Еще не знаю, чего ты хочешь |
| Прототипирование | Требования изменятся |
| Однострочные изменения | Очевидное намерение |

---

## Anti-patterns

### Расплывчатые характеристики

```markdown
# Wrong
## Feature: User Management
- Handle users

# Right
## Feature: User Management
### Capabilities
- MUST: Create user with email, password, name
- MUST: Update user profile (name, avatar)
- MUST: Soft delete (mark as inactive, don't remove data)
- MUST NOT: Allow duplicate emails
```

### Спецификация после кода

```
# Wrong workflow
1. Ask Claude to implement feature
2. Write spec documenting what was built

# Right workflow
1. Write spec defining what should be built
2. Ask Claude to implement from spec
```

### Игнорирование запрещено

```markdown
# Don't forget exclusions
### Tech Stack
- Required: React, TypeScript
- Forbidden: jQuery, vanilla JS, class components
             ↑ These constraints prevent drift
```

---

## <a name="modular-spec-design"></a>Модульная конструкция

**Pattern**: разбивайте большие спецификации на несколько целевых файлов вместо того, чтобы запихивать все в один CLAUDE.md.

### Проблема: Монолитный CLAUDE.md

Когда спецификации превышают ~200 строк, возникает несколько проблем:

- **Загрязнение контекста**: Claude пытается извлечь нужную информацию из раздутого контекста
- **Когнитивная перегрузка**: разработчики не могут быстро найти то, что им нужно.
- **Обязанность обслуживания**: обновление одной области требует навигации по несвязанным разделам.
- **Снижение производительности**: большие файлы CLAUDE.md замедляют загрузку и обработку контекста.

### Когда разделить

| Порог | Действие |
|-----------|--------|
| **<100 строк** | Одиночный CLAUDE.md в порядке |
| **100-200 строк** | Рассмотрите возможность разделения, если существуют отдельные домены |
| **>200 строк** | **Немедленно разделитесь**: вы превысили порог когнитивной нагрузки |
| **Многокомандные проекты** | Разделить по domain/ownership независимо от размера |

### Сплит-стратегии

**1. Функциональное разделение**

```
CLAUDE.md              # Core project context
CLAUDE-auth.md         # Authentication spec
CLAUDE-api.md          # API endpoints spec
CLAUDE-billing.md      # Payment processing spec
```

**2. Разделение на основе ролей**

```
CLAUDE.md              # Shared conventions
CLAUDE-frontend.md     # UI/UX specifications
CLAUDE-backend.md      # API/database specs
CLAUDE-infra.md        # DevOps/deployment specs
```

**3. Разделение на основе рабочего процесса**

```
CLAUDE.md              # Daily development rules
CLAUDE-testing.md      # Test specifications
CLAUDE-release.md      # Release process spec
CLAUDE-security.md     # Security requirements
```

### Схема реализации

**Main CLAUDE.md** (остается кратким):
```markdown
# Project: [NAME]

## Tech Stack
[Core technologies]

## Commands
[Daily commands]

## Rules
[Universal rules]

## Detailed Specs
- Authentication: See @CLAUDE-auth.md
- API Design: See @CLAUDE-api.md
- Testing: See @CLAUDE-testing.md
```

**CLAUDE-auth.md** (специализированная спецификация):
```markdown
# Authentication Specification

## Capabilities
- MUST: JWT-based authentication
- MUST: Refresh token rotation
- MUST NOT: Store tokens in localStorage

## API Contract
[Detailed auth endpoints...]

## Security Requirements
[Specific auth security rules...]
```

**Benefits**:
- Claude может ссылаться на определенные файлы с помощью `@CLAUDE-auth.md`.
- Более быстрая загрузка контекста (только соответствующие спецификации)
- Более простое обслуживание (редактируйте один домен, не затрагивая другие)
- Лучшее сотрудничество в команде (право собственности на файл спецификации)

**Источник**: Адди Османи, [«Как написать хорошую спецификацию для агентов ИИ»](https://addyosmani.com/blog/good-spec/) (январь 2026 г.)

---

## <a name="operational-boundaries"></a>Операционные границы

**Pattern**: определите четкие границы того, что агенты ИИ должны делать автоматически, спрашивать или никогда не трогать.

### Трехуровневая система

Традиционные спецификации используют двоичные ограничения (MUST/MUST NOT), но для оперативной работы требуются три уровня:

| Уровень | Значение | Сопоставление Claude Code |
|------|---------|---------------------|
| **Всегда** | Выполнять автоматически без запроса | Режим автоматического принятия |
| **Спросите первым** | Прежде чем продолжить, получите подтверждение пользователя | Режим по умолчанию |
| **Никогда** | Блокировать или требовать режим планирования | Режим планирования / Блокировка крюка |

### Шаблон операционных границ

```markdown
## Boundaries

### Always (Auto-accept)
- Run tests after code changes
- Format code with Prettier
- Update imports when moving files
- Fix linting errors
- Add type annotations for untyped code

### Ask First (Confirm)
- Modify database schemas
- Add new dependencies
- Change API contracts
- Refactor >50 lines of code
- Update configuration files

### Never (Block)
- Push to production branch
- Commit secrets or API keys
- Delete data without backup
- Modify CI/CD workflows without review
- Bypass security checks
```

### Сопоставление с разрешениями Claude Code

**Always → Список разрешений**:
```json
// In .claude/settings.json
{
  "permissions": {
    "allow": [
      "Bash(npm test*)",
      "Bash(npx prettier*)",
      "Bash(npx tsc*)"
    ]
  }
}
```

**Сначала задать вопрос → Режим по умолчанию**:
- Стандартное поведение, подсказки к каждому действию
- Используйте для действий с умеренным risk/impact

**Никогда → Режим планирования + Хуки**:
```bash
# Hook configured via settings.json (PreToolUse event)
#!/bin/bash
if [[ "$TOOL_NAME" == "Bash" ]] && [[ "$INPUT" =~ "git push origin main" ]]; then
  echo "BLOCKED: Direct push to main blocked. Use feature branches."
  exit 2  # Send feedback to Claude (non-zero exit blocks the action)
fi
```

### <a name="decision-framework"></a>Структура принятия решений

Спрашивайте себя о каждом действии:
1. **Может ли это привести к потере данных?** → Спрашивайте сначала или никогда
2. **Это обратимо с помощью git?** → Возможно, всегда
3. **Влияет ли это на других разработчиков?** → Спросите в первую очередь
4. **Является ли это угрозой безопасности?** → Никогда
5. **Является ли это частью стандартного рабочего процесса?** → Всегда

### Пример: разработка API

```markdown
### Always
- Run unit tests (npm test)
- Validate request schemas
- Generate API documentation
- Check response formats

### Ask First
- Add new API endpoints
- Change existing endpoint signatures
- Modify authentication requirements
- Update rate limiting rules

### Never
- Expose internal endpoints publicly
- Log sensitive user data
- Disable authentication checks
- Remove rate limiting
```

### Обслуживание

Пересматривайте границы ежеквартально:
- **Promote**: действия, которые никогда не вызывали проблем (Сначала спрашивать → Всегда).
- **Demote**: действия, вызвавшие проблемы (всегда → сначала спросить)
- **Block**: повторяющиеся ошибки (сначала спросить → никогда)

**Источник**: Адди Османи, [«Как написать хорошую спецификацию для агентов ИИ»](https://addyosmani.com/blog/good-spec/) (январь 2026 г.)

---

## <a name="command-spec-template"></a>Шаблон спецификации команды

**Pattern**: документируйте исполняемые команды с ожидаемыми выходными данными и обработкой ошибок.

### Почему характеристики команд имеют значение

Большинство спецификаций сосредоточено на **функции** («построить аутентификацию»), но **команды** («как проверить аутентификацию») одинаково важны для агентов ИИ.

### Структура шаблона

```markdown
## Commands

### [Command Category]

**Purpose**: [What this command accomplishes]

#### Command: `[actual command]`
**When**: [Trigger condition]
**Expected Output**: [What success looks like]
**Error Handling**: [What to do on failure]
**Flags**: [Important options]

---
```

### Пример: команды тестирования

```markdown
## Commands

### Testing

#### Command: `pnpm test`
**When**: Before every commit, after code changes
**Expected Output**:
- All tests pass (exit code 0)
- Coverage ≥80% (lines, branches, functions)
- No console warnings
**Error Handling**:
- If tests fail → Fix tests, don't skip
- If coverage drops → Add tests for uncovered code
- If warnings appear → Investigate before committing
**Flags**:
- `--coverage`: Generate coverage report
- `--watch`: Run in watch mode for development
- `--silent`: Suppress console output

#### Command: `pnpm test:e2e`
**When**: Before merging to main, in CI pipeline
**Expected Output**:
- All E2E scenarios pass
- Screenshots captured for failures
- Test duration <5 minutes
**Error Handling**:
- If flaky → Investigate race conditions, don't retry blindly
- If timeout → Check network mocks, async handling
- If screenshots differ → Review UI changes deliberately
**Flags**:
- `--headed`: Run with visible browser (debugging)
- `--project chromium`: Test specific browser
```

### Пример: сборка и развертывание

```markdown
## Commands

### Build

#### Command: `pnpm build`
**When**: Before deployment, in CI pipeline
**Expected Output**:
- Build succeeds (exit code 0)
- Output in `dist/` directory
- No TypeScript errors
- Bundle size <500KB (main chunk)
**Error Handling**:
- If TypeScript errors → Fix types, don't use `@ts-ignore`
- If bundle too large → Analyze with `pnpm analyze`, code-split
- If missing assets → Check public/ directory, update paths
**Flags**:
- `--mode production`: Production optimizations
- `--analyze`: Generate bundle size report

### Deployment

#### Command: `pnpm deploy:staging`
**When**: After PR approval, before production
**Expected Output**:
- Deployment succeeds
- Health check returns 200 OK
- Staging URL: https://staging.example.com
**Error Handling**:
- If health check fails → Rollback automatically
- If database migration fails → Don't proceed, investigate
- If environment vars missing → Check .env.staging, update secrets
**Never**: Run `pnpm deploy:production` manually — use CI/CD only
```

### Пример: команды базы данных

```markdown
## Commands

### Database

#### Command: `pnpm db:migrate`
**When**: After pulling schema changes, before development
**Expected Output**:
- Migrations applied successfully
- Database schema matches models
- Seed data loaded (development only)
**Error Handling**:
- If migration fails → Check database connection, review SQL
- If conflicts detected → Resolve migrations, don't force
**Never**: Run migrations in production manually — CI/CD only

#### Command: `pnpm db:reset`
**When**: Development only, never in staging/production
**Expected Output**:
- Database dropped and recreated
- All migrations applied
- Seed data loaded
**Error Handling**:
- If production check fails → Abort immediately, verify environment
**Safety**: Requires `NODE_ENV=development` check
```

### Интеграция с CLAUDE.md

Справочные характеристики команд в вашем основном CLAUDE.md:

```markdown
## Commands
- Build: `pnpm build` (see spec for error handling)
- Test: `pnpm test` (must pass before commit)
- Deploy: See CLAUDE-deployment.md for full procedures
```

**Источник**: Адди Османи, [«Как написать хорошую спецификацию для агентов ИИ»](https://addyosmani.com/blog/good-spec/) (январь 2026 г.)

---

## <a name="anti-pattern-monolithic-claudemd"></a>Анти-шаблон: Монолитный CLAUDE.md

### <a name="the-problem"></a>Проблема

**Symptom**: Ваш CLAUDE.md вырос до 300+ строк, смешав спецификации функций, контракты API, требования к тестированию, процедуры развертывания и соглашения команд.

**Impact**:
- **Неэффективность контекста**: Claude загружает целых 300 строк для каждого запроса, даже для простых задач
- **Медленное время ответа**: большой контекст = более медленная обработка
- **Пониженная точность**: важные детали теряются в шуме.
- **Накладные расходы на обслуживание**: обновление одного раздела требует навигации по несвязанному содержимому.
- **Командные разногласия**: несколько разработчиков редактируют один и тот же файл = конфликты слияния

### <a name="real-world-example"></a>Реальный пример

**Before** (монолитный):
```markdown
# CLAUDE.md (387 lines)

## Tech Stack
[20 lines]

## Authentication
[45 lines of auth spec]

## API Endpoints
[67 lines of API contracts]

## Database Schema
[52 lines of schema rules]

## Testing
[38 lines of test requirements]

## Deployment
[41 lines of deployment procedures]

## Security Rules
[55 lines of security requirements]

## Team Conventions
[33 lines of coding standards]

## Git Workflow
[28 lines of branching rules]

## Troubleshooting
[8 lines of common issues]
```

**Проблема**: Claude загружает все 387 строк, даже когда пользователь спрашивает: «Добавьте новую конечную точку API для профиля пользователя».

**After** (модульный):
```
CLAUDE.md (82 lines)          # Core context: tech stack, commands, rules
CLAUDE-auth.md (45 lines)     # Authentication spec only
CLAUDE-api.md (67 lines)      # API contracts only
CLAUDE-database.md (52 lines) # Database schema only
CLAUDE-testing.md (38 lines)  # Test requirements only
CLAUDE-deploy.md (41 lines)   # Deployment procedures only
CLAUDE-security.md (55 lines) # Security requirements only
```

**Benefit**: Claude загружает CLAUDE.md (82 строки) + CLAUDE-api.md (67 строк) = 149 строк (сокращение на 61%).

### Сплит-стратегия

**Шаг 1. Определите домены**

Ищите естественные границы в вашей спецификации:
- Эти разделы служат разным целям?
- Будут ли разные члены команды владеть разными разделами?
- Некоторые разделы упоминаются чаще, чем другие?

**Шаг 2. Извлечение в выделенные файлы**

Переместите контент, специфичный для домена, в выделенные файлы:

```bash
# Keep in CLAUDE.md (always loaded)
- Tech stack (unchanging baseline)
- Daily commands (frequent reference)
- Universal rules (apply to all work)

# Extract to domain files (load on demand)
- Feature specs → CLAUDE-[feature].md
- API contracts → CLAUDE-api.md
- Testing → CLAUDE-testing.md
- Deployment → CLAUDE-deploy.md
```

**Шаг 3. Создайте индекс в главном CLAUDE.md**

```markdown
# Project: [NAME]

## Tech Stack
[Core technologies]

## Commands
[Daily commands]

## Rules
[Universal rules]

## Detailed Specifications
Reference these files for domain-specific requirements:
- @CLAUDE-auth.md — Authentication & authorization
- @CLAUDE-api.md — API endpoint contracts
- @CLAUDE-database.md — Schema and migrations
- @CLAUDE-testing.md — Test requirements
- @CLAUDE-deploy.md — Deployment procedures
- @CLAUDE-security.md — Security requirements
```

**Шаг 4. Справка при необходимости**

Claude может ссылаться на определенные файлы:
```
User: "Add a new API endpoint for user settings"
Claude: Reads CLAUDE.md + @CLAUDE-api.md (relevant context only)
```

### Правила обслуживания

1. **Сохранить CLAUDE.md <100 строк** (только основной контекст)
2. **Доменные файлы <150 строк каждый** (если больше, разделить дальше)
3. **Ежеквартальный обзор**: объединить редко используемые файлы и разделить часто обновляемые разделы.
4. **Use @file references**: явно загружайте то, что вам нужно.

### Контрольный список миграции

- [ ] Определить домены в текущем CLAUDE.md (>200 строк?)
- [ ] Создание файлов, специфичных для домена (CLAUDE-[domain].md)
- [ ] Переместить содержимое в выделенные файлы
- [ ] Обновите основной CLAUDE.md с помощью index/references.
- [ ] Тест: попросите Claude выполнить задачу, специфичную для домена.
- [ ] Проверка: проверьте использование контекста с помощью `/status`.
- [ ] Документ: Обновление команды по новой структуре

**Источник**: Адди Османи, [«Как написать хорошую спецификацию для агентов ИИ»](https://addyosmani.com/blog/good-spec/) (январь 2026 г.)

---

## SDD против TDD против BDD

По состоянию на 2026 год разработка на основе спецификаций дала достаточно результатов, чтобы можно было значимо сравнивать ее со старыми методологиями. Важное различие заключается в том, какой артефакт управляет, а не в том, какая методология звучит лучше в абстрактном виде.

| Методология | Управляющий артефакт | Когда он работает | Роль человека | Реген возможен? |
|-------------|-------------------|--------------|------------|-----------------|
| TDD | Набор тестов | После существования кода | Сначала пишите тесты, потом код | Нет: тесты документируют то, что было построено. |
| BDD | Огурец (файлы .feature) | После существования кода | Напишите сценарии, а затем автоматизируйте | Частично: сценарии могут управлять генерацией кода |
| SDD | Файл спецификации (структурированный на естественном языке) | Прежде чем код существует | Написать спецификацию, утвердить договор | Да: код является производным результатом спецификации. |

Практическое значение столбца SDD: если спецификация является управляющим артефактом, то код в принципе можно регенерировать из спецификации. Tessl доводит это до логического предела, создавая файлы с пометкой `// GENERATED FROM SPEC - DO NOT EDIT`. Мартин Фаулер отмечает, что это «сначала спецификация» (код начинается со спецификации), но еще не «привязано к спецификации» (спецификация и код автоматически синхронизируются с течением времени). Ни один инструмент не смог бы надежно решить проблему отклонения технических характеристик в промышленном масштабе.

Частота сбоев многофайловых задач без структуры спецификации: pass@1 снижается до 19,4% для задач многофайловой инфраструктуры по сравнению с 87% для изолированных функций (внутренние данные Augment Code, отсутствие опубликованных рецензируемых исследований). Это утверждение заслуживает доверия: агенты без постоянного контекста задачи чаще терпят неудачу при выполнении задач, охватывающих файлы и компоненты. Конкретные цифры предоставлены поставщиками.

### Архитектура миссий Factory.ai

Наиболее документированная реализация мультиагентного SDD в производственной среде. Архитектура:

1. **Orchestrator** преобразует требования в контракты поведенческой проверки перед началом реализации.
2. **Workers** реализуют функции параллельно, каждый из которых получает ограниченное описание задачи из контракта.
3. **Агенты-валидаторы** (состязательные, независимые) проверяют каждую реализацию на соответствие контракту. У них нет никакого контекста от рабочих, только договор и результат.

В задокументированном проекте клонирования Slack: валидаторы обнаружили 81 проблему до слияния кода, в результате чего 34% всей работы по реализации составили «исправление функций». Средняя продолжительность миссии: 2 часа. Самая длинная задокументированная миссия: 16 дней. Factory.ai воплощает состояние в общих артефактах (контрактах проверки, списках функций, определениях навыков), чтобы выжить при сбросе контекста во время многодневных миссий.

Ссылка CLI (при использовании Factory.ai):

```bash
droid exec --mission path/to/mission.yaml    # Start a mission
droid status                                  # Check active missions
droid validate --mission-id <id>             # Run validators manually
```

### <a name="full-cycle-ai-software-factories"></a>Фабрики программного обеспечения полного цикла для искусственного интеллекта

В 2026 году появилась отдельная категория продуктов: коммерческие платформы, которые выполняют весь цикл от спецификации до развертывания с помощью единого интерфейса, а не инструмента, который вы добавляете в существующий рабочий процесс. Эта идея близка к архитектуре Missions Factory.ai, описанной выше (спецификация → параллельная изолированная сборка → проверка → развертывание), но упакована как управляемый сервис, часто ориентированный на не-разработчиков в качестве основного пользователя.

| Продукт | Что он делает | Финансирование/этап | Источник |
|---------|--------------|------------------|--------|
| [Малеус](https://maleus.ai) | Пользователь описывает потребность на естественном языке, команда специализированных агентов превращает ее в спецификации для утверждения человеком, а затем доставляет работающее приложение, принадлежащее клиенту, в собственный репозиторий и инфраструктуру. | Ранняя стадия, Париж, основатель Адриен Маре. | [maleus.ai](https://maleus.ai) |
| [Factory.ai](https://factory.ai) | Описано выше (архитектура миссий). | Серия C стоимостью 150 миллионов долларов, оценка в 1,5 миллиарда долларов, возглавляемая Khosla Ventures с Sequoia (апрель 2026 г.) | [TechCrunch](https://techcrunch.com/2026/04/16/factory-hits-1-5b-valuation-to-build-ai-coding-for-enterprises/) |
| [Блитзи](https://blitzy.com) | Реверс-инжиниринг существующей кодовой базы в граф зависимостей, а затем параллельная координация тысяч агентов для многодневных запусков (базы кода от 1 до 100 миллионов строк кода). | Привлечено 200 миллионов долларов, оценка в 1,4 миллиарда долларов, во главе с Northzone (май 2026 г.) | [КремнийANGLE](https://siliconangle.com/2026/05/05/blitzy-raises-200m-1-4b-valuation-deploy-thousands-coding-agents-parallel/) |
| [Девин](https://devin.ai) (Познание) | Описано в [agentic-tools.md §2.1](../ecosystem/agentic-tools.md#21-devin-cognition) | Оценка 25 миллиардов долларов (сбор средств в апреле 2026 года) | См. agentic-tools.md. |

Ни один из них не охватывает весь стек управления от начала до конца. Разрыв между «быстрым созданием работающего приложения» и «созданием приложения, которому можно доверять в производстве, без необходимости перечитывания человеком каждой строки» сводится к четырем вопросам, которые стоит задать перед принятием любого из них:

1. **Детерминированный шлюз или самооценка LLM?** Блокирует ли слияние отдельный процесс, отличный от LLM (lint, проверка типов, набор тестов, проверка контракта), или агент, написавший код, также решает, правильно ли он? Независимые агенты-валидаторы Factory.ai (выше) и эталонная реализация Spec-to-Code Factory (см. «См. также» ниже) — это два документированных примера жесткого шлюза, отличного от генерирующего агента. Самый убедительный эмпирический аргумент в пользу этого исходит из исследований безопасности, а не колод поставщиков: *Refute-or-Promote* ([arXiv:2604.19049](https://arxiv.org/abs/2604.19049), Абхинав Агарвал, 2026) провел 31-дневную состязательную многоагентную кампанию по обнаружению дефектов, в которой агентам было поручено опровергать кандидатов, а не чем подтвердить их с помощью обязательной эмпирической проверки (выполнение проверки концепции), прежде чем какие-либо выводы дойдут до человека. В ходе него было убито примерно 79% из 171 кандидата, но все же было произведено четыре реальных преступления против насильственного экстремизма. Здесь важен результат: десять преданных рецензентов LLM единогласно одобрили заполняющий оракул Блейхенбахера, которого не существовало, и который можно было поймать только эмпирическими воротами. Консенсус среди рецензентов LLM не заменяет детерминистическую проверку, он может быть уверенно и единогласно ошибочным.
2. **I Существует ли механизм остановки линии?** После N неудачных попыток исправления конвейер останавливается и переходит к человеку или продолжает повторять попытки и сжигать токены? Лишь немногие платформы документируют это явно; рассматривать его отсутствие как реальный производственный риск, а не как крайний случай.
3. **Отслеживается ли каждое решение?** Можете ли вы восстановить постфактум, какой агент (и какая версия модели) внес данное изменение и одобрил ли его человек? Это имеет наибольшее значение в регулируемых средах и соответствует шаблону контрольного журнала, который реализуется набором спецификаций в масштабе OSS (см. выше).
4. **Сохраняет ли спецификация авторитетность после первого поколения?** См. «Дрейф спецификации» ниже: большинство платформ решают проблему генерации, немногие решают проблему синхронизации спецификации и кода по мере того, как приложение развивается после своей первой версии.

Вышеупомянутые коммерческие продукты являются закрытыми и управляемыми, поэтому вы можете доверить их управление. Один проект с открытым исходным кодом отвечает на первые три вопроса в проверяемом коде: [Liza](https://github.com/liza-mas/liza) (Apache-2.0, 363 звезды на 28 августа 2026 г.) включает CLI агента кодирования в детерминированные супервизоры Go, которые обеспечивают переходы состояний, границы ролей, аренду, вердикты рецензентов, полномочия слияния и восстановление. Он объединяет исполнителя с состязательным рецензентом, записывает состояние на доске YAML и изолирует параллельные задачи в рабочих деревьях git. Эти механизмы делают Liza эталонной архитектурой механического управления, а не свидетельством готовности производства. Рабочие деревья не помещают процессы в изолированную среду, некоторые адаптеры поставщиков используют широкие неинтерактивные режимы разрешений, а передача восходящего CI проверенного коммита не измеряет качество задач на реальных заявках. См. прикрепленный [evidence профиль Liza](../ecosystem/agentic-tools.md#48-liza) и обновленный [`docs/resource-evaluations/liza-mas-framework.md`](../../docs/resource-evaluations/liza-mas-framework.md).

#### Фабрика, поддерживаемая консалтингом: вторая когорта

В таблице выше представлены все стартапы, финансируемые венчурным капиталом, из-за чего категория выглядит уже, чем она есть на самом деле. В первой половине 2026 года возникла особая группа: авторитетные консалтинговые компании, которые превращают свою собственную агентскую платформу в продукт, а не продают дневные тарифы поверх чужих инструментов. Шаг инвертирует стартовый. В то время как Блитзи лидирует с тысячами параллельных агентов, а Девин лидирует с автономией, эта когорта лидирует с управлением и на втором месте продает скорость.

| Платформа | Родитель | Что он утверждает, что делает | Проверка из первых рук |
|----------|--------|---------------------|------------------|
| [AI/works](https://www.thoughtworks.com/ai/works/) | Мыслительные работы | Реверс-инжиниринг устаревших систем с помощью искусственного интеллекта в расширенные спецификации, затем агентные рабочие процессы, генерирующие код, тесты и конвейеры развертывания, восстанавливающие затронутые компоненты при изменении требований. Выводит на рынок модель «3-3-3»: 3 дня на разработку концепции, 3 недели на создание прототипа, 3 месяца на создание MVP в производстве. | Выпущен в январе 2026 г. ([пресс-релиз](https://www.prnewswire.com/news-releases/aiworks-heralds-a-new-era-of-agile-and-next-generation-software-development-302664456.html)), прочитайте страницу продукта. |
| [Agent/works](https://www.thoughtworks.com/en-us/about-us/news/2026/thoughtworks-launches-agent-works) | Мыслительные работы | Плоскость управления и управляемая среда выполнения для корпоративных агентов в любом облаке: центральный реестр, разрешения, основанные на возможностях и ограниченные по времени, а также «доказуемое соответствие перед выполнением» (анализ всех возможных путей в рабочем процессе агента для проверки существования хотя бы одного полностью соответствующего пути). | Запущен 16 июня 2026 года, о чем было объявлено на саммите Databricks Data + AI. AI/works работает на нем |
| [Солярио](https://solario.io/en/) | Совместная инициатива с WeScale (Париж) | Восемь агентов предметной области (архитектура, дизайн, кодирование, безопасность, тестирование, модернизация, эксплуатация, управление) позиционировали себя как «Контекст прежде кода. Управление прежде масштабирования». Продается либо в виде программ полной модернизации, либо в виде фреймворка, лицензируемого клиентским командам. | Сайт прочитан в июле 2026 г. **Механизм не задокументирован.**: базовый LLM не раскрыт, модель развертывания отсутствует, цены отсутствуют, имя клиента отсутствует. |
| ИАКА / Автоникс | Сопра Стерия | Суверенная мультиагентная платформа для критически важных сред (оборона, энергетика), обеспечивающая отслеживаемость, объяснимость и проверяемость на каждом этапе, с европейским размещением данных и локальным развертыванием. | Сообщается, но не проверено независимо для этого руководства. |
| ИИ НПЗ Дистиллятор | Accenture (с NVIDIA) | Агентская структура, охватывающая память агента, совместную работу нескольких агентов, управление рабочими процессами, управление и наблюдаемость. | Сообщается, но не проверено независимо для этого руководства. |

Заявление Agent/works о «доказуемом соблюдении перед исполнением» заслуживает внимания. Если он делает то, что сказано в формулировке, то он ближе к проверке моделей, чем к управлению на оперативном уровне, и это будет единственный механический ответ на вопрос 3 в этой когорте. Считайте это утверждением, пока кто-нибудь не опубликует, как на самом деле работает анализ пути.

Все остальное здесь не проходит тот же тест, что и стартапы, а Solario проваливает его сильнее всего. Платформа, чье общее позиционирование - «Управление прежде масштабирования», не публикует ни одного предложения о том, как обеспечиваются ее ограждения, блокирует ли детерминированный шлюз слияние, или LLM оценивает собственный результат, или какая модель находится под ним. Это немалое упущение для этой категории; это весь продукт. Перед подписанием примените вопрос 5 ниже: попросите указать точку входа во время выполнения, которая обеспечивает шлюз, а не слайд, который ее называет.

Ни у одного из пяти компаний нет производственного развертывания с измеренными результатами, проверенными третьей стороной, что является той же доказательной позицией, что и каждый стартап в таблице выше.

#### <a name="the-decorative-ci-trap-question-1-in-practice"></a>Ловушка декоративного КИ (вопрос 1, на практике)

Самый распространенный вариант ответа на вопрос 1 — это не «ворот вообще нет». Это ворота, которые движутся, но не блокируются. Команда подключает полный конвейер CI (проверка типов, тесты, анализ, секретное сканирование), видит красный крестик на неудачных запросах на выполнение и предполагает, что слияние защищено. Это не так, если только эти задания не настроены как *обязательные проверки статуса* в защищенной ветке. Без этого GitHub показывает сбой и по-прежнему позволяет выполнить слияние прямо через него. Трубопровод декоративный: сообщает, не затворяется.

Это было обнаружено в реальной кодовой базе T3 (tRPC/Prisma) во время аудита: `gh api repos/OWNER/REPO/branches/BRANCH/protection` вернул `404 Branch not protected`, поэтому `ci.yml`, хаски-хук `pre-push` и даже рабочий процесс проверки LLM носили рекомендательный характер. Исправление — это 30-минутное изменение настроек GitHub, но это единственное движение с самой высокой рентабельностью во всей программе, потому что все остальные ворота — это театр военных действий, пока они не приземлятся.

Два предостережения, когда вы восполните этот пробел:

- **Агрегируйте до того, как вам потребуется.** Если ваши задания CI используют `paths-ignore` (поэтому PR, предназначенный только для документации, их пропускает), пометка этих заданий напрямую как обязательные проверки статуса приводит к обратным результатам: проверка постоянно остается «ожидаемой» и никогда не удовлетворяет, блокируя PR навсегда. Добавьте одно «воротное» задание агрегатора, которое зависит от реальных заданий и завершает 0 на игнорируемых путях, а затем требует только этот агрегатор.
- **Детерминированный блокировщик, рекомендация LLM.** Рабочий процесс, который выполняет `exit 1`, когда в таблице, заполненной LLM, есть какая-либо RED-строка, по-прежнему является LLM самооценивающимся, просто анализируемым детерминированно. Сохраняйте обзор LLM как сигнал, но позвольте детерминированным заданиям (проверка типов, тесты) иметь право на слияние. PR с красной таблицей LLM, но зелеными тестами должно быть объединено; пиара с битыми типами и зеленым вердиктом LLM не должно быть.

### Дрейф спецификаций: открытая проблема

Риск, который имеет наибольшее значение в производстве: когда спецификация и код расходятся, агенты повторно создают ошибки, которые уже были исправлены. Шаблоны смягчения последствий:

- Версируйте спецификацию как артефакт git перед фиксацией реализации.
- Команда курсора `/evolve`: обновляет спецификацию, когда реализация намеренно отклоняется от нее.
- Намерение (агент): записывает изменения обратно в спецификацию во время реализации, сохраняя синхронизацию.
- GitHub Spec Kit: хранит спецификации в `.specify/` в виде файлов с версиями, которые может читать CI.

Ни один инструмент не имеет надежного и широко распространенного механизма для автоматической синхронизации спецификации кода в длительные сроки. Это основная открытая проблема в SDD по состоянию на май 2026 года.

---

## <a name="see-also"></a>См. также

- [workflows/agentic-software-factories.md](./agentic-software-factories.md): карта ориентации, охватывающая весь спектр от одного сеанса до закрытой платформы, а также дерево решений для того, когда закрытая фабрика действительно превосходит собственный стек.
- [../core/methodologies.md](../core/methodologies.md): SDD и другие методологии.
- [Документация комплекта спецификаций](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Документация OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [tdd-with-claude.md](./tdd-with-claude.md): объединить с TDD
- [Spec-to-Code Factory](https://github.com/SylvainChabaud/spec-to-code-factory): полная ссылка на реализацию с внешним применением (6 шлюзов через Node.js, инварианты «Нет спецификации, нет кода» + «Нет задачи, нет фиксации», ~900 КБ tokens/projet)
- [Superpowers](https://github.com/obra/superpowers): набор плагинов (262 тыс. звезд по состоянию на 27 июля 2026 г., было 95 тыс.+) с навыком `brainstorming`, который обеспечивает соблюдение спецификации в качестве обязательного шлюза: агент отказывается писать код до тех пор, пока спецификация не будет проверена и одобрена. Установите: `/plugin install superpowers@claude-plugins-official`.
