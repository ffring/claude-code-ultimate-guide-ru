# Правила обзора Greptile: Шаблон

<!--
  Copy to .greptile/rules.md at repo root, then replace every placeholder section
  with your project's actual conventions. Greptile's value over Claude Code Action
  is cross-file RAG search: dependency chains, "who else calls this," patterns that
  repeat across distant files. Don't ask it to re-check what Claude/CodeRabbit already
  cover on this repo (see the non-duplication note below), let it specialize instead.
-->

**Примечание о недублировании**: в этой книге правил НЕ следует повторять то, что `.github/prompts/code-review.md`
(Claude Code Action) или `.coderabbit.yaml` (CodeRabbit) уже проверили этот репозиторий. Если правило
появляется более чем в одном конфиге, один из трёх должен от него отказаться. Выберите тот инструмент, который имеет
лучшая точка обзора для этой конкретной проверки (таблицу правил разделения см. в документации по архитектуре).

---

## 1. Архитектурные условности

<!-- Example: layering rules, forbidden imports between modules, naming conventions -->

- [ ] Опишите здесь структуру слоев (например, «Контроллер → Сервис → Репозиторий, без пропуска слоев»).
- [ ] Список запрещенных межмодульных импортов
- [ ] Обратите внимание на любые границы кода (рецензенты сгенерированных файлов должны пропускать)

## 2. Бизнес-инварианты

<!--
  This is the section that benefits most from Greptile's cross-file search: invariants
  that span multiple files and are easy to violate without noticing (a status enum with
  transition rules enforced in one service but not another, a scoping rule that must apply
  to every new query on a given table, etc).
-->

- [ ] Перечислите конечные автоматы и их допустимые переходы.
- [ ] Список правил области действия, которые должны применяться к каждому запросу к конфиденциальным таблицам.
- [ ] Перечислите поля, которые никогда не должны подвергаться воздействию определенных roles/endpoints.

## 3. Безопасность

<!-- Only list checks NOT already owned by Claude Code Action's prompt or CodeRabbit's path_instructions -->

- [ ] Описать соглашения об обработке secrets/credentials.
- [ ] Опишите любые шаблоны auth/permission, специфичные для проекта.

## 4. Соглашения по коду

- [ ] Formatting/linting уже применяется CI, не помечайте повторно (укажите инструмент, например ESLint/Ruff/rustfmt)
- [ ] Идиомы, специфичные для проекта, которые стоит отмечать при нарушении

## 5. Доступность (если применимо)

- [ ] Перечислите шаблоны, соответствующие WCAG и относящиеся к вашей библиотеке компонентов.

## 6. Целостность данных

- [ ] Список инвариантов, которые миграция или изменение схемы никогда не должны нарушать
