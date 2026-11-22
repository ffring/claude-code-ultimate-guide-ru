---
title: "Агент Vibes — Руководство по устранению неполадок"
description: "Действия по диагностике и решения распространенных проблем Agent Vibes TTS"
tags: [guide, tts, debugging, integration]
---

# Агент Vibes — руководство по устранению неполадок

**Общие проблемы**: 7 сценариев с пошаговыми решениями
**Диагностические инструменты**: Команды и сценарии для выявления проблем.

---

## <a name="issue-1-no-audio-output"></a>Проблема 1. Нет аудиовыхода.

### Симптом
```
Claude responds but no TTS audio plays
```

### Этапы диагностики

```bash
# 1. Check if muted
ls -la .claude/agentvibes-muted ~/.agentvibes-muted
# If file exists → TTS is muted

# 2. Check provider configuration
cat .claude/tts-provider.txt
# Expected: "piper" or "macos"

# 3. Check voice configuration
cat .claude/tts-voice.txt
# Expected: voice name like "fr_FR-tom-medium"

# 4. Test Piper directly
echo "Test audio" | piper -m ~/.claude/piper-voices/fr_FR-tom-medium.onnx \
  --output-file /tmp/test.wav && afplay /tmp/test.wav
```

### Решения

**Если звук отключен**:
```bash
# Unmute
rm .claude/agentvibes-muted
rm ~/.agentvibes-muted 2>/dev/null

# Or in Claude Code
/agent-vibes:unmute
```

**Если провайдер настроен неправильно**:
```bash
# Set Piper as provider
echo "piper" > .claude/tts-provider.txt

# Verify
cat .claude/tts-provider.txt
```

**Если голос отсутствует**:
```bash
# Download missing voice
cd ~/.claude/piper-voices
curl -L -o fr_FR-tom-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx"
curl -L -o fr_FR-tom-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx.json"
```

**Если команда Piper завершилась неудачно**:
```bash
# Reinstall Piper via pipx
pipx uninstall piper-tts
pipx install piper-tts

# Verify
piper --help
```

---

## Проблема 2: libespeak-ng.1.dylib не найден

### Симптом
```
dyld[xxx]: Library not loaded: @rpath/libespeak-ng.1.dylib
  Referenced from: /Users/.../piper
  Reason: tried: '/usr/local/lib/libespeak-ng.1.dylib' (no such file)
```

### Первопричина
Для двоичного файла Piper требуется библиотека `espeak-ng`, которая не установлена.

### Решение

```bash
# Install espeak-ng
brew install espeak-ng

# Verify installation
espeak-ng --version
# Expected: eSpeak NG text-to-speech: 1.52.0

# Find library location
find /opt/homebrew -name "libespeak-ng*.dylib"
# Expected: /opt/homebrew/lib/libespeak-ng.1.dylib

# If Piper still fails, reinstall via pipx (not binary)
pipx uninstall piper-tts 2>/dev/null
pipx install piper-tts

# Test again
piper --help
```

### Профилактика
Всегда устанавливайте `espeak-ng` **перед установкой** Piper TTS.

---

## Проблема 3. Голос звучит роботизированно или имеет низкое качество.

### Симптом
```
Audio plays but voice quality is poor, robotic, unnatural
```

### Диагностика

```bash
# Check which voice model is loaded
cat .claude/tts-voice.txt

# Check voice quality level
ls -lh ~/.claude/piper-voices/*.onnx | grep $(cat .claude/tts-voice.txt)
# Low quality: ~20-30MB
# Medium quality: ~50-70MB
# High quality: ~100-150MB
```

### Решения

**Обновление до качественной модели**:
```bash
# Download high-quality French voice
cd ~/.claude/piper-voices
curl -L -o fr_FR-siwis-high.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/high/fr_FR-siwis-high.onnx"
curl -L -o fr_FR-siwis-high.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/high/fr_FR-siwis-high.onnx.json"

# Switch to high-quality voice
/agent-vibes:switch fr_FR-siwis-high
```

**Альтернативный вариант: попробовать другой голос**:
```bash
# Test multiple voices to find preferred one
/agent-vibes:preview

# Or test manually
for voice in fr_FR-tom-medium fr_FR-siwis-medium fr_FR-upmc-medium; do
  echo "Test voix $voice" | \
    piper -m ~/.claude/piper-voices/${voice}.onnx \
    --output-file /tmp/${voice}.wav
  afplay /tmp/${voice}.wav
  sleep 2
done
```

