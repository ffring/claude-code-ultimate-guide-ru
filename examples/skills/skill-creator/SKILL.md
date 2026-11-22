---
name: skill-creator
description: "Создайте новый навык Claude Code с помощью SKILL.md, темы и связанных ресурсов. Используйте при создании специального навыка, стандартизации структуры навыков в команде или упаковке навыка для распространения."
allowed-tools: Write Bash
effort: low
---

# Создатель навыков

Создавайте новые навыки Claude Code с помощью правильной структуры каталогов, заголовка YAML и дополнительных ресурсов в комплекте.

## <a name="when-to-use"></a>Когда использовать

- Создание нового пользовательского навыка для проекта
- Стандартизация структуры навыков в команде
- Создание шаблонов навыков со сценариями, ссылками и ресурсами.
- Навыки упаковки для распространения

## Структура каталога навыков

```
skill-name/
├── SKILL.md          # Required: Main skill file with YAML frontmatter
├── scripts/          # Optional: Executable code for deterministic tasks
├── references/       # Optional: Documentation loaded contextually
└── assets/           # Optional: Templates, images, boilerplate (not loaded into context)
```

## <a name="workflow"></a>Рабочий процесс

### 1. Создайте навык

```
Create a new skill called "my-skill-name" in ~/.claude/skills/
```

Или с конкретной целью:

```
Create a skill for generating release notes from git commits,
with templates for CHANGELOG.md and Slack announcements
```

Или через скрипт инициализации:

```bash
python3 ~/.claude/skills/skill-creator/scripts/init_skill.py <skill-name> --path <output-directory>
```

### 2. Сгенерированный шаблон SKILL.md.

Созданный SKILL.md имеет следующую структуру:

```markdown
---
name: skill-name
description: "What the skill does. Use when [trigger conditions]."
---

# Skill Name

## When to Use
- Trigger condition 1
- Trigger condition 2

## What This Skill Does
1. **Step 1**: Description
2. **Step 2**: Description

## How to Use
[Usage examples]

## Example
**User**: "Example prompt"
**Output**: [Example output]
```

### 3. Подтвердите навык

После создания проверьте:

1. **Frontmatter**: `name` — кебаб-кебаб, 1–64 символа; `description` — строка в кавычках с предложением «Использовать, когда».
2. **Content**: содержит раздел «Когда использовать» с условиями срабатывания и хотя бы одним примером использования.
3. **Structure**: SKILL.md содержит менее 5000 слов; ссылки и ресурсы находятся в правильных подкаталогах
4. **Test**: вызовите навык с реальным вариантом использования и подтвердите ожидаемый результат.

### 4. Пакет для распространения (опционально)

```bash
python3 ~/.claude/skills/skill-creator/scripts/package_skill.py <path/to/skill-folder> [output-directory]
```

## Организационные модели

| Шаблон | Лучшее для | Структура |
|---------|----------|-----------|
| **Workflow-Based** | Последовательные процедуры | Пошаговые инструкции |
| **Task-Based** | Несколько операций | Сбор заданий |
| **Reference/Guidelines** | Стандарты, спецификации | Правила и примеры |
| **Capabilities-Based** | Взаимосвязанные особенности | Описания функций |

## Пример: создание навыка примечаний к выпуску

**User**: «Создайте навык для создания примечаний к выпуску с тремя выходными форматами»

**Steps**:
1. Инициализировать: `init_skill.py release-notes-generator --path ~/.claude/skills/`
2. Добавьте шаблоны в `assets/`: `changelog-template.md`, `pr-release-template.md`, `slack-template.md`.
3. Добавляем правила в `references/`: `tech-to-product-mappings.md`
4. Полный `SKILL.md` с инструкциями по использованию.
5. Проверка: проверьте заголовок, протестируйте с реальным диапазоном фиксации
6. Пакет: `package_skill.py ~/.claude/skills/release-notes-generator`

## <a name="tips"></a>Советы

- Не превышайте 5000 слов в SKILL.md для эффективного использования контекста.
- Используйте `references/` для знаний предметной области, которые не часто меняются.
- Поместите шаблоны в `assets/`, чтобы они не загружались автоматически в контекст.
- Всегда включайте пункт «Использовать, когда» в начале описания.
- Перед упаковкой протестируйте реальные варианты использования.
