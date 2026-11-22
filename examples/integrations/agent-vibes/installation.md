---
title: "Agent Vibes TTS — Полное руководство по установке"
description: "Пошаговое руководство по установке интеграции текста в речь Agent Vibes на macOS"
tags: [guide, tts, integration]
---

# Agent Vibes TTS – полное руководство по установке

**Необходимое время**: ~18 минут
**Сложность**: Средний
**System**: macOS (Apple Silicon или Intel)

---

## Проверка предварительных условий

Прежде чем начать, убедитесь, что у вас есть:

| Требование | Проверить команду | Минимальная версия |
|-------------|---------------|-------------|
| **macOS** | `sw_vers` | 10.15+ |
| **Homebrew** | `brew --version` | Любое недавнее |
| **Node.js** | `node --version` | 16.0.0+ |
| **Python** | `python3 --version` | 3.10.0+ |
| **Git** | `git --version` | Любое недавнее |

---

## Обзор установки (5 этапов)

```
Phase 1: System Dependencies     (~5 min)
    ├─ Bash 5.x
    ├─ sox, ffmpeg, util-linux
    └─ espeak-ng

Phase 2: Agent Vibes Install     (~5 min)
    ├─ Interactive installer
    ├─ Provider selection (Piper)
    ├─ Voice selection
    └─ Configuration

Phase 3: Piper TTS + Voices       (~5 min)
    ├─ Piper via pipx
    ├─ Download FR voices (4)
    └─ Download EN voices (12)

Phase 4: Configuration            (~2 min)
    ├─ Set provider: piper
    ├─ Set voice: fr_FR-tom-medium
    └─ Test audio

Phase 5: Verification             (~1 min)
    ├─ Test in Claude Code
    └─ Verify hooks active
```

---

## Этап 1: Системные зависимости

### Шаг 1.1: Установите bash 5.x

Для Agent Vibes требуется Bash 5.x (macOS поставляется с версией 3.2).

```bash
# Install Bash 5.x
brew install bash

# Verify installation
/opt/homebrew/bin/bash --version
# Expected: GNU bash, version 5.x
```

**Why**: сценарии Agent Vibes используют функции Bash 5.x (ассоциативные массивы и т. д.).

### Шаг 1.2. Установите аудиоинструменты

```bash
# Install audio processing tools
brew install sox ffmpeg util-linux

# Verify sox
sox --version

# Verify ffmpeg
ffmpeg -version

# Verify flock (from util-linux)
/opt/homebrew/opt/util-linux/bin/flock --version
```

**Note**: `util-linux` предназначен только для бочонков (без символической ссылки), но Agent Vibes находит его автоматически.

### Шаг 1.3. Установите espeak-ng (зависимость Piper)

```bash
# Install espeak-ng
brew install espeak-ng

# Verify installation
espeak-ng --version
```

**Почему**: Piper TTS требуется библиотека `libespeak-ng` для обработки фонем.

### Контрольная точка 1: Установлены зависимости ✅

```bash
# Verify all dependencies
command -v /opt/homebrew/bin/bash && \
command -v sox && \
command -v ffmpeg && \
command -v espeak-ng && \
echo "✅ All dependencies installed"
```

---

## Этап 2. Установка Agent Vibes

### Шаг 2.1. Запустите интерактивный установщик.

```bash
# Navigate to your Claude Code project
cd /path/to/your/project

# Launch installer (interactive, 4 pages)
npx agentvibes install
```

**Expected**: художественный баннер ASCII + экран приветствия

### Шаг 2.2. Перейдите по страницам установки.

**Страница 1/4: Системные зависимости**
- Просмотр обнаруженных зависимостей
- Все должно показывать `✓` (зеленая галочка)
- Нажмите **«Далее →»**

**Страница 2/4: Выбор поставщика**
- Опции: `macOS Say`, `Piper TTS`, `Termux SSH`
- **Select**: `Piper TTS` (лучшее качество, оффлайн)
- Нажмите **«Далее →»**

