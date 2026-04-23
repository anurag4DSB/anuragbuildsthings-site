#!/usr/bin/env node
// Mechanical px -> rem converter for styles.css.
//
// Operates line-by-line on styles.css. For each declaration line, extracts the
// property name and value portion, decides whether the property is on the CONVERT
// whitelist, and rewrites bare `Npx` tokens in the value to rem (N/16), keeping
// `!important`, url(), var(), media query widths, sub-4px optical tweaks, and
// KEEP-listed properties (border*, outline*, shadows, filter) untouched.
//
// Usage:
//   node scripts/px-to-rem.mjs              # dry-run, prints unified diff to stdout
//   node scripts/px-to-rem.mjs --apply      # rewrites styles.css in place
//   node scripts/px-to-rem.mjs --report     # writes scripts/px-to-rem-report.json
//                                           # (can combine with --apply)

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STYLES_PATH = path.join(ROOT, 'styles.css');
const REPORT_PATH = path.join(__dirname, 'px-to-rem-report.json');

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const REPORT = args.has('--report');

// ---------- property classification ----------

// Properties whose px values represent logical spacing/sizing and should become rem.
const CONVERT_PROPS = new Set([
  // typography
  'font-size',
  'line-height', // only if it has a px unit; unitless numbers are skipped automatically
  'letter-spacing',
  'word-spacing',
  'text-indent',
  // box spacing
  'margin',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-block', 'margin-block-start', 'margin-block-end',
  'margin-inline', 'margin-inline-start', 'margin-inline-end',
  'padding',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-block', 'padding-block-start', 'padding-block-end',
  'padding-inline', 'padding-inline-start', 'padding-inline-end',
  'gap', 'row-gap', 'column-gap',
  // box sizing
  'width', 'min-width', 'max-width',
  'height', 'min-height', 'max-height',
  // positioning
  'top', 'right', 'bottom', 'left',
  'inset', 'inset-block', 'inset-block-start', 'inset-block-end',
  'inset-inline', 'inset-inline-start', 'inset-inline-end',
]);

// Properties we explicitly keep as px. Used for reporting the reason; anything
// not on CONVERT_PROPS is effectively kept too.
const KEEP_PROP_PREFIXES = [
  'border',      // border, border-*, border-radius, border-width, ...
  'outline',     // outline, outline-*
];
const KEEP_PROPS_EXACT = new Set([
  'box-shadow',
  'text-shadow',
  'filter',
  '-webkit-filter',
  'backdrop-filter',
  '-webkit-backdrop-filter',
]);

function classifyProperty(prop) {
  if (!prop) return { kind: 'unknown' };
  const p = prop.toLowerCase();
  if (CONVERT_PROPS.has(p)) return { kind: 'convert' };
  for (const pref of KEEP_PROP_PREFIXES) {
    if (p === pref || p.startsWith(pref + '-')) {
      return { kind: 'keep', reason: `${pref}*-property` };
    }
  }
  if (KEEP_PROPS_EXACT.has(p)) return { kind: 'keep', reason: `${p}-property` };
  return { kind: 'keep', reason: 'property-not-in-convert-list' };
}

// ---------- value rewriting ----------

function formatRem(remValue) {
  if (remValue === 0) return '0';
  // 4 decimal places, strip trailing zeros and trailing dot.
  let s = remValue.toFixed(4);
  s = s.replace(/\.?0+$/, '');
  return `${s}rem`;
}

