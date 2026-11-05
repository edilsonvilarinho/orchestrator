# orchestrate

**A [Claude Code](https://claude.com/claude-code) skill that runs a request through a cheap-first multi-agent workflow, with a live "office" portal that shows what every agent is doing.**

🇧🇷 [Leia em português](README.pt-BR.md)

![Portal demo](docs/media/portal-demo.gif)

> The GIF above is the portal playing its built-in **example data** (labelled `DADOS DE EXEMPLO` in the UI). Nothing in it comes from a real session.

## What it does

`/orchestrate <request>` turns the main Claude Code session into an orchestrator that follows a fixed set of rules:

1. **Plan first.** The request is split into tasks with an ID, an owner, exclusive file paths and a verifiable acceptance criterion (ideally a command that exits 0).
2. **Haiku first.** Subagents run on `haiku`. Sonnet is used only after **10 rejected deliveries** of the same task, and the orchestrator stops after **3 more** rejections on sonnet.
3. **Short prompts.** A delegation prompt is at most 12 lines and points to a briefing file instead of pasting context.
4. **A report is not proof.** The orchestrator checks every criterion with its own evidence (diff, execution, screenshot) before accepting.
5. **Errors go back to the same agent**, which still holds the context, instead of spawning a new one.
6. **Visual work passes a prototype gate.** N prototypes are produced and the user picks one before the final version.

```mermaid
flowchart LR
    U([You]) -->|/orchestrate request| O[Orchestrator<br/>main session]
    O -->|plan + tasks| P[(Portal<br/>127.0.0.1:4599)]
    O -->|short prompt + briefing| A1[explorer]
    O --> A2[backend-dev / frontend-dev]
    O --> A3[prototype-dev]
    O --> A4[test-runner]
    A1 & A2 & A3 & A4 -->|return| O
    O -->|verdict: approved| D([Done])
    O -->|verdict: rejected, same agent| A2
    O -.->|10th rejection| S[sonnet high]
    A2 & A3 -.->|transcripts| P
```

## The portal

On every invocation the skill starts a small local server (Node, no dependencies, bound to `127.0.0.1` only) and prints its URL as the first line of the reply. It shows, on a single screen:

- one **desk per agent**, with state, current activity and token usage;
- a **task board** (queue, in progress, validation, returned, approved);
- a **communication log** (delegations, returns, verdicts, returns to the agent).

It reads the Claude Code session transcripts on its own. What only the orchestrator knows (tasks, messages, verdicts) is pushed through `emit.mjs`.

| Light | Dark | Mobile |
|---|---|---|
| ![Light](docs/media/portal-light.png) | ![Dark](docs/media/portal-dark.png) | <img src="docs/media/portal-mobile.png" width="220" alt="Mobile"> |

> **Language note.** The portal UI, the `emit.mjs` subcommands and flags (`tarefa`, `fala`, `veredito`, `escalada`, `--titulo`, `--dono`, …) and the task state names are in **Portuguese**. The skill instructions (`SKILL.md`) and this documentation are in English; `SKILL.md` tells the model the exact Portuguese commands to use. A translated UI is not done yet.

## Requirements

- Claude Code with skills and subagents support.
- Node.js 24 (the version the code was developed and tested on; older versions are not verified).
- Tested on Windows 11 only. Nothing in the code is Windows-specific, but macOS and Linux are unverified.

## Install

The skill is the folder `skills/orchestrate/`. Pick one location.

**Personal (all projects):**

```bash
git clone https://github.com/edilsonvilarinho/orchestrator.git
cd orchestrator
mkdir -p ~/.claude/skills ~/.claude/agents
cp -r skills/orchestrate ~/.claude/skills/orchestrate
cp examples/agents/*.md ~/.claude/agents/          # optional, see below
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills", "$HOME\.claude\agents" | Out-Null
Copy-Item -Recurse skills\orchestrate "$HOME\.claude\skills\orchestrate"
Copy-Item examples\agents\*.md "$HOME\.claude\agents\"   # optional
```

**One project only:** copy to `<project>/.claude/skills/orchestrate/` and `<project>/.claude/agents/` instead.

Restart Claude Code (or start a new session) so it picks up the skill. Check that `/orchestrate` appears in the slash-command list.

### Example agents (optional)

`examples/agents/` has five generic subagents already set to `model: haiku` and `effort: high`: `explorer`, `test-runner`, `backend-dev`, `frontend-dev`, `prototype-dev`. The skill routes work by these names and the portal draws a dedicated desk for each. Any other subagent type works too and is drawn as a generic desk. Edit them to your stack: they carry no project-specific rules.

The orchestrator itself is your main session; it needs no agent file.

## Use

In a Claude Code session, inside the project you want to work on:

```text
/orchestrate add rate limiting to the public API and cover it with tests
/orchestrate --prototypes 3 redesign the settings screen
```

What happens:

1. The first line of the reply is the portal URL (default `http://127.0.0.1:4599/`). The browser opens once.
2. The orchestrator plans, registers each task in the portal and delegates with short prompts.
3. You follow desks, board and log live. Agents' own work is read from the transcripts.
4. Each delivery is verified. A rejected one goes back to the same agent; the 10th rejection on haiku escalates to sonnet.
5. For visual work, it stops after generating `--prototypes N` prototypes (default 4) under `prototipos/<deliverable>/` and waits for your choice. The gallery is served by the portal at `/prototipos/<deliverable>/`.
6. The final report states what was verified, what was not, token cost per agent and rejections per task.

### Commands the orchestrator uses

You normally never type these; they are what `SKILL.md` instructs the model to run.

```bash
# register / update a task
node <skill>/portal/emit.mjs tarefa --id T1 --titulo "Title" --dono backend-dev --estado fila
# say something in the log
node <skill>/portal/emit.mjs fala --de am --para backend-dev --tarefa T1 --texto "Task is yours."
# verdict: aprovada | devolvida (prints the rejection count and the next action)
node <skill>/portal/emit.mjs veredito --tarefa T1 --resultado devolvida --texto "Test X fails."
# escalate after the 10th rejection on haiku
node <skill>/portal/emit.mjs escalada --tarefa T1
```

### Portal options

```bash
node <skill>/portal/start.mjs --sessao <session-id> [--porta 4599] [--abrir nao]   # idempotent
node <skill>/portal/server.mjs --replay <session-id> --velocidade 20               # replay an old session
```

| Variable | Meaning |
|---|---|
| `PORTAL_RAIZ` | Project root to observe. Falls back to `CLAUDE_PROJECT_DIR`, then the current directory. |
| `PORTAL_PROJETOS` | Directory with Claude Code transcripts. Default `~/.claude/projects`. |

The portal writes its state under `<project>/.claude/escritorio/` (`portal.json` and one `<session>.jsonl` of orchestrator events). Add that folder to `.gitignore`.

Full data contract (sources, HTTP API, SSE, state shapes): [`skills/orchestrate/references/portal-contract.md`](skills/orchestrate/references/portal-contract.md) (in Portuguese).

## Limits and caveats

- The Claude Code transcript format is **not a public API**. The collector ignores unknown lines, but a format change can degrade the portal.
- Rejection limits (10 on haiku, 3 on sonnet) are constants in `portal/emit.mjs` (`LIMITE_REPROVACOES`). The counting comes from the session log, not from the model's memory.
- Agent types known to the portal are fixed in `portal/collector.mjs` (`TIPOS_AGENTE`); others are drawn as generic.
- The skill reduces the *orchestration overhead* by design (haiku default, short prompts); it does not guarantee a specific saving. Measure on your own sessions with the per-agent token totals the portal shows.

## Tests

```bash
npm test        # node --test skills/orchestrate/portal/  (34 tests, no dependencies)
```

## License

[MIT](LICENSE).
