---
title: "Генерация PDF с помощью Claude Code"
description: "Создавайте профессиональные PDF-файлы с помощью Claude Code со стеком Quarto и Typst."
tags: [workflow, guide, integration]
---

# Генерация PDF с помощью Claude Code

> **Confidence**: Уровень 2. На основе проверенного на производстве рабочего процесса со стеком Quarto/Typst.

Создавайте профессиональные PDF-файлы (документацию, технические документы, отчеты) с помощью Claude Code с современной типографикой и дизайном.

---

## Оглавление

1. [TL;DR](#tldr)
2. [Когда использовать](#when-to-use)
3. [Обзор стека](#stack-overview)
4. [Настройка](#setup)
5. [Рабочий процесс](#workflow)
6. [Интеграция с Claude Code](#integration-with-claude-code)
7. [Кастомизация](#customization)
8. [Устранение неполадок](#troubleshooting)
9. [См. также](#see-also)

---

## <a name="tldr"></a>ТЛ;ДР

```bash
# Install
brew install quarto  # macOS

# Generate
quarto render document.qmd  # → document.pdf

# Preview
quarto preview document.qmd  # Hot-reload
```

**Stack**: Quarto (оркестровка) + Typst (типографика) + Pandoc (уценка)

---

## <a name="when-to-use"></a>Когда использовать

| Вариант использования | Хорошая посадка | Альтернатива |
|----------|----------|-------------|
| Техническая документация | ✅ | — |
| Технические документы/отчеты | ✅ | — |
| API документация | ⚠️ | OpenAPI + Редок |
| Слайды/Презентации | ⚠️ | Quarto Раскрыть |
| Быстрые заметки | ❌ | Обычная уценка |
| Совместное редактирование | ❌ | Документы Google, понятие |

**Наилучший вариант для**: подробный технический контент, требующий профессиональной верстки, контроля версий и воспроизводимости.

---

## <a name="stack-overview"></a>Обзор стека

```
┌─────────────────────────────────────────────────┐
│                  Your .qmd File                 │
│         (Markdown + YAML frontmatter)           │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                    Quarto                       │
│           (Document rendering engine)           │
│         • Processes YAML metadata               │
│         • Handles extensions                    │
│         • Manages output formats                │
└─────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│       Pandoc        │    │       Typst         │
│   (MD → AST → ?)    │    │  (Typography/PDF)   │
│  • Markdown parser  │    │  • Modern engine    │
│  • AST transforms   │    │  • Fast compilation │
│  • Format bridges   │    │  • No LaTeX needed  │
└─────────────────────┘    └─────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                  document.pdf                   │
│        (Professional typography output)         │
└─────────────────────────────────────────────────┘
```

### Форматы вывода и команды

```
  FORMAT                COMMANDE                      SORTIE
  ──────                ────────                      ──────

  PDF standard    →  quarto render doc.qmd            doc.pdf
                     --to typst                       (sans template custom)

  PDF stylé ✅    →  quarto render doc.qmd            doc.pdf
                     --to whitepaper-typst            (~270K–1.7M, Bold Guy)
                     (format custom via _extensions/)

  EPUB            →  quarto render doc.qmd            doc.epub
                     --to epub

  Preview         →  quarto preview doc.qmd           hot-reload navigateur
```

### Структура расширения

```
  _extensions/
  └── whitepaper/
      ├── _extension.yml       ← déclare le format "whitepaper-typst"
      ├── typst-template.typ   ← design system (couleurs, typo, callouts)
      └── typst-show.typ       ← bridge Quarto → Typst

  ⚠️  Si tu maintiens des copies dans fr/ en/ et racine :
      garder les 3 fichiers typst-template.typ synchronisés
```

### Быстрое устранение неполадок

```
  SYMPTÔME                        CAUSE                    FIX
  ────────                        ─────                    ───
  PDF petit (~80-190K), non stylé  --to pdf au lieu de      Utiliser --to whitepaper-typst
                                   --to whitepaper-typst

  Erreur "bibliography"            @ref dans titre callout   Supprimer le @ du titre
                                   → interprété comme cit.

  Table rendue comme code          Backtick ``` non fermé    Compter les ``` (doit être pair)

  "Extension not found"            Mauvais répertoire        Vérifier _extensions/ path
```

| Компонент | Версия | Роль |
|-----------|---------|------|
| **Quarto** | ≥1.4.0 | Оркестрация, расширения, мультиформатность |
| **Typst** | 0.13.0 | Современная типографика (заменяет LaTeX) |
| **Пандок** | 3.x | Парсинг Markdown (в комплекте с Quarto) |

---

## <a name="setup"></a>Настройка

### Установка

**macOS**:
```bash
brew install quarto
```

**Linux (Debian/Ubuntu)**:
```bash
wget https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.555/quarto-1.4.555-linux-amd64.deb
sudo dpkg -i quarto-1.4.555-linux-amd64.deb
```

**Windows**:
```powershell
winget install Posit.Quarto
```

**Verify**:
```bash
quarto --version  # Should be ≥1.4.0
```

### Структура проекта

```
project/
├── _extensions/           # Quarto extensions (templates)
│   └── custom-template/
│       ├── _extension.yml
│       ├── typst-template.typ
│       └── typst-show.typ
├── documents/
│   ├── guide.qmd          # Source file
│   └── guide.pdf          # Generated output
└── assets/
    └── logo.png           # Shared assets
```

### Минимальный документ

Создайте `document.qmd`:

```yaml
---
title: "My Document"
author: "Author Name"
date: 2026-01-17
format:
  typst:
    toc: true
lang: en
---

# Introduction

Your content here...

## Section 1

More content with **bold** and `code`.

```bash
echo "Code blocks work!"
```

## Раздел 2

| Столбец А | Столбец Б |
|----------|----------|
| Данные 1   | Данные 2   |
```

Generate:
```bash
quarto render document.qmd  # Creates document.pdf
```

---

## <a name="workflow"></a>Рабочий процесс

### 1. Подход, ориентированный на содержание

```
1. Write content in Markdown (.qmd)
2. Add YAML frontmatter for metadata
3. Preview with hot-reload
4. Generate final PDF
5. Version control both source and PDF
```

### 2. Доступные параметры YAML

| Параметр | Тип | Описание | Пример |
|-----------|------|-------------|---------|
| `title` | нить | Основное название | `"Technical Guide"` |
| `subtitle` | нить | Вторичное название | `"v2.0 Edition"` |
| `author` | string/array | Автор(ы) | `"John Doe"` |
| `date` | дата | Дата документа | `2026-01-17` |
| `date-format` | нить | Формат отображения | `"MMMM YYYY"` |
| `toc` | логическое значение | Оглавление | `true` |
| `toc-depth` | число | Уровни ТОС (1-3) | `2` |
| `lang` | нить | Язык | `fr` или `en` |
| `section-numbering` | нить | Числовой формат | `"1.1"` |

### 3. Функции уценки

**Разрывы страниц**:
```markdown
{{< pagebreak >}}
```

**Блоки кода** (с подсветкой синтаксиса):
````markdown
```typescript
function hello(): string {
  return "world";
}
```
````

**Tables**:
```markdown
| Feature | Supported |
|---------|-----------|
| Tables  | ✅        |
| Images  | ✅        |
| Links   | ✅        |
```

**Images**:
```markdown
![Alt text](path/to/image.png){width=50%}
```

---

## <a name="integration-with-claude-code"></a>Интеграция с Claude Code

### Использование pdf-генератора Skill

Примените навык управляемого создания PDF-файлов:

```
/pdf-generator
```

Навык обеспечивает:
- Шаблон с фронтальной частью YAML
- Проектирование конфигурации системы
- Распространенные исправления неполадок
- Команды генерации

### Подскажите примеры

**Создать документацию**:
```
Create a technical guide for our API as a Quarto document.
Use the Typst format with a table of contents.
Include sections for: Authentication, Endpoints, Error Codes.
```

**Конвертировать существующую Markdown**:
```
Convert README.md to a professional PDF.
Add a cover page with title and date.
Use Quarto/Typst format.
```

**Создать шаблон**:
```
Create a Quarto extension for our company's document style:
- Logo in header
- Custom colors: primary #0f172a, accent #6366f1
- Inter font for body, JetBrains Mono for code
```

### В режиме плана

Для сложных документов:
```
[Press Shift+Tab to enter Plan Mode]

I need to create a series of 5 technical whitepapers.
Plan the structure:
1. Common template/extension
2. Shared assets
3. Build automation
4. Version management
```

### С хуками

Автоматическое создание PDF-файла после редактирования с помощью перехватчика PostToolUse:

```json
// In .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "if echo \"$TOOL_INPUT\" | grep -q '.qmd'; then quarto render \"$FILE\"; fi"
      }
    ]
  }
}
```

---

## <a name="customization"></a>Кастомизация

### Пользовательское расширение шаблона

Создайте `_extensions/mytemplate/_extension.yml`:

```yaml
title: My Template
author: Your Name
version: 1.0.0
contributes:
  formats:
    typst:
      template: typst-template.typ
      template-partials:
        - typst-show.typ
```

### Переменные шаблона Typst

В `typst-template.typ`:

```typst
// Colors
#let primary = rgb("#0f172a")      // Dark text
#let secondary = rgb("#334155")    // Lighter text
#let accent = rgb("#6366f1")       // Highlights

// Typography
#set text(
  font: ("Inter", "Helvetica Neue", "Arial"),
  size: 11pt,
)

#set par(
  leading: 0.75em,  // Line height
  justify: true,
)

// Code blocks
#show raw.where(block: true): it => {
  block(
    fill: rgb("#f8fafc"),
    stroke: (left: 3pt + accent),
    inset: 10pt,
    radius: 4pt,
    it,
  )
}
```

### Выноски

Определите в шаблоне:

```typst
#let info(title: "Note", body) = {
  block(
    fill: rgb("#E0F2FE"),
    stroke: (left: 3pt + rgb("#0284C7")),
    inset: 12pt,
    radius: 4pt,
    [*#title*: #body]
  )
}

#let warning(title: "Warning", body) = { ... }
#let success(title: "Success", body) = { ... }
#let danger(title: "Danger", body) = { ... }
```

Использовать в документе:
```typst
#info[This is an informational note.]
#warning(title: "Attention")[Check your configuration.]
```

---

## <a name="troubleshooting"></a>Поиск неисправностей

### Быстрые проверки

```bash
# Verify Quarto
quarto --version

# Check extension exists
ls _extensions/*/

# Validate code block pairs (must be even)
grep -c '^```' document.qmd

# Check encoding
file -i document.qmd  # Should show utf-8
```

### Общие проблемы

| Проблема | Симптом | Исправить |
|-------|---------|-----|
| Вложенные блоки кода | Содержимое выходит из блока | Используйте 4+ обратных кавычек для внешнего блока. |
| Таблицы как код | Серый фон | Проверьте непревзойденный ` ``` ` выше |
| Отсутствует расширение | "Расширение не найдено" | Проверьте путь `_extensions/` |
| Предупреждения о шрифтах | «неизвестное семейство шрифтов» | Нормальный; использует резервные варианты |
| Специальные символы сломаны | `?` или искажено | Конвертировать в UTF-8 |

### Вложенные блоки кода

**Проблема**: внутренний блок кода преждевременно закрывает внешний блок.

**Решение**: Используйте больше обратных кавычек для внешнего блока:

`````markdown
````markdown
# Outer block with 4 backticks

```bash
echo "Inner block with 3 backticks"
```

Outer block continues...
````
`````

### Скрипт проверки

```bash
#!/bin/bash
# validate-qmd.sh

for f in *.qmd; do
  count=$(grep -c '^```' "$f")
  if [ $((count % 2)) -ne 0 ]; then
    echo "ERROR: $f has odd code block count ($count)"
  fi
done
```

---

## <a name="see-also"></a>См. также

- [Quarto Документация](https://quarto.org/docs/guide/)
- [Typst Документация](https://typst.app/docs/)
- [Quarto + Typst Руководство](https://quarto.org/docs/output-formats/typst.html)
- [examples/skills/pdf-generator.md](../../examples/skills/pdf-generator.md): шаблон навыков
- [whitepapers/README.md](../../whitepapers/README.md): Пример производства