**Страница 3/4: Выбор голоса**
- **Для французского языка**: выберите `fr_FR-tom-medium` (мужской) или `fr_FR-siwis-medium` (женский)
- **Для английского языка**: выберите `en_US-ryan-high` (наилучшее качество).
- Нажмите **«Далее →»**

**Страница 4/4: Настройки звука**
- **Reverb**: выберите `Light` (рекомендуется)
- **Фоновая музыка**: выберите `Disabled` (не отвлекайтесь)
- **Verbosity**: выберите `Low` (меньше болтливости)
- Нажмите **«Начать установку»**.

### Шаг 2.3: Ход установки

Агент Vibes установит:
- 34 слэш-команды
- Скрипты TTS (40 bash-скриптов)
- Шаблоны личности
- 16 фоновых музыкальных треков
- 7 конфигурационных файлов

**Ожидаемый результат**:
```
✔ Installed 34 slash commands!
✔ Installed TTS scripts!
✔ Installed personality templates!
✔ Installed 16 background music tracks!
✔ Installed 7 config files!

✅ AgentVibes is Ready!
```

### Контрольная точка 2: Установлен агент Vibes ✅

```bash
# Verify installation
ls -la .claude/hooks/play-tts.sh
ls -la .claude/commands/agent-vibes/
ls -la .claude/audio/tracks/

# Check provider config
cat .claude/tts-provider.txt
# Expected: "macos" or "piper"
```

---

## Этап 3: Piper TTS + голосовые модели

### Шаг 3.1. Установите Piper TTS через pipx

Если вы выбрали поставщика Piper, агент Vibes попытается его установить. Если не получается, установка вручную:

```bash
# Install Piper via pipx (Python package manager)
pipx install piper-tts

# Verify installation
piper --help
```

**Распространенная проблема**: Предварительно скомпилированный двоичный файл завершается с ошибкой `libespeak-ng.1.dylib`.

**Решение**: `pipx install piper-tts` работает надежно (версия Python, а не двоичная версия).

### Шаг 3.2. Загрузите французские голоса

```bash
# Navigate to voice storage
cd ~/.claude/piper-voices

# Download 4 French voice models
curl -L -o fr_FR-tom-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx"
curl -L -o fr_FR-tom-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx.json"

curl -L -o fr_FR-siwis-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx"
curl -L -o fr_FR-siwis-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json"

curl -L -o fr_FR-upmc-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx"
curl -L -o fr_FR-upmc-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx.json"

curl -L -o fr_FR-mls-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/mls/medium/fr_FR-mls-medium.onnx"
curl -L -o fr_FR-mls-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/mls/medium/fr_FR-mls-medium.onnx.json"
```

**Size**: ~60–73 МБ на голос (4 голоса = всего ~260 МБ)

### Шаг 3.3. Загрузите английские голоса (необязательно)

Агент Vibes автоматически загружает 12 английских голосов во время установки. Проверять:

```bash
ls ~/.claude/piper-voices/en_US-*.onnx
```

**Expected**: 12 файлов (Райан, Эми, Лессак, Брайс и т. д.)

### Контрольная точка 3: Голоса загружены ✅

```bash
# Count voices
ls ~/.claude/piper-voices/*.onnx | wc -l
# Expected: 15+ files (12 EN + 4 FR minimum)

# Test French voice manually
echo "Bonjour, je suis Claude et je parle français" | \
  piper -m ~/.claude/piper-voices/fr_FR-tom-medium.onnx \
  --output-file /tmp/test-fr.wav && afplay /tmp/test-fr.wav
```

---

## Этап 4: Настройка

### Шаг 4.1. Установите Piper в качестве поставщика

```bash
# Switch to Piper TTS (if not already set)
echo "piper" > .claude/tts-provider.txt

# Verify
cat .claude/tts-provider.txt
# Expected: "piper"
```

