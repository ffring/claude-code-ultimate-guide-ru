---
name: plan-pipeline-execute
description: "Выполнение проверенного плана: изоляция рабочего дерева, каркас TDD, параллельные агенты на основе уровней, контроль качества с дымовым тестом, создание PR и слияние. Управляет всем, вплоть до объединенного PR."
effort: high
disable-model-invocation: true
---

# /plan-pipeline:execute: Выполнение объединенного PR

Выполните проверенный план в изолированном рабочем дереве. Создавайте агентов для каждой задачи, проверяйте качество, создавайте и объединяйте PR. Справляется со всем, вплоть до уборки.

Перед этой командой запустите `/clear`.

---

## Предварительное условие

Подтвержденный план должен существовать в `docs/plans/plan-{name}.md` со всеми решенными проблемами (выходные данные `/plan-pipeline:validate`).

---

## Шаг 1. Настройка рабочего дерева

Создайте изолированное рабочее дерево git:

```bash
git worktree add .worktrees/{plan-name} -b feature/{plan-name}
```

Все выполнение происходит внутри рабочего дерева. Главный филиал остается чистым повсюду.

---

## Шаг 2: Строительные леса TDD

*Только для задач, отмеченных в плане как TDD.*

Для каждой задачи TDD перед любой реализацией:
1. Напишите неудачные тесты, определяющие критерии приемки.
2. Запустите тесты, чтобы убедиться, что они не пройдены (красный)
3. Зафиксируйте неудачные тесты
4. Отметьте тестовый файл в задаче, чтобы агент внедрения мог найти его.

Не пишите код реализации на этом этапе.

---

## Шаг 3. Параллельное выполнение на основе уровней

Анализируйте список задач из плана. Группируйте задачи по слоям (Уровень 1 = основа, Уровень 2 = зависит от уровня 1 и т. д.).

**Для каждого слоя:**
1. Определите все задачи на слое
2. Параллельно запускать по одному агенту для каждой задачи (инструмент Task, run_in_background: true)
3. Каждый агент получает: описание задачи, файлы для изменения, критерии приемки и соответствующие ADR.
4. Отслеживайте все агенты, читая путь вывода, сообщаемый агентом через `Read` (TaskOutput был удален в версии 2.1.278).
5. Каждый агент фиксирует выполнение задачи: `git commit -m "feat: {task-description}"`
6. Подождите, пока все задачи на слое будут завершены, прежде чем переходить к следующему уровню.

**Обнаружение сноса**: после каждого слоя сравнивайте фактические изменения с плановыми спецификациями. Если реализация значительно отклоняется от плана (новые файлы не включены в план, файлы плана не изменены), отметьте это и спросите, как действовать дальше. Не продолжайте молча продолжать дрейфовать.

**Инструкции агента для каждой задачи:**
```
You are implementing one task from a validated plan.
Task: {description}
Files to modify: {file list}
Acceptance criteria: {criteria}
Relevant ADRs: {adr list}

First principles:
- Build state-of-the-art. No workarounds, no legacy patterns.
- Fix at the correct architectural level, never with component-level hacks.
- If you discover that the plan is wrong or missing context, stop and report. Do not improvise architecture.

Commit your changes when complete with message: "feat: {task-description}"
```

---

## Шаг 4: Качественные ворота

Запустить параллельно:
- Линтер
- Проверка типа (если применимо)
- Полный набор тестов

Если все прошло успешно: приступайте к дымовому тесту.

В случае сбоя: создайте агент отладки `quality-fixer` с выводом об ошибке. Он получает до **3 попыток автоматического исправления**. После каждой попытки повторно запускайте проверку качества. Если после трех попыток все еще не получается: остановитесь, сообщите о сбое с полным выводом ошибки и дождитесь вмешательства человека.

**Интеграционный дымовой тест** *(пропустите для планов только для внешнего интерфейса или только для документации)*:

Запустите команды дыма, определенные в разделе плана `## Integration Verification`. Кроме того:
- Если GraphQL: запустите самоанализ, чтобы убедиться, что схема доступна.
- Если службы Docker: просканируйте журналы контейнера на наличие записей уровня ОШИБКИ.
- Если новые маршруты API: проверьте, что каждый из них возвращает ожидаемые коды состояния.

