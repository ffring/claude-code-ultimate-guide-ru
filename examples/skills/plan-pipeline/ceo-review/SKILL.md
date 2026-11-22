---
name: plan-pipeline-ceo-review
description: "Стратегические ворота продукта: бросьте вызов брифу, найдите 10-звездочный продукт, скрывающийся внутри запроса, прежде чем писать какой-либо код."
effort: medium
disable-model-invocation: true
---

# /plan-pipeline:CEO-review: Стратегические ворота продукта

Команда перед реализацией. Вставляет явный барьер между «У меня есть запрос» и «Я начинаю программировать». Оспаривает буквальный запрос и спрашивает, каким должен быть настоящий продукт.

**Использовать в режиме плана перед любой реализацией.**

---

## Проблема, которую это решает

Claude Code оптимизирован для создания того, что вы просите. Если вы скажете «добавить X», он создаст X. Он не будет спрашивать, действительно ли X является правильным продуктом. Эта команда исправляет это, явно переключаясь в режим мышления о продукте до того, как сработает инстинкт реализации.

---

## <a name="when-to-use"></a>Когда использовать

- Прежде чем реализовать какой-либо существенный запрос функции
- Особенно, когда запрос конкретный («добавить загрузку фото»), поскольку конкретность часто сигнализирует о том, что запрашивающий уже сжал пространство решения.
- Если вы хотите протестировать направление, прежде чем тратить время на разработку

---

## Три режима

Команда просит пользователя выбрать один, прежде чем продолжить:

| Режим | Поза | Используйте, когда |
|------|---------|----------|
| **РАСШИРЕНИЕ ОБЛАСТИ** | Найдите 10-звездочный продукт, увеличьте масштаб | Направление нечеткое, хочется мечтать |
| **HOLD ОБЛАСТЬ** | Примите направление, сделайте план пуленепробиваемым | Направление заблокировано, хочется строгости |
| **СОКРАЩЕНИЕ ОБЪЕМА** | Раздеть до минимально возможного, разрезать безжалостно | Перегруженный портфель заказов, нужно доставить быстро |

Ассистент фиксируется в выбранном режиме и не отвлекается во время просмотра.

---

## Шаблон запроса

```markdown
# /plan-pipeline:ceo-review

You are in CEO / founder review mode. Your job is NOT to implement anything.
Your job is to review the plan or feature request with product-level thinking
and return a better brief.

## Step 0: Choose Mode

Ask the user which mode to use (if not specified):
- SCOPE EXPANSION: Find the 10-star product. Push scope up. What's the version
  that feels inevitable and delightful?
- HOLD SCOPE: Accept the direction. Make this plan bulletproof. Catch every
  failure mode and unstated assumption.
- SCOPE REDUCTION: Find the minimum viable version that achieves the core
  outcome. Cut everything else.

Once the user selects, commit to that mode for the entire review.

## Step 1: Restate the Request

Summarize the literal request in 1-2 sentences. Be precise, not editorialized.

## Step 2: Challenge the Premise

Ask the more important question: what is this product actually FOR?

- What is the user's real job-to-be-done?
- Is the literal request the best way to solve it?
- What assumption is the request making that might be wrong?

## Step 3: The Real Product (EXPANSION) / Bulletproof Plan (HOLD) / MVP (REDUCTION)

**SCOPE EXPANSION**: Describe the 10-star version of this product.
- What would make this 10x better for 2x the effort?
- What do users actually want, not what they asked for?
- List 5-8 specific features or design decisions that would make this feel
  inevitable.

**HOLD SCOPE**: Accept the direction. Now find everything that can go wrong.
- Unstated assumptions in the request
- Edge cases that are not covered
- Missing error states
- UX gaps
- Security or trust boundary issues
- Operational concerns (monitoring, rollback, data migration)

**SCOPE REDUCTION**: What is the smallest version that proves the core value?
- What is the one thing this must do?
- What can be cut without losing the point?
- What can be deferred to v2?

## Step 4: Recommendation

Return one of:
- **Proceed as stated**: the original request is the right product
- **Reframe**: here is the better brief (with specifics)
- **Reject**: here is why this is the wrong direction, and what to build instead

Do NOT make any code changes. This is a review, not an implementation.
```

---

## Пример

**Input**: «Разрешить продавцам загружать фотографии для своих объявлений»

**Вывод (РАСШИРЕНИЕ ОБЛАСТИ)**:
> «Загрузка фотографий» не является функцией. Настоящая работа — помогать продавцам создавать объявления, которые действительно продают.
>
> Вот 10-звездочная версия: автоматически идентифицировать продукт по фотографии, извлекать артикул и характеристики из Интернета, автоматически составлять заголовок и описание, предлагать, какая загруженная фотография лучше всего конвертируется в качестве главного изображения, обнаруживать фотографии низкого качества (темные, загроможденные, с низким уровнем доверия), прежде чем они будут опубликованы.
>
> **Рекомендация**: Переосмыслить. В брифе должно быть «умное создание объявления из фотографии», а не «загрузка фотографий».

---

## Положение трубопровода

```
/plan-pipeline:ceo-review    -> lock product direction   <- you are here
/plan-pipeline:eng-review    -> lock technical architecture
/plan-pipeline:start         -> produce implementation plan
/plan-pipeline:validate      -> validate before execution
/plan-pipeline:execute       -> execute to merged PR
```
