# Трансформация контента

Сопоставляет технический язык CHANGELOG с социальной ценностью, ориентированной на пользователя. Примените правила tone-guidelines.md ко всем выходам.

## Принцип трансформации

```
Technical fact (CHANGELOG) -> User benefit (social post)
```

Никогда не придумывайте выгоды. Каждое преобразование должно возвращаться к конкретной строке CHANGELOG.

## Таблица сопоставления

### Новый контент

| Технический (CHANGELOG) | Социальные сети (пользовательская ценность) |
|---|---|
| `N new ASCII diagrams (X -> Y total)` | `Visual learner? N new diagrams for [topics]` |
| `N New Quiz Questions (X -> Y total)` | `Test your Claude Code knowledge: N new questions covering [top categories]` |
| `New [guide-name].md (N lines)` | `New guide: [topic in plain language]` |
| `New section: [Section Name] (~N lines)` | `[What you can now learn/do]: [plain description]` |
| `New workflow: [name]` | `Step-by-step: how to [action] with Claude Code` |
| `Enhanced [command/agent] (+N lines)` | `[Command] now supports [new capability]` |
| `N new entries in reference.yaml` | Пропустить (внутренняя индексация, нет пользовательского значения) |

### Исследования и источники

| Технический (CHANGELOG) | Социальные сети (пользовательская ценность) |
|---|---|
| `Score: 5/5 - [Source]` | `Critical finding from [Author]: [key insight]` |
| `Score: 4/5 - [Source]` | `From [Author]'s research: [practical takeaway]` |
| `Score: 3/5 - [Source]` | `[Author] confirms: [relevant finding]` |
| `Source: [URL] ([Author], [Date])` | `Based on [Author]'s work` |
| `Competitive Analysis: N Gaps from [source]` | `N advanced patterns identified: [top 2-3 names]` |
| `Resource evaluation: [file]` | Пропустить (внутренний процесс, не связанный с пользователем) |
| `Fact-checked: N/N claims verified` | В качестве сигнала достоверности можно упомянуть: `All N claims verified`. |

### Показатели роста

| Технический (CHANGELOG) | Социальные сети (пользовательская ценность) |
|---|---|
| `Guide line count: X -> Y (+N lines)` | `+N lines of documentation added this [week/version]` |
| `X -> Y total [items]` | `Now Y [items] (was X)` |
| `+N lines: X -> Y` | `[Feature] expanded with N lines of [content type]` |

### Исправления и изменения

| Технический (CHANGELOG) | Социальные сети (пользовательская ценность) |
|---|---|
| `Fixed [technical issue]` | `Corrected: [what users see fixed]` |
| `[File]: Updated [field] (X -> Y)` | Пропускать, если изменение не видно пользователю. |
| `Landing synced` | Пропустить (инфраструктура) |
| `Badge updated` | Пропустить (инфраструктура) |

### Техническое обслуживание (обычно пропускают)

| Технический (CHANGELOG) | Социальная ценность |
|---|---|
| `README.md: Added [X] to table` | Пропускать |
| `Updated counts in [files]` | Пропускать |
| `Sync: [description]` | Пропускать |
| `reference.yaml: +N entries` | Пропускать |
| `CLAUDE.md: [update]` | Пропускать |

## Распознавание образов

### Цифры, которые стоит выделить

Если запись содержит числовые изменения, извлеките и отформатируйте ее:

```
"30 New Quiz Questions (227 -> 257)"
-> number: 30
-> growth: "227 -> 257"
-> highlight: "30 new questions" or "now 257 questions"

"4 new ASCII diagrams (16 -> 20 total)"
-> number: 4
-> growth: "16 -> 20"
-> highlight: "4 new diagrams" or "now 20 diagrams"

"+522 lines"
-> number: 522
-> highlight: "+522 lines of new content"
```

### Названные источники кредита

Извлеките имена авторов и укажите правильную ссылку:

```
"Pat Cullen's Final Review Gist" -> "From Pat Cullen's production workflow"
"Addy Osmani's 80% Problem"     -> "Based on Addy Osmani's research"
"Shen & Tamkin RCT"             -> "From Shen & Tamkin's study (Anthropic)"
"claudelog.com (InventorBlack)"  -> "Identified via claudelog.com community"
"Jude Gao (Vercel)"             -> "From Vercel's benchmarks (Jude Gao)"
```

### Кластеризация тем

Если несколько записей имеют общую тему, сгруппируйте их:

```
Entries about code review:
- "Multi-Agent PR Review"
- "Enhanced /review-pr command"
- "Enhanced code-reviewer agent"
-> Cluster: "Code review overhaul: multi-agent workflow, anti-hallucination rules, severity classification"

Entries about security:
- "Docker sandbox isolation"
- "Security 3-Layer Defense diagram"
- "Secret Exposure Timeline diagram"
-> Cluster: "Security focus: sandbox isolation, defense layers, incident response timeline"
```

## Версия против недельного фрейма

### Одиночная версия

```
FR: "Claude Code Ultimate Guide v3.20.5"
EN: "Claude Code Ultimate Guide v3.20.5"
```

### Неделя (несколько версий)

```
FR: "Cette semaine dans le guide (N releases)"
EN: "This week in the guide (N releases)"
```

### Неделя (одиночная версия)

```
FR: "Cette semaine : guide v3.20.5"
EN: "This week: guide v3.20.5"
```
