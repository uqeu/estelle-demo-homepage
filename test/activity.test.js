const test = require("node:test");
const assert = require("node:assert/strict");
const { groupAttempts } = require("../src/activity");

test("groups attempts that share a payment key", () => {
  const groups = groupAttempts([{ key: "a" }, { key: "b" }, { key: "a" }]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].length, 2);
});
