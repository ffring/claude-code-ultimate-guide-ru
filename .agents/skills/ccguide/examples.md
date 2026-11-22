---
description: "Список всех шаблонов по категориям (agents/commands/hooks/skills/scripts)"
---

Используйте инструмент `list_examples` MCP.

<% if (typeof $ARGUMENTS !== 'undefined' && $ARGUMENTS.trim()) { %>
Категория: $ARGUMENTS
<% } еще { %>
Показать все категории.
<% } %>
