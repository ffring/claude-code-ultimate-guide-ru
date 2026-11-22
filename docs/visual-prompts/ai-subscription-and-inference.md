# Подписка на искусственный интеллект и визуальные подсказки для вывода

Эти подсказки охватывают стратегию подписки с несколькими поставщиками, пути развертывания Mistral, видимость шлюза и выбор агентских инструментов. Сгенерируйте одно изображение для каждой подсказки. Просмотрите каждую отображаемую метку перед публикацией, измените размер выбранного источника до 1600 x 900 и преобразуйте его в WebP.

## Запись отбора

| Опубликованный ресурс | источник Gemini | Статус |
|---|---|---|
| `subscription-provider-portfolio.webp` | `Gemini_Generated_Image_m1miyom1miyom1mi.jpeg` | Выбрано и опубликовано |
| `mistral-deployment-paths.webp` | `Gemini_Generated_Image_xxlnb4xxlnb4xxln.jpeg` | Выбрано и опубликовано |
| `gateway-visibility-boundary.webp` | `Gemini_Generated_Image_x9ycs7x9ycs7x9yc.jpeg` | Выбрано и опубликовано |
| `agentic-tool-selection-map.webp` | `Gemini_Generated_Image_sfqljesfqljesfql.jpeg` | Отклонено: в незапрошенном претитуле `EDITORIAL` написан с ошибками как `EDTORIAL`. |

## Общее художественное направление

Используйте теплый кремовый фон из миллиметровки (`#f5f1e8`), тонкую сетку (`#d4cfb8`), четкие темные линии (`#1a1a1a`) и сдержанные оранжевые (`#d97706`), зеленые (`#16a34a`) и желтые (`#fbbf24`) акценты. Зарезервируйте красный для вышедших из строя контрольных ворот. Не используйте фотографии, 3D-изображения, талисманы, декоративные рисунки, логотипы компаний, номера страниц или дополнительные заголовки. Весь видимый текст — английский. Не используйте длинные тире. Целевой размер 1600 x 900 пикселей.

## 1. Портфель провайдеров на 300 инженеров

Выход: `guide/images/subscription-provider-portfolio.webp`

Альтернативный текст: Организация, состоящая из 300 инженеров, разделена на управляемые интерактивные подписки рабочей силы, управляемую автоматизацию услуг и частный вывод, каждый из которых имеет отдельные показатели стоимости и приемки.

```text
Create a clean editorial infographic for a technical documentation guide, landscape 16:9 at 1600x900. Use the shared warm cream graph-paper art direction. No photos, no 3D, no mascots, no decorative doodles, no company logos, no page number, and no pretitle. All visible text must be exactly in English and spelled correctly. Do not use em dashes.

Headline: “ONE FLEET, THREE CONTROL PLANES”

At the top center, show one group labeled “300 ENGINEERS”. Split it into three clearly separated paths.

Path 1: “INTERACTIVE WORKFORCE”. Subtitle: “Managed user identities”. Show six compact labels: “Claude”, “Codex”, “Copilot”, “Gemini”, “Cursor”, “Mistral Vibe”. Below them show “Active users”, “Accepted tasks”, and “Seat and overage cost”.

Path 2: “AUTOMATION”. Subtitle: “Service identities through a gateway”. Show “CI”, “Shared agents”, and “Scheduled workflows” connected to one box titled “Gateway”. Inside it show “Budgets”, “Attribution”, “Routing”, and “Fallback”.

Path 3: “SENSITIVE WORKLOADS”. Subtitle: “Private or self-hosted inference”. Show one “Private inference cluster” with “Quality gate”, “Latency gate”, “Capacity gate”, and “Loaded cost”.

Footer: “ASSIGN BY POPULATION. MEASURE ACCEPTED OUTCOMES.”

Make the three control planes unmistakably different. Do not imply that one provider should serve every workload.
```

## 2. Пути развертывания Мистралей

Выход: `guide/images/mistral-deployment-paths.webp`

Альтернативный текст: Mistral Vibe, Devstral API и Devstral с открытым весом сравниваются как управляемая рабочая сила, дозированное обслуживание и частные пути вывода за общее качество, суверенитет, параллелизм, задержку и шлюзы загруженной стоимости.

