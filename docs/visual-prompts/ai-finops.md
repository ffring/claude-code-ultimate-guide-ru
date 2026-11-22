# Визуальные подсказки AI FinOps

Эти подсказки иллюстрируют раздел AI FinOps: три режима затрат, карта рычагов и эталонная рабочая нагрузка, оцененная для разных поставщиков. Каждая видимая строка происходит от `guide/ops/ai-finops.md` или `guide/ops/llm-market-snapshot.md` (цены указаны 30 сентября 2026 г.). Создавайте одно изображение для каждой подсказки с помощью Gemini 3 Pro Image, проверяйте каждую отображаемую метку и номер по исходной таблице перед публикацией и преобразуйте выбранный источник в WebP в его исходном размере (Gemini вернул разрешение 1376 x 768; изображения не были масштабированы).

## Запись отбора

| Опубликованный ресурс | Статус |
|---|---|
| `finops-cost-regimes.webp` | Выбрано с первой попытки: каждая метка соответствует `ai-finops.md` §1. |
| `finops-lever-map.webp` | Выбрано с первой попытки: все десять строк, точки и пределы соответствуют `ai-finops.md` §3 |
| `finops-loop.webp` | Выбрано с первой попытки: все семь вопросов соответствуют `ai-finops.md` §2 (один сокращенно: «наилучшее соотношение сбережений к риску»); стрелки бегут «Информировать», «Оптимизировать», «Управлять», вернуться к «Информировать». |
| `finops-claims-check.webp` | Выбрано с первой попытки: каждая метка соответствует `llm-market-snapshot.md` (дата моментального снимка данных и §7). |
| `finops-reference-workload.webp` | Выбрано с первой попытки: все десять значений соответствуют `llm-market-snapshot.md` §5; длины полос проверены пропорционально в пределах нескольких пикселей |

## Общее художественное направление

Используйте теплый кремовый фон из миллиметровки (`#f5f1e8`), тонкую сетку (`#d4cfb8`), четкие темные линии (`#1a1a1a`) и сдержанные оранжевые (`#d97706`), зеленые (`#16a34a`) и желтые (`#fbbf24`) акценты. Зарезервируйте красный для предупреждений. Не используйте фотографии, 3D-изображения, талисманы, декоративные рисунки, логотипы компаний, номера страниц или дополнительные заголовки. Весь видимый текст — английский. Не используйте длинные тире. Запрошенный формат 16:9.

## 1. Три режима затрат

Выход: `guide/images/finops-cost-regimes.webp`

Альтернативный текст: три режима стоимости для агентов кодирования, квоты подписки, измеренных токенов API, а также собственных или арендованных мощностей, каждый со своими собственными единицами измерения и драйверами стоимости, проиллюстрировано OpenAI в сентябре 2026 года, сократив вдвое квоту Pro на 200 долларов США и указав GPT-6.1 Sol по одной пятой ставки GPT-6 Astra API.

```text
Create a clean editorial infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706), green (#16a34a) and yellow (#fbbf24) accents, red only for the warning. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly the English strings listed below, spelled correctly, each appearing exactly once. Do not use em dashes. Do not add any other words, numbers, or labels.

Headline at top left, large bold sans-serif: "THREE COST REGIMES MOVE INDEPENDENTLY"

Below the headline, three equal vertical columns side by side, each a flat card with a thin ink border.

Column one, title: "SUBSCRIPTION QUOTA". Under it a small monospace label "UNIT" followed by the text "Share of an allowance not published in tokens". Then a small monospace label "MOVED BY" followed by three short lines: "Plan multipliers", "5-hour and weekly windows", "Model weighting".

Column two, title: "METERED API TOKENS". Monospace label "UNIT" followed by "Price per 1M input, cached, and output tokens". Monospace label "MOVED BY" followed by three short lines: "List price", "Cache and batch discounts", "Tokenizer changes".

Column three, title: "OWNED OR RENTED CAPACITY". Monospace label "UNIT" followed by "GPU-hours divided by useful work". Monospace label "MOVED BY" followed by three short lines: "Hardware and rental prices", "Utilization", "Operating staff".

Below columns one and two only, a wide horizontal band titled "OPENAI, SEPTEMBER 2026". Inside it, two side-by-side facts. Under column one: a downward orange arrow with the text "ChatGPT Pro $200: 20x Plus becomes 10x Plus, same price". Under column two: a downward green arrow with the text "API: GPT-6.1 Sol at $2 / $10, one fifth of GPT-6 Astra". Between the two facts a thin vertical divider. Under column three, leave the band area empty.

Bottom strip with a small red warning marker and the text: "Do not convert a quota into tokens."

Footer at bottom right in small monospace: "Prices read 2026-09-30"
```