**Сравнение качества**:
| Качество | Размер | Задержка | Естественность |
|---------|------|---------|-------------|
| Низкий | ~25 МБ | ~100 мс | ⭐️⭐️ |
| Середина | ~60 МБ | ~200 мс | ⭐️⭐️⭐️⭐️ |
| Высокий | ~120 МБ | ~400 мс | ⭐️⭐️⭐️⭐️⭐️ |

---

## Проблема 4. Высокая задержка (>500 мс)

### Симптом
```
Noticeable delay between Claude response and audio playback
```

### Диагностика

```bash
# Time audio generation
time (echo "Test rapide" | \
  piper -m ~/.claude/piper-voices/fr_FR-tom-medium.onnx \
  --output-file /tmp/test.wav > /dev/null 2>&1)
# Expected: ~0.2s for medium quality

# Check if effects are enabled
cat .claude/config/audio-effects.cfg 2>/dev/null
# Look for REVERB_ENABLED=true, ECHO_ENABLED=true

# Check if background music enabled
cat .claude/config/background-music.cfg 2>/dev/null
# Look for ENABLED=true
```

### Решения

**Переключиться на голосовую связь низкого качества** (на 50% быстрее):
```bash
cd ~/.claude/piper-voices
curl -L -o fr_FR-gilles-low.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx"
curl -L -o fr_FR-gilles-low.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx.json"

/agent-vibes:switch fr_FR-gilles-low
```

**Отключить звуковые эффекты**:
```bash
# In Claude Code
/agent-vibes:effects off

# Or manually
echo "REVERB_ENABLED=false" > .claude/config/audio-effects.cfg
echo "ECHO_ENABLED=false" >> .claude/config/audio-effects.cfg
```

**Отключить фоновую музыку**:
```bash
# In Claude Code
/agent-vibes:background-music off

# Or manually
echo "ENABLED=false" > .claude/config/background-music.cfg
```

**Переключиться на macOS Say** (мгновенно, более низкое качество):
```bash
/agent-vibes:provider switch macos
```

**Сравнение производительности**:
| Конфигурация | Задержка | Качество |
|---------------|---------|---------|
| Пайпер Хай + Эффекты + Музыка | ~500 мс | ⭐️⭐️⭐️⭐️⭐️ |
| Пайпер Медиум + Эффекты | ~280 мс | ⭐️⭐️⭐️⭐️ |
| Пайпер Медиум (без эффектов) | ~200 мс | ⭐️⭐️⭐️⭐️ |
| Пайпер Лоу (без эффектов) | ~100 мс | ⭐️⭐️ |
| macOS Скажи | ~50 мс | ⭐️⭐️⭐️ |

---

## Проблема 5: команды Agent Vibes загромождают палитру

### Симптом
```
34 /agent-vibes:* commands clutter Claude Code command palette
```

### Решение

```bash
# Hide all Agent Vibes commands
/agent-vibes:hide

# Commands still work, just hidden from autocomplete

# Unhide later if needed
/agent-vibes:show
```

### Альтернатива: полностью удалить Agent Vibes

```bash
npx agentvibes uninstall --yes
```

---

## Проблема 6. Звук воспроизводится несколько раз (echo/repeat).

### Симптом
```
Same audio plays 2-3 times in rapid succession
```

### Первопричина
`flock` (блокировка файлов) недоступна, что вызывает состояние гонки с быстрыми сообщениями.

### Диагностика

```bash
# Check if flock is available
which flock || /opt/homebrew/opt/util-linux/bin/flock --version
```

### Решение

```bash
# Install util-linux (contains flock)
brew install util-linux

# Add flock to PATH (optional)
echo 'export PATH="/opt/homebrew/opt/util-linux/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
flock --version
```

### Обходной путь (если стадо недоступно)
```bash
# Reduce verbosity to minimize rapid messages
/agent-vibes:verbosity low
```

---

## Проблема 7. Установка зависает или завершается

### Симптом
```
npx agentvibes install exits with:
ExitPromptError: User force closed the prompt
```

### Первопричина
Интерактивный установщик требует ввода с терминала и не может быть автоматизирован.

### Решение

```bash
# Ensure you're in interactive terminal (not script)
# Run directly in terminal, not via automation

npx agentvibes install

# If still fails, try without cache
npx --yes agentvibes@latest install
```

### Альтернатива: ручная установка

