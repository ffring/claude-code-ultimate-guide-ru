---
title: "Корпоративное управление ИИ для Claude Code"
description: "Управление на уровне организации для команд, развертывающих Claude Code в больших масштабах: уставы использования, рабочие процессы утверждения MCP, уровни защиты и соответствие требованиям."
tags: [security, enterprise, governance, compliance]
---

# Управление корпоративным искусственным интеллектом для Claude Code

> **Audience**: технические руководители, технические менеджеры, сотрудники службы безопасности развертывают Claude Code в разных командах.
>
> **Scope**: управление на уровне организации (политики, рабочие процессы утверждения, уровни, соответствие). Информацию об индивидуальной безопасности разработчиков (защита от внедрения, проверка MCP, CVE) см. в [security-hardening.md](./security-hardening.md). Информацию о 6 необоротных правилах производства см. в [production-safety.md](./production-safety.md).

---

## <a name="tldr"></a>ТЛ;ДР

**Пробел в управлении**: Документы по безопасности Claude Code описывают, что должны делать отдельные разработчики. Они не охватывают то, что происходит, когда его использует вся ваша организация: 50 разработчиков, разные профили рисков, отсутствие общей политики.

**О чем идет речь**:

| Раздел | Что это дает вам |
|---------|------------------|
| [Локальный или Общий](#1-local-vs-shared-the-governance-split) | Матрица рисков + структура принятия решений |
| [Устав об использовании](#2-ai-usage-charter) | Экономичный шаблон, готовый к адаптации |
| [MCP Управление](#3-mcp-governance-workflow) | Рабочий процесс утверждения + реестр YAML |
| [Ярусы ограждений](#4-guardrail-tiers) | 4 предварительно настроенных уровня, копипаст settings.json |
| [Политика в масштабе](#5-policy-enforcement-at-scale) | Внедрение, внедрение, ворота CI/CD |
| [Аудит и соблюдение требований](#6-audit-compliance--governance-structure) | Что на самом деле спрашивают аудиторы SOC2/ISO27001 |

---

## <a name="1-local-vs-shared-the-governance-split"></a>1. Локальное и общее: раскол в управлении

Управление в соответствии с доступом к данным, учетными данными, действиями и средой выполнения. Локальная касса может содержать производственные учетные данные или данные клиента; общий репозиторий может содержать только общедоступные примеры. Местоположение само по себе не определяет уровень риска.

### 1.1 Матрица рисков

| Измерение | Локальное использование | Совместное использование |
|-----------|-------------|--------------|
| **Раскрытие данных** | Любые данные, доступные сеансу | Любые данные, доступные сеансу |
| **Радиус взрыва** | Зависит от учетных данных, файловой системы, сети и инструментов. | Зависит от учетных данных, файловой системы, сети и инструментов. |
| **Подотчетность** | Названный оператор и действующая политика организации | Названные владельцы и действующая политика организации |
| **Воспроизводимость** | Сохраненные сеансы могут существовать; проверить сохранение и доступ | Настройте и проверьте необходимый журнал аудита |
| **Область соответствия** | Определяется данными и обязательствами по обработке | Определяется данными и обязательствами по обработке |
| **Дрейф конфигурации** | Проверяйте активные личные, проектные и управляемые источники | Проверка активных источников и развернутой политики. |

### 1.2 Что вы можете и не можете контролировать

Конфигурация **Repository распространяет базовую версию**: совместно использует инструкции проекта, поддерживаемые настройки, перехватчики и определения проекта MCP в `.mcp.json`. Сохраняйте проверки CI как независимые ворота. Файл репозитория не является блокировкой политики всей организации.

**Управляемые элементы управления обеспечивают соблюдение применимой политики внутри Claude Code**: развертывание поддерживаемых управляемых параметров и управляемых ограничений MCP для защищенных учетных записей или хостов. Проверьте, какая политика активна с помощью `/status`, и выполните заблокированные действия. Некоторые значения, например модель по умолчанию, остаются значениями по умолчанию; используйте документированный ключ ограничения, когда выбор должен быть ограничен. [Управляемое развертывание](https://code.claude.com/docs/en/managed-settings#what-a-developer-can-change).

**За пределами этой границы**: неуправляемым устройствам, другим клиентам API и локальным администраторам могут потребоваться отдельные элементы управления идентификацией, конечной точкой, сетью и учетными данными. Не требуйте управления этими поверхностями из зафиксированного файла.

### 1.3 Схема принятия решений: когда управлять

Ниже представлена ​​предлагаемая организационная структура, а не уровни продуктов. Применять элементы управления в соответствии с данными и задействованными действиями; проверка эффективной политики в каждой среде.

```
What are you governing?
│
├─ Personal dev workflow (local, throwaway code)
│   └─ Minimal: CLAUDE.md guidelines + basic hooks
│
├─ Team codebase (shared repo, not production)
│   └─ Standard: shared config + managed policy where required + PR gates
│
├─ Production system (customer-facing, real data)
│   └─ Strict: full tier config + approval workflow + audit log
│
└─ Regulated environment (HIPAA, SOC2, PCI, finance)
    └─ Regulated: all of above + compliance audit trail
```

---

## <a name="2-ai-usage-charter"></a>2. Устав использования ИИ

Устав использования отвечает на фундаментальный вопрос: «Что нам разрешено делать с Claude Code в этой компании?» Без этого каждая команда отвечает по-разному, создавая непоследовательную подверженность рискам.

Это пример политики, которую следует адаптировать к владельцам, ответственным за ваши данные, контракты и системы. Он не устанавливает права на участие в плане или требования соблюдения законодательства.

### 2.1 Образец устава бережливого производства

Скопируйте это в `docs/ai-usage-charter.md` вашей организации и адаптируйте. Выбор классификации, периодичность проверки и утверждения ниже являются примерами организационных решений:

```markdown
# AI Coding Tools Usage Charter

**Applies to**: Claude Code (and any AI coding assistant)
**Effective date**: [DATE]
**Owner**: Engineering Lead / CTO
**Review cadence**: Quarterly

---

## Approved Tools

| Tool | Scope | Data Classification |
|------|-------|---------------------|
| Organization-approved Claude Code account and processing route | Approved dev work | Approved classifications only |
| Personal accounts | Personal public work only | PUBLIC only |
| [Other approved tools] | [Scope] | [Classification] |

---

## Data Classification Rules

| Classification | Examples | Allowed with Claude Code? |
|----------------|----------|--------------------------|
| **PUBLIC** | Open source, public docs | Yes, subject to action permissions |
| **INTERNAL** | Internal tools, non-sensitive code | Only on an approved processing route |
| **CONFIDENTIAL** | Internal business secrets, non-regulated IP | Only when contracts, retention, and controls are approved |
| **RESTRICTED** | Customer PII, PCI card data, PHI, credentials | Prohibited under this example charter |

**Hard rule**: RESTRICTED data never enters an AI context window. Not in prompts, not in files Claude reads, not as examples. Remove restricted data from the execution environment and apply validated tool, filesystem, network, and credential controls. Instruction text alone is insufficient.

---

## Approved Use Cases

- Code completion, review, refactoring
- Test generation
- Documentation drafting
- Debugging and root cause analysis
- Architecture analysis (internal systems only)
- CLI scripting and automation

---

## Prohibited Use Cases

- Processing payment card data (PCI scope)
- Generating code that handles raw PHI without security review
- Autonomous deployment to production without human approval
- Using personal AI accounts for CONFIDENTIAL or higher data
- Sharing customer data in prompts as examples

---

## Who Approves What

| Action | Approver |
|--------|---------|
| Add new MCP server to team config | Tech Lead + Security review |
| Enable Claude Code in new project | Team Lead |
| Use Enterprise features (Zero Trust, SSO) | IT/Security team |
| Exception to any charter rule | Engineering Director |

---

## Compliance Obligations

By using Claude Code on company systems, you agree to:
1. Follow this charter
2. Report suspected data exposure to security@[company] within 24h
3. Not circumvent governance controls (hooks, permission deny rules)
4. Participate in quarterly access reviews

---

**Charter violations**: Follow standard disciplinary process. First occurrence: coaching. Repeated or severe: escalation.
```

### 2.2 Классификация данных и настройки Claude Code

Эти правила разрешений являются начальным примером встроенных инструментов, а не полным сдерживанием данных. Программы оболочки и серверы MCP могут получать доступ к данным по другим маршрутам. Используйте элементы управления ОС и учетные данные с узким охватом, а затем протестируйте непрямое чтение и выход из сети. [Границы разрешений](https://code.claude.com/docs/en/permissions#how-permissions-interact-with-sandboxing).

```json
{
  "permissions": {
    "deny": [
      "Read(./**/*.pem)",
      "Read(./**/*.key)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(**/credentials*)",
      "Bash(cat .env*)",
      "Bash(printenv*)",
      "Bash(env)"
    ]
  }
}
```

```markdown
<!-- CLAUDE.md — data handling rules -->
## Data Handling

**NEVER** read, reference, or include in output:
- Files matching: .env, *.pem, *.key, credentials.*, secrets/
- Customer PII fields (fields named: email, phone, ssn, dob, card_*)
- Credentials or API keys (even masked/redacted examples)

If you encounter restricted data while reading a file, stop and inform the user.
Do not proceed until explicitly told to skip that content.
```

### <a name="23-propagating-settings-to-the-team"></a>2.3 Распространение настроек в команду

Написать устав недостаточно: разработчикам нужно работать с правильной конфигурацией. Используйте дополнительные механизмы, каждый из которых имеет разную область применения:

**Поделился settings.json в репозитории вашей команды**

Зафиксируйте поддерживаемые настройки проекта в `.claude/settings.json`. Проверьте область действия каждого ключа и требования к доверию в рабочей области; клонирование репозитория само по себе не активирует все возможные настройки. [Область настроек проекта](https://code.claude.com/docs/en/settings#a-committed-key-doesnt-reach-teammates).

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./**/*.key)",
      "Bash(curl *)",
      "Bash(wget *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/dangerous-actions-blocker.sh"
          }
        ]
      }
    ]
  }
}
```

Локальные настройки могут изменять обычные настройки проекта по умолчанию без отслеживаемого редактирования. Правила разрешений deny/ask объединяются между источниками, а не следуют обычному скалярному приоритету. Используйте управляемую политику для необходимых ограничений и проверьте результат. В примере предполагается, что указанный исполняемый файл существует и протестирован; его шаблоны Bash не блокируют каждый сетевой маршрут. [Приоритет настроек](https://code.claude.com/docs/en/settings#settings-precedence), [Конфигурация перехватчика](https://code.claude.com/docs/en/hooks#hook-locations).

**Общий CLAUDE.md для правил поведения**

Используйте проект `CLAUDE.md` для распространения стандартов кодирования и объяснения политики обработки данных. Он предоставляет рекомендации по модели, а не навязывает ограничения инструмента. См. образец устава в §2.2.

**Anthropic Элементы управления администратором для групп и предприятий**

Разверните управляемые элементы управления, доступные для вашей организации и клиента. API Администрирование консоли, настройки организации claude.ai и политика хоста — это разные области; проверьте, какой из них доходит до сессии. Ограничения организации требуют поддерживаемых ключей политики, доставки на предполагаемую учетную запись или хост и проверки во время выполнения. [Механизмы развертывания](https://code.claude.com/docs/en/managed-settings).

Конфигурация общего репозитория остается полезной для настроек проекта по умолчанию. Он дополняет управляемую политику и средства контроля среды выполнения.

---

## <a name="3-mcp-governance-workflow"></a>3. Рабочий процесс управления MCP

Индивидуальная проверка MCP (5-минутный аудит) описана в [security-hardening.md §1.1](./security-hardening.md#11-mcp-vetting-workflow). В этом разделе рассматривается организационный рабочий процесс: как новые MCP утверждаются, развертываются и контролируются в вашей команде.

### 3.1 Рабочий процесс утверждения

Это пример организационного процесса. Имя сервера, рейтинг популярности или отсутствие рекомендаций не являются достаточным доказательством безопасности.

```
Developer requests MCP
        |
        v
[1] Record source, exact version, use case, data flow, credentials
        |
        v
[2] Review code/provenance, dependencies, advisories, permissions,
    tool descriptions, network access, and representative behavior
        |
        +-- Evidence insufficient --> Hold or reject
        |
        v
[3] Approve a bounded scope and reviewed version
    Record owner, decision evidence, and review triggers
        |
        v
[4] Distribute project definitions via .mcp.json
    Deploy managed MCP policy where restrictions must be enforced
    Verify the active policy and blocked actions
        |
        v
[5] Monitor advisories and behavior; re-review changes
    Update approval before deploying a changed version or scope
```

Выберите интервалы проверки и правила истечения срока действия в качестве политики организации. Не одобряйте патч автоматически только потому, что его метка версии предполагает небольшое изменение. [Управляемая конфигурация MCP](https://code.claude.com/docs/en/mcp#managed-mcp-configuration).

### <a name="32-mcp-registry-format"></a>3.2 Формат реестра MCP

Поддерживайте реестр, например `.claude/mcp-registry.yaml`, в вашем общем репозитории конфигурации. Claude Code изначально не реализует этот пользовательский YAML. Приведенные ниже значения являются заполнителями для замены фактической рецензией, а не проверенными утверждениями или пинами работоспособной версии:

```yaml
# .claude/mcp-registry.yaml
# Approved MCP servers for [Organization Name]
# Last updated: [REVIEW_DATE]
# Reviewer: [Name, Role]

metadata:
  review_cycle: quarterly
  next_review: "NEXT_REVIEW_DATE"
  owner: "platform-team@company.com"

approved:
  - name: context7
    version: "REVIEWED_VERSION"
    source: "https://github.com/upstash/context7"
    approved_by: "john.doe@company.com"
    approved_date: "REVIEW_DATE"
    expires: "EXPIRY_DATE"
    data_scope: PUBLIC
    risk: LOW
    rationale: "Documentation lookup; review outbound queries and credentials."
    config:
      command: npx
      args: ["-y", "@upstash/context7-mcp@REVIEWED_VERSION"]

  - name: sequential-thinking
    version: "REVIEWED_VERSION"
    source: "https://github.com/modelcontextprotocol/servers"
    approved_by: "jane.smith@company.com"
    approved_date: "REVIEW_DATE"
    expires: "EXPIRY_DATE"
    data_scope: INTERNAL
    risk: LOW
    rationale: "Reference implementation; verify code and restrict network access."
    config:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking@REVIEWED_VERSION"]

  - name: internal-db-readonly
    version: "REVIEWED_VERSION"
    source: "internal"
    approved_by: "security@company.com"
    approved_date: "REVIEW_DATE"
    expires: "EXPIRY_DATE"  # shorter expiry for higher risk
    data_scope: CONFIDENTIAL
    risk: MEDIUM
    rationale: "Read-only replica access. No PII tables in allowlist."
    restrictions:
      - "Read-only credentials only"
      - "No access to users, payments, or audit tables"
    config:
      command: npx
      args: ["-y", "@company/db-mcp@REVIEWED_VERSION"]

pending_review:
  - name: github-mcp
    requested_by: "dev@company.com"
    requested_date: "REVIEW_DATE"
    use_case: "PR automation"
    status: under_review

denied:
  - name: browser-automation-mcp
    denied_date: "REVIEW_DATE"
    reason: "Full browser access with no scope restriction. Risk too high."
```

### 3.3 Использование реестра с помощью перехватчика

Используйте управляемую конфигурацию MCP для принудительных ограничений. Пример ниже представляет собой только диагностическое предупреждение для карты `mcpServers` верхнего уровня в `~/.claude.json`; он пропускает другие области действия, записи проектов, плагины, соединители и определения командной строки. Он не может проверить разрешенный набор активных серверов. Просмотрите и протестируйте любой хук перед использованием; отдельный пример перехватчика управления [](../../examples/hooks/bash/governance-enforcement-hook.sh) также требует проверки для вашего развертывания.

```bash
#!/bin/bash
# .claude/hooks/governance-check.sh
# Event: SessionStart
# Warns on one stored MCP map; does not inventory active servers

REGISTRY=".claude/mcp-registry.yaml"
SETTINGS="${HOME}/.claude.json"

if [[ ! -f "$REGISTRY" ]]; then
  exit 0  # No registry = no enforcement (opt-in governance)
fi

# Check for unapproved MCPs (requires yq and jq)
if command -v jq &>/dev/null && command -v yq &>/dev/null; then
  ACTIVE=$(jq -r '.mcpServers | keys[]' "$SETTINGS" 2>/dev/null)
  APPROVED=$(yq e '.approved[].name' "$REGISTRY" 2>/dev/null)

  for mcp in $ACTIVE; do
    if ! echo "$APPROVED" | grep -q "^${mcp}$"; then
      echo "GOVERNANCE WARNING: MCP '${mcp}' is not in approved registry."
      echo "Submit a request at: https://your-internal-wiki/mcp-requests"
      echo "Session continues — please remediate within 48 hours."
    fi
  done
fi

exit 0
```

**Note**: В этом примере сеанс всегда продолжается, даже если его зависимости отсутствуют. Это не ворота в исполнение или одобрение. Используйте развернутые управляемые элементы управления MCP и проверяйте их покрытие для используемых клиентских поверхностей.

### 3.4 Новые возможности: изоляция инструмента MCP на уровне времени выполнения

Помимо рабочих процессов утверждения, новый подход изолирует доступ к ОС каждого инструмента MCP во время выполнения через WebAssembly. Такие инструменты, как [Wassette](https://github.com/microsoft/wassette), запускают серверы MCP как компоненты Wasm с запрещенной по умолчанию файловой системой и доступом к сети, объявленными в YAML. Ни один из этих инструментов не готов к производству по состоянию на середину 2026 года, но их стоит отслеживать, если ваша модель рисков включает сторонние серверы MCP с непредсказуемым объемом привилегий. Полное покрытие: [sandbox-isolation.md §7b](./sandbox-isolation.md#7b-webassembly-based-mcp-tool-sandboxing-experimental).

### <a name="35-watch-executor-the-registry-pattern-as-a-product"></a>3.5 Смотреть: Executor, шаблон реестра как продукт

Описанный выше рабочий процесс с §3.1 по §3.3 (отправка, проверка, регистрация, принудительное исполнение с помощью хука) представляет собой ручной ответ на вопрос, который растущая категория инструментов пытается автоматизировать: единый каталог одобренных интеграций, общий для каждого агента, который к нему подключается, вместо одного реестра для каждой команды или для каждого инструмента.

[Executor](https://github.com/UsefulSoftwareCo/executor) (MIT, `1.4.0-beta.0`) — самый яркий пример на данный момент. Он объявляет интеграцию один раз (спецификация OpenAPI, конечная точка GraphQL, существующий сервер MCP), оборачивает ее в соединение, идентифицируемое `(scope, integration, name)`, чтобы одна интеграция могла содержать несколько аутентифицированных учетных записей, и присваивает каждому инструменту те же три состояния, которые уже используются в этом разделе, по имени: разрешить, потребовать одобрения, заблокировать. Сопоставление с форматом реестра §3.2 близко к однозначному: интеграция соответствует записи реестра `source` и `config`, соединению с именованным аутентифицированным экземпляром этой записи, а состояния политики соответствуют полю реестра `risk`, обобщенному для каждого инструмента, а не для каждого сервера. Дальше, чем версия, созданная вручную, это сами учетные данные: соединение никогда не хранит необработанный секрет, а только ссылку (`op://`, `keychain://`, `env://`, `vault://`), разрешенную провайдером во время вызова через прокси, поэтому секрет не может появиться в схеме инструмента или ответе MCP даже случайно. Формат реестра §3.2 не имеет для этого эквивалентного поля; обработка учетных данных в этом шаблоне по-прежнему зависит от того, какой менеджер секретов находится под `.claude/settings.json`.

Компромисс реален, и его следует сопоставлять с собственным сроком погашения реестра, а не с маркетингом Исполнителя. Проект, созданный одним человеком (93 % коммитов, сделанных одним участником, измерено 29 июля 2026 г.) в версии до 1.0, представляет собой профиль риска, отличный от файла YAML, которым владеет ваша собственная команда, и его можно прочитать от начала до конца за десять минут. Относитесь к Executor как к тому, к чему в конечном итоге сходится созданный вручную реестр, когда ему потребуется совместное использование нескольких агентов и перенаправление учетных данных, а не как к полной замене описанного выше рабочего процесса. Полная оценка, включая разницу между видением и реализованным кодом, а также детализацию коэффициента шины: [`docs/resource-evaluations/executor-integration-governance-layer.md`](../../docs/resource-evaluations/executor-integration-governance-layer.md).

---

## <a name="4-guardrail-tiers"></a>4. Ярусы ограждений

Предварительно настроенные уровни ограждений для четырех распространенных сценариев. Адаптируйте соответствующий уровень для `.claude/settings.json` и `CLAUDE.md` вашего проекта. Для этих примеров необходимо установить и протестировать указанные сценарии перехвата. Действительный JSON и структура перехвата не определяют поведение безопасности.

### <a name="tier-1-starter"></a>Уровень 1: Стартер

**When**: Небольшая команда (<5), внутренние проекты, отсутствие производственных данных, низкие требования к соблюдению требований.

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./**/*.key)",
      "Read(./**/*.pem)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/dangerous-actions-blocker.sh\""
          }
        ]
      }
    ]
  }
}
```

```markdown
<!-- CLAUDE.md additions — Starter tier -->
## Security Basics
- Never read .env files or credential files
- Ask before running destructive commands (DROP, DELETE, rm -rf)
- Follow the codebase's existing patterns
```

**Investment**: установка за 10 минут. Охватывает основы.

### <a name="tier-2-standard"></a>Уровень 2: Стандартный

**When**: группа 5–20, код, связанный с производством, некоторые конфиденциальные данные, нет жестких требований соответствия.

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./**/*.key)",
      "Read(./**/*.pem)",
      "Read(./secrets/**)",
      "Bash(cat .env*)",
      "Bash(printenv*)",
      "Edit(docker-compose.yml)",
      "Edit(.github/workflows/**)",
      "Edit(terraform/**)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/dangerous-actions-blocker.sh\""
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/prompt-injection-detector.sh\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/output-secrets-scanner.sh\""
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/governance-check.sh\""
          }
        ]
      }
    ]
  }
}
```