## 2. Карта рычага

Выход: `guide/images/finops-lever-map.webp`

Альтернативный текст: десять рычагов затрат для агентов кодирования, сопоставленных с режимом затрат, в котором каждый действует, подпиской, API или мощностью, с пределом, который каждый рычаг оставляет нерешенным, от маршрутизации по сложности задачи до локального или арендованного вывода.

```text
Create a clean technical infographic for a documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706), green (#16a34a) and yellow (#fbbf24) accents. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly the English strings listed below, spelled correctly, each appearing exactly once. Do not use em dashes. Do not add any other words, numbers, or labels.

Headline at top left, large bold sans-serif: "TEN COST LEVERS, TEN LIMITS"

Layout: a grid with ten rows and five columns. The first row is a header row. Column headers, left to right, in small monospace capitals: "LEVER", "SUB", "API", "CAPACITY", "WHAT IT DOES NOT SOLVE".

The three middle columns are narrow check columns. In each row, put a solid filled orange dot in a check column when the lever acts on that regime, and leave the cell empty otherwise. The one hollow dot is described below.

Rows, top to bottom. Each row lists: lever name in bold; dots; then the limit text in regular weight.

Row 1: "Route by task complexity". Dots in SUB and API. Limit: "Hard tasks stay expensive; a wrong route costs a retry".
Row 2: "Prompt caching". Dot in API only. Limit: "Any prefix change invalidates the cache".
Row 3: "Batch processing". Dot in API only. Limit: "24-hour asynchronous window, not interactive".
Row 4: "Off-peak pricing". Solid dot in API. Hollow orange ring (not filled) in SUB. Limit: "Few providers publish it; schedules change".
Row 5: "Tool output compression". Dots in SUB and API. Limit: "A lossy filter can force a rerun".
Row 6: "Read delegation". Dots in SUB and API. Limit: "Worker model tokens are still billed".
Row 7: "Sub-agent isolation and caps". Dots in SUB and API. Limit: "Poorly scoped sub-agents repeat work".
Row 8: "Provider portability". Dot in API only. Limit: "Models are not interchangeable".
Row 9: "Plan portfolio". Dot in SUB only. Limit: "Quotas stay revocable".
Row 10: "Local or rented inference". Dot in CAPACITY only. Limit: "Idle hardware still costs money".

Thin horizontal ink rules between rows. The CAPACITY column has exactly one dot, in row 10.

Below the grid, a small legend: a solid orange dot followed by "Acts on this regime" and a hollow orange ring followed by "Some coding plans only".

Footer strip at bottom: "Measure cost per accepted task before and after each lever."
```

## 3. Ориентировочная стоимость рабочей нагрузки

Выход: `guide/images/finops-reference-workload.webp`

Альтернативный текст: один гипотетический день работы агента, 20 миллионов входных токенов, из которых 16 миллионов обслуживаются из кэша и 0,4 миллиона выходных токенов, цены указаны по прейскуранту, опубликованному на 30 сентября 2026 года, в диапазоне от 76 долларов США для OpenAI GPT-6 Astra до 0,76 долларов США для OpenAI GPT-6 Luna за то же количество токенов.

```text
Create a clean editorial data infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706) bars. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly the English strings and numbers listed below, spelled correctly, each appearing exactly once. Do not use em dashes. Do not add any other words, numbers, axis ticks, or labels.

Headline at top left, large bold sans-serif: "ONE DAY OF AGENT WORK, SAME TOKENS, 100x PRICE RANGE"

Left third of the canvas: a vertical stack of three token blocks drawn as proportional stacked rectangles, labeled "16M cached input" (largest block, light orange), "4M uncached input" (medium block, orange), and "0.4M output" (thin block, dark ink). Above the stack the label "THE WORKLOAD". Below the stack, in monospace: "Cost = 4 x input + 16 x cached + 0.4 x output (per 1M)".

Right two thirds: a horizontal bar chart with ten rows, sorted from largest to smallest. Each row has the model label on the left, a flat orange bar whose length is proportional to the value, and the value in monospace at the right end of the bar. Bar lengths must be proportional: the first bar spans the full chart width, and the last bar is one hundredth of it.

Rows, top to bottom, label then value:
"OpenAI GPT-6 Astra" "$76.00"
"Claude Opus 5.5" "$27.20"
"Moonshot Kimi K3" "$22.80"
"OpenAI GPT-6 Sol" "$15.20"
"Claude Sonnet 5.5" "$15.20"
"Z.AI GLM-5.3" "$11.52"
"DeepSeek V4 Pro, peak" "$7.57"
"Groq GPT-OSS 120B" "$2.04"
"DeepSeek Flash, peak" "$1.78"
"OpenAI GPT-6 Luna" "$0.76"

Under the chart, one line in regular weight: "Same token count, not the same work done. Failed attempts and tokenizer differences are not included."

Footer at bottom right in small monospace: "List prices read 2026-09-30"
```

