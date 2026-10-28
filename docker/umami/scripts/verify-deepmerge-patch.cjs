const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pnpmStore = path.resolve('node_modules/.pnpm');
const packageDirectory = fs.readdirSync(pnpmStore).find(name => name.startsWith('deepmerge@4.3.1'));

assert.ok(packageDirectory, 'patched deepmerge must be installed');

const merge = require(path.join(pnpmStore, packageDirectory, 'node_modules/deepmerge'));

const source = JSON.parse('{"session":{"__proto__":{"admin":true}}}');
const merged = merge({ session: null }, source);

assert.equal(merged.session.admin, undefined);
assert.equal(Object.getPrototypeOf(merged.session), Object.prototype);

const nullPrototypeTarget = Object.create(null);
const directPayload = JSON.parse('{"__proto__":{"admin":true}}');
const directMerge = merge(nullPrototypeTarget, directPayload);

assert.equal(directMerge.admin, undefined);
assert.equal(Object.getPrototypeOf(directMerge), Object.prototype);
