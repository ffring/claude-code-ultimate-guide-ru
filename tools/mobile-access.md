# Claude Code мобильный доступ

> **⚠️ СТАТУС: НЗП / НЕПРОВЕРЕН**
>
> Это руководство находится в стадии разработки. Установка не была полностью протестирована в различных средах.
> Используйте на свой страх и риск. Вклад и обратная связь приветствуются.

---

## <a name="the-problem"></a>Проблема

Claude Code CLI — это **локальный интерактивный процесс**, а не служба с сеансом API. Каждый экземпляр автономен. Даже `claude --remote` лишь разгружает выполнение — он не создает систему ретрансляции.

**Чего не хватает**: собственный режим `claude --serve`, который предоставляет WebSocket API, позволяет использовать несколько клиентов и поддерживает один и тот же контекст разговора.

**Обходной путь**: Откройте доступ к своему терминалу через веб-браузер с помощью `ttyd`, доступного из любого места через `Tailscale` VPN.

---

## Решение: ttyd + Tailscale

```
YOUR COMPUTER                     YOUR PHONE
┌─────────────────┐               ┌─────────────────┐
│  Claude Code    │◄──────────────│  Browser        │
│  (runs here)    │   Tailscale   │  (same session) │
│                 │   (VPN)       │                 │
└─────────────────┘               └─────────────────┘
```

- **ttyd**: отображает ваш терминал в веб-браузере.
- **Tailscale**: бесплатный VPN, который дает вашему компьютеру фиксированный IP-адрес, доступный из любого места (4G, общедоступный Wi-Fi и т. д.).
- **tmux**: сохраняет сеанс активным, даже если вы закроете браузер.

**Случай использования**: отслеживайте и продолжайте сеансы Claude Code со своего телефона (по дороге на работу, вдали от рабочего места и т. д.).

---

## Сравнение архитектуры

### ttyd + Tailscale (автономное размещение)

```
YOUR COMPUTER                     YOUR PHONE
┌─────────────────┐               ┌─────────────────┐
│  Claude Code    │◄──────────────│  Browser        │
│  (runs here)    │   Tailscale   │  (same session) │
│  ┌───────────┐  │   VPN         │                 │
│  │   ttyd    │  │               └─────────────────┘
│  └───────────┘  │
└─────────────────┘
✅ ToS-Safe: CLI officiel, pas d'intermédiaire cloud
```

### Happy Coder (родное приложение)

```
YOUR COMPUTER                     YOUR PHONE
┌─────────────────┐               ┌─────────────────┐
│  Claude Code    │               │  Happy App      │
│  (CLI officiel) │◄─────────────►│  (Expo native)  │
│       ▲         │   Local sync  │                 │
│  subprocess     │               └─────────────────┘
│  ┌───────────┐  │
│  │ Happy Hub │  │
│  └───────────┘  │
└─────────────────┘
✅ ToS-Safe: Wrapper local, subprocess Node.js
```

### Remoto.sh (Облачное реле)

```
REMOTO CLOUD                      YOUR PHONE
┌─────────────────┐               ┌─────────────────┐
│  Docker         │◄──────────────│  Browser        │
│  Container      │   WebSocket   │                 │
│  ┌───────────┐  │               └─────────────────┘
│  │ Claude    │  │
│  │ Code CLI  │  │
│  └───────────┘  │
└─────────────────┘
⚠️ ToS Risk: Cloud wrapping = potentiel "proxy non autorisé"
```

---

## Почему такой подход?

### Условия обслуживания

Некоторые сторонние оболочки (например, OpenCode) были заблокированы Anthropic за нарушение ToS. Этот подход является **ToS-safe**, потому что:

- Вы используете официальную версию **Claude Code CLI**.
- ttyd просто открывает ваш терминал через браузер (без оболочки)
- Tailscale — это просто VPN для безопасного доступа
- Ни один сторонний клиент не взаимодействует с Claude's API

---

## <a name="prerequisites"></a>Предварительные условия

- macOS или Linux
- Claude Code CLI установлен и аутентифицирован.
- Учетная запись Tailscale (уровень бесплатного пользования работает)

---

## Установка

### Скрипт быстрой настройки

