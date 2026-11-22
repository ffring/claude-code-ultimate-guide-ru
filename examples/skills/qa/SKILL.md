---
name: qa
description: "Систематическое тестирование качества веб-приложения: с учетом различий, многоуровневое, с циклом исправления и проверки."
argument-hint: "[path] [--thorough]"
effort: high
disable-model-invocation: true
---

# Контроль качества: тестирование веб-приложений

Систематически тестируйте веб-приложение на наличие ошибок, затем исправляйте и проверяйте каждую обнаруженную проблему.

Три уровня тщательности. Область видимости с учетом различий проверяет, что на самом деле изменилось.

## Инструкции

### Шаг 1. Обнаружение области действия

Определите, какие страницы и функции нужно протестировать.

**Режим с учетом различий (по умолчанию):** Определите маршруты, на которые повлияли изменения текущей ветки.

```bash
# Files changed in this branch
git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD~5

# Identify affected routes from changed files
# e.g., changes in src/pages/dashboard/ → test /dashboard
# changes in api/payments/ → test payment flows
```

**Полный режим** (`/qa --full`): протестируйте все приложение, начиная с критических путей.

**Явная область действия** (`/qa /dashboard /settings`): тестировать только указанные страницы.

---

### Шаг 2: Выбор уровня

| Уровень | Флаг | Область применения | Используйте, когда |
|------|------|-------|----------|
| Быстрый | `--quick` | Критический + только высокая степень серьезности | Быстрая проверка перед фиксацией |
| Стандартный | *(по умолчанию)* | + Средняя степень тяжести | Предварительная PR-проверка |
| исчерпывающий | `--exhaustive` | + Низкий + косметический | Кандидат на выпуск |

---

### Шаг 3. Очистите рабочее дерево.

Перед тестированием убедитесь, что исправления можно вносить атомарно.

```bash
git status --short
```

Если есть незафиксированные изменения: сначала сохраните их (`git stash`) или зафиксируйте. Тестирование на грязном дереве делает невозможным изолировать исправления.

---

### Шаг 4: Тестирование

Для каждой страницы в области систематически проверяйте все категории, относящиеся к выбранному уровню.

#### Как протестировать

Используйте любые доступные инструменты браузера:
- **MCP инструменты браузера** (если настроено): автоматическая навигация и снимки экрана
- **Playwright/Puppeteer** (если в проекте): тестовые запуски по сценарию
- **Ручное тестирование**: перейдите по URL-адресу и систематически документируйте результаты.

На каждой странице укажите:

```
1. Load the page: does it render without errors?
2. Check console: any uncaught errors, failed requests, warnings?
3. Test primary user action: the core thing this page is for
4. Test empty state: what shows when there's no data?
5. Test error state: what happens when an action fails?
6. Test on narrow viewport: does it break below 375px?
```

#### Таксономия проблем

**Visual** (макет, интервалы, типографика, цвета, отзывчивость)
**Functional** (нарушенные взаимодействия, отсутствующие функции, неправильное поведение)
**UX** (путаные потоки, отсутствие обратной связи, плохие сообщения об ошибках)
**Content** (опечатки, неправильный текст, текст-заполнитель в производстве)
**Performance** (медленная загрузка страниц, сдвиги макета, неоптимизированные изображения)
**Console** (ошибки JavaScript, неудачные сетевые запросы, предупреждения об устаревании)
**Accessibility** (отсутствует замещающий текст, ловушки клавиатуры, отсутствуют метки, контраст)

#### Уровни серьезности

| Серьезность | Критерии | Примеры |
|----------|----------|---------|
| **Критический** | Функция полностью не работает или существует риск потери данных | Ошибка 500, пустая страница, форма, в которой теряются данные |
| **High** | Основная функция ухудшена, значительный вред UX | Показаны неверные данные, неверный основной призыв к действию, неверный макет для мобильных устройств. |
| **Средний** | Небольшая проблема с функцией, заметная, но существует обходной путь. | Визуальный сбой, запутанное пустое состояние, медленная загрузка |
| **Low** | Косметический, едва заметный | Незначительный интервал, незначительная проблема с копированием, предупреждение консоли низкой важности. |

