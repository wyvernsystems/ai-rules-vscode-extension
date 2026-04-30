import * as vscode from "vscode";

/**
 * Detects whether the host application is Cursor (vs vanilla VS Code,
 * VSCodium, etc.). Two signals are checked because both have been observed
 * across Cursor builds:
 *
 *   - `vscode.env.uriScheme` is `"cursor"` in Cursor and `"vscode"` /
 *     `"vscodium"` elsewhere. This is set at IDE-build time and is the
 *     most reliable signal.
 *   - `vscode.env.appName` typically reads `"Cursor"` (or
 *     `"Cursor - Insiders"` / similar) in Cursor builds.
 *
 * Used to gate the auto-install of `.cursor/rules/ai-rules/` so we only
 * create the folder in IDEs that actually consume it. Manual install
 * commands (e.g. `aiRules.installWorkspace`) bypass this check because
 * the user explicitly asked for the folder regardless of host.
 */
export function isCursorHost(): boolean {
  if (vscode.env.uriScheme === "cursor") {
    return true;
  }
  return vscode.env.appName.toLowerCase().includes("cursor");
}

export type CursorInstallPolicy = "auto" | "always" | "never";

const VALID_POLICIES: readonly CursorInstallPolicy[] = ["auto", "always", "never"];

export function readCursorInstallPolicy(): CursorInstallPolicy {
  const raw = vscode.workspace.getConfiguration("aiRules").get<string>("installCursorRulesFolder");
  if (typeof raw === "string" && (VALID_POLICIES as readonly string[]).includes(raw)) {
    return raw as CursorInstallPolicy;
  }
  return "auto";
}

/**
 * Resolves the configured policy against the detected host into a single
 * "should I auto-install Cursor rules?" boolean. Manual commands ignore this.
 */
export function shouldAutoInstallCursorRules(): boolean {
  const policy = readCursorInstallPolicy();
  if (policy === "never") {
    return false;
  }
  if (policy === "always") {
    return true;
  }
  return isCursorHost();
}
