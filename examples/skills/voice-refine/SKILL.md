---
name: voice-refine
description: "Преобразуйте подробный голосовой ввод в структурированные подсказки Claude с использованием токенов. Используйте при очистке голосовых заметок, результатов диктовки или транскрипции речи в текст, содержащих слова-вставки, повторы и неструктурированные мысли."
allowed-tools: Read
effort: low
---

# Навык улучшения голоса

Превратите многословную голосовую диктовку потока сознания в структурированную,
подсказки с использованием токенов для Claude Code.

## <a name="when-to-use"></a>Когда использовать

- Ввод с помощью голосовой диктовки (Wispr Flow, Superwhisper, macOS Dictation)
- Подробный текст >150 слов
- Содержит слова-вставки, повторы или касательные.
- Естественные речевые модели, которые нуждаются в структуре

## Конвейер трансформации

```
1. DEDUPE    → Remove repetitions and filler words
2. EXTRACT   → Identify core requirements and constraints
3. STRUCTURE → Organize into standard sections
4. COMPRESS  → Reduce to ~30% of original while preserving intent
```

## Выходной формат

```markdown
## Contexte
[Project context, existing stack, relevant files]

## Objectif
[Single sentence: what needs to be built/changed]

## Contraintes
- [Constraint 1]
- [Constraint 2]
- [etc.]

## Output attendu
[Expected deliverables: files, format, tests]
```

## Флаги

| Флаг | Эффект |
|------|--------|
| `--confirm` | Показывать уточненное приглашение перед отправкой на Claude (по умолчанию) |
| `--direct` | Отправьте уточненное приглашение напрямую без подтверждения |
| `--verbose` | Сохраняйте больше деталей, меньше сжатия |
| `--en` | Вывод на английском языке (по умолчанию: соответствует языку ввода) |

## Примеры использования

### Основное использование

```
/voice-refine

Alors euh j'aimerais que tu m'aides à faire un truc, en fait j'ai une API
qui renvoie des données utilisateurs et je voudrais les afficher dans un
tableau React, mais attention il faut que ça soit paginé parce que y'a
beaucoup de données, genre des milliers d'utilisateurs, et aussi faudrait
pouvoir trier par nom ou par date d'inscription, ah et on utilise Tailwind
dans le projet donc faut que ça matche avec ça...
```

### С флагами

```
/voice-refine --direct --en

[voice input in any language → sends English prompt directly]
```

## Метрики сжатия

| Метрика | Цель |
|--------|--------|
| Сокращение токенов | 60-70% |
| Сохранение информации | >95% |
| Ясность структуры | Высокий |

## Правила фильтрации

**Remove**: слова-вставки («эээ», «гм», «нравится», «в основном»), повторы, касательные, хеджирование («может быть», «вероятно», если не имеет значения), дополнение вежливости («пожалуйста», «не могли бы вы»).

**Preserve**: технические требования, ограничения, существующий контекст кода, ожидаемый формат вывода, крайние случаи, правила бизнес-логики.

## <a name="see-also"></a>См. также

- `guide/ecosystem/ai-ecosystem.md` — раздел «Инструменты преобразования голоса в текст»
- `examples/before-after.md` — примеры полных преобразований
