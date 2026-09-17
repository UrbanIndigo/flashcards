import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('../js/', import.meta.url).pathname;

function scripts(dir = root, found = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) scripts(path, found);
    else if (entry.endsWith('.js')) found.push(path);
  }
  return found;
}

test('every shipped module parses', () => {
  // app.js needs a DOM, so no test imports it, so nothing would catch a
  // syntax error in it before it reached the phone. An import once landed
  // in the middle of another import and the suite stayed green.
  const bin = mkdtempSync(join(tmpdir(), 'parse-'));
  const files = scripts();
  assert.ok(files.length > 10, `only found ${files.length} modules`);

  for (const file of files) {
    // node --check reads the module goal from the extension.
    const copy = join(bin, 'module.mjs');
    copyFileSync(file, copy);
    try {
      execFileSync(process.execPath, ['--check', copy], { stdio: 'pipe' });
    } catch (error) {
      assert.fail(`${file.replace(root, 'js/')} does not parse:\n${error.stderr}`);
    }
  }
});

test('the service worker parses, and precaches every module', () => {
  const sw = new URL('../sw.js', import.meta.url).pathname;
  const bin = mkdtempSync(join(tmpdir(), 'parse-sw-'));
  const copy = join(bin, 'sw.mjs');
  copyFileSync(sw, copy);
  execFileSync(process.execPath, ['--check', copy], { stdio: 'pipe' });

  // A module missing from the list is a module missing on a plane.
  const listed = readFileSync(sw, 'utf8');
  for (const file of scripts()) {
    const asset = file.replace(root, 'js/');
    assert.ok(listed.includes(`'${asset}'`), `${asset} is not precached`);
  }
});
