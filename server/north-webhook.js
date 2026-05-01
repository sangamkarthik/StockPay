export function createMockNorthTransactionEvent({ amount, currency = 'USD', cartItems = [] } = {}) {
  const now = new Date();
  const transactionId = `mock_txn_${now.getTime()}`;

  return {
    id: `evt_${transactionId}`,
    type: 'transaction.approved',
    createdAt: now.toISOString(),
    livemode: false,
    data: {
      transactionId,
      checkoutId: process.env.NORTH_CHECKOUT_ID || 'mock_checkout_fields',
      profileId: process.env.NORTH_PROFILE_ID || 'mock_profile',
      status: 'approved',
      amount: Number(amount || 0),
      currency,
      cartItems,
    },
  };
}

export function handleNorthTransactionEvent(event, { source = 'north-webhook' } = {}) {
  const transaction = event?.data || {};
  const status = transaction.status || event?.status || 'unknown';
  const approved = status === 'approved' || event?.type === 'transaction.approved';

  return {
    received: true,
    mode: process.env.NORTH_WEBHOOK_MODE || 'mock',
    source,
    eventId: event?.id || `evt_unknown_${Date.now()}`,
    eventType: event?.type || 'transaction.unknown',
    transactionId: transaction.transactionId || transaction.id || `txn_unknown_${Date.now()}`,
    paymentStatus: approved ? 'verified' : status,
    fulfillmentStatus: approved ? 'sandbox_started' : 'waiting',
    receivedAt: new Date().toISOString(),
  };
}
