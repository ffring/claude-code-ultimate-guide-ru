# Агент использует визуальные подсказки ландшафта

В результате этих подсказок были созданы три растровых изображения, используемые для карты снаряжения агента. Каждое изображение было создано как отдельный ресурс, проверено визуально, изменено до размера 1600 x 900 и преобразовано в WebP.

Избранные исходные файлы Gemini:

| Опубликованный ресурс | Выбранный источник |
|---|---|
| `agent-harness-160-not-runtimes.webp` | `Gemini_Generated_Image_21edgl21edgl21ed.jpeg` |
| `agent-harness-four-layers.webp` | `Gemini_Generated_Image_u0ieeju0ieeju0ie.jpeg` |
| `agent-harness-selection-funnel.webp` | `Gemini_Generated_Image_7rttz17rttz17rtt.jpeg`, количество пилотов исправлено с 5–10 до 8–12 реальных билетов перед конвертацией. |

## Общее художественное направление

Используйте фон из миллиметровой бумаги теплого кремового цвета (`#f5f1e8`), тонкую сетку (`#d4cfb8`), точные темные линии карандашом или тушью (`#1a1a1a`) и сдержанные желтые (`#fbbf24`), зеленые (`#16a34a`) и оранжевые (`#d97706`) акценты. Зарезервируйте красный цвет для ворот риска. Сохраняйте макет редакционным и техническим. Не используйте фотографии, 3D-изображения, талисманы, декоративные рисунки, звезды, номера страниц или логотипы. Весь видимый текст — английский. Целевой размер 1600 x 900 пикселей.

## 1. Широкий каталог против строгой карты времени выполнения

Выход: `guide/images/agent-harness-160-not-runtimes.webp`

Альтернативный текст: Трехэтапная воронка отделяет широкий каталог из 160 проектов в 12 категориях от теста на владение циклом и меньшей строгой карты времени выполнения, где соседние и неизвестные проекты хранятся отдельно.

```text
Create a clean editorial infographic for a technical documentation guide, landscape 16:9 at 1600x900. Visual language: warm cream graph-paper background (#f5f1e8), very subtle grid (#d4cfb8), precise dark pencil/ink lines (#1a1a1a), restrained yellow (#fbbf24), green (#16a34a), and orange (#d97706) accents. No photos, no 3D, no mascots, no decorative doodles, no stars, no page numbers, no logos. High information density but ample whitespace. All visible text must be exactly in English and spelled correctly.

Headline, large: “160 PROJECTS ≠ 160 RUNTIMES”
Under it, create a left-to-right evidence funnel made of three clearly separated cards connected by thin arrows:
1. Card title “Broad catalog” with large number “160”, small line “projects”, and a compact badge “12 categories”. Show a mixed stack of small abstract tool cards to signal heterogeneous entries.
2. Card title “Loop ownership test” with a simple circular agent loop diagram labeled “plan”, “act”, “observe”, “repeat”. Add a filter gate with the question “Who owns the loop?”
3. Card title “Strict runtime map” with a compact set of selected runtime blocks, plus two side bins labeled “Adjacent control planes” and “Unknown”.
At the bottom, add one concise note: “Catalog size is not runtime count.”
Make hierarchy crystal clear. Avoid tiny text. The image must remain readable embedded in a documentation page.
```

## 2. Четыре уровня и обязанности

Выход: `guide/images/agent-harness-four-layers.webp`

Замещающий текст: Четырехуровневый стек разделяет модель, систему репозитория, среду выполнения и оркестратор, причем управление передается вниз, а доказательства — вверх.

