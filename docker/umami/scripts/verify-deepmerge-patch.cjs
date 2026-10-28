const assert = require('node:assert/strict');
const merge = require('deepmerge');

const source = JSON.parse('{"session":{"__proto__":{"admin":true}}}');
const merged = merge({ session: null }, source);

assert.equal(merged.session.admin, undefined);
assert.equal(Object.getPrototypeOf(merged.session), Object.prototype);

const nullPrototypeTarget = Object.create(null);
const directPayload = JSON.parse('{"__proto__":{"admin":true}}');
const directMerge = merge(nullPrototypeTarget, directPayload);

assert.equal(directMerge.admin, undefined);
assert.equal(Object.getPrototypeOf(directMerge), Object.prototype);
