---
title: "Справочный файл проекта"
description: "Сохраняйте brand-book.html и ui-kit.html в корне проекта в качестве постоянного контекста Claude Code для согласованного создания пользовательского интерфейса."
tags: [design-system, frontend, web, ui, consistency, brand, color-palette, tailwind]
---

# Справочный файл дизайна: шаблон CLAUDE.md

Сохраните `brand-book.html` и `ui-kit.html` в корне проекта как постоянные файлы контекста. Claude Code считывает их перед созданием любого пользовательского интерфейса — каждая новая страница автоматически наследует вашу систему дизайна.

Вдохновлен рабочим процессом Бориса Пайяра (mixt.care, март 2026 г.): после внедрения системы дизайна создание новых страниц занимает 5 минут вместо 30.

## <a name="the-problem"></a>Проблема

При создании веб-сайта с Claude Code в течение нескольких сеансов каждая новая страница рискует отклониться от дизайна — неправильные цвета, непоследовательная типографика, новые варианты компонентов. Повторное указание проектных ограничений в каждом подсказке является повторяющимся и ненадежным.

## Решение

Два HTML-файла в корне проекта действуют как память проекта, которую Claude может прочитать в любое время:

- `brand-book.html` — цветовая палитра с семантическими ролями, шрифтами, переменными CSS, коэффициентами контрастности WCAG.
- `ui-kit.html` — документированные компоненты (кнопки, формы, панели доверия, метки разделов)

Одна инструкция CLAUDE.md заставляет Claude ссылаться на них перед каждой задачей пользовательского интерфейса.

## Структура проекта

```
project/
├── brand-book.html     # Color palette + typography + CSS variables (permanent reference)
├── ui-kit.html         # Component library documented with Tailwind
├── CLAUDE.md           # Design system instruction below
├── src/
│   ├── styles/
│   │   └── tokens.css  # CSS variables extracted from brand-book.html
│   └── components/
└── ...
```

## CLAUDE.md Фрагмент

Добавьте это в `CLAUDE.md` на уровне проекта:

```markdown
## Design System

Always read `brand-book.html` and `ui-kit.html` before generating any UI component, page, or layout.

Rules:
- Never hardcode colors or font sizes — use CSS variables from brand-book.html
- Reuse components from ui-kit.html before creating new variants
- New pages must use the same design tokens (--color-primary, --font-primary, etc.)
- If a requested design element is not in the UI kit, document it in ui-kit.html after creating it
```

## Шаг 1 — сгенерируйте brand-book.html

```
Create a brand-book.html file at the project root.

For each color in my palette, display a card showing:
- Color swatch (120×80px block)
- Name, hex code, RGB values, HSL values
- CSS variable name (e.g. --color-primary)
- Semantic role: PRIMARY | DARK | LIGHT | ACCENT | NEUTRAL
- Usage rule in plain text (e.g. "CTAs, buttons, active links")
- WCAG contrast ratio vs white: X.X:1 — AA PASS/FAIL — AAA PASS/FAIL
- WCAG contrast ratio vs black: X.X:1 — AA PASS/FAIL — AAA PASS/FAIL

My palette:
[LIST YOUR COLORS AND ROLES HERE]

My fonts:
[LIST YOUR FONTS HERE]

Include a type scale section: 12px / 16px / 20px / 24px / 32px / 48px / 64px / 96px with rem equivalents.

At the bottom, output a copyable <style> block with all CSS variables (:root { ... }).

Style brand-book.html itself using these variables — it should demonstrate the design system.
```

## Шаг 2 — сгенерируйте ui-kit.html

```
Build ui-kit.html documenting my base components using Tailwind and the CSS variables from brand-book.html.

Include:
- Buttons: primary/secondary/ghost variants, 3 sizes (sm/md/lg)
- Trust bars with vertical color separators
- Section labels with horizontal rules (uppercase, letter-spacing)
- Typography specimens: h1–h4, body, caption — using --font-primary and --font-secondary
- Color swatches grid with contrast ratios displayed
- Form elements: input, select, textarea in default/focus/error states

Each component should show: component name, usage notes, and the Tailwind classes used.
Reference CSS variables from brand-book.html — no hardcoded values.
```