// Replace bare `Npx` / `N.Mpx` tokens inside a value string, skipping those
// sitting inside url(...) / var(...) parens.
// For each px match we consult `decide(n, context)` where context is 'top' (direct
// value), or the function name ('clamp' | 'min' | 'max' | 'calc') when nested.
function rewriteValue(value, decide) {
  // We scan char-by-char. Maintain a stack of "zones": 'url' / 'var' skip zones,
  // and function-name zones for clamp/min/max/calc so decide() sees context.
  let out = '';
  const zones = []; // each: { type: 'skip' | 'fn', name }
  const conversions = []; // { raw, converted, action, reason }
  let i = 0;
  const n = value.length;

  const topContext = () => {
    for (let k = zones.length - 1; k >= 0; k--) {
      if (zones[k].type === 'fn') return zones[k].name;
    }
    return 'top';
  };
  const inSkip = () => zones.some(z => z.type === 'skip');

  while (i < n) {
    const ch = value[i];

    // Detect identifier / function call openings. CSS idents can start with
    // `--` (custom prop), `-` followed by letter (vendor prefix), or a letter.
    // They must NOT start with `-` followed by a digit - that's a negative
    // number, which we want to fall through to the px-match branch.
    const isIdentStart =
      /[a-zA-Z_]/.test(ch) ||
      (ch === '-' && i + 1 < n && /[a-zA-Z_-]/.test(value[i + 1]));
    if (isIdentStart) {
      let j = i;
      while (j < n && /[a-zA-Z0-9_-]/.test(value[j])) j++;
      const ident = value.slice(i, j).toLowerCase();
      if (value[j] === '(') {
        out += value.slice(i, j + 1);
        if (ident === 'url' || ident === 'var') {
          zones.push({ type: 'skip', name: ident });
        } else {
          zones.push({ type: 'fn', name: ident });
        }
        i = j + 1;
        continue;
      }
      // Not a function; emit as-is.
      out += value.slice(i, j);
      i = j;
      continue;
    }

    if (ch === '(') {
      // bare '(' without an identifier - treat as a neutral group, push a fn zone
      // so matching ')' pops it.
      out += ch;
      zones.push({ type: 'fn', name: 'group' });
      i++;
      continue;
    }

    if (ch === ')') {
      out += ch;
      if (zones.length) zones.pop();
      i++;
      continue;
    }

    // Try to match a px token: optional sign, digits, optional .digits, then 'px'.
    // Only at a "numeric start" position (not mid-ident).
    if (/[0-9.+-]/.test(ch)) {
      // Guard: if prev char is a letter/digit/underscore, this is mid-ident, skip.
      const prev = out.length ? out[out.length - 1] : '';
      if (!/[a-zA-Z0-9_]/.test(prev)) {
        const m = value.slice(i).match(/^([+-]?\d*\.?\d+)px\b/);
        if (m) {
          const raw = m[0];
          const num = parseFloat(m[1]);
          const ctx = topContext();
          if (inSkip()) {
            out += raw;
            conversions.push({ raw, converted: raw, action: 'keep', reason: 'inside-url-or-var' });
          } else {
            const verdict = decide(num, ctx);
            if (verdict.action === 'convert') {
              const converted = formatRem(num / 16);
              out += converted;
              conversions.push({ raw, converted, action: 'convert', reason: verdict.reason });
            } else {
              out += raw;
              conversions.push({ raw, converted: raw, action: 'keep', reason: verdict.reason });
            }
          }
          i += raw.length;
          continue;
        }
      }
    }

    out += ch;
    i++;
  }

  return { value: out, conversions };
}

// ---------- line parsing ----------