```markdown
<!-- CLAUDE.md additions — Standard tier -->
## Production safety
- Infrastructure files (docker-compose, terraform, CI/CD) are locked.
  Request permission before modifying.
- New dependencies require Tech Lead approval. Do not run npm install <pkg>.
- Database destructive operations (DROP, DELETE, TRUNCATE) require backup confirmation.

## Code review gate
- All AI-generated code touching auth, payments, or data access must be flagged
  with a "AI-generated: review required" comment in the PR description.
```

**Investment**: настройка 30–45 минут. Охватывает большинство команд.

### <a name="tier-3-strict"></a>Уровень 3: Строгий

**When**: команда 20+, критически важные для производства системы, данные клиентов, неформальные ожидания соответствия.

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./.env.local)",
      "Read(./**/*.key)",
      "Read(./**/*.pem)",
      "Read(./secrets/**)",
      "Read(**/credentials*)",
      "Bash(cat .env*)",
      "Bash(printenv*)",
      "Bash(env)",
      "Bash(npm install *)",
      "Bash(pnpm add *)",
      "Bash(pip install *)",
      "Edit(docker-compose.yml)",
      "Edit(docker-compose.prod.yml)",
      "Edit(.github/workflows/**)",
      "Edit(terraform/**)",
      "Edit(kubernetes/**)",
      "Edit(prisma/schema.prisma)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/dangerous-actions-blocker.sh\""
          },
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/velocity-governor.sh\""
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/prompt-injection-detector.sh\""
          },
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/unicode-injection-scanner.sh\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/output-secrets-scanner.sh\""
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-logger.sh\""
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/governance-check.sh\""
          },
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/mcp-config-integrity.sh\""
          }
        ]
      }
    ]
  }
}
```

```markdown
<!-- CLAUDE.md additions — Strict tier -->
## Security posture: STRICT

