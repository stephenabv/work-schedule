/**
 * Regenerates the `schedule:` cron block in
 * .github/workflows/sms-reminders.yml from lib/schedule-data.ts.
 *
 * Run whenever the class schedule changes:
 *
 *   npm run generate:crons
 *
 * Each generated cron entry fires once, in UTC, shortly before a class
 * starts (START_TICK_LEAD_MINUTES ahead) or ends (END_TICK_LEAD_MINUTES
 * ahead) — see lib/reminder-ticks.ts for the details and the reverse
 * mapping used by /api/notifications/cron.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCronExpressions } from "../lib/reminder-ticks";

const BEGIN_MARKER = "# --- BEGIN GENERATED CRONS";
const END_MARKER = "# --- END GENERATED CRONS";

const workflowPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".github",
  "workflows",
  "sms-reminders.yml"
);

const source = readFileSync(workflowPath, "utf8");
const lines = source.split("\n");
const beginIndex = lines.findIndex((l) => l.includes(BEGIN_MARKER));
const endIndex = lines.findIndex((l) => l.includes(END_MARKER));

if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) {
  console.error(
    `Could not find the "${BEGIN_MARKER}" / "${END_MARKER}" markers in ${workflowPath}.`
  );
  process.exit(1);
}

const indent = lines[beginIndex].match(/^\s*/)?.[0] ?? "    ";
const generated = buildCronExpressions().map((expr) => `${indent}- cron: "${expr}"`);

const next = [
  ...lines.slice(0, beginIndex + 1),
  ...generated,
  ...lines.slice(endIndex),
].join("\n");

writeFileSync(workflowPath, next);
console.log(`Wrote ${generated.length} cron entries to ${workflowPath}:`);
for (const line of generated) console.log(line.trim());