// Split a line into zero or more declaration segments we can transform.
// Returns an array of parts:
//   { kind: 'literal', text }          - emit as-is
//   { kind: 'decl', prop, value, sep } - rewritable; `sep` is the terminator
//                                        (';', '}' with trailing bits, or '' for
//                                        a line-final value with no semicolon)
//
// This handles:
//   - standard "  prop: value;"         (one decl, literal prefix = indent)
//   - inline rule ".foo { prop: val; }" (literal selector, decl, literal '}')
//   - line-final value without ';' for the last declaration in a block
//
// The key invariant: joining all parts back produces the original line.
function parseLine(line) {
  const parts = [];
  let i = 0;
  const n = line.length;

  // Walk the line. We're in "literal" mode until we encounter a token that
  // looks like a declaration start: an identifier followed by ':'.
  // Declaration start must come after:
  //   - start of line (possibly preceded by whitespace/indent) OR
  //   - '{' (inline rule body opens) OR
  //   - ';' (previous decl ended)
  // We use a small state machine with lookahead.

  let litStart = 0;
  const canStartDecl = (pos) => {
    // Look backwards from pos (exclusive) past whitespace. Prev non-ws char must
    // be one of: undefined (BOL), '{', ';'.
    let k = pos - 1;
    while (k >= 0 && /[ \t]/.test(line[k])) k--;
    if (k < 0) return true;
    return line[k] === '{' || line[k] === ';';
  };

  while (i < n) {
    if (canStartDecl(i)) {
      const m = line.slice(i).match(/^([-a-zA-Z_][-a-zA-Z0-9_]*)\s*:/);
      if (m) {
        const prop = m[1];
        const afterColon = i + m[0].length;
        // Find end of value: first ';' or '}' at the current brace depth, or EOL.
        // For our simple CSS, no nested {} appears inside a value.
        let j = afterColon;
        let parenDepth = 0;
        while (j < n) {
          const ch = line[j];
          if (ch === '(') parenDepth++;
          else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
          else if (parenDepth === 0 && (ch === ';' || ch === '}')) break;
          j++;
        }
        const value = line.slice(afterColon, j);
        // Emit any preceding literal.
        if (litStart < i) parts.push({ kind: 'literal', text: line.slice(litStart, i) });
        // Emit decl. "Head" = from start of prop name through ':'.
        const head = line.slice(i, afterColon);
        const sep = j < n && line[j] === ';' ? ';' : '';
        parts.push({ kind: 'decl', head, prop, value, sep });
        i = j + (sep ? 1 : 0);
        litStart = i;
        continue;
      }
    }
    i++;
  }
  if (litStart < n) parts.push({ kind: 'literal', text: line.slice(litStart) });
  return parts;
}

// ---------- main transform ----------

function transform(source) {
  const lines = source.split('\n');
  const out = [];
  const reportEntries = [];

  // Track @media parenthesized-width context: when inside such a rule, keep px.
  // We do this by tracking block depth and whether each open block is a media rule.
  // Stack entries: { media: boolean }
  const blockStack = [];

  // We also need to watch for the *line* that opens a media block, because the
  // conditions are on that same line (e.g. `@media (max-width: 700px) {`), and
  // those px values must be preserved regardless.
  // We skip conversion for any line whose trimmed text starts with `@media`.

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    const trimmed = rawLine.trim();

    // Detect @media line before touching the braces.
    const isMediaLine = /^@media\b/i.test(trimmed);

    // Update block stack based on braces on THIS line AFTER we've done our work.
    // But we need to know the current context (are we inside media?) when
    // processing this line's declarations.
    const insideMedia = blockStack.some(b => b.media);

    let processedLine = rawLine;

    if (isMediaLine) {
      // Leave as-is. Media query width values stay px by convention.
      // Still report the px occurrences for the audit trail.
      const pxMatches = [...rawLine.matchAll(/(\d*\.?\d+)px/g)];
      for (const pm of pxMatches) {
        reportEntries.push({
          line: lineIdx + 1,
          property: '@media',
          raw: pm[0],
          converted: pm[0],
          action: 'keep',
          reason: 'media-query-condition',
        });
      }
    } else {
      const parts = parseLine(rawLine);
      const hasPx = /\d+\.?\d*px/.test(rawLine);
      const hasDecl = parts.some(p => p.kind === 'decl');

      if (hasDecl) {
        const rebuilt = [];
        for (const p of parts) {
          if (p.kind === 'literal') {
            rebuilt.push(p.text);
            continue;
          }
          // decl: classify and rewrite value
          const cls = classifyProperty(p.prop);
          const propLower = p.prop.toLowerCase();
          const decide = (num /*, ctx */) => {
            if (num < 4) {
              return { action: 'keep', reason: 'sub-4px-optical' };
            }
            if (cls.kind === 'convert') {
              return { action: 'convert', reason: `${propLower}-convert` };
            }
            return { action: 'keep', reason: cls.reason || 'property-kept' };
          };
          const { value: newValue, conversions } = rewriteValue(p.value, decide);
          for (const c of conversions) {
            reportEntries.push({
              line: lineIdx + 1,
              property: p.prop,
              raw: c.raw,
              converted: c.converted,
              action: c.action,
              reason: c.reason,
            });
          }
          rebuilt.push(p.head + newValue + p.sep);
        }
        processedLine = rebuilt.join('');
      } else if (hasPx) {
        // Line has px but no declaration we can parse (comment, keyframe step
        // with complex shapes, etc.). Report but don't modify.
        const pxMatches = [...rawLine.matchAll(/(\d*\.?\d+)px/g)];
        for (const pm of pxMatches) {
          reportEntries.push({
            line: lineIdx + 1,
            property: '(unparsed)',
            raw: pm[0],
            converted: pm[0],
            action: 'keep',
            reason: 'line-not-a-single-declaration',
          });
        }
      }
    }

    // Update block stack from THIS line's braces. Use processedLine, same as raw
    // for brace structure.
    // Count '{' and '}' ignoring those inside strings/comments - simplistic but
    // styles.css has no such cases relevant here.
    for (const ch of processedLine) {
      if (ch === '{') {
        blockStack.push({ media: isMediaLine });
      } else if (ch === '}') {
        blockStack.pop();
      }
    }

    out.push(processedLine);
    // `insideMedia` is computed per-line above; lint-silence if unused.
    void insideMedia;
  }

  return { output: out.join('\n'), report: reportEntries };
}

