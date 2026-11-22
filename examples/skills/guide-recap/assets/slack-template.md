# Слабый шаблон

Компактный, легко сканируемый, с множеством смайлов. Готов к вставке.

## шаблон FR

```
:newspaper: *{title_fr}*

{highlights_fr}

:link: {link}
```

## RU-шаблон

```
:newspaper: *{title_en}*

{highlights_en}

:link: {link}
```

## Правила полей

### заголовок (максимум 60 символов)

```
FR: "Guide v3.20.5 - Reference visuelle"
EN: "Guide v3.20.5 - Visual reference"

FR: "Recap semaine : 4 releases"
EN: "Week recap: 4 releases"
```

### основные моменты (3-5 строк)

Каждая строка: смайлик Slack + краткое описание. Нет жирного шрифта в тексте маркеров.

```
FR:
:art: 4 nouveaux diagrammes ASCII (TDD, UVAL, securite, incidents)
:brain: 30 nouvelles questions quiz (257 total)
:shield: Guide sandbox isolation Docker
:mag: 9 patterns avances identifies via claudelog.com

EN:
:art: 4 new ASCII diagrams (TDD, UVAL, security, incidents)
:brain: 30 new quiz questions (257 total)
:shield: Docker sandbox isolation guide
:mag: 9 advanced patterns identified via claudelog.com
```

### связь

URL-адрес репозитория GitHub.

## Справочник по смайликам Slack

Используйте стандартные смайлы Slack, которые отображаются во всех рабочих пространствах:

| Эмодзи | Код | Использовать для |
|-------|------|---------|
| :newspaper: | `:newspaper:` | Маркер заголовка |
| :art: | `:art:` | Визуальный контент, диаграммы, пользовательский интерфейс |
| :brain: | `:brain:` | Викторина, обучение, знания |
| :shield: | `:shield:` | Содержимое безопасности |
| :mag: | `:mag:` | Исследования, анализ, конкурентная информация |
| :wrench: | `:wrench:` | Инструменты, рабочие процессы, конфигурация |
| :books: | `:books:` | Новые руководства, документация |
| :chart_with_upwards_trend: | `:chart_with_upwards_trend:` | Показатели роста |
| :white_check_mark: | `:white_check_mark:` | Исправления, исправления |
| :link: | `:link:` | Маркер ссылки |
| :arrow_right: | `:arrow_right:` | Индикатор роста (X -> Y) |

## Ограничения

- Всего максимум 500 символов
- Бюджет эмодзи: 4–6 (1 заголовок + 1 на каждое выделение + 1 ссылка)
- Никаких рекламных слов
- FR: обучение
- RU: Американский английский
- Одиночная ссылка (GitHub)
- Никаких хэштегов (это не соглашение Slack)
- Используйте форматирование Slack: коды `*bold*`, `_italic_`, `:emoji:`.
