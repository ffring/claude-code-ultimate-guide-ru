# Команда агентов киберзащиты

Конвейер из 4 агентов, который обнаруживает угрозы безопасности в файлах журналов. Создано изначально с помощью команд агентов Claude Code.

**Этот пример предназначен для сравнения двух подходов**: LangGraph (фреймворк Python) и Claude Code Agent Teams (родной). Одна и та же система, две архитектуры. Дельта говорит вам, когда какой использовать.

---

## Архитектура

```
log-ingestor (haiku)
      ↓
anomaly-detector (sonnet)
      ↓
risk-classifier (sonnet)
      ↓
threat-reporter (sonnet)
      ↓
cyber-defense-report.md
```

Каждый агент несет единственную ответственность и передает данные следующему через общие файлы JSON. Навык оркестровки (`/cyber-defense-team`) определяет последовательность появления и сообщает о результатах.

**Использование**: `/cyber-defense-team /var/log/nginx/access.log`

---

## LangGraph против команд агентов Claude Code

Одна и та же система построена дважды. Вот полное сравнение.

### Версия LangGraph (~150 строк Python)

```python
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import json

# ─── State Definition ─────────────────────────────────────────────────────────
class DefenseState(TypedDict):
    raw_logs: str
    parsed_events: List[dict]
    anomalies: List[dict]
    risk_level: str      # LOW | MEDIUM | HIGH | CRITICAL
    report: str

# ─── Tools (Python functions the LLM can call) ────────────────────────────────
@tool
def detect_patterns(logs: str) -> List[dict]:
    """Extract structured events from raw log text."""
    events = []
    for line in logs.split("\n"):
        if any(k in line for k in ["ERROR", "FAILED", "UNAUTHORIZED"]):
            events.append({"type": "security_event", "raw": line})
        elif "WARNING" in line:
            events.append({"type": "warning", "raw": line})
    return events

@tool
def detect_anomalies(events: List[dict]) -> List[dict]:
    """Detect statistical anomalies in event patterns."""
    anomalies = []
    error_count = sum(1 for e in events if e["type"] == "security_event")
    if error_count > 5:
        anomalies.append({"type": "high_error_rate", "count": error_count, "severity": "HIGH"})
    return anomalies

@tool
def lookup_threat(event_type: str) -> dict:
    """Look up known threat signatures."""
    db = {
        "UNAUTHORIZED": {"description": "Auth bypass attempt"},
        "SQL_INJECTION": {"cve": "CVE-2021-1234", "description": "SQLi pattern"}
    }
    return db.get(event_type, {"description": "Unknown threat"})

# ─── LLM Setup ────────────────────────────────────────────────────────────────
llm = ChatOpenAI(model="gpt-4o-mini")
llm_with_tools = llm.bind_tools([detect_patterns, detect_anomalies, lookup_threat])

# ─── Nodes (one function per agent role) ──────────────────────────────────────
def ingest_node(state: DefenseState) -> DefenseState:
    events = detect_patterns.invoke(state["raw_logs"])
    return {**state, "parsed_events": events}

def detect_node(state: DefenseState) -> DefenseState:
    anomalies = detect_anomalies.invoke(state["parsed_events"])
    return {**state, "anomalies": anomalies}

def classify_node(state: DefenseState) -> DefenseState:
    result = llm_with_tools.invoke([
        SystemMessage("Classify risk as LOW/MEDIUM/HIGH/CRITICAL."),
        HumanMessage(f"Anomalies: {json.dumps(state['anomalies'])}")
    ])
    risk = "HIGH" if state["anomalies"] else "LOW"
    return {**state, "risk_level": risk}

def report_node(state: DefenseState) -> DefenseState:
    result = llm_with_tools.invoke([
        SystemMessage("You are a Senior Security Analyst. Write a Markdown incident report."),
        HumanMessage(f"Risk: {state['risk_level']}\nAnomalies: {json.dumps(state['anomalies'])}")
    ])
    return {**state, "report": result.content}

# ─── Conditional Edge ─────────────────────────────────────────────────────────
def should_report(state: DefenseState) -> str:
    return "report" if state["anomalies"] else END

# ─── Graph Assembly ───────────────────────────────────────────────────────────
builder = StateGraph(DefenseState)
builder.add_node("ingest", ingest_node)
builder.add_node("detect", detect_node)
builder.add_node("classify", classify_node)
builder.add_node("report", report_node)

builder.set_entry_point("ingest")
builder.add_edge("ingest", "detect")
builder.add_edge("detect", "classify")
builder.add_conditional_edges("classify", should_report)
builder.add_edge("report", END)

# ─── Memory ───────────────────────────────────────────────────────────────────
checkpointer = MemorySaver()
app = builder.compile(checkpointer=checkpointer)

# ─── Entry Point ──────────────────────────────────────────────────────────────
def analyze_logs(logs: str) -> str:
    config = {"configurable": {"thread_id": "security-session-1"}}
    result = app.invoke(
        {"raw_logs": logs, "parsed_events": [], "anomalies": [], "risk_level": "", "report": ""},
        config
    )
    return result.get("report", "No threats detected.")
```

