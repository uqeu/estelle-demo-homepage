// A stand-in for a card processor in test mode. Like a real processor, it treats a repeated payment key as the
// same charge. Nothing here moves money.
function createPayments() {
  const charges = new Map();
  let attempts = 0;
  return {
    newAttemptKey() {
      attempts += 1;
      return `pk_test_${attempts}`;
    },
    charge(amount, key) {
      if (!charges.has(key)) charges.set(key, { id: `ch_${charges.size + 1}`, amount, key });
      return charges.get(key);
    },
    count() {
      return charges.size;
    },
  };
}

module.exports = { createPayments };