### Шаг 4.2: Установите французский мужской голос

```bash
# Set default voice
echo "fr_FR-tom-medium" > .claude/tts-voice.txt

# Verify
cat .claude/tts-voice.txt
# Expected: "fr_FR-tom-medium"
```

### Шаг 4.3. Тестирование генерации звука

```bash
# Test TTS pipeline manually
~/.claude/hooks/play-tts.sh "Ceci est un test audio"
```

**Expected**: Звук воспроизводится французским мужским голосом.

**Устранение неполадок**: Если нет звука, см. [Руководство по устранению неполадок](./troubleshooting.md#issue-1-no-audio-output).

### Контрольная точка 4: Настройка завершена ✅

```bash
# Verify config files
test -f .claude/tts-provider.txt && \
test -f .claude/tts-voice.txt && \
test -f .claude/hooks/play-tts.sh && \
echo "✅ Configuration complete"
```

---

## Этап 5: Проверка в Claude Code

### Шаг 5.1: Запустите Claude Code

```bash
# Start Claude Code session
claude
```

### Шаг 5.2. Проверка команд TTS

```bash
# In Claude, run:
/agent-vibes:whoami
# Expected: Shows current voice and provider

/agent-vibes:list
# Expected: Lists all 15+ voices

# Test TTS with simple request
> "Dis-moi bonjour en français"
# Expected: Audio response in French
```

### Шаг 5.3: Убедитесь, что перехватчики активны

```bash
# Exit Claude, check hook was triggered
ls -la /tmp/tts-*.wav
# Expected: Temporary audio files

# Check last played audio
ls -la ~/.claude/tts-last-played.wav
# Expected: File exists
```

### Контрольная точка 5: Проверка завершена ✅

```bash
# Final verification
cat .claude/tts-provider.txt && \
cat .claude/tts-voice.txt && \
piper --help > /dev/null 2>&1 && \
ls ~/.claude/piper-voices/*.onnx | wc -l && \
echo "✅ Installation successful!"
```

---

## Конфигурация после установки

### Уменьшить многословие (рекомендуется)

```bash
# In Claude Code
/agent-vibes:verbosity low
```

**Why**: уменьшает частоту звукового повествования, меньше отвлекает.

### Скрыть 34 команды (необязательно)

```bash
# In Claude Code
/agent-vibes:hide
```

**Why**: Упорядочивает палитру команд. Используйте `/agent-vibes:show`, чтобы отобразить.

### Отключить фоновую музыку

```bash
# In Claude Code
/agent-vibes:background-music off
```

**Почему**: Фоновая музыка может отвлекать во время сосредоточенной работы.

### Отключить звук проекта (необязательно)

```bash
# Mute TTS for this project only
touch .claude/agentvibes-muted
```

**Why**: Некоторым проектам не требуется аудио (например, репозитории только для документации).

---

## Тесты производительности

**System**: MacBook Pro M1, 16 ГБ ОЗУ, macOS Sequoia 24.6.0

| Метрика | Пайпер Медиум | Пайпер Хай | macOS Скажи |
|--------|--------------|------------|-----------|
| **Audio Generation** | ~200 мс | ~400 мс | Мгновенный |
| **Общая задержка** | ~280 мс | ~480 мс | ~50 мс |
| Использование **RAM** | ~50 МБ | ~70 МБ | ~10 МБ |
| **CPU Burst** | 80% (200 мс) | 90% (400 мс) | 5% (50 мс) |
| **Качество голоса** | ⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️ |
| **Не в сети** | ✅ | ✅ | ✅ |

**Рекомендация**: Piper Medium = лучший компромисс для quality/speed.

---

## Использование диска

| Компонент | Размер | Расположение |
|-----------|------|----------|
| **Пайпер TTS** | ~5 МБ | `~/.local/pipx/venvs/piper-tts/` |
| **Модели голоса** | ~1 ГБ | `~/.claude/piper-voices/` (15 голосов × 60 МБ) |
| **Фоновая музыка** | ~300 МБ | `.claude/audio/tracks/` (16 треков) |
| **Скрипты** | ~2 МБ | `.claude/hooks/` (40 bash-скриптов) |
| **Итого** | **~1.3GB** | - |

**Совет по очистке**: Удалите неиспользуемые голоса, чтобы сэкономить место.

---

## Инструкции по удалению

### Автоматическое удаление

```bash
# Uninstall Agent Vibes completely
npx agentvibes uninstall --yes
```

### Ручная очистка

```bash
# Remove Agent Vibes files
rm -rf .claude/hooks/*vibes*
rm -rf .claude/commands/agent-vibes/
rm -rf .claude/audio/

# Remove Piper TTS
pipx uninstall piper-tts

# Remove voice models
rm -rf ~/.claude/piper-voices/

# Remove config files
rm .claude/tts-provider.txt
rm .claude/tts-voice.txt
rm .claude/agentvibes-muted 2>/dev/null
rm ~/.agentvibes-muted 2>/dev/null
```

---

## Распространенные проблемы при установке

### Проблема 1: `libespeak-ng.1.dylib` не найден.

**Symptom**:
```
dyld[xxx]: Library not loaded: @rpath/libespeak-ng.1.dylib
```

**Solution**:
```bash
# Install espeak-ng
brew install espeak-ng

# Reinstall Piper via pipx (not binary)
pipx uninstall piper-tts
pipx install piper-tts
```

### Проблема 2: предупреждение `flock` (дополнительный инструмент)

**Symptom**:
```
⚠ flock - TTS queue locking
```

**Impact**: Незначительное. TTS работает без `flock`, может конфликтовать со звуком при быстрых сообщениях.

**Решение** (необязательно):
```bash
# flock is in util-linux, already installed
# Add to PATH if needed
export PATH="/opt/homebrew/opt/util-linux/bin:$PATH"
```

### Проблема 3. Программа установки агента Vibes завершает работу.

**Symptom**:
```
ExitPromptError: User force closed the prompt
```

**Cause**: интерактивный установщик требует ввода данных пользователем (не может быть автоматизирован).

**Решение**: Запустите `npx agentvibes install` в интерактивном терминале (не через скрипт).

### Проблема 4. Нет звука после установки.

**Diagnostic**:
```bash
# 1. Check mute status
ls .claude/agentvibes-muted ~/.agentvibes-muted

# 2. Check provider
cat .claude/tts-provider.txt

# 3. Test Piper manually
echo "Test" | piper -m ~/.claude/piper-voices/fr_FR-tom-medium.onnx \
  --output-file /tmp/test.wav && afplay /tmp/test.wav
```

**Решения**: См. [Руководство по устранению неполадок](./troubleshooting.md).

---

## Следующие шаги

После установки:

1. **[Каталог голосов](./voice-catalog.md)** — Изучите 15 голосов и выберите свой любимый
2. **[README](./README.md)** — Изучите основные команды и примеры использования.
3. **[Устранение неполадок](./troubleshooting.md)** — решение распространенных проблем
4. **[AI Ecosystem](../../../guide/ecosystem/ai-ecosystem.md#5-voice-to-text-tools-wispr-flow-superwhisper)** — TTS в более широком контексте ИИ

---

## <a name="resources"></a>Ресурсы

- **Агент Vibes GitHub**: https://github.com/paulpreibisch/AgentVibes
- **Репозиторий голосов Piper**: https://huggingface.co/rhasspy/piper-voices
- **Образцы голоса Пайпер**: https://rhasspy.github.io/piper-samples/
- **Веб-сайт Agent Vibes**: https://agentvibes.org

---

*Руководство по установке поддерживается [Claude Code Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)*
*Последнее обновление: 22 января 2026 г. | Протестировано на: macOS Sequoia 24.6.0 (Apple Silicon)*