**Быстрый уровень**: только критический + высокий
**Стандартный уровень**: Критический + Высокий + Средний
**Исчерпывающий уровень**: все уровни серьезности.

---

### Шаг 5: Документируйте результаты

Отслеживайте каждую проблему с помощью уникального идентификатора.

```
ISSUE-001
  Severity:  [Critical / High / Medium / Low]
  Category:  [Visual / Functional / UX / Content / Performance / Console / Accessibility]
  Page:      [URL or route]
  Finding:   [What is wrong, specific not vague]
  Steps:     [How to reproduce]
  Expected:  [What should happen]
  Evidence:  [Screenshot path or console output]
```

---

### Шаг 6. Исправьте и проверьте петлю

Для каждой критической и высокой проблемы (и Medium/Low на уровнях Standard/Exhaustive):

1. **Исправить проблему** в исходном коде
2. **Коммит атомарно**: один коммит на каждое исправление

```bash
git add <changed-files>
git commit -m "fix: <brief description of what was fixed>"
```

3. **Re-verify**: перейдите на ту же страницу и подтвердите, что проблема решена.
4. **Обновите статус проблемы** на FIXED с помощью хэша фиксации.

Не группируйте несколько исправлений в одном коммите. Каждое исправление должно быть индивидуально обратимым.

---

## Выходной формат

```
QA REPORT
════════════════════════════════════════
Branch:    [current branch]
Scope:     [pages tested]
Tier:      [Quick / Standard / Exhaustive]
Duration:  [time taken]

HEALTH SCORES
─────────────────────────────────────────
  Visual        [PASS / WARN / FAIL]  [N issues]
  Functional    [PASS / WARN / FAIL]  [N issues]
  UX            [PASS / WARN / FAIL]  [N issues]
  Content       [PASS / WARN / FAIL]  [N issues]
  Performance   [PASS / WARN / FAIL]  [N issues]
  Console       [PASS / WARN / FAIL]  [N issues]
  Accessibility [PASS / WARN / FAIL]  [N issues]

ISSUES FOUND: N (X critical, Y high, Z medium, W low)
ISSUES FIXED: N
ISSUES REMAINING: N

─────────────────────────────────────────
ISSUE-001 [FIXED | OPEN]
  Severity:  High
  Category:  Functional
  Page:      /dashboard
  Finding:   Save button does nothing when form has validation errors, no feedback shown
  Fix:       Added error toast notification (commit abc1234)

ISSUE-002 [OPEN]
  Severity:  Medium
  Category:  Visual
  Page:      /settings
  Finding:   Input fields overflow container below 375px viewport
  ...

─────────────────────────────────────────
SHIP READINESS
  Critical issues:  [0 remaining / N remaining (BLOCKER)]
  High issues:      [0 remaining / N remaining (CONCERN)]

VERDICT: [READY TO SHIP / NOT READY: address critical and high issues first]
════════════════════════════════════════
```

## Использование

```
/qa                          # Standard tier, diff-aware scope
/qa --quick                  # Quick tier (critical + high only)
/qa --exhaustive             # Full coverage including cosmetic issues
/qa --full                   # Standard tier, test entire app (not just diff)
/qa /dashboard /settings     # Test specific pages
/qa https://staging.app.com  # Test a specific URL
```

## <a name="tips"></a>Советы

1. **Запускайте после каждой важной функции**, а не только перед отправкой
2. **Сначала с учетом Diff**: проверьте, что изменилось, прежде чем расширять область действия
3. **Исправьте критические и высокие значения, прежде чем продолжить**: не накапливайте неустраненные проблемы
4. **Снимок экрана с доказательством**: всегда записывайте before/after для критических исправлений
5. **Проверьте мобильное устройство**: большинство визуальных ошибок появляются при ширине 375 пикселей.

## Связанные команды

- `/investigate`: анализ первопричин, когда QA обнаруживает сложную ошибку.
- `/ship`: контрольный список перед развертыванием (запускается после прохождения контроля качества)
- `/canary`: мониторинг после развертывания (запускается после поставки)

$ARGUMENTS
