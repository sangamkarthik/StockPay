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
  metadata = {},
} = {}) {
  requireNorthConfig();

  const normalizedProducts = normalizeProducts(products);
  const productAmount = normalizedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const body = {
    checkoutId: process.env.NORTH_CHECKOUT_ID,
    profileId: process.env.NORTH_PROFILE_ID,
    metadata: JSON.stringify(metadata),
    amount: roundMoney(amount || productAmount),
    tax: roundMoney(tax),
    serviceFee: roundMoney(serviceFee),
  };

  if (normalizedProducts.length) {
    body.products = normalizedProducts;
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
    expiresInMinutes: 30,
    request: {
      amount: body.amount,
      tax: body.tax,
      serviceFee: body.serviceFee,
      products: normalizedProducts,
    },
    raw: payload,
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
