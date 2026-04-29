import { weeklyStockDemo } from '../server/stockpay-api.js';

export default function handler(_request, response) {
  response.status(200).json(weeklyStockDemo);
}
