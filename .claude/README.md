# Claude skills and agents

These load automatically in any Claude Code session opened on this repository.

## Skills (`skills/`)

**Design and UI**

| Skill | What it does |
|---|---|
| `ui-ux-pro-max` | Searchable design database — 84 styles, 192 color palettes, 74 font pairings, 98 UX guidelines, motion presets, chart types, across 22 stacks |
| `ui-styling` | shadcn/ui + Radix + Tailwind, themes, dark mode, accessible components |
| `design-system` | Design tokens (primitive → semantic → component), CSS variables, spacing and type scales |
| `design` | Logo generation, corporate identity, mockups, icons, social images |
| `brand` | Brand voice, visual identity, messaging frameworks, consistency checklists |
| `slides` | HTML presentations with Chart.js and design tokens |
| `banner-design` | Banners for social, ads, web heroes, print |
| `frontend-design` | Visual direction for new UI, avoiding templated defaults, UI copywriting |

**Writing and context**

| Skill | What it does |
|---|---|
| `stop-slop` | Strips AI writing tells from prose |
| `context-optimization` | Token budgeting, retrieval scoping |
| `context-compression` | Summarization and handoff summaries for long sessions |
| `filesystem-context` | Offloading tool output to files, scratchpads |

## Agents (`agents/`)

20 subagents for software work: `coder`, `planner`, `reviewer`, `tester`,
`researcher`, `system-architect`, `security-auditor`, `database-specialist`,
`python-specialist`, `typescript-specialist`, `backend-dev`, `mobile-dev`,
`cicd-engineer`, `api-docs`, `code-analyzer`, `production-validator`,
`test-architect`, `sparc-coder`, `perf-analyzer`, `base-template-generator`.

## Sources

- `ui-*`, `design*`, `brand`, `slides`, `banner-design` — [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- `frontend-design` — [anthropics/claude-code](https://github.com/anthropics/claude-code)
- `stop-slop` — [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)
- `context-*`, `filesystem-context` — [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- `agents/` — adapted from [ruvnet/ruflo](https://github.com/ruvnet/ruflo), with `claude-flow` MCP
  coordination sections removed so they run on built-in tools alone

## Using these in another project

Copy the `skills/` and `agents/` folders into that project's `.claude/`
directory. To install them on a personal machine for use everywhere, run
`install.sh`, which copies them into `~/.claude/`.
