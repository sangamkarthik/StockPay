import { handleNorthTransactionEvent } from '../../../server/north-webhook.js';

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const receipt = handleNorthTransactionEvent(request.body, { source: 'north-webhook' });

  response.status(200).json(receipt);
}