```bash
# If installer fails repeatedly, install components manually

# 1. Install Piper TTS
pipx install piper-tts

# 2. Download voices
mkdir -p ~/.claude/piper-voices
cd ~/.claude/piper-voices
# ... download voices manually (see voice-catalog.md)

# 3. Create config files
echo "piper" > .claude/tts-provider.txt
echo "fr_FR-tom-medium" > .claude/tts-voice.txt

# 4. Download Agent Vibes scripts
# (Contact maintainer or extract from npm package)
```

---

## Диагностический скрипт

Создайте комплексный диагностический сценарий:

```bash
cat > /tmp/agent-vibes-diagnostic.sh << 'EOF'
#!/bin/bash
echo "=== Agent Vibes Diagnostic ==="
echo ""

echo "1. System Dependencies"
command -v /opt/homebrew/bin/bash && echo "  ✓ Bash 5.x" || echo "  ✗ Bash 5.x missing"
command -v sox && echo "  ✓ sox" || echo "  ✗ sox missing"
command -v ffmpeg && echo "  ✓ ffmpeg" || echo "  ✗ ffmpeg missing"
command -v espeak-ng && echo "  ✓ espeak-ng" || echo "  ✗ espeak-ng missing"
command -v piper && echo "  ✓ piper" || echo "  ✗ piper missing"
echo ""

echo "2. Configuration Files"
test -f .claude/tts-provider.txt && echo "  ✓ Provider: $(cat .claude/tts-provider.txt)" || echo "  ✗ Provider not configured"
test -f .claude/tts-voice.txt && echo "  ✓ Voice: $(cat .claude/tts-voice.txt)" || echo "  ✗ Voice not configured"
test -f .claude/hooks/play-tts.sh && echo "  ✓ TTS hook installed" || echo "  ✗ TTS hook missing"
echo ""

echo "3. Mute Status"
test -f .claude/agentvibes-muted && echo "  ⚠ Project muted" || echo "  ✓ Project unmuted"
test -f ~/.agentvibes-muted && echo "  ⚠ Global muted" || echo "  ✓ Global unmuted"
echo ""

echo "4. Voice Models"
echo "  Installed voices: $(ls ~/.claude/piper-voices/*.onnx 2>/dev/null | wc -l)"
ls ~/.claude/piper-voices/*.onnx 2>/dev/null | sed 's|.*/||' | sed 's|.onnx||' | sed 's/^/    - /'
echo ""

echo "5. Audio Test"
if command -v piper > /dev/null 2>&1; then
  echo "Test" | piper -m ~/.claude/piper-voices/$(cat .claude/tts-voice.txt).onnx \
    --output-file /tmp/diagnostic-test.wav 2>&1 | grep -q "error" && \
    echo "  ✗ Audio generation failed" || echo "  ✓ Audio generation successful"
  afplay /tmp/diagnostic-test.wav 2>/dev/null && echo "  ✓ Audio playback successful" || echo "  ✗ Audio playback failed"
else
  echo "  ✗ Piper not installed, skipping test"
fi
echo ""

echo "=== End Diagnostic ==="
EOF

chmod +x /tmp/agent-vibes-diagnostic.sh

# Run diagnostic
/tmp/agent-vibes-diagnostic.sh
```

---

## Получение помощи

Если проблемы сохраняются:

1. **Запустите диагностический скрипт** (выше) и поделитесь выводом
2. **Проверьте проблемы агента Vibes GitHub**: https://github.com/paulpreibisch/AgentVibes/issues
3. **Проверьте руководство Claude Code**: Экосистема [AI](../../../guide/ecosystem/ai-ecosystem.md)
4. **Проверить журналы**: `tail -f ~/.claude/tts-debug.log` (если существует)

---

## <a name="known-limitations"></a>Известные ограничения

| Ограничение | Влияние | Обходной путь |
|------------|--------|------------|
| Bash 3.2 (по умолчанию macOS) | Скрипты терпят неудачу | Установите Bash 5.x через Homebrew |
| Нет поддержки Windows | Невозможно запустить изначально | Используйте WSL2 или macOS. |
| стадо по желанию | Звук может перекрываться | Установите util-linux или уменьшите многословие |
| Большие голосовые файлы | ~1 ГБ дискового пространства | Удалить неиспользуемые голоса |
| Задержка с высоким качеством | Задержка ~400 мс | Используйте среднее или низкое качество |

---

*Руководство по устранению неполадок, поддерживаемое [Claude Code Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)*
*Последнее обновление: 22 января 2026 г. | Агент Vibes v3.0.0*
