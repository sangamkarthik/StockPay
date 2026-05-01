import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  SearchCheck,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TimerReset,
  TrendingDown,
  Truck,
  Upload,
  WalletCards,
  X,
} from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type RestockNeed = {
  item: string;
  query: string;
  status: 'missing' | 'low' | 'substitute';
  confidence: number;
  reason: string;
  qty: number;
};

type AnalysisResponse = {
  source: 'openai' | 'demo';
  detectedItems: number;
  restockNeeds: RestockNeed[];
};

type Product = RestockNeed & {
  id: string;
  product: string;
  store: string;
  price: number;
  eta: string;
  image: string;
};

type WeeklyTrendItem = {
  item: string;
  query: string;
  currentLevel: number;
  weeklyLevels: number[];
  weeklyUseRate: number;
  daysUntilEmpty: number;
  recommendation: 'add_to_cart' | 'watch' | 'ok';
  confidence: number;
  status: RestockNeed['status'];
};

type WeeklyStockResponse = {
  image: string;
  model: string;
  summary: string;
  items: WeeklyTrendItem[];
};

type WebhookReceipt = {
  received: boolean;
  mode: string;
  source: string;
  eventId: string;
  eventType: string;
  transactionId: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  receivedAt: string;
};

type NorthCheckoutResult = Record<string, unknown>;

type NorthSessionResponse = {
  sessionToken?: string;
  request?: {
    amount?: number;
    tax?: number;
    serviceFee?: number;
  };
  raw?: unknown;
  error?: string;
  details?: unknown;
};

type NorthCheckout = {
  mount: (sessionToken: string, containerId: string, options?: Record<string, unknown>) => void | Promise<void>;
  submit: () => Promise<NorthCheckoutResult>;
  onPaymentComplete?: (callback: (result: NorthCheckoutResult) => void) => void;
};

declare global {
  interface Window {
    checkout?: NorthCheckout;
  }
}

type CheckoutOptions = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  billingAddress: string;
  promoCode: string;
  deliverySpeed: 'standard' | 'priority' | 'scheduled';
  substitution: 'best_match' | 'contact_me' | 'refund_item';
  paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  receiptMethod: 'email' | 'sms' | 'both';
  tip: number;
  saveForNextRun: boolean;
  mockWebhook: boolean;
  mobileNumber: boolean;
  tax: boolean;
  tips: boolean;
  promoCodeEnabled: boolean;
  shipping: boolean;
  billing: boolean;
  paymentSummary: boolean;
  productList: boolean;
  cardholderName: boolean;
  emailEnabled: boolean;
  displayCheckoutName: boolean;
  displayInputPlaceholders: boolean;
  displayInputLabels: boolean;
};

