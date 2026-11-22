---
name: pdf-generator
description: "Создавайте профессиональные PDF-файлы, используя стек Quarto/Typst и шаблон современного дизайна."
effort: low
version: 1.0.0
---

# Умение создавать PDF-файлы

Создавайте профессиональные PDF-файлы с современной типографикой, используя Quarto + Typst.

## Цель навыка

Этот навык помогает:
- Настройка проектов Quarto/Typst
- Создание шаблонов документов
- Создание PDF-файлов из Markdown
- Устранение проблем с рендерингом
- Настройка дизайн-систем

## Куча

| Инструмент | Версия | Роль |
|------|---------|------|
| **Quarto** | ≥1.4.0 | Механизм рендеринга документов |
| **Typst** | 0.13.0 | Современная типографика (интегрированная) |
| **Пандок** | 3.x | Преобразование уценки (встроенное) |

### Трубопровод генерации

```
  SOURCE              OUTIL           TEMPLATE              OUTPUT
  ──────              ─────           ────────              ──────

  .qmd  ──────────► Quarto ────► --to whitepaper-typst ──► Typst 0.13 ──► .pdf ✅
  (Markdown           │           (_extensions/               (~270K–1.7M,
  + YAML)             │            typst-template.typ)         stylé)
                      │
                      └──────► --to epub ──► Pandoc ──────────────────► .epub
                                             + epub-styles.css

  ⚠️  --to pdf (sans template) → PDF petit, non stylé → Toujours préférer --to whitepaper-typst
```

### Доступные форматы

```
  ┌──────────────────────┬────────────────────────┬──────────────────┐
  │ Format               │ Commande               │ Sortie           │
  ├──────────────────────┼────────────────────────┼──────────────────┤
  │ PDF stylé ✅         │ --to whitepaper-typst  │ ~270K–1.7M       │
  │ PDF standard ❌      │ --to pdf               │ ~80-190K, brut   │
  │ EPUB                 │ --to epub              │ epub-output/     │
  └──────────────────────┴────────────────────────┴──────────────────┘
```

## <a name="quick-start"></a>Быстрый старт

### Установка

```bash
# macOS
brew install quarto

# Linux
wget https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.555/quarto-1.4.555-linux-amd64.deb
sudo dpkg -i quarto-1.4.555-linux-amd64.deb

# Windows
winget install Posit.Quarto
```

### Создать PDF

```bash
# Single file
quarto render document.qmd

# All files
quarto render *.qmd

# Preview with hot-reload
quarto preview document.qmd
```

## Шаблон фронтмена YAML

```yaml
---
title: "Document Title"
subtitle: "Optional subtitle"
author: "Author Name"
date: 2026-01-17
date-format: "MMMM YYYY"
format:
  typst:
    toc: true
    toc-depth: 2
    section-numbering: "1.1"
lang: en
---
```

### Доступные параметры

| Параметр | Тип | Описание |
|-----------|------|-------------|
| `title` | нить | Основное название (обложка) |
| `subtitle` | нить | Дополнительный субтитр |
| `author` | нить | Автор(ы) |
| `date` | дата | Формат ISO (ГГГГ-ММ-ДД) |
| `date-format` | нить | Формат отображения (`MMMM YYYY`) |
| `toc` | логическое значение | Показать оглавление |
| `toc-depth` | число | Глубина TOC (1-3) |
| `section-numbering` | нить | Формат (`1.1`, `1.a`) |
| `lang` | нить | Язык (`fr`, `en`) |

## Структура проекта

```
project/
├── _extensions/
│   └── custom-template/
│       ├── _extension.yml      # Extension metadata
│       ├── typst-template.typ  # Main template
│       └── typst-show.typ      # Quarto → Typst bridge
├── document.qmd                # Source file
└── document.pdf                # Generated output
```

## Синтаксис уценки

### Разрывы страниц

```markdown
{{< pagebreak >}}
```

### Блоки кода

Стандартные огражденные блоки с подсветкой синтаксиса:

````markdown
```bash
npm install
```
````

### Таблицы

```markdown
| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |
```

### Изображения

```markdown
![Caption](path/to/image.png){width=50%}
```

## Пользовательский шаблон

### Конфигурация расширения

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

### Система проектирования (Typst)

```typst
// Colors (Slate + Indigo palette)
#let primary = rgb("#0f172a")      // Slate 900 - titles
#let secondary = rgb("#334155")    // Slate 700 - subtitles
#let accent = rgb("#6366f1")       // Indigo 500 - accents
#let muted = rgb("#64748b")        // Slate 500 - metadata
#let light-bg = rgb("#f8fafc")     // Slate 50 - code bg
#let border-light = rgb("#e2e8f0") // Slate 200 - borders
```

