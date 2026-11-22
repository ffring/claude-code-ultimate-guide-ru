---
title: "GitHub Actions Рабочие процессы для Claude Code"
description: "Готовые к использованию рабочие процессы CI/CD, интегрирующие Claude Code в GitHub Actions."
tags: [ci-cd, devops, template, workflows]
---

# Рабочие процессы GitHub Actions для Claude Code

Готовые к использованию рабочие процессы GitHub Actions, которые интегрируют Claude Code в ваш конвейер CI/CD.

## <a name="prerequisites"></a>Предварительные условия

1. **Установите приложение Claude GitHub** на свой org/repo (требуется для действий, чтобы комментировать PRs/issues)
2. **Добавить секретный ключ API**: в репозитории перейдите в «Настройки» → «Секреты и переменные» → «Действия» → «Новый секрет хранилища».
   - Имя: `ANTHROPIC_API_KEY`
   - Значение: ваш ключ Anthropic API от [console.anthropic.com](https://console.anthropic.com).
3. **Рабочие процессы копирования**: поместите эти файлы `.yml` в каталог `.github/workflows/`.
4. **Test**: откройте тестовый PR или задачу, чтобы увидеть их запуск.

## Доступные рабочие процессы

### 1. Проверка кода (на основе подсказок, `claude-code-review.yml`)

Внешняя подсказка, протокол борьбы с галлюцинациями и триггер `/claude-review` по требованию.

Логика проверки находится в `.github/prompts/code-review.md`, поэтому вы можете выполнять итерацию по критериям, не затрагивая рабочий процесс YAML. В подсказке Claude предлагается проверить каждый результат с помощью `Read`/`Grep`. Эта инструкция не является исполняемым приемочным контролем.

**Features:**
- Триггеры по PR open/sync/ready **and** `/claude-review` комментарий
- Внешняя подсказка: отредактируйте `code-review.md`, чтобы настроить критерии для вашего стека.
- Протокол борьбы с галлюцинациями: никаких вымышленных номеров строк и непроверенных утверждений.
- Структурированный вывод: таблица `🔴 MUST FIX`/`🟡 SHOULD FIX`/`🟢 CAN SKIP` + встроенные комментарии.
- `claude_args` ограничивает запрошенные инструменты проверкой файлов и рецензированием публикаций; проверка доступности и разрешений инструмента в целевом репозитории
- Поддержка токена OAuth (ключ API не требуется, если установлено приложение Claude GitHub)

**Setup:**
```bash
# Copy both files into your repo
cp examples/github-actions/claude-code-review.yml .github/workflows/
mkdir -p .github/prompts
cp examples/github-actions/prompts/code-review.md .github/prompts/

# Add secret: CLAUDE_CODE_OAUTH_TOKEN (or ANTHROPIC_API_KEY)
# Install Claude GitHub App: https://github.com/apps/claude
```

**Customization:**
Отредактируйте `.github/prompts/code-review.md`, чтобы добавить соглашения о стеке:
```markdown
## Stack Context
- TypeScript strict mode, no `any`
- React Server Components, no `useEffect` for data fetching
- All DB writes must go through the repository layer
- New API routes require integration tests
```

**Граница приемки:**
Этот шаблон носит рекомендательный характер. Первый шлюз выбирал последнюю проверку без привязки ее производителя, запуска или версии, считал отсутствующий заголовок серьезности равным нулю и мог пропускать ее после сбоя производителя. Оно было удалено. Не превращайте консультативную работу в приемочный приговор.

Для замены необходимы подтвержденные доказательства соответствующей версии и области действия, явного отказа и неизвестных состояний, а также отдельно проверенная политика хранилища. Моделирование управления и восстановления [](../workflows/review-control-demo.py) тестирует локальные варианты принятия решений и восстановления с поддельным пунктом назначения; это не работающий адаптер GitHub. См. руководство [для нескольких поставщиков](../../guide/workflows/multi-provider-code-review.md).

---

### 2. Проверка кода (пакетная, `claude-code-review-batched.yml`)

Для PR, превышающих пороговое значение количества файлов (по умолчанию 75), один проход проверки либо истекает по тайм-ауту, либо слишком распыляет внимание Claude на несвязанные файлы. Этот рабочий процесс разбивает разницу на пакеты на уровне домена (миграции, серверное ядро, API-маршруты, интерфейс, тесты и инструменты), проверяет каждый пакет в параллельном матричном задании, а затем синтезирует одну окончательную таблицу серьезности.

**Features:**
- Задание `check-size` подсчитывает измененные файлы и ограничивает остальную часть рабочего процесса на пороге.
- Задание Matrix `review-batch`: один параллельный запуск для каждого домена, область действия которого ограничена `append_system_prompt`.
- Задание `synthesis` объединяет все пакетные комментарии в одну дедуплицированную таблицу.
- Тот же файл подсказок, что и для непакетного рабочего процесса (`.github/prompts/code-review.md`), не требуется поддерживать дублированные критерии проверки.

**Setup:**
```bash
cp examples/github-actions/claude-code-review-batched.yml .github/workflows/

# Edit the `matrix.domain` globs to match your actual directory layout.
# The shipped ones (prisma/migrations, src/server/services, src/components...)
# are a generic starting point, not a fit for every stack.
```

Запустите это вместе с `claude-code-review.yml`, а не вместо него. Оба активируются одними и теми же PR-событиями; Порог задания `check-size` — это то, что решает, какой из них действительно проверяет, поэтому сохраняйте согласованность `BATCH_THRESHOLD`, если вы задаете подсчет файлов и в другом месте.

---

### 3. Автопиар-обзор (`claude-pr-auto-review.yml`)

**Расширенная версия** с подробными критериями проверки и интеллектуальной фильтрацией.

Создает структурированный обзор со встроенными комментариями сразу после открытия или обновления PR.

**Features:**
- Автоматическая проверка кода на PR open/update
- 8 основных областей: корректность, безопасность, производительность, читабельность, ремонтопригодность, тестирование, лучшие практики, критические изменения.
- Обратная связь на основе приоритета: 🔴 Критическая, 🟡 Важная, 🟢 Предложение, 💡 Совет.
- Интеллектуальная фильтрация файлов (пропускает артефакты сборки, блокирует файлы)
- Пропускает черновики PR для экономии затрат
- Краткий обзор с оценкой рисков
- Обработка ошибок и резервные уведомления
- Встроенные комментарии к конкретным строкам

**Usage:**
```bash
# Copy the workflow file
cp examples/github-actions/claude-pr-auto-review.yml .github/workflows/

# Open a PR - Claude will automatically review it
```

**Customization:**
Добавьте контекст проекта, раскомментировав раздел `append_system_prompt`:
```yaml
append_system_prompt: |
  Project conventions:
  - Use TypeScript strict mode
  - Follow functional programming patterns
  - All functions must have JSDoc comments
  - Test coverage must be >80%
```

---

### 4. Проверка безопасности (`claude-security-review.yml`)

Запускает целенаправленное сканирование безопасности и комментирует результаты непосредственно в PR.

**Features:**
- Анализ, ориентированный на безопасность, по каждому PR
- Выявляет потенциальные уязвимости
- 10 основных рекомендаций OWASP
- Публикует результаты в виде комментариев по связям с общественностью

**Configuration:**
```yaml
# Optional parameters in the workflow file:
exclude-directories: "docs,examples"    # Skip certain directories
claudecode-timeout: "20"                # Timeout in minutes
claude-model: "claude-3-5-sonnet-20240620"  # Model to use
```

**Usage:**
```bash
# Copy the workflow file
cp examples/github-actions/claude-security-review.yml .github/workflows/

# Every PR will be automatically scanned for security issues
```

---

### 5. Очередность проблем (`claude-issue-triage.yml`)

Когда открывается новый выпуск, Claude предлагает labels/severity и публикует аккуратный комментарий по сортировке.

**Features:**
- Автоматическая классификация проблем
- Предложения по ярлыкам
- Оценка серьезности (низкая, средняя, ​​высокая, критическая)
- Обнаружение дубликатов
- Комментарий к сортировке Markdown

**Автоматическое применение меток (дополнительно):**
Чтобы автоматически применять предложенные метки, отредактируйте файл рабочего процесса и измените:
```yaml
- name: Apply labels (optional)
  if: ${{ false }}  # Change to true to auto-apply labels
```

**Usage:**
```bash
# Copy the workflow file
cp examples/github-actions/claude-issue-triage.yml .github/workflows/

# Open a new issue - Claude will automatically triage it
```

---

---

## Настройка многомодельного обзора

Запуск Claude вместе с другими автоматическими рецензентами (Gemini, Greptile, CodeRabbit) выявляет проблемы, которые не упускает ни одна отдельная модель. Схема: каждый сервис проверяет независимо, затем Claude синтезирует консенсус.

**Почему мультимодель?**
У каждой модели есть слепые зоны. Пункты, поднятые более чем двумя независимыми рецензентами, являются важными; уникальные уловки каждой модели добавляют охвата, который в противном случае вы бы упустили.

### Рекомендуемый стек (плоский $30/month)

| Услуга | Стоимость | Сила |
|---------|------|----------|
| Обзор **Claude Code** (этот рабочий процесс) | Включено в план Anthropic | Глубокие рассуждения, знание кодовой базы |
| **Gemini Ассистент кода** | 0 долларов США (включено в Google Workspace) | Независимый LLM, разные данные обучения |
| **Грептилия** | ~$30/month плоский | Межфайловый контекст, графики зависимостей |

**Альтернатива**: CodeRabbit Pro ($15/dev/month) добавляет интерактивные вопросы и ответы и диаграммы последовательности.

### <a name="setup"></a>Настройка

**Шаг 1. Установите Gemini Code Assist**

1. GitHub Marketplace → поиск «Помощник по коду Gemini»
2. Установите и авторизируйтесь в своем репо
3. Gemini будет автоматически просматривать новые PR (сообщения как `gemini-code-assist[bot]`)
4. Дополнительная конфигурация через `.gemini/config.yaml`:
   ```yaml
   code_review:
     comment_severity_threshold: MEDIUM
     max_comments_per_review: 20
   ```

**Шаг 2. Установите Greptile**

1. [greptile.com](https://greptile.com) → подключить аккаунт GitHub
2. Выберите свой репозиторий, Greptile проиндексирует кодовую базу (~5 минут).
3. Настройте на панели управления: целевые ветки, пути фокуса.
4. Отзывы публикуются как комментарии `greptile[bot]` к PR.
5. Скопируйте `.greptile/config.json`, `.greptile/rules.md` и `.greptile/files.json` из этого каталога в корень вашего репо и заполните заполнители. `rules.md` — это место, где межфайловый RAG-поиск Greptile зарабатывает себе на жизнь: бизнес-инварианты, охватывающие несколько файлов (конечный автомат, реализованный в одном сервисе, но не в другом, правило области видимости, которое должно соблюдаться при каждом запросе к конфиденциальной таблице). Не повторяйте правила, уже описанные в `.github/prompts/code-review.md` или `.coderabbit.yaml`, разделите контрольный список на три, чтобы каждый инструмент имел отдельный набор.

**Шаг 3. Включите задание синтеза**

В `claude-code-review.yml` удалите `false &&` из условия задания синтеза:

```yaml
# Before (disabled):
if: |
  false &&
  (github.event_name == 'pull_request' ...

# After (enabled):
if: |
  (github.event_name == 'pull_request' ...
```

**Шаг 4. Настройте CodeRabbit (необязательно)**

Скопируйте `.coderabbit.yaml` из этого каталога в корень вашего репо. Отредактируйте `path_instructions`, чтобы он соответствовал вашему стеку.

### Как работает синтез

Работа `multi-reviewer-synthesis` в `claude-code-review.yml`:

1. Ждет 5 минут после обзора Claude (внешние боты публикуют пост в течение 2-3 минут)
2. Собирает все отзывы и комментарии через GitHub API.
3. Пропускает автоматически, если опубликовали менее двух рецензентов.
4. Claude идентифицирует консенсус (один и тот же результат, отмеченный более чем 2 рецензентами) и уникальные уловки.
5. Публикует структурированный обобщенный комментарий к PR.

### Масштабирование до больших PR и повторных пушей

Когда репозиторий имеет реальный трафик, возникают две проблемы: PR, которые затрагивают десятки файлов за один раз, и PR, которые перед слиянием увеличиваются до пяти раз. Ни одна из них не решается базовым рабочим процессом, описанным выше.

**Large PRs**: переключитесь на `claude-code-review-batched.yml` при превышении порогового значения количества файлов (см. рабочий процесс 2). Разделение различий по доменам сохраняет фокус каждого пакета вместо того, чтобы запрашивать один проход для хранения всего PR в контексте.

**Повторные push-уведомления**: повторный просмотр полной разницы при каждом принудительном сжигании токенов для уже проверенного кода Claude. Шаг дельта-проверки сравнивает SHA, встроенный в предыдущий комментарий к обзору (опубликуйте его как комментарий HTML, например `<!-- reviewed-sha: abc123 -->`), с SHA текущего push-уведомления и ограничивает следующую проверку только теми файлами, которые были изменены с тех пор. В этом репозитории этот шаг не представлен в виде готового шаблона, поскольку он зависит от того, как вы уже отслеживаете состояние проверки (комментарий бота, метка, отдельный запуск проверки); шаблон таков: прочитайте последний маркер, diff `git diff <last-sha>..HEAD --name-only`, передайте этот список файлов в `append_system_prompt` так же, как пакетный рабочий процесс ограничивает область действия по домену.

### Файлы в этом каталоге

```
examples/github-actions/
├── README.md                        # This file
├── claude-code-review.yml           # Advisory review + optional synthesis job
├── claude-code-review-batched.yml    # Domain-split matrix review for large PRs
├── .coderabbit.yaml                 # CodeRabbit config (copy to repo root)
├── .greptile/
│   ├── config.json                  # Greptile review config (copy to repo root)
│   ├── rules.md                     # Cross-file invariants rulebook (copy to repo root)
│   └── files.json                   # Doc-to-glob RAG index (copy to repo root)
├── claude-pr-auto-review.yml        # Inline prompt auto-review (alternative)
├── claude-security-review.yml       # Security-focused scan
├── claude-issue-triage.yml          # Issue triage workflow
└── prompts/
    └── code-review.md               # Externalized review prompt (copy to .github/prompts/)
```

---

## <a name="customization"></a>Кастомизация

### <a name="model-selection"></a>Выбор модели
Установите параметр `CLAUDE_MODEL` или `claude-model` в рабочих процессах:
```yaml
env:
  CLAUDE_MODEL: claude-3-5-sonnet-20240620
```

### Разрешения
Каждый рабочий процесс декларирует минимальные необходимые разрешения:
- `pull-requests: write` для PR-обзоров
- `issues: write` для сортировки проблем
- `contents: read` для чтения содержимого репозитория

Корректируйте только в том случае, если ваша организация требует более строгих политик.

### Фильтрация области
Используйте фильтры `paths:`, чтобы ограничить время выполнения рабочих процессов:
```yaml
on:
  pull_request:
    paths:
      - 'src/**'
      - '!docs/**'
```

## <a name="troubleshooting"></a>Поиск неисправностей

**Комментариев к PR не появляется:**
- Убедитесь, что приложение Claude GitHub установлено.
- Проверьте, что рабочий процесс имеет разрешение `pull-requests: write`.

**403 при нанесении меток:**
- Убедитесь, что задание имеет разрешение `issues: write`.
- Убедитесь, что `GITHUB_TOKEN` имеет доступ к этому репозиторию.

**Anthropic API ошибки:**
- Убедитесь, что `ANTHROPIC_API_KEY` установлен на уровне репозитория.
- Проверьте, не истек ли срок действия ключа

Синтаксические ошибки **YAML:**
- Проверьте интервал: два пробела на уровень вложенности, без табуляции.
- Используйте валидатор YAML: [yamllint.com](https://www.yamllint.com/).

## Расширенное использование

### Объединение рабочих процессов
Запускайте несколько рабочих процессов вместе для комплексной автоматизации:
- PR-анализ + проверка безопасности по каждому PR-запросу
- Сортировка проблем + автоматическая маркировка новых проблем

### Пользовательские подсказки
Отредактируйте раздел `direct_prompt` в рабочих процессах, чтобы настроить фокус Claude:
```yaml
direct_prompt: |
  Review this PR focusing on:
  1. TypeScript type safety
  2. React performance patterns
  3. Accessibility compliance
  4. Test coverage
```

### Интеграция с другими действиями
Объедините с существующими рабочими процессами:
```yaml
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run tests
        run: npm test

  claude-review:
    needs: tests  # Run after tests pass
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@main
        # ...
```

## Соображения стоимости

Эти рабочие процессы потребляют кредиты Anthropic API:
- Обзор **PR**: ~$0,10–0,50 за обзор (в зависимости от размера различий).
- **Проверка безопасности**: ~$0,20–0,80 за сканирование.
- **Issue Triage**: ~0,05–0,20 доллара США за выпуск.

**Советы по сокращению затрат:**
- Используйте фильтры `paths:`, чтобы пропустить изменения docs/config.
- Установить условия: `if: github.event.pull_request.draft == false`
- Просмотрите журналы и скорректируйте выбор модели.

## Примеры в этом каталоге

```
examples/github-actions/
├── README.md                        # This file
├── claude-code-review.yml           # Advisory prompt-based review + optional synthesis job
├── claude-code-review-batched.yml    # Domain-split matrix review for large PRs
├── .coderabbit.yaml                 # CodeRabbit config (copy to repo root)
├── .greptile/                       # Greptile config templates (copy to repo root)
├── claude-pr-auto-review.yml        # Inline prompt auto-review (alternative)
├── claude-security-review.yml       # Security scanning workflow
├── claude-issue-triage.yml          # Issue triage workflow
└── prompts/
    └── code-review.md               # Externalized review prompt (copy to .github/prompts/)
```

## <a name="resources"></a>Ресурсы

- [Claude Code Документация](https://claude.ai/code)
- [GitHub Actions Документация](https://docs.github.com/en/actions)
- [Anthropic API Документация](https://docs.anthropic.com/)
- [Claude GitHub Приложение](https://github.com/apps/claude)

## Лицензия

Эти рабочие процессы представлены в качестве примеров. Адаптируйте их к своим потребностям.
