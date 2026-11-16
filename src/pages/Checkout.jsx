import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Banknote, Check, ChevronLeft, Copy, Gift, ImagePlus, Landmark, Loader2, Lock, PackageCheck, Printer, ShieldCheck,
  Trash2, Truck, Wallet,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, imageToDataUrl } from '../lib/api';
import { BANK, formatPrice, PROMO_CODE } from '../lib/site';
import Receipt from '../components/Receipt';

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'];

/* ------------------------------ small pieces ------------------------------ */

const Steps = ({ current }) => {
  const steps = ['Bag', 'Details & payment', 'Confirmation'];
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-3" aria-label="Checkout progress">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current || current === 3;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3" aria-current={active ? 'step' : undefined}>
            <span className={`flex items-center gap-2 text-[0.66rem] sm:text-[0.7rem] tracking-[0.16em] uppercase ${active || done ? 'text-ink' : 'text-mute'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.68rem] border transition-colors ${done ? 'bg-gold border-gold text-white' : active ? 'bg-ink border-ink text-white' : 'border-ink/25'}`}>
                {done ? <Check size={13} strokeWidth={3} /> : n}
              </span>
              <span className={i === 1 ? '' : 'hidden sm:inline'}>{label}</span>
            </span>
            {i < steps.length - 1 && <span className={`w-6 sm:w-14 h-px ${n < current ? 'bg-gold' : 'bg-ink/20'}`} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
};

const CardHead = ({ n, title, sub }) => (
  <div className="flex items-center gap-4 mb-7">
    <span className="shrink-0 w-10 h-10 rounded-full bg-ink text-white font-display text-xl flex items-center justify-center">{n}</span>
    <div>
      <h2 className="text-[1.9rem] md:text-3xl leading-none">{title}</h2>
      {sub && <p className="text-xs text-mute mt-1.5">{sub}</p>}
    </div>
  </div>
);

const card = 'bg-white border border-line/70 p-6 md:p-9 shadow-[0_24px_50px_-38px_rgba(70,48,12,0.5)]';

const CopyRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/10 last:border-0">
      <div className="min-w-0">
        <p className="text-[0.64rem] tracking-[0.2em] uppercase text-white/50">{label}</p>
        <p className="font-medium break-all text-white">{value}</p>
      </div>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="shrink-0 flex items-center gap-1.5 text-xs text-white/60 hover:text-gold-light transition-colors py-2 pl-3">
        {copied ? <><Check size={14} className="text-gold-light" /> Copied</> : <><Copy size={14} /> Copy</>}
      </button>
    </div>
  );
};