### Версия Claude Code (~60 строк YAML/markdown)

Четыре файла агентов, один файл навыков. Никакой сборки графов, никакого TypedDict, никакого шаблона.

```
examples/agents/cyber-defense/
├── log-ingestor.md       (~40 lines)
├── anomaly-detector.md   (~50 lines)
├── risk-classifier.md    (~55 lines)
└── threat-reporter.md    (~45 lines)

examples/skills/cyber-defense-team/
└── SKILL.md              (~70 lines)
```

Каждый файл агента представляет собой заголовок YAML (имя, модель, инструменты) + системное приглашение на английском языке, описывающее роль, входные данные, выходные данные и ограничения. Файл навыков упорядочивает операторов с вызовами `Agent tool`.

---

## Параллельное сравнение

| Измерение | Лангграф | Claude Code Команды агентов |
|-----------|-----------|------------------------|
| **Общий код** | ~150 строк Python | ~60 строк YAML/Markdown |
| **Управление государством** | Явное определение `TypedDict` | Неявный — файлы JSON между агентами. |
| **Память** | Ручная настройка `MemorySaver` | Собственный (файлы сохраняются по умолчанию) |
| **Определение инструмента** | `@tool` декорированные функции Python | Серверы MCP или встроенные инструменты |
| **Условная логика** | `add_conditional_edges()` | Естественный язык в навыках («если нет аномалий, перейдите к шагу 5») |
| **Выбор модели** | Одна модель для всех узлов | Поагент (хайку для разбора, сонет для рассуждений) |
| **Отладка** | `print()` + ЛангСмит (платный) | Родной пользовательский интерфейс Claude Code |
| **Новая роль агента** | Новая функция + `add_node()` + `add_edge()` | Новый файл `.md` |
| **Внедрение** | Изучите LangGraph API | Чтение файла Markdown |
| **Развертывание** | FastAPI или Gradio (еще ~50 строк) | `claude` CLI, готово |
| **Зависимости** | `langgraph`, `langchain`, `langchain-openai` | Нет (встроен в Claude Code) |

---

## Когда какой использовать

**Используйте команды агентов Claude Code, когда:**
- Вы хотите двигаться быстро — от прототипа до работающей системы за 30 минут.
- В вашу команду входят лица, не являющиеся разработчиками, которые могут читать или редактировать подсказки агента.
- Конвейер является внутренним инструментом (а не общедоступной конечной точкой API).
- Вам необходимо часто пересматривать поведение агента (отредактируйте файл `.md`, готово)

**Используйте LangGraph, когда:**
- Вам необходимо встроить систему в более крупное приложение Python.
- Вы хотите предоставить конвейер как REST API для внешних потребителей.
- Вам нужны детерминированные переходы состояний, которые должны быть протестированы модульно.
- Ваша команда уже знает Python и имеет опыт работы с LangGraph.

**Честный компромисс**: LangGraph дает вам больше программного контроля и доступа к экосистеме Python. Команды агентов Claude Code предоставляют меньше шаблонов, ускоряют итерации и не требуют обслуживания инфраструктуры. Для внутренних конвейеров инструментальной и информационной работы подход Claude Code обычно выигрывает по совокупной стоимости владения.

---

## Файлы в этом примере

| Файл | Роль агента | Модель | Ответственность |
|------|-----------|-------|----------------|
| `log-ingestor.md` | Этап 1 | хайку | Разбирать необработанные журналы → `cyber-defense-events.json` |
| `anomaly-detector.md` | Этап 2 | сонет | Обнаружение закономерностей → `cyber-defense-anomalies.json` |
| `risk-classifier.md` | Этап 3 | сонет | Оценка риска → `cyber-defense-risk.json` |
| `threat-reporter.md` | Этап 4 | сонет | Создать → `cyber-defense-report.md` |
| `../skills/cyber-defense-team/SKILL.md` | Оркестратор | — | Агенты последовательности, обработка ошибок, подведение итогов |

---

**Вдохновлен**: Платформа SMART COMPASS Марьям Миради — та же система, другой стек.