```bash
#!/bin/bash
# claude-mobile-setup.sh

set -e

echo "=== Setup Claude Code Mobile ==="

# 1. Install ttyd + tmux
echo "[1/2] Installing ttyd..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install ttyd tmux
else
    sudo apt install -y tmux
    sudo snap install ttyd --classic
fi

# 2. Install Tailscale
echo "[2/2] Installing Tailscale..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install tailscale
else
    curl -fsSL https://tailscale.com/install.sh | sh
fi

# 3. Create launcher script
mkdir -p ~/.local/bin
cat > ~/.local/bin/claude-mobile << 'EOF'
#!/bin/bash
PORT=7681
PASS="${CLAUDE_MOBILE_PASS:-claude123}"

TS_IP=$(tailscale ip -4 2>/dev/null || echo "not connected")

echo "══════════════════════════════════"
echo "  CLAUDE CODE MOBILE"
echo "══════════════════════════════════"
echo "  URL:  http://$TS_IP:$PORT"
echo "  User: claude"
echo "  Pass: $PASS"
echo "══════════════════════════════════"
echo ""
echo "Open this URL on your phone."
echo "Press Ctrl+C to stop."
echo ""

# Kill existing session if any
tmux kill-session -t cc 2>/dev/null || true

# Start Claude in tmux, expose via ttyd
tmux new-session -d -s cc 'claude'
exec ttyd -W -p $PORT -c "claude:$PASS" tmux attach -t cc
EOF

chmod +x ~/.local/bin/claude-mobile

# Add to PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Next steps:"
echo "  1. Run: tailscale up"
echo "  2. Run: source ~/.zshrc"
echo "  3. Run: claude-mobile"
echo ""
```

### Ручная установка

```bash
# macOS
brew install ttyd tmux tailscale

# Linux (Debian/Ubuntu)
sudo apt install -y tmux
sudo snap install ttyd --classic
curl -fsSL https://tailscale.com/install.sh | sh
```

---

## Использование

### Первая настройка

```bash
# 1. Connect to Tailscale (one-time)
tailscale up
# Follow the link to authenticate with Google/GitHub/etc.

# 2. Install Tailscale on your phone
# iOS: App Store → Tailscale
# Android: Play Store → Tailscale
# Login with same account

# 3. Start Claude Code Mobile
claude-mobile
```

### Выход

```
══════════════════════════════════
  CLAUDE CODE MOBILE
══════════════════════════════════
  URL:  http://100.78.42.15:7681
  User: claude
  Pass: claude123
══════════════════════════════════
```

### На вашем телефоне

1. Открыть Safari/Chrome
2. Перейдите на `http://100.78.42.15:7681` (используйте свой фактический IP-адрес Tailscale).
3. Войти с помощью `claude` / `claude123`
4. Теперь у вас есть Claude Code в вашем браузере.

---

## Конфигурация

### Изменить пароль

```bash
export CLAUDE_MOBILE_PASS="your-secure-password"
claude-mobile
```

Или добавьте в конфигурацию вашей оболочки:

```bash
echo 'export CLAUDE_MOBILE_PASS="your-secure-password"' >> ~/.zshrc
```

### Изменить порт

Отредактируйте `~/.local/bin/claude-mobile` и измените `PORT=7681` на предпочитаемый вами порт.

---

## Безопасность

| Слой | Защита |
|-------|------------|
| **Сеть** | Tailscale использует шифрование WireGuard |
| **Аутентификация** | Базовая аутентификация (имя пользователя:пароль) через ttyd |
| **Доступ** | Доступно только из вашей сети Tailscale |

**Recommendations**:
- Используйте надежный пароль (не стандартный `claude123`)
- Не открывайте ttyd напрямую в Интернет без Tailscale.
- Постоянно обновляйте клиент Tailscale на всех устройствах.

---

## <a name="troubleshooting"></a>Поиск неисправностей

### «не подключен» вместо IP

```bash
# Check Tailscale status
tailscale status

# If disconnected, reconnect
tailscale up
```

### Не могу зайти с телефона

1. Убедитесь, что приложение Tailscale установлено на телефоне и подключено к той же учетной записи.
2. Убедитесь, что брандмауэр не блокирует порт 7681.
3. Сначала попробуйте получить доступ локально: `http://localhost:7681`

### Сеанс не сохраняется

Сеанс tmux должен сохраниться. Чтобы повторно подключиться вручную:

```bash
tmux attach -t cc
```

### команда ttyd не найдена