// ---------- unified-diff emitter ----------

function makeDiff(before, after, filename) {
  const a = before.split('\n');
  const b = after.split('\n');
  const chunks = [];
  let i = 0;
  while (i < a.length || i < b.length) {
    if (a[i] === b[i]) { i++; continue; }
    // Find the end of this change run.
    let j = i;
    while (j < a.length && j < b.length && a[j] !== b[j]) j++;
    // Context: 3 lines before & after.
    const ctxStart = Math.max(0, i - 3);
    const ctxEnd = Math.min(Math.max(a.length, b.length), j + 3);
    chunks.push({ ctxStart, ctxEnd, i, j });
    i = j + 1;
  }
  // Merge overlapping chunks.
  const merged = [];
  for (const c of chunks) {
    if (merged.length && c.ctxStart <= merged[merged.length - 1].ctxEnd) {
      merged[merged.length - 1].ctxEnd = Math.max(merged[merged.length - 1].ctxEnd, c.ctxEnd);
      merged[merged.length - 1].j = Math.max(merged[merged.length - 1].j, c.j);
    } else {
      merged.push({ ...c });
    }
  }

  let out = `--- a/${filename}\n+++ b/${filename}\n`;
  for (const m of merged) {
    const hunk = [];
    for (let k = m.ctxStart; k < m.ctxEnd; k++) {
      const ae = a[k];
      const be = b[k];
      if (ae === be) {
        if (ae !== undefined) hunk.push(' ' + ae);
      } else {
        if (ae !== undefined) hunk.push('-' + ae);
        if (be !== undefined) hunk.push('+' + be);
      }
    }
    out += `@@ -${m.ctxStart + 1},${m.ctxEnd - m.ctxStart} +${m.ctxStart + 1},${m.ctxEnd - m.ctxStart} @@\n`;
    out += hunk.join('\n') + '\n';
  }
  return out;
}

// ---------- entry ----------

async function main() {
  const source = await fs.readFile(STYLES_PATH, 'utf8');
  const { output, report } = transform(source);

  if (REPORT) {
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
    process.stderr.write(`report written: ${REPORT_PATH} (${report.length} entries)\n`);
  }

  if (APPLY) {
    if (output !== source) {
      await fs.writeFile(STYLES_PATH, output, 'utf8');
      const nConvert = report.filter(r => r.action === 'convert').length;
      const nKeep = report.filter(r => r.action === 'keep').length;
      process.stderr.write(`applied: ${nConvert} converted, ${nKeep} kept -> ${STYLES_PATH}\n`);
    } else {
      process.stderr.write(`no-op: styles.css already up to date\n`);
    }
    return;
  }

  // Dry-run: print unified diff to stdout.
  if (output === source) {
    process.stderr.write('no changes\n');
    return;
  }
  const diff = makeDiff(source, output, 'styles.css');
  process.stdout.write(diff);
}

main().catch(err => {
  process.stderr.write(`error: ${err.stack || err.message}\n`);
  process.exit(1);
});