You are operating in a strict security environment. Follow these rules without exception.

### Locked files
These files cannot be modified without explicit permission in this conversation:
- docker-compose.yml, Dockerfile, .github/workflows/**, terraform/**, kubernetes/**
- prisma/schema.prisma (database schema)
- Any file in /src/auth/, /src/payments/, /src/crypto/

### Dependency protocol
Before adding any dependency:
1. State the dependency name and purpose
2. List 2+ alternatives considered
3. Wait for explicit approval before running any install command

### Data access protocol
Before reading any file not in the project root:
1. State the file path and why you need it
2. Wait for approval if the path looks sensitive

### AI attribution
All code blocks you generate must be prefixed with `// AI-generated` in PRs.
Tests generated by AI must include `// AI-generated test` comment.
```

**Investment**: установка 1–2 часа. Подходит для большинства производственных коллективов.

### <a name="tier-4-regulated"></a>Уровень 4: Регулируемый

**When**: Финансы, здравоохранение, регулируемые отрасли. Требуется соответствие HIPAA, SOC2, PCI, ISO27001.

Этот уровень добавляет элементы управления, специфичные для соответствия требованиям, поверх Strict.

```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)",
      "Read(./**/*.key)",
      "Read(./**/*.pem)",
      "Read(./secrets/**)",
      "Read(**/credentials*)",
      "Read(**/patient*)",
      "Read(**/phi*)",
      "Read(**/pii*)",
      "Read(**/card*)",
      "Read(**/ssn*)",
      "Bash(cat .env*)",
      "Bash(printenv*)",
      "Bash(env)",
      "Bash(npm install *)",
      "Bash(pnpm add *)",
      "Bash(pip install *)",
      "Bash(curl *)",
      "Bash(wget *)",
      "Edit(docker-compose*.yml)",
      "Edit(.github/workflows/**)",
      "Edit(terraform/**)",
      "Edit(kubernetes/**)",
      "Edit(prisma/schema.prisma)",
      "Edit(**/auth/**)",
      "Edit(**/crypto/**)",
      "Edit(**/encryption/**)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/dangerous-actions-blocker.sh\""
          },
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/velocity-governor.sh\""
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/prompt-injection-detector.sh\""
          },
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/unicode-injection-scanner.sh\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/output-secrets-scanner.sh\""
          },
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-logger.sh\""
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/governance-check.sh\""
          },
          {
            "type": "command",
            "command": "bash \"$HOME/.claude/hooks/mcp-config-integrity.sh\""
          }
        ]
      }
    ]
  }
}
```

```markdown
<!-- CLAUDE.md additions — Regulated tier -->
## Compliance mode: [HIPAA | SOC2 | PCI] — ACTIVE