```bash
# macOS
brew reinstall ttyd

# Linux
sudo snap install ttyd --classic
```

---

## Сравнение альтернатив

| Решение | Тип | Плюсы | Минусы | Условия обслуживания | Звезды |
|----------|------|------|------|-----|-------|
| **ttyd + Tailscale** ✅ | Self-hosted | Бесплатный, максимальный контроль, официальный CLI | Руководство по настройке, UX-терминал | ✅ Безопасно | N/A |
| [Счастливый кодер](https://github.com/slopus/happy) | Приложение родное | Голосовая связь, шифрование, несколько экземпляров, ориентация на мобильные устройства | Уровни проекта Dependance | ✅ Безопасно | 7.8K |
| [Remoto.sh](https://remoto.sh) | Облачное реле | Быстрая установка, только браузер | Облако, задержка, время | ⚠️ Риск | N/A |
| tmux + SSH | Self-hosted | Ноль депс, официальный CLI | Мобильный SSH-клиент Besoin | ✅ Безопасно | N/A |
| [swe-mux](https://github.com/jatoran/swe-mux) | Самостоятельное размещение (PWA через Tailscale) | Официальный CLI в реальных PTY, одни и те же сеансы в реальном времени на настольном компьютере и телефоне, статус каждого сеанса, push-уведомления, предварительный просмотр сервера разработки, сеансы сохраняются при перезапуске, без ретрансляции | настольное приложение Windows; macOS/Linux через браузер; молодой проект | ✅ Безопасно | N/A |

Мы выбрали ttyd + Tailscale, потому что:
- Это просто ваш терминал, доступный через браузер
- Никакой сторонней оболочки вокруг Claude Code.
- Нулевой риск ToS — вы используете официальную версию CLI.

---

### Happy Coder - альтернативный рекомендуемый вариант

Если вы предпочитаете использовать **app own**, выберите веб-терминал:

- **Repo** : [github.com/slopus/happy](https://github.com/slopus/happy)
- **Stars**: 7,8 тыс. (январь 2026 г.)
- **License** : MIT
- **Stack** : Таури (рабочий стол) + Expo (мобильный)
- **Провайдеры** : Claude Code, Codex, Gemini

**Pourquoi ToS-safe**: Happy Coder — это локальная оболочка, которая официально выполняет CLI через подпроцесс Node.js. Pas d'appels API направляет, pas de proxy cloud.

**Установка** :
```bash
npm i -g happy-coder && happy
```

---

### Remoto.sh — Альтернативное облако (с рисками)

**Рискованный вариант**: Remoto.sh использует облачный ретранслятор Docker. Выберите ToS Anthropic (раздел 4.2), «неавторизованные прокси, которые являются исходными для запросов», которые могут быть пропущены. Подвески сигнализируют о Reddit/HN для аналогичного использования.

> **Рекомендация**: Предпочитайте Happy Coder или ttyd+Tailscale для предотвращения рисков ToS.

---

## <a name="related-resources"></a>Связанные ресурсы

- [ttyd GitHub](https://github.com/tsl0922/ttyd) - Веб-сервер терминала
- [Tailscale](https://tailscale.com/) — VPN без настройки
- [ttyd + Claude Code Руководство](https://aiengineerguide.com/blog/agentic-cli-browser-ttyd/) — Учебное пособие сообщества
- Руководство по настройке [VPS](https://joshualent.com/snippets/claude-phone/) - Альтернатива: запуск на VPS

---

## <a name="sources"></a>Источники

- [Happy Coder GitHub](https://github.com/slopus/happy) — 7.8K ⭐, лицензия MIT
- [ttyd GitHub](https://github.com/tsl0922/ttyd) - Веб-сервер терминала
- [Tailscale](https://tailscale.com/) — VPN без настройки
- [Remoto.sh](https://remoto.sh) — облачный терминал (учтен риск ToS)
- ToS Anthropic §4.2 – Неавторизованные прокси

---

## Содействие

Этот документ — **WIP/UNTESTED**. Если вы протестируете эту настройку, поделитесь, пожалуйста:
- Ваш OS/environment
- Любые возникшие проблемы
- Предлагаемые улучшения

Откройте проблему или PR в этом репо.

---

*Последнее обновление: январь 2026 г. | Статус: WIP/UNTESTED | Данные проверены: Happy Coder 7.8K ⭐ (19.01.2026)*
