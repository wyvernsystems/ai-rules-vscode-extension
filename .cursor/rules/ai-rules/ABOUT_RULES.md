# About these rules

This document describes how the pack is organized and what each rule file does.

## How rules work

Cursor **project rules** are Markdown files with optional YAML **frontmatter**, stored under **`.cursor/rules/`**. In this repository they live in **`.cursor/rules/ai-rules/`** with rule files grouped into three subfolders. Each file is `.mdc`, supporting `description`, `globs`, and `alwaysApply` in its frontmatter. Cursor decides which rules to include based on that metadata: `alwaysApply: true` rules are candidates for every conversation; others apply when **file paths match `globs`** (e.g. only while editing `*.md`) or when you **@-mention** a rule. The agent then follows the **body** of those rules as extra instructions—rules are versioned with the repo like normal docs.

## Layout

```text
.cursor/rules/ai-rules/
├── ABOUT_RULES.md
├── coding-rules/            # how to write and ship code
├── documentation-rules/     # how to maintain docs and changelogs
└── rules-for-rules/         # how the rule pack itself is authored and announced
```

## Rule reference

### `coding-rules/`

| Rule | When it runs | Summary |
|------|--------------|---------|
| `write-clean-code.mdc` | Always (`alwaysApply: true`). | Sets expectations for readable code: naming, function size, meaningful comments, explicit dependencies, clear errors. |
| `reuse-code-before-duplicating.mdc` | Always. | Search for existing helpers and reuse or extract shared code instead of duplicating logic. |
| `organize-repository-by-feature.mdc` | Always. | Keeps the repo organized with feature-first folders, a tidy root, stable entry points, colocated tests. |
| `secure-code-data-and-dependencies.mdc` | Always. | Secure defaults for secrets, input handling, authorization, crypto, dependencies, and logging. |
| `prefer-lts-stable-runtimes-and-libraries.mdc` | Always. | Steers toolchains and libraries toward LTS or current stable releases, sensible pinning, and security patches. |
| `verify-syntax-and-fix-before-finishing.mdc` | Always. | Re-checks touched files for syntax/type issues and fixes problems the agent can address. |
| `remove-dead-code-and-unused-files.mdc` | Always. | Looks for unused code and orphan files after changes; removes only when clearly safe. |

### `documentation-rules/`

| Rule | When it runs | Summary |
|------|--------------|---------|
| `update-changelog-for-notable-changes.mdc` | Always. | Prompts updates to `CHANGELOG.md` for user-visible or release-worthy changes (Keep a Changelog style). |
| `append-and-deduplicate-requirements.mdc` | Always. | Adds stated requirements to `REQUIREMENTS.md` (or `docs/REQUIREMENTS.md`) and merges near-duplicates. |
| `use-this-format-for-markdown-files.mdc` | Glob-only: when open or relevant files match `**/*.{md,mdx}`. Also when **@-mentioned**. | Standardizes Markdown structure, lists, code samples, links, and README sections. |

### `rules-for-rules/`

| Rule | When it runs | Summary |
|------|--------------|---------|
| `state-active-project-rules.mdc` | Always. | At the start of a new chat or agent run, prints a verbatim **`### Active project rules`** block listing each active rule. |
| `evolve-rules-when-codebase-patterns-change.mdc` | Always (when not renamed `.mdc.disabled`). | Describes when changing code should prompt new or updated rules and how to spot patterns. |
| `write-cursor-rules-for-this-project.mdc` | Glob-only when paths match `**/.cursor/rules/ai-rules/**/*.mdc`. Also when **@-mentioned**. | Documents where `.mdc` files go, what frontmatter to use, naming conventions, and a merge checklist. |
| `maintain-cursor-rules.mdc` | Glob-only with the same pattern. Also when **@-mentioned**. | Guides editing, quality review, deprecation, and keeping rule examples and links in sync. |

For VS Code UI settings bundled with this workspace, see **`.vscode/settings.json`** at the repo root (that file is not a Cursor rule).

## Extension vs repo (AI Rules VSIX)

The **AI Rules** extension ships a copy under **`bundled/ai-rules/`** with the same subfolder layout. The **source of truth** for this repository is **`.cursor/rules/ai-rules/`**. After editing rules here, run `npm run sync-bundled` (and `npm run verify:bundled` to confirm they match) before packaging the extension.
