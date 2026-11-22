---
name: explain
description: "Объясняйте код, концепции или поведение системы с помощью регулируемых уровней глубины."
argument-hint: <file_or_concept>
effort: low
when_to_use: "Use when asking Claude to explain code, a function, an algorithm, or a concept."
---

# Объяснитель кода

Объясняйте код, концепции или поведение системы с помощью регулируемых уровней глубины.

## Цель

Получите четкие объяснения:
- Как работает конкретный код
- Почему используются определенные шаблоны
- Что делает system/module
- Архитектурные решения и компромиссы

## Инструкции

### Шаг 1. Определите объем

Определите, что требует объяснения:
- **File**: Вся структура и назначение файла.
- **Function/Method**: конкретные детали реализации.
- **Concept**: Архитектурный образец или дизайнерское решение.
- **Flow**: Как data/control перемещается по системе

### Шаг 2. Оцените сложность

```
Simple (1-2 min read)     → Quick summary, key points only
Standard (3-5 min read)   → Purpose, how it works, key decisions
Deep (10+ min read)       → Full breakdown, alternatives, trade-offs
```

### Шаг 3. Сбор контекста

```bash
# For file explanations
head -50 "$FILE"  # See imports and structure

# For function explanations
grep -A 30 "function $NAME\|def $NAME\|fn $NAME" "$FILE"

# For module explanations
ls -la "$DIR"
cat "$DIR/index.ts" 2>/dev/null || cat "$DIR/__init__.py" 2>/dev/null
```

### Шаг 4. Структурируйте объяснение.

## Выходной формат

---

### 📖 Объяснение: [Цель]

**Область**: [file/function/concept/flow]
**Глубина**: [simple/standard/deep]

### Что он делает

[1-3 предложения, описывающие цель]

### <a name="how-it-works"></a>Как это работает

[Пошаговая разбивка, соответствующая уровню глубины]

### Ключевые решения

| Решение | Зачем | Альтернатива |
|----------|-----|-------------|
| [выбор сделан] | [рассуждение] | [что еще может сработать] |

### Пример использования

```typescript
// How to use this correctly
```

### Связанный код

- `path/to/related.ts` - [отношения]
- `path/to/dependency.ts` - [отношения]

### 💡 Учебные заметки (если флаг --learn)

[Дополнительный контекст для понимания более широкой картины]

---

## Уровни глубины

### Простой (`/explain --simple`)

```markdown
**validateUser()** checks if the user object has required fields
(email, password) and returns a boolean. Uses regex for email format.
```

### Стандартный (`/explain` — по умолчанию)

```markdown
**validateUser(user: User): ValidationResult**

**Purpose**: Validates user input before database operations.

**Flow**:
1. Check required fields exist (email, password)
2. Validate email format with regex
3. Check password meets requirements (8+ chars, special char)
4. Return { valid: boolean, errors: string[] }

**Used by**: signup(), updateProfile()
```

### Глубокий (`/explain --deep`)

```markdown
[All of standard, plus:]

**Design Decisions**:
- Returns ValidationResult instead of throwing to allow batch validation
- Regex chosen over library for zero dependencies
- Password rules configurable via config.ts

**Trade-offs**:
- Pro: Fast, no dependencies
- Con: Regex email validation isn't RFC-compliant

**Alternatives Considered**:
- Zod schema: More powerful but adds 50KB
- Class-validator: Better for decorators but OOP-heavy
```

## Примеры использования

**Поясните файл:**
```
/explain src/auth/middleware.ts
```

**Поясните функцию:**
```
/explain the handleWebhook function in payments.ts
```

**Объясните концепцию:**
```
/explain how our event sourcing works
```

**Объясните конкретно:**
```
/explain --deep the authentication flow
/explain --simple what useCallback does
```

**Поясните для изучения:**
```
/explain --learn the repository pattern used here
```

## <a name="tips"></a>Советы

1. **Будьте конкретны**: «Объясните строки 45–60» > «Объясните этот файл»
2. **Укажите свой уровень**: «Я новичок в TypeScript» помогает откалибровать
3. **Задайте вопрос**: «Почему бы вместо этого не использовать X?» углубляет понимание
4. **Просьба аналогий**: «Объясните так, будто я знаком с Python, но не с TS»

$ARGUMENTS
