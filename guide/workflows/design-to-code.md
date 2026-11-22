---
title: "Рабочий процесс проектирования в код с Figma MCP"
description: "Внедрение системы автоматизированного проектирования с использованием сервера Figma MCP для обеспечения равенства проектного кода 1:1."
tags: [workflow, mcp, integration]
---

# Рабочий процесс проектирования в коде с помощью Figma MCP

> **Confidence**: Уровень 2, основанный на документированных практических примерах производства (Parallel HQ, builder.io), спецификациях сервера MCP и рабочих процессах сообщества.

Внедрение системы автоматизированного проектирования с использованием сервера Figma MCP позволяет дизайнерам продуктов передавать готовые к производству спецификации в Claude Code, который реализует компоненты, поддерживающие соотношение проектного кода 1:1.

---

## Оглавление

1. [TL;DR](#tldr)
2. [Документированное влияние](#documented-impact)
3. [Обзор архитектуры](#architecture-overview)
4. [3-уровневая иерархия токенов](#3-tier-token-hierarchy)
5. [Предварительные требования](#prerequisites)
6. [Основные рабочие процессы](#core-workflows)
7. [Настройка Code Connect](#code-connect-setup)
8. [Пример подсказок](#example-prompts)
9. [Схемы внедрения в команду](#team-adoption-patterns)
10. [Anti-Patterns](#anti-patterns)
11. [Дорожная карта реализации](#implementation-roadmap)
12. [Ресурсы](#resources)

---

## <a name="tldr"></a>ТЛ;ДР

```
Designer (Figma Make) → Export (Figma Design) → Claude (Figma MCP) → Production Code

Key insight: Design system = source of truth
Claude consumes tokens/components directly from Figma
Implementation maintains design parity automatically
```

---

## <a name="documented-impact"></a>Документированное воздействие

На основе производственных кейсов за январь 2026 г.:

| Метрика | Улучшение | Источник |
|--------|-------------|--------|
| Несоответствия дизайна | снижение на 62% | Параллельное исследование штаб-квартиры |
| Эффективность рабочего процесса | улучшение на 78% | практический пример builder.io |
| Экономия времени на проектирование | 75 дней (6 месяцев) | Данные параллельного производства штаб-квартиры |
| Time-to-market | скидка 56% | Многоорганизационный композит |
| Проектный технический долг | снижение на 82% | Аудит после внедрения |

**Типичное время рабочего процесса**:
- Одиночный кадр → Производственный компонент: 2-3 минуты.
- Аудит дрейфа системы проектирования: 3 недели → 3 минуты
- Распространение обновлений токена: ручные часы → автоматические секунды.

*Источники: builder.io/blog/claude-code-figma-mcp-server, parallelhq.com/blog/automating-design-systems-with-ai, composio.dev/blog/how-to-use-figma-mcp-with-claude-code*

---

## <a name="architecture-overview"></a>Обзор архитектуры

### Полный стек

```
[Figma Design File]
    ↓ (Variables & Styles)
[Tokens Studio Plugin] (optional but recommended)
    ↓ (JSON export)
[GitHub Repository]
    ↓ (CI/CD)
[Style Dictionary]
    ↓ (Transform)
[CSS Custom Properties / Tailwind Config]
    ↓ (Consumed by)
[Component Library]
    ↑ (Reads via)
[Claude Code + Figma MCP]
```

### Точка интеграции MCP

Claude Code обращается к Figma через сервер Figma MCP:

```
Claude Code
    ↓ (uses)
Figma MCP Server (mcp-server-figma)
    ↓ (authenticates via)
Figma Personal Access Token
    ↓ (reads)
Figma File (Dev Mode data)
```

**К чему Claude может получить доступ**:
- Структура файла и фреймы
- Стили Color/text/effect
- Свойства компонента
- Переменные (токены)
- Аннотации режима разработки
- Фрагменты Code Connect (если настроено)

**К чему Claude не имеет доступа**:
- Частные файлы без разрешений токена
- Редактировать возможности (только чтение)
- Данные о совместной работе в режиме реального времени
- История версий (только текущее состояние)

---

## <a name="3-tier-token-hierarchy"></a>Трехуровневая иерархия токенов

Современные системы дизайна используют иерархическую структуру токенов. Claude Code понимает эту иерархию при использовании данных Figma.

| Уровень | Определение | Фигма Реализация | Вывод кода |
|------|------------|----------------------|-------------|
| **Base** | Примитивные значения | Переменные Figma (например, `blue-600: #0066CC`, `spacing-2: 8px`) | Пользовательские свойства CSS (`--blue-600`, `--spacing-2`) |
| **Композитный** | Комбинированные примитивы | Компонент заполняет ссылающиеся переменные | Конфигурация Tailwind или классы CSS |
| **Семантический** | Контекстуальное значение | Псевдонимы контекстных переменных (например, `color-interactive-primary` → `blue-600`) | Реквизиты компонентов или токены тем |

### Пример иерархии

```
Base:
  --color-blue-600: #0066CC
  --spacing-2: 8px
  --radius-md: 4px

Composite:
  --button-padding: var(--spacing-2) var(--spacing-4)
  --button-border-radius: var(--radius-md)

Semantic:
  --interactive-primary: var(--color-blue-600)
  --interactive-primary-hover: var(--color-blue-700)
```

Поведение **Claude Code**: если задан компонент Figma, Claude:
1. Извлекает ссылочные переменные (базовый уровень)
2. Определяет составные узоры (интервал, размер)
3. Применяет семантическое именование на основе соглашений о токенах.
4. Генерирует код, соответствующий этой иерархии

---

## <a name="prerequisites"></a>Предварительные условия

### Для дизайнеров

| Требование | Подробности |
|-------------|---------|
| **Фигма Лицензия** | Место в режиме разработки (включает переменную проверку, фрагменты кода) |
| **Организованные переменные** | Используйте плагин Figma Variables или Tokens Studio для управления токенами. |
| **Структура компонента** | Автоматический макет, именованные слои, согласованные соглашения об именах |
| **Именование фреймов** | Описательные имена фреймов (Claude использует их для имен компонентов) |

### Для разработчиков

| Требование | Подробности |
|-------------|---------|
| **Claude Code** | Версия 1.5.0+ (поддержка MCP) |
| **Фигма MCP Сервер** | Сервер сообщества `figma-developer-mcp` ([Framelink](https://github.com/GLips/Figma-Context-MCP)), запускаемый через `npx` |
| **Токен личного доступа** | Создано из настроек учетной записи Figma → Токены. |
| **MCP Конфигурация** | Токен настроен в настройках Claude Code. |

### Конфигурация MCP

Добавьте в настройки Claude Code MCP (`.claude/mcp.json` или пользовательский интерфейс настроек):

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "your-token-here"
      }
    }
  }
}
```

**Примечание по безопасности**: Используйте переменные среды для рабочей среды:
```json
{
  "env": {
    "FIGMA_API_KEY": "${FIGMA_TOKEN}"
  }
}
```

Затем экспортируйте в свою оболочку: `export FIGMA_TOKEN="figd_..."`.

---

## <a name="core-workflows"></a>Основные рабочие процессы

### Рабочий процесс A: Один кадр → производственный компонент

**Timing**: 2–3 минуты на каждый компонент.

**Steps**:

1. **Designer**: создайте компонент в Figma с правильным variables/styles.
2. **Designer**: поделитесь URL-адресом файла Figma с dev/Claude
3. **Разработчик**: Подскажите Claude Code:

```
Read the "Button/Primary" component from Figma file:
https://www.figma.com/design/FILE_KEY

Implement as a React component with TypeScript.
Use Tailwind for styling, mapping Figma variables to our design tokens.
Ensure responsive behavior matches Figma's Auto Layout constraints.
```

4. **Claude**:
   - Извлекает компонент через Figma MCP
   - Извлекает стили, размеры, интервалы
   - Сопоставляет переменные с токенами кода
   - Генерирует компонент с реквизитами, соответствующими вариантам Figma.

5. **Verification**: `npm run dev` → Визуальное сравнение с Figma

**Пример вывода**:
```tsx
// components/Button/Primary.tsx
interface ButtonProps {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

export function PrimaryButton({ size = 'md', disabled, children }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        'bg-interactive-primary text-white',
        'hover:bg-interactive-primary-hover',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        }
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

---

### Рабочий процесс B: Аудит отклонений системы проектирования

**Timing**: ручная проверка за 3 недели → 3 минуты в автоматическом режиме

**Проблема**: Со временем код отклоняется от системы дизайна (магические числа, жестко запрограммированные цвета, непостоянные интервалы).

**Solution**: Claude проверяет базу кода на соответствие источнику истины Figma.

**Prompt**:
```
Audit src/components for design system compliance.
Compare against our Figma design system:
https://www.figma.com/design/FILE_KEY

Report:
1. Hardcoded colors not using design tokens
2. Magic number spacing values
3. Components not matching Figma structure
4. Missing responsive patterns

Then propose fixes with token replacements.
```

Выход **Claude**:
```markdown
## Design System Audit Results

### Issues Found (23 total)

#### Hardcoded Colors (8 instances)
- `src/components/Card.tsx:45` → `#0066CC` should be `var(--interactive-primary)`
- `src/components/Header.tsx:12` → `#F3F4F6` should be `var(--surface-secondary)`
...

#### Magic Numbers (11 instances)
- `src/components/Modal.tsx:23` → `padding: 16px 24px` should be `var(--spacing-4) var(--spacing-6)`
...

#### Structural Mismatches (4 instances)
- `src/components/Button.tsx` → Missing `icon-left` variant present in Figma
...
```

---

### Рабочий процесс C: конвейер автоматизации токенов

**Goal**: изменения переменных Figma автоматически распространяются на код.

**Architecture**:

```
Figma Variables
    ↓ (Tokens Studio export or Figma API)
GitHub Repository (tokens.json)
    ↓ (GitHub Actions CI/CD)
Style Dictionary Transform
    ↓ (generates)
CSS / Tailwind / Platform-specific tokens
    ↓ (commit & deploy)
Production
```

**Setup** (однократно):

1. Плагин **Tokens Studio**: подключение к репозиторию GitHub
2. **Style Dictionary Config**: определение правил преобразования
3. **GitHub Actions**: автоматический запуск при обновлении токена.
4. **Claude Роль**: просмотр и проверка сгенерированных токенов.

**Подсказка разработчика** (после запуска CI):
```
Review the token update from commit abc1234.
Check if any components need updates to consume new tokens.
Generate migration guide if breaking changes exist.
```

Выход **Claude**:
```markdown
## Token Update Review (v2.3.0 → v2.4.0)

### Changes
- Added: `--spacing-7`, `--spacing-8` (requested by design)
- Changed: `--interactive-secondary` hue shift 5° (brand refresh)
- Deprecated: `--legacy-blue` (remove by Q3)

### Impact Analysis
- 12 components reference `--interactive-secondary` → Auto-updated via token reference
- 3 components use deprecated `--legacy-blue` → Migration needed

### Migration Required
1. `src/components/LegacyButton.tsx:34` → Replace `--legacy-blue` with `--interactive-primary`
2. `src/components/OldCard.tsx:67` → Replace with new token
3. `src/utils/theme.ts:12` → Update theme export

### Migration Script
[Claude generates codemod or find/replace script]
```

---

### Рабочий процесс D: Визуальный цикл итерации (Фигма + Playwright)

**Goal**: Автоматизированное визуальное регрессионное тестирование проектов Figma.

**MCP Stack**: Фигма MCP + Playwright MCP

**Setup**:
```
Claude Code accesses:
- Figma (design source of truth)
- Playwright (automated browser testing)
```

**Prompt**:
```
Take a screenshot of our Button component in all variants.
Compare against Figma frames from:
https://www.figma.com/design/FILE_KEY → "Button Tests" page

Report any visual differences (color, spacing, typography).
```

**Workflow**:
1. Claude читает кадры Figma (ожидаемое состояние)
2. Claude использует Playwright для создания скриншотов живых компонентов (фактическое состояние)
3. Claude сравнивает (разница пикселей или визуальный осмотр)
4. Сообщает о расхождениях с предложениями по исправлению

**Пример вывода**:
```markdown
## Visual Regression Report

### ✅ Matching (5/7)
- Button/Primary/Default
- Button/Primary/Hover
- Button/Secondary/Default
...

### ❌ Mismatches (2/7)

#### Button/Primary/Disabled
- **Issue**: Text opacity 0.4 in code, 0.5 in Figma
- **Fix**: Update `disabled:opacity-50` → `disabled:opacity-40`
- **File**: `src/components/Button.tsx:23`

#### Button/Large
- **Issue**: Padding 12px in code, 16px in Figma
- **Fix**: Update `py-3` → `py-4` (16px)
- **File**: `src/components/Button.tsx:18`
```

---

## <a name="code-connect-setup"></a>Настройка подключения по коду

**Code Connect** — это инструмент Figma без кода для связывания компонентов дизайна с фрагментами кода. Это расширяет возможности Claude генерировать правильный код.

### Что он делает

- Дизайнеры аннотируют компоненты Figma примерами кода.
- Claude читает эти аннотации через MCP.
- Сгенерированный код автоматически соответствует соглашениям команды.

### Настройка (для дизайнеров)

1. В Figma Dev Mode → Выберите компонент → Панель Code Connect.
2. Добавьте фрагмент кода, показывающий, как используется компонент:

```tsx
// Example Code Connect annotation in Figma
<Button variant="primary" size="lg">
  Click me
</Button>
```

3. Claude видит это, когда его просят реализовать, и использует точные шаблоны команды.

### Преимущества

| Без кода подключения | С помощью кода Connect |
|---------------------|-------------------|
| Claude генерирует общий код | Claude использует командные соглашения |
| Несогласованное название реквизита | Реквизит точно соответствует вариантам Figma |
| Требуется ручная коррекция | Готовый к производству первый проход |

**Reference**: дополнительную информацию можно найти в parallelhq.com/blog (статья о пользовательском интерфейсе Code Connect).

---

## Альтернатива: Карандаш (родной холст IDE)

**Обзор**: [Pencil](https://pencil.dev) переносит бесконечное пространство для проектирования непосредственно в Claude Code/Cursor/VSCode, устраняя переключение внешних инструментов и обеспечивая рабочие процессы проектирования как кода.

### Архитектура

**Основные инновации**: В отличие от Figma (облачного) или Excalidraw (автономного), Pencil встраивает холст дизайна непосредственно в IDE, где находятся Claude и ваш код.

```
Traditional Workflow:
Figma (design) → Export → Claude Code → Implementation → Manual sync

Pencil Workflow:
IDE Canvas (design + AI agents + code) → Git commit → Continuous alignment
```

**Основные характеристики**:
- **WebGL Canvas**: бесконечный, производительный, полностью редактируемый
- **AI Многопользовательские агенты**: параллельные агенты совместно разрабатывают проект.
- **Git-Native**: файлы `.pen` (формат JSON) контролируются версией вместе с кодом.
- **MCP Bi-Directional**: полный доступ для чтения и записи (а не только чтение, как Figma MCP)
- **Figma Import**: копирование и вставка непосредственно из Figma с сохранением векторов и стилей.

### <a name="pencil-vs-figma-mcp"></a>Карандаш против Фигмы MCP

| Аспект | Карандаш | Фигма MCP |
|--------|--------|-----------|
| **Местоположение** | IDE-родной (код Cursor/VSCode/Claude) | Внешнее облако |
| **Формат** | `.pen` JSON (открытый) | Собственный двоичный файл |
| **Версионирование** | Git-родной (branch/merge/history) | Облачные версии Figma |
| **AI Агенты** | Многопользовательский параллельный режим | Однопоточный через MCP |
| **Сотрудничество** | Code-first (разработчики + дизайнеры) | Дизайн прежде всего (дизайнеры + разработчики) |
| **MCP Доступ** | Двунаправленный (чтение+запись) | Read-only |
| **Рабочий процесс** | Дизайн → Фиксация → Код в той же среде | Проектирование → Экспорт → Передача → Код |
| **Наилучший вариант для** | Инженеры-проектировщики, кодоориентированные команды | Традиционное разделение дизайна и разработки |
| **Зрелость** | Развивающиеся (запущены в январе 2026 г.) | Зрелые (2024+) |
| **Цены** | На данный момент бесплатно, будущее подлежит уточнению | Freemium (доступен бесплатный уровень) |

### Когда использовать карандаш

✅ **Good Fit**:
- Команда использует Cursor или VSCode + Claude Code в качестве основной среды.
- Инженеры-проектировщики, знакомые с рабочими процессами terminal/IDE
- Проекты, требующие строгого согласования проектного кода (парадигма «проектирование как код»).
- Желание управлять версиями нативного дизайна git (защита ветвей, откат и т. д.)
- Хотите использовать параллельные агенты искусственного интеллекта для автоматизации проектирования.

⚠️ **Внимательно рассмотрите**:
- Традиционная команда дизайнеров (нетехническая) → Figma может быть лучше
- Нужен предприятию SLA/support → Карандаш все еще созревает
- Сложная система дизайна с более чем 50 компонентами → Экосистема Figma стала более зрелой
- Команда не использует Cursor/VSCode → Ограниченная совместимость.

### <a name="setup"></a>Настройка

1. **Установить удлинитель карандаша**:
   - Посетите [pencil.dev](https://pencil.dev).
   - Следуйте инструкциям по установке кода Cursor/VSCode/Claude.
   - Создать учетную запись (на данный момент бесплатно)

2. **Создать первый холст**:
   ```bash
   # Open IDE, launch Pencil extension
   # Create new .pen file in your repo
   # Design on infinite canvas
   ```

3. **Рабочий процесс Git**:
   ```bash
   git add design/homepage.pen
   git commit -m "feat(design): add homepage hero section"
   git push
   ```

4. Интеграция **Claude**:
   - Claude может читать файлы .pen через MCP.
   - Подсказка: «Реализовать компонент Button из design/components.pen».
   - Claude извлекает спецификации проекта и генерирует код

### Пример приглашения

```
Read the "Hero Section" from design/homepage.pen.

Implement as React component with:
- Responsive behavior matching canvas breakpoints
- Animations from design (fade-in, slide-up)
- Copy exactly as specified in canvas
- Use Tailwind for styling

Ensure pixel-perfect match with design specs.
```

### Основатель и поддержка

**Том Крча** (генеральный директор Pencil):
- Сооснователь Adobe XD (2014–2018), 10 лет в Adobe.
- Предыдущие выходы: Alter Avatars (приобретена Google), Вокруг (приобретена Миро)
- Опыт разработки более 14 лет

**Финансирование**: a16z Speedrun (~$1 млн) + KAYA VC

**Traction**: более 1 миллиона просмотров при запуске, тысячи регистраций, включая Microsoft, Shopify и руководителей Uber.

### Примечание о погашении

**⚠️ Статус**: Запущен в январе 2026 г. (совсем недавно). Сильные ранние сигналы, но документация и экосистема все еще развиваются.

**Recommendations**:
- **Производственные проекты**: Сначала пилотная версия с 1-2 некритическими функциями
- **Новые проекты**: безопасно для команд, использующих код Cursor/Claude
- **Традиционные рабочие процессы**: Придерживайтесь Figma MCP, пока Pencil не созреет (3–6 месяцев).

**Monitor**: объявление о ценах, общедоступный репозиторий GitHub, готовая документация ожидается во втором квартале 2026 года.

---

## <a name="example-prompts"></a>Примеры подсказок

### Реализация компонента
```
Implement the "Card/Product" component from our Figma design system:
[Figma URL]

Requirements:
- Use our existing design tokens from tailwind.config.ts
- Include hover states matching Figma interactions
- Implement all variants (default, featured, compact)
- Add TypeScript types for all props
```

### Расширение системы проектирования
```
Our design team added a new "Badge" component to Figma:
[Figma URL → Badge frame]

Generate:
1. React component with all variants
2. Storybook stories
3. Unit tests for prop combinations
4. Update design system docs
```

### Проверка токена
```
Compare the color tokens in our Tailwind config against
Figma variables from: [Figma URL]

Report any mismatches and generate update script.
```

### Адаптивная реализация
```
Implement the "Hero" section from Figma with exact responsive behavior:
[Figma URL → Hero/Responsive frame]

Figma has 3 breakpoints configured. Match these precisely.
```

### Аудит доступности
```
Review the "Modal" component implementation against Figma specs:
[Figma URL]

Check:
- Focus management matches Figma's interaction flow
- Color contrast meets WCAG AA (Figma has contrast checker)
- Keyboard navigation (Figma annotations specify tab order)
```

### Проектирование контроля качества перед передачей
```
Review the "Checkout Flow" frames for implementation readiness:
[Figma URL → Checkout Flow page]

Check:
- All interactive states defined (hover, focus, disabled, error)
- Variables used consistently (no magic values)
- Auto Layout constraints are implementable
- Missing anything needed for production code?
```

### Многокомпонентная атомарная реализация
```
Implement the atomic design system components in order:

1. Atoms: [Figma URL → Atoms page]
   - Button, Input, Label, Badge

2. Molecules: [Figma URL → Molecules page]
   - FormField (Label + Input + Error)
   - SearchBar (Input + Button)

3. Organisms: [Figma URL → Organisms page]
   - LoginForm (using molecules)

Ensure each level only imports from lower levels.
```

---

## <a name="team-adoption-patterns"></a>Шаблоны внедрения в команде

### Для продуктовых дизайнеров

**Новый рабочий процесс**:
1. Дизайн в Figma с правильной структурой переменных
2. Используйте Figma Make для быстрого прототипирования
3. Экспорт в Figma Design с включенным режимом разработки.
4. Поделитесь URL-адресом файла и конкретными кадрами с командой разработчиков.
5. Claude потребляет дизайн → генерирует реализацию
6. Дизайнер просматривает вывод кода визуально (не читая код).

**Ключевая мысль**: Дизайнерам не нужно изучать код. Они проверяют реализацию путем визуального сравнения с Figma.

### Для разработчиков

**Новый рабочий процесс**:
1. Получите URL-адрес Figma от дизайнера
2. Подскажите Claude для реализации из исходного кода Figma.
3. Проверка сгенерированного кода на соответствие архитектуре
4. Запустите визуальное сравнение (Драматургическое или ручное)
5. Зафиксируйте готовый к производству компонент

**Сэкономленное время**: пропустить ручную реализацию с точностью до пикселя. Сосредоточьтесь на логике, а не на сопоставлении макетов.

### <a name="for-product-managers"></a>Для менеджеров по продукту

**Новая возможность**: запрос оценки реализации проекта на основе кадров Figma.

**Подсказка для ПМ**:
```
Review the "Dashboard Redesign" Figma file:
[Figma URL]

Estimate implementation complexity:
- How many new components needed?
- Which existing components can be reused?
- Any technical blockers?

Provide rough timeline for dev implementation.
```

Выход Claude:
```markdown
## Implementation Analysis

### Scope
- 12 frames total
- 4 new components (DataTable, MetricCard, FilterPanel, DateRangePicker)
- 8 existing components reused

### Complexity Assessment
- **Low**: MetricCard (similar to existing Card, 1-2h)
- **Medium**: FilterPanel (multi-select logic, 4-6h)
- **High**: DataTable (sorting, pagination, virtualization, 2-3 days)
- **High**: DateRangePicker (third-party library integration, 1-2 days)

### Technical Considerations
- DataTable needs backend API for server-side pagination
- DateRangePicker: evaluate date-fns vs dayjs vs native
- FilterPanel state management (local vs global)

### Estimated Timeline
- Development: 5-7 days
- Code review + QA: 2 days
- Total: 1.5-2 weeks
```

---

## Anti-patterns

| ❌ Антипаттерн | Почему это не удается | ✅ Правильный подход |
|----------------|-------------|-------------------|
| **Ручная расшифровка дизайна** | Склонен к ошибкам, отнимает много времени, дрейф неизбежен | Пусть Claude читает Figma напрямую через MCP |
| **Скриншоты как характеристики** | Нет данных токена, нет интерактивности, неоднозначность | Поделитесь URL-адресами Figma, предоставьте Claude доступ к структурированным данным |
| **Жестко запрограммированные значения** | Перерывы при обновлении дизайн-системы | Используйте токены дизайна из переменных Figma. |
| **Коды дизайнера** | Неэффективное использование дизайнерских навыков | Дизайнерские разработки → Коды Claude → Обзоры разработчиков |
| **Разработчик угадает расстояние** | Несовместимо с системой дизайна. | Claude извлекает точные значения из Figma |
| **Нет аннотаций Code Connect** | Общий вывод кода | Сделайте аннотацию один раз → Claude использует командные соглашения |
| **Пропуск визуального сравнения** | Дрейф реализации | Всегда проверяйте исходный код Figma. |
| **Несоответствие названия токена** | Переменные Figma ≠ токены кода | Установите соглашение об именах, используйте словарь стилей. |
| **Отсутствуют характеристики отзывчивости** | Разработчик угадывает точки останова | У Figma адаптивные рамки → Claude читает точные характеристики |
| **Одноуровневые токены** | Негибкий, трудно тематический | Использовать трехуровневую иерархию (base/composite/semantic) |

---

## <a name="implementation-roadmap"></a>Дорожная карта реализации

### Этап 1: Фонд (1-2 неделя)

**Goal**: Basic Figma → Claude → Конвейер кода

- [ ] Установите сервер Figma MCP
- [ ] Настройка токена личного доступа
- [ ] Тестовое соединение: Claude читает общедоступный файл Figma
- [ ] Создайте проект CLAUDE.md с использованием соглашений системы проектирования.
- [ ] Реализуйте 3-5 простых компонентов (кнопка, ввод, значок).
- [ ] Установите процесс визуального контроля качества (ручное сравнение)

**Критерии успеха**:
- Claude генерирует компонент из URL-адреса Figma
- Результат визуально соответствует дизайну
- Команда разработчиков понимает рабочий процесс

---

### Этап 2: Масштабирование (3–4 неделя)

**Goal**: Полное внедрение системы проектирования + автоматизация.

- [ ] Реализуйте более 20 компонентов из библиотеки Figma.
- [ ] Настройка автоматизации токенов (Tokens Studio + Словарь стилей)
- [ ] Создать набор для тестирования компонентов (сборник рассказов + визуальная регрессия)
- [ ] Обучите дизайнеров меняющейся гигиене
- [ ] Документировать соглашения команды в CLAUDE.md
- [ ] Провести первый аудит дрейфа системы проектирования

**Критерии успеха**:
- Более 80 % компонентов пользовательского интерфейса создаются автоматически.
- Обновления токенов распространяются автоматически
- Дизайнеры уверены в процессе передачи

---

### Этап 3: Оркестровка (неделя 5+)

**Goal**: рабочие процессы с несколькими MCP + непрерывная синхронизация

- [ ] Интегрируйте Playwright MCP для автоматического визуального тестирования.
- [ ] Настройте CI/CD для проверки четности кода дизайна.
- [ ] Создать Figma → GitHub → Производственный конвейер
- [ ] Внедрить управление системой дизайна (линтинг, аудит)
- [ ] Разрешить пользователям, не являющимся разработчиками, запускать реализации Claude (тикеты, Slack).
- [ ] Измерение показателей (TTM, уровень несогласованности, экономия времени на разработку)

**Критерии успеха**:
- Обновления дизайна → Изготовление менее чем за 1 день
- Нулевая транскрипция дизайна вручную
- Измеримое увеличение скорости команды

---

## <a name="resources"></a>Ресурсы

### Официальная документация

- **Фигма MCP Сервер**: [Фигма MCP Документация по серверу](https://developers.figma.com/docs/figma-mcp-server/)
- **Фигма Документация разработчика**: [figma.com/developers](https://www.figma.com/developers)
- **Словарь стилей**: [styledictionary.com](https://styledictionary.com/)
- Плагин **Tokens Studio**: [tokens.studio](https://tokens.studio/)

### Тематические исследования и учебные пособия

- **builder.io**: «Claude Code + Figma MCP Server: рабочий процесс AI от проектирования до кода» (январь 2026 г.)
  - [builder.io/blog/claude-code-figma-mcp-server](https://www.builder.io/blog/claude-code-figma-mcp-server)
  - Производственные показатели, примеры рабочих процессов

- **Владимир Седых**: "Мульти-MCP оркестровка с Claude Code"
  - [vladimirsiedykh.com/blog/claude-code-mcp-workflow](https://vladimirsiedykh.com/)
  - Фигма + Playwright + Линейная интеграция

- **Параллельный HQ**: «Автоматизация систем проектирования с помощью ИИ»
  - [parallelhq.com/blog/automating-design-systems-with-ai](https://parallelhq.com/)
  - Сэкономлено 75 дней, руководство по пользовательскому интерфейсу Code Connect

- **Composio**: «Как использовать Figma MCP с Claude Code»
  - [composio.dev/blog/how-to-use-figma-mcp-with-claude-code](https://composio.dev/)
  - Шаблоны иерархии токенов, руководство по настройке

### Ресурсы сообщества

- **Сообщество Figma**: Найдите стартовые шаблоны в разделе «Токены системы проектирования».
- **MCP Registry**: [mcp.run](https://mcp.run/) → Примеры серверов Figma
- **Discord**: Anthropic Discord → Канал #mcp-servers

### Связанные рабочие процессы

- [Работа с изображениями](#working-with-images-and-screenshots): анализ изображений Claude Code
- [ASCII Искусство и каркас](#wireframing-tools-for-ai-development): итерация низкокачественного дизайна
- [Драматург MCP](#playwright-browser-automation): визуальное регрессионное тестирование

---

## <a name="see-also"></a>См. также

- [Раздел Figma MCP](#figma-mcp-integration): основное руководство Раздел Figma MCP
- [examples/claude-md/product-designer.md](../../examples/claude-md/product-designer.md): шаблон Product Designer CLAUDE.md
- [../cheatsheet.md](../cheatsheet.md): краткий справочник
