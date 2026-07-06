---
name: untitledui-react
description: Set up and develop with Untitled UI React (React 19 + Tailwind CSS v4.2 + React Aria Components) using Claude Code. Use when starting an Untitled UI project, cloning a starter kit, adding Untitled UI CLAUDE.md/AGENT.md context to an existing project, building components from the library (Button, Input, Select, Avatar, Badge, FeaturedIcon, DatePicker, Modal, Table, etc.), or wiring up the Untitled UI MCP integration.
---

# Untitled UI React Integration

Set up an Untitled UI React project with Claude Code and develop against the component library. Untitled UI is built on **React 19 + TypeScript + Tailwind CSS v4.2 + React Aria Components**.

The full component/style reference (conventions, every base + application component, color tokens) lives in `references/agent-md.md`. Load it whenever you write or edit Untitled UI components.

## Prerequisites

- Claude Code installed on the machine (see https://docs.claude.com/en/docs/claude-code).
- Node.js + npm.

## Start a new project (starter kits)

Pick a framework and clone the matching starter kit, then run `claude` inside the project directory.

```bash
# Next.js
git clone https://github.com/untitleduico/untitledui-nextjs-starter-kit

# Vite
git clone https://github.com/untitleduico/untitledui-vite-starter-kit
```

```bash
cd <starter-kit>
npm install
claude
```

Starter kits include providers, routing, and a `CLAUDE.md` that Claude Code reads automatically.

## Add Untitled UI context to an EXISTING project

Download the `AGENT.md` and save it as `CLAUDE.md` in the project root:

```bash
curl -o CLAUDE.md https://www.untitledui.com/react/AGENT.md
```

Manual download / canonical source: https://www.untitledui.com/react/AGENT.md
A local copy is also bundled at `references/agent-md.md` in this skill.

## MCP integration

Claude Code can connect to the Untitled UI component library via MCP (Model Context Protocol). Setup guide: https://www.untitledui.com/react/docs/mcp

## Development commands

```bash
npm run dev     # Vite/Next dev server
npm run build   # TypeScript compile + production build
```

## Core conventions (must follow)

- **Aria* import prefix**: everything from `react-aria-components` is imported with an `Aria*` alias, e.g. `import { Button as AriaButton } from "react-aria-components";`. Prevents clashes with the library's own components.
- **kebab-case filenames** for all files: `date-picker.tsx`, `auth-context.tsx`.
- **Compound components** via dot notation: `Select.Item`, `Select.ComboBox`.
- **Semantic color classes only** — use `text-primary`, `bg-primary`, `border-secondary`, `fg-brand-primary`, etc. NOT raw scales like `text-gray-900` or `bg-blue-700`.
- **Disabled state** = `disabled:opacity-50` (v8), not the old `disabled:bg-disabled_subtle` tokens.
- Icons: `@untitledui/icons` (free), `@untitledui-pro/icons` (PRO, 4 styles). Pass as component ref (`iconLeading={ChevronDown}`) or as element with `data-icon`.

For full props of Button, Input, Select, Checkbox, Badge, Avatar, FeaturedIcon, links, the complete color-token tables, and styling patterns (`sortCx`, `cx`), read `references/agent-md.md`.
