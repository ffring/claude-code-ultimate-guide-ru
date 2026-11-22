# Проверяемый агент меняет визуальные подсказки

Эти подсказки иллюстрируют [Просматриваемые изменения агента](../../guide/workflows/reviewable-agent-changes.md): пять полей, которые заметка агента записывает в каждом блоке, и где примечание может жить с тем, что выдерживает перезапись. Каждая видимая строка взята с этой страницы и из тестов, стоящих за ней (git 2.56.0 и git-ai 1.7.7, 8 ноября 2026 г.). Создавайте по одному изображению для каждой подсказки с помощью Gemini 3 Pro Image, перед публикацией проверяйте каждую отображаемую метку на соответствие строкам ниже и преобразуйте выбранные выходные данные в WebP в исходном размере.

## Запись отбора

| Опубликованный ресурс | Пытаться | Статус |
|---|---|---|
| `agent-note-storage.webp` | 1 | Выбранный с первой попытки пилотный файл: заголовок, подзаголовок, три заголовка столбца, четыре метки строк, двенадцать ячеек, нижняя полоса и нижний колонтитул соответствуют строкам; зеленые и серые края ожидаемых ячеек; никакого лишнего текста. Gemini возвращал данные JPEG с разрешением 1376 x 768 под именем `.png`; преобразован в WebP в исходном размере, без масштабирования |
| `agent-note-fields.webp` | 2 | Попытка 1 отклонена: на значке карты 2 было добавлено дополнительное слово «Почему?», а на двух картах верхние правила были зелеными, а не чернилами. В попытке 2 (то же самое приглашение, дефект оценивается стохастически) каждая строка правильна и нет лишнего текста, но на карточках со 2 по 5 вместо чернил были верхние оранжевые, зеленые и желтые правила. Это было исправлено локально, а не с помощью третьего платного вызова: насыщенные пиксели только строк правил (строки с 227 по 238, справа от первой карточки) смешивались с чернилами; в этих строках нет текстового пикселя. Исходные данные JPEG 1376 x 768, преобразованные в WebP, без масштабирования |

## Общее художественное направление

Используйте миллиметровку теплого кремового цвета (`#f5f1e8`), тонкую сетку (`#d4cfb8`), точные линии темных чернил (`#1a1a1a`) и сдержанные оранжевые (`#d97706`), зеленые (`#16a34a`) и желтые (`#fbbf24`) акценты с серым (`#9ca3af`) для частей, которые читаются, но не просматриваются. Не используйте фотографии, 3D-изображения, талисманы, декоративные рисунки, логотипы компаний, номера страниц или дополнительные заголовки. Весь видимый текст — английский. Не используйте длинные тире. Запрошенный формат 16:9.

## 1. Где живет агентская записка

Выход: `guide/images/agent-note-storage.webp`

Альтернативный текст: сравнение трех мест, в которых может находиться заметка агента, в четырех строках. Заметки Git в refs/notes/rationale не отображаются в запросе на слияние, если инструмент не опубликует их, не последует за изменением и перебазированием с помощью Notes.rewriteRef (проверено) и потеряется при сжатом слиянии для простых заметок (проверено). Файл, зафиксированный с помощью кода, отображается как измененный файл, перемещается вместе с содержимым и сохраняется в сдавленном виде с диапазонами строк, которые могут смещаться. Комментарий к форжу виден в мерж-реквесте, на новой шапке помечен как устаревший, а его судьба в сквоше зависит от форжа и не проверялась.

