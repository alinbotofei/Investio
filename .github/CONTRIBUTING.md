# Git Conventions

## Branch Naming

```
<type>/<short-description>
```

| Type | When to use |
|------|-------------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code restructure with no behavior change |
| `chore/` | Tooling, deps, config |
| `docs/` | Documentation only |
| `test/` | Tests only |
| `style/` | Formatting, Tailwind classes |

**Examples:**

```
feat/ticker-page
fix/watchlist-optimistic-update
refactor/chat-page-split-components
chore/upgrade-nextjs-15
docs/update-readme
test/add-playwright-watchlist
```

---

## Commit Messages

Format: `<type>(<scope>): <subject>`

- **type** — same list as branch types above
- **scope** — optional, the module/area affected
- **subject** — imperative, lowercase, no period at end

**Examples:**

```
feat(chat): add streaming web search indicator
fix(watchlist): prevent duplicate symbol on add
refactor(constants): move hardcoded values to market.ts
chore: remove unused SimpleChart component
docs: update README with full tech stack table
test(e2e): add auth redirect coverage
style(badge): replace dynamic Tailwind class generation
```

## Workflow

```
main           — production-ready, protected
└── feat/xyz   — short-lived feature branch → PR into main
```

- Branch from `main`, PR back to `main`
- Keep branches short-lived (1-3 days ideally)
- Squash merge PRs to keep main history clean
- Delete branch after merge
