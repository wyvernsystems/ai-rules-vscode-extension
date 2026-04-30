/**
 * Mode presets for the AI Rulebook pack.
 *
 * Each mode flips a curated set of `role-rules/*` and `test-rules/*` files on
 * or off via the existing `setRuleEnabled` rename mechanism. We do not touch
 * always-on coding rules here—those stay enabled across modes—because rules
 * the user explicitly disables should not be silently re-enabled by a mode.
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

export type Mode = "plan" | "build" | "test";

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

export const MODE_PROFILES: Record<Mode, ModeProfile> = {
  plan: {
    enable: ["role-rules/role-architect.mdc"],
    disable: [...rolesExcept("role-rules/role-architect.mdc"), ...TEST_RULES],
    summary: "Plan mode: architect role on, tests off.",
  },
  build: {
    enable: ["role-rules/role-developer.mdc"],
    disable: [...rolesExcept("role-rules/role-developer.mdc"), ...TEST_RULES],
    summary: "Build mode: developer role on, tests off.",
  },
  test: {
    enable: ["role-rules/role-tester.mdc", ...TEST_RULES],
    disable: rolesExcept("role-rules/role-tester.mdc"),
    summary: "Test mode: tester role on, all test rules on.",
  },
};

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
