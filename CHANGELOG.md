# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Sidebar tree view** (`AI Rules: Rules`) contributed under a new activity-bar
  view container `aiRulesSidebar`:
  - Subfolder → rule hierarchy with a real **TreeItem checkbox** per rule that
    flips `<name>.mdc` ↔ `<name>.mdc.disabled` via the existing rename helper.
  - Click a rule's label to open the `.mdc` file in the editor.
  - View title actions for **Plan / Build / Test / Role…** modes plus a
    refresh icon; overflow includes bulk install / enable-all / disable-all /
    reset / show-pack-status.
  - Folder rows expose inline **Enable / Disable** actions that toggle every
    rule under the selected subfolder.
- New commands wiring the sidebar:
  - `aiRules.refreshTree`, `aiRules.revealRuleFile`,
  - `aiRules.enableFolder`, `aiRules.disableFolder`.
- New module `src/sidebarTreeView.ts` (`RulesTreeProvider`,
  `bindRulesTreeView`, `RULES_TREE_VIEW_ID`).
- **Role rules** (`.cursor/rules/ai-rules/role-rules/`)—8 audience-framing rules,
  off by default, toggled by the new mode commands:
  - `role-developer.mdc`, `role-architect.mdc`, `role-tester.mdc`,
    `role-cyber-expert.mdc`, `role-product-manager.mdc`, `role-beginner.mdc`,
    `role-expert.mdc`, `role-end-user.mdc`.
- **Test rules** (`.cursor/rules/ai-rules/test-rules/`)—5 testing playbooks,
  off by default, enabled together by `Mode — Test`:
  - `write-unit-tests.mdc`, `write-smoke-tests.mdc`,
    `write-regression-tests.mdc`, `write-integration-tests.mdc`,
    `write-end-to-end-tests.mdc`.
- **Mode commands** (the AI Rules VS Code extension):
  - `AI Rules: Mode — Plan` (architect role, no test rules)
  - `AI Rules: Mode — Build` (developer role, no test rules)
  - `AI Rules: Mode — Test` (tester role + every test rule)
  - `AI Rules: Mode — Role…` (QuickPick: enable one role, disable the others)
- New module `src/modes.ts` defining the mode preset shape and helpers
  (`applyModeProfile`, `applyRolePick`, `MODE_PROFILES`, `ROLE_RULES`,
  `TEST_RULES`).
- `state-active-project-rules.mdc` now lists role and test rules as add-on rows
  the assistant should print when those rules are actually injected.

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
