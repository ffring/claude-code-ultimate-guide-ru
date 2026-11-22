---
description: "Показать примечания к выпуску Claude Code CLI"
---

Используйте инструмент `get_release` MCP.

<% if (typeof $ARGUMENTS !== 'undefined' && $ARGUMENTS.trim()) { %>
Версия: $ARGUMENTS
<% } еще { %>
Показать последний выпуск и последние 5.
<% } %>
