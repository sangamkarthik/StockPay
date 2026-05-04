const NORTH_API_BASES = [
  process.env.NORTH_API_BASE || 'https://checkout-api.north.com/public',
  'https://checkout.north.com',
].filter((base, index, list) => base && list.indexOf(base) === index);

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function requireNorthConfig() {
  const missing = ['NORTH_PRIVATE_API_KEY', 'NORTH_CHECKOUT_ID', 'NORTH_PROFILE_ID'].filter(
    (key) => !process.env[key],
  );

  if (missing.length) {
    throw new Error(`Missing North configuration: ${missing.join(', ')}`);
  }
}

function normalizeProducts(products = []) {
  return products
    .filter((product) => product.name && Number(product.quantity) > 0)
    .map((product) => ({
      name: String(product.name),
      price: roundMoney(product.price || product.unitPrice || 0),
      quantity: Number(product.quantity || 1),
      logoUrl: product.logoUrl || '',
    }));
}

function extractSessionToken(payload) {
  if (!payload || typeof payload !== 'object') return '';

  return (
    payload.sessionToken ||
    payload.token ||
    payload.session ||
    payload.data?.sessionToken ||
    payload.data?.token ||
    payload.data?.session ||
    payload.result?.sessionToken ||
    payload.result?.token ||
    ''
  );
}

async function northFetch(path, options) {
  let lastNetworkError;

  for (const base of NORTH_API_BASES) {
    try {
      return await fetch(`${base.replace(/\/$/, '')}${path}`, options);
    } catch (error) {
      lastNetworkError = error;
    }
  }

  throw lastNetworkError;
}

export async function createNorthSession({
  products = [],
  amount,
  tax = 0,
  serviceFee = 0,
  total,
  metadata = {},
} = {}) {
  requireNorthConfig();

  const normalizedProducts = normalizeProducts(products);

  // North charges sum(products). Sending tax/serviceFee as separate fields does NOT
  // add them to the charge — North uses those fields for display only. To authorize
  // the full grand total we include fees as product line items.
  // "Sales Tax" and "Delivery Fee" are safe names — North only extracts products
  // literally named "Tax" and "Delivery & Service Fee" into its native fields.
  const northProducts = [...normalizedProducts];
  const taxAmount = roundMoney(tax);
  const feeAmount = roundMoney(serviceFee);
  if (taxAmount > 0) {
    northProducts.push({ name: 'Sales Tax', price: taxAmount, quantity: 1, logoUrl: '' });
  }
  if (feeAmount > 0) {
    northProducts.push({ name: 'Delivery Fee', price: feeAmount, quantity: 1, logoUrl: '' });
  }
  const northAmount = roundMoney(northProducts.reduce((sum, p) => sum + p.price * p.quantity, 0));

  const body = {
    checkoutId: process.env.NORTH_CHECKOUT_ID,
    profileId: process.env.NORTH_PROFILE_ID,
    metadata: JSON.stringify(metadata),
    amount: northAmount,
    tax: 0,
    serviceFee: 0,
  };

  if (northProducts.length) {
    body.products = northProducts;
  }

  const response = await northFetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NORTH_PRIVATE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message || payload.error || 'Failed to create North checkout session.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    sessionToken: extractSessionToken(payload),
    amount: northAmount,
    tax: roundMoney(tax),
    serviceFee: roundMoney(serviceFee),
  };
}

export async function getNorthSessionStatus(sessionToken) {
  requireNorthConfig();

  if (!sessionToken) {
    throw new Error('Missing North session token.');
  }

  const response = await northFetch('/api/sessions/status', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.NORTH_PRIVATE_API_KEY}`,
      SessionToken: sessionToken,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message || payload.error || 'Failed to verify North checkout session.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
