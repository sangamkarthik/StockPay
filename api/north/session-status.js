import { getNorthSessionStatus } from '../../server/north-checkout.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const status = await getNorthSessionStatus(request.body?.sessionToken);
    response.status(200).json(status);
  } catch (error) {
    console.error(error);
    response.status(error.status || 500).json({
      error: error.message || 'Failed to verify North checkout session.',
      details: error.payload,
    });
  }
}
