import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Heart,
  Home,
  Leaf,
  PackageCheck,
  Play,
  ReceiptText,
  ScanLine,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Star,
  Utensils,
} from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

type Page = 'landing' | 'dashboard' | 'recipe';

type AnalysisResponse = {
  source: 'yolo' | 'openai' | 'demo';
  model: string;
  detectedItems: number;
  detectedIngredients: Array<{
    item: string;
    confidence: number;
    box?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
  }>;
  recipe: {
    title: string;
    requiredIngredients: string[];
    matchedIngredients: string[];
    missingIngredients: MissingProduct[];
    matchScore: number;
  };
  summary: string;
};

type MissingProduct = {
  id: string;
  name: string;
  label: string;
  quantity: number;
  price: number;
  image: string;
};

type WebhookReceipt = {
  received: boolean;
  eventId: string;
  paymentStatus: string;
  fulfillmentStatus: string;
};

type NorthCheckoutResult = Record<string, unknown>;

type NorthSessionResponse = {
  sessionToken?: string;
  request?: {
    amount?: number;
    tax?: number;
    serviceFee?: number;
    products?: Array<{
      name: string;
      price: number;
      quantity: number;
      logoUrl?: string;
    }>;
  };
  error?: string;
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

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const northScriptUrl = (import.meta.env.VITE_NORTH_SCRIPT_URL as string | undefined) || 'https://checkout.north.com/checkout.js';
const northFieldsContainerId = 'north-fields-container';

const heroImage =
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=88';
const pastaImage =
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1000&q=90';
const tofuImage =
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85';
const soupImage =
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=700&q=85';
const tacoImage =
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=85';

const pantryIngredients = [
  'Spaghetti',
  'Garlic',
  'Cherry Tomatoes',
  'Olive Oil',
  'Spinach',
  'Basil',
  'Onion',
  'Lemon',
  'Chickpeas',
  'Rice',
  'Tofu',
  'Beans',
];

const defaultMissingProducts: MissingProduct[] = [
  {
    id: 'heavy-cream',
    name: 'Heavy Cream',
    label: 'Need 1/2 cup',
    quantity: 1,
    price: 4.79,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=260&q=80',
  },
  {
    id: 'parmesan',
    name: 'Parmesan Cheese',
    label: 'Need 1/4 cup',
    quantity: 1,
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=260&q=80',
  },
  {
    id: 'butter',
    name: 'Unsalted Butter',
    label: 'Need 2 tbsp',
    quantity: 1,
    price: 4.29,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=260&q=80',
  },
];

const recipeCards = [
  {
    title: 'Creamy Garlic Pasta',
    image: pastaImage,
    time: '25 min',
    rating: '4.8 (126)',
    tags: ['Easy', 'Vegetarian'],
    match: ['have all', 'have some', 'missing'],
  },
  {
    title: 'Teriyaki Tofu Stir Fry',
    image: tofuImage,
    time: '30 min',
    rating: '4.6 (89)',
    tags: ['Easy', 'Vegan'],
    match: ['have all', 'have some', 'missing'],
  },
  {
    title: 'Hearty Minestrone Soup',
    image: soupImage,
    time: '40 min',
    rating: '4.7 (112)',
    tags: ['Easy', 'Vegetarian'],
    match: ['have all', 'have some', 'missing'],
  },
  {
    title: 'Chicken Tacos',
    image: tacoImage,
    time: '20 min',
    rating: '4.5 (78)',
    tags: ['Easy', 'High Protein'],
    match: ['have all', 'have some', 'missing'],
  },
];

const directions = [
  {
    text: 'Bring a large pot of salted water to a boil. Add spaghetti and cook according to package instructions.',
    image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=420&q=82',
  },
  {
    text: 'Warm olive oil in a skillet, add minced garlic, and saute until fragrant.',
    image: 'https://images.unsplash.com/photo-1604908812867-073da2c94321?auto=format&fit=crop&w=420&q=82',
  },
  {
    text: 'Add cherry tomatoes and cook until they soften and release their juices.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=420&q=82',
  },
  {
    text: 'Pour in cream, stir in parmesan, and simmer until smooth.',
    image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=420&q=82',
  },
  {
    text: 'Toss pasta and spinach with the sauce until the greens wilt and the pasta is coated.',
    image: pastaImage,
  },
];

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'ready' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState('');
  const [detectedIngredients, setDetectedIngredients] = useState(pantryIngredients.slice(0, 8));
  const [missingIngredients, setMissingIngredients] = useState(defaultMissingProducts);
  const [scanMessage, setScanMessage] = useState('Scan your pantry to let YOLO-style vision build recipe matches.');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<'cart' | 'paying' | 'paid'>('cart');
  const [northState, setNorthState] = useState<'idle' | 'creating' | 'mounted' | 'submitting' | 'approved' | 'error'>('idle');
  const [northSessionToken, setNorthSessionToken] = useState('');
  const [northMessage, setNorthMessage] = useState('Secure card entry appears here when you buy missing ingredients.');
  const [webhookState, setWebhookState] = useState<'idle' | 'sending' | 'received' | 'error'>('idle');
  const [webhookReceipt, setWebhookReceipt] = useState<WebhookReceipt | null>(null);
  const [northPaymentResult, setNorthPaymentResult] = useState<NorthCheckoutResult | null>(null);
  const northMountRequestId = useRef(0);

  const subtotal = useMemo(
    () => missingIngredients.reduce((sum, product) => sum + product.price * product.quantity, 0),
    [missingIngredients],
  );
  const tax = subtotal * 0.0825;
  const deliveryFee = 4.99;
  const total = subtotal + tax + deliveryFee;

  const resetNorthSession = (message = 'Secure card entry appears here when you buy missing ingredients.') => {
    northMountRequestId.current += 1;
    setCheckoutState('cart');
    setNorthState('idle');
    setNorthSessionToken('');
    setNorthPaymentResult(null);
    setNorthMessage(message);
    setWebhookState('idle');
    setWebhookReceipt(null);
  };

  const handlePantryImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUrl(URL.createObjectURL(file));
    setScanState('scanning');
    setScanMessage('Running visual pantry detection and matching ingredients to recipes.');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/analyze-pantry', {
        method: 'POST',
        body: formData,
      });
      const result = (await response.json()) as AnalysisResponse;
      const detected = result.detectedIngredients.map((ingredient) => ingredient.item).filter(Boolean);

      setDetectedIngredients(Array.from(new Set(detected)).slice(0, 12));
      setMissingIngredients(result.recipe?.missingIngredients?.length ? result.recipe.missingIngredients : defaultMissingProducts);
      setScanState('ready');
      setScanMessage(result.summary || `${result.source.toUpperCase()} detected ${result.detectedItems} pantry signals. Recipe matches updated.`);
      setPage('dashboard');
    } catch {
      setDetectedIngredients(pantryIngredients);
      setMissingIngredients(defaultMissingProducts);
      setScanState('ready');
      setScanMessage('Demo YOLO pantry results loaded. Recipe matches are ready.');
      setPage('dashboard');
    }
  };

  const openCheckout = () => {
    setCheckoutOpen(true);
    resetNorthSession('Preparing secure payment fields for your missing ingredients.');
    window.setTimeout(() => document.getElementById('recipe-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const buildNorthPayload = () => ({
    amount: roundCurrency(subtotal),
    tax: roundCurrency(tax),
    serviceFee: roundCurrency(deliveryFee),
    metadata: {
      recipe: 'Creamy Garlic Pasta',
      source: 'recipe-remix',
      detectedIngredients,
      missingIngredients: missingIngredients.map((product) => product.name),
      checkoutContext: 'Buy Missing Ingredients',
    },
    products: missingIngredients.map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      logoUrl: product.image,
    })),
  });

  const createAndMountNorthFields = async () => {
    const requestId = ++northMountRequestId.current;
    setCheckoutState('paying');
    setNorthState('creating');
    setNorthMessage('Preparing secure payment fields.');
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

    if (requestId !== northMountRequestId.current) return;

    setNorthSessionToken(session.sessionToken);
    await loadNorthCheckoutScript();
    await nextFrame();

    if (requestId !== northMountRequestId.current) return;

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
      setNorthMessage('Payment approved.');
    });

    setNorthState('mounted');
    setCheckoutState('cart');
    setNorthMessage('Secure card entry is ready.');
  };

  const simulateNorthWebhook = async () => {
    setWebhookState('sending');

    const response = await fetch('/api/north/mock-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: 'USD',
        cartItems: missingIngredients.map((product) => ({
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          unitPrice: Math.round(product.price * 100),
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Webhook simulation failed.');
    }

    const receipt = (await response.json()) as WebhookReceipt;
    setWebhookReceipt(receipt);
    setWebhookState('received');
  };

  const submitNorthPayment = async () => {
    setCheckoutState('paying');
    setNorthState('submitting');
    setNorthMessage('Authorizing payment.');
    setWebhookReceipt(null);

    if (!window.checkout?.submit) {
      throw new Error('Secure payment fields are not ready yet.');
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
    setNorthMessage('Payment approved. Missing ingredients are ready for fulfillment.');
  };

  const startCheckout = async () => {
    if (!checkoutOpen) {
      openCheckout();
      return;
    }

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
      setNorthMessage(error instanceof Error ? error.message : 'Checkout failed.');
    }
  };

  useEffect(() => {
    if (!checkoutOpen || checkoutState === 'paid' || northState !== 'idle') return;

    const timer = window.setTimeout(() => {
      createAndMountNorthFields().catch((error) => {
        setCheckoutState('cart');
        setNorthState('error');
        setWebhookState('error');
        setNorthMessage(error instanceof Error ? error.message : 'Checkout failed.');
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [checkoutOpen, checkoutState, northState]);

  return (
    <main className="recipe-app">
      <Header page={page} onNavigate={setPage} />
      {page === 'landing' && <Landing onNavigate={setPage} onScan={handlePantryImage} />}
      {page === 'dashboard' && (
        <Dashboard
          detectedIngredients={detectedIngredients}
          imageUrl={imageUrl}
          scanMessage={scanMessage}
          scanState={scanState}
          onNavigate={setPage}
          onScan={handlePantryImage}
        />
      )}
      {page === 'recipe' && (
        <RecipePage
          checkoutOpen={checkoutOpen}
          checkoutState={checkoutState}
          detectedIngredients={detectedIngredients}
          missingIngredients={missingIngredients}
          northMessage={northMessage}
          northState={northState}
          onBack={() => setPage('dashboard')}
          onBuyMissing={openCheckout}
          onPay={startCheckout}
          subtotal={subtotal}
          tax={tax}
          deliveryFee={deliveryFee}
          total={total}
          webhookState={webhookState}
          webhookReceipt={webhookReceipt}
        />
      )}
    </main>
  );
}

function Header({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  return (
    <header className="app-header">
      <button className="brand-button" onClick={() => onNavigate('landing')}>
        <span className="brand-text">recipe</span>
        <span className="brand-script">remix</span>
      </button>

      <nav className="top-nav" aria-label="Primary navigation">
        <NavButton active={page === 'dashboard'} icon={<Home size={17} />} label="Home" onClick={() => onNavigate('dashboard')} />
        <NavButton active={page === 'recipe'} icon={<ShoppingBasket size={17} />} label="Recipes" onClick={() => onNavigate('recipe')} />
        <NavButton icon={<PackageCheck size={17} />} label="Pantry" onClick={() => onNavigate('dashboard')} />
        <NavButton icon={<Heart size={17} />} label="Community" onClick={() => onNavigate('landing')} />
        <NavButton icon={<Sparkles size={17} />} label="Shop" onClick={() => onNavigate('recipe')} />
      </nav>

      <div className="header-actions">
        <label className="search-field">
          <input placeholder="Search recipes, ingredients..." />
          <Search size={18} />
        </label>
        <button className="icon-button" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <button className="profile-button" aria-label="Profile menu">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="" />
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}

function Landing({
  onNavigate,
  onScan,
}: {
  onNavigate: (page: Page) => void;
  onScan: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <section className="landing-hero">
        <div className="hero-copy">
          <h1>
            Remix recipes.
            <span>Love what is next.</span>
          </h1>
          <p>Turn what you have into something delicious with visual pantry detection, recipe remixing, and smart grocery checkout.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('dashboard')}>
              Get started free
            </button>
            <label className="ghost-button">
              <ScanLine size={18} />
              Scan pantry
              <input type="file" accept="image/*" onChange={onScan} />
            </label>
          </div>
          <div className="social-proof">
            <span className="avatar-stack">
              {[1, 2, 3, 4].map((item) => (
                <img
                  key={item}
                  src={`https://i.pravatar.cc/80?img=${item + 20}`}
                  alt=""
                />
              ))}
            </span>
            <span>
              <b>Join 50,000+ home cooks</b>
              <small>cooking smarter with pantry vision</small>
            </span>
          </div>
        </div>

        <div className="hero-media">
          <img src={heroImage} alt="Creamy pasta with cherry tomatoes and basil" />
          <PantryOverview compact />
          <div className="floating-recipe">
            <img src={pastaImage} alt="" />
            <div>
              <strong>Creamy Garlic Pasta</strong>
              <span>
                <Star size={14} fill="currentColor" /> 4.8 (126)
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <Feature icon={<PackageCheck />} title="Smart Pantry" copy="Track ingredients and know exactly what you have." />
        <Feature icon={<Utensils />} title="Recipe Remix" copy="Get recipe ideas based on ingredients and preferences." />
        <Feature icon={<ShoppingBasket />} title="Shop Smarter" copy="Buy only what you need with smart grocery lists." />
        <Feature icon={<Heart />} title="Save & Share" copy="Save favorites and share your creations." />
      </section>

      <section className="steps-section">
        <p className="pill-label">How it works</p>
        <h2>Dinner, your way in 3 simple steps</h2>
        <div className="steps-grid">
          <Step number="1" title="Add your ingredients" copy="Scan your pantry to see what you have." />
          <Step number="2" title="Get recipe ideas" copy="We suggest recipes using what is on hand." />
          <Step number="3" title="Cook & enjoy" copy="Shop missing items and start cooking." />
        </div>
        <button className="primary-button" onClick={() => onNavigate('dashboard')}>
          Get started free
        </button>
      </section>
    </>
  );
}

function Dashboard({
  detectedIngredients,
  imageUrl,
  scanMessage,
  scanState,
  onNavigate,
  onScan,
}: {
  detectedIngredients: string[];
  imageUrl: string;
  scanMessage: string;
  scanState: 'idle' | 'scanning' | 'ready' | 'error';
  onNavigate: (page: Page) => void;
  onScan: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="welcome-line">Good morning, Sarah</p>
          <h1>
            What will you <span>cook</span> today?
          </h1>
          <p>Find recipe ideas based on what you have in your pantry and your cravings.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('recipe')}>
              <Sparkles size={18} />
              Find Recipe Ideas
            </button>
            <label className="secondary-button">
              <ScanLine size={18} />
              Scan Pantry
              <input type="file" accept="image/*" onChange={onScan} />
            </label>
          </div>
        </div>
        <div className="dashboard-image">
          <img src={imageUrl || heroImage} alt="Detected pantry recipe inspiration" />
          <PantryOverview />
        </div>
      </section>

      <section className="scan-summary">
        <div>
          <p className="pill-label">YOLO visual pantry API</p>
          <h2>{scanState === 'scanning' ? 'Scanning pantry image' : 'Ingredient highlights'}</h2>
          <p>{scanMessage}</p>
        </div>
        <div className="detected-list">
          {detectedIngredients.map((ingredient) => (
            <span key={ingredient}>{ingredient}</span>
          ))}
        </div>
      </section>

      <section className="recipes-panel">
        <div className="section-heading">
          <h2>Recipe ideas for you</h2>
          <button onClick={() => onNavigate('recipe')}>
            View all recipes <ArrowRight size={16} />
          </button>
        </div>
        <div className="recipe-grid">
          {recipeCards.map((recipe) => (
            <RecipeCard key={recipe.title} recipe={recipe} onClick={() => onNavigate('recipe')} />
          ))}
        </div>
      </section>

      <section className="ingredient-highlights">
        <Highlight icon={<Leaf />} value="22" label="You have all" copy="Great, you are ready to cook." tone="green" />
        <Highlight icon={<ShoppingBasket />} value="6" label="You have some" copy="A few more and you are good to go." tone="gold" />
        <Highlight icon={<ShoppingCart />} value="7" label="You are missing" copy="Add these to cook more recipes." tone="red" />
      </section>
    </>
  );
}

function RecipePage({
  checkoutOpen,
  checkoutState,
  detectedIngredients,
  missingIngredients,
  northMessage,
  northState,
  onBack,
  onBuyMissing,
  onPay,
  subtotal,
  tax,
  deliveryFee,
  total,
  webhookState,
  webhookReceipt,
}: {
  checkoutOpen: boolean;
  checkoutState: 'cart' | 'paying' | 'paid';
  detectedIngredients: string[];
  missingIngredients: MissingProduct[];
  northMessage: string;
  northState: 'idle' | 'creating' | 'mounted' | 'submitting' | 'approved' | 'error';
  onBack: () => void;
  onBuyMissing: () => void;
  onPay: () => void;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  webhookState: 'idle' | 'sending' | 'received' | 'error';
  webhookReceipt: WebhookReceipt | null;
}) {
  return (
    <section className="recipe-page">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to recipes
      </button>

      <div className="recipe-layout">
        <div className="recipe-main">
          <article className="recipe-hero-card">
            <div className="video-card">
              <img src={pastaImage} alt="Creamy Garlic Pasta" />
              <span className="difficulty">Easy</span>
              <button className="play-button" aria-label="Play recipe video">
                <Play size={22} fill="currentColor" />
              </button>
            </div>
            <div className="recipe-title-block">
              <h1>
                Creamy Garlic Pasta <Leaf size={24} />
              </h1>
              <p>A rich and comforting pasta made with garlic, cream, parmesan, and fresh spinach. Perfect for busy weeknights.</p>
              <div className="recipe-meta">
                <span>
                  <Star size={15} fill="currentColor" /> 4.8 (126)
                </span>
                <span>
                  <Clock3 size={15} /> 25 min
                </span>
                <span>4 servings</span>
                <span>Vegetarian</span>
              </div>
              <div className="recipe-actions">
                <button><Heart size={17} /> Like 142</button>
                <button><Bookmark size={17} /> Save 116</button>
                <button><Share2 size={17} /> Share</button>
              </div>
            </div>
          </article>

          <article className="directions-card">
            <div className="tabs">
              <button className="active">Directions</button>
              <button>Notes (12)</button>
              <button>Reviews (126)</button>
            </div>
            {directions.map((step, index) => (
              <div className="direction-row" key={step.text}>
                <span>{index + 1}</span>
                <p>{step.text}</p>
                <img src={step.image} alt="" />
              </div>
            ))}
          </article>
        </div>

        <aside className="recipe-sidebar">
          <div className="quick-facts">
            <Fact icon={<Clock3 />} label="Prep Time" value="10 min" />
            <Fact icon={<Clock3 />} label="Cook Time" value="15 min" />
            <Fact icon={<Clock3 />} label="Total Time" value="25 min" />
            <Fact icon={<Utensils />} label="Servings" value="4" />
          </div>

          <div className="missing-card">
            <h2>
              Missing <span>{missingIngredients.length} ingredients</span>
            </h2>
            <p>Add missing ingredients to cook this recipe.</p>
            <div className="missing-icons">
              {missingIngredients.map((product) => (
                <img key={product.id} src={product.image} alt={product.name} />
              ))}
            </div>
            <button className="primary-button wide" onClick={onBuyMissing}>
              <ShoppingCart size={18} />
              Buy Missing Ingredients
            </button>
          </div>

          <div className="ingredients-card">
            <div className="section-heading">
              <h2>Ingredients</h2>
              <span>4 servings</span>
            </div>
            <IngredientGroup title="Have all" tone="green" items={detectedIngredients.slice(0, 5)} />
            <IngredientGroup title="Have some" tone="gold" items={['Heavy Cream', 'Parmesan Cheese']} />
            <IngredientGroup title="Missing" tone="red" items={missingIngredients.map((product) => product.name)} withCart />
          </div>

          {checkoutOpen && (
            <div className="checkout-card" id="recipe-checkout">
              <div className="checkout-heading">
                <div>
                  <p className="pill-label">Secure checkout</p>
                  <h2>Missing ingredients</h2>
                </div>
                <ShieldCheck size={22} />
              </div>

              <div className="checkout-lines">
                {missingIngredients.map((product) => (
                  <div key={product.id}>
                    <span>
                      {product.quantity} x {product.name}
                      <small>{product.label}</small>
                    </span>
                    <b>{money.format(product.price)}</b>
                  </div>
                ))}
              </div>

              <div className="checkout-totals">
                <Line label="Subtotal" value={money.format(subtotal)} />
                <Line label="Estimated tax" value={money.format(tax)} />
                <Line label="Delivery" value={money.format(deliveryFee)} />
                <Line label="Total" value={money.format(total)} strong />
              </div>

              <div className="payment-shell">
                <div className="payment-status">
                  <ReceiptText size={20} />
                  <div>
                    <strong>
                      {checkoutState === 'paid'
                        ? 'Payment approved'
                        : northState === 'mounted'
                          ? 'Card entry ready'
                          : northState === 'creating'
                            ? 'Preparing secure card entry'
                            : northState === 'submitting'
                              ? 'Authorizing payment'
                              : northState === 'error'
                                ? 'Payment setup needs attention'
                                : 'Preparing secure card entry'}
                    </strong>
                    <small>{webhookReceipt ? `Receipt ${webhookReceipt.eventId}` : northMessage}</small>
                  </div>
                </div>
                <div
                  id={northFieldsContainerId}
                  className={`north-fields-container ${
                    northState === 'creating' || northState === 'mounted' || northState === 'submitting' || northState === 'approved'
                      ? 'active'
                      : ''
                  }`}
                />
              </div>

              <button
                className="checkout-button"
                onClick={onPay}
                disabled={northState === 'creating' || northState === 'submitting' || checkoutState === 'paid'}
              >
                {checkoutState === 'cart' && northState === 'mounted' && (
                  <>
                    <CreditCard size={18} />
                    Pay {money.format(total)}
                    <ArrowRight size={18} />
                  </>
                )}
                {checkoutState === 'cart' && northState !== 'mounted' && northState !== 'error' && (
                  <>
                    <CreditCard size={18} />
                    Prepare secure checkout
                    <ArrowRight size={18} />
                  </>
                )}
                {checkoutState === 'cart' && northState === 'error' && (
                  <>
                    <CreditCard size={18} />
                    Retry secure checkout
                    <ArrowRight size={18} />
                  </>
                )}
                {checkoutState === 'paying' && (
                  <>
                    <span className="spinner" />
                    {northState === 'creating' ? 'Preparing secure checkout' : 'Authorizing payment'}
                  </>
                )}
                {checkoutState === 'paid' && (
                  <>
                    <Check size={18} />
                    Payment approved
                  </>
                )}
              </button>

              <div className="timeline">
                <TimelineStep done label="Cart built" />
                <TimelineStep done={checkoutState === 'paid'} label="Payment authorized" />
                <TimelineStep done={webhookState === 'received'} label="Fulfillment sandbox" />
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function PantryOverview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`pantry-overview ${compact ? 'compact' : ''}`}>
      <h3>Pantry Overview</h3>
      <PantryStat icon={<Leaf />} value="22" label="Have all" tone="green" />
      <PantryStat icon={<ShoppingBasket />} value="6" label="Have some" tone="gold" />
      <PantryStat icon={<ShoppingCart />} value="7" label="Missing" tone="red" />
      {!compact && <button>View pantry <ArrowRight size={15} /></button>}
    </div>
  );
}

function RecipeCard({ recipe, onClick }: { recipe: (typeof recipeCards)[number]; onClick: () => void }) {
  return (
    <article className="recipe-card" onClick={onClick}>
      <div className="recipe-card-image">
        <img src={recipe.image} alt={recipe.title} />
        <span><Clock3 size={14} /> {recipe.time}</span>
        <button aria-label={`Save ${recipe.title}`}><Bookmark size={17} /></button>
      </div>
      <h3>{recipe.title}</h3>
      <div className="recipe-rating">
        <Star size={15} fill="currentColor" /> {recipe.rating}
        {recipe.tags.map((tag) => (
          <small key={tag}>{tag}</small>
        ))}
      </div>
      <div className="match-dots">
        <Leaf size={18} />
        <ShoppingBasket size={18} />
        <ShoppingCart size={18} />
      </div>
    </article>
  );
}

function NavButton({ active = false, icon, label, onClick }: { active?: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button className={active ? 'active' : ''} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

function Feature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <article>
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}

function Step({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <article>
      <span>{number}</span>
      <div className="step-illustration">
        <PackageCheck size={38} />
      </div>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}

function Highlight({ icon, value, label, copy, tone }: { icon: React.ReactNode; value: string; label: string; copy: string; tone: string }) {
  return (
    <article className={`highlight ${tone}`}>
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
        <small>{copy}</small>
      </div>
    </article>
  );
}

function PantryStat({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: string }) {
  return (
    <div className={`pantry-stat ${tone}`}>
      <span>{icon}</span>
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <span>{icon}</span>
      <b>{label}</b>
      <strong>{value}</strong>
    </div>
  );
}

function IngredientGroup({ title, items, tone, withCart = false }: { title: string; items: string[]; tone: string; withCart?: boolean }) {
  return (
    <div className="ingredient-group">
      <h3 className={tone}>{title}</h3>
      {items.map((item) => (
        <div key={item} className="ingredient-row">
          <span className={tone}>{tone === 'green' ? <Check size={14} /> : withCart ? <ShoppingCart size={14} /> : <ShoppingBasket size={14} />}</span>
          <b>{item}</b>
          <small>{withCart ? 'Add' : 'Ready'}</small>
        </div>
      ))}
    </div>
  );
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? 'strong' : ''}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function TimelineStep({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`timeline-step ${done ? 'done' : ''}`}>
      <span><CheckCircle2 size={15} /></span>
      <small>{label}</small>
    </div>
  );
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

export default App;
