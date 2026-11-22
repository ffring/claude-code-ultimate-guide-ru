# Шаблон LinkedIn

Цель: ~1300 символов. Структура: хук + контекст + маркеры + призыв к действию + хэштеги.

## шаблон FR

```
{hook_line_fr}

{context_line_fr}

{bullet_1_fr}
{bullet_2_fr}
{bullet_3_fr}

{cta_fr}

#ClaudeCode #CodingWithAI #DeveloperTools
```

## RU-шаблон

```
{hook_line_en}

{context_line_en}

{bullet_1_en}
{bullet_2_en}
{bullet_3_en}

{cta_en}

#ClaudeCode #CodingWithAI #DeveloperTools
```

## Правила полей

### ook_line (1 строка, максимум 150 символов)

Яркий момент с наивысшей оценкой, преобразованный в ценность для пользователя. Может включать смайлы от 0 до 1.

| Шаблон | Пример ФР | RU Пример |
|---------|------------|------------|
| Number-led | `30 nouvelles questions quiz pour tester vos connaissances Claude Code` | `30 new quiz questions to test your Claude Code knowledge` |
| Вопрос | `Vous apprenez mieux en visuel ? 4 nouveaux diagrammes ASCII` | `Visual learner? 4 new ASCII diagrams just added` |
| Source-led | `Pat Cullen partage son workflow de code review multi-agent` | `Pat Cullen shares his multi-agent code review workflow` |

### context_line (1–2 строки, максимум 200 символов)

Ссылка на версию + что изменилось на высоком уровне.

```
FR: "Guide v3.20.5 - mise a jour de la reference visuelle."
EN: "Guide v3.20.5 - visual reference update."
```

Для недельного режима:
```
FR: "N releases cette semaine dans le Claude Code Ultimate Guide."
EN: "N releases this week in the Claude Code Ultimate Guide."
```

### пули (3 предмета, максимум 200 символов каждый)

Топ-3 основных моментов по количеству очков. Каждый начинается с соответствующего смайлика (максимум 1 на маркер).

```
FR:
- [emoji] [Transformed highlight in vous-form]
- [emoji] [Transformed highlight in vous-form]
- [emoji] [Transformed highlight in vous-form]

EN:
- [emoji] [Transformed highlight, direct "you" address]
- [emoji] [Transformed highlight, direct "you" address]
- [emoji] [Transformed highlight, direct "you" address]
```

### призыв к действию (1 строка, максимум 150 символов)

Мягкое заявление о ценности или искренний вопрос. Ссылки на лендинг.

```
FR: "Guide complet disponible en open source : {landing_url}"
EN: "Full guide available open source: {landing_url}"
```

### хештеги (1 строка, ровно 3)

Исправлено: `#ClaudeCode #CodingWithAI #DeveloperTools`

Добавьте 1 тег, относящийся к конкретной теме, если это действительно важно: `#CodeReview`, `#Security`, `#TDD`.

## Ограничения

- Общий объем поста: 1100-1500 символов.
- Бюджет эмодзи: всего 3–4 (0–1 хук, 1 на маркер, 0–1 CTA).
- Никаких рекламных слов (см. tone-guidelines.md)
- FR: vouvoiement
- RU: Американский английский
