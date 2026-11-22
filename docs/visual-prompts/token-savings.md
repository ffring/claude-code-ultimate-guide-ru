# Визуальные подсказки для экономии токенов

Эти подсказки иллюстрируют сравнение заявленных и измеренных инструментов экономии токенов и разбивку токенов инструментов по типам вызовов. Каждая видимая строка взята из первоисточников, прочитанных 30 сентября 2026 г. (блог JetBrains AI, Stet.sh, Dasein Code-Compression Bench, README поставщика, Marmelab Atomic CRM Builder). Создавайте одно изображение для каждой подсказки с помощью Gemini 3 Pro Image, проверяйте каждую отображаемую метку и номер на соответствие исходным строкам перед публикацией и преобразуйте выбранный источник в WebP в его исходном размере (Gemini вернул разрешение 1376 x 768; изображения не были масштабированы).

## Запись отбора

| Опубликованный ресурс | Пытаться | Статус |
|---|---|---|
| `token-savings-claimed-vs-measured.webp` | 2 | Попытка 1 отклонена: каждая строка тега отображалась дважды в строке (по одному разу под каждым значением). Попытка 2 выбрана после краткого исправления (одна строка тега в строке): все четыре строки, восемь значений, четыре тега, четыре маркера единиц, нижний колонтитул и строка источника соответствуют исходным строкам; никакого лишнего текста. Исходная строка переносится на две строки «Код-» и «Сжатие», но строка не повреждена. |
| `token-savings-tool-token-share.webp` | 1 | Выбрано с первой попытки: заголовок, три метки сегментов, две выноски, совпадение примечания и исходной строки; ширина сегмента измерена примерно на 90%, 6,7% и 3,4% полосы, что явно пропорционально 90,6, 6,4 и 3,0. |

## Общее художественное направление

Используйте теплый кремовый фон из миллиметровки (`#f5f1e8`), тонкую сетку (`#d4cfb8`), четкие темные линии (`#1a1a1a`) и сдержанные оранжевые (`#d97706`), зеленые (`#16a34a`) и желтые (`#fbbf24`) акценты. Зарезервируйте красный для предупреждений. Не используйте фотографии, 3D-изображения, талисманы, декоративные рисунки, логотипы компаний, номера страниц или дополнительные заголовки. Весь видимый текст — английский. Не используйте длинные тире. Запрошенный формат 16:9.

## 1. Заявленное и измеренное

Выход: `guide/images/token-savings-claimed-vs-measured.webp`

Альтернативный текст: четыре инструмента для экономии токенов по сравнению с заявлением поставщика и независимыми измерениями: Caveman заявляет на 65 % меньше токенов вывода и составляет 8,5 %, RTK заявляет на 60–90 % меньше токенов вывода оболочки и измеряет +7,6 % стоимости за задачу, Ponytail утверждает, что примерно на 20 % дешевле и измеряется на +20 %, чем -2 %, Headroom заявляет на 73–92 % меньше токенов для конкретного контента и измеряет +44 % общей стоимости.

```text
Create a clean editorial data infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706), green (#16a34a) and yellow (#fbbf24) accents, red only for the warning marker. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly the English strings listed below, spelled correctly, each appearing exactly once. Do not use em dashes. Do not add any other words, numbers, or labels.

Headline at top left, large bold sans-serif: "CLAIMED VS MEASURED"

Below the headline, a table of four horizontal rows, each row a flat card with a thin ink border. Each row has three zones from left to right: a narrow tool name zone, a "claimed" zone with an orange left edge, and a "measured" zone with a dark ink left edge. Above the two value zones, shown once only as column captions in small monospace capitals: "CLAIMED" over the left value zone and "MEASURED" over the right value zone. Each row carries exactly ONE small monospace tag line, placed once at the bottom of the row card, spanning the row under the two value zones; it is never repeated inside both zones. At the far right of each row, a small rounded pill marker.

Row 1. Tool name in bold: "Caveman". Claimed value: "65% fewer output tokens". Measured value: "8.5% fewer output tokens". Tag line: "JetBrains, 82 paired tasks, forced activation". Pill marker: "same unit".
Row 2. Tool name in bold: "RTK". Claimed value: "60-90% fewer tokens in shell output". Measured value: "+7.6% cost per task (low effort)". Tag line: "JetBrains, 86 SkillsBench tasks". Pill marker: "different unit".
Row 3. Tool name in bold: "Ponytail". Claimed value: "~20% cheaper". Measured value: "+20% then -2% cost over two runs". Tag line: "Stet, 10 tasks, 2 runs". Pill marker: "same unit".
Row 4. Tool name in bold: "Headroom". Claimed value: "73-92% fewer tokens on specific content". Measured value: "+44% total cost". Tag line: "Dasein, 100 SWE-bench tasks, sponsor-run". Pill marker: "different unit".

Pill markers reading "same unit" are green outlined; pill markers reading "different unit" are yellow filled.

Bottom strip across the full width with a small red warning marker and the text in regular weight: "A shell-output or content-type saving is not a total-cost saving."

Footer at bottom right in small monospace, with a clear margin so no character touches the canvas edge: "Sources: JetBrains AI blog, Stet.sh, Dasein Code-Compression Bench, vendor READMEs. Read 2026-09-30."
```

## 2. Откуда берутся жетоны инструментов

Выход: `guide/images/token-savings-tool-token-share.webp`

Замещающий текст: одиночная полоса токенов инструментов в базовом варианте Atomic CRM Builder: чтение 90,6% при 958 токенах на вызов, Bash 6,4% при 77 токенах на вызов, редактирование, запись и другие 3,0%, поэтому выходной фильтр оболочки касается только среза Bash.

```text
Create a clean editorial data infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706), green (#16a34a) and yellow (#fbbf24) accents, red only for the warning marker. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly the English strings listed below, spelled correctly, each appearing exactly once. Do not use em dashes. Do not add any other words, numbers, axis ticks, or labels.

Headline at top left, large bold sans-serif: "WHERE TOOL TOKENS COME FROM"

Center of the canvas: a single very wide horizontal 100% stacked bar, spanning almost the full canvas width, with a thin ink outline, tall enough to hold labels inside or directly above. Three segments, widths strictly proportional to their values: the first segment takes 90.6% of the bar width (orange), the second takes 6.4% (green), the third takes 3.0% (yellow). The first segment is therefore much wider than the other two combined. Each segment is labeled with exactly one label: the orange segment "Read 90.6%", the green segment "Bash 6.4%", the yellow segment "Edit, Write, other 3.0%". Because the green and yellow segments are narrow, place their labels just above or below them with a thin leader line.

Under the bar, two callout cards side by side, flat with thin ink borders. Left card, under the orange part: "Read: 958 tokens per call". Right card, under the green part: "Bash: 77 tokens per call".

Below the callouts, a wide strip with a small red warning marker and the text in regular weight: "A shell-output filter only touches the Bash slice."

Footer at bottom right in small monospace: "Marmelab, Atomic CRM Builder, 9 baseline instances, August 2026."
```
