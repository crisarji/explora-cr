#!/usr/bin/env node
/**
 * Dependency health check, run automatically at session start (see
 * .claude/settings.json SessionStart hook). Combines `pnpm outdated` +
 * `pnpm audit` into one compact report: what's outdated, at what semver
 * priority, whether it carries a security advisory, and a recommendation.
 *
 * pnpm audit --json uses the legacy npm-audit-v1 shape (advisories keyed
 * by numeric id + a top-level actions list), not the newer
 * vulnerabilities-keyed-by-package-name shape `npm audit --json` returns —
 * this parser is pnpm-specific, not a generic npm/pnpm shim.
 *
 * Results are cached for CACHE_HOURS so repeated session starts on the
 * same day don't re-hit the registry every time. Delete the cache file
 * (or wait it out) to force a fresh check. Never throws — any failure
 * (offline, pnpm error) degrades to a short note rather than blocking
 * session start.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const CACHE_FILE = path.join(ROOT, ".claude", ".deps-cache.json");
const CACHE_HOURS = 6;

function emit(text) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: text,
      },
    })
  );
}

function readCache() {
  try {
    if (!existsSync(CACHE_FILE)) return null;
    const cache = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
    const ageHours = (Date.now() - cache.checkedAt) / 3_600_000;
    return ageHours < CACHE_HOURS ? cache.report : null;
  } catch {
    return null;
  }
}

function writeCache(report) {
  try {
    mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify({ checkedAt: Date.now(), report }));
  } catch {
    // Cache is a perf nicety, not required for correctness — ignore write failures.
  }
}

function runJson(cmd) {
  // pnpm outdated/audit exit non-zero when they find anything — that's
  // not a failure for us, so read stdout regardless of exit code.
  try {
    return JSON.parse(execSync(cmd, { cwd: ROOT, encoding: "utf8", timeout: 20_000 }));
  } catch (err) {
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function bumpType(current, latest) {
  const c = String(current).replace(/^[^\d]*/, "").split(".").map(Number);
  const l = String(latest).replace(/^[^\d]*/, "").split(".").map(Number);
  if (l[0] > c[0]) return "major";
  if (l[1] > c[1]) return "minor";
  return "patch";
}

/**
 * Maps each package name to its worst advisory + whether pnpm's own
 * `actions` list proposes an automatic "update" (no manual review needed)
 * for every advisory affecting it.
 */
function buildAdvisoryMap(audit) {
  const advisories = audit.advisories ?? {};
  const updateableIds = new Set();
  for (const action of audit.actions ?? []) {
    if (action.action === "update") {
      for (const r of action.resolves ?? []) updateableIds.add(r.id);
    }
  }

  const byModule = new Map();
  const severityRank = { critical: 4, high: 3, moderate: 2, low: 1, info: 0 };
  for (const [idStr, adv] of Object.entries(advisories)) {
    const id = Number(idStr);
    const name = adv.module_name;
    if (!name) continue;
    const entry = byModule.get(name) ?? { severity: adv.severity, allUpdateable: true };
    if ((severityRank[adv.severity] ?? 0) > (severityRank[entry.severity] ?? 0)) {
      entry.severity = adv.severity;
    }
    if (!updateableIds.has(id)) entry.allUpdateable = false;
    byModule.set(name, entry);
  }
  return byModule;
}

function buildReport() {
  const outdated = runJson("pnpm outdated --format json") ?? {};
  const audit = runJson("pnpm audit --json") ?? {};
  const advisoryMap = buildAdvisoryMap(audit);

  const rows = Object.entries(outdated).map(([name, info]) => {
    const bump = bumpType(info.current, info.latest);
    const adv = advisoryMap.get(name);
    let recommendation;
    if (adv) {
      recommendation = adv.allUpdateable
        ? `update — fix available for a ${adv.severity} advisory`
        : `advisory (${adv.severity}) has no clean automatic fix — monitor, don't force`;
    } else if (bump === "major") {
      recommendation = "review changelog before updating (major bump)";
    } else if (bump === "minor") {
      recommendation = "usually safe — update when convenient";
    } else {
      recommendation = "safe to update";
    }
    return { name, current: info.current, latest: info.latest, bump, vuln: !!adv, recommendation };
  });

  // Advisories on packages `pnpm outdated` didn't list separately (e.g.
  // nested transitive deps like sharp/postcss bundled inside `next`).
  const advisoryOnly = [...advisoryMap.entries()]
    .filter(([name]) => !outdated[name])
    .map(([name, adv]) => ({ name, ...adv }));

  if (rows.length === 0 && advisoryOnly.length === 0) {
    return "Dependency check: all packages up to date, no security advisories.";
  }

  const lines = [`Dependency check (explora-cr) — ${rows.length} outdated, ${advisoryOnly.length + rows.filter((r) => r.vuln).length} advisories:`];

  for (const r of rows.sort((a, b) => (b.vuln ? 1 : 0) - (a.vuln ? 1 : 0))) {
    lines.push(`- ${r.name}: ${r.current} → ${r.latest} [${r.bump}${r.vuln ? ", SECURITY" : ""}] — ${r.recommendation}`);
  }
  for (const a of advisoryOnly) {
    const rec = a.allUpdateable
      ? "run pnpm audit --fix — fix available"
      : "no clean automatic fix yet — monitor via Dependabot, don't force a major downgrade";
    lines.push(`- ${a.name} (transitive): ${a.severity} advisory, not directly outdated — ${rec}`);
  }

  return lines.join("\n");
}

const cached = readCache();
if (cached) {
  emit(cached);
} else {
  const report = buildReport();
  writeCache(report);
  emit(report);
}