You are operating under regulatory compliance requirements. These rules are non-negotiable.

### Prohibited data
NEVER include in your output, suggestions, or examples:
- PHI (patient health information), PII (names, emails, phones in customer context)
- Card numbers, CVVs, bank accounts
- SSNs, tax IDs, government IDs
- Raw authentication tokens, session cookies, API keys

### Mandatory review gates
These changes require human approval BEFORE code is committed:
- Any change to authentication or authorization logic
- Any change to encryption or key management
- Any database migration
- Any new external API integration

### Audit trail
Every session operating on regulated data must have:
- User ID noted at session start ("This session is for: [your-email]")
- Task description at session start ("Task: [brief description]")
- Checkpoint comment at natural breakpoints

### AI attribution (mandatory for regulated)
All AI-generated code must include:
- `// AI-generated: [date] [model] [reviewer]` comment
- PR description must include AI disclosure section
```

**Дополнительный инструмент для регулируемых сред**: рассмотреть целиком CLI для доказательств аудита на уровне сеанса (контрольные точки, связанные с фиксациями); Для шлюзов утверждения слияния требуется размещенная кузница. Видеть [Отслеживание ИИ §5.1](../ops/ai-traceability.md#51-entire-cli) для получения подробной информации и go/no-go контрольный список оценки.

---

## <a name="5-policy-enforcement-at-scale"></a>5. Масштабное обеспечение соблюдения политики

Иметь политику – это не то же самое, что обеспечивать ее соблюдение. В этом разделе рассказывается, как на самом деле обеспечить эффективное управление командой из 10–100 разработчиков.

### 5.1 Распределение конфигурации

**Основной принцип**: Конфигурация управления находится в репозитории, а не на отдельных машинах.

```
your-org-config/                 ← separate "platform config" repo
├── .claude/
│   ├── settings.json            ← shared settings (tier-based)
│   ├── mcp-registry.yaml        ← approved MCPs
│   ├── hooks/
│   │   ├── governance-check.sh  ← MCP registry check
│   │   ├── session-logger.sh    ← audit trail
│   │   └── velocity-governor.sh ← rate limiting
│   └── agents/
│       └── security-reviewer.md ← shared agent for code review
├── templates/
│   ├── CLAUDE.md.starter        ← per-tier CLAUDE.md templates
│   ├── CLAUDE.md.standard
│   ├── CLAUDE.md.strict
│   └── CLAUDE.md.regulated
└── scripts/
    └── setup-project.sh         ← bootstraps new project with correct tier
