---
name: ccboard-install
description: "Установите или обновите ccboard"
category: "настройка"
---

# Установите команду ccboard

Установите или обновите двоичный файл ccboard через Cargo.

## Что такое ccboard?

ccboard — это комплексная панель управления TUI/Web для мониторинга и управления Claude Code:

- **8 Интерактивные вкладки**: Панель управления, Сеансы, Конфигурация, Хуки, Агенты, Затраты, История, MCP
- **Мониторинг в реальном времени**: средство отслеживания файлов для обновлений в реальном времени
- **MCP Management**: состояние и конфигурация сервера.
- **Cost Analytics**: отслеживание использования токенов и цен.
- **Session Explorer**: просмотр и поиск истории разговоров.
- **Двойной интерфейс**: терминал (TUI) и веб-интерфейс

## Требования

- **Rust**: версия 1.70 или выше.
- **Cargo**: Менеджер пакетов Rust (поставляется с Rust)

Если Rust не установлен:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Использование

```bash
# Install ccboard
/ccboard-install

# Or manually
cargo install ccboard
```

## Процесс установки

1. Проверяет, установлен ли груз
2. Обнаруживает существующую установку ccboard
3. Запрашивает подтверждение обновления, если оно уже установлено.
4. Устанавливается через `cargo install ccboard --force`
5. Проверяет установку и показывает версию

## После установки

После установки используйте следующие команды:

- `/dashboard` — Запустить панель управления TUI.
- `/mcp-status` - Открыть вкладку серверов MCP.
- `/costs` - Анализ открытых затрат
- `/sessions` - Просмотр истории сессий
- `/ccboard-web` - Запустить веб-интерфейс

Или запустите напрямую:
```bash
ccboard              # Launch TUI
ccboard web          # Launch web UI
ccboard --help       # Show all options
```

## <a name="troubleshooting"></a>Поиск неисправностей

### Груз не найден
```bash
# Install Rust and cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reload shell
source $HOME/.cargo/env
```

### Установка не удалась
```bash
# Update Rust toolchain
rustup update

# Try manual installation from source
git clone https://github.com/{OWNER}/ccboard
cd ccboard
cargo install --path crates/ccboard
```

### Доступ запрещен
```bash
# Ensure ~/.cargo/bin is in PATH
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Выполнение

```bash
#!/bin/bash

# Run installation script
exec "$(dirname "$0")/../scripts/install-ccboard.sh"
```

## Удаление

Чтобы удалить ccboard:
```bash
cargo uninstall ccboard
```
