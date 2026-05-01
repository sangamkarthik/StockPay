import { createNorthSession } from '../../server/north-checkout.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const session = await createNorthSession(request.body);
    response.status(200).json(session);
  } catch (error) {
    console.error(error);
    response.status(error.status || 500).json({
      error: error.message || 'Failed to create North checkout session.',
      details: error.payload,
    });
  }
}
