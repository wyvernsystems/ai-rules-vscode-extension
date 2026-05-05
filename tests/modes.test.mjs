import { strict as assert } from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import test, { describe } from "node:test";
import { fileURLToPath } from "node:url";

import {
  applyModeProfile,
  applyRolePick,
  BUILD_AND_META_RESTORE,
  BUILD_OFF_CODING_RULES,
  getModeProfile,
  LOW_TOKEN_ON,
  ROLE_RULES,
  RULES_FOR_RULES,
  TEST_RULES,
} from "../out/modes.js";
import { isRuleEnabled, setRuleEnabled } from "../out/rulesOperations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const manifest = JSON.parse(
  await fs.readFile(path.join(repoRoot, "bundled", "manifest.json"), "utf8")
);
const allMdcs = manifest.files.filter((f) => f.endsWith(".mdc"));

async function makeRulesDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "airules-test-"));
  for (const rel of allMdcs) {
    const target = path.join(dir, rel);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, "stub\n");
  }
  return dir;
}

async function activeRules(dir) {
  const out = new Set();
  async function walk(rel) {
    const abs = path.join(dir, rel);
    for (const ent of await fs.readdir(abs, { withFileTypes: true })) {
      const next = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        await walk(next);
      } else if (ent.name.endsWith(".mdc")) {
        out.add(next);
      }
    }
  }
  await walk("");
  return out;
}

describe("getModeProfile shape", () => {
  test("plan: architect role only; full coding + meta restored", () => {
    const p = getModeProfile("plan", allMdcs);
    assert.ok(p.enable.includes("role-rules/role-architect.mdc"));
    for (const rule of BUILD_AND_META_RESTORE) assert.ok(p.enable.includes(rule));
    for (const role of ROLE_RULES) {
      if (role !== "role-rules/role-architect.mdc") assert.ok(p.disable.includes(role));
    }
    for (const t of TEST_RULES) assert.ok(p.disable.includes(t));
  });

  test("build: developer role; tests off; rules-for-rules off; build-off coding off", () => {
    const p = getModeProfile("build", allMdcs);
    assert.deepEqual(p.enable, ["role-rules/role-developer.mdc"]);
    for (const role of ROLE_RULES) {
      if (role !== "role-rules/role-developer.mdc") assert.ok(p.disable.includes(role));
    }
    for (const t of TEST_RULES) assert.ok(p.disable.includes(t));
    for (const r of RULES_FOR_RULES) assert.ok(p.disable.includes(r));
    for (const c of BUILD_OFF_CODING_RULES) assert.ok(p.disable.includes(c));
  });

  test("test: tester + all test rules; coding + meta restored", () => {
    const p = getModeProfile("test", allMdcs);
    assert.ok(p.enable.includes("role-rules/role-tester.mdc"));
    for (const t of TEST_RULES) assert.ok(p.enable.includes(t));
    for (const rule of BUILD_AND_META_RESTORE) assert.ok(p.enable.includes(rule));
    for (const role of ROLE_RULES) {
      if (role !== "role-rules/role-tester.mdc") assert.ok(p.disable.includes(role));
    }
  });

  test("lowToken: only LOW_TOKEN_ON enabled; everything else disabled", () => {
    const p = getModeProfile("lowToken", allMdcs);
    assert.deepEqual([...p.enable].sort(), [...LOW_TOKEN_ON].sort());
    const enableSet = new Set(p.enable);
    for (const r of allMdcs) {
      if (enableSet.has(r)) assert.ok(!p.disable.includes(r), `enabled rule ${r} also disabled`);
      else assert.ok(p.disable.includes(r), `${r} should be disabled in lowToken`);
    }
  });

  test("no rule appears in both enable and disable for any mode", () => {
    for (const mode of /** @type {const} */ (["plan", "build", "test", "lowToken"])) {
      const p = getModeProfile(mode, allMdcs);
      const en = new Set(p.enable);
      for (const r of p.disable) assert.ok(!en.has(r), `${mode}: ${r} both enabled & disabled`);
    }
  });
});

describe("applyModeProfile on a temp pack", () => {
  test("build then plan re-enables coding + rules-for-rules", async () => {
    const dir = await makeRulesDir();
    try {
      await applyModeProfile(dir, getModeProfile("build", allMdcs));
      let active = await activeRules(dir);
      for (const r of RULES_FOR_RULES) assert.ok(!active.has(r), `${r} should be off after build`);
      for (const c of BUILD_OFF_CODING_RULES) assert.ok(!active.has(c));
      assert.ok(active.has("role-rules/role-developer.mdc"));

      await applyModeProfile(dir, getModeProfile("plan", allMdcs));
      active = await activeRules(dir);
      for (const r of RULES_FOR_RULES) assert.ok(active.has(r), `${r} should be on after plan`);
      for (const c of BUILD_OFF_CODING_RULES) assert.ok(active.has(c));
      assert.ok(active.has("role-rules/role-architect.mdc"));
      assert.ok(!active.has("role-rules/role-developer.mdc"));
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  test("lowToken keeps exactly LOW_TOKEN_ON active", async () => {
    const dir = await makeRulesDir();
    try {
      await applyModeProfile(dir, getModeProfile("lowToken", allMdcs));
      const active = await activeRules(dir);
      assert.deepEqual([...active].sort(), [...LOW_TOKEN_ON].sort());
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  test("applyRolePick enables only the chosen role", async () => {
    const dir = await makeRulesDir();
    try {
      await applyRolePick(dir, "role-rules/role-tester.mdc");
      for (const r of ROLE_RULES) {
        const want = r === "role-rules/role-tester.mdc";
        assert.equal(await isRuleEnabled(dir, r), want, `${r} active=${want}`);
      }
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});

describe("setRuleEnabled is idempotent", () => {
  test("toggling on twice keeps file active", async () => {
    const dir = await makeRulesDir();
    try {
      const r = "role-rules/role-developer.mdc";
      await setRuleEnabled(dir, r, true);
      await setRuleEnabled(dir, r, true);
      assert.equal(await isRuleEnabled(dir, r), true);
      await setRuleEnabled(dir, r, false);
      await setRuleEnabled(dir, r, false);
      assert.equal(await isRuleEnabled(dir, r), false);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
