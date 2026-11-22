---
name: talk-stage4-position
description: "Создает 3-4 стратегических точки зрения с анализом strength/weakness, вариантами заголовков, описаниями CFP и черновиком отзывов коллег, а затем обеспечивает обязательную ПРОВЕРКУ для подтверждения пользователя перед написанием сценария. Используйте при принятии решения о том, как построить доклад, подготовке представления CFP или выборе между несколькими углами повествования."
allowed-tools: Write Read AskUserQuestion
effort: high
---

# Этап разговора 4: Позиция + ЧЕКПОИНТ

Создает стратегические точки зрения, заголовки, описания и черновой вариант для отзывов коллег. Затем **останавливается и ждет** вашего выбора ракурса + названия, прежде чем можно будет перейти к этапу 5.

## Когда использовать этот навык

- После этапа 3 (Концепции), на котором представлен каталог концепций.
- Когда вы решаете, как построить разговор
- Перед отправкой CFP (непосредственно использует сгенерированные описания)

## Что дает этот навык

1. **Читает входные данные**: сводка + концепции + ограничения событий
2. **Генерирует углы.**: 3–4 различных угла с анализом strength/weakness.
3. **Рекомендует**: один четкий выбор со структурированным обоснованием
4. **Генерирует заголовки**: 3-5 вариантов на ракурс
5. **Генерирует описания**: краткое резюме + подробное описание CFP
6. **Создает черновик отзыва**: готовое к отправке сообщение (3 формата)
7. **CHECKPOINT**: отображает запрос выбора и ожидает ответа пользователя.
8. **Сохраняет 4 файла**

## Вход

- `talks/{YYYY}-{slug}-summary.md` (обязательно)
- `talks/{YYYY}-{slug}-concepts.md` (обязательно)
- Ограничения мероприятия: продолжительность, аудитория, формат CFP, если применимо.

## Выход

- `talks/{YYYY}-{slug}-angles.md`
- `talks/{YYYY}-{slug}-titre.md`
- `talks/{YYYY}-{slug}-descriptions.md`
- `talks/{YYYY}-{slug}-feedback-draft.md`

## Формат angles.md

```markdown
# Talk Angles: {provisional title}

**Goal**: Choose the angle that maximizes impact for {audience}.
**Audience**: {audience description}

---

## Angle 1: {Angle name}

**Pitch**: {2-3 sentences describing the talk from this angle}

**Strengths**:
- {strength 1}
- {strength 2}

**Weaknesses**:
- {weakness 1}
- {weakness 2}

**Audience fit**: Strong / Medium / Weak ({short justification})

**Verdict**: (out of 5 stars)

---

[Angle 2, Angle 3, (optional Angle 4): same structure]

---

## Recommendation: Angle {X}, enriched by the others

**Angle {X} is the right choice.** Here's why:

### 1. It's the only angle that integrates the others
[Structure showing how other angles feed into the main one]

### 2. The narrative arc is natural and compelling
[Why the story holds better with this angle]

### 3. The metrics lend credibility throughout
[Which metrics support this angle most]

### 4. The final message emerges naturally
[How the conclusion flows from this angle]

---

## Recommended structure with sub-angles

| Act | Duration | Main angle | Integrated sub-angle |
|-----|----------|-----------|---------------------|
| 1. {name} | {n} min | {main angle} | {sub-angle} |
...
```

## Формат titre.md

```markdown
# Titles: Talk {slug}

**Selected angle**: Angle {X} ({name})
**Constraints**: {duration} min | {audience}

---

## Titles for the recommended angle

### Option 1 (recommended)
**{Main title}**
*Optional subtitle: {subtitle}*

Strengths: {why this title works}
Audience appeal: {who it hooks}

### Option 2
**{Title}**
Strengths: {strengths}

[Options 3-5]

---

## Titles for alternative angles (backup)

### If Angle 2 chosen
- **{title}**
- **{title}**

[If Angle 3 chosen: same structure]

---

## Verdict

**Recommendation**: Option 1 ("{title}")
**Why**: {short justification}
```

## Формат descriptions.md

```markdown
# Descriptions: Talk {slug}

---

## Short description (abstract, ~100 words)

{Full text: direct, engaging, starts with the impact or concrete promise.
Not "In this talk, we will..."}

---

## Long description (CFP, ~250 words)

{Full text: context, what the audience will learn, who it's for.
Includes key metrics if available.
Direct and factual tone.}

---

## Speaker pitch (bio-ready, ~50 words)

{Speaker introduction in 1-2 sentences, their relationship to the topic}

---

## Tags / Keywords

{5-10 relevant tags for CFP or search}
```

## CHECKPOINT (обязательно, шаг 7)

После создания и сохранения 4 файлов отобразите:

```
---
CHECKPOINT: Angle + Title choice

I've generated 4 files:
- talks/{YYYY}-{slug}-angles.md    -> {n} angles analyzed
- talks/{YYYY}-{slug}-titre.md     -> {n} title options
- talks/{YYYY}-{slug}-descriptions.md
- talks/{YYYY}-{slug}-feedback-draft.md

Before starting the script (Stage 5), I need your choice:

1. Which angle do you choose? (recommended: Angle {X}, {name})
2. Which title do you prefer? (recommended: "{title}")

You can also modify, combine, or propose something different.
Reply to start the script.
---
```

**Не вызывать этап 5 без явного подтверждения пользователя.**

## Правила формирования углов

- Минимум 3 ракурса, максимум 4 (кроме этого шум)
- Каждый ракурс должен быть по-настоящему отличным (а не вариациями одного и того же).
- Рекомендация должна быть четкой и аргументированной, а не «вашим выбором».
- Всегда проверяйте: «Может ли этот угол выдержать всю продолжительность без повторений?»

## Anti-patterns

- Клик-приманки («Что вам никто не говорит об ИИ»)
- Рекомендация последнего ракурса, указанного по умолчанию (смещение новизны)
- Описания, которые читаются как краткое изложение слайдов
- Пропуск CHECKPOINT (это самая важная контрольная точка конвейера)
- Маркетинговый язык в описаниях (революционный и т.п.)

## Контрольный список проверки

- [ ] 3-4 ракурса с анализом strength/weakness/audience-fit
- [ ] Четкие рекомендации со структурированным обоснованием
- [ ] 3–5 названий для рекомендуемого ракурса.
- [ ] Краткое описание (~100 слов) и длинное описание (~250 слов)
- [ ] Черновик отзыва, созданный на основе шаблона
- [ ] CHECKPOINT отображается четко
- [ ] 4 файла сохранены

## <a name="tips"></a>Советы

- Отправьте `feedback-draft.md` партнеру перед контрольной точкой; 10 минут обратной связи со стороны могут сэкономить часы работы над сценарием.
- Рекомендация — это отправная точка, а не приказ (знания вашей аудитории важнее любых алгоритмических предложений).
- Слабые заголовки обычно слишком абстрактны: проверяйте каждое название, спрашивая: «Остановится ли кто-нибудь в коридоре, чтобы прочитать это?»

## <a name="templates"></a>Шаблоны

- Форматы обратной связи: [`templates/feedback-draft.md`](templates/feedback-draft.md).

## Связанный

- [Этап 3: Концепции](../stage-3-concepts/SKILL.md): необходимое условие
- [Этап 5: Script](../stage-5-script/SKILL.md): начинается после этой КОНТРОЛЬНОЙ ТОЧКИ.
- [Оркестратор](../orchestrator/SKILL.md)
