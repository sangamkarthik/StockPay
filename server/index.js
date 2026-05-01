import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeFridgeImage, weeklyStockDemo } from './stockpay-api.js';
import { analyzePantryImage } from './pantry-vision.js';
import { createNorthSession, getNorthSessionStatus } from './north-checkout.js';
import { createMockNorthTransactionEvent, handleNorthTransactionEvent } from './north-webhook.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 5173);

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

app.use(express.json());

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

app.post('/api/analyze-pantry', upload.single('image'), async (req, res) => {
  try {
    const result = await analyzePantryImage({
      buffer: req.file?.buffer,
      mimetype: req.file?.mimetype,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(error.message === 'Upload an image file.' ? 400 : error.status || 500).json({
      error: error.message || 'Pantry analysis failed.',
      details: error.payload,
    });
  }
});

app.get('/api/weekly-stock-demo', (_req, res) => {
  res.json(weeklyStockDemo);
});

app.post('/api/north/session', async (req, res) => {
  try {
    const session = await createNorthSession(req.body);
    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to create North checkout session.',
      details: error.payload,
    });
  }
});

app.post('/api/north/session-status', async (req, res) => {
  try {
    const status = await getNorthSessionStatus(req.body?.sessionToken);
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || 'Failed to verify North checkout session.',
      details: error.payload,
    });
  }
});

app.post('/api/north/mock-webhook', (req, res) => {
  const event = createMockNorthTransactionEvent(req.body);
  const receipt = handleNorthTransactionEvent(event, { source: 'mock-webhook' });

  res.json({
    ...receipt,
    event,
  });
});

app.post('/api/north/webhook/transaction', (req, res) => {
  const receipt = handleNorthTransactionEvent(req.body, { source: 'north-webhook' });
  res.json(receipt);
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
