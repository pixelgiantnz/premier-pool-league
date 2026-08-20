# Premier Pool League

A pool league management application — currently in the **design phase**.

No application code exists yet. This repo is set up for [Matt Pocock's skills-based development workflow](https://github.com/mattpocock/skills): align on the domain first, then spec, ticket, and implement in small steps.

## Directory layout

```
premier-pool-league/
├── AGENTS.md                 # Agent configuration pointers
├── README.md                 # This file
├── docs/
│   └── agents/
│       ├── domain.md         # How agents read/write domain docs
│       └── issue-tracker.md  # GitHub Issues + gh CLI conventions
├── .agents/skills/           # Installed Matt Pocock skills (Cursor)
│   ├── setup-matt-pocock-skills/
│   ├── grill-with-docs/
│   ├── grilling/
│   └── domain-modeling/
└── .git/
```

**Not created yet** (these appear during your first `grill-with-docs` session):

- `CONTEXT.md` — domain glossary
- `docs/adr/` — architecture decision records

## Installed skills

| Skill | Type | Purpose |
|-------|------|---------|
| `grill-with-docs` | User-invoked | Interview you about the design; build `CONTEXT.md` and ADRs as you go |
| `grilling` | Model-invoked | Interview primitive (used by `grill-with-docs`) |
| `domain-modeling` | Model-invoked | Sharpen terminology and update glossary/ADRs |
| `setup-matt-pocock-skills` | User-invoked | One-time repo configuration (already done) |

## Issue tracker

Work is tracked in **GitHub Issues** on this repo. Agents use the `gh` CLI — see [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

## Recommended workflow (future)

Once design is settled, you can add more skills (`to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`) and follow this path:

```
grill-with-docs  →  to-spec  →  to-tickets  →  implement + tdd  →  code-review
```

That comes later. For now, the repo is ready for design.

## Start a grill-with-docs session

When you're ready to design the app, open a **new Agent chat** in Cursor and say:

> Follow the grill-with-docs skill. I want to design a Premier Pool League application.

The agent will interview you in rounds, resolve domain terminology, and create `CONTEXT.md` and ADRs as decisions crystallize. Nothing happens until you kick this off yourself.

## Updating skills

To pull the latest versions of Matt Pocock's skills later:

```bash
npx skills@latest update
```

To add more skills when you move from design to build:

```bash
npx skills@latest add mattpocock/skills --agent cursor --skill to-spec --skill to-tickets --skill implement --skill tdd --skill code-review -y
```