Сбои дымового теста отлаживаются агентом `quality-fixer-smoke` с тем же лимитом в 3 попытки.

---

## Шаг 5: Предварительная PR-документация

*В рабочем дереве перед созданием PR.*

**PRD Согласование**: сравните реализованное поведение с исходным PRD. Обратите внимание на любые отклонения или дополнения, обнаруженные в ходе реализации. Обновите PRD фактическими данными. Эти обновления поставляются с тем же PR, что и данная функция.

**Plan Archival**: переместите `docs/plans/plan-{name}.md` в `docs/plans/completed/plan-{name}.md`. Обновите заголовок статуса.

Зафиксировать обновления документации: `docs: reconcile PRD and archive plan for {feature-name}`.

---

## Шаг 6: Продвигайте и пиарите

Нажмите ветку рабочего дерева и создайте PR:

```bash
git push origin feature/{plan-name}
gh pr create \
  --title "{feature-name}: {one-line summary from plan}" \
  --body "$(cat .pr-body.md)"
```

Образец тела PR:
```markdown
## Summary
{plan summary paragraph}

## Changes
{auto-generated from task list: bullet per task with files affected}

## ADRs
{list of ADRs created during this plan}

## Test Plan
{from plan test plan section}

## Smoke Test Results
{output from integration verification}
```

Объедините с помощью сквоша:
```bash
gh pr merge --squash --delete-branch
```

---

## Шаг 7. Метрики после слияния

Вернитесь к develop/main.. Обновите `docs/plans/metrics/{name}.json` с данными выполнения:
- Количество задач и разбивка по слоям
- TDD количество задач
- Статистика различий (файлы изменены, строки added/removed)
- Результаты проверки качества (pass/fail, попытки исправления)
- Результаты испытаний на дым
- Оценка за дрейф (0-1, насколько точно реализация соответствует плану)
- Данные PR (номер, фиксация слияния, временная метка)

Зафиксировать обновление метрик.

---

## Шаг 8. Очистка рабочего дерева

```bash
git worktree remove .worktrees/{plan-name}
```

---

## Использование

```
/plan-pipeline:execute
```

Выбирает самый последний проверенный план. Или укажите:

```
/plan-pipeline:execute plan-user-authentication
```

## Выход

```
Setting up worktree: .worktrees/user-authentication
Branch: feature/user-authentication

TDD scaffolding: 2 tasks marked TDD
  ✓ Written failing tests for: auth-token-validation
  ✓ Written failing tests for: refresh-token-rotation
  Committed: "test: failing tests for auth pipeline (TDD)"

Executing Layer 1 (3 tasks, parallel)...
  [agent-1] Implementing: JWT token generation service
  [agent-2] Implementing: User session model
  [agent-3] Implementing: Auth middleware
  ✓ Layer 1 complete. 3 commits.

Drift check: Layer 1... ✓ No drift detected.

Executing Layer 2 (2 tasks, parallel)...
  [agent-4] Implementing: Login endpoint
  [agent-5] Implementing: Refresh endpoint
  ✓ Layer 2 complete. 2 commits.

Quality gate...
  ✓ Lint passed
  ✓ Type check passed
  ✓ Tests: 47 passed, 0 failed

Smoke test...
  ✓ GraphQL introspection: OK
  ✓ POST /api/auth/login: 200
  ✓ POST /api/auth/refresh: 200

Pre-PR docs...
  ✓ PRD reconciled (1 minor deviation noted)
  ✓ Plan archived to docs/plans/completed/

PR created: #142 "user-authentication: JWT auth with refresh token rotation"
PR merged (squash). Branch deleted.

Metrics committed. Worktree cleaned.
✅ Feature complete.
```

## <a name="when-to-use"></a>Когда использовать

После подтверждения `/plan-pipeline:validate` все проблемы решены. Никогда не пропускайте проверку: выполнение непроверенного плана пропускает независимую проверку, которая выявляет в среднем около 18 проблем.

## Положение трубопровода

```
/plan-pipeline:ceo-review    → product direction locked
/plan-pipeline:eng-review    → architecture locked
/plan-pipeline:start         → produce implementation plan
/plan-pipeline:validate      → validate before execution
/plan-pipeline:execute       → execute to merged PR          ← you are here
```
