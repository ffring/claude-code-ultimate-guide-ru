# Шаблоны контекстной инженерии

Контекстная инженерия — это практика сознательного проектирования информации, которую Claude получает в начале сеанса, — обработка вашего `CLAUDE.md` и вспомогательных файлов как производственной системы, а не однократной установки. Эти шаблоны предоставляют вам все необходимое для создания, измерения и обслуживания этой системы.

## Файлы

| Файл | Описание |
|------|-------------|
| `profile-template.yaml` | Профиль разработчика для индивидуальной сборки контекста |
| `skeleton-template.md` | Аннотированный скелет `CLAUDE.md` с пошаговыми инструкциями. |
| `assembler.ts` | Скрипт TypeScript для сборки `CLAUDE.md` из профиля + модулей |
| `eval-questions.yaml` | 20 вопросов для самооценки для проверки вашего `CLAUDE.md` |
| `canary-check.sh` | Сценарий теста поведенческой регрессии (структурная проверка) |
| `ci-drift-check.yml` | Рабочий процесс GitHub Actions для еженедельного обнаружения отклонения контекста |
| `context-budget-calculator.sh` | Измеряет стоимость постоянного токена вашей конфигурации контекста. |
| `rules/knowledge-feeding.md` | Шаблон правила для упреждающего обновления контекста после сеансов |
| `rules/update-loop-retro.md` | Шаблон ретроспективы сеанса для фиксации полученных знаний |

## <a name="quick-start"></a>Быстрый старт

**Новый проект — получите рабочий `CLAUDE.md` за 3 шага:**

```bash
# 1. Copy the skeleton and fill in your project details
cp examples/context-engineering/skeleton-template.md CLAUDE.md

# 2. Check your context budget (keep it under 10K tokens)
bash examples/context-engineering/context-budget-calculator.sh .

# 3. Run canary checks to validate structure
bash examples/context-engineering/canary-check.sh .
```

**Существующий проект — аудит и улучшение:**

```bash
# Run the structural check
bash examples/context-engineering/canary-check.sh .

# Then use eval-questions.yaml to score your CLAUDE.md manually
# Target: 16+ / 20
```

**Настройка группы — профили для каждого разработчика:**

```bash
# Install dependencies for the assembler
npm install js-yaml @types/js-yaml ts-node typescript

# Copy the profile template and customize
cp examples/context-engineering/profile-template.yaml .claude/profiles/yourname.yaml
# Edit .claude/profiles/yourname.yaml with your stack and preferences

# Assemble your CLAUDE.md
ts-node examples/context-engineering/assembler.ts \
  --profile .claude/profiles/yourname.yaml \
  --modules .claude/modules \
  --output CLAUDE.md
```

**Текущее обслуживание:**

```bash
# Weekly: run canary checks
bash examples/context-engineering/canary-check.sh .

# After sessions: use the retro template
# See rules/update-loop-retro.md

# Add the CI workflow for automated drift detection
cp examples/context-engineering/ci-drift-check.yml .github/workflows/context-drift.yml
```

## Раздел руководства

Полная методология и принципы: `guide/core/context-engineering.md`.

Шаблоны здесь являются операционным уровнем — руководство объясняет причину каждого дизайнерского решения.
