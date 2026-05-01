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
  MessageSquare,
  Minus,
  Plus,
  ReceiptText,
  SearchCheck,
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

type CheckoutOptions = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  deliverySpeed: 'standard' | 'priority' | 'scheduled';
  substitution: 'best_match' | 'contact_me' | 'refund_item';
  paymentMethod: 'card' | 'apple_pay' | 'google_pay';
  receiptMethod: 'email' | 'sms' | 'both';
  tip: number;
  saveForNextRun: boolean;
  mockWebhook: boolean;
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
const northCheckoutId = import.meta.env.VITE_NORTH_CHECKOUT_ID as string | undefined;
const northProfileId = import.meta.env.VITE_NORTH_PROFILE_ID as string | undefined;

const defaultCheckoutOptions: CheckoutOptions = {
  customerName: 'Karthik Sangam',
  email: 'karthik@example.com',
  phone: '(555) 010-2048',
  address: '123 Market St, San Francisco, CA',
  deliverySpeed: 'standard',
  substitution: 'best_match',
  paymentMethod: 'card',
  receiptMethod: 'email',
  tip: 3,
  saveForNextRun: true,
  mockWebhook: true,
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
  const deliveryFee = cartItems.length ? deliveryFeeFor(checkoutOptions.deliverySpeed) : 0;
  const tip = cartItems.length ? checkoutOptions.tip : 0;
  const total = subtotal + deliveryFee + tip;
  const fastestEta = cartItems[0]?.eta.replace(' min', 'm') ?? '0m';
  const addNowItems = weeklyStock?.items.filter((item) => item.recommendation === 'add_to_cart') ?? [];

  useEffect(() => {
    fetch('/api/weekly-stock-demo')
      .then((response) => response.json())
      .then((result: WeeklyStockResponse) => setWeeklyStock(result))
      .catch(() => setWeeklyStock(null));
  }, []);

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUrl(URL.createObjectURL(file));
    setScanState('scanning');
    setCheckoutState('cart');
    setWebhookState('idle');
    setWebhookReceipt(null);
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
    setCart((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta),
    }));
  };

  const startCheckout = async () => {
    if (!cartItems.length) return;
    setCheckoutState('paying');
    setWebhookState('sending');
    setWebhookReceipt(null);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    if (!checkoutOptions.mockWebhook) {
      setCheckoutState('paid');
      setWebhookState('idle');
      return;
    }

    try {
      const response = await fetch('/api/north/mock-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: 'USD',
          checkoutOptions: {
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
      setCheckoutState('paid');
    } catch {
      setWebhookState('error');
      setCheckoutState('cart');
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
    setWebhookState('idle');
    setWebhookReceipt(null);
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
                <h3>Delivery and receipt</h3>
              </div>
              <MessageSquare size={18} />
            </div>

            <div className="field-grid">
              <label>
                <span>Name</span>
                <input
                  value={checkoutOptions.customerName}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, customerName: event.target.value })}
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={checkoutOptions.email}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, email: event.target.value })}
                />
              </label>
              <label>
                <span>Phone</span>
                <input
                  value={checkoutOptions.phone}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, phone: event.target.value })}
                />
              </label>
              <label>
                <span>Address</span>
                <input
                  value={checkoutOptions.address}
                  onChange={(event) => setCheckoutOptions({ ...checkoutOptions, address: event.target.value })}
                />
              </label>
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

            <div className="toggle-list">
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

          <button className="checkout-button" onClick={startCheckout} disabled={!cartItems.length || checkoutState !== 'cart'}>
            {checkoutState === 'cart' && (
              <>
                <CreditCard size={18} />
                Pay with North
                <ArrowRight size={18} />
              </>
            )}
            {checkoutState === 'paying' && (
              <>
                <span className="spinner" />
                Authorizing payment
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
                        : webhookState === 'sending'
                          ? 'Waiting for webhook'
                          : 'SDK mount pending'}
                    </strong>
                    <small>
                      {webhookReceipt
                        ? `Webhook ${webhookReceipt.eventId} received`
                        : northCheckoutId && northProfileId
                        ? `Checkout ${northCheckoutId} ready for SDK wiring`
                        : 'Add checkout/profile IDs when North sends them'}
                    </small>
                  </div>
                </div>
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
