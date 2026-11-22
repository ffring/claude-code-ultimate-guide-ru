---
name: commit
description: "Создайте обычное сообщение фиксации для поэтапных изменений."
argument-hint: "[--amend] [message]"
effort: low
when_to_use: "Use when ready to commit staged changes and need a conventional commit message."
disable-model-invocation: true
---

# Обычный коммит

Создайте обычное сообщение фиксации для поэтапных изменений.

## Инструкции

1. Запустите `git diff --cached`, чтобы увидеть поэтапные изменения.
2. Проанализируйте характер изменений.
3. Создайте сообщение о фиксации в следующем формате.

## Формат фиксации

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Типы
- `feat`: Новая функция.
- `fix`: исправлена ​​ошибка.
- `docs`: Только документация
- `style`: форматирование, отсутствие точек с запятой и т. д.
- `refactor`: изменение кода, которое не исправляет и не добавляет функции.
- `perf`: Улучшение производительности
- `test`: Добавление недостающих тестов
- `chore`: Задачи обслуживания

### Правила
- Тема: повелительное наклонение, без точки, максимум 50 символов.
- Тело: объясните ЧТО и ПОЧЕМУ, а не КАК
- Нижний колонтитул: критические изменения, ссылки на проблемы.

## Примеры

```
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Users can now request a reset link and set new password.

Closes #123
```

```
fix(api): prevent race condition in order processing

Add mutex lock to ensure orders are processed sequentially.
This fixes duplicate charge issues reported by users.

Fixes #456
```

```
refactor(cart): extract pricing logic to separate module

No functional changes. Improves testability and
separates concerns for future discount feature.
```

## Исполнение

После анализа поэтапных изменений предложите сообщение о фиксации.
Попросите подтверждение перед выполнением `git commit -m "..."`.

$ARGUMENTS
