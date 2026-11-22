---
title: "Динамические рабочие процессы"
description: "JavaScript-оркестрированные многоагентные конвейеры с детерминированным потоком управления, параллельным разветвлением и автоматическим возобновлением"
tags: [workflow, agents, orchestration, parallel, ultracode]
---

# Динамические рабочие процессы

> **JavaScript скрипты, которые координируют работу десятков и сотен субагентов за один сеанс**
> **Представлен**: v2.1.154 (28 мая 2026 г.) | **Ключевое слово-триггер**: `ultracode` (переименовано в `workflow` в версии 2.1.160, критическое изменение) | **Монитор**: `/workflows`

**What**: динамический рабочий процесс — это файл JavaScript, который управляет несколькими субагентами с помощью небольшого набора примитивов (`agent`, `parallel`, `pipeline`, `phase`). Сам сценарий выполняется как оркестратор и не потребляет токены; вся стоимость токена формируется за счет вызовов `agent()`, которые он совершает. Среда выполнения обрабатывает ограничения параллелизма, проверку схемы, отчеты о ходе выполнения и возобновление работы при прерывании.

**При представлении**: v2.1.154 (28 мая 2026 г.). Ключевым словом триггера было `workflow` до версии 2.1.160, где оно было переименовано в `ultracode` (критическое изменение; существующие скрипты, использующие старое ключевое слово, необходимо обновить).
**Время чтения**: ~40 мин.
**Предварительные требования**: Знакомство с инструментом [Agent](../core/tools-reference.md#agent), базовый JavaScript async/await

На этой странице описана одна поверхность реализации Claude Code. [Loop & Graph Engineering](../core/loop-graph-engineering.md) объясняет, когда необходима явная топология и как указывать состояние, переходы, правила остановки, восстановление и оценку независимо от какой-либо инфраструктуры.

---

## Оглавление

1. [Когда использовать рабочие процессы (инструмент агента или навыки)](#1-when-to-use-workflows-vs-agent-tool-vs-skills)
2. [Примитивная ссылка](#2-primitive-reference)
3. [Поведенческие гарантии](#3-behavioral-guarantees)
4. [pipeline() против параллельного(): когда и почему](#4-pipeline-vs-parallel--when-and-why)
5. [Выходы, структурированные по схеме, по фазам](#5-schema-structured-outputs-across-phases)
6. [Общие шаблоны](#6-common-patterns)
7. [Реальный пример рабочего процесса: поток разработки (отправка в PR)](#7-real-workflow-example-dev-flow-issue-to-pr)
8. [Когда НЕ следует использовать рабочие процессы](#8-when-not-to-use-workflows)
9. [Примечания по стоимости и производительности](#9-cost-and-performance-notes)
10. [См. также](#10-see-also)

---

## <a name="1-when-to-use-workflows-vs-agent-tool-vs-skills"></a>1. Когда использовать рабочие процессы (инструмент агента или навыки)

Claude Code предлагает три связанные области для делегирования и многократного использования процедур: инструмент «Агент», «Навыки» и динамические рабочие процессы. Выбор неправильного варианта увеличивает накладные расходы или оставляет предполагаемую гарантию неисполненной.

**Используйте инструмент «Агент» напрямую**, если задача состоит в том, что один субагент выполняет одно действие. Инструмент «Агент» является строительным блоком. Обертывание одного вызова `agent()` в файл рабочего процесса добавляет обходной путь и сценарий, который нужно поддерживать без всякой выгоды.

**Используйте навык**, когда знания или процедуру можно повторно использовать в пределах заявленной области владения, и Claude должен адаптировать свое решение к контексту. Навыки задаются быстро и загружаются в разговор. Они не гарантируют упорядочивание, повторные попытки, необходимые артефакты, возобновление или структурированную передачу управления между этапами.

**Используйте динамический рабочий процесс**, когда выполняются три или более из этих условий: задача имеет несколько этапов, которые перетекают друг в друга, некоторые этапы могут выполняться параллельно, задание достаточно длинное, чтобы иметь значение возобновление при прерывании, вам нужен воспроизводимый путь оркестрации или вам нужны структурированные схемы JSON для передачи данных между этапами. Детерминированный путь не делает выходные данные модели детерминированными.

Граница принятия решения такова: сохранять интерпретацию, двусмысленность и компромиссные суждения в подсказках или навыках. Добавьте в систему необходимый порядок, предварительные условия, повторы, правила остановки и проверки артефактов. Только пронумерованные шаги не требуют кода; гарантия делает.

| Критерий | Инструмент агента | Навык | Динамический рабочий процесс |
|-----------|-----------|-------|-----------------|
| Параллелизм | Нет | Нет | Да (параллельно/конвейерно) |
| Возобновить при прерывании | Нет | Нет | Да (детерминированный повтор) |
| Передача структурированных данных | Руководство | Руководство | Встроенный (проверка схемы) |
| Стоимость токена Оркестратора | Умеренный | Умеренный | Ноль |
| Накладные расходы на установку | Никто | Низкий | Один JS-файл |
| Граница повторного использования | Один звонок | Объявлена ​​личная, проектная, инструментальная или общедоступная область действия. | Через вложение `workflow()` |

---

## <a name="2-primitive-reference"></a>2. Примитивная ссылка

Файл рабочего процесса представляет собой модуль JavaScript с двумя обязательными частями: экспортом `meta` (структурная основа) и функцией экспорта по умолчанию (тело выполнения). Среда выполнения вводит небольшой набор глобальных переменных в область действия функции.

### мета (обязательный, чистый буквальный)

`meta` должен быть первым оператором в файле. Он объявляет идентификатор рабочего процесса и, при необходимости, именованные фазы, которые появляются в пользовательском интерфейсе `/workflows`.

```js
export const meta = {
  name: 'audit-and-verify',
  description: 'Review every changed file, then verify each finding',
  phases: [
    { title: 'Review' },
    { title: 'Verify' },
  ],
};
```

Поля `name` и `description` являются обязательными. `phases` не является обязательным, но рекомендуется: он заполняет боковую панель прогресса в `/workflows`, так что вы можете сразу увидеть, какая фаза выполняется.

`meta` должен быть чистым литералом. Никаких переменных, строк шаблонов, вызовов функций и операторов распространения. Это ограничение существует, поскольку среда выполнения статически извлекает `meta` перед выполнением сценария, что делает заголовки фаз видимыми в пользовательском интерфейсе до запуска рабочего процесса. Любое выражение, требующее вычисления, нарушает статическое извлечение.

Вызовы `meta` и `phase()` образуют «варп» (фиксированную структурную основу пробега). Вызовы `agent()`, `parallel()` и `pipeline()` представляют собой «утку», которая выполняет фактическую работу, пронизывающую эту магистраль.

### агент(подскажите, варианты?)

`agent()` — это основной строительный блок. Каждый вызов создает отдельный субагент со своим изолированным контекстным окном. Субагенты не имеют общего состояния; вся информация должна быть передана явно через командную строку.

```js
export default async function ({ agent, parallel, pipeline, phase, log, args, budget }) {
  const summary = await agent('Summarize the diff in src/api/ added since yesterday.', {
    label: 'API diff summary',
    phase: 'Analyze',
    model: 'claude-sonnet-5-5',
  });

  return summary;
}
```

`agent()` по умолчанию возвращает обычный текст. Если указан `opts.schema` (объект схемы JSON), среда выполнения проверяет ответ и автоматически повторяет попытки, пока выходные данные не будут соответствовать схеме. Это механизм, который делает структурированные многофазные конвейеры надежными: последующие этапы могут зависеть от имен полей без хрупкого анализа регулярных выражений.

Ключевые параметры:

| Вариант | Тип | Цель |
|--------|------|---------|
| `schema` | JSON Объект схемы | Структурированный вывод. Среда выполнения проверяет и повторяет попытки в случае несоответствия. |
| `phase` | нить | Группирует этот вызов в именованную фазу пользовательского интерфейса `/workflows`. |
| `label` | нить | Краткая метка выполнения отображается во время работы агента. |
| `model` | нить | Переопределить модель для этого конкретного вызова. |
| `isolation` | `'worktree'` | Запустите агент в изолированной копии репозитория git worktree. Дорогой; используйте только тогда, когда агенты параллельно изменяют файлы и могут возникнуть конфликты. |

### параллельно(спасибо[])

`parallel()` принимает массив функций с нулевым аргументом (thunk), запускает их все одновременно и возвращает результат, когда завершается самая медленная из них. Результаты возвращаются в порядке ввода независимо от порядка завершения.

```js
const MODULES = ['auth', 'payments', 'notifications'];

const reviews = await parallel(
  MODULES.map((mod) => () =>
    agent(`Review the ${mod} module for security issues.`, {
      phase: 'Review',
      label: mod,
    })
  )
);
```

`parallel()` — примитив барьера. После этого ничего не выполняется, пока не вернутся все агенты в массиве. Неудавшиеся агенты возвращают `null`, поэтому фильтруйте перед использованием:

```js
const valid = reviews.filter(Boolean);
```

Используйте `parallel()`, когда все результаты должны быть доступны, прежде чем можно будет начать следующий шаг: синтез всех результатов, дедупликацию выходных данных или принятие решения о досрочном выходе на основе общего количества.

### конвейер(элементы, ...этапы)

`pipeline()` обрабатывает массив элементов посредством последовательности этапов преобразования. Каждый элемент проходит через все стадии по порядку, но разные элементы могут находиться на разных стадиях одновременно. В конвейере с 10 элементами и 3 этапами элемент 1 может находиться на этапе 3, а элемент 7 все еще находится на этапе 1.

```js
const DIMENSIONS = [
  { id: 'security', prompt: 'Review for injection and auth issues.' },
  { id: 'performance', prompt: 'Review for N+1 queries and slow paths.' },
  { id: 'accessibility', prompt: 'Review for WCAG 2.1 AA compliance.' },
];

const results = await pipeline(
  DIMENSIONS,
  // Stage 1: generate findings
  (dim) =>
    agent(dim.prompt, {
      phase: 'Review',
      label: dim.id,
      schema: FINDINGS_SCHEMA,
    }),
  // Stage 2: verify each finding
  (findings) =>
    parallel(
      findings.issues.map((issue) => () =>
        agent(`Try to refute this finding: "${issue.title}". Is it a real problem?`, {
          phase: 'Verify',
          label: issue.title,
          schema: VERDICT_SCHEMA,
        })
      )
    )
);
```

Функции этапа получают три аргумента: `(previousStageResult, originalItem, index)`. Использование `originalItem` на более поздних этапах является обычным явлением, когда для запроса на этапе 2 требуются как результат этапа 1, так и исходные входные данные.

Не существует глобального барьера между этапами по различным предметам. Именно это делает `pipeline()` эффективным для независимых элементов, которые имеют одну и ту же последовательность стадий.

### фаза (название)

`phase()` — примитив наблюдаемости. Он обновляет заголовок активной фазы в пользовательском интерфейсе `/workflows` для всех последующих вызовов `agent()`, в которых не указан собственный `opts.phase`.

```js
phase('Discovery');
const files = await agent('Find all TypeScript files modified in the last 24 hours.');

phase('Analysis');
const issues = await parallel(/* ... */);

phase('Report');
const report = await agent('Synthesize these findings into an executive summary.');
```

Для детальной группировки внутри `pipeline()` или `parallel()` передайте `phase` в качестве опции непосредственно в `agent()`, а не вызывайте глобальную функцию `phase()`, которая будет участвовать в гонках с одновременными вызовами.

### Другие внедренные глобальные переменные

Помимо `agent`, `parallel`, `pipeline` и `phase`, среда выполнения добавляет еще четыре глобальных значения:

**`log(message)`** выдает сообщение о ходе выполнения на уровне рабочего процесса, видимое в пользовательском интерфейсе `/workflows` и в терминале. Используйте его, чтобы отметить основные переходы или сообщить о промежуточных значениях.

```js
log(`Found ${specs.length} specs in approved status. Starting analysis.`);
```

**`args`** содержит входные данные среды выполнения, передаваемые пользователем или родительским рабочим процессом. Относитесь к нему как к простому объекту; его форма зависит от того, что предоставил вызывающий абонент.

```js
const { issueNumber, targetBranch = 'main' } = args;
```

**`budget`** предоставляет учет токенов для текущего рабочего процесса. `budget.total` — настроенный максимум; `budget.spent()` возвращает текущее использование; `budget.remaining()` возвращает запас. Защитите открытые циклы с помощью этого:

```js
while (budget.remaining() > 50_000) {
  const batch = await agent('Find the next 10 unreviewed specs.');
  if (!batch.length) break;
  // process batch...
}
```

**`workflow(nameOrRef, args?)`** запускает встроенный именованный подпроцесс. Поддерживается один уровень вложенности. Передайте строку имени подпроцесса или ссылку на импорт:

```js
const auditResult = await workflow('security-audit', { target: 'src/api' });
```

---

## <a name="3-behavioral-guarantees"></a>3. Поведенческие гарантии

### Ограничения детерминизма

Сценарий оркестратора должен быть чистым. Некоторые конструкции недоступны или выдают ошибку:

- `Date.now()`, `Math.random()` и `new Date()` без аргументов блокируются. Вместо этого передавайте временные метки и начальные значения через `args`.
- `require`, `fs`, `process` и любой сетевой вызов недоступны в области оркестратора. Все взаимодействие со средой происходит внутри подсказок `agent()`, к которым агент имеет полный доступ к инструментам.

Причиной этих ограничений является резюме. При перезапуске прерванного рабочего процесса среда выполнения воспроизводит сценарий оркестратора сверху и воспроизводит кэшированные результаты для уже завершенных вызовов `agent()`. Если бы оркестратор содержал `Date.now()` или `Math.random()`, воспроизведение приводило бы к другим решениям о ветвлениях, что делало бы кэшированные результаты несовместимыми с новым путем выполнения. Детерминизм — это то, что делает резюме безопасным.

### Проверка схемы и повторная попытка

Когда `agent()` вызывается с `opts.schema`, среда выполнения проверяет возвращаемый текст как JSON на соответствие этой схеме. Если проверка не удалась, среда выполнения повторяет вызов агента с автоматическим запросом исправления. Этот цикл повторов невидим для оркестратора: `agent()` разрешается только тогда, когда выходные данные действительны. Практический эффект заключается в том, что последующие этапы могут деструктурировать `result.fieldName` без защитных проверок, поскольку среда выполнения гарантирует форму.

### Ограничения параллелизма и очередь

Одновременные вызовы `agent()` ограничены `min(16, cpu_cores - 2)`. Вызовы, выходящие за пределы ограничения, автоматически ставятся в очередь и расходуются по мере завершения работы агентов. Это означает, что вы можете безопасно писать `parallel(items.map(...))` для больших массивов; среда выполнения предотвращает громовое стадо без какой-либо ручной пакетной обработки в оркестраторе.

Два жестких ограничения защищают от вышедших из-под контроля скриптов:

- Общее количество вызовов `agent()` в рабочем процессе: ограничено 1000.
- Количество элементов на один вызов `parallel()` или `pipeline()`: ограничено 4096.

Если ваш рабочий процесс превысит 1000 агентов, задачу необходимо разбить на подпотоки или использовать другой подход.

### Кеширование резюме и результатов

Прогресс постоянно проверяется. Когда рабочий процесс прерывается (Ctrl+C, разрыв сети, перезапуск компьютера), его возобновление воспроизводит сценарий оркестратора, но предоставляет кэшированные результаты для каждого вызова `agent()`, который завершился до прерывания. Агенты холодного пути бегут; Агенты «теплого пути» возвращаются мгновенно. Для рабочего процесса с 200 агентами, прерванного на агенте 150, стоимость возобновления равна только оставшимся 50 агентам.

---

## <a name="4-pipeline-vs-parallel-when-and-why"></a>4. конвейер() против параллельного(): когда и почему

Это наиболее распространенный источник проблем с производительностью при проектировании рабочих процессов. Два примитива выглядят одинаково, но имеют принципиально разную семантику.

**`parallel()` — это барьер.** Он одновременно запускает N агентов и блокирует их до тех пор, пока не завершится последний из них. После строки `await parallel(...)` ничего не выполняется, пока не вернутся все агенты в массиве. Время на настенных часах равно времени самого медленного агента.

**`pipeline()` транслируется.** Предметы проходят через этапы без глобального барьера между этапами между предметами. Элемент 3 может перейти на этап 2, в то время как элемент 7 все еще находится на этапе 1. Время на настенных часах зависит от глубины конвейера и продолжительности отдельных этапов, а не от того, какой самый медленный элемент завершает все этапы до запуска любого другого элемента.

Концептуальный вопрос, который следует задать: «Нужны ли для шага N все результаты шага N-1, прежде чем он сможет начаться?» Если да, `parallel()` верен. Если элементы независимы и каждому нужен только собственный результат предыдущего этапа, `pipeline()` является правильным.

### Данные о производительности

Тест сообщества, сравнивающий два примитива с эквивалентной работой (3 предмета, по 2 этапа каждый), дал следующие цифры:

| Дизайн | Стоимость токена | Wall-clock |
|--------|-----------|-----------|
| Барьер `parallel()`, 3 одновременных агента | ~78 844 жетона | ~8.4s |
| Неправильно спроектированный `pipeline()`, 3 предмета x 2 этапа | ~158 982 жетона | ~26.7s |

Основная работа была идентична. Версия `pipeline()` добавила 2x токена и 3x задержку, поскольку конструкция установила барьер на границах этапов, который не требовался для данных.

### Правило принятия решения

Любой рабочий процесс с несколькими объектами можно начинать с `pipeline()`. Устанавливайте барьер `parallel()` только тогда, когда вы можете сформулировать конкретную причину: «Подсказка этапа 2 ссылается на все результаты этапа 1» или «Мне нужно выйти раньше, если общее количество всех элементов равно нулю».

Конкретные примеры, когда барьер `parallel()` оправдан:
- Дедупликация всех результатов перед представлением результатов пользователю
- Этап синтеза, подсказка которого буквально гласит: «Учитывая все результаты предыдущего этапа…».
- Проверка раннего выхода: если ни один элемент на этапе 1 не дал результатов, полностью пропустите этап 2.

Конкретные примеры, когда `pipeline()` является правильным выбором:
- Проверьте каждый файл на наличие проблем с безопасностью, а затем проверьте каждый результат отдельно для каждого файла.
- Создайте сводку для каждой спецификации, а затем отформатируйте каждую сводку в табеле успеваемости.
- Проанализируйте каждый модуль, затем создайте оценочную карту для каждого модуля.

### Неправильно используйте шаблоны, которых следует избегать

**Использование `pipeline()` для независимых измерений, принадлежащих `parallel()`**: если измерения действительно ортогональны (проверка безопасности, проверка производительности и проверка доступности) и ни один этап не требует данных перекрестных измерений, `parallel()` создает барьер один раз в конце и является более простым.

**Использование `parallel()`, когда элементы независимы.**: Если каждый из 50 файлов проходит проверку + проверку независимо, объединение всех 100 вызовов агента в один `parallel([...50 reviews, ...50 verifies])` разрушает структуру этапа и делает код нечитаемым. `pipeline()` сохраняет четкость этапов.

**Открытые циклы без защиты `budget`**: Цикл обнаружения `while(true)`, который продолжает создавать агентов до тех пор, пока не «перестанет находить элементы», достигнет ограничения в 1000 агентов и потерпит неудачу. Берегите каждую петлю:

```js
while (dry < 3 && budget.remaining() > 30_000) {
  // ...
}
```

---

## <a name="5-schema-structured-outputs-across-phases"></a>5. Результаты, структурированные по схеме, на разных этапах

Схемы — это то, что превращает многофазный конвейер из цепочки преобразований текста в текст в типизированный конвейер с надежным доступом к полям на каждом этапе.

### Определение схем

Объекты схемы JSON встроены в файл рабочего процесса:

```js
const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['issues'],
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'description', 'severity'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        },
      },
    },
  },
};

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['isReal', 'reason'],
  properties: {
    isReal: { type: 'boolean' },
    reason: { type: 'string' },
  },
};
```

### Открытие → понять → спланировать

Трехэтапный конвейер, в котором каждый этап основывается на предыдущем:

```js
export const meta = {
  name: 'spec-processor',
  description: 'Discover approved specs, understand each one, produce implementation plan',
  phases: [
    { title: 'Discovery' },
    { title: 'Understand' },
    { title: 'Plan' },
  ],
};

const DISCOVERY_SCHEMA = {
  type: 'object',
  required: ['specs'],
  properties: {
    specs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'path'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          path: { type: 'string' },
        },
      },
    },
  },
};

const UNDERSTANDING_SCHEMA = {
  type: 'object',
  required: ['id', 'summary', 'dependencies', 'estimatedComplexity'],
  properties: {
    id: { type: 'string' },
    summary: { type: 'string' },
    dependencies: { type: 'array', items: { type: 'string' } },
    estimatedComplexity: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
};

export default async function ({ agent, parallel, phase, log }) {
  phase('Discovery');
  const discovery = await agent(
    'Find every spec file in docs/specs/ with status: approved in its frontmatter.',
    { schema: DISCOVERY_SCHEMA, label: 'Scanning specs' }
  );

  log(`Found ${discovery.specs.length} approved specs.`);

  phase('Understand');
  const understood = await parallel(
    discovery.specs.map((spec) => () =>
      agent(
        `Read the spec at ${spec.path} and identify its dependencies on other specs and modules.`,
        { schema: UNDERSTANDING_SCHEMA, label: spec.id }
      )
    )
  );

  const validUnderstood = understood.filter(Boolean);

  phase('Plan');
  const plan = await agent(
    `Given these ${validUnderstood.length} understood specs with their dependencies, 
    produce a topologically sorted implementation order. Specs with no dependencies come first.
    Specs: ${JSON.stringify(validUnderstood, null, 2)}`,
    { label: 'Building implementation plan' }
  );

  return plan;
}
```

### Схема аудита и проверки

Две цепочки схем реализуют состязательную проверку: первая волна генерирует выводы, вторая волна пытается опровергнуть каждую из них:

```js
export default async function ({ agent, parallel, pipeline }) {
  const DIMENSIONS = [
    { id: 'security', prompt: 'Review the changed files for injection, auth, and access control issues.' },
    { id: 'performance', prompt: 'Review the changed files for slow queries, N+1 patterns, and unbounded loops.' },
    { id: 'data-integrity', prompt: 'Review the changed files for missing validations and race conditions.' },
  ];

  const results = await pipeline(
    DIMENSIONS,
    // Stage 1: generate findings per dimension
    (dim) =>
      agent(dim.prompt, {
        phase: 'Review',
        label: dim.id,
        schema: FINDINGS_SCHEMA,
      }),
    // Stage 2: verify each finding independently
    (findings) =>
      parallel(
        findings.issues.map((issue) => () =>
          agent(
            `A reviewer found this issue: "${issue.title}" (${issue.description}). 
            Try your hardest to refute it. Is it a real problem or a false positive?`,
            {
              phase: 'Verify',
              label: issue.title,
              schema: VERDICT_SCHEMA,
            }
          )
        )
      )
  );

  // Flatten and keep only confirmed findings
  const confirmed = results
    .flat()
    .filter((verdicts) => verdicts !== null)
    .flat()
    .filter((v) => v?.isReal);

  return confirmed;
}
```

Реальный PR-анализ, проведенный с использованием этого шаблона, сократил 26 первоначальных результатов до 16 после того, как состязательная проверка устранила 10 ложных срабатываний.

---

## <a name="6-common-patterns"></a>6. Общие закономерности

### Состязательная проверка

Второй волне агентов поручено опровергнуть результаты первой волны. Это работает, потому что агентов первой волны просили найти проблемы, а не оценивать их серьезность или достоверность. Специальный агент по опровержению, не имея ничего, кроме результатов и исходного материала, улавливает предположения рецензента, которые не соответствуют контексту.

Этот шаблон выходит за рамки проверки кода: любая ситуация, когда первый проход генерирует кандидатов (ошибки, ключевые слова, архитектурные риски, ошибки перевода), выигрывает от специального прохода опровержения, прежде чем на основании результатов будут действовать.

### Loop-until-dry

Открытие продолжается до тех пор, пока K последовательных раундов не принесут новых предметов. Сочетание дедупликации набора `seen` со счетчиком `dry` и защитой `budget` создает безопасный цикл исследования:

```js
const seen = new Set();
const confirmed = [];
let dry = 0;

while (dry < 2 && budget.remaining() > 30_000) {
  const raw = await agent(
    `Find up to 10 TypeScript files that are not yet covered by a test. 
    Already found: ${JSON.stringify([...seen])}. 
    Return an empty array if none remain.`,
    { schema: BATCH_SCHEMA }
  );

  const fresh = raw.files.filter((f) => !seen.has(f.path));

  if (!fresh.length) {
    dry++;
    continue;
  }

  dry = 0;
  fresh.forEach((f) => seen.add(f.path));
  confirmed.push(...fresh);
}
```

Набор дедупликации должен отслеживать элементы, отклоненные в предыдущих раундах, а не только подтвержденные элементы. Отслеживание только `confirmed` означает, что отвергнутые однажды предметы снова появятся в следующем раунде, предотвращая исчерпание цикла.

### Судейские коллегии

Несколько независимых агентов оценивают один и тот же результат, после чего следует этап синтеза. Это полезно, когда решение одного агента недостаточно надежно для принятия важных решений (утверждение архитектуры, утверждение безопасности, контроль качества для автоматического развертывания).

```js
const JUDGE_SCHEMA = {
  type: 'object',
  required: ['score', 'confidence', 'rationale'],
  properties: {
    score: { type: 'number', minimum: 0, maximum: 10 },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    rationale: { type: 'string' },
  },
};

export default async function ({ agent, parallel, log, budget }) {
  const artifact = await agent('Summarize the implementation in src/payments/ in detail.');

  const judges = await parallel([
    () => agent(`Judge this implementation for correctness: ${artifact}`, { schema: JUDGE_SCHEMA, label: 'judge-correctness' }),
    () => agent(`Judge this implementation for security: ${artifact}`, { schema: JUDGE_SCHEMA, label: 'judge-security' }),
    () => agent(`Judge this implementation for maintainability: ${artifact}`, { schema: JUDGE_SCHEMA, label: 'judge-maintainability' }),
  ]);

  const valid = judges.filter(Boolean);
  const avgScore = valid.reduce((sum, j) => sum + j.score, 0) / valid.length;
  log(`Panel scores: ${valid.map((j) => j.score).join(', ')} → avg ${avgScore.toFixed(1)}`);

  const synthesis = await agent(
    `Three judges reviewed the same implementation with these results: 
    ${JSON.stringify(valid, null, 2)}. 
    Produce a final verdict. Where judges disagree, explain the tension. 
    Recommend approve or request-changes with specific action items.`
  );

  return synthesis;
}
```

Версия с контролем бюджета запускает судейские комиссии в цикле до тех пор, пока не будет достигнут консенсус или пока бюджет не будет исчерпан:

```js
while (budget.total && budget.remaining() > 50_000) {
  const panel = await parallel([/* judges */]);
  const scores = panel.filter(Boolean).map((j) => j.score);
  const spread = Math.max(...scores) - Math.min(...scores);
  if (spread <= 1.5) break; // consensus reached
  // otherwise, run another round with the previous rationales as context
}
```

### Мультистратегическая зачистка

`parallel()` запускает несколько агентов, решающих одну и ту же проблему с разными стратегиями или источниками. Результаты синтезируются с использованием перекрестной проверки. Обычное использование: исследовательские задачи (официальная документация + выпуски GitHub + сообщения в блогах), задачи анализа (строгий критик + оптимистичный читатель + эксперт в предметной области).

```js
const strategies = [
  { label: 'official-docs', prompt: `Based only on official Anthropic documentation, explain...` },
  { label: 'community-reports', prompt: `Based only on GitHub issues and community reports, explain...` },
  { label: 'academic', prompt: `Based only on academic papers and benchmarks, explain...` },
];

const perspectives = await parallel(
  strategies.map((s) => () => agent(s.prompt, { label: s.label, schema: PERSPECTIVE_SCHEMA }))
);

const synthesis = await agent(
  `You have ${perspectives.filter(Boolean).length} independent perspectives on the same question. 
  Identify where they agree (high confidence), where they contradict (flag explicitly), 
  and produce a synthesis that is honest about uncertainty.
  Perspectives: ${JSON.stringify(perspectives.filter(Boolean), null, 2)}`
);
```

### Планирование – выполнение – обзор

Трехэтапная структура, в которой на первом этапе разрабатывается подход (обычно быстрый и дешевый), на втором этапе реализуется для каждого файла или модуля (обычно дорогостоящий параллельный этап), а на третьем этапе проверяется результат.

```js
// Phase 1: Plan (small cluster of agents or a single structured agent)
phase('Plan');
const plan = await agent(
  'Given the failing tests in __tests__/, design a step-by-step fix plan. Return a structured list of files to change and why.',
  { schema: PLAN_SCHEMA }
);

// Phase 2: Execute (implement per file in parallel where safe)
phase('Execute');
const changes = await parallel(
  plan.changes
    .filter((c) => !c.requiresSequentialOrder)
    .map((change) => () =>
      agent(`Apply this specific change: ${change.description}. File: ${change.file}. Do not touch other files.`, {
        label: change.file,
        isolation: 'worktree', // each agent gets isolated repo copy
      })
    )
);

// Phase 3: Review (adversarial check on the implemented changes)
phase('Review');
const verdict = await agent(
  'Run the test suite and review every changed file. Report pass/fail with specifics.',
  { schema: VERDICT_SCHEMA }
);
```

Обратите внимание на опцию `isolation: 'worktree'` на этапе выполнения. Когда несколько агентов будут писать в один и тот же репозиторий параллельно, каждому потребуется изолированная копия, чтобы избежать конфликтов. Изоляция рабочего дерева требует больших затрат (полная копия репозитория на каждого агента) и ее следует использовать только в том случае, если агенты действительно одновременно изменяют файлы.

---

## <a name="7-real-workflow-example-dev-flow-issue-to-pr"></a>7. Реальный пример рабочего процесса: процесс разработки (отправка в PR)

Полный рабочий процесс, который принимает номер проблемы GitHub и создает готовый к слиянию запрос на включение. Шесть этапов, охватывающих полный цикл разработки:

```js
export const meta = {
  name: 'dev-flow',
  description: 'Issue to LGTM: analyze → plan → implement → test → evaluate → PR',
  phases: [
    { title: 'Setup' },
    { title: 'Analyze' },
    { title: 'Plan' },
    { title: 'Implement' },
    { title: 'Validate' },
    { title: 'Evaluate' },
    { title: 'PR' },
  ],
};

const ANALYSIS_SCHEMA = {
  type: 'object',
  required: ['summary', 'affectedModules', 'acceptanceCriteria', 'estimatedComplexity'],
  properties: {
    summary: { type: 'string' },
    affectedModules: { type: 'array', items: { type: 'string' } },
    acceptanceCriteria: { type: 'array', items: { type: 'string' } },
    estimatedComplexity: { type: 'string', enum: ['low', 'medium', 'high'] },
  },
};

const PLAN_SCHEMA = {
  type: 'object',
  required: ['steps'],
  properties: {
    steps: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'description', 'canParallelize'],
        properties: {
          file: { type: 'string' },
          description: { type: 'string' },
          canParallelize: { type: 'boolean' },
        },
      },
    },
  },
};

const VALIDATION_SCHEMA = {
  type: 'object',
  required: ['passed', 'failedTests', 'summary'],
  properties: {
    passed: { type: 'boolean' },
    failedTests: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
};

export default async function ({ agent, parallel, phase, log, args }) {
  const { issueNumber, targetBranch = 'main' } = args;

  // Setup: read current state
  phase('Setup');
  const context = await agent(
    `Read the GitHub issue #${issueNumber} and the current state of the codebase. 
    Summarize the repo structure relevant to this issue.`,
    { label: `Issue #${issueNumber}` }
  );

  // Analyze: understand scope and acceptance criteria
  phase('Analyze');
  const analysis = await agent(
    `Given this context: ${context}
    Analyze issue #${issueNumber} in depth. 
    Identify every file that will need to change, define acceptance criteria, and estimate complexity.`,
    { schema: ANALYSIS_SCHEMA, label: 'Deep analysis' }
  );

  log(`Scope: ${analysis.affectedModules.length} modules, complexity: ${analysis.estimatedComplexity}`);

  // Plan: produce file-level implementation steps
  phase('Plan');
  const plan = await agent(
    `Based on this analysis: ${JSON.stringify(analysis, null, 2)}
    Produce a concrete, file-level implementation plan. 
    Mark which steps can be parallelized (no shared state) and which must be sequential.`,
    { schema: PLAN_SCHEMA, label: 'Implementation plan' }
  );

  // Implement: parallel where safe, sequential where not
  phase('Implement');
  const parallelSteps = plan.steps.filter((s) => s.canParallelize);
  const sequentialSteps = plan.steps.filter((s) => !s.canParallelize);

  if (parallelSteps.length > 0) {
    await parallel(
      parallelSteps.map((step) => () =>
        agent(
          `Implement this change: ${step.description}. 
          Only modify ${step.file}. Do not change any other file.`,
          { label: step.file, isolation: 'worktree' }
        )
      )
    );
  }

  for (const step of sequentialSteps) {
    await agent(
      `Implement this change: ${step.description}. File: ${step.file}.`,
      { label: step.file, phase: 'Implement' }
    );
  }

  // Validate: run tests and check acceptance criteria
  phase('Validate');
  const validation = await agent(
    `Run the full test suite. Then check each acceptance criterion: 
    ${analysis.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}
    Report pass/fail per criterion.`,
    { schema: VALIDATION_SCHEMA, label: 'Test + AC check' }
  );

  log(`Tests: ${validation.passed ? 'PASS' : 'FAIL'}. Failed: ${validation.failedTests.length}`);

  if (!validation.passed) {
    // Attempt automated fix for failed tests
    phase('Evaluate');
    await agent(
      `These tests are failing: ${validation.failedTests.join(', ')}. 
      Diagnose and fix them without changing the acceptance criteria behavior.`
    );
  }

  // PR: open the pull request
  phase('PR');
  const pr = await agent(
    `Create a pull request from the current branch to ${targetBranch}.
    Title: derived from issue #${issueNumber} title.
    Body: summary of changes, acceptance criteria status, test results.
    Use gh pr create.`,
    { label: 'Opening PR' }
  );

  return pr;
}
```

Запуск этого рабочего процесса: сообщите Claude «поток разработки Ultracode с номером проблемы = 42», и он выполнит полный цикл автономно. Панель `/workflows` показывает каждый этап по мере его развития.

---

## <a name="8-when-not-to-use-workflows"></a>8. Когда НЕ использовать рабочие процессы

Динамические рабочие процессы несут реальные накладные расходы: один файл JS для записи и обслуживания, панель терминала для мониторинга и немного большее время запуска при инициализации среды выполнения. Некоторые ситуации не оправдывают таких накладных расходов.

**Один агент, одна задача.** Если работу можно выразить в виде одного вызова инструмента агента, сделайте это. Рабочий процесс, заключающий в себя один вызов `agent()`, ничего не добавляет.

**Простой рефакторинг и исправление ошибок.** Переименование переменной в 20 файлах, исправление опечатки в конфигурации, добавление отсутствующего импорта: это задачи одного агента, даже если они затрагивают несколько файлов. Накладные расходы на оркестровку добавляют в журналы секунды и шум.

**Процедуры многократного использования, в которых Claude выбирает шаги.** Если вы хотите, чтобы Claude адаптировал подход на основе того, что он находит во время выполнения (а не фиксированного графика стадий), то навык — подходящий инструмент. Навыки управляются быстро и легко компонуются; Рабочие процессы управляются кодом и структурированы.

**Открытое исследование без бюджетной дисциплины.** Рабочий процесс, который запускает `agent()` в цикле без защиты `budget`, непредсказуемо превысит ограничение в 1000 агентов. Если задача действительно не имеет ограниченного условия остановки, отслеживаемый интерактивный сеанс безопаснее.

**Недетерминированная логика оркестровки.** Если сценарий рабочего процесса использует `Math.random()` или `Date.now()`, возобновление будет работать неправильно. Сценарии, которые невозможно сделать детерминированными, не должны быть рабочими процессами.

**Слабые схемы или их отсутствие на разных этапах.** Схемы не являются технически обязательными, но рабочие процессы без них снова деградируют до хрупкого анализа текста. Если вы не можете определить, какие данные каждая фаза должна передать следующей, задачу, вероятно, лучше решить в рамках одного диалогового сеанса, где Claude синтезирует все.

| Ситуация | Лучший подход |
|-----------|----------------|
| Один агент, одна четкая задача | Инструмент агента напрямую |
| Многоразовая, быстрая процедура | Навык |
| Простое редактирование множества файлов | Один агент с возможностью редактирования нескольких файлов |
| Открытый чат и исследование | Интерактивная сессия |
| Сложная слаженная работа, несколько команд | Команды агентов (экспериментальная) |
| Многоэтапный, параллельный, воспроизводимый | Динамический рабочий процесс |

---

## <a name="9-cost-and-performance-notes"></a>9. Примечания по стоимости и производительности

Сам сценарий оркестратора стоит ноль токенов. Вся стоимость токенов поступает от вызовов `agent()`. Это имеет полезный смысл: вы можете сделать оркестратор настолько сложным, насколько это необходимо (циклы, условные выражения, определения схемы, вспомогательные функции) без каких-либо дополнительных затрат.

Параллельное разветвление значительно сокращает время работы независимых подзадач. Проверенный пример из кулинарной книги сообщества: 6 параллельных агентов исправили 5 README за 37 секунд, тогда как последовательное выполнение одной и той же работы заняло бы примерно 3–5 минут.

Последовательные этапы в `pipeline()` добавляют необходимую задержку для каждого этапа. Затраты оправданы, если этапы имеют подлинные зависимости данных. Это неоправданно, когда этапы представляют собой независимые измерения, имеющие общую структуру кода; в этом случае `parallel()` с единственным барьером на конце обходится дешевле.

Практическая модель затрат для типичного рабочего процесса:

| Компонент | Стоимость токена | Вклад настенных часов |
|-----------|-----------|------------------------|
| Оркестратор JS | 0 | Миллисекунды |
| Каждый вызов `agent()` | 2–20 тыс. в зависимости от подсказки и контекста | Последовательный: доминантный; Параллельно: амортизируется |
| Повторная попытка проверки схемы | 1–2 раза за неудачную проверку | Редко с хорошо продуманными схемами |
| `isolation: 'worktree'` | Накладные расходы на копирование Git | +2–5 секунд на агента в крупных репозиториях |

Эмпирическое правило сообщества Anthropic: «Если вы можете набросать нетривиальную блок-схему с параллельными ветвями, циклами и передачей данных между этапами, скорее всего, вам подойдут динамические рабочие процессы». Тест блок-схемы не позволяет вам использовать рабочие процессы для решения действительно простых задач.

### Мониторинг и отладка

Откройте `/workflows` в любом сеансе Claude Code, чтобы увидеть:
- Все запущенные и недавно завершенные рабочие процессы
- Текущая фаза и метка активного агента для запуска рабочих процессов
- Количество агентов на каждом этапе и статус завершения
- Сообщения `log()`, отправляемые оркестратором

Когда рабочий процесс дает неожиданные результаты, наиболее эффективным подходом к отладке является добавление вызовов `log()` до и после основных этапов для подтверждения промежуточных данных, а затем добавление или ужесточение схем для раннего выявления неверных промежуточных выходных данных, вместо того, чтобы позволить им распространяться на финальную фазу.

---

## <a name="10-see-also"></a>10. См. также

- **[AI Шаблоны проектирования](../core/ai-design-patterns.md#orchestrator-workers)**: рабочие-оркестраторы и Scatter-Gather как именованные шаблоны, с их режимами сбоя и проверками.
- **[Справочник по инструментам, раздел «Рабочий процесс».](../core/tools-reference.md#workflow-dynamic-workflows-v21154)**: каноническое описание инструмента, ключевое слово триггера и флаги CLI.
- **[Команды агентов](./agent-teams.md)**: экспериментальная многоагентная координация для задач с большим объемом чтения с одноранговым обменом сообщениями; отличается от рабочих процессов (нет оркестратора JS, координация на основе git)
- **[Рабочий процесс, управляемый планом](./plan-driven.md)**: шаблон «планирование, а затем выполнение человеком в цикле»; уместно, если вы хотите просмотреть план перед началом выполнения
- **[Управление задачами](./task-management.md)**: задачи API для сохранения между сеансами; дополняет рабочие процессы, отслеживая статус высокого уровня вне сеанса
- **[Spec-First](./spec-first.md)**: написание спецификаций перед кодом; фаза открытия многих рабочих процессов выигрывает от уже существующих структурированных спецификаций
