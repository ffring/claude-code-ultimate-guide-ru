---
title: "Генерация динамических изображений OG с помощью Astro"
description: "Создавайте изображения для предварительного просмотра в социальных сетях во время сборки с помощью Astro, чтобы общие ссылки отображали текущую статистику, а не устаревший статический PNG."
---

# Генерация динамических изображений OG с помощью Astro

Автоматически создавайте изображения для предварительного просмотра в социальных сетях во время сборки вместо сохранения устаревших статических PNG-файлов. Каждая публикация в Twitter/X, LinkedIn или Slack будет отображать точную и актуальную статистику.

## Зачем беспокоиться

Статические изображения OG устаревают. В тот день, когда вы добавите свой 200-й шаблон или наберете 1 тысячу звезд GitHub, ваш предварительный просмотр в социальных сетях по-прежнему будет показывать старые цифры. Динамическая генерация решает эту проблему один раз и остается точной навсегда.

В приведенном ниже шаблоне используется Satori (Vercel) для рендеринга React-подобного дерева в SVG, а затем resvg для преобразования в PNG. Он запускается во время сборки в Astro, с нулевыми затратами во время выполнения и без внешнего обслуживания.

См. также: [PDF Generation](pdf-generation.md) для другого рабочего процесса создания во время сборки (Quarto/Typst).

## Куча

| Упаковка | Роль |
|---------|------|
| `satori` | Рендерит JSX-подобное дерево объектов в SVG. |
| `@resvg/resvg-js` | Конвертирует SVG в PNG (Rust, быстро) |
| `@fontsource/inter` | Локальные файлы шрифтов (требуется формат woff1) |

## <a name="setup"></a>Настройка

```bash
pnpm add satori @resvg/resvg-js @fontsource/inter
```

Создайте файл по адресу `src/pages/og-image.png.ts`. Astro автоматически подает его по адресу `/og-image.png`.

Ссылка на него из вашего макета:

```html
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:image" content="/og-image.png" />
```

Смотрите готовый шаблон: [`examples/scripts/og-image-astro.ts`](../../examples/scripts/og-image-astro.ts).

## <a name="the-pattern"></a>Узор

```typescript
import type { APIRoute } from 'astro'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const GET: APIRoute = () => {
  const fontData = readFileSync(
    resolve(__dirname, '../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff')
  ).buffer as ArrayBuffer

  const svg = satori(
    { type: 'div', props: { style: { /* ... */ }, children: [ /* ... */ ] } },
    { width: 1200, height: 630, fonts: [{ name: 'Inter', data: fontData }] }
  )

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()

  return new Response(png.buffer as ArrayBuffer, {
    headers: { 'Content-Type': 'image/png' },
  })
}
```

## Динамическая статистика по контенту

Подсчитайте файлы контента во время сборки вместо жесткого кодирования:

```typescript
function countQuestions(): number {
  const dir = resolve(__dirname, '../content/questions')
  let total = 0
  for (const cat of readdirSync(dir, { withFileTypes: true })) {
    if (cat.isDirectory()) {
      total += readdirSync(resolve(dir, cat.name))
        .filter(f => f.endsWith('.md')).length
    }
  }
  return total
}
```

Статистика, которую вы можете подсчитать автоматически:
- Файлы Markdown в каталоге контента (вопросы, статьи, документы)
- Записи YAML в файле данных
- Количество строк в большом документе

Статистика, которую необходимо сохранить в жестком коде (обновляется вручную):
- Звезды GitHub (динамические, используйте `1.1k+` в качестве консервативной метки)
- Шаблоны из другого репозитория
- Тесты производительности

## Ошибки

### Формат шрифта имеет значение

Для Сатори требуется **woff1** или **TTF**. Он автоматически завершится сбоем или выдаст ошибку с woff2 или удаленными URL-адресами CDN, которые перенаправляются на HTML.

```typescript
// Correct — local woff1 from @fontsource
readFileSync('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff')

// Fails — woff2 not supported by resvg
readFileSync('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2')

// Fails — CDN may return HTML (redirects, auth walls)
await fetch('https://fonts.gstatic.com/s/inter/...')
```

### Статические файлы дублируют маршруты API

Сервер Astro dev обслуживает статические файлы по маршрутам `public/` **before** API. Если у вас есть `public/og-image.png`, он всегда будет обслуживаться вместо вашей динамической конечной точки.

**Удалить:**
```bash
rm public/og-image.png
```

Также проверьте корень проекта и файлы `dist/`: там также могут скрывать маршрут. Диагностика с помощью `curl -I http://localhost:4321/og-image.png`: если ответ имеет заголовок `Last-Modified`, вы обращаетесь к статическому файлу, а не к маршруту API.

### Кэш браузера

После удаления статического файла выполните принудительное обновление (`Cmd+Shift+R`) или проверьте новое окно в режиме инкогнито. Возможно, браузер агрессивно кэшировал старый PNG.

### `satori` синхронен в новых версиях

Некоторые версии сатори возвращают `Promise<string>`, другие — `string`. Если у вас есть PNG `[object Promise]`, добавьте `await`:

```typescript
const svg = await satori(tree, options)
```

## Тестирование

**Локальный предварительный просмотр**: посетите прямо в браузере:
```
http://localhost:4321/og-image.png
```

**Симулятор предварительного просмотра социальных сетей**: вставьте URL-адрес продукта в:
- [opengraph.xyz](https://www.opengraph.xyz): универсальный отладчик OG.
- LinkedIn Post Inspector (`linkedin.com/post-inspector/`): принудительное обновление кэша для LinkedIn.
- Валидатор Twitter-карт (`cards-dev.twitter.com/validator`)

**CI check**: если вы хотите отследить регрессии, вы можете добавить шаг сборки, который проверяет, превышает ли размер сгенерированного файла PNG пороговое значение:

```bash
# In CI after pnpm build
SIZE=$(wc -c < dist/og-image.png)
if [ "$SIZE" -lt 10000 ]; then
  echo "og-image.png looks too small ($SIZE bytes) — generation may have failed"
  exit 1
fi
```

## Варианты

### Персональный брендинг (без сетки статистики)

```typescript
children: [
  { type: 'span', props: { style: { fontSize: '48px', color: '#c0522a' }, children: 'FB.' } },
  { type: 'span', props: { style: { fontSize: '80px', fontWeight: 800, color: '#f5f5f5' }, children: 'Your Name' } },
  { type: 'span', props: { style: { fontSize: '24px', color: '#8b949e' }, children: 'Your tagline here' } },
]
```

### Значки списка проектов

```typescript
['project-a.com', 'project-b.com', 'project-c.com'].map(label => ({
  type: 'div',
  props: {
    style: { background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '8px 16px' },
    children: [{ type: 'span', props: { style: { color: '#c0522a' }, children: label } }],
  },
}))
```

### Значок в виде терминала (для инструментов CLI)

```typescript
{
  type: 'div',
  props: {
    style: { background: '#21262d', border: '1px solid #30363d', borderRadius: '20px', padding: '6px 16px', color: '#3fb950', fontFamily: 'monospace' },
    children: '>_ your-cli-tool',
  },
}
```

## Синхронизация статистики

Поддерживайте единый источник истины. Когда вы обновляете статистику в образе OG, обновляйте ее повсюду (значки целевой страницы, README и т. д.) в одном коммите.

Для проектов с несколькими целевыми площадками создайте команду `/update-stats-image-landings`, которая будет проходить по каждому репозиторию и предлагать вам проверить каждую статистику. Это предотвращает дрейф между сайтами.
