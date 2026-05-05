/**
 * Mode presets for the AI Rulebook pack.
 *
 * Rules are toggled via `setRuleEnabled` (rename `.mdc` ↔ `.mdc.disabled`).
 * Plan / Test restore the full coding + meta set when leaving Build's lighter
 * profile. Low-token keeps only a minimal subset for long, efficient sessions.
 *
 * The set of all shipped rule paths is taken from the loaded bundle manifest
 * (`bundled/manifest.json`) so this file isn't a second source of truth.
 */
import { setRuleEnabled } from "./rulesOperations";

export const ROLE_RULES = [
  "role-rules/role-developer.mdc",
  "role-rules/role-architect.mdc",
  "role-rules/role-tester.mdc",
  "role-rules/role-cyber-expert.mdc",
  "role-rules/role-product-manager.mdc",
  "role-rules/role-beginner.mdc",
  "role-rules/role-expert.mdc",
  "role-rules/role-end-user.mdc",
] as const;

export const TEST_RULES = [
  "test-rules/write-unit-tests.mdc",
  "test-rules/write-smoke-tests.mdc",
  "test-rules/write-regression-tests.mdc",
  "test-rules/write-integration-tests.mdc",
  "test-rules/write-end-to-end-tests.mdc",
] as const;

/** Coding rules turned **off** in Build mode (lighter developer default). */
export const BUILD_OFF_CODING_RULES = [
  "coding-rules/secure-code-data-and-dependencies.mdc",
] as const;

export const RULES_FOR_RULES = [
  "rules-for-rules/evolve-rules-when-codebase-patterns-change.mdc",
  "rules-for-rules/state-active-project-rules-in-prompt-response.mdc",
  "rules-for-rules/write-cursor-rules-for-this-project.mdc",
] as const;

/** Re-enabled when switching to Plan or Test after Build. */
export const BUILD_AND_META_RESTORE = [...BUILD_OFF_CODING_RULES, ...RULES_FOR_RULES] as const;

/** Rules left **on** in Low-token mode (minimal context + handoff utility). */
export const LOW_TOKEN_ON = [
  "coding-rules/write-clean-code.mdc",
  "coding-rules/organize-repository-by-feature.mdc",
  "coding-rules/reuse-code-before-duplicating.mdc",
  "context-rules/dense-session-handoff-context.mdc",
  "context-rules/low-token-session-habits.mdc",
  "documentation-rules/append-and-deduplicate-requirements.mdc",
  "documentation-rules/update-changelog-for-notable-changes.mdc",
  "documentation-rules/use-this-format-for-markdown-files.mdc",
] as const;

export type Mode = "plan" | "build" | "test" | "lowToken";

export type ModeProfile = {
  /** Rule files to enable (renamed off `.disabled` if needed). */
  enable: readonly string[];
  /** Rule files to disable (renamed to `.disabled`). */
  disable: readonly string[];
  /** Short, user-facing summary for the success toast. */
  summary: string;
};

function rolesExcept(role: (typeof ROLE_RULES)[number]): readonly string[] {
  return ROLE_RULES.filter((r) => r !== role);
}

/**
 * Build a {@link ModeProfile} for `mode`. `allPackMdcs` is the full set of
 * shipped logical `.mdc` paths (manifest entries) and is only consulted by
 * `lowToken`, which disables everything that isn't in {@link LOW_TOKEN_ON}.
 */
export function getModeProfile(mode: Mode, allPackMdcs: readonly string[]): ModeProfile {
  switch (mode) {
    case "plan":
      return {
        enable: ["role-rules/role-architect.mdc", ...BUILD_AND_META_RESTORE],
        disable: [...rolesExcept("role-rules/role-architect.mdc"), ...TEST_RULES],
        summary: "Plan mode: architect on; tests off; full coding + meta rules restored.",
      };
    case "build":
      return {
        enable: ["role-rules/role-developer.mdc"],
        disable: [
          ...rolesExcept("role-rules/role-developer.mdc"),
          ...TEST_RULES,
          ...BUILD_OFF_CODING_RULES,
          ...RULES_FOR_RULES,
        ],
        summary:
          "Build mode: developer on; tests off; rules-for-rules + secure-code rule off (lightweight).",
      };
    case "test":
      return {
        enable: ["role-rules/role-tester.mdc", ...TEST_RULES, ...BUILD_AND_META_RESTORE],
        disable: rolesExcept("role-rules/role-tester.mdc"),
        summary: "Test mode: tester + all test rules on; full coding + meta rules restored.",
      };
    case "lowToken": {
      const allow = new Set<string>(LOW_TOKEN_ON);
      return {
        enable: [...LOW_TOKEN_ON],
        disable: allPackMdcs.filter((p) => !allow.has(p)),
        summary:
          "Low-token mode: minimal rules for long efficient sessions; dense handoff rule on.",
      };
    }
  }
}

export async function applyModeProfile(rulesDir: string, profile: ModeProfile): Promise<void> {
  for (const f of profile.enable) {
    await setRuleEnabled(rulesDir, f, true);
  }
  for (const f of profile.disable) {
    await setRuleEnabled(rulesDir, f, false);
  }
}

/** Disables every role rule except `pickedRole`, then enables that one. */
export async function applyRolePick(rulesDir: string, pickedRole: string): Promise<void> {
  for (const r of ROLE_RULES) {
    await setRuleEnabled(rulesDir, r, r === pickedRole);
  }
}
