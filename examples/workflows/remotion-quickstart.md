---
title: "Удаление + Claude Code Краткое руководство"
description: "15-минутное краткое руководство по созданию программных видеороликов с помощью Remotion и Claude Code."
tags: [tutorial, workflow, integration]
---

# Краткое руководство по удалению + Claude Code

**Objectif**: Создайте свою премьеру программного видео с Remotion и Claude Code за 15 минут.

**Niveau**: Débutant React (достаточные базовые знания)

---

## ⚡ Предварительные условия

| Реквизит | Минимальная версия | Проверка |
|--------|-----------------|--------------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 8+ | `npm --version` |
| **Claude Code** | 2.1+ | `claude --version` |
| **Основы React** | Синтаксис JSX | Connaître `<div>`, `props`, `useState` |

**Ориентировочное время**: 15–20 минут (первая премьера)

---

## 📦 Этап 1: Установка навыков Remotion

### Вариант А: через skills.sh (рекомендуется)

```bash
# Dans un nouveau dossier de projet
mkdir my-remotion-test && cd my-remotion-test

# Installer les skills Remotion pour Claude Code
npx skills add remotion-dev/skills
```

**Результат посещения**:
```
✓ Skills added to .claude/skills/
  - remotion-best-practices
  - remotion-animations
  - remotion-audio
  [... 20+ skills installés]
```

### Вариант B: Ручной (незаменим для skills.sh)

```bash
# Cloner le repo skills directement
git clone https://github.com/remotion-dev/skills.git .claude/skills/remotion
```

---

## 🎬 Этап 2: Создайте свой премьерный проект Remotion

### Через Claude Code (рекомендуемый метод)

Lancez Claude Code и используйте эту подсказку:

```
Create a new Remotion project for a simple 5-second video with:
- A fade-in title "Hello Remotion"
- Background gradient (blue to purple)
- Smooth animation

Use npx create-video to scaffold the project.
```

**То, что Claude соответствует**:
1. Исполнитель `npx create-video@latest my-video`
2. Создание шаблонного удаления
3. Создайте композицию React для вашего видео
4. Конфигуратор `remotion.config.ts`

### Результат посещения

```
my-remotion-test/
├── src/
│   ├── Root.tsx           # Entry point
│   ├── HelloWorld.tsx     # Votre composition vidéo
│   └── ...
├── public/
├── package.json
└── remotion.config.ts
```

---

## 🖼️Этап 3: Предварительный просмотр вашего видео

### Lancer Le Studio Remotion

```bash
npm start
```

**Результат**: Локальный сервер для `http://localhost:3000`

**Интерфейс Studio**:
- Интерактивная временная шкала (просматривайте кадры)
- Предварительный просмотр вашей композиции в реальном времени
- Элементы управления воспроизведением
- Панель реквизита (модификатор параметров во временном ролике)

### Тестер модификаций файлов

В `src/HelloWorld.tsx` измените текст:

```tsx
<h1 style={{fontSize: 100}}>Hello Remotion!</h1>
```

**Горячая перезагрузка** → Изменения видны сразу в студии.

---

## 📹 Этап 4: Показать ваше видео

### Командование базы

```bash
npm run build
```

**То, что прошло**:
1. Remotion скомпилирует ваш код React
2. Общий кадр Chaque (30 кадров в секунду × продолжительность = 150 кадров за 5 секунд)
3. FFmpeg кодирует файлы в MP4
4. Вылазка: `out/video.mp4`

### Варианты раннего перехода

```bash
# Haute qualité (1080p, 60fps)
npx remotion render src/index.ts HelloWorld out/video.mp4 \
  --width 1920 \
  --height 1080 \
  --fps 60

# Format GIF
npx remotion render src/index.ts HelloWorld out/video.gif \
  --image-format png
```

---

## 🤖 Этап 5: Идет с Claude Code

### Подсказки эффективности

**Пример 1: Добавление анимации**
```
Add a smooth scale animation to the title:
- Start at scale 0.8
- End at scale 1.0
- Use spring physics with config {damping: 20}
```

**Пример 2: Звуковое сопровождение**
```
Add background music to the video:
- Use a public domain track from /public/music.mp3
- Fade in over 1 second
- Volume at 0.5
```

**Пример 3: Последовательности, кратные**
```
Create a 3-scene video:
1. Intro (0-2s): Logo fade in
2. Main (2-8s): Product showcase with transitions
3. Outro (8-10s): Call to action text
```

