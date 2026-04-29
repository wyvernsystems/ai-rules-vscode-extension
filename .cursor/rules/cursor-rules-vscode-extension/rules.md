# Cursor project rules (this repo)

## How rules work

Cursor **project rules** are Markdown files with optional YAML **frontmatter**, stored under `.cursor/rules/` (in this repository they live in the subfolder **`cursor-rules-vscode-extension/`**). Each file is usually **`.mdc`**, which supports `description`, `globs`, and `alwaysApply` in the frontmatter. Cursor decides which rules to include in a chat based on that metadata: **`alwaysApply: true`** rules are candidates for every conversation; others apply when **file paths match `globs`** (e.g. only while editing `*.md`) or when you **@‑mention** a rule. The agent then follows the **body** of those rules as extra instructions—rules are versioned with the repo like normal docs.

## Rule reference

| Rule | When it runs | Summary |
|------|--------------|---------|
| `state-active-project-rules.mdc` | **Always** (`alwaysApply: true`). | At the start of a new chat or agent run, it tells you which project rules apply, using each rule’s filename and a short phrase. |
| `how-to-write-rules.mdc` | **Glob only** when paths match `**/.cursor/rules/cursor-rules-vscode-extension/**/*.mdc` (editing or focusing rule files in this repo). Also when **@‑mentioned**. | It documents where `.mdc` files go, what frontmatter to use, naming conventions, and a merge checklist for this rules folder. |
| `cursor-rules-maintenance.mdc` | **Glob only** with the same pattern as `how-to-write-rules.mdc`. Also when **@‑mentioned**. | It guides how to edit, review quality, deprecate, and keep rule examples and links in sync when you touch rule files. |
| `evolving-project-rules.mdc` | **Always** (`alwaysApply: true`). | It describes when changing code should prompt new or updated rules and how to spot patterns without one oversized rule file. |
| `write-clean-code.mdc` | **Always** (`alwaysApply: true`). | It sets expectations for readable code: naming, function size, meaningful comments, explicit dependencies, and clear errors. |
| `reuse-over-duplication.mdc` | **Always** (`alwaysApply: true`). | It tells the agent to search for existing helpers and reuse or extract shared code instead of duplicating logic across files. |
| `project-structure.mdc` | **Always** (`alwaysApply: true`). | It keeps the repo organized with feature-first folders, a tidy root, stable entry points, and consistent colocated tests. |
| `cyber-security.mdc` | **Always** (`alwaysApply: true`). | It reinforces secure defaults for secrets, input handling, authorization, crypto, dependencies, and logging without leaking sensitive data. |
| `use-latest-version-long-term-support-versions.mdc` | **Always** (`alwaysApply: true`). | It steers toolchains and libraries toward LTS or current stable releases, sensible pinning, and timely security patches. |
| `markdown-style.mdc` | **Glob only**: when open or relevant files match `**/*.{md,mdx}`. Also when **@‑mentioned**. | It standardizes Markdown structure, lists, code samples, links, and README sections when working in `.md` or `.mdx` files. |

For VS Code UI settings bundled with this workspace, see **`.vscode/settings.json`** at the repo root (that file is not a Cursor rule).