```text
Create ONE clean editorial data infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706), green (#16a34a) and yellow (#fbbf24) accents, grey (#9ca3af) for cells read but not run. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, no pretitle. Do not use em dashes.

Layout: a comparison table with three aligned columns and four labelled rows, read left to right then top to bottom.

Title at top left, large bold sans-serif: "Where an agent note lives, and what survives a rewrite"
Subtitle under the title, regular weight: "Green: tested. Grey: read from source, not run."

Three column headers in bold, each in a flat card with a thin ink border:
Column 1: "Git notes"
Column 2: "File committed with the code"
Column 3: "Forge comment"

Four row labels in small monospace capitals in a narrow left column:
Row 1: "STORED IN"
Row 2: "VISIBLE IN THE MERGE REQUEST"
Row 3: "AMEND AND REBASE"
Row 4: "SQUASH MERGE"

Cells, each a flat card with a thin ink border:
Row 1, column 1: "refs/notes/rationale" in monospace. Row 1, column 2: "SARIF or JSON beside the code". Row 1, column 3: "Merge request discussion".
Row 2, column 1: "No, unless a tool posts it". Row 2, column 2: "As a changed file". Row 2, column 3: "Yes".
Row 3, column 1: "Kept with notes.rewriteRef", with a green left edge. Row 3, column 2: "Moves with the content", with a grey left edge. Row 3, column 3: "Marked outdated on a new head", with a grey left edge.
Row 4, column 1: "Lost for plain notes", with a green left edge. Row 4, column 2: "Kept, line ranges may drift", with a grey left edge. Row 4, column 3: "Depends on the forge", with a grey left edge.
Rows 1 and 2 have no coloured edge.

Bottom strip across the full width, with a small yellow marker, regular weight: "A forge merge button rewrites history on the server: not tested."

Footer at bottom right in small monospace, with a clear margin from the canvas edge: "git 2.56.0 and git-ai 1.7.7, November 8, 2026"

Colour names, layout words and the words row, column, cell and edge are instructions, never visible text. Text inventory: exactly the strings in double quotes above, each appearing exactly once, spelled exactly as written; nothing else, no extra labels, numbers, icons with text, or legend.
```

## 2. Пять вещей, которые записывает агент

Выход: `guide/images/agent-note-fields.webp`

Альтернативный текст: Пять одинаковых карточек для полей заметки агента на блок: намерение, для чего нужно изменение; отклоненная альтернатива, вариант не выбран и почему; риск, что это может сломать и для кого; доказательства, которые рецензент может перепроверить; открытый вопрос, на который агент не смог решить. На каждой карточке есть пример из шаблона. «Неизвестно» — допустимый ответ, за исключением намерения; заметка — это требование проверить, а не доказательство.

```text
Create ONE clean editorial data infographic for a technical documentation guide, landscape 16:9 at 1600x900. Warm cream graph-paper background (#f5f1e8) with a subtle grid (#d4cfb8), precise dark ink lines (#1a1a1a), restrained orange (#d97706), green (#16a34a) and yellow (#fbbf24) accents. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, no pretitle. Do not use em dashes.

Layout: five equal cards side by side in one row, read left to right. Each card is flat with a thin ink border and has, from top to bottom: a simple line icon, a bold name, a one-line definition, and at the lower edge a small monospace example chip with a thin ink outline. The first card has an orange top rule; the other four have a thin ink top rule.

Title at top left, large bold sans-serif: "Five things an agent note records for each hunk"
Subtitle under the title, regular weight: "This guide's proposal. Unknown is a valid answer, except for intent."

Card 1: name "Intent", definition "What the change is for", example chip "Sum prices, not item objects".
Card 2: name "Rejected alternative", definition "The option not taken, and why", example chip "Give Item an __add__ method".
Card 3: name "Risk", definition "What this could break, for whom", example chip "Items without a price raise AttributeError".
Card 4: name "Evidence", definition "What the reviewer can rerun", example chip "test_cart.py::test_total_uses_price".
Card 5: name "Open question", definition "What the agent could not decide", example chip "unknown".

Closing sentence centred below the cards, regular weight: "A note is a claim to check, not evidence."

Footer at bottom right in small monospace, with a clear margin from the canvas edge: "Template: examples/skills/agent-rationale"

Colour names and layout words are instructions, never visible text. Icons carry no text. Text inventory: exactly the strings in double quotes above, each appearing exactly once, spelled exactly as written; nothing else.
```