### Эффективность шаблона Claude Code

```
1. Describe what you want (natural language)
   └─ Claude génère le JSX + animations

2. Preview in Studio
   └─ Vérifier visuellement

3. Iterate with specific feedback
   └─ "Make the transition slower"
   └─ "Change color to #FF6B35"

4. Render final video
   └─ npm run build
```

---

## 🐛 Устранение неполадок

### Проблема: «Команда не найдена: удаление»

**Solution**:
```bash
# Installer globalement
npm install -g @remotion/cli

# Ou utiliser npx
npx remotion --version
```

### Проблема: «React не определен».

**Решение**: Проверка `react` и `react-dom` в `package.json`:
```bash
npm install react react-dom
```

### Проблема: ошибка FFmpeg при возврате

**Решение**: Установщик FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
choco install ffmpeg
```

### Проблема: Claude создал код, который не компилируется.

**Cause**: Исправление навыков без взимания платы.

**Solution**:
```bash
# Vérifier que .claude/skills/ existe
ls -la .claude/skills/remotion

# Re-sourcer les skills
claude --reload-skills
```

### Проблема: видео отображается в черном экране.

**Debug**:
1. Проверка консоли Studio (F12)
2. Избавьтесь от ошибок TypeScript
3. Проверка `<Composition>` на хорошие реквизиты:
   ```tsx
   <Composition
     id="HelloWorld"
     component={HelloWorld}
     durationInFrames={150}  // 5s × 30fps
     fps={30}
     width={1920}
     height={1080}
   />
   ```

---

## 📊 Показатели успеха

После краткого руководства вам следует подготовиться:

- ✅ Функция Projet Remotion (строительная структура)
- ✅ Видео теста (MP4 в формате `out/`)
- ✅ Освоить рабочий процесс Claude → Предварительный просмотр → Рендеринг
- ✅ Создание 1-2 анимаций по подсказкам Claude

**Типичная скорость прослушивания** (видео 5 с, 1080p):
- MacBook Pro M1: ~10–15 секунд
- Intel i5: ~30–45 секунд
- Облако (GitHub Actions): ~60–90 секунд.

---

## 🎯 Этапы прошенов

### Ниво промежуточный

1. **Информация об активах**:
   ```
   Claude, import an image from /public/logo.png and animate it rotating 360°
   ```

2. **Видео на основе данных**:
   ```tsx
   // Générer 100 vidéos à partir d'un dataset
   const data = [{name: "John", score: 95}, ...];
   npx remotion render --props='{"data": data}'
   ```

3. **Композиции комплексные**:
   ```
   Create a video with 3 scenes using <Sequence>:
   - Scene 1: Intro (0-30 frames)
   - Scene 2: Content (30-150 frames)
   - Scene 3: Outro (150-180 frames)
   ```

### Ресурсы

| Ресурс | URL-адрес | Тип |
|-----------|-----|------|
| **Remotion Docs** | [remotion.dev/docs](https://www.remotion.dev/docs/) | Официальная документация |
| **Репозиторий навыков агента** | [github.com/remotion-dev/skills](https://github.com/remotion-dev/skills) | GitHub |
| **Сообщество Discord** | [remotion.dev/discord](https://www.remotion.dev/discord) | Поддержка сообщества (~ 1,5 тыс. участников) |
| **Галерея примеров** | [remotion.dev/showcase](https://www.remotion.dev/showcase) | Вдохновение |

---

## 💡 Валидные сертификаты использования

| Вариант использования | Пример | Сложный |
|----------|---------|------------|
| **Демоверсии продукта** | Обзор функций и основные моменты | ⭐⭐ |
| **Вступления на YouTube** | Анимированный логотип + титульная карточка | ⭐ |
| **Данные** | Анимированные графики, инфографика | ⭐⭐⭐ |
| **Социальные сети** | Истории Instagram, шаблоны TikTok | ⭐⭐ |
| **Объясняющие видео** | Пошаговые уроки аниме | ⭐⭐⭐⭐ |

**Истории успеха**: Icon.me (5 млн долларов США), Submagic (8 млн долларов США), Crayo ($500K/mois)

---

## ⚠️ Важные ограничения

1. **Требуются знания React**: Claude помощник, лучший помощник JSX = необходимый для отладки
2. **Courbe d'apprentissage**: Премьерные видео = 2–4 часа. Maîtrise = 2-4 семейна
3. **Coûts**: Коммерческая лицензия (>3 человека) + Claude API + вычислительная заливка рендеринга
4. **Pas un remplacant After Effects**: другая парадигма (код и временная шкала)

---

## 🎓 Пример завершения сеанса

```bash
# 1. Setup
mkdir remotion-demo && cd remotion-demo
npx skills add remotion-dev/skills

