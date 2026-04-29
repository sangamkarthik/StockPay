import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeFridgeImage, weeklyStockDemo } from './stockpay-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 5173);

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

app.post('/api/analyze-fridge', upload.single('image'), async (req, res) => {
  try {
    const result = await analyzeFridgeImage({
      buffer: req.file?.buffer,
      mimetype: req.file?.mimetype,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(error.message === 'Upload an image file.' ? 400 : 500).json({
      error: error.message || 'Image analysis failed.',
    });
  }
});

app.get('/api/weekly-stock-demo', (_req, res) => {
  res.json(weeklyStockDemo);
});

if (isProduction) {
  app.use(express.static(path.join(root, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(root, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    root,
    server: { middlewareMode: true, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`StockPay running at http://localhost:${port}/`);
});
