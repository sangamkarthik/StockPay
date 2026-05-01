import multer from 'multer';
import { analyzePantryImage } from '../server/pantry-vision.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function runMiddleware(request, response, middleware) {
  return new Promise((resolve, reject) => {
    middleware(request, response, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    await runMiddleware(request, response, upload.single('image'));
    const result = await analyzePantryImage({
      buffer: request.file?.buffer,
      mimetype: request.file?.mimetype,
    });
    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(error.message === 'Upload an image file.' ? 400 : error.status || 500).json({
      error: error.message || 'Pantry analysis failed.',
      details: error.payload,
    });
  }
}
