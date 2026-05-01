import { createMockNorthTransactionEvent, handleNorthTransactionEvent } from '../../server/north-webhook.js';

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const event = createMockNorthTransactionEvent(request.body);
  const receipt = handleNorthTransactionEvent(event, { source: 'mock-webhook' });

  response.status(200).json({
    ...receipt,
    event,
  });
}
