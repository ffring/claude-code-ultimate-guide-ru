---
name: autoresearch
description: "Автономный цикл улучшения: сканируйте метрики кодовой базы, файлы экспериментов, запускайте итерации под управлением агента до тех пор, пока метрика не улучшится."
argument-hint: "[--scaffold <loop-name>] [--run <loop-name>] [--status]"
effort: high
disable-model-invocation: true
---

# Autoresearch: автономный цикл улучшения

Сканируйте показатели качества кодовой базы, предлагайте циклы улучшения и запускайте итерации автономного агента. Вдохновлен [karpathy/autoresearch](https://github.com/karpathy/autoresearch)и адаптирован на основе исследований машинного обучения для обеспечения качества кода.

**Концепция**: Агент предлагает изменение кода, запускает измерение, сохраняет изменение, если метрика улучшилась, в противном случае возвращается через `git reset` и повторяет действия до тех пор, пока не будет остановлено вручную.

**Time**: сканирование ~30 с | За итерацию: зависит от области | Цикл: работает бесконечно, пока вы его не остановите.

---

## Режим 1: Сканирование (по умолчанию)

Измерьте текущее состояние, выявите существующие петли, предложите следующие действия.

### Инструкции

Запустите следующие показатели и отобразите таблицу приоритетных предложений.

**Шаг 1. Измерьте метрики кодовой базы**

Адаптируйте шаблоны grep к соглашениям вашего проекта. Это значения по умолчанию для TypeScript, скорректируйте их под свой стек.

```bash
# M1: Function declarations (prefer arrow functions)
M1=$(grep -r "export function " src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | wc -l | tr -d ' ')

# M2: Interface declarations (prefer type aliases)
M2=$(grep -r "export interface " src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | wc -l | tr -d ' ')

# M3: ESLint disables
M3=$(grep -r "eslint-disable" src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | wc -l | tr -d ' ')

# M4: Type casts to any
M4=$(grep -r " as any" src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | wc -l | tr -d ' ')

# M5: TODO comments
M5=$(grep -r "// TODO" src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null | wc -l | tr -d ' ')
```

**Шаг 2. Обнаружение существующих петель**

```bash
for dir in scripts/autoresearch/loop-*/; do
  [ -d "$dir" ] || continue
  LOOP_NAME=$(basename "$dir")
  # Check if loop has results
  if [[ -f "$dir/results.tsv" ]]; then
    ITERS=$(wc -l < "$dir/results.tsv" | tr -d ' ')
    BEST=$(sort -t$'\t' -k2 -n "$dir/results.tsv" | head -1 | cut -f2)
    echo "ACTIVE:$LOOP_NAME:iterations=$ITERS:best=$BEST"
  else
    echo "SCAFFOLDED:$LOOP_NAME"
  fi
done
```

**Шаг 3: Отображение**

```
Autoresearch Scan: {date}

Codebase metrics:

| # | Loop              | Metric            | Current | Target | Priority | Risk |
|---|-------------------|-------------------|---------|--------|----------|------|
| A | loop-remove-as-any| `as any` casts    | {M4}    | 0      | P1       | LOW  |
| B | loop-eslint-disable| eslint-disable   | {M3}    | 0      | P2       | MED  |
| C | loop-export-fn    | export function   | {M1}    | 0      | P1       | LOW  |
| D | loop-interface-type| export interface | {M2}    | 0      | P1       | LOW  |
| E | loop-todo-comments| TODO comments     | {M5}    | 0      | P3       | LOW  |

Existing loops: {detected loops or "none yet"}

Recommended next step (P1, LOW risk):
  /autoresearch --scaffold loop-remove-as-any
  Then write program.md, create a worktree, and run the loop.
```

---

## Режим 2: `--scaffold <loop-name>`

Создайте 3 механических файла для цикла. **Не генерирует `program.md`**: напишите его самостоятельно, чтобы закодировать ограничения, специфичные для проекта.

### Инструкции

Создайте следующие файлы в `scripts/autoresearch/{loop-name}/`:

**`measure.sh`**: программа оценки (одна метрика, возвращает целое число):

```bash
#!/usr/bin/env bash
# measure.sh: {loop-name}
# Returns an integer. Direction: lower = better (unless loop targets coverage/score).
set -euo pipefail
grep -r "PATTERN" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' '
```

**`direction.txt`**: направление улучшения:

```
lower
```

(Используйте `higher` для таких показателей, как тестовое покрытие или показатель качества.)

**`files.txt`**: область, в которой должен работать агент:

```
src/
```

После создания файлов отобразите:

```
Loop scaffolded: scripts/autoresearch/{loop-name}/

  measure.sh  : {pattern} in {scope} -> {N} occurrences today
  direction   : lower (fewer = better)
  files.txt   : src/

Current metric: {N} (target: 0)

Next steps:
  1. Write program.md -- agent behavior, constraints, what it can/cannot touch
     Reference: scripts/autoresearch/loop-remove-as-any/program.md
  2. Create a worktree: /worktree feature/autoresearch-{loop-name}
  3. cd into the worktree
  4. bash scripts/autoresearch/runner.sh {loop-name} 0 15
```

---

## Режим 3: `--run <loop-name>`

Выполните автономный цикл. Агент работает бесконечно: остановите его вручную, когда все будет удовлетворено.

### Инструкции

**Проверьте предварительные требования:**

```bash
[ -f "scripts/autoresearch/{loop-name}/measure.sh" ] || { echo "ERROR: measure.sh missing. Run --scaffold first."; exit 1; }
[ -f "scripts/autoresearch/{loop-name}/program.md" ] || { echo "ERROR: program.md missing. Write it first, this encodes your constraints."; exit 1; }
```

**Запустите цикл:**

Прежде чем начать, прочтите `scripts/autoresearch/{loop-name}/program.md` полностью. Затем введите следующий цикл, повторяйте до остановки:

```
LOOP ITERATION #{N}

1. Current metric: bash scripts/autoresearch/{loop-name}/measure.sh
2. Read program.md constraints
3. Propose ONE targeted change to files in files.txt
4. Apply the change
5. Re-measure: bash scripts/autoresearch/{loop-name}/measure.sh
6. Evaluate:
   - direction=lower AND new < previous -> KEEP (git add -p && git commit -m "autoresearch: {description}")
   - otherwise -> REVERT (git checkout -- .)
7. Log to results.tsv: {timestamp}\t{metric}\t{status}\t{description}
8. Continue to iteration #{N+1}
```

**Критерии остановки** (из program.md):
- Показатель достигает цели (например, 0)
- Механические изменения больше невозможны
- Пользователь вручную останавливает процесс

**Отображать каждую итерацию:**

```
[iter #{N}] metric: {before} -> {after} | {KEPT/REVERTED} | {change description}
```

---

## Режим 4: `--status`

Показать статус всех циклов в проекте.

### Инструкции

```bash
for dir in scripts/autoresearch/loop-*/; do
  [ -d "$dir" ] || continue
  NAME=$(basename "$dir")
  CURRENT=$(bash "$dir/measure.sh" 2>/dev/null || echo "?")
  ITERS=$([ -f "$dir/results.tsv" ] && wc -l < "$dir/results.tsv" | tr -d ' ' || echo "0")
  KEPT=$([ -f "$dir/results.tsv" ] && grep -c "KEPT" "$dir/results.tsv" || echo "0")
  echo "$NAME | current: $CURRENT | iters: $ITERS | kept: $KEPT"
done
```

Display:

```
Autoresearch Status

| Loop                | Current | Iterations | Kept | Status    |
|---------------------|---------|------------|------|-----------|
| loop-remove-as-any  | {N}     | {N}        | {N}  | ACTIVE    |
| loop-export-fn      | {N}     | 0          | 0    | SCAFFOLDED|
```

---

## Запись `program.md`: Самый важный файл

`program.md` — контракт поведения агента. Напишите это сами, никогда не создавайте автоматически. Он должен кодировать то, что касается агента can/cannot для вашей конкретной кодовой базы.

**Минимальная структура:**

```markdown
# Program: {loop-name}

## Objective
Reduce `{metric}` in `src/` to 0. One mechanical change per iteration.

## Measurement
bash scripts/autoresearch/{loop-name}/measure.sh
Lower = better. Target: 0.

## What you CAN do
- Replace `export function X(` with `export const X = (`
- Keep the function signature identical

## What you CANNOT do
- Modify test files
- Change function signatures
- Touch files outside src/
- Make multiple changes per iteration

## Stop when
- Metric = 0
- No more mechanical replacements exist
```

---

## Узор (фон)

Эта команда реализует шаблон **autoresearch** из [karpathy/autoresearch](https://github.com/karpathy/autoresearch):

| ML Research (Карпаты) | Качество кода (эта команда) |
|------------------------|----------------------------|
| Изменить `train.py` | Изменить файлы `src/` |
| Измерьте `val_bpb` | Измерьте количество grep |
| 5-минутный бюджет графического процессора | Одно атомарное изменение на итерацию |
| Продолжайте, если val_bpb улучшится | Сохранить, если количество уменьшится |
| `git reset`, если нет | `git checkout -- .`, если нет |
| `program.md` = навык агента | `program.md` = навык агента |

Ключевая идея: фиксированная объективная метрика + git как механизм отката = безопасная автономная итерация. Агенту никогда не требуется одобрение человека для каждого изменения, поскольку каждое неправильное изменение автоматически отменяется.

---

## Использование

**Сканировать и предлагать циклы:**
```
/autoresearch
```

**Scaffold-файлы для определенного цикла:**
```
/autoresearch --scaffold loop-remove-as-any
```

**Запускаем автономный цикл (после записи program.md):**
```
/autoresearch --run loop-remove-as-any
```

**Проверьте состояние всех шлейфов:**
```
/autoresearch --status
```

$ARGUMENTS