### Типография

```typst
#set text(
  font: ("Inter", "Helvetica Neue", "Arial"),
  size: 11pt,
)

#set par(
  leading: 0.75em,
  justify: true,
)

// Code blocks
#show raw.where(block: true): it => {
  block(
    fill: light-bg,
    stroke: (left: 3pt + accent),
    inset: 10pt,
    radius: 4pt,
    it,
  )
}
```

### Выноски

```typst
#let info(title: "Note", body) = {
  block(
    fill: rgb("#E0F2FE"),
    stroke: (left: 3pt + rgb("#0284C7")),
    inset: 12pt,
    [*#title*: #body]
  )
}

#let warning(title: "Warning", body) = {
  block(
    fill: rgb("#FEF3C7"),
    stroke: (left: 3pt + rgb("#D97706")),
    inset: 12pt,
    [*#title*: #body]
  )
}

#let success(title: "Success", body) = {
  block(
    fill: rgb("#DCFCE7"),
    stroke: (left: 3pt + rgb("#16A34A")),
    inset: 12pt,
    [*#title*: #body]
  )
}

#let danger(title: "Danger", body) = {
  block(
    fill: rgb("#FEE2E2"),
    stroke: (left: 3pt + rgb("#DC2626")),
    inset: 12pt,
    [*#title*: #body]
  )
}
```

## <a name="troubleshooting"></a>Поиск неисправностей

### Быстрая проверка

```bash
# Check Quarto version
quarto --version  # >= 1.4.0

# Verify extension exists
ls _extensions/*/

# Validate code block pairs (must be even)
grep -c '^```' document.qmd

# Check encoding
file -i document.qmd  # Must show utf-8
```

### Общие проблемы

| Проблема | Причина | Исправить |
|-------|-------|-----|
| Вложенные блоки кода ломаются | Внутренний ` ``` `закрывает внешний | Используйте 4+ обратных кавычек для внешних |
| Таблицы отображаются как код | Непревзойденный ` ``` ` выше | Проверьте количество разделителей |
| Расширение не найдено | Неправильный каталог | Проверьте путь `_extensions/` |
| Предупреждения о шрифтах | Шрифты не установлены | Нормальный; использует резервные варианты |
| Персонажи сломаны | Неправильная кодировка | Конвертировать в UTF-8 |

### Вложенные блоки кода

Используйте больше обратных кавычек для внешнего блока:

`````markdown
````markdown
# This is the outer block

```bash
echo "This is nested"
```

Outer continues...
````
`````

### Скрипт проверки

```bash
#!/bin/bash
for f in *.qmd; do
  count=$(grep -c '^```' "$f")
  if [ $((count % 2)) -ne 0 ]; then
    echo "ERROR: $f has odd count ($count)"
  fi
done
```

### Полный конвейер проверки

```bash
#!/bin/bash
# validate-qmd.sh

echo "=== Validating QMD files ==="
errors=0

for f in *.qmd; do
  # Check code block pairs
  count=$(grep -c '^```' "$f")
  if [ $((count % 2)) -ne 0 ]; then
    echo "ERROR: $f - odd code block count ($count)"
    ((errors++))
  fi

  # Check UTF-8
  encoding=$(file -i "$f" | grep -o 'charset=[^;]*')
  if [[ "$encoding" != *"utf-8"* ]]; then
    echo "WARNING: $f - encoding is $encoding"
  fi
done

echo "=== Validation complete: $errors errors ==="
exit $errors
```

## Примеры использования

### Техническая документация

```yaml
---
title: "API Reference"
subtitle: "v2.0"
author: "Engineering Team"
date: 2026-01-17
format:
  typst:
    toc: true
    toc-depth: 3
---

# Authentication

All requests require an API key...
```

### Серия технических документов

```yaml
---
title: "Security Best Practices"
series: "Engineering Whitepapers"
wp-number: "03"
author: "Security Team"
date: 2026-01-17
format:
  whitepaper-typst:
    toc: true
---
```

### Внутренний отчет

```yaml
---
title: "Q1 Performance Report"
author: "Analytics Team"
date: 2026-01-17
date-format: "Q1 YYYY"
format:
  typst:
    toc: false
---
```

## <a name="resources"></a>Ресурсы

- [Quarto Документация](https://quarto.org/docs/guide/)
- [Typst Документация](https://typst.app/docs/)
- [Quarto + Typst Руководство](https://quarto.org/docs/output-formats/typst.html)
- [Руководство по рабочему процессу](../../guide/workflows/pdf-generation.md)