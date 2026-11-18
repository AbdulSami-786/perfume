import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, Truck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { assetUrl, formatPrice, FREE_SHIPPING_THRESHOLD } from '../lib/site';
import PageHeader from '../components/PageHeader';
import OrderSummaryRows from '../components/OrderSummaryRows';
import { categoryMeta, imageBgFor, photoFit } from '../data/products';

const Cart = () => {
  const cart = useCart();
  const { cartItems, updateQuantity, removeFromCart, applyPromo, removePromo, promoApplied } = cart;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Shopping Bag | Zareen Fragrance'; }, []);

  const submitPromo = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (applyPromo(code)) { setError(''); setCode(''); } else setError('That code isn’t valid.');
  };

  if (cartItems.length === 0) {
    return (
      <section className="container mx-auto px-5 py-28 md:py-36 text-center">
        <ShoppingBag size={52} strokeWidth={1} className="mx-auto mb-7 text-gold" />
        <h1 className="text-5xl md:text-6xl mb-4">Your bag is empty</h1>
        <p className="text-mute mb-10">Discover a fragrance that feels like you.</p>
        <Link to="/products" className="btn btn-dark">Explore the collection</Link>
      </section>
    );
  }

  const progress = Math.min(100, ((cart.subtotal - cart.promoDiscount) / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div>
      <PageHeader title="Shopping Bag" subtitle={`${cart.cartCount} ${cart.cartCount === 1 ? 'item' : 'items'} in your bag`} crumbs={[{ label: 'Bag' }]} />

      <div className="container mx-auto px-5 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-14 items-start">
          {/* Items */}
          <div>
            <div className="bg-white border border-line/70 p-5 mb-6">
              <p className="text-sm mb-3 flex items-center gap-2.5">
                <Truck size={17} strokeWidth={1.5} className="text-gold shrink-0" />
                {cart.freeShippingRemaining > 0
                  ? <>You're <strong className="font-medium">{formatPrice(cart.freeShippingRemaining)}</strong> away from free delivery.</>
                  : <strong className="font-medium">Your order qualifies for free delivery.</strong>}
              </p>
              <div className="h-[3px] bg-line overflow-hidden"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            </div>

            <ul className="border-t border-line">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 sm:gap-6 py-6 border-b border-line">
                  <Link to={`/product/${item.id}`} className="shrink-0 w-24 h-28 sm:w-28 sm:h-32 border border-line/70" style={{ background: imageBgFor(item.id) }}>
                    <img src={assetUrl(item.mainImage)} alt={item.name} className={`w-full h-full ${photoFit(item.mainImage, 'p-1.5')}`} />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[0.64rem] tracking-[0.26em] uppercase text-gold mb-1">{categoryMeta[item.category]?.label}</p>
                        <Link to={`/product/${item.id}`} className="font-display text-2xl leading-tight hover:text-gold transition-colors block py-0.5">{item.shortName || item.name}</Link>
                        {item.subtitle && <p className="text-xs text-mute mt-0.5">{item.subtitle}</p>}
                      </div>
                      <p className="font-medium text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="flex items-center border border-line bg-white">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity" className="w-9 h-9 flex items-center justify-center hover:bg-sand disabled:opacity-30 transition-colors"><Minus size={13} /></button>
                        <span className="w-9 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity" className="w-9 h-9 flex items-center justify-center hover:bg-sand transition-colors"><Plus size={13} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="flex items-center gap-1.5 text-xs text-mute hover:text-ink transition-colors py-2 pl-2 -my-2">
                        <Trash2 size={14} strokeWidth={1.5} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/products" className="inline-flex items-center gap-2 mt-6 py-2 text-[0.72rem] tracking-[0.22em] uppercase font-medium hover:text-gold transition-colors">
              <ArrowLeft size={14} /> Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="bg-white border border-line/70 p-7 md:p-8 lg:sticky lg:top-36">
            <h2 className="text-3xl mb-6">Order summary</h2>

            <form onSubmit={submitPromo} className="mb-7">
              <label htmlFor="promo" className="label mb-1">Promo code</label>
              {promoApplied ? (
                <div className="flex items-center justify-between bg-sand px-4 py-3 text-sm mt-2">
                  <span className="flex items-center gap-2"><Tag size={15} className="text-gold" /> Code applied</span>
                  <button type="button" onClick={removePromo} aria-label="Remove promo code" className="text-mute hover:text-ink"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <input id="promo" value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} placeholder="Enter code" className="field flex-1 uppercase tracking-widest text-sm" />
                  <button type="submit" className="px-5 text-[0.7rem] tracking-[0.2em] uppercase font-medium border border-ink hover:bg-ink hover:text-white transition-colors">Apply</button>
                </div>
              )}
              {error && <p role="alert" className="text-xs text-red-700 mt-2">{error}</p>}
            </form>

            <div className="pb-6 mb-6 border-b border-line"><OrderSummaryRows cart={cart} /></div>

            <div className="flex justify-between items-baseline mb-7">
              <span className="text-[0.72rem] tracking-[0.22em] uppercase font-medium">Total</span>
              <span className="font-display text-4xl">{formatPrice(cart.grandTotal)}</span>
            </div>

            <Link to="/checkout" className="btn btn-dark w-full">Proceed to checkout</Link>
            <p className="mt-4 text-center text-xs text-mute">Cash on delivery or bank transfer</p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
