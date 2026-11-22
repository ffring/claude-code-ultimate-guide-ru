---
title: "TDD с Claude Code"
description: "Рабочий процесс разработки через тестирование с явными подсказками для циклов «красный-зеленый-рефакторинг»"
tags: [workflow, tdd, testing]
---

# TDD с Claude Code

> **Confidence**: Уровень 1, основанный на официальных передовых практиках Anthropic и обширной проверке сообщества.

Разработка через тестирование с помощью Claude требует явных подсказок. Claude, естественно, сначала пишет реализацию, а затем тестирует. TDD требует обратного.

---

## Оглавление

1. [TL;DR](#tldr)
2. [Проблема](#the-problem)
3. [Настройка](#setup)
4. [Цикл «Красный-Зеленый-Рефакторинг»](#the-red-green-refactor-cycle)
5. [Интеграция с функциями Claude Code](#integration-with-claude-code-features)
6. [Anti-Patterns](#anti-patterns)
7. [Расширенные шаблоны](#advanced-patterns)
8. [См. также](#see-also)

---

## <a name="tldr"></a>ТЛ;ДР

```
Red → Green → Refactor

But you MUST prompt Claude explicitly:
"Write a FAILING test for [feature]. Do NOT write implementation yet."
```

---

## <a name="the-problem"></a>Проблема

Без явных инструкций Claude будет:
1. Напишите код реализации
2. Затем напишите тесты, которые будут соответствовать этой реализации.

Это противоречит цели TDD: тесты должны управлять дизайном, а не проверять существующий код.

---

## <a name="setup"></a>Настройка

### Конфигурация CLAUDE.md

Добавьте в CLAUDE.md вашего проекта:

```markdown
## Testing Conventions

### TDD Workflow
- Always write failing tests BEFORE implementation
- Use AAA pattern: Arrange-Act-Assert
- One assertion per test when possible
- Test names describe behavior: "should_return_empty_when_no_items"

### Test-First Rules
- When I ask for a feature, write tests first
- Tests should FAIL initially (no implementation exists)
- Only after tests are written, implement minimal code to pass
```

### Хук для автозапуска тестов (необязательно)

Создайте `.claude/hooks/test-on-save.sh`:

```bash
#!/bin/bash
# Auto-run tests when test files change
if [[ "$1" == *test* ]] || [[ "$1" == *spec* ]]; then
  npm test --watchAll=false 2>&1 | head -20
fi
```

---

## <a name="the-red-green-refactor-cycle"></a>Цикл «красный-зеленый-рефакторинг»

### Фаза 1: красный (запись неудачного теста)

**Prompt**:
```
Write a failing test for [feature description].
Do NOT write the implementation yet.
The test should fail because the function/method doesn't exist.
```

**Example**:
```
Write a failing test for a function that calculates the total price
of items in a cart, applying a 10% discount if total exceeds $100.
Do NOT implement the function yet.
```

**Ожидаемое поведение Claude**:
- Создает тестовый файл с тестовыми примерами
- Тестирует ссылочную функцию, которой не существует.
- Запуск тестов завершается неудачей с сообщением «функция не определена» или чем-то подобным.

**Verification**:
```bash
npm test  # Should fail with "calculateCartTotal is not defined"
```

### Этап 2: Зеленый (минимальная реализация)

**Prompt**:
```
Now implement the minimum code to make these tests pass.
Only write enough code to pass the current tests, nothing more.
```

**Ожидаемое поведение Claude**:
- Создает файл реализации
- Пишет минимальный код для выполнения тестов
- Избегает чрезмерного проектирования

**Verification**:
```bash
npm test  # Should pass
```

### Этап 3: Рефакторинг (очистка)

**Prompt**:
```
Refactor the implementation to improve code quality.
Tests must stay green after refactoring.
Focus on: [readability / performance / removing duplication]
```

**Ожидаемое поведение Claude**:
- Улучшает код без изменения поведения
- Запускает тесты, чтобы убедиться, что они все еще проходят.
- Документирует любые существенные изменения

---

## <a name="integration-with-claude-code-features"></a>Интеграция с функциями Claude Code

### С помощью TodoWrite

Отслеживайте этапы TDD в своем списке задач:

```
User: "Implement user authentication with TDD"

Claude creates todos:
- [ ] RED: Write failing tests for login
- [ ] GREEN: Implement login to pass tests
- [ ] REFACTOR: Clean up login implementation
- [ ] RED: Write failing tests for logout
- [ ] GREEN: Implement logout
- [ ] REFACTOR: Clean up
```

### В режиме плана

Используйте планирование для стратегии тестирования:

```
[Press Shift+Tab to enter Plan Mode]

I need to implement a shopping cart with TDD.
Plan the test cases before we start writing any code.
```

Claude исследует кодовую базу в режиме только для чтения, а затем предложит план тестирования перед любой реализацией.

### С хуками

Автоматический запуск тестов после редактирования с помощью хука PostToolUse:

```json
// In .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm test --watchAll=false 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

### С субагентами

Делегируйте написание тестов агенту, ориентированному на область действия:

```
Use the test-writer agent to create comprehensive tests for
the UserService class, covering all edge cases.
Then I'll implement to pass those tests.
```

---

## Anti-patterns

### <a name="the-verification-gap"></a>Пробел в проверке

Пробел в проверке — это режим сбоя, при котором агент сообщает о завершении функции до того, как пакет проверки подтвердит ее. Это наиболее распространенный сбой надежности при работе многосессионного агента, и его полностью можно предотвратить с помощью правильной конструкции проводки.

Три наблюдаемых признака: агент печатает сообщение об успехе перед запуском любой тестовой команды; тесты выполняются, но поток stderr отбрасывается или не читается; только модульные тесты проходят успешно, если критерии приемки определяют сквозное поведение.

Исправление представляет собой трехуровневый стек проверки, который должен пройти все, прежде чем какая-либо функция будет помечена как `passing` в списке функций:

1. **Lint**: проверка синтаксиса и стиля (самая быстрая, выявляет очевидные ошибки перед запуском тестов)
2. **Модульные и интеграционные тесты**: функциональная корректность отдельных компонентов
3. **Сквозные тесты**: поведенческий контракт, как его видит пользователь или внешний вызывающий объект.

Каждый уровень ловит разные классы отказов. Юнит-тесты могут пройти успешно, даже если границы компонентов нарушены. Сквозные тесты выявляют ошибки распространения состояния и проблемы жизненного цикла, которые модульные тесты не могут обнаружить. Пропуск любого слоя оставляет пробел.

Принцип независимого оценщика: агент, который пишет код, не должен быть тем же самым вызовом, который удостоверяет его выполнение. Речь идет не о недоверии к модели; речь идет о том, как контекст влияет на оценку. Агент, который только что потратил два часа на создание функции, снисходительно интерпретирует неоднозначные результаты. Перехватчик PostToolUse или второй агент, независимо читающий код выхода, этого не делают. Хук в `examples/hooks/bash/verification-gate.sh` реализует этот шаблон.

Anthropic задокументировали эту неудачу в своем исследовании конструкции ремня безопасности: при голом запуске (без ремня) их агент сообщил, что редактор игры завершен через 20 минут. Ничего не помогло. С добавлением независимого оценщика та же модель проработала 6 часов и дала функциональный результат. (Источник: [https://www.anthropic.com/engineering/harness-design-long-running-apps](https://www.anthropic.com/engineering/harness-design-long-running-apps))

Здесь подключается правило WIP=1: сохранение только одной функции `active` одновременно означает, что пробел в проверке, когда он возникает, затрагивает одну функцию, а не несколько одновременно.

### Чего НЕ делать

| Anti-Pattern | Почему это неправильно | Правильный подход |
|--------------|----------------|------------------|
| «Напишите тесты для этой функции» | Claude реализует первым | «Напишите НЕВЕРНЫЕ тесты, которых еще нет» |
| «Добавьте тесты и реализацию» | Теряет преимущество «сначала тестирование» | Разделить на две подсказки |
| «Убедитесь, что тесты пройдены» | Поощряет реализацию в первую очередь | «Пишите тесты, затем реализуйте минимально» |
| Пропуск этапа рефакторинга | Накапливается технический долг | Всегда рефакторить после зеленого |
| Несколько функций одновременно | Теряет фокус | Одна функция за цикл TDD |

### Распространенные ошибки

**Ошибка**: попросить Claude «проверить» существующий код.
```
# Wrong
"Write tests for the existing calculateTotal function"

# Right
"Write tests for calculateTotal behavior, assuming function doesn't exist.
Then we'll verify the existing implementation passes."
```

**Ошибка**: Объединение красной и зеленой фаз.
```
# Wrong
"Implement calculateTotal with tests"

# Right
"Write failing tests for calculateTotal. Stop there."
[After tests written]
"Now implement to pass those tests."
```

---

## <a name="advanced-patterns"></a>Расширенные шаблоны

### Тестирование на основе свойств

```
Write property-based tests for the sort function.
Properties to test:
- Output length equals input length
- All input elements exist in output
- Output is ordered
Use fast-check or similar library.
```

### Мутационное тестирование

```
After tests pass, run mutation testing to find weak spots.
Identify tests that don't catch mutations.
```

> **Идем дальше**: JiTTesting автоматически применяет мутационное тестирование во время PR: генерируется LLM, эфемерно, не требует обслуживания. Meta развернула это в масштабе с четырехкратным улучшением улавливания регрессии по сравнению с традиционными тестами. См. [«Just-in-time Catching Test Generation» на Meta](https://arxiv.org/abs/2601.22832) и руководство по методологиям [](../core/methodologies.md#jittesting-just-in-time-testing) для получения информации о сегодняшнем шаблоне аппроксимации с помощью Claude Code.

### <a name="tdd-with-legacy-code"></a>TDD с устаревшим кодом

```
I need to refactor legacyFunction.
First, write characterization tests that capture current behavior.
Then we'll refactor with confidence.
```

Тесты характеристик определяют, что делает код сегодня, а не то, что он должен делать. Сохраняйте ненужные результаты: в старой системе часть такого поведения зависит от других команд или бизнеса, и агент с радостью «исправит» это с помощью зеленого набора.

Не позволяйте сеансу, который будет изменять код, быть единственным автором тестов, оценивающих изменение. Затем он пишет пакет, который кодирует реализацию, которую он собирается изобрести. Закрепите поведение в отдельном сеансе, в отдельном коммите, проверенном перед началом рефакторинга, или попросите кого-нибудь написать тесты; затем запустите рефакторинг в новом сеансе, в котором сообщается, что тесты характеристик доступны только для чтения:

```
The tests in tests/characterization/ are read-only.
Refactor legacyFunction until they pass. If a test looks wrong,
stop and report it instead of editing it.
```

Перехватчик `PreToolUse`, который запрещает `Edit` и `Write` в каталоге характеризации, превращает эту инструкцию в гарантию. Источник: Адди Османи, [Brownfield Agentic Engineering](https://addyo.substack.com/p/brownfield-agentic-engineering) (сентябрь 2026 г.); информацию о зонах и полноте миграции в устаревших базах кода см. в разделе [Модернизация устаревшей кодовой базы](../ultimate-guide.md#921-legacy-codebase-modernization).

#### <a name="find-a-seam-before-you-write-the-first-test"></a>Найдите стык, прежде чем писать первый тест

Тесты характеристик предполагают, что вы можете запустить код в тестовой среде. Устаревший код часто отказывается: он открывает SMTP-соединение, считывает часы или обращается к базе данных изнутри функции, которую вы хотите закрепить. Ответ Майкла Фезерса в *Эффективная работа с устаревшим кодом* (2004, глава 4) **шов**: «место, где вы можете изменить поведение вашей программы, не редактируя это место». Каждый шов имеет **разрешающая точка**, место, где вы решаете, какое поведение будет выполняться. Перья называют три вида:

| Шов | Разрешительная точка | Типичное использование |
|------|----------------|-------------|
| Объектный шов | Где объект создается или передается (конструктор, параметр, фабрика) | Первый выбор в объектно-ориентированном коде |
| Связать шов | Вне кода: путь к классам, компоновщик, разрешение модуля (`jest.mock()` — ближайший эквивалент JavaScript) | Жесткий импорт, который вы бы предпочли не редактировать. |
| Предварительная обработка шва | Макросы и флаги компилятора | С и С++ |

Шов и точка включения работают как семантические якоря [](../ultimate-guide.md#29-semantic-anchors): Claude знает книгу, поэтому, назвав их, вы получите структурированный ответ вместо общего «добавьте несколько макетов».

Как только у вас появится шов, выберите тест в зависимости от того, что нужно тесту. *xUnit Test Patterns* (2007) Джерарда Месароса называет пять; В таблице навыков [TDD](../../examples/skills/tdd-workflow.md#test-doubles) перечислены четыре из них:

| Двойной | Используйте его, когда тесту необходимо... |
|--------|----------------------------------|
| Дурачок | Заполните параметр, который путь кода никогда не использует. |
| Заглушка | Управляйте косвенным вводом (что возвращает зависимость: текущее время, ошибка) |
| Шпион | Записывайте косвенные результаты и впоследствии утверждайте их. |
| Насмехаться | Проверка косвенных результатов на соответствие ожиданиям, установленным заранее. |
| Фальшивый | Замените тяжелую зависимость на работающую облегченную (репозиторий в памяти) |

Feathers приводит две причины для разрыва зависимости: *sensing* (вы не можете видеть, что делает код) и *separation* (вы вообще не можете запустить код). Как правило, распознавание призывов к шпиону или издевательству, отделение к огрызку, фейку или подставному лицу. Следите за словарным запасом: Физерс называет своего сенсорного двойника «фальшивым объектом»; с точки зрения Месароша, это шпион. В тестах на определение характеристик шпион обычно обходится без шуток: вы записываете, что делает код сегодня, вместо того, чтобы прописывать его.

**Один пример, от начала до конца.** Эту функцию нельзя запустить в тесте: она отправляет настоящую почту и считывает реальные часы.

```ts
// src/billing/reminders.ts (before)
export function sendOverdueReminders(invoices: Invoice[]) {
  const mailer = new SmtpMailer(process.env.SMTP_HOST);
  const today = new Date();
  for (const inv of invoices) {
    if (!inv.paid && inv.dueDate < today) {
      mailer.send(inv.customerEmail, `Invoice ${inv.id} is overdue`);
    }
  }
}
```

1. Запросите анализ перед любым редактированием:

   ```
   Find the seams in sendOverdueReminders (Feathers, Working Effectively
   with Legacy Code). For each dependency that blocks a unit test, name the
   seam type and its enabling point, and say whether the test needs sensing
   or separation. Then pick a test double from Meszaros' taxonomy and justify
   it in one line. Do not change any code yet.
   ```

   Ожидайте: ни одна из зависимостей еще не имеет стыка, поскольку обе создаются внутри функции. Часы — это косвенный ввод (заглушка), почтовик — косвенный вывод на смысл (шпион).

2. Позвольте Claude внести малейшее изменение, создающее швы, и ничего больше:

   ```
   Create the two object seams with Parameterize Method. Keep the current
   behavior as default arguments so no production caller changes.
   No other edits.
   ```

   ```ts
   type Mailer = Pick<SmtpMailer, 'send'>;

   export function sendOverdueReminders(
     invoices: Invoice[],
     mailer: Mailer = new SmtpMailer(process.env.SMTP_HOST),
     now: () => Date = () => new Date(),
   ) {
     const today = now();
     // loop unchanged; only the two local declarations moved into the signature
   }
   ```

   Ни один тест пока не защищает это изменение, поэтому разница должна быть тривиально проверяемой: подпись, одна измененная строка, одна удаленная строка.

3. Закрепите поведение через швы в отдельном сеансе, как описано выше:

   ```ts
   const now = () => new Date('2026-03-10T09:00:00Z');  // stub

   function sentTo(dueDate: string): string[] {
     const sent: string[] = [];
     const spy: Mailer = { send: (to) => { sent.push(to); } };
     const inv = invoice({ dueDate: new Date(dueDate), paid: false });  // test data builder
     sendOverdueReminders([inv], spy, now);
     return sent;
   }

   it('reminds on the due date itself, not only after it', () => {
     expect(sentTo('2026-03-10T00:00:00Z')).toHaveLength(1);
   });

   it('does not remind before the due date', () => {
     expect(sentTo('2026-03-11T00:00:00Z')).toEqual([]);
   });
   ```

   Первый тест фиксирует странность, о которой стоит помнить: сроки выполнения не связаны с временем суток, поэтому `dueDate < today` истинно в любой момент самой даты выполнения.

4. Проверьте результат, прежде чем доверять ему:
   - Удалите из тестов аргумент `now`: второй должен стать красным, иначе шов часов не используется.
   - Измените сравнение на целые дни (`inv.dueDate.toISOString().slice(0, 10) < today.toISOString().slice(0, 10)`), «исправление», которое может внести агент: первый тест должен стать красным. Если он остается зеленым, он ничего не закрепляет. Сравнивайте в UTC, как здесь; Методы получения даты по местному времени делают результат зависимым от часового пояса компьютера.

---

## Пример сеанса

### Запрос пользователя
```
Implement a URL shortener service with TDD.
```

### Фаза 1: Красный
```
Let's use TDD. First, write failing tests for:
1. Shortening a URL returns a short code
2. Retrieving a short code returns original URL
3. Invalid URLs are rejected
4. Expired links return error

Do NOT implement anything yet.
```

### Фаза 2: Зеленый
```
Tests are written and failing. Now implement the minimum
code to make them pass. Use an in-memory store for now.
```

### Этап 3: Рефакторинг
```
Tests pass. Now refactor:
- Extract URL validation to separate function
- Add proper error types
- Improve variable names

Run tests after each change to ensure they stay green.
```

---

## <a name="see-also"></a>См. также

- [AI Шаблоны проектирования: шаблонный метод](../core/ai-design-patterns.md#template-method): навык, перечисляющий шаги, с перехватчиком Stop, проверяющим последний из них.
- [../core/methodologies.md](../core/methodologies.md): полный справочник методологии
- [Жесткая обратная связь](../ultimate-guide.md): Раздел 9.5
- [examples/skills/tdd-workflow.md](../../examples/skills/tdd-workflow.md): шаблон навыков TDD
- [Anthropic Лучшие практики](https://www.anthropic.com/engineering/claude-code-best-practices)
- [task-management.md](./task-management.md): отслеживайте циклы TDD между сеансами с помощью задач API.
- [Superpowers](https://github.com/obra/superpowers): набор плагинов, который применяет TDD в качестве обязательного шлюза, код, написанный до того, как существует неудачный тест, удаляется и переделывается с нуля. Более строгое соблюдение, чем подсказки вручную.
- [TDD с Claude Code](https://www.florian.bruniaux.com/guides/tdd-with-claude-code/): отдельное практическое руководство по тому же рабочему процессу.
