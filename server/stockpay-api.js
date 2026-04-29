import OpenAI from 'openai';

export const demoAnalysis = {
  source: 'demo',
  detectedItems: 11,
  restockNeeds: [
    {
      item: 'Ketchup',
      query: 'Heinz tomato ketchup 20 oz',
      status: 'low',
      confidence: 92,
      reason: 'Bottle appears nearly empty from the visible fill level.',
      qty: 1,
    },
    {
      item: 'Mayonnaise',
      query: 'Hellmanns real mayonnaise 30 oz',
      status: 'low',
      confidence: 88,
      reason: 'Jar is present but looks close to finished.',
      qty: 1,
    },
    {
      item: 'Mustard',
      query: 'Yellow mustard 14 oz',
      status: 'missing',
      confidence: 74,
      reason: 'Common condiment slot appears empty next to ketchup and mayo.',
      qty: 1,
    },
  ],
};

export const weeklyStockDemo = {
  image: '/demo-assets/weekly-fridge-stock-sequence.png',
  model: 'YOLO/Ultralytics-compatible demo output',
  summary:
    'Four weekly fridge scans show condiments and fresh items declining at different rates. Ketchup, mayonnaise, berries, eggs, milk, and greens are projected to need refill before the next full shop.',
  items: [
    {
      item: 'Ketchup',
      query: 'Heinz tomato ketchup 20 oz',
      currentLevel: 12,
      weeklyLevels: [100, 78, 49, 12],
      weeklyUseRate: 29,
      daysUntilEmpty: 3,
      recommendation: 'add_to_cart',
      confidence: 93,
      status: 'low',
    },
    {
      item: 'Mayonnaise',
      query: 'Hellmanns real mayonnaise 30 oz',
      currentLevel: 15,
      weeklyLevels: [100, 72, 42, 15],
      weeklyUseRate: 28,
      daysUntilEmpty: 4,
      recommendation: 'add_to_cart',
      confidence: 90,
      status: 'low',
    },
    {
      item: 'Mustard',
      query: 'Yellow mustard 14 oz',
      currentLevel: 0,
      weeklyLevels: [100, 95, 82, 0],
      weeklyUseRate: 27,
      daysUntilEmpty: 0,
      recommendation: 'add_to_cart',
      confidence: 84,
      status: 'missing',
    },
    {
      item: 'Berries',
      query: 'Strawberries 1 lb clamshell',
      currentLevel: 0,
      weeklyLevels: [100, 55, 18, 0],
      weeklyUseRate: 33,
      daysUntilEmpty: 0,
      recommendation: 'add_to_cart',
      confidence: 86,
      status: 'missing',
    },
    {
      item: 'Eggs',
      query: 'Pasture raised eggs dozen',
      currentLevel: 12,
      weeklyLevels: [100, 83, 48, 12],
      weeklyUseRate: 29,
      daysUntilEmpty: 3,
      recommendation: 'add_to_cart',
      confidence: 88,
      status: 'low',
    },
    {
      item: 'Milk',
      query: 'Organic whole milk 64 oz',
      currentLevel: 22,
      weeklyLevels: [100, 88, 62, 22],
      weeklyUseRate: 26,
      daysUntilEmpty: 6,
      recommendation: 'add_to_cart',
      confidence: 82,
      status: 'low',
    },
    {
      item: 'Leafy greens',
      query: 'Baby spinach 5 oz',
      currentLevel: 18,
      weeklyLevels: [100, 80, 38, 18],
      weeklyUseRate: 27,
      daysUntilEmpty: 5,
      recommendation: 'add_to_cart',
      confidence: 81,
      status: 'low',
    },
    {
      item: 'Yogurt',
      query: 'Greek yogurt single serve cups',
      currentLevel: 64,
      weeklyLevels: [100, 92, 75, 64],
      weeklyUseRate: 12,
      daysUntilEmpty: 37,
      recommendation: 'watch',
      confidence: 78,
      status: 'substitute',
    },
  ],
};

export async function analyzeFridgeImage({ buffer, mimetype }) {
  if (!buffer) {
    throw new Error('Upload an image file.');
  }

  if (!process.env.OPENAI_API_KEY) {
    return demoAnalysis;
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const dataUrl = `data:${mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;

  const response = await openai.responses.create({
    model: process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text:
              'Analyze this fridge or pantry section for grocery restocking. Focus on visible packaged foods and condiments. Return only valid JSON with this shape: {"detectedItems": number, "restockNeeds": [{"item": string, "query": string, "status": "missing" | "low" | "substitute", "confidence": number, "reason": string, "qty": number}]}. The query should be a grocery search phrase suitable for MealMe product/cart search. If unsure, include only high-confidence restock candidates.',
          },
          {
            type: 'input_image',
            image_url: dataUrl,
            detail: 'low',
          },
        ],
      },
    ],
  });

  const parsed = JSON.parse(response.output_text);
  return {
    source: 'openai',
    detectedItems: Number(parsed.detectedItems || 0),
    restockNeeds: Array.isArray(parsed.restockNeeds) ? parsed.restockNeeds : [],
  };
}
