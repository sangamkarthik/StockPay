import OpenAI from 'openai';

const recipeIngredients = [
  'Spaghetti',
  'Garlic',
  'Cherry Tomatoes',
  'Olive Oil',
  'Spinach',
  'Heavy Cream',
  'Parmesan Cheese',
  'Butter',
  'Salt',
  'Black Pepper',
];

const productCatalog = {
  'heavy cream': {
    id: 'heavy-cream',
    name: 'Heavy Cream',
    label: 'Need 1/2 cup',
    quantity: 1,
    price: 4.79,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=260&q=80',
  },
  'parmesan cheese': {
    id: 'parmesan',
    name: 'Parmesan Cheese',
    label: 'Need 1/4 cup',
    quantity: 1,
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=260&q=80',
  },
  butter: {
    id: 'butter',
    name: 'Unsalted Butter',
    label: 'Need 2 tbsp',
    quantity: 1,
    price: 4.29,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=260&q=80',
  },
  salt: {
    id: 'salt',
    name: 'Sea Salt',
    label: 'Need to taste',
    quantity: 1,
    price: 2.49,
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=260&q=80',
  },
  'black pepper': {
    id: 'black-pepper',
    name: 'Black Pepper',
    label: 'Need to taste',
    quantity: 1,
    price: 3.29,
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=260&q=80',
  },
  spaghetti: {
    id: 'spaghetti',
    name: 'Spaghetti',
    label: 'Need 200 g',
    quantity: 1,
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=260&q=80',
  },
  garlic: {
    id: 'garlic',
    name: 'Garlic',
    label: 'Need 4 cloves',
    quantity: 1,
    price: 1.49,
    image: 'https://images.unsplash.com/photo-1615477550927-6ec40b9f3c4c?auto=format&fit=crop&w=260&q=80',
  },
  'cherry tomatoes': {
    id: 'cherry-tomatoes',
    name: 'Cherry Tomatoes',
    label: 'Need 1 cup',
    quantity: 1,
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=260&q=80',
  },
  spinach: {
    id: 'spinach',
    name: 'Baby Spinach',
    label: 'Need 2 cups',
    quantity: 1,
    price: 3.89,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=260&q=80',
  },
  'olive oil': {
    id: 'olive-oil',
    name: 'Olive Oil',
    label: 'Need 2 tbsp',
    quantity: 1,
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=260&q=80',
  },
};

const aliasMap = new Map([
  ['tomato', 'Cherry Tomatoes'],
  ['tomatoes', 'Cherry Tomatoes'],
  ['cherry tomato', 'Cherry Tomatoes'],
  ['pasta', 'Spaghetti'],
  ['noodle', 'Spaghetti'],
  ['noodles', 'Spaghetti'],
  ['cream', 'Heavy Cream'],
  ['milk', 'Heavy Cream'],
  ['cheese', 'Parmesan Cheese'],
  ['parmesan', 'Parmesan Cheese'],
  ['oil', 'Olive Oil'],
  ['greens', 'Spinach'],
  ['leafy greens', 'Spinach'],
  ['pepper', 'Black Pepper'],
]);

export const demoPantryAnalysis = {
  source: 'demo',
  model: 'YOLO-compatible demo pantry detector',
  detectedItems: 8,
  detectedIngredients: [
    ingredient('Spaghetti', 93),
    ingredient('Garlic', 91),
    ingredient('Cherry Tomatoes', 88),
    ingredient('Olive Oil', 86),
    ingredient('Spinach', 84),
    ingredient('Basil', 78),
    ingredient('Onion', 76),
    ingredient('Lemon', 72),
  ],
};

export async function analyzePantryImage({ buffer, mimetype }) {
  if (!buffer) {
    throw new Error('Upload an image file.');
  }

  const yoloResult = await tryYoloDetection({ buffer });
  if (yoloResult) {
    return buildPantryAnalysis({
      ...yoloResult,
      source: 'yolo',
    });
  }

  const openAiResult = await tryOpenAiPantryDetection({ buffer, mimetype });
  if (openAiResult) {
    return buildPantryAnalysis({
      ...openAiResult,
      source: 'openai',
    });
  }

  return buildPantryAnalysis(demoPantryAnalysis);
}

