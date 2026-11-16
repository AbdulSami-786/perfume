import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { assetUrl, formatPrice, FREE_SHIPPING_THRESHOLD } from '../lib/site';
import { imageBgFor } from '../data/products';

const CartDrawer = () => {
  const {
    cartItems, drawerOpen, closeDrawer, updateQuantity, removeFromCart,
    subtotal, freeShippingRemaining, cartCount,
  } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] animate-fade-in" onClick={closeDrawer} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-[26rem] bg-ivory flex flex-col shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <h2 className="text-2xl">Your Bag <span className="text-mute text-lg">({cartCount})</span></h2>
          <button onClick={closeDrawer} aria-label="Close bag" className="p-1 hover:text-gold transition-colors">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <ShoppingBag size={44} strokeWidth={1} className="text-gold mb-5" />
            <p className="font-display text-3xl mb-2">Your bag is empty</p>
            <p className="text-sm text-mute mb-8">Discover a scent that feels like you.</p>
            <Link to="/products" onClick={closeDrawer} className="btn btn-dark">Shop the Collection</Link>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 bg-sand/60 border-b border-line">
              <p className="text-xs text-ink mb-2.5">
                {freeShippingRemaining > 0
                  ? <>Add <strong className="font-medium">{formatPrice(freeShippingRemaining)}</strong> more for free delivery</>
                  : <strong className="font-medium">You've unlocked free delivery</strong>}
              </p>
              <div className="h-[3px] bg-line overflow-hidden">
                <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto px-6 divide-y divide-line">
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link to={`/product/${item.id}`} onClick={closeDrawer} className="shrink-0 w-20 h-24 border border-line/70" style={{ background: imageBgFor(item.id) }}>
                    <img src={assetUrl(item.mainImage)} alt={item.name} className="w-full h-full object-contain p-1" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <Link to={`/product/${item.id}`} onClick={closeDrawer} className="font-display text-xl leading-tight hover:text-gold transition-colors">
                        {item.shortName || item.name}
                      </Link>
                      <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.shortName || item.name}`} className="text-mute hover:text-ink transition-colors self-start">
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                    {item.subtitle && <p className="text-xs text-mute">{item.subtitle}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-line bg-white">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity" className="w-8 h-8 flex items-center justify-center hover:bg-sand disabled:opacity-30 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity" className="w-8 h-8 flex items-center justify-center hover:bg-sand transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-6 py-6 border-t border-line bg-white">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[0.7rem] tracking-[0.22em] uppercase text-mute">Subtotal</span>
                <span className="font-display text-3xl">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-mute mb-5">Delivery and promo codes are calculated in your bag.</p>
              <Link to="/checkout" onClick={closeDrawer} className="btn btn-dark w-full mb-3">Checkout</Link>
              <Link to="/cart" onClick={closeDrawer} className="btn btn-outline w-full">View Bag</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