## Шаг 3. Аудит цвета WCAG (необязательно, но рекомендуется)

Запустите это после создания брендбука, чтобы выявить проблемы с доступностью перед созданием:

```
Audit the color palette in brand-book.html for WCAG 2.1 compliance:

1. For all likely foreground/background combinations, calculate exact contrast ratios (2 decimal places)
2. Flag pairs that fail WCAG AA: 4.5:1 for normal text, 3:1 for large text and UI components
3. Simulate deuteranopia, protanopia, tritanopia — flag problematic combinations
4. For each failing pair, suggest the minimum hex adjustment to pass AA while staying within 10% hue deviation
5. Output: markdown table with columns: Combination | Ratio | AA Normal | AA Large | AAA | Color Blind Safe

External references:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- ColorOracle (color blindness simulator): https://colororacle.org/
```

## Шаг 4 — Анимация прокрутки (необязательно)

```
Add scroll animations to all cards and section titles using vanilla JS Intersection Observer.
Elements should fade in + slide up with 0.6s ease-out transitions, 100ms stagger between items.
Apply only to elements with [data-animate] attribute — opt-in, not global.
Do not use any animation library — vanilla JS only.
```

## Пример — цветовая палитра mixt.care

Хорошо структурированная палитра с семантическими ролями и переменными CSS:

```css
:root {
  /* Colors */
  --color-primary: #5C1A2E;   /* Deep bordeaux — CTAs, buttons, active links */
  --color-dark: #3D2B1F;      /* Warm brown — body text, dark backgrounds */
  --color-accent: #B87333;    /* Copper — hover states, secondary highlights */
  --color-secondary: #6B5B8E; /* Soft violet — badges, illustrations */
  --color-light: #F5F0EA;     /* Cream — section backgrounds, cards */

  /* Typography */
  --font-primary: 'Geist', sans-serif;       /* Body text */
  --font-secondary: 'Newsreader', serif;     /* Emphasis, quotes */
  --font-display: 'Fraunces', serif;         /* Logo, display headings only */

  /* Type scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;
  --text-3xl: 3rem;
  --text-display: 6rem;        /* Desktop statement footer */
  --text-display-mobile: 3rem;
}
```

Примечания **WCAG для этой палитры** (оценка):
- Бордо на сливках: ~8.2:1 — AA PASS
- Коричневый на кремовом: ~9,1:1 — AA PASS
- Белые на бордо: ~8,2:1 — AA PASS
- Медный на белом: ~3,1:1 — AA FAIL для обычного текста (используйте только для компонентов пользовательского интерфейса или затемните его до #9B5F20)
- Фиолетовый на кремовом: ~4,8:1 — AA PASS

## <a name="when-to-use-this-pattern"></a>Когда использовать этот шаблон

- Создание маркетингового сайта, целевой страницы или веб-сайта продукта с помощью Claude Code
- Когда вам нужен единообразный дизайн для нескольких страниц, созданных в разных сеансах
- Перед началом работы над пользовательским интерфейсом в любом проекте с установленными рекомендациями по бренду.
- Замена документации системы проектирования вручную интерактивным, самодемонстрирующимся справочником.

## <a name="limitations"></a>Ограничения

- Эффективно для сайтов static/marketing и MVP — библиотекам сложных компонентов нужен подходящий инструмент системы проектирования (Storybook, Figma).
- При использовании двухчасового периода предполагается, что вы знаете замысел дизайна еще до запроса (цвета, шрифты, направление макета).
- Предполагаемый аудит WCAG от Claude — проверьте критические пары с помощью WebAIM или специального инструмента.