# 2. Claude Code prompt
claude

> Create a 10-second countdown timer video:
> - Large numbers (1-10) centered
> - Each number appears for 1 second
> - Use spring animations for each transition
> - Background gradient that changes color per number
> - Add a "beep" sound effect on each number change

# Claude génère le code...

# 3. Preview
npm start
# Ouvrir http://localhost:3000

# 4. Ajustements
> Make the spring animation bouncier (increase damping to 40)
> Change gradient colors to warm tones (orange to red)

# 5. Render final
npm run build

# Résultat: out/video.mp4 (10 secondes, 300 frames)
```

**Продолжительность всего сеанса**: ~25 минут (включая итерации)

---

## 📝 Контрольный список перед производством

- [ ] Tester le rendu Complete (предварительный просмотр просто)
- [ ] Проверка выступлений (режим просмотра и производство)
- [ ] Проверка активов (лицензии, разрешение, форматы)
- [ ] Предварительные способы рендеринга (облако или локально)
- [ ] Documenter les props dynamicques (для сценариев использования на основе данных)
- [ ] Настройка CI/CD при автоматической генерации (GitHub Actions + Remotion Lambda)

---

## 📚 Дополнительные ресурсы

### 🎯 Топ-3 основных продукта (начните здесь)

| Ресурс | Тип | URL-адрес | Пуркуа |
|-----------|------|-----|----------|
| **Официальные ресурсы** | Хаб центральный | [remotion.dev/docs/resources](https://www.remotion.dev/docs/resources) | Более 50 шаблонов, интеграций, эффектов |
| **Обучение Fireship** | Видео (8 минут) | [Это видео было сделано с кодом](https://www.youtube.com/watch?v=deg8bOoziaE) | Введение сверхбыстрое, более 1 млн вариантов |
| **Сообщество Discord** | Поддержка в прямом эфире | [Remotion Discord](https://discord.com/servers/remotion-809501355504959528) | 5,6 тыс.+ участников, интегрированный бот с искусственным интеллектом |

### 📖 Рекомендуемые учебные пособия

| Статья | Ниво | URL-адрес | Специализированный |
|---------|--------|-----|-----------|
| **ClipCat: Руководство для начинающих** | Дебютант | [Создание видео программным способом](https://www.clipcat.com/blog/create-videos-programmatically-using-react-a-beginners-guide-to-remotion/) | Проверка установки |
| **Призматическое руководство** | Дебютант | [Научитесь создавать видео](https://prismic.io/blog/create-videos-with-code-remotion-tutorial) | Фондаменто комплекты |
| **SitePoint Введение** | Промежуточный | [Руководство по удаленному управлению](https://www.sitepoint.com/remotion-create-animated-videos-using-html-css-react/) | Извлечение данных, компоновка |

### 🎥 Видеоуроки для целей

**Ускоренное ускорение** (15 мин):
- [Fireship - Это видео было сделано с кодом](https://www.youtube.com/watch?v=deg8bOoziaE) (8:41, 1M видео)

**Подготовка к профессиональному обучению** (1-2 часа):
- [CoderOne — создание видео с помощью React](https://www.youtube.com/watch?v=VOX98RoITMk) (1 час, пример полного анимации логотипа)

**Интеграция Claude Code** (30 мин):
- [Snapper AI — создание анимированных видеороликов](https://www.youtube.com/watch?v=EwKCAgt4aKI) (9:48, январь 2026 г.)
- [chantastic – создание рекламных видеороликов](https://www.youtube.com/watch?v=z87bczUZ0uo) (30 минут, январь 2026 г.)

### 🛠️ Шаблоны и примеры

| Шаблон | Использование | залоговое удержание | Комплексите |
|----------|-------|------|-----------|
| **Привет, мир** | Премьер проект | [Официальные шаблоны](https://www.remotion.dev/templates/) | ⭐ Простой |
| **Аудиограмма** | Подкаст, а именно | [Официальные шаблоны](https://www.remotion.dev/templates/) | ⭐⭐ Мойен |
| **GitHub Развернутый** | Кас продюсер | [github.com/remotion-dev/github-unwrapped](https://github.com/remotion-dev/github-unwrapped) | ⭐⭐⭐ Авансе |

**Страница завершена**: [remotion.dev/docs/resources](https://www.remotion.dev/docs/resources) (более 50 шаблонов в меню)

### 🏆 Истории успеха (вдохновение)

Катушки продуктов, созданные с учетом Remotion:

- **Icon.me**: годовая доходность 5 миллионов долларов за 30 дней (создатель объявлений)
- **Revid.ai**: годовая доходность 1 миллион долларов за 15 месяцев (видео в формате IA)
- **Типфреймы**: После приобретения (видеопрезентация продукта)

[Просмотреть все витрины](https://www.remotion.dev/showcase)

### 💬 Où Загадка вопросов

| Платформа | URL-адрес | Лучшая заливка | Активность |
|------------|-----|---------------|----------|
| **Discord** | [Remotion Discord](https://discord.com/servers/remotion-809501355504959528) | Поддержка Rapide, бот AI | ⭐⭐⭐⭐⭐ Трес élevée |
| **GitHub Обсуждения** | [remotion-dev/discussions](https://github.com/orgs/remotion-dev/discussions) | Архитектурные вопросы | ⭐⭐⭐ Модере |
| **Переполнение стека** | [#remotion tag](https://stackoverflow.com/questions/tagged/remotion) | Особые проблемы | ⭐⭐ Файбл |

**Tip**: В Discord пометьте бот CrawlChat AI для мгновенных ответов с исходными документами.

### 🚀 Новые ресурсы

**Производительность и оптимизация**:
- [Официальная документация по производительности](https://www.remotion.dev/docs/performance)
- [YouTube: Оптимизация Remotion Lambda](https://www.youtube.com/results?search_query=optimizing+remotion+lambda+jonny+burger) (Джонни Бургер, 17 мин)

**Навыки агента и IA**:
- [Официальная документация по навыкам ИИ](https://www.remotion.dev/docs/ai/skills)
- [AIbase Article](https://news.aibase.com/news/24827) (январь 2026 г., последняя версия)

**Déploiement**:
- [Железнодорожный шаблон](https://railway.com/deploy/remotion-on-rails) (развертывание в один клик)
- [Lambda Docs](https://www.remotion.dev/docs/lambda) (бессерверный рендеринг AWS)

### 📊 Утилита для пакетов

| Пакет | Использование | Установка |
|--------|-------|--------------|
| `@remotion/shapes` | Формы SVG (треугольники, звезды) | `npm i @remotion/shapes` |
| `remotion-transition-series` | Переходы между сценами | `npm i remotion-transition-series` |
| `remotion-subtitle` | Автоматы для су-титров | `npm i remotion-subtitle` |
| `@remotion/tailwind` | Интеграция Tailwind CSS | `npm i @remotion/tailwind` |

[Полный список на странице ресурсов](https://www.remotion.dev/docs/resources)

---

## 🎓 Маршрут Apprentissage Suggéré

### Семен 1: Фондаменто (6-8 часов)
1. Официальные документы (2 часа)
2. Учебное пособие по Regarder Fireship (15 минут)
3. Руководство Faire ClipCat – создание Hello World (2 часа)
4. Воспроизведение примера CoderOne (2-3 часа)
5. Жоандр Дискорд, проблемные вопросы

### Семен 2: Пратика (8-10 часов)
1. Создайте 3 разных видео (заставки, обратный отсчет, визуализация данных)
2. Explorer GitHub Развернутый исходный код
3. Интеграция тестера Claude Code (навыки агента)
4. Эксперимент с пакетами (@remotion/shapes, переходы)

### Семен 3: Производство (в процессе)
1. Создание проекта для конкретного случая использования
2. Производительность оптимизатора (Lambda si nécessaire)
3. Настройка CI/CD (GitHub Actions)
4. Участие в Discord для обратной связи

---

**Créé**: 2026-01-23
**Доступно**: 24 января 2026 г. (о ресурсах)
**Протестируйте**: Claude Code 2.1.17, Remotion 4.x, Node.js 20.x
**Durée moyenne**: 15–20 минут (премьерное видео), 5–10 минут (последующие)
**Проверенные ресурсы**: 24 января 2026 г. (Perplexity Pro, более 50 источников)
