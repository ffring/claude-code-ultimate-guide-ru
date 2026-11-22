---
description: "Показать шпаргалку Claude Code (полную или с фильтром по разделам)"
---

Используйте инструмент `get_cheatsheet` MCP.

<% if (typeof $ARGUMENTS !== 'undefined' && $ARGUMENTS.trim()) { %>
Фильтровать по разделу: $ARGUMENTS
<% } еще { %>
Верните полную шпаргалку.
<% } %>