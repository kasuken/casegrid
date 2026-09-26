# CaseGrid

CaseGrid is a spatial murder-mystery logic puzzle game planned as a browser-based MVP.

The product requirements are documented in [docs/PRD.md](docs/PRD.md).

## Development

Requirements:

- Node.js 24 or newer
- pnpm 11

Install dependencies and start the React application:

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The web application lives in `apps/web` and uses React, TypeScript, Vite,
Tailwind CSS, Zustand, dnd-kit, Zod, and React Router.

## Repository skills

The repository includes shared agent skills for Claude Code, Codex, and GitHub Copilot:

- `frontend-design`
- `canvas-design`
- `vercel-react-best-practices`

They are stored in each platform's project-level discovery directory:

- Claude Code: `.claude/skills/`
- Codex: `.agents/skills/`
- GitHub Copilot: `.github/skills/`
