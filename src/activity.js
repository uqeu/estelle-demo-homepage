// Group repeated attempts into one activity entry.
function groupAttempts(attempts) {
  const groups = new Map();
  for (const attempt of attempts) {
    const entries = groups.get(attempt.key) || [];
    groups.set(attempt.key, [...entries, attempt]);
  }
  return Array.from(groups.values());
}

module.exports = { groupAttempts };
