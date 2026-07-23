#!/usr/bin/env node
/**
 * Dependency health check, run automatically at session start (see
 * .claude/settings.json SessionStart hook). Combines `npm outdated` +
 * `npm audit` into one compact report: what's outdated, at what semver
 * priority, whether it carries a security advisory, and a recommendation.
 *
 * Results are cached for CACHE_HOURS so repeated session starts on the
 * same day don't re-hit the registry every time. Delete the cache file
 * (or wait it out) to force a fresh check. Never throws — any failure
 * (offline, npm error) degrades to a short note rather than blocking
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
  // npm outdated/audit exit non-zero when they find anything — that's not
  // a failure for us, so read stdout regardless of exit code.
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

function buildReport() {
  const outdated = runJson("npm outdated --json") ?? {};
  const audit = runJson("npm audit --json") ?? {};
  const vulns = audit.vulnerabilities ?? {};

  const rows = Object.entries(outdated).map(([name, info]) => {
    const bump = bumpType(info.current, info.latest);
    const vuln = vulns[name];
    let recommendation;
    if (vuln) {
      const fix = vuln.fixAvailable;
      const nonBreakingFix = fix === true || (fix && fix.isSemVerMajor === false);
      recommendation = nonBreakingFix
        ? `update — non-breaking fix for a ${vuln.severity} advisory`
        : `advisory (${vuln.severity}) has no safe non-breaking fix yet — monitor, don't force`;
    } else if (bump === "major") {
      recommendation = "review changelog before updating (major bump)";
    } else if (bump === "minor") {
      recommendation = "usually safe — update when convenient";
    } else {
      recommendation = "safe to update";
    }
    return { name, current: info.current, latest: info.latest, bump, vuln: !!vuln, recommendation };
  });

  // Advisories on packages npm outdated didn't list separately (e.g.
  // nested transitive deps like sharp/postcss bundled inside `next`).
  const advisoryOnly = Object.entries(vulns)
    .filter(([name]) => !outdated[name])
    .map(([name, v]) => ({ name, severity: v.severity, fixAvailable: v.fixAvailable }));

  if (rows.length === 0 && advisoryOnly.length === 0) {
    return "Dependency check: all packages up to date, no security advisories.";
  }

  const lines = [`Dependency check (explora-cr) — ${rows.length} outdated, ${advisoryOnly.length + rows.filter(r => r.vuln).length} advisories:`];

  for (const r of rows.sort((a, b) => (b.vuln ? 1 : 0) - (a.vuln ? 1 : 0))) {
    lines.push(`- ${r.name}: ${r.current} → ${r.latest} [${r.bump}${r.vuln ? ", SECURITY" : ""}] — ${r.recommendation}`);
  }
  for (const a of advisoryOnly) {
    const fix = a.fixAvailable;
    const nonBreakingFix = fix === true || (fix && fix.isSemVerMajor === false);
    const rec = nonBreakingFix
      ? "run npm audit fix — non-breaking fix available"
      : "no safe non-breaking fix yet — monitor via Dependabot, don't force a major downgrade";
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
