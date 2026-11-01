# gateway-app: Ticket Triage Agent with Human Approval Gates

**Live demo:** https://gateway-app-demo.vercel.app/

A Next.js agent that triages incoming tickets against a knowledge base of past issue→resolution pairs, then proposes a label, **but the label only lands after a human decision**. The point of the demo is the governance layer, not the model.

## What it does

1. Paste a ticket into the chat.
2. The agent searches the knowledge base (issue/resolution pairs) exactly once.
3. It proposes a label via the `applyLabel` tool.
4. **The proposal stops at an approval wall.** Nothing is written until a human approves or denies.
5. After the decision, the execution resumes: approved means the label is applied, denied means the agent reports the refusal and does not retry.

```
ticket → search → proposal → ⛔ human gate → execute (approve) / stop (deny) → outcome report
```

## Architecture

```
app/
  tools.ts            ← the agent contract: schemas, types, approval policy, system prompt
  lib/corpus.ts       ← knowledge base of issue→resolution pairs
  api/chat/route.ts   ← thin wiring: streamText + model + tools + step bounds + trace
  page.tsx            ← chat UI; renders tool lifecycle states (including the approval wall)
```

**`tools.ts` is the single source of truth.** Server and client both derive from it:

- Tool definitions with zod schemas (`applyLabel` accepts only a closed enum: `bug | known-issue | escalation | needs-info`)
- Result contracts (`TicketSearchResult`, `LabelResult`)
- Approval policy (`ticketToolApproval`): approval is a *property of the tool*, not of the endpoint, so any consumer that imports `ticketTools` inherits the gate automatically
- `TriageMessage` / `SearchPart` / `LabelPart`: the client's UI types are inferred from the server contract (`InferUITools` + `Extract`), so the UI cannot drift from the tool schema

## Design decisions

| Decision | Why |
|---|---|
| Approval-gated write tools | A model with write access to a ticket system should never act without oversight. `toolApproval: { applyLabel: "user-approval" }` intercepts execution; the tool's `execute` runs only after the human approves. |
| Zod enum on tool inputs | The model has freedom to *choose*, the schema clips the *space of actions*. Deterministic guardrails around probabilistic planning. |
| `stopWhen: isStepCount(5)` | Bounds the agent loop. Runaway tool chains can't burn cycles or cost. |
| Typed message parts in the UI | The panels render the tool *state machine* (`input-streaming → approval-requested → approval-responded → output-available / output-denied`). The panels are the source of truth; model prose is commentary. |
| Per-step trace logging (`onStepFinish`) | Every step (tool calls, finish reason, token usage) is logged and appears in Vercel Function/Runtime Logs in production. Observability is part of the contract, not a debug afterthought. |
| One shared contract file | Tool schemas, types, and approval policy live in one file consumed by both the route and the UI. No duplicated definitions, no drift. |

## The core idea

Deterministic machinery, bounded model freedom:

- **Deterministic:** tool schemas, execution states, the approval gate, step limits, the knowledge-base ranking
- **Probabilistic:** only the model's planning and narration

When the agent misbehaves (echoing raw results, re-asking after a decision), it is always in the narration layer, never in the gate or the contract. That separation is what makes agent systems production-ready rather than demo-ready.

## Run it

```bash
npm install
# set GOOGLE_GENERATIVE_AI_API_KEY in .env.local
npm run dev
```

Open http://localhost:3000, paste a ticket (try *"The export button fails with 'invalid input' on a large CSV"*), and watch the approval wall appear.

## Deploying (Vercel)

```bash
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
vercel deploy --prod
```

Trace logs from `onStepFinish` show up in the function's Runtime Logs, and the agent's execution trail is visible live in the Vercel dashboard.

## Production path

The demo swaps the in-memory corpus for a real Zendesk/Intercom API by replacing `searchCorpus` and the `ticketId` in `execute`. The tool contract, approval gate, and UI stay unchanged. That is the point of the contract: the model and the backing system can change, the governance layer does not.
