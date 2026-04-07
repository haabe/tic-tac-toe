# Corrections Log

## Format

Each correction entry follows this structure:

```
### [DATE] - [SHORT TITLE]
- **Scope**: [discovery | delivery | orchestration | quality]
- **Category**: [bias | security | engineering | process | communication]
- **Mistake**: What went wrong.
- **Correction**: What should have happened instead.
- **Prevention**: How to prevent this in the future (checklist item, gate, etc.).
- **Source**: Theory or principle that applies (e.g., "Torres - continuous discovery", "OWASP - input validation").
```

## Generalizable Corrections

_Corrections that apply broadly across projects and contexts._



## Situational Corrections

### 2026-04-07 - Online moves not visible to sender
- **Scope**: delivery
- **Category**: engineering
- **Mistake**: `sendMove` only sent the move to the server without updating the local board. The server relayed to the opponent only. Result: player's own pieces invisible, board desync caused crash.
- **Correction**: `sendMove` must optimistically update the local board immediately. Server relay is for the opponent only.
- **Prevention**: When implementing client-server real-time features, always ask: "Does the sender see their own action?" If the server doesn't echo back, the client must handle local state.
- **Source**: Optimistic UI updates in real-time applications.