async function tryYoloDetection({ buffer }) {
  const modelId = process.env.YOLO_MODEL_ID || process.env.ROBOFLOW_MODEL_ID;
  const apiKey = process.env.YOLO_API_KEY || process.env.ROBOFLOW_API_KEY;
  const apiUrl = process.env.YOLO_API_URL || process.env.ROBOFLOW_API_URL || 'https://detect.roboflow.com';

  if (!modelId || !apiKey) return null;

  const url = new URL(`${apiUrl.replace(/\/$/, '')}/${modelId}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('format', 'json');
  url.searchParams.set('confidence', process.env.YOLO_CONFIDENCE || process.env.ROBOFLOW_CONFIDENCE || '35');
  url.searchParams.set('overlap', process.env.YOLO_OVERLAP || process.env.ROBOFLOW_OVERLAP || '30');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: buffer.toString('base64'),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message || payload.error || 'YOLO pantry detection failed.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  const predictions = Array.isArray(payload.predictions) ? payload.predictions : [];
  return {
    model: `YOLO hosted detector (${modelId})`,
    detectedItems: predictions.length,
    detectedIngredients: predictions.map((prediction) => ({
      item: normalizeIngredientName(prediction.class || prediction.name || prediction.label || 'Ingredient'),
      confidence: Math.round(Number(prediction.confidence || 0) * 100) || 0,
      box: {
        x: prediction.x,
        y: prediction.y,
        width: prediction.width,
        height: prediction.height,
      },
    })),
  };
}

async function tryOpenAiPantryDetection({ buffer, mimetype }) {
  if (!process.env.OPENAI_API_KEY) return null;

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
              'Identify visible pantry or fridge ingredients for recipe matching. Return only valid JSON: {"detectedItems": number, "detectedIngredients": [{"item": string, "confidence": number}]}. Use common grocery ingredient names like Garlic, Cherry Tomatoes, Spinach, Olive Oil, Heavy Cream, Parmesan Cheese, Butter, Spaghetti.',
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
    model: process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
    detectedItems: Number(parsed.detectedItems || parsed.detectedIngredients?.length || 0),
    detectedIngredients: Array.isArray(parsed.detectedIngredients) ? parsed.detectedIngredients : [],
  };
}

function buildPantryAnalysis({ source, model, detectedItems, detectedIngredients }) {
  const normalized = dedupeIngredients(detectedIngredients.map((item) => ingredient(item.item, item.confidence, item.box)));
  const detectedSet = new Set(normalized.map((item) => item.item.toLowerCase()));
  const missingIngredientNames = recipeIngredients.filter((name) => !detectedSet.has(name.toLowerCase()));
  const missingProducts = missingIngredientNames
    .map((name) => productCatalog[name.toLowerCase()])
    .filter(Boolean)
    .slice(0, 5);

  return {
    source,
    model,
    detectedItems: Number(detectedItems || normalized.length),
    detectedIngredients: normalized,
    recipe: {
      id: 'creamy-garlic-pasta',
      title: 'Creamy Garlic Pasta',
      requiredIngredients: recipeIngredients,
      matchedIngredients: recipeIngredients.filter((name) => detectedSet.has(name.toLowerCase())),
      missingIngredients: missingProducts,
      matchScore: Math.round(((recipeIngredients.length - missingIngredientNames.length) / recipeIngredients.length) * 100),
    },
    summary: `${source === 'yolo' ? 'YOLO' : source === 'openai' ? 'Vision' : 'Demo'} detected ${normalized.length} pantry ingredients and found ${missingProducts.length} missing items for Creamy Garlic Pasta.`,
  };
}

function normalizeIngredientName(value) {
  const cleaned = String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return aliasMap.get(cleaned) || titleCase(cleaned);
}

function ingredient(item, confidence = 75, box) {
  return {
    item: normalizeIngredientName(item),
    confidence: Math.round(Number(confidence || 75)),
    ...(box ? { box } : {}),
  };
}

function dedupeIngredients(items) {
  const seen = new Map();

  for (const item of items) {
    const key = item.item.toLowerCase();
    const existing = seen.get(key);
    if (!existing || item.confidence > existing.confidence) {
      seen.set(key, item);
    }
  }

  return [...seen.values()].sort((a, b) => b.confidence - a.confidence);
}

function titleCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