```

**Загрузка нового проекта**:

```bash
#!/bin/bash
# scripts/setup-project.sh
# Usage: ./setup-project.sh [starter|standard|strict|regulated]

TIER=${1:-standard}
CONFIG_REPO="https://github.com/your-org/claude-code-config"

echo "Setting up Claude Code governance: $TIER tier"

# Create .claude directory
mkdir -p .claude/hooks

# Copy tier config
curl -s "$CONFIG_REPO/raw/main/templates/.claude/settings.${TIER}.json" \
  -o .claude/settings.json

# Copy CLAUDE.md template
curl -s "$CONFIG_REPO/raw/main/templates/CLAUDE.md.${TIER}" \
  -o CLAUDE.md

# Copy governance hooks
curl -s "$CONFIG_REPO/raw/main/hooks/governance-check.sh" \
  -o .claude/hooks/governance-check.sh
chmod +x .claude/hooks/governance-check.sh

echo "Done. Commit .claude/ and CLAUDE.md to your repo."
```

### <a name="52-onboarding-checklist"></a>5.2 Контрольный список адаптации

Новый разработчик, присоединяющийся к команде, использующей Claude Code, должен выполнить этот контрольный список:

```markdown
## Claude Code onboarding checklist

### Setup (30 minutes)
- [ ] Install Claude Code: `npm i -g @anthropic-ai/claude-code`
- [ ] Configure global safety hooks: `./scripts/install-global-hooks.sh`
- [ ] Verify project config loads: `claude` then ask "What tier is this project?"
- [ ] Read the AI Usage Charter (link to your doc)
- [ ] Review approved MCP list: `.claude/mcp-registry.yaml`

