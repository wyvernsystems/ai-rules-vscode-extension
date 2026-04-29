# Cursor project rules (this repo)

## How rules work

Cursor **project rules** are Markdown files with optional YAML **frontmatter**, stored under `.cursor/rules/` (in this repository they live in the subfolder **`cursor-rules-vscode-extension/`**). Each file is usually **`.mdc`**, which supports `description`, `globs`, and `alwaysApply` in the frontmatter. Cursor decides which rules to include in a chat based on that metadata: **`alwaysApply: true`** rules are candidates for every conversation; others apply when **file paths match `globs`** (e.g. only while editing `*.md`) or when you **@‑mention** a rule. The agent then follows the **body** of those rules as extra instructions—rules are versioned with the repo like normal docs.

## Rule reference

| Rule | Summary |
|------|---------|
| `state-active-project-rules.mdc` | At the start of a new chat or agent run, it tells you which project rules apply, using each rule’s filename and a short phrase. |
| `how-to-write-rules.mdc` | It documents where `.mdc` files go, what frontmatter to use, naming conventions, and a merge checklist for this rules folder. |
| `cursor-rules-maintenance.mdc` | It guides how to edit, review quality, deprecate, and keep rule examples and links in sync when you touch rule files. |
| `evolving-project-rules.mdc` | It describes when changing code should prompt new or updated rules and how to spot patterns without one oversized rule file. |
| `write-clean-code.mdc` | It sets expectations for readable code: naming, function size, meaningful comments, explicit dependencies, and clear errors. |
| `reuse-over-duplication.mdc` | It tells the agent to search for existing helpers and reuse or extract shared code instead of duplicating logic across files. |
| `project-structure.mdc` | It keeps the repo organized with feature-first folders, a tidy root, stable entry points, and consistent colocated tests. |
| `cyber-security.mdc` | It reinforces secure defaults for secrets, input handling, authorization, crypto, dependencies, and logging without leaking sensitive data. |
| `use-latest-version-long-term-support-versions.mdc` | It steers toolchains and libraries toward LTS or current stable releases, sensible pinning, and timely security patches. |
| `markdown-style.mdc` | It standardizes Markdown structure, lists, code samples, links, and README sections when working in `.md` or `.mdx` files. |

For VS Code UI settings bundled with this workspace, see **`.vscode/settings.json`** at the repo root (that file is not a Cursor rule).