```text
Create a clean editorial infographic for a technical documentation guide, landscape 16:9 at 1600x900. Visual language: warm cream graph-paper background (#f5f1e8), very subtle grid (#d4cfb8), precise dark pencil/ink lines (#1a1a1a), restrained yellow (#fbbf24), green (#16a34a), and orange (#d97706) accents. No photos, no 3D, no mascots, no decorative doodles, no stars, no page numbers, no logos. High information density but ample whitespace. All visible text must be exactly in English and spelled correctly.

Headline: “FOUR LAYERS, FOUR JOBS”
Build one clear vertical architecture stack of four wide horizontal layers. Use thin arrows to show control flowing downward and evidence flowing upward.
Layer 4, top, orange accent: “ORCHESTRATOR” and subtitle “coordinates agents or runtimes”. Include three small connected worker nodes.
Layer 3, green accent: “RUNTIME HARNESS” and subtitle “owns plan → act → observe → repeat”. Include a concise circular loop with labels “plan”, “act”, “observe”, “repeat”.
Layer 2, yellow accent: “REPOSITORY HARNESS” and subtitle “instructions, hooks, skills, policy”. Include compact file tabs labeled “AGENTS.md”, “hooks”, “skills”.
Layer 1, bottom, neutral accent: “MODEL” and subtitle “generates and reasons”. Include one abstract neural block, not a brain illustration.
At the right, add a slim responsibility panel titled “ASK FIRST” with four questions aligned to the layers: “Who coordinates?”, “Who owns the loop?”, “What configures the repo?”, “Which model runs?”
At the bottom, add: “Do not compare tools from different layers as substitutes.”
Make the layer boundaries and ownership distinction unmistakable. Avoid tiny text.
```

## 3. Воронка отбора и доказательной базы

Выход: `guide/images/agent-harness-selection-funnel.webp`

Замещающий текст: пятиэтапный процесс выбора определяет задание, проверяет владельца цикла, проверяет свидетельства, пилотирует от 8 до 12 реальных задач и заканчивается принятием, соседним уровнем или отклонением.

```text
Create a clean editorial decision infographic for a technical documentation guide, landscape 16:9 at 1600x900. Visual language: warm cream graph-paper background (#f5f1e8), very subtle grid (#d4cfb8), precise dark pencil/ink lines (#1a1a1a), restrained yellow (#fbbf24), green (#16a34a), and orange (#d97706) accents. Use red only for a risk gate. No photos, no 3D, no mascots, no decorative doodles, no stars, no page numbers, no logos. All visible text must be exactly in English and spelled correctly.

Headline: “CHOOSE THE LOWEST LAYER THAT SOLVES THE PROBLEM”
Create a left-to-right selection funnel with five large steps connected by arrows:
1. “DEFINE THE JOB” with four selectable labels: “Generate”, “Run”, “Configure”, “Coordinate”.
2. “CHECK LOOP OWNERSHIP” with the question “Does it own plan → act → observe → repeat?” and two paths “Yes” and “No / unknown”.
3. “VERIFY EVIDENCE” with a small checklist: “Official URL”, “README or docs”, “Security boundary”, “Recovery behavior”.
4. “PILOT” with a bold band “8–12 REAL TASKS” and three measured outputs: “success”, “cost”, “recovery”.
5. “DECIDE” with three outcome cards: “Adopt”, “Keep as adjacent layer”, “Reject”.
Below the funnel, add a horizontal red risk gate labeled “Human approval for consequential actions”.
At the bottom, add a concise note: “Features and popularity do not replace task-level evidence.”
Keep each step visually distinct, readable, and practical. Avoid tiny text.
```

## Проверочная запись

| Объект | Размеры | Размер |
|---|---:|---:|
| `agent-harness-160-not-runtimes.webp` | 1600 x 900 | Выбранный вывод Gemini, размер которого изменен и преобразован в WebP. |
| `agent-harness-four-layers.webp` | 1600 x 900 | Выбранный вывод Gemini, размер которого изменен и преобразован в WebP. |
| `agent-harness-selection-funnel.webp` | 1600 x 900 | Выбранный вывод Gemini, исправленный в соответствии с протоколом от 8 до 12 билетов, измененный размер и преобразованный в WebP. |
