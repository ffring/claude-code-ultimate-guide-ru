# Проведите аудит настройки контекстной инженерии

> Автономная подсказка для измерения и улучшения контекстной архитектуры Claude Code.

**Автор**: [Флориан БРУНИО](https://github.com/FlorianBruniaux) | Внешний директор по ИИ

**Ссылка**: [Полное руководство по Claude Code](https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md)

---

## 1. Что это делает

Это приглашение инструктирует Claude проверить настройку контекстного проектирования следующим образом:

1. **Измерение** общего размера всегда включенного контекста, длины CLAUDE.md и коэффициента охвата пути
2. **Обнаружение** баланса навыков и правил, избыточности и отрицательных и положительных инструкций
3. **Flagged** сигналы устаревания (последнее обновление, неработающий импорт, устаревшие ссылки)
4. **Оценка** по 8 параметрам на общую сумму /100 с приоритетными рекомендациями

**Performance**: использует bash/grep для эффективного сканирования. Claude читает файлы только тогда, когда необходим конкретный контент-анализ.

**Важно**: Claude НЕ будет вносить никаких изменений без вашего явного согласия.

---

## 2. Для кого это

| Уровень | Что вы получаете |
|-------|-------------|
| **Индивидуальный разработчик** | Находите быстрые результаты: сокращайте раздутость, добавляйте недостающие разделы, исправляйте устаревший импорт. |
| **Маленькая команда (2-10)** | Выявление пробелов в согласованности и возможностей для сборки на основе профилей |
| **Большая команда (10+)** | Систематическая оценка контекстной архитектуры с оценкой зрелости |

**Prerequisites**:
- Claude Code установлен и работает.
- Проект с каталогом как минимум CLAUDE.md или `.claude/`.
- Оболочка Bash (родная для macOS/Linux, WSL для Windows)

**Time**: ~3–5 минут

---

## 3. Как его использовать

### Шаг 1. Скопируйте приглашение

Скопируйте все внутри блока кода в [Раздел 4](#4-the-prompt) ниже.

### Шаг 2. Запустите Claude Code.

```bash
cd your-project-directory
claude
```

### Шаг 3. Вставьте и выполните.

Вставьте приглашение и нажмите Enter. Claude начнет проверку.

### Шаг 4. Просмотрите результаты

Claude представит результаты, а затем запросит подтверждение, прежде чем вносить какие-либо изменения.

### Примечание платформы

| Платформа | Глобальный путь конфигурации |
|----------|-------------------|
| **macOS/Linux** | `~/.claude/` |
| **Windows** | `%USERPROFILE%\.claude\` |

---

## <a name="4-the-prompt"></a>4. Подсказка

```markdown
# Audit My Context Engineering Setup

## Context

Perform a comprehensive context engineering audit of my Claude Code configuration.
Focus on context size, structure quality, freshness, and team scalability.

Reference: https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md

## Instructions

### Phase 1: Discovery (Bash Scan)

**IMPORTANT**: Use bash commands exclusively in this phase. Do NOT read files yet.

#### 1.1 Size & Structure Scan

```bash
bash -c '
echo "=== GLOBAL CLAUDE.MD ==="
if [ -f ~/.claude/CLAUDE.md ]; then
  lines=$(wc -l < ~/.claude/CLAUDE.md | tr -d " ")
  chars=$(wc -c < ~/.claude/CLAUDE.md | tr -d " ")
  tokens=$(echo "scale=0; $chars / 4" | bc 2>/dev/null || echo "~$((chars/4))")
  echo "Lines: $lines"
  echo "Chars: $chars (~$tokens tokens)"
  echo "Imports: $(grep -c "^@" ~/.claude/CLAUDE.md 2>/dev/null || echo 0)"
  echo "Rules count: $(grep -cE "^[-*] |^\d+\. " ~/.claude/CLAUDE.md 2>/dev/null || echo 0)"
  echo "Last commit: $(cd ~/.claude && git log --format="%ar" -- CLAUDE.md 2>/dev/null | head -1 || echo "not tracked")"
else
  echo "NOT FOUND"
fi

echo ""
echo "=== PROJECT CLAUDE.MD ==="
for f in ./CLAUDE.md ./.claude/CLAUDE.md; do
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f" | tr -d " ")
    chars=$(wc -c < "$f" | tr -d " ")
    tokens=$(echo "scale=0; $chars / 4" | bc 2>/dev/null || echo "~$((chars/4))")
    echo "File: $f"
    echo "Lines: $lines"
    echo "Chars: $chars (~$tokens tokens)"
    echo "Imports: $(grep -c "^@" "$f" 2>/dev/null || echo 0)"
    echo "Rules count: $(grep -cE "^[-*] |^\d+\. " "$f" 2>/dev/null || echo 0)"
    echo "Last commit: $(git log --format="%ar" -- "$f" 2>/dev/null | head -1 || echo "not tracked")"
  fi
done

echo ""
echo "=== IMPORTED FILES ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  while IFS= read -r line; do
    [[ "$line" =~ ^@ ]] || continue
    import_path="${line#@}"
    import_path="${import_path/ */}"
    resolved="${import_path/#\~/$HOME}"
    resolved="${resolved/#./$PWD}"
    if [ -f "$resolved" ]; then
      sz=$(wc -c < "$resolved" | tr -d " ")
      tk=$(echo "scale=0; $sz / 4" | bc 2>/dev/null || echo "$((sz/4))")
      echo "  FOUND $line (~$tk tokens)"
    else
      echo "  BROKEN $line (file not found)"
    fi
  done < "$f"
done

echo ""
echo "=== RULES & MODULES ==="
for d in ~/.claude ./.claude; do
  [ -d "$d" ] || continue
  for sub in rules skills commands agents hooks; do
    if [ -d "$d/$sub" ]; then
      count=$(find "$d/$sub" -maxdepth 1 -type f | wc -l | tr -d " ")
      total_chars=$(find "$d/$sub" -maxdepth 1 -type f -exec cat {} \; 2>/dev/null | wc -c | tr -d " ")
      tokens=$((total_chars / 4))
      echo "  $d/$sub: $count files (~$tokens tokens)"
    fi
  done
done
'
```

**Сохраните выходные данные** для оценки.

#### 1.2 Качество сканирования образца

```bash
bash -c '
echo "=== NEGATIVE VS POSITIVE INSTRUCTIONS ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  neg=$(grep -ciE "never|do not|dont|avoid|prohibited|forbidden|not allowed|do NOT" "$f" 2>/dev/null || echo 0)
  pos=$(grep -ciE "always|prefer|use|should|must|recommended|do this" "$f" 2>/dev/null || echo 0)
  echo "$f: negative=$neg positive=$pos"
done

echo ""
echo "=== VAGUE INSTRUCTIONS (red flags) ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  echo "$f:"
  grep -inE "be careful|good practice|appropriately|as needed|when necessary|use your judgment|you should know|be smart" "$f" 2>/dev/null | head -5 || echo "  none found"
done

echo ""
echo "=== DUPLICATE SECTION HEADERS ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  dupes=$(grep -E "^#{1,3} " "$f" | sort | uniq -d)
  [ -n "$dupes" ] && echo "$f DUPLICATES: $dupes" || echo "$f: no duplicate headers"
done

echo ""
echo "=== DEPRECATED REFERENCES ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  echo "$f:"
  grep -niE "claude-1|claude-2\.0|claude-3-haiku-|gpt-3\.5|text-davinci|codex|copilot X|cursor pro 1\." "$f" 2>/dev/null | head -5 || echo "  none found"
done

echo ""
echo "=== PATH SCOPING (modular setup) ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  scoped=$(grep -cE "^@.+\.(ts|tsx|js|jsx|py|rs|go|md)$|globs:|path:" "$f" 2>/dev/null || echo 0)
  echo "$f path-scoped entries: $scoped"
done

echo ""
echo "=== SESSION & UPDATE PROTOCOL ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  has_update=$(grep -ciE "update|review|quarterly|maintenance|how to update|keep.*fresh" "$f" 2>/dev/null || echo 0)
  has_session=$(grep -ciE "session|retro|checkpoint|lesson learned|knowledge loop" "$f" 2>/dev/null || echo 0)
  echo "$f: update-protocol=$has_update session-retro=$has_session"
done

echo ""
echo "=== TEAM/PROFILE READINESS ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  has_profile=$(grep -ciE "profile|role:|junior|senior|lead|persona|persona-" "$f" 2>/dev/null || echo 0)
  has_module=$(grep -cE "^@" "$f" 2>/dev/null || echo 0)
  echo "$f: profile-mentions=$has_profile module-imports=$has_module"
done
'
```

**Сохраните выходные данные** для оценки.

#### 1.3 Сканирование свежести и конфликтов

```bash
bash -c '
echo "=== GIT FRESHNESS ==="
for path in ~/.claude ./; do
  if git -C "$path" rev-parse --git-dir &>/dev/null 2>&1; then
    echo "Repo at $path:"
    git -C "$path" log --format="%ar %s" -- CLAUDE.md .claude/CLAUDE.md 2>/dev/null | head -3 || echo "  no commits for CLAUDE.md"
  fi
done

echo ""
echo "=== CONFLICTING RULES PATTERNS ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  echo "$f:"
  # Look for contradictory patterns like "always X" near "never X"
  always_terms=$(grep -ioE "always [a-z ]+" "$f" 2>/dev/null | sed "s/always //i" | sort)
  never_terms=$(grep -ioE "never [a-z ]+" "$f" 2>/dev/null | sed "s/never //i" | sort)
  conflicts=$(comm -12 <(echo "$always_terms") <(echo "$never_terms") 2>/dev/null)
  [ -n "$conflicts" ] && echo "  POTENTIAL CONFLICTS: $conflicts" || echo "  no obvious contradictions"
done

echo ""
echo "=== OVERVIEW / ARCHITECTURE SECTION ==="
for f in ~/.claude/CLAUDE.md ./CLAUDE.md ./.claude/CLAUDE.md; do
  [ -f "$f" ] || continue
  has_overview=$(grep -ciE "^## (overview|purpose|about|architecture|what this|context)" "$f" 2>/dev/null || echo 0)
  has_antip=$(grep -ciE "anti.pattern|bad example|do not do|wrong way|pitfall" "$f" 2>/dev/null || echo 0)
  has_hierarchy=$(grep -cE "^#{1,3} " "$f" 2>/dev/null || echo 0)
  echo "$f: has-overview=$has_overview anti-patterns=$has_antip section-count=$has_hierarchy"
done
'
```

**Сохраните выходные данные** для оценки.

### Этап 2: оценка по 8 измерениям

Используйте результаты сканирования этапа 1. Читайте определенные разделы файла только в том случае, если для отчета необходимы примеры содержимого.

#### Параметр 1: Размер и бюджет (15 баллов)

Оцените на основе оценок токенов, полученных на этапе 1:

| Проверять | Очки | Порог |
|-------|--------|-----------|
| Полный постоянный контекст под токенами 8K | 5 | Сумма всех импортов CLAUDE.md + |
| Количество правил до 150 инструкций | 5 | глобальный + проект вместе взятый |
| Ни одного файла длиной более 400 строк. | 5 | отметьте, если превышено |

Пропорционально вычитайте баллы, если пороговые значения превышены. Файл в 600 строк = 3/5, а не 0.

#### Параметр 2: Структура (15 баллов)

| Проверять | Очки | Сигнал |
|-------|--------|--------|
| Имеет раздел overview/purpose. | 4 | h2 с «обзором», «целью», «о программе», «контекстом». |
| Имеет раздел архитектуры или макета проекта. | 3 | h2 с «архитектурой», «структурой», «планировкой». |
| Включает антишаблоны или плохие примеры. | 4 | «анти-шаблон», «нельзя», «ловушка» |
| Количество разделов указывает на четкую иерархию | 4 | 3+ отдельных раздела h2 |

#### Параметр 3: Определение пути (12 баллов)

| Проверять | Очки | Сигнал |
|-------|--------|--------|
| Использует @imports для модульной разбивки. | 5 | минимум 2 строки @import |
| По крайней мере одно правило, специфичное для пути или глобальное правило. | 4 | globs: или раздел для конкретного файла |
| Не монолитный файл (все инструкции в одном блоке) | 3 | несколько файлов или разделов |

#### Параметр 4: Качество правил (15 баллов)

| Проверять | Очки | Сигнал |
|-------|--------|--------|
| Соотношение положительное:отрицательное >= 2:1 | 5 | от negative/positive считается |
| Расплывчатых инструкций не обнаружено. | 5 | ноль «будьте осторожны», «по мере необходимости» и т. д. |
| Правила конкретны и действенны. | 5 | оценивается по выборке во время создания отчета |

#### Параметр 5: Свежесть (12 баллов)

| Проверять | Очки | Сигнал |
|-------|--------|--------|
| CLAUDE.md совершено в течение последних 6 месяцев | 5 | git log output |
| Нет устаревших ссылок tool/model. | 4 | устаревший вывод сканирования |
| Никаких сломанных @imports | 3 | ЛОМАНЫЕ строки при сканировании импорта |

#### Параметр 6: Готовность команды (10 баллов)

| Проверять | Очки | Сигнал |
|-------|--------|--------|
| Имеет профильную или ролевую структуру. | 4 | упоминаний в профиле >= 1 |
| Импорт модулей обеспечивает выборочную сборку | 3 | импорт модулей >= 3 |
| Документированный протокол обновления для команды | 3 | протокол обновления >= 1 |

#### Параметр 7: Обнаружение конфликтов (11 баллов)

| Проверять | Очки | Сигнал |
|-------|--------|--------|
| Противоречащих правил не обнаружено. | 5 | никаких конфликтов при сканировании |
| Никаких дублирующих заголовков разделов. | 3 | дубликаты не найдены |
| Ретро-сессия или шаблон цикла знаний | 3 | сеанс-ретро >= 1 |

#### Параметр 8: Цикл знаний (10 баллов)

| Проверять | Очки | Сигнал |
|-------|--------|--------|
| Имеет документированный протокол update/review. | 4 | протокол обновления >= 1 |
| Имеет сессионный ретро-паттерн или шаблон, основанный на извлеченных уроках | 3 | сеанс-ретро >= 1 |
| Контекст отслеживается в git (изменения, доступные для аудита) | 3 | git freshness scan shows commits |

#### Подсчитать общий балл

`Score = sum of earned points across all 8 dimensions`

### Этап 3: Создание отчета

Структурируйте свой вывод точно так:

---

## Контекстный инженерный аудит

### Оценка: [XX]/100

| Измерение | Счет | Примечания |
|-----------|-------|-------|
| Размер и бюджет | X/15 | всего ~X токенов, X правил |
| Структура | X/15 | X-разделы, обзор has/missing |
| Path-Scoping | X/12 | X импорт, monolithic/modular |
| Правило качества | X/15 | X% положительных результатов, X неопределенных результатов |
| Свежесть | X/12 | последнее обновление X, X сломанный импорт |
| Готовность команды | X/10 | X-профили, протокол обновления: yes/no |
| Обнаружение конфликтов | X/11 | X противоречий, X повторяющихся заголовков |
| Цикл знаний | X/10 | git tracked: yes/no, retro: yes/no |

### Контекстный бюджет
- Глобальный CLAUDE.md: ~X токенов
- Проект CLAUDE.md: ~X токенов
- @imports вместе: ~X токенов
- Всего постоянно включенных: ~X токенов
- Количество правил: инструкции X/150.

### Приоритетные проблемы (сначала устраните их)
1. [Проблема] — [конкретное исправление с примером]
2. [Проблема] — [конкретное исправление с примером]
3. [Проблема] — [конкретное исправление с примером]

### Быстрые победы (<30 минут каждый)
- [Исправлено]: [что делать и где]
- [Исправлено]: [что делать и где]
- [Исправлено]: [что делать и где]

### Уровень зрелости
[Выберите один и объясните, почему]

**Level 1 — Empty** (0–19): нет структурированного контекста. Claude работает с нулевым знанием проекта.
**Уровень 2 — Базовый** (20–39): CLAUDE.md существует, но представляет собой монолитные, устаревшие или в основном неопределенные правила.
**Уровень 3 — Структурированный** (40–59): четкие разделы и импорт, но отсутствует свежесть или командные шаблоны.
**Уровень 4 — Оптимизированный** (60–79): модульные правила с ограниченной областью действия и приоритетом позитивных изменений с известной периодичностью обновлений.
**Уровень 5 — Инженерный уровень** (80–100): С учетом профиля, отслеживание git, отсутствие конфликтов, активный цикл знаний.

### Готовые к использованию улучшения

Предоставьте 2–3 конкретных текстовых блока, которые пользователи смогут вставлять непосредственно в свой CLAUDE.md.
Каждый блок должен решать приоритетную проблему, указанную выше. Формат:

**Улучшение 1: [имя]**
Файл: `[path]` — добавить в [top/section X/end]
```
[exact text to paste]
```

**Улучшение 2: [имя]**
Файл: `[path]` — добавить в [top/section X/end]
```
[exact text to paste]
```

---

### Этап 4: Ожидание проверки

**CRITICAL**: НЕ создавайте и не изменяйте файлы без явного разрешения.

После представления отчета спросите:

«Какие улучшения вы бы хотели, чтобы я внедрил?

Options:
- `all` — Применить все готовые улучшения.
- `1, 2` — Конкретные улучшения по количеству
- `priority` — исправлены только приоритетные проблемы.
- `none` — сохраните отчет только для справки.

Уточните свой выбор:"

Прежде чем предпринимать какие-либо действия, дождитесь явного ответа пользователя.

## Выходной формат

Структурируйте свой ответ точно так:

1. **Таблица результатов** с разбивкой по измерениям
2. **Контекстный бюджет** сводка
3. **Приоритетные проблемы** (пронумерованы, сначала исправьте)
4. **Quick Wins** (маркированный список, <30 минут каждый)
5. **Уровень зрелости** с объяснением
6. **Готовые к использованию улучшения** (готовые к вставке текстовые блоки)
7. **Запрос проверки** (спросите перед реализацией)
```

---

## 5. What to expect

Here's an example of what the audit report looks like:

### Example score table

```
## Контекстный инженерный аудит

### Оценка: 52/100

| Измерение | Счет | Примечания |
|-----------|-------|-------|
| Размер и бюджет | 10/15 | Всего ~6200 токенов, 182 правила (превышение лимита) |
| Структура | 9/15 | 4 раздела, без раздела с анти-шаблонами |
| Path-Scoping | 4/12 | 1 импортный, монолитный проект CLAUDE.md |
| Правило качества | 8/15 | 60% положительных результатов, найдено 3 расплывчатых инструкции |
| Свежесть | 9/12 | последний коммит 4 месяца назад, 1 неработающий импорт |
| Готовность команды | 3/10 | нет профилей, нет протокола обновления |
| Обнаружение конфликтов | 6/11 | 1 противоречие «always/never», нет повторяющихся заголовков. |
| Цикл знаний | 3/10 | не отслеживается, нет ретро-модели |
```

### Example quick wins

```
Быстрые победы (<30 минут каждый):
- Исправление неработающего импорта: @~/.claude/TONE.md не найден — обновите путь или удалите.
- Добавьте раздел обзора: двухстрочное описание проекта вверху CLAUDE.md.
- Обрезать количество правил: объединить 3 правила форматирования в один сжатый блок.
```

---

## 6. Scoring guide

| Score | Maturity | Recommended Action |
|-------|----------|--------------------|
| **80-100** | Level 5: Engineering-Grade | Maintain with quarterly review |
| **60-79** | Level 4: Optimized | Address priority issues, reach 80 |
| **40-59** | Level 3: Structured | Dedicate a session to improvement |
| **20-39** | Level 2: Basic | Restructure recommended, use template |
| **0-19** | Level 1: Empty | Start fresh with skeleton template |

---

## 7. Glossary

| Term | Definition |
|------|-----------|
| **Always-on context** | Everything Claude loads before your first message: CLAUDE.md files plus all @imports |
| **@import** | A line starting with `@` in CLAUDE.md that loads another file into context |
| **Path-scoping** | Applying rules only to specific file types or directories, not globally |
| **Rule quality** | Specificity and actionability of instructions — vague rules waste tokens and confuse Claude |
| **Knowledge loop** | The practice of updating context files after sessions based on what worked and what didn't |
| **Profile assembly** | Combining different context modules to create role-specific setups (junior, senior, reviewer) |
| **Staleness signal** | Indicators that context is outdated: broken imports, deprecated model names, no git history |
| **Conflict** | Two rules that contradict each other — Claude will pick one arbitrarily, usually the wrong one |
| **Monolithic CLAUDE.md** | A single large file with all instructions, no imports, no modular breakdown |
| **Maturity level** | A 1-5 scale measuring context engineering sophistication from empty to engineering-grade |

---

## 8. Common issues

### "Token estimate seems off"

**Cause**: The estimate uses chars/4 as a rough proxy for GPT-style tokens. Claude's tokenizer may differ slightly.

**Fix**: Focus on relative numbers and thresholds rather than absolute token counts. The 8K always-on budget is a heuristic, not a hard limit.

### "Score is low but Claude seems to work fine"

**Cause**: Claude works without context engineering — the score reflects optimization, not basic functionality.

**Fix**: A low score means you're leaving productivity on the table. Each dimension gap adds cognitive overhead per session.

### "Broken import flagged but file exists"

**Cause**: Relative path resolution differs from Claude's actual working directory at startup.

**Fix**: Use absolute paths (`~/.claude/file.md`) for global imports. Use project-relative paths (`./docs/conventions.md`) for project imports.

### "Profile-readiness flagged but I'm solo"

**Cause**: The audit checks for team-scalability patterns regardless of team size.

**Fix**: Profile-based assembly still benefits solo developers when switching contexts (reviewing PRs vs writing features vs debugging). It is optional for solo use.

---

## 9. Related resources

- [The Ultimate Claude Code Guide](../guide/ultimate-guide.md) - Full reference
- [Audit Your Claude Code Setup](./audit-prompt.md) - Full configuration audit (agents, hooks, MCP, CI)
- [Cheatsheet](../guide/cheatsheet.md) - Quick daily reference
- [Claude Code Official Docs](https://docs.anthropic.com/en/docs/claude-code) - Anthropic documentation
- [context-evaluator.ai](https://context-evaluator.ai) - Zero-install LLM-native audit for CLAUDE.md and AGENTS.md: 17 AI evaluators, automated `.patch` remediation. Complements this prompt with deeper rule-by-rule analysis and a different evaluation angle (LLM-as-judge vs bash heuristics).

---

*Last updated: April 2026 | Version 1.1*