const PayOption = ({ value, current, onChange, icon: Icon, title, text }) => (
  <label className={`relative flex items-start gap-4 border p-5 cursor-pointer transition-all ${current === value ? 'border-ink bg-ivory shadow-[inset_0_0_0_1px_var(--color-ink)]' : 'border-line bg-white hover:border-ink/50'}`}>
    <input type="radio" name="paymentMethod" value={value} checked={current === value} onChange={() => onChange(value)} className="sr-only" />
    <span className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${current === value ? 'bg-ink text-white' : 'bg-sand text-gold'}`}>
      <Icon size={20} strokeWidth={1.4} />
    </span>
    <span className="flex-1 pt-0.5">
      <span className="block text-sm font-medium">{title}</span>
      <span className="block text-xs text-mute mt-0.5">{text}</span>
    </span>
    <span className={`mt-1 w-4 h-4 rounded-full border shrink-0 ${current === value ? 'border-[5px] border-ink' : 'border-ink/30'}`} aria-hidden="true" />
  </label>
);

const nextSteps = {
  bank: [
    ['Payment check', 'We verify your transfer screenshot against our bank account.'],
    ['Packed with care', 'Your order is prepared in gift-ready packaging.'],
    ['On its way', 'Dispatched to your door anywhere in Pakistan.'],
  ],
  cod: [
    ['Order confirmed', 'We review and confirm your order.'],
    ['Packed with care', 'Your order is prepared in gift-ready packaging.'],
    ['Pay on delivery', 'Pay in cash when it arrives at your door.'],
  ],
};

/* --------------------------------- page --------------------------------- */

const Checkout = () => {
  const cart = useCart();
  const { cartItems, clearCart, promoApplied } = cart;
  const { user } = useAuth();

  // Only the fields the customer edits are stored; the rest fall back to their saved profile.
  const [edits, setEdits] = useState({});
  const defaults = {
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    city: user?.city || 'Karachi', address: user?.address || '', notes: '',
  };
  const val = (k) => edits[k] ?? defaults[k];
  const set = (e) => setEdits((f) => ({ ...f, [e.target.name]: e.target.value }));

  const [method, setMethod] = useState('cod');
  const [proof, setProof] = useState(null); // { dataUrl, name }
  const [proofError, setProofError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hp, setHp] = useState('');
  const [placed, setPlaced] = useState(null);
  const [now] = useState(() => new Date());
  const fileRef = useRef(null);

  useEffect(() => { document.title = placed ? 'Order confirmed | Zareen Fragrance' : 'Checkout | Zareen Fragrance'; }, [placed]);

  // An empty bag redirects — except right after the order was placed.
  if (cartItems.length === 0 && !placed) return <Navigate to="/cart" replace />;

  /* ---------------------------- confirmation ---------------------------- */
  if (placed) {
    const first = (placed.customer.name || '').trim().split(/\s+/)[0];
    const timeline = nextSteps[placed.method];
    return (
      <div>
        <header className="bg-sand border-b border-line no-print">
          <div className="container mx-auto px-5 py-8 md:py-12 text-center">
            <h1 className="text-4xl md:text-5xl mb-6">Order confirmed</h1>
            <Steps current={3} />
          </div>
        </header>

        <div className="container mx-auto px-5 py-10 md:py-16 max-w-5xl">
          <div className="grid lg:grid-cols-[1fr_25rem] gap-12 lg:gap-16 items-start">
            <div className="text-center lg:text-left no-print">
              <span className="relative mx-auto lg:mx-0 mb-7 w-20 h-20 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-gold animate-ring" aria-hidden="true" />
                <span className="relative w-20 h-20 rounded-full bg-gold text-white flex items-center justify-center animate-pop"><Check size={36} strokeWidth={2.2} /></span>
              </span>
              <p className="eyebrow mb-3">Order received</p>
              <h2 className="text-5xl md:text-6xl mb-4">Thank you{first ? `, ${first}` : ''}</h2>
              <p className="text-mute mb-8">Your order number is <strong className="text-ink font-medium">{placed.orderId}</strong></p>

              <div className={`${card} !p-6 text-sm space-y-3 mb-8 text-left`}>
                <div className="flex justify-between items-baseline"><span className="text-mute">Total</span><span className="font-display text-3xl leading-none">{formatPrice(placed.total)}</span></div>
                <div className="flex justify-between"><span className="text-mute">Payment</span><span>{placed.method === 'bank' ? 'Bank transfer' : 'Cash on delivery'}</span></div>
                <div className="flex justify-between"><span className="text-mute">Payment status</span><span>{placed.paymentStatus}</span></div>
              </div>

              <h3 className="font-sans text-[0.72rem] tracking-[0.24em] uppercase font-medium mb-5 text-left">What happens next</h3>
              <ol className="relative text-left space-y-6 mb-10">
                <span className="absolute left-[0.95rem] top-3 bottom-3 w-px bg-line" aria-hidden="true" />
                {timeline.map(([t, d], i) => (
                  <li key={t} className="relative flex gap-4">
                    <span className={`relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${i === 0 ? 'bg-ink text-white' : 'bg-white border border-line text-mute'}`}>{i + 1}</span>
                    <span><span className="block text-sm font-medium">{t}</span><span className="block text-xs text-mute mt-0.5">{d}</span></span>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button type="button" onClick={() => window.print()} className="btn btn-dark"><Printer size={15} /> Print / save receipt</button>
                {user
                  ? <Link to="/account" className="btn btn-outline">View my orders</Link>
                  : <Link to="/signup?next=/account" className="btn btn-outline">Create an account</Link>}
              </div>
              <Link to="/products" className="inline-block mt-4 py-2 text-[0.72rem] tracking-[0.2em] uppercase font-medium hover:text-gold transition-colors">Continue shopping →</Link>
              {!user && <p className="mt-3 text-xs text-mute">Log in before your next order to track it in your account.</p>}
            </div>

            <div className="max-w-sm w-full mx-auto lg:mx-0">
              <Receipt
                items={placed.items}
                subtotal={placed.subtotal}
                promoDiscount={placed.promoDiscount}
                shipping={placed.shipping}
                total={placed.total}
                savings={placed.savings}
                customerName={placed.customer.name}
                city={placed.customer.city}
                address={placed.customer.address}
                method={placed.method}
                orderId={placed.orderId}
                date={new Date(placed.createdAt)}
                paymentStatus={placed.paymentStatus}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- handlers ------------------------------- */
  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProofError('');
    try {
      setProof({ dataUrl: await imageToDataUrl(file), name: file.name });
    } catch (err) {
      setProof(null);
      setProofError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (method === 'bank' && !proof) {
      setProofError('Please upload your payment screenshot to place a bank-transfer order.');
      fileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy(true);
    try {
      const customer = { name: val('name'), phone: val('phone'), email: val('email'), city: val('city'), address: val('address'), notes: val('notes') };
      const data = await api('placeOrder', {
        customer,
        items: cartItems.map((i) => ({ id: i.id, quantity: i.quantity })),
        paymentMethod: method,
        promoCode: promoApplied ? PROMO_CODE : '',
        proof: method === 'bank' ? proof.dataUrl : undefined,
        hp,
      });
      // Snapshot everything the final receipt needs, then empty the bag.
      setPlaced({
        ...data,
        method,
        customer,
        savings: cart.savings,
        items: cartItems.map((i) => ({ name: i.shortName || i.name, quantity: i.quantity, price: i.price })),
      });
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const receiptItems = cartItems.map((i) => ({ name: i.shortName || i.name, quantity: i.quantity, price: i.price }));

  /* --------------------------------- form --------------------------------- */
  return (
    <div>
      <header className="bg-sand border-b border-line">
        <div className="container mx-auto px-5 py-8 md:py-12 text-center">
          <h1 className="text-4xl md:text-5xl mb-6">Checkout</h1>
          <Steps current={2} />
        </div>
      </header>

      <div className="container mx-auto px-5 py-8 md:py-14">
        {!user && (
          <p className="mb-8 text-sm text-mute bg-white border border-line/70 px-5 py-4 text-center">
            Already a customer? <Link to="/login?next=/checkout" className="text-ink underline underline-offset-4 hover:text-gold">Log in</Link> or{' '}
            <Link to="/signup?next=/checkout" className="text-ink underline underline-offset-4 hover:text-gold">create an account</Link> to track this order and check out faster.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-14 items-start">
          <form onSubmit={submit} className="space-y-6 md:space-y-8">
            {/* 1 — delivery */}
            <section className={card}>
              <CardHead n="1" title="Delivery details" sub="Where should we send your order?" />
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-7">
                <div>
                  <label htmlFor="name" className="label">Full name</label>
                  <input id="name" name="name" value={val('name')} onChange={set} required autoComplete="name" placeholder="Your name" className="field" />
                </div>
                <div>
                  <label htmlFor="phone" className="label">Phone</label>
                  <input id="phone" name="phone" type="tel" value={val('phone')} onChange={set} required autoComplete="tel" placeholder="03XX XXXXXXX" className="field" />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input id="email" name="email" type="email" value={val('email')} onChange={set} required autoComplete="email" placeholder="you@example.com" className="field" />
                </div>
                <div>
                  <label htmlFor="city" className="label">City</label>
                  <select id="city" name="city" value={val('city')} onChange={set} className="field">
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="label">Delivery address</label>
                  <textarea id="address" name="address" value={val('address')} onChange={set} required rows={2} autoComplete="street-address" placeholder="House / street / area / landmark" className="field resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="label">Order notes <span className="normal-case tracking-normal text-mute/70">(optional)</span></label>
                  <input id="notes" name="notes" value={val('notes')} onChange={set} placeholder="Gift message, delivery instructions…" className="field" />
                </div>
              </div>
              <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
            </section>

            {/* 2 — payment */}
            <section className={card}>
              <CardHead n="2" title="Payment" sub="Choose how you’d like to pay." />
              <div className="grid sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Payment method">
                <PayOption value="cod" current={method} onChange={setMethod} icon={Wallet} title="Cash on delivery" text="Pay in cash when your order arrives." />
                <PayOption value="bank" current={method} onChange={setMethod} icon={Landmark} title="Bank transfer" text="Transfer now and upload your screenshot." />
              </div>

              {method === 'bank' && (
                <div className="mt-7 space-y-7">
                  <div className="bg-charcoal text-white p-6 md:p-7">
                    <p className="flex items-center gap-2 text-[0.72rem] tracking-[0.2em] uppercase font-medium mb-2 text-gold-light"><Banknote size={16} /> Transfer to this account</p>
                    <CopyRow label="Bank" value={BANK.bankName} />
                    <CopyRow label="Account title" value={BANK.accountTitle} />
                    <CopyRow label="Account number" value={BANK.accountNumber} />
                    <CopyRow label="IBAN" value={BANK.iban} />
                    <CopyRow label="Branch" value={BANK.branch} />
                    <p className="mt-5 text-sm bg-white/10 px-4 py-3">
                      Please transfer exactly <strong className="font-medium text-gold-light">{formatPrice(cart.grandTotal)}</strong> and use your name as the reference.
                    </p>
                  </div>

                  <div ref={fileRef}>
                    <p className="label mb-2">Payment screenshot <span className="text-red-700">*</span></p>
                    {proof ? (
                      <div className="flex items-center gap-5 bg-ivory border border-line p-4">
                        <img src={proof.dataUrl} alt="Your payment screenshot" className="w-24 h-24 object-cover border border-line/70" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium flex items-center gap-2"><Check size={15} className="text-gold" /> Screenshot attached</p>
                          <p className="text-xs text-mute truncate">{proof.name}</p>
                          <button type="button" onClick={() => setProof(null)} className="mt-2 py-1.5 flex items-center gap-1.5 text-xs text-mute hover:text-ink"><Trash2 size={13} /> Remove</button>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="proof" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/25 bg-ivory hover:bg-white hover:border-ink px-6 py-10 text-center cursor-pointer transition-colors">
                        <ImagePlus size={30} strokeWidth={1.25} className="text-gold" />
                        <span className="text-sm font-medium">Upload your payment screenshot</span>
                        <span className="text-xs text-mute">JPG or PNG from your banking app</span>
                      </label>
                    )}
                    <input id="proof" type="file" accept="image/*" onChange={pickFile} className="sr-only" />
                    {proofError && <p role="alert" className="mt-2 text-sm text-red-700">{proofError}</p>}
                    <p className="mt-3 text-xs text-mute">We’ll check your payment and confirm your order. Orders without a verified payment are not shipped.</p>
                  </div>
                </div>
              )}
            </section>

            {/* place order */}
            <div>
              {error && <p role="alert" className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}
              <button type="submit" disabled={busy} className="btn btn-dark w-full !py-5 disabled:opacity-60 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.7)]">
                {busy
                  ? <><Loader2 size={17} className="animate-spin" /> Placing your order…</>
                  : <><Lock size={15} /> Place order · {formatPrice(cart.grandTotal)}</>}
              </button>
              <p className="mt-4 text-xs text-mute text-center leading-relaxed">
                {method === 'bank' ? 'Your order is saved with your payment screenshot for verification.' : 'You’ll pay in cash when your order is delivered.'}
              </p>
              <ul className="mt-6 grid grid-cols-3 gap-2 text-center">
                {[[ShieldCheck, 'Payment checked before dispatch'], [Gift, 'Gift-ready packaging'], [Truck, 'Delivered across Pakistan']].map(([Icon, t]) => (
                  <li key={t} className="flex flex-col items-center gap-2 px-1 py-3 bg-white border border-line/70">
                    <Icon size={18} strokeWidth={1.3} className="text-gold" />
                    <span className="text-[0.66rem] leading-snug text-mute">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </form>

          {/* live receipt */}
          <aside className="lg:sticky lg:top-32">
            <div className="flex items-center gap-2 mb-2 text-[0.7rem] tracking-[0.22em] uppercase text-mute">
              <PackageCheck size={15} className="text-gold" /> Your receipt <span className="normal-case tracking-normal text-mute/70">· updates as you type</span>
            </div>
            <div className="max-w-md mx-auto lg:max-w-none">
              <Receipt
                live
                items={receiptItems}
                subtotal={cart.subtotal}
                promoDiscount={cart.promoDiscount}
                shipping={cart.shippingCost}
                total={cart.grandTotal}
                savings={cart.savings}
                customerName={val('name')}
                city={val('city')}
                method={method}
                date={now}
              />
            </div>
            <Link to="/cart" className="mt-4 inline-flex items-center gap-1.5 py-2 text-[0.7rem] tracking-[0.2em] uppercase font-medium hover:text-gold transition-colors">
              <ChevronLeft size={14} /> Edit bag
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
