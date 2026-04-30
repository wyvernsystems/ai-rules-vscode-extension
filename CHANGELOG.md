# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Rewrote every rule under `.cursor/rules/ai-rules/` for clarity and lower token
  cost: imperative bullets, fewer adjectives, and one example per rule only when
  it prevents misreads. Total rule pack size reduced from ~26.2 KB to ~19.8 KB
  (~24% smaller) without dropping intent.
- `state-active-project-rules.mdc` now includes a verbatim copy-paste template
  for the **`### Active project rules`** section so models comply more reliably.
- Reorganized the rule pack into three subfolders inside
  `.cursor/rules/ai-rules/`:
  - `coding-rules/` — write/reuse/organize/secure/LTS/verify/dead-code rules.
  - `documentation-rules/` — changelog, requirements, markdown formatting.
  - `rules-for-rules/` — meta rules that govern how the pack itself is authored
    and announced.
- Updated `mdc:` cross-links and the `state-active-project-rules.mdc` template
  to use the new subfolder paths so the rendered "Active project rules" block
  reflects the layout on disk.

### Fixed

- `scripts/sync-bundled.mjs` now walks recursively when generating
  `bundled/manifest.json`, so manifest paths include subfolders (e.g.
  `coding-rules/write-clean-code.mdc`).
- `src/rulesOperations.ts`:
  - `installBundleToRulesDir` and `setRuleEnabled` create parent directories
    before copying or renaming, so subfolder rules install and toggle
    correctly.
  - `deleteUnshippedFiles` walks the rules directory recursively when checking
    which files are part of the bundle.
  - The Cline mirror writer flattens any subfolder path into the output
    filename (`ai-rules-coding-rules-write-clean-code.md`) to avoid collisions
    and keep `.clinerules/ai-rules/` flat.
  - `EVOLVE_RULE` now points at `rules-for-rules/evolve-rules-when-codebase-patterns-change.mdc`.
- `src/extension.ts` "Copy global mirror into workspace" creates parent
  directories before each `copyFile`.
- `ABOUT_RULES.md` and `README.md` updated to describe the new layout.