Строки без опубликованной цены кэшированных входов (xAI Grok 4.7, Mistral Devstral 2, OVHcloud GPT-OSS 120B) исключены из диаграммы, поскольку их значение является верхней границей; их хранит исходная таблица в `guide/ops/llm-market-snapshot.md` §5.

## 4. Цикл FinOps

Вывод: `guide/images/finops-loop.webp` (также показано на целевой странице `/finops/`).

Альтернативный текст: Цикл FinOps для агентов по кодированию: информировать, оптимизировать и работать в цикле вокруг стоимости каждой принятой задачи, с вопросами, на которые отвечает каждый этап, от того, сколько стоит единица принятой работы сегодня до того, когда цены будут перепроверены.

```text
Create a clean editorial infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706), blue (#3b82f6) and green (#16a34a) accents. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly the English strings listed below, spelled correctly, each appearing exactly once. Do not use em dashes. Do not add any other words, numbers, or labels.

Headline at top left, large bold sans-serif: "THE FINOPS LOOP FOR CODING AGENTS"

Center of the canvas: a large circular cycle made of three thick curved arrows that chase each other clockwise, forming a closed loop. On the loop sit three phase nodes, evenly spaced: top left node "INFORM" (orange), right node "OPTIMIZE" (blue), bottom left node "OPERATE" (green). The arrows go from INFORM to OPTIMIZE, from OPTIMIZE to OPERATE, and from OPERATE back to INFORM.

Inside the circle, in the exact center, a small ink-bordered box with two lines: "COST PER" on the first line and "ACCEPTED TASK" on the second line.

Next to each node, outside the circle, a flat card with a thin border in the node's color, containing that phase's questions as short lines with a small square bullet:

INFORM card (placed at the left, near the INFORM node):
"What does a unit of accepted work cost today?"
"How close are we to plan limits?"

OPTIMIZE card (placed at the right, near the OPTIMIZE node):
"Which lever has the best saving-to-risk ratio?"
"Is a cheaper provider or model good enough?"

OPERATE card (placed at the bottom, near the OPERATE node):
"Who can spend what?"
"Which plans and providers do we hold?"
"When do we re-check prices?"

Footer at bottom right in small monospace: "Phases from the FinOps Foundation framework"
```

## 5. Как проверялся снимок

Вывод: `guide/images/finops-claims-check.webp` (также показано на целевой странице `/finops/`).

Альтернативный текст: Как проверялся снимок цен: утверждения из сводки, созданной ИИ, перечитывались на страницах цен поставщиков, в справочных центрах, документации API и журналах изменений; Прейскурантные цены сохранялись почти везде, а ошибки группировались в датах, условиях плана и атрибуции моделей.

```text
Create a clean editorial infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706) and green (#16a34a) accents, muted red (#b91c1c) only for the rejected claims. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly the English strings listed below, spelled correctly, each appearing exactly once. Do not use em dashes. Do not add any other words, numbers, or labels.

Headline at top left, large bold sans-serif: "HOW THE PRICE SNAPSHOT WAS CHECKED"

A left-to-right flow of three stages connected by two thick ink arrows.

Stage one, a flat card on the left titled "AI-GENERATED SUMMARY", with one line below it: "Prices, quotas, dates, benchmarks".

Stage two, a flat card in the middle titled "RE-READ AT THE PRIMARY SOURCE", with four short lines, each with a small square bullet: "Vendor pricing pages", "Help centers", "API documentation", "Changelogs".

Stage three, on the right, splits into two stacked outcome cards.
Upper outcome card, green border, with a green check mark: title "LIST PRICES", line "Held almost everywhere".
Lower outcome card, muted red border, with a red cross mark: title "ERRORS CLUSTERED IN", followed by three short lines with small square bullets: "Dates", "Plan conditions", "Model attribution".

Bottom strip across the full width, orange border, text: "An AI-generated summary does not count as a source."

Footer at bottom right in small monospace: "Checked 2026-09-30"
```
