# Hackathon Project Notes

## Concept

Build an app that identifies missing or low-stock pantry/fridge items from an image, maps them to real local grocery products, and generates an instant checkout to restock via delivery.

## Proposed Stack

- Vision: YOLO/Ultralytics or equivalent object detection for pantry/fridge items.
- Backend: Python FastAPI/Flask or existing project backend to map detected items to cart items.
- Inventory/pricing: MealMe API if credentials are available; mocked MealMe-style JSON as a fallback for the demo.
- Payment: North Embedded Checkout using the iframe/checkout SDK.
- Fulfillment: Simulated delivery status for the hackathon unless real order placement is available.

## Feasibility Read

- Polished hackathon demo: high feasibility.
- Fully real ordering: medium feasibility, mainly due to API access, checkout ownership, and fulfillment complexity.
- MealMe is a good fit for product search, local store inventory, pricing, cart, and checkout flows.
- North Embedded Checkout is feasible for the embedded payment experience.
- Main integration mismatch: MealMe has its own embedded checkout/payment flow, while the project specifically wants North. Best hackathon path is to use MealMe for product/pricing/cart data and North for the payment demo.

## Recommended Demo Flow

1. Upload fridge/pantry image.
2. Detect low-stock or missing items.
3. Normalize detections into grocery items.
4. Query MealMe if credentials work; otherwise use mock inventory data.
5. Show local products, prices, substitutions, and delivery estimate.
6. Build cart.
7. Launch North Embedded Checkout for the cart total.
8. After payment approval, show simulated order/delivery status.

## Current Prototype Build

- Fridge/pantry image upload is wired to `POST /api/analyze-fridge`.
- If `OPENAI_API_KEY` is present, the server can run real vision analysis and return MealMe-ready grocery search queries.
- If `OPENAI_API_KEY` is absent, the server returns a condiment demo fallback for ketchup, mayonnaise, and mustard.
- Weekly stock history is wired to `GET /api/weekly-stock-demo`, which returns a YOLO/Ultralytics-compatible detection contract: item names, week-by-week fill levels, current stock percent, predicted days to empty, confidence, and a cart recommendation.
- MealMe access is still pending, so product matching currently uses a local catalog shaped like MealMe search/cart results.
- North checkout can be prototyped without MealMe access because payment only needs a cart total and checkout/profile SDK details.
- North webhook confirmation can run in mock mode through `POST /api/north/mock-webhook`; the live-shaped endpoint is `POST /api/north/webhook/transaction`.
- North Fields checkout should use the Designer for secure payment-field styling, payment methods, domain, webhook base URL, section order, custom fields, and receipt settings. StockPay now mirrors the Designer `options` flags: mobile number, tax, tips, promo code, shipping, billing, payment summary, product list, cardholder name, email, display checkout name, input placeholders, and input labels. It also adds grocery-specific app options for delivery speed, substitution preference, receipt method, saved weekly restock preference, and mock webhook mode.
- Real grocery fulfillment still needs MealMe sandbox/order access or a separate delivery partner. For the hackathon, use simulated fulfillment after North payment unless sandbox finalization is enabled.

## Open Questions

1. Do we already have MealMe API credentials?
2. Do we already have North dashboard access, checkoutId, profileId, and private API key?
3. Does the hackathon require a real/sandbox payment through North, or is a realistic embedded checkout demo enough?
4. Is simulated fulfillment acceptable after payment, or must the app place a real grocery delivery order?