### Security basics
- [ ] Confirm `~/.claude/settings.json` has no `permissions.allow` overrides
  that bypass project's deny rules
- [ ] Confirm no personal MCP servers running that access production data
- [ ] Know how to report a data exposure: security@[company]

### First week
- [ ] Complete one task with Claude Code (bug fix, small feature)
- [ ] Submit at least one PR with proper AI attribution section
- [ ] Flag any friction points to Tech Lead for config improvement

### Quarterly
- [ ] Participate in MCP registry review
- [ ] Review AI Usage Charter updates
- [ ] Confirm no personal config overrides in place
```

### <a name="53-compliance-checking"></a>5.3 Проверка соответствия

Автоматизированная периодическая проверка соответствия для выявления отклонений конфигурации:

```bash
#!/bin/bash
# scripts/claude-governance-audit.sh
# Run weekly via CI/CD or cron

PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local result="$2"
  local severity="${3:-FAIL}"

  if [[ "$result" == "OK" ]]; then
    echo "  PASS: $name"
    ((PASS++))
  else
    echo "  $severity: $name — $result"
    [[ "$severity" == "FAIL" ]] && ((FAIL++)) || ((WARN++))
  fi
}

echo "=== Claude Code Governance Audit ==="
echo ""

# Check: settings.json present and committed
echo "1. Repository Config"
[[ -f ".claude/settings.json" ]] \
  && check "settings.json present" "OK" \
  || check "settings.json present" "Missing — team config not enforced" "FAIL"

git ls-files --error-unmatch .claude/settings.json &>/dev/null \
  && check "settings.json committed" "OK" \
  || check "settings.json committed" "Not tracked by git — won't apply to team" "WARN"

# Check: deny rules for secrets
echo ""
echo "2. Secret Protection"
if [[ -f ".claude/settings.json" ]]; then
  jq -e '.permissions.deny[]? | select(test("env|pem|key"))' \
    .claude/settings.json &>/dev/null \
    && check ".env protection rules" "OK" \
    || check ".env protection rules" "No deny rules for .env or key files" "FAIL"
fi

# Check: hooks installed and executable
echo ""
echo "3. Hook Stack"
for hook in ".claude/hooks/governance-check.sh"; do
  if [[ -f "$hook" ]]; then
    [[ -x "$hook" ]] \
      && check "$hook executable" "OK" \
      || check "$hook executable" "Not executable — run chmod +x $hook" "FAIL"
  else
    check "$hook present" "Missing" "WARN"
  fi
done

# Check: MCP registry present
echo ""
echo "4. MCP Governance"
[[ -f ".claude/mcp-registry.yaml" ]] \
  && check "MCP registry present" "OK" \
  || check "MCP registry present" "No registry — MCP usage ungoverned" "WARN"

# Check: CLAUDE.md present and committed
echo ""
echo "5. Documentation"
[[ -f "CLAUDE.md" ]] || [[ -f ".claude/CLAUDE.md" ]] \
  && check "CLAUDE.md present" "OK" \
  || check "CLAUDE.md present" "Missing — no project context for AI" "WARN"

echo ""
echo "=== Summary ==="
echo "  Passed:   $PASS"
echo "  Failed:   $FAIL (must fix)"
echo "  Warnings: $WARN (should fix)"
echo ""

[[ $FAIL -gt 0 ]] && exit 1 || exit 0
```

### 5.4 Ролевые ограждения

У разных разработчиков разные профили рисков. Настройте параметры Claude Code соответствующим образом.

**Подход: уровень experience/role в CLAUDE.md**

```markdown
<!-- CLAUDE.md — role-aware guidelines -->
## Developer context

This is a [JUNIOR|SENIOR|LEAD] developer project context.

### If JUNIOR (< 1 year at company)
- Always confirm architecture decisions before implementing
- Do not modify database schemas, migrations, or auth code without pairing with a senior
- Every PR must have a human reviewer check the AI-generated sections explicitly
- Use /plan mode before implementing anything > 50 lines

### If SENIOR (1+ years at company)
- Standard review applies
- Can modify most files, but auth/payment/crypto still require lead review
- AI attribution in PRs required

### If LEAD/PRINCIPAL
- Full access, judgment-based restrictions
- Responsible for setting guardrail tier for their team projects
- Must conduct quarterly MCP registry review
```

**Подход: разные settings.json для каждой среды**

В CI/CD проверьте активный путь `settings.json` при запуске конвейера, чтобы обеспечить правильный уровень. Claude Code считывает `.claude/settings.json` из корня проекта, поэтому зафиксируйте там свою конфигурацию строгого уровня. CI всегда подхватывает его, независимо от того, что есть у разработчиков локально.

```bash
# In your CI pipeline setup step, verify the correct tier is committed
if ! grep -q '"Bash(curl \*)"' .claude/settings.json; then
  echo "ERROR: CI requires Regulated-tier settings.json (curl must be denied)"
  exit 1
fi
```

### <a name="55-cicd-gates"></a>5.5 Ворота CI/CD

Блокируйте использование несоответствующего требованиям ИИ в производстве:

```yaml
# .github/workflows/ai-governance.yml
name: AI Governance Check

on: [pull_request]

jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check governance config present
        run: |
          if [[ ! -f ".claude/settings.json" ]]; then
            echo "::error::Missing .claude/settings.json — governance config required"
            exit 1
          fi

      - name: Check no credential access permissions
        run: |
          if jq -e '.permissions.allow[]? | select(test("env|pem|key|secret"))' \
            .claude/settings.json 2>/dev/null; then
            echo "::error::Dangerous permissions.allow detected — credentials may be exposed"
            exit 1
          fi

      - name: Run governance audit
        run: |
          chmod +x scripts/claude-governance-audit.sh
          ./scripts/claude-governance-audit.sh

      - name: Check AI attribution in PR description
        if: ${{ env.REQUIRE_AI_ATTRIBUTION == 'true' }}
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.pull_request.body || '';
            const hasAttribution = body.includes('AI') ||
                                   body.includes('Claude') ||
                                   body.includes('AI-generated');
            if (!hasAttribution) {
              core.warning('No AI attribution section found. Please disclose AI usage.');
            }
```

---

## <a name="6-audit-compliance--governance-structure"></a>6. Структура аудита, соблюдения требований и управления

### <a name="61-what-soc2-and-iso27001-auditors-actually-ask"></a>6.1 Что на самом деле спрашивают аудиторы SOC2 и ISO27001

Когда аудиторы проверяют использование инструментов кодирования ИИ, они обычно ищут доказательства наличия следующих средств контроля:

| Вопрос аудитора | Что они хотят увидеть | Реализация Claude Code |
|-----------------|----------------------|---------------------------|
| «Есть ли у вас политика использования инструментов ИИ?» | Письменный устав, signed/acknowledged | `docs/ai-usage-charter.md` + контрольный список для адаптации |
| «Как вы контролируете данные, отправляемые поставщикам ИИ?» | Классификация данных + технический контроль | `permissions.deny` для конфиденциальных файлов |
| «Как вы проверяете сторонние компоненты искусственного интеллекта?» | Процесс утверждения + реестр | Реестр MCP + процесс утверждения |
| «Есть ли у вас контрольный журнал действий ИИ?» | Журнал вызовов инструментов, доступа к файлам | Журналы сеанса JSONL + `compliance-audit-logger.sh` |
| «Как вы проверяете код, сгенерированный ИИ?» | Процесс проверки кода с раскрытием информации ИИ | PR-шаблон + политика атрибуции |
| «Что происходит, когда происходит инцидент?» | Процедура реагирования на инциденты | Существующий процесс IR + дополнения, относящиеся к ИИ |

**В частности, для SOC2**: Соответствующими критериями доверительных служб являются CC6.1 (логический контроль доступа), CC6.3 (удаление доступа), CC7.1 (мониторинг) и CC9.2 (риск поставщика). Ваше управление Claude Code должно соответствовать этому.

**В частности, для ISO27001**: Соответствующие элементы управления Приложением A включают A.8.3 (ограничение доступа к информации), A.8.24 (использование криптографии), A.8.25 (безопасный жизненный цикл разработки) и A.5.23 (информационная безопасность для использования облачных сервисов).

### <a name="62-audit-trail-setup"></a>6.2 Настройка журнала аудита

Сеансы Claude Code уже зарегистрированы в `~/.claude/projects/<project>/*.jsonl`. Задача состоит в том, чтобы сделать их:
1. Доступен постфактум (не теряется после ухода разработчика)
2. Защита от несанкционированного доступа (не подлежит редактированию задним числом)
3. Доступен для запроса в целях аудита

**Минимальный контрольный журнал (без дополнительных инструментов)**:

```bash
#!/bin/bash
# .claude/hooks/compliance-audit-logger.sh
# Event: PostToolUse (all tools)
# Appends structured audit entries to a shared log

LOG_DIR="${COMPLIANCE_LOG_DIR:-/var/log/claude-audit}"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).jsonl"

mkdir -p "$LOG_DIR"

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool.name // "unknown"')
USER=$(whoami)
PROJECT=$(basename "$PWD")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "{\"timestamp\":\"$TIMESTAMP\",\"user\":\"$USER\",\"project\":\"$PROJECT\",\"tool\":\"$TOOL\"}" \
  >> "$LOG_FILE"
```

**Отправка журналов в неизменяемое хранилище** (рекомендуется для регулируемых сред):

```bash
# Daily: sync session logs to immutable bucket
aws s3 sync ~/.claude/projects/ \
  s3://your-audit-bucket/claude-sessions/$(whoami)/ \
  --storage-class GLACIER_INSTANT_RETRIEVAL \
  --exclude "*.tmp"
```

**Для доказательств аудита уровня сеанса**рассмотрите весь CLI. Он фиксирует подсказки, расшифровки и затронутые файлы, связывает каждую контрольную точку с ее фиксацией через трейлер `Entire-Checkpoint` и сохраняет ее в Git. Шлюзы утверждения существуют только в размещенной на нем платформе Forge, и аттестации SOC 2, ISO 27001, HIPAA или FedRAMP для Entire обнаружено не было (27 октября 2026 г.). Критерии настройки и оценки см. в разделе «Прослеживаемость [AI» §5.1](../ops/ai-traceability.md#51-entire-cli). Это один из нескольких инструментов; оценить соответствие вашим конкретным требованиям соответствия.

### 6.3 Комитет по управлению ИИ (краткий справочник)

Для организаций, управляющих рисками ИИ в больших масштабах, облегченный комитет по управлению ИИ обеспечивает ту структуру подотчетности, которую ожидают аудиторы. Это координационный механизм, а не узкое место.

**Минимальная структура** (работает для 10–100 разработчиков):

| Роль | Человек | Ответственность |
|------|--------|----------------|
| **Руководитель отдела управления** | Инженерный менеджер или ведущий | Обновления политики, ежеквартальный обзор, эскалация |
| **Отдел безопасности** | SecEng или DevSecOps | MCP Анализ рисков, реагирование на инциденты |
| **Dev Rep** | Ротация старших разработчиков (3-месячный срок) | Отзывы разработчиков, баланс юзабилити |
| **Ответ по обеспечению соответствия** | Legal/Compliance (только регулируемый) | Устав, нормативное картирование |

**Периодичность проведения совещаний**: Ежеквартально (30 минут). Постоянная повестка дня:
1. Обзор реестра MCP: что можно добавить, удалить или пометить?
2. Обзор инцидентов: какие-либо события безопасности, связанные с ИИ, с момента последней встречи?
3. Обновления политики: необходимы ли какие-либо изменения в уставе?
4. Метрики: результаты корпоративного аудита, статус проверки соответствия

Подробную информацию о структурах комитетов по управлению ИИ, матрицах RACI и сопоставлении соответствия см. в официальном документе № 11: Управление ИИ на предприятии (FR/EN).

### 6.4 Мониторинг соответствия

Уровень наблюдения для управления описан в [observability.md](../ops/observability.md). В частности, для обеспечения соответствия наиболее актуальными являются следующие запросы мониторинга:

```bash
# Which files did Claude access in the last 30 days?
# macOS: date -v-30d; Linux: date -d '30 days ago'
if [[ "$OSTYPE" == "darwin"* ]]; then
  SINCE=$(date -v-30d +%Y-%m-%d)
else
  SINCE=$(date -d '30 days ago' +%Y-%m-%d)
fi

find ~/.claude/projects/ -name "*.jsonl" -newer "$SINCE" | \
  xargs jq -r 'select(.type == "assistant") |
    .message.content[]? |
    select(.type == "tool_use" and .name == "Read") |
    .input.file_path' 2>/dev/null | sort -u

# Any access to sensitive patterns?
# (Run after the above, pipe through grep)
grep -E '\.(env|pem|key)$|secrets/|credentials'

# Bash commands run by Claude this week
if [[ "$OSTYPE" == "darwin"* ]]; then
  SINCE_WEEK=$(date -v-7d +%Y-%m-%d)
else
  SINCE_WEEK=$(date -d '7 days ago' +%Y-%m-%d)
fi

find ~/.claude/projects/ -name "*.jsonl" -newer "$SINCE_WEEK" | \
  xargs jq -r 'select(.type == "assistant") |
    .message.content[]? |
    select(.type == "tool_use" and .name == "Bash") |
    .input.command' 2>/dev/null | sort
```

---

## <a name="quick-reference"></a>Шпаргалка

### Выбор уровня

| Ваша ситуация | Уровень | Время установки |
|----------------|------|------------|
| Побочный проект, личное использование | Стартер | 10 минут |
| Небольшая команда, внутренний проект | Стартер | 10 минут |
| Команда 5–20, любой код производства | Стандартный | 45 мин. |
| Команда 20+, данные клиентов | Строгий | 2 часа |
| Регулируемая отрасль (HIPAA/SOC2/PCI) | Регулируемый | Полдня |

### Уровни зрелости управления

| Зрелость | Что у тебя есть | Чего не хватает |
|----------|---------------|----------------|
| **Специально** | Каждый разработчик настраивает свою настройку | Последовательность, ответственность |
| **Basic** | Общий CLAUDE.md + settings.json | MCP управление, контрольный журнал |
| **Управляемый** | + реестр MCP + хуки | Отчетность о соответствии |
| **Соответствует** | + Журналы аудита + устав + цикл проверки | Ничего критического |
| **Проверено** | + Внешняя проверка + прослеживаемость | Никто |

### Распространенные ошибки

| Ошибка | Исправить |
|---------|-----|
| Управление только в `~/.claude` (личное) | Переместиться в `.claude/` в репозитории |
| `permissions.allow` переопределяет `deny` команды. | Просматривайте личную конфигурацию ежеквартально |
| Нет реестра MCP → каждый разработчик добавляет разные MCP. | Запустить реестр, даже если всего 3 записи |
| CLAUDE.md слишком длинный → Claude игнорирует правила | Не превышайте 8 КБ, отдавайте приоритет критическим правилам. |
| Аудиторы запрашивают журналы ИИ → ничего не сохраняется | Настройте синхронизацию журнала сеанса с S3 |

---

## <a name="see-also"></a>См. также

- [Аудит разрешений, утверждений и обязанностей агента по проверке](https://www.florian.bruniaux.com/services/audit/#governance), если вам нужно оценить, как эти средства контроля работают в вашей организации.

- [Усиление безопасности](./security-hardening.md): Индивидуальная безопасность разработчиков: MCP CVE, защита от внедрения, 5-минутный аудит
- [Правила безопасности производства](./production-safety.md): 6 не подлежащих обсуждению правил для производственных команд (порты, безопасность БД, инфраструктурная блокировка)
- [Руководство по конфиденциальности данных](./data-privacy.md): какие данные Claude Code отправляет в Anthropic, политики хранения
- [AI Traceability](../ops/ai-traceability.md): политики атрибуции, весь CLI, git-ai, системы обеспечения соответствия
- [Observability](../ops/observability.md): мониторинг сеансов, отслеживание затрат, запросы аудита активности.
- [Подходы к внедрению](../roles/adoption-approaches.md): Схемы развертывания команды, стратегии CLAUDE.md
- [MCP Шаблон реестра](../../examples/scripts/mcp-registry-template.yaml): Готовый к использованию формат реестра.
- [Governance Hook](../../examples/hooks/bash/governance-enforcement-hook.sh): перехват проверки конфигурации на соответствие политике.
- [AI Шаблон устава использования](../../examples/scripts/ai-usage-charter-template.md): шаблон устава, готовый к адаптации

---

## Ссылки

- [Liminal AI Enterprise Governance Guide](https://www.liminal.ai/blog/enterprise-ai-governance-guide): Практическая реализация
- [Databricks AI Governance Framework](https://www.databricks.com/blog/practical-ai-governance-framework-enterprises): Платформа корпоративного масштаба
- [Augmentcode Управление кодом AI](https://www.augmentcode.com/guides/ai-code-governance-framework-for-enterprise-dev-teams): специально для команды разработчиков
- [Партнерство в области искусственного интеллекта: шесть приоритетов управления до 2026 года](https://partnershiponai.org/resource/six-ai-governance-priorities/): Системы оценки, подотчетность
- [EU AI Act](https://www.europarl.europa.eu/doceo/document/TA-9-2024-0138_EN.html): Требования к аварийному выключателю для систем искусственного интеллекта высокого риска
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework): Система управления рисками
- [SOC2 Критерии доверительных служб](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022): CC6.1, CC7.1, CC9.2

---

*Версия 1.0.0 | март 2026 г. | Часть полного руководства [Claude Code](../README.md)*