const demoAnalysis: AnalysisResponse = {
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

const catalog: Record<string, Omit<Product, keyof RestockNeed | 'id'> & { item: string }> = {
  ketchup: {
    item: 'Ketchup',
    product: 'Heinz Tomato Ketchup, 20 oz',
    store: 'Fresh Market',
    price: 4.49,
    eta: '31 min',
    image:
      'https://images.unsplash.com/photo-1631469919538-960f9b88c1f0?auto=format&fit=crop&w=260&q=80',
  },
  mayonnaise: {
    item: 'Mayonnaise',
    product: 'Hellmanns Real Mayonnaise, 30 oz',
    store: 'Green Basket',
    price: 6.79,
    eta: '36 min',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=260&q=80',
  },
  mustard: {
    item: 'Mustard',
    product: 'Frenchs Classic Yellow Mustard, 14 oz',
    store: 'Fresh Market',
    price: 2.99,
    eta: '31 min',
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=260&q=80',
  },
  milk: {
    item: 'Milk',
    product: 'Organic Whole Milk, 64 oz',
    store: 'Fresh Market',
    price: 5.49,
    eta: '31 min',
    image:
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=260&q=80',
  },
  eggs: {
    item: 'Eggs',
    product: 'Pasture-Raised Eggs, Dozen',
    store: 'Green Basket',
    price: 6.29,
    eta: '34 min',
    image:
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=260&q=80',
  },
  berries: {
    item: 'Berries',
    product: 'Strawberries, 1 lb Clamshell',
    store: 'Fresh Market',
    price: 4.99,
    eta: '31 min',
    image:
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=260&q=80',
  },
  'leafy-greens': {
    item: 'Leafy greens',
    product: 'Baby Spinach, 5 oz',
    store: 'Corner Co-op',
    price: 3.89,
    eta: '42 min',
    image:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=260&q=80',
  },
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const northEmbedUrl = import.meta.env.VITE_NORTH_EMBED_URL as string | undefined;
const northScriptUrl = (import.meta.env.VITE_NORTH_SCRIPT_URL as string | undefined) || 'https://checkout.north.com/checkout.js';
const northFieldsContainerId = 'north-fields-container';

const defaultCheckoutOptions: CheckoutOptions = {
  customerName: 'Karthik Sangam',
  email: 'karthik@example.com',
  phone: '(555) 010-2048',
  address: '123 Market St, San Francisco, CA',
  billingAddress: '123 Market St, San Francisco, CA',
  promoCode: 'STOCK10',
  deliverySpeed: 'standard',
  substitution: 'best_match',
  paymentMethod: 'card',
  receiptMethod: 'email',
  tip: 3,
  saveForNextRun: true,
  mockWebhook: true,
  mobileNumber: true,
  tax: true,
  tips: true,
  promoCodeEnabled: true,
  shipping: true,
  billing: true,
  paymentSummary: true,
  productList: true,
  cardholderName: true,
  emailEnabled: true,
  displayCheckoutName: true,
  displayInputPlaceholders: true,
  displayInputLabels: true,
};

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse>(demoAnalysis);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'ready' | 'error'>('idle');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutState, setCheckoutState] = useState<'cart' | 'paying' | 'paid'>('cart');
  const [webhookState, setWebhookState] = useState<'idle' | 'sending' | 'received' | 'error'>('idle');
  const [webhookReceipt, setWebhookReceipt] = useState<WebhookReceipt | null>(null);
  const [scanMessage, setScanMessage] = useState('Demo data is ready until a photo is uploaded.');
  const [weeklyStock, setWeeklyStock] = useState<WeeklyStockResponse | null>(null);
  const [checkoutOptions, setCheckoutOptions] = useState<CheckoutOptions>(defaultCheckoutOptions);
  const [northState, setNorthState] = useState<'idle' | 'creating' | 'mounted' | 'submitting' | 'approved' | 'error'>(
    'idle',
  );
  const [northSessionToken, setNorthSessionToken] = useState('');
  const [northMessage, setNorthMessage] = useState('Create a North Fields session when the cart is ready.');
  const [northPaymentResult, setNorthPaymentResult] = useState<NorthCheckoutResult | null>(null);

  const products = useMemo(() => mapNeedsToProducts(analysis.restockNeeds), [analysis]);

  const cartItems = useMemo(
    () => products.filter((product) => (cart[product.id] ?? product.qty) > 0),
    [cart, products],
  );
  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, product) => {
        const quantity = cart[product.id] ?? product.qty;
        return sum + product.price * quantity;
      }, 0),
    [cartItems, cart],
  );
  const deliveryFee = cartItems.length && checkoutOptions.shipping ? deliveryFeeFor(checkoutOptions.deliverySpeed) : 0;
  const tax = cartItems.length && checkoutOptions.tax ? subtotal * 0.0825 : 0;
  const tip = cartItems.length && checkoutOptions.tips ? checkoutOptions.tip : 0;
  const discount = cartItems.length && checkoutOptions.promoCodeEnabled && checkoutOptions.promoCode.toUpperCase() === 'STOCK10' ? Math.min(10, subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal + deliveryFee + tax + tip - discount);
  const fastestEta = cartItems[0]?.eta.replace(' min', 'm') ?? '0m';
  const addNowItems = weeklyStock?.items.filter((item) => item.recommendation === 'add_to_cart') ?? [];

  useEffect(() => {
    fetch('/api/weekly-stock-demo')
      .then((response) => response.json())
      .then((result: WeeklyStockResponse) => setWeeklyStock(result))
      .catch(() => setWeeklyStock(null));
  }, []);

  const resetNorthSession = () => {
    setNorthState('idle');
    setNorthSessionToken('');
    setNorthPaymentResult(null);
    setNorthMessage('Create a North Fields session when the cart is ready.');
    setWebhookState('idle');
    setWebhookReceipt(null);
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUrl(URL.createObjectURL(file));
    setScanState('scanning');
    setCheckoutState('cart');
    resetNorthSession();
    setScanMessage('Analyzing visible items and estimating refill needs.');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/analyze-fridge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image analysis failed');
      }

      const result = (await response.json()) as AnalysisResponse;
      setAnalysis(result);
      setCart(Object.fromEntries(result.restockNeeds.map((need) => [idFor(need.item), Math.max(1, need.qty)])));
      setScanState('ready');
      setScanMessage(
        result.source === 'openai'
          ? 'Real vision analysis completed. Product matching is using the local catalog until MealMe access arrives.'
          : 'Demo analyzer returned condiment restock needs. Add OPENAI_API_KEY to enable real photo analysis.',
      );
    } catch {
      setAnalysis(demoAnalysis);
      setCart(Object.fromEntries(demoAnalysis.restockNeeds.map((need) => [idFor(need.item), need.qty])));
      setScanState('error');
      setScanMessage('Analysis failed, so StockPay kept the demo cart available.');
    }
  };

  const changeQty = (id: string, delta: number) => {
    resetNorthSession();
    setCart((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta),
    }));
  };

  const buildNorthPayload = () => ({
    amount: roundCurrency(subtotal),
    tax: roundCurrency(tax),
    serviceFee: roundCurrency(Math.max(0, deliveryFee + tip - discount)),
    metadata: {
      stockPayOrderId: `stockpay_${Date.now()}`,
      customerName: checkoutOptions.customerName,
      email: checkoutOptions.email,
      phone: checkoutOptions.phone,
      address: checkoutOptions.address,
      billingAddress: checkoutOptions.billingAddress,
      promoCode: checkoutOptions.promoCodeEnabled ? checkoutOptions.promoCode : '',
      deliverySpeed: checkoutOptions.deliverySpeed,
      substitution: checkoutOptions.substitution,
      paymentMethod: checkoutOptions.paymentMethod,
      receiptMethod: checkoutOptions.receiptMethod,
      saveForNextRun: checkoutOptions.saveForNextRun,
      mockWebhook: checkoutOptions.mockWebhook,
    },
    products: cartItems.map((product) => ({
      id: product.id,
      name: product.product,
      quantity: cart[product.id] ?? product.qty,
      price: roundCurrency(product.price),
      logoUrl: product.image,
    })),
  });

  const simulateNorthWebhook = async () => {
    if (!checkoutOptions.mockWebhook) {
      setWebhookState('idle');
      return;
    }

    setWebhookState('sending');

    const response = await fetch('/api/north/mock-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: 'USD',
        checkoutOptions: {
          mobileNumber: checkoutOptions.mobileNumber,
          tax: checkoutOptions.tax,
          tips: checkoutOptions.tips,
          promoCode: checkoutOptions.promoCodeEnabled,
          shipping: checkoutOptions.shipping,
          billing: checkoutOptions.billing,
          paymentSummary: checkoutOptions.paymentSummary,
          productList: checkoutOptions.productList,
          cardholderName: checkoutOptions.cardholderName,
          email: checkoutOptions.emailEnabled,
          displayCheckoutName: checkoutOptions.displayCheckoutName,
          displayInputPlaceholders: checkoutOptions.displayInputPlaceholders,
          displayInputLabels: checkoutOptions.displayInputLabels,
          deliverySpeed: checkoutOptions.deliverySpeed,
          substitution: checkoutOptions.substitution,
          paymentMethod: checkoutOptions.paymentMethod,
          receiptMethod: checkoutOptions.receiptMethod,
          saveForNextRun: checkoutOptions.saveForNextRun,
        },
        cartItems: cartItems.map((product) => ({
          id: product.id,
          name: product.item,
          quantity: cart[product.id] ?? product.qty,
          unitPrice: Math.round(product.price * 100),
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Webhook simulation failed');
    }

    const receipt = (await response.json()) as WebhookReceipt;
    setWebhookReceipt(receipt);
    setWebhookState('received');
  };

  const createAndMountNorthFields = async () => {
    setCheckoutState('paying');
    setNorthState('creating');
    setNorthMessage('Creating a short-lived North checkout session.');
    setWebhookReceipt(null);

    const sessionResponse = await fetch('/api/north/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildNorthPayload()),
    });
    const session = (await sessionResponse.json()) as NorthSessionResponse;

    if (!sessionResponse.ok || !session.sessionToken) {
      throw new Error(session.error || 'North session did not return a mountable token.');
    }

    setNorthSessionToken(session.sessionToken);
    setNorthMessage('Session created. Mounting North hosted payment fields.');
    await loadNorthCheckoutScript();
    await nextFrame();

    const container = document.getElementById(northFieldsContainerId);
    if (container) {
      container.innerHTML = '';
    }

    await window.checkout?.mount(session.sessionToken, northFieldsContainerId, {
      amount: session.request?.amount,
      tax: session.request?.tax,
      serviceFee: session.request?.serviceFee,
    });
    window.checkout?.onPaymentComplete?.((result) => {
      setNorthPaymentResult(result);
      setNorthState('approved');
      setCheckoutState('paid');
      setNorthMessage('North reported payment completion.');
    });

    setNorthState('mounted');
    setCheckoutState('cart');
    setNorthMessage('North Fields are mounted. Enter the sandbox card and submit payment.');
  };

  const submitNorthPayment = async () => {
    setCheckoutState('paying');
    setNorthState('submitting');
    setNorthMessage('Submitting hosted fields to North.');
    setWebhookReceipt(null);

    if (!window.checkout?.submit) {
      throw new Error('North checkout fields are not mounted yet.');
    }

    const paymentResult = await window.checkout.submit();
    if (!isNorthPaymentSuccessful(paymentResult)) {
      throw new Error('North did not approve the payment response.');
    }

    setNorthPaymentResult(paymentResult);

    if (northSessionToken) {
      await fetch('/api/north/session-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: northSessionToken }),
      }).catch(() => undefined);
    }

    await simulateNorthWebhook();
    setNorthState('approved');
    setCheckoutState('paid');
    setNorthMessage('Payment submitted. StockPay has a verified checkout path for the demo.');
  };

  const startCheckout = async () => {
    if (!cartItems.length) return;

    try {
      if (northState === 'mounted' && northSessionToken) {
        await submitNorthPayment();
        return;
      }

      await createAndMountNorthFields();
    } catch (error) {
      setCheckoutState('cart');
      setNorthState('error');
      setWebhookState('error');
      setNorthMessage(error instanceof Error ? error.message : 'North checkout failed.');
    }
  };

  const useMonthlyTrend = () => {
    if (!weeklyStock) return;

    const restockNeeds = addNowItems.map((item) => ({
      item: item.item,
      query: item.query,
      status: item.status,
      confidence: item.confidence,
      reason: `${item.currentLevel}% remaining, about ${item.daysUntilEmpty} day${item.daysUntilEmpty === 1 ? '' : 's'} until empty at the current pace.`,
      qty: 1,
    }));

    setAnalysis({
      source: 'demo',
      detectedItems: weeklyStock.items.length,
      restockNeeds,
    });
    setCart(Object.fromEntries(restockNeeds.map((need) => [idFor(need.item), need.qty])));
    setScanState('ready');
    setCheckoutState('cart');
    resetNorthSession();
    setScanMessage('Monthly stock trend loaded into the cart using the YOLO-compatible demo backend.');
  };

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Application header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <ShoppingCart size={22} />
          </div>
          <div>
            <p className="eyebrow">StockPay</p>
            <h1>Restock from a fridge photo.</h1>
          </div>
        </div>
        <div className="status-pill">
          <ShieldCheck size={16} />
          Vision + North sandbox path
        </div>
      </section>

      <section className="workspace">
        <div className="scan-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Vision scan</p>
              <h2>Pantry intake</h2>
            </div>
            <Camera size={22} />
          </div>

          <label className="upload-target">
            <input type="file" accept="image/*" onChange={handleImage} />
            {imageUrl ? (
              <img src={imageUrl} alt="Uploaded pantry or fridge" />
            ) : (
              <span className="upload-empty">
                <Upload size={28} />
                <strong>Drop in a pantry or fridge image</strong>
                <small>StockPay extracts restock needs and converts them into grocery search queries.</small>
              </span>
            )}
          </label>

          <p className="scan-note">{scanMessage}</p>

          <div className="signal-grid">
            <Metric icon={<Sparkles size={18} />} label="Detected items" value={String(analysis.detectedItems)} />
            <Metric icon={<AlertTriangle size={18} />} label="Needs action" value={String(products.length)} />
            <Metric icon={<Clock3 size={18} />} label="Fastest ETA" value={fastestEta} />
          </div>
        </div>

        <div className="results-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MealMe-ready match</p>
              <h2>Restock candidates</h2>
            </div>
            <span className={`scan-badge ${scanState}`}>
              {scanState === 'scanning'
                ? 'Scanning'
                : scanState === 'ready'
                  ? analysis.source === 'openai'
                    ? 'Vision ready'
                    : 'Demo ready'
                  : scanState === 'error'
                    ? 'Fallback'
                    : 'Demo data'}
            </span>
          </div>

          <div className="product-list">
            {products.map((product) => {
              const quantity = cart[product.id] ?? product.qty;

              return (
                <article className="product-row" key={product.id}>
                  <img src={product.image} alt={product.product} />
                  <div className="product-copy">
                    <div className="product-titleline">
                      <h3>{product.item}</h3>
                      <span className={`need-tag ${product.status}`}>{product.status}</span>
                    </div>
                    <p>{product.product}</p>
                    <div className="reason-line">
                      <SearchCheck size={14} />
                      <span>{product.query}</span>
                    </div>
                    <div className="meta-line">
                      <span>
                        <MapPin size={14} />
                        {product.store}
                      </span>
                      <span>{product.confidence}% confidence</span>
                      <span>{product.eta}</span>
                    </div>
                  </div>
                  <div className="quantity-box" aria-label={`Quantity for ${product.item}`}>
                    <strong>{money.format(product.price)}</strong>
                    <div className="stepper">
                      <button onClick={() => changeQty(product.id, -1)} aria-label={`Remove ${product.item}`}>
                        <Minus size={15} />
                      </button>
                      <span>{quantity}</span>
                      <button onClick={() => changeQty(product.id, 1)} aria-label={`Add ${product.item}`}>
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="checkout-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Checkout</p>
              <h2>Delivery cart</h2>
            </div>
            <WalletCards size={22} />
          </div>

          <div className="cart-lines">
            {cartItems.map((product) => {
              const quantity = cart[product.id] ?? product.qty;

              return (
                <div className="cart-line" key={product.id}>
                  <span>
                    {quantity} x {product.item}
                  </span>
                  <strong>{money.format(product.price * quantity)}</strong>
                </div>
              );
            })}
            {!cartItems.length && (
              <div className="empty-cart">
                <X size={18} />
                Cart is empty
              </div>
            )}
          </div>

          <div className="totals">
            <div>
              <span>Subtotal</span>
              <strong>{money.format(subtotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{money.format(deliveryFee)}</strong>
            </div>
            {checkoutOptions.tax && (
              <div>
                <span>Estimated tax</span>
                <strong>{money.format(tax)}</strong>
              </div>
            )}
            {checkoutOptions.promoCodeEnabled && (
              <div>
                <span>Promo discount</span>
                <strong>-{money.format(discount)}</strong>
              </div>
            )}
            <div>
              <span>Courier tip</span>
              <strong>{money.format(tip)}</strong>
            </div>
            <div className="total-line">
              <span>Total</span>
              <strong>{money.format(total)}</strong>
            </div>
          </div>

          <div className="checkout-options">
            <div className="option-heading">
              <div>
                <p className="eyebrow">Checkout options</p>
                <h3>North Fields options</h3>
              </div>
              <Settings2 size={18} />
            </div>

            <div className="field-grid">
              {checkoutOptions.cardholderName && (
                <label>
                  {checkoutOptions.displayInputLabels && <span>Name</span>}
                  <input
                    placeholder={checkoutOptions.displayInputPlaceholders ? 'Cardholder name' : ''}
                    value={checkoutOptions.customerName}
                    onChange={(event) => setCheckoutOptions({ ...checkoutOptions, customerName: event.target.value })}
                  />
                </label>
              )}
              {checkoutOptions.emailEnabled && (
                <label>
                  {checkoutOptions.displayInputLabels && <span>Email</span>}
                  <input
                    type="email"
                    placeholder={checkoutOptions.displayInputPlaceholders ? 'name@example.com' : ''}
                    value={checkoutOptions.email}
                    onChange={(event) => setCheckoutOptions({ ...checkoutOptions, email: event.target.value })}
                  />
                </label>
              )}
              {checkoutOptions.mobileNumber && (
                <label>
                  {checkoutOptions.displayInputLabels && <span>Mobile</span>}
                  <input
                    placeholder={checkoutOptions.displayInputPlaceholders ? '(555) 010-0000' : ''}
                    value={checkoutOptions.phone}
                    onChange={(event) => setCheckoutOptions({ ...checkoutOptions, phone: event.target.value })}
                  />
                </label>
              )}
              {checkoutOptions.shipping && (
                <label>
                  {checkoutOptions.displayInputLabels && <span>Shipping</span>}
                  <input
                    placeholder={checkoutOptions.displayInputPlaceholders ? 'Delivery address' : ''}
                    value={checkoutOptions.address}
                    onChange={(event) => setCheckoutOptions({ ...checkoutOptions, address: event.target.value })}
                  />
                </label>
              )}
              {checkoutOptions.billing && (
                <label>
                  {checkoutOptions.displayInputLabels && <span>Billing</span>}
                  <input
                    placeholder={checkoutOptions.displayInputPlaceholders ? 'Billing address' : ''}
                    value={checkoutOptions.billingAddress}
                    onChange={(event) => setCheckoutOptions({ ...checkoutOptions, billingAddress: event.target.value })}
                  />
                </label>
              )}
              {checkoutOptions.promoCodeEnabled && (
                <label>
                  {checkoutOptions.displayInputLabels && <span>Promo</span>}
                  <input
                    placeholder={checkoutOptions.displayInputPlaceholders ? 'Promo code' : ''}
                    value={checkoutOptions.promoCode}
                    onChange={(event) => setCheckoutOptions({ ...checkoutOptions, promoCode: event.target.value })}
                  />
                </label>
              )}
            </div>

            <OptionGroup label="Payment method">
              <SegmentedButton
                active={checkoutOptions.paymentMethod === 'card'}
                label="Card"
                onClick={() => setCheckoutOptions({ ...checkoutOptions, paymentMethod: 'card' })}
              />
              <SegmentedButton
                active={checkoutOptions.paymentMethod === 'apple_pay'}
                label="Apple Pay"
                onClick={() => setCheckoutOptions({ ...checkoutOptions, paymentMethod: 'apple_pay' })}
              />
              <SegmentedButton
                active={checkoutOptions.paymentMethod === 'google_pay'}
                label="Google Pay"
                onClick={() => setCheckoutOptions({ ...checkoutOptions, paymentMethod: 'google_pay' })}
              />
            </OptionGroup>

            <OptionGroup label="Delivery speed">
              <SegmentedButton
                active={checkoutOptions.deliverySpeed === 'standard'}
                label="Standard"
                onClick={() => setCheckoutOptions({ ...checkoutOptions, deliverySpeed: 'standard' })}
              />
              <SegmentedButton
                active={checkoutOptions.deliverySpeed === 'priority'}
                label="Priority"
                onClick={() => setCheckoutOptions({ ...checkoutOptions, deliverySpeed: 'priority' })}
              />
              <SegmentedButton
                active={checkoutOptions.deliverySpeed === 'scheduled'}
                label="Scheduled"
                onClick={() => setCheckoutOptions({ ...checkoutOptions, deliverySpeed: 'scheduled' })}
              />
            </OptionGroup>

            <div className="field-grid compact">
              <label>
                <span>Substitutions</span>
                <select
                  value={checkoutOptions.substitution}
                  onChange={(event) =>
                    setCheckoutOptions({
                      ...checkoutOptions,
                      substitution: event.target.value as CheckoutOptions['substitution'],
                    })
                  }
                >
                  <option value="best_match">Best match</option>
                  <option value="contact_me">Contact me</option>
                  <option value="refund_item">Refund item</option>
                </select>
              </label>
              <label>
                <span>Receipt</span>
                <select
                  value={checkoutOptions.receiptMethod}
                  onChange={(event) =>
                    setCheckoutOptions({
                      ...checkoutOptions,
                      receiptMethod: event.target.value as CheckoutOptions['receiptMethod'],
                    })
                  }
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Email and SMS</option>
                </select>
              </label>
            </div>

            {checkoutOptions.tips && (
              <OptionGroup label="Courier tip">
              {[0, 3, 5, 8].map((amount) => (
                <SegmentedButton
                  key={amount}
                  active={checkoutOptions.tip === amount}
                  label={money.format(amount)}
                  onClick={() => setCheckoutOptions({ ...checkoutOptions, tip: amount })}
                />
              ))}
              </OptionGroup>
            )}

            <div className="toggle-list">
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.mobileNumber}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, mobileNumber: event.target.checked })}
                />
                Mobile number
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.emailEnabled}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, emailEnabled: event.target.checked })}
                />
                Email field
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.cardholderName}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, cardholderName: event.target.checked })}
                />
                Cardholder name
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.shipping}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, shipping: event.target.checked })}
                />
                Shipping
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.billing}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, billing: event.target.checked })}
                />
                Billing
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.tax}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, tax: event.target.checked })}
                />
                Tax
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.tips}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, tips: event.target.checked })}
                />
                Tips
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.promoCodeEnabled}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, promoCodeEnabled: event.target.checked })}
                />
                Promo code
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.paymentSummary}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, paymentSummary: event.target.checked })}
                />
                Payment summary
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.productList}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, productList: event.target.checked })}
                />
                Product list
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.displayCheckoutName}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, displayCheckoutName: event.target.checked })}
                />
                Display checkout name
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.displayInputPlaceholders}
                  onChange={(event) =>
                    setCheckoutOptions({ ...checkoutOptions, displayInputPlaceholders: event.target.checked })
                  }
                />
                Input placeholders
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.displayInputLabels}
                  onChange={(event) =>
                    setCheckoutOptions({ ...checkoutOptions, displayInputLabels: event.target.checked })
                  }
                />
                Input labels
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.saveForNextRun}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, saveForNextRun: event.target.checked })}
                />
                Save preferences for weekly restock
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={checkoutOptions.mockWebhook}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, mockWebhook: event.target.checked })}
                />
                Simulate North webhook in sandbox
              </label>
            </div>
          </div>

          <button
            className="checkout-button"
            onClick={startCheckout}
            disabled={!cartItems.length || northState === 'creating' || northState === 'submitting' || checkoutState === 'paid'}
          >
            {checkoutState === 'cart' && northState !== 'mounted' && (
              <>
                <CreditCard size={18} />
                Start North Fields
                <ArrowRight size={18} />
              </>
            )}
            {checkoutState === 'cart' && northState === 'mounted' && (
              <>
                <CreditCard size={18} />
                Submit North payment
                <ArrowRight size={18} />
              </>
            )}
            {checkoutState === 'paying' && (
              <>
                <span className="spinner" />
                {northState === 'creating' ? 'Mounting North Fields' : 'Authorizing payment'}
              </>
            )}
            {checkoutState === 'paid' && (
              <>
                <Check size={18} />
                Payment approved
              </>
            )}
          </button>

          <div className="embedded-checkout" aria-live="polite">
            {northEmbedUrl ? (
              <iframe title="North embedded checkout" src={northEmbedUrl} />
            ) : (
              <>
                <div className="checkout-frame-top">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="payment-card">
                  <ReceiptText size={20} />
                  <div>
                    <p>North Embedded Checkout</p>
                    <strong>
                      {checkoutState === 'paid'
                        ? 'Approved and verified'
                        : northState === 'mounted'
                          ? 'Fields mounted'
                          : northState === 'creating'
                            ? 'Creating session'
                            : northState === 'submitting'
                              ? 'Submitting payment'
                              : northState === 'error'
                                ? 'Needs attention'
                                : 'SDK mount pending'}
                    </strong>
                    <small>{webhookReceipt ? `Webhook ${webhookReceipt.eventId} received` : northMessage}</small>
                  </div>
                </div>
                <div
                  id={northFieldsContainerId}
                  className={`north-fields-container ${northState === 'creating' || northState === 'mounted' || northState === 'submitting' || northState === 'approved' ? 'active' : ''}`}
                />
                {(northState === 'idle' || northState === 'error') && (
                  <div className="north-fields-preview">
                    {checkoutOptions.displayCheckoutName && <strong>StockPay Fields Checkout</strong>}
                    {checkoutOptions.cardholderName && (
                      <div>
                        {checkoutOptions.displayInputLabels && <span>Cardholder name</span>}
                        <em>{checkoutOptions.displayInputPlaceholders ? checkoutOptions.customerName : ''}</em>
                      </div>
                    )}
                    <div>
                      {checkoutOptions.displayInputLabels && <span>Card number</span>}
                      <em>{checkoutOptions.displayInputPlaceholders ? '4111 1111 1111 1111' : ''}</em>
                    </div>
                    <div className="north-field-pair">
                      <div>
                        {checkoutOptions.displayInputLabels && <span>Expiry</span>}
                        <em>{checkoutOptions.displayInputPlaceholders ? '12 / 30' : ''}</em>
                      </div>
                      <div>
                        {checkoutOptions.displayInputLabels && <span>CVV</span>}
                        <em>{checkoutOptions.displayInputPlaceholders ? '123' : ''}</em>
                      </div>
                    </div>
                  </div>
                )}
                {checkoutOptions.productList && (
                  <div className="north-mini-list">
                    <span>Product list</span>
                    {cartItems.slice(0, 3).map((product) => (
                      <small key={product.id}>{product.item}</small>
                    ))}
                  </div>
                )}
                {checkoutOptions.paymentSummary && (
                  <div className="north-mini-list">
                    <span>Payment summary</span>
                    <small>{money.format(total)} total</small>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="timeline">
            <TimelineStep done label="Cart built" icon={<ShoppingCart size={16} />} />
            <TimelineStep done={checkoutState !== 'cart'} label="Payment authorized" icon={<CheckCircle2 size={16} />} />
            <TimelineStep done={webhookState === 'received'} label="Webhook received" icon={<ReceiptText size={16} />} />
            <TimelineStep done={checkoutState === 'paid'} label="Fulfillment sandbox" icon={<Truck size={16} />} />
          </div>
        </aside>
      </section>

      {weeklyStock && (
        <section className="trend-section">
          <div className="trend-visual">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Weekly inventory memory</p>
                <h2>Usage trend from four fridge scans</h2>
              </div>
              <CalendarDays size={22} />
            </div>
            <img src={weeklyStock.image} alt="Four weekly fridge stock photos" />
          </div>

          <div className="trend-analysis">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Backend prediction</p>
                <h2>Refill forecast</h2>
              </div>
              <BarChart3 size={22} />
            </div>

            <p className="trend-summary">{weeklyStock.summary}</p>

            <div className="trend-metrics">
              <Metric icon={<TrendingDown size={18} />} label="Add now" value={String(addNowItems.length)} />
              <Metric icon={<TimerReset size={18} />} label="Soonest empty" value={`${Math.min(...addNowItems.map((item) => item.daysUntilEmpty))}d`} />
              <Metric icon={<SearchCheck size={18} />} label="Detector" value="Mock YOLO" />
            </div>

            <div className="trend-list">
              {weeklyStock.items.map((item) => (
                <article className="trend-row" key={item.item}>
                  <div>
                    <div className="product-titleline">
                      <h3>{item.item}</h3>
                      <span className={`need-tag ${item.status}`}>
                        {item.recommendation === 'add_to_cart' ? 'refill' : item.recommendation}
                      </span>
                    </div>
                    <div className="level-bars" aria-label={`${item.item} weekly levels`}>
                      {item.weeklyLevels.map((level, index) => (
                        <span key={`${item.item}-${index}`}>
                          <i style={{ height: `${Math.max(8, level)}%` }} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="trend-copy">
                    <strong>{item.currentLevel}% left</strong>
                    <span>{item.weeklyUseRate}% used per week</span>
                    <span>{item.daysUntilEmpty === 0 ? 'Empty now' : `${item.daysUntilEmpty} days to empty`}</span>
                  </div>
                </article>
              ))}
            </div>

            <button className="secondary-button" onClick={useMonthlyTrend}>
              <ShoppingCart size={18} />
              Build cart from trend
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function mapNeedsToProducts(needs: RestockNeed[]): Product[] {
  return needs.map((need, index) => {
    const normalizedItem = idFor(need.item);
    const key = Object.keys(catalog).find(
      (candidate) => normalizedItem.includes(candidate) || candidate.includes(normalizedItem),
    );
    const match = key ? catalog[key] : undefined;
    const id = idFor(need.item || `item-${index}`);

    return {
      id,
      ...need,
      item: need.item || match?.item || 'Grocery item',
      product: match?.product || titleCase(need.query || need.item),
      store: match?.store || 'MealMe product match',
      price: match?.price || 4.99 + index,
      eta: match?.eta || '35 min',
      image:
        match?.image ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=260&q=80',
      qty: Math.max(1, need.qty || 1),
    };
  });
}

function idFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function deliveryFeeFor(speed: CheckoutOptions['deliverySpeed']) {
  if (speed === 'priority') return 7.99;
  if (speed === 'scheduled') return 5.99;
  return 4.99;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function loadNorthCheckoutScript() {
  if (window.checkout) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById('north-checkout-js') as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('North checkout.js failed to load.')), {
        once: true,
      });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'north-checkout-js';
    script.src = northScriptUrl;
    script.async = true;
    script.onload = () => {
      if (window.checkout) {
        resolve();
        return;
      }
      reject(new Error('North checkout.js loaded without exposing window.checkout.'));
    };
    script.onerror = () => reject(new Error('North checkout.js failed to load.'));
    document.head.appendChild(script);
  });
}

function isNorthPaymentSuccessful(result: NorthCheckoutResult | undefined) {
  if (!result) return false;

  const status = String(result.status || result.paymentStatus || result.authResponseText || '').toLowerCase();
  if (status.includes('declined') || status.includes('error') || status.includes('failed')) return false;
  if (status.includes('approved') || status.includes('success')) return true;

  if ('success' in result) return Boolean(result.success);
  if ('approved' in result) return Boolean(result.approved);

  return true;
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="option-group">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function SegmentedButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={active ? 'active' : ''} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TimelineStep({ done, label, icon }: { done: boolean; label: string; icon: React.ReactNode }) {
  return (
    <div className={`timeline-step ${done ? 'done' : ''}`}>
      <span className="timeline-icon">{icon}</span>
      <span>{label}</span>
      <ChevronRight size={15} />
    </div>
  );
}

export default App;
