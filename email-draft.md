Subject: Periderm CLI Scan - False Positives / Misclassification of Dev Marketplace (CLI Tool, Not Web App)

Hi Periderm Team,

I ran `periderm scan` on my repository (dev-marketplace) and the results show significant misclassification and false positives. The tool appears to be treating this as a **web application** when it's actually a **CLI tool / NPM package** that developers install via `npx dev-marketplace add <skill-name>` to add AI agent skills to their projects.

**Repository:** https://github.com/kingjethro999/dev-marketplace
**Package:** `dev-marketplace` on npm
**Scan ID:** 566f7852-ed11-4deb-b325-0699af292f90

---

### Key Issue: Wrong Project Type Classification

This is a **command-line tool / skills registry** — not a web app. It has:
- No server, no frontend, no deployed URLs
- No user accounts, no authentication, no database
- No HTTP endpoints, no cookies, no sessions
- Pure Node.js CLI distributed via npm

Periderm's "web app" heuristics (Privacy Policy, Terms of Service, secret scanning in "non-server files") don't apply here.

---

### Specific False Positives

| Finding | Reality |
|---------|---------|
| `DEMO_PASSWORD` env var in "non-server file" | This is in `skills/product-demo/scripts/record.mjs` — a **local demo recording script** developers run manually to record product demos. It reads credentials from env to sign into *their own app* for a screen recording. Not deployed, not a server. |
| `TIDEWELL_API_KEY` in "non-server file" | This is in `skills/product-film/templates/paper/capture/cli/tidewell.mjs` — a **template/example file** showing how to call a hypothetical API. It's documentation-as-code, not production code. |
| Missing Privacy Policy / ToS | CLI tools distributed via npm don't need these. No user data collected. |
| Empty catch blocks, fetch without .catch, etc. | These are in **skill template/example/demo files** — teaching materials showing patterns, not the CLI's own runtime code. |

---

### What This Project Actually Is

**Dev Marketplace** is an open-source CLI that lets developers install 126+ curated AI agent skills (for Claude Code, Cursor, Codex, etc.) into their projects:

```bash
npx dev-marketplace add apple-design
npx dev-marketplace add --category "Video & Motion"
npx dev-marketplace add --all --global
```

It's a **developer tool**, like `eslint`, `prettier`, or `typescript` — not a SaaS/web app.

---

### Request

1. **Add project-type detection** — distinguish CLI tools / npm packages / monorepos from web apps
2. **Exclude `skills/*/templates/`, `skills/*/scripts/`, `skills/*/examples/`, `skills/*/demo/`** from "production code" secret scanning — these are teaching materials
3. **Don't require Privacy Policy/ToS** for projects with no server, no user data, no deployed frontend
4. **Consider a `--type=cli` or `--type=library` flag** to suppress web-app checks

Happy to share more context if helpful.

— Japheth
kingjethro999