```text
Create a clean technical decision infographic, landscape 16:9 at 1600x900. Use the shared warm cream graph-paper art direction. No photos, no 3D, no mascots, no logos, no page number, and no pretitle. All visible text must be exactly in English and spelled correctly. Do not use em dashes.

Headline: “THREE MISTRAL PATHS, THREE OPERATING MODELS”

Create three large vertical lanes.

Lane 1: “MISTRAL VIBE”. Subtitle: “Managed workforce”. Show “User seats”, “Organization controls”, “Included usage + PAYG”, and “Managed operations”.

Lane 2: “DEVSTRAL API”. Subtitle: “Metered service”. Show “Service identity”, “Token usage”, “Gateway budgets”, and “Provider operations”.

Lane 3: “OPEN-WEIGHT DEVSTRAL”. Subtitle: “Private inference”. Show “GPU capacity”, “Queue depth”, “TTFT + TPOT”, “Availability”, and “Operator time”.

Under the lanes, create five connected decision gates: “TASK QUALITY” → “DATA BOUNDARY” → “CONCURRENCY” → “LATENCY” → “LOADED COST”. End with three result cards: “Choose managed”, “Choose API”, and “Choose private”.

Red rejection note: “Hardware fit is not production capacity.”

Footer: “Provider nationality does not prove workload sovereignty.”
```

## 3. Граница видимости шлюза

Выход: `guide/images/gateway-visibility-boundary.webp`

Замещающий текст: Подписки пользователей обходят бюджеты шлюза и атрибуцию, в то время как CI, общие агенты, запланированные рабочие процессы и внутренние службы проходят через централизованные ключи, квоты, списки разрешенных моделей, резервный вариант и возможность наблюдения.

```text
Create a clean editorial architecture infographic, landscape 16:9 at 1600x900. Use the shared warm cream graph-paper art direction. No photos, no 3D, no mascots, no logos, no page number, and no pretitle. All visible text must be exactly in English and spelled correctly. Do not use em dashes.

Headline: “A GATEWAY SEES ONLY ROUTED TRAFFIC”

Build two horizontal traffic paths.

Top path in red: “USER SUBSCRIPTIONS”. Show “Claude”, “Codex”, “Cursor”, and “Mistral Vibe” connected directly to external provider boxes. Add “Outside gateway budgets”, “Outside gateway attribution”, and “Separate audit boundary”.

Bottom path in green: “GOVERNED SERVICE TRAFFIC”. Show “CI”, “Shared agents”, “Scheduled workflows”, and “Internal services” routed through one central box labeled “AI GATEWAY”. Inside it show “Central keys”, “Budgets”, “Quotas”, “Cost attribution”, “Model allowlist”, and “Fallback”. Connect the gateway to “Provider A”, “Provider B”, and “Private model”.

Add an orange observability panel containing “Logs”, “Latency”, “Errors”, and “Token usage”.

Footer: “CENTRALIZED CONTROL REQUIRES CENTRALIZED TRAFFIC.”
```

## 4. Карта выбора агентного инструмента

Планируемый результат: `guide/images/agentic-tool-selection-map.webp`

Статус: не опубликовано. Выполните повторную генерацию из этого чистого приглашения, поскольку в первом выводе был добавлен заголовок с ошибкой.

```text
Create a clean editorial selection infographic for an AI coding tools guide, landscape 16:9 at 1600x900. Use the shared warm cream graph-paper art direction. No photos, no 3D, no mascots, no company logos, no page number, and no pretitle above the headline. All visible text must be exactly in English and spelled correctly. Do not use em dashes.

Headline: “CHOOSE THE JOB BEFORE THE TOOL”

Create four large job cards connected to four tool categories.

1. “INTERACTIVE REPOSITORY WORK” connects to “Coding agent”, with “Claude Code, Codex, Gemini CLI”.
2. “IDE-CENTERED DEVELOPMENT” connects to “AI-native editor or extension”, with “Cursor, Copilot”.
3. “CI AND SHARED AUTOMATION” connects to “Agent runtime + governed API”, with “Service identity”, “Budget”, “Retry policy”, and “Audit trail”.
4. “PRIVATE INFERENCE” connects to “Open-weight model + serving engine”, with “Task quality”, “Concurrency”, “Latency”, and “Operations”.

Below the cards, add one measurement strip: “ACCEPTED TASKS”, “TOTAL WORKFLOW COST”, “REVIEW TIME”, and “FAILURES + RETRIES”.

Red warning: “Mismatch: Do not compare a seat, a gateway, a model, and a runtime as equivalent products.”

Footer: “THE RIGHT CATEGORY COMES BEFORE THE PROVIDER.”
```

## Проверочная запись

| Объект | Размеры | Результат контроля качества |
|---|---:|---|
| `subscription-provider-portfolio.webp` | 1600 x 900 | Текст и макет проверены после конвертации |
| `mistral-deployment-paths.webp` | 1600 x 900 | Текст и макет проверены после конвертации |
| `gateway-visibility-boundary.webp` | 1600 x 900 | Текст и макет проверены после конвертации |
| `agentic-tool-selection-map.webp` | Не опубликовано | Источник отклонен из-за неправильного написания названия. |
