const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pnpmStore = path.resolve('node_modules/.pnpm');
const packageDirectories = fs.readdirSync(pnpmStore).filter(name => name.toLowerCase().includes('deep'));
const packageRoot = [
  path.resolve('node_modules/deepmerge'),
  path.join(pnpmStore, 'node_modules/deepmerge'),
  ...packageDirectories.map(name => path.join(pnpmStore, name, 'node_modules/deepmerge')),
].find(candidate => fs.existsSync(candidate));

assert.ok(
  packageRoot,
  `patched deepmerge must be installed (store entries: ${packageDirectories.join(', ') || 'none'})`,
);

const merge = require(packageRoot);

const source = JSON.parse('{"session":{"__proto__":{"admin":true}}}');
const merged = merge({ session: null }, source);

assert.equal(merged.session.admin, undefined);
assert.equal(Object.getPrototypeOf(merged.session), Object.prototype);

const nullPrototypeTarget = Object.create(null);
const directPayload = JSON.parse('{"__proto__":{"admin":true}}');
const directMerge = merge(nullPrototypeTarget, directPayload);

assert.equal(directMerge.admin, undefined);
assert.equal(Object.getPrototypeOf(directMerge), Object.prototype);
