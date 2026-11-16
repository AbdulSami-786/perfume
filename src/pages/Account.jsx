import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Heart, Loader2, LogOut, PackageOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { assetUrl, formatPrice } from '../lib/site';
import { getProduct, imageBgFor } from '../data/products';
import PageHeader from '../components/PageHeader';
import WishlistGrid from '../components/WishlistGrid';

const tabs = [
  { key: 'orders', label: 'Orders', icon: PackageOpen },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'profile', label: 'Profile', icon: User },
];

const statusStyle = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Confirmed: 'bg-sky-50 text-sky-800 border-sky-200',
  Shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-800 border-red-200',
  'Cash on delivery': 'bg-sand text-ink border-line',
  'Awaiting verification': 'bg-amber-50 text-amber-800 border-amber-200',
  Verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-50 text-red-800 border-red-200',
};

const Badge = ({ children }) => (
  <span className={`inline-block border px-2.5 py-1 text-[0.66rem] tracking-[0.14em] uppercase font-medium ${statusStyle[children] || 'bg-sand border-line'}`}>
    {children}
  </span>
);

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const count = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <article className="bg-white border border-line/70">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full text-left p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex -space-x-3">
          {order.items.slice(0, 3).map((i) => (
            <span key={i.id} className="w-14 h-16 border border-line/70 ring-2 ring-white" style={{ background: imageBgFor(i.id) }}>
              <img src={assetUrl(getProduct(i.id)?.mainImage)} alt="" className="w-full h-full object-contain p-1" />
            </span>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-2xl leading-tight">{order.orderId}</p>
          <p className="text-xs text-mute">{date} · {count} {count === 1 ? 'item' : 'items'} · {order.paymentMethod}</p>
          <div className="mt-2.5 flex flex-wrap gap-2"><Badge>{order.status}</Badge><Badge>{order.paymentStatus}</Badge></div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-5">
          <span className="font-display text-3xl">{formatPrice(order.total)}</span>
          <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-line p-5 md:p-6 grid md:grid-cols-[1.4fr_1fr] gap-8 text-sm">
          <ul className="space-y-4">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4">
                <span className="w-12 h-14 border border-line/70 shrink-0" style={{ background: imageBgFor(i.id) }}>
                  <img src={assetUrl(getProduct(i.id)?.mainImage)} alt="" className="w-full h-full object-contain p-1" />
                </span>
                <span className="flex-1 min-w-0">
                  <Link to={`/product/${i.id}`} className="block hover:text-gold transition-colors">{i.name}</Link>
                  <span className="text-xs text-mute">{formatPrice(i.price)} × {i.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-5">
            <dl className="space-y-2">
              <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.promoDiscount > 0 && <div className="flex justify-between text-gold"><dt>Promo discount</dt><dd>−{formatPrice(order.promoDiscount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-mute">Delivery</dt><dd>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</dd></div>
              <div className="flex justify-between font-medium pt-2 border-t border-line"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
            <div>
              <p className="label mb-1">Delivering to</p>
              <p className="text-mute">{order.address}, {order.city}</p>
            </div>
            {order.paymentStatus === 'Awaiting verification' && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2.5">
                We’ve received your payment screenshot and are verifying it. We’ll confirm your order shortly.
              </p>
            )}
            {order.paymentStatus === 'Rejected' && (
              <p className="text-xs text-red-800 bg-red-50 border border-red-200 px-3 py-2.5">
                We couldn’t verify this payment. Please contact us so we can sort it out.
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

const Orders = () => {
  const [state, setState] = useState({ loading: true, orders: [], error: '' });

  useEffect(() => {
    let alive = true;
    api('myOrders')
      .then((d) => alive && setState({ loading: false, orders: d.orders, error: '' }))
      .catch((err) => alive && setState({ loading: false, orders: [], error: err.message }));
    return () => { alive = false; };
  }, []);

  if (state.loading) return <p className="py-16 text-center text-mute flex items-center justify-center gap-3"><Loader2 className="animate-spin" size={18} /> Loading your orders…</p>;
  if (state.error) return <p role="alert" className="py-16 text-center text-red-700">{state.error}</p>;
  if (state.orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <PackageOpen size={46} strokeWidth={1} className="mx-auto text-gold mb-5" />
        <p className="font-display text-3xl mb-2">No orders yet</p>
        <p className="text-sm text-mute mb-8">When you place an order while logged in, it will appear here.</p>
        <Link to="/products" className="btn btn-dark">Start shopping</Link>
      </div>
    );
  }
  return <div className="space-y-4">{state.orders.map((o) => <OrderCard key={o.orderId} order={o} />)}</div>;
};

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone, address: user.address, city: user.city || 'Karachi' });
  const [state, setState] = useState({ busy: false, saved: false, error: '' });
  const set = (e) => { setState((s) => ({ ...s, saved: false })); setForm((f) => ({ ...f, [e.target.name]: e.target.value })); };

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, saved: false, error: '' });
    try {
      await updateProfile(form);
      setState({ busy: false, saved: true, error: '' });
    } catch (err) {
      setState({ busy: false, saved: false, error: err.message });
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-line/70 p-7 md:p-10 max-w-2xl space-y-7">
      <div>
        <label className="label">Email</label>
        <p className="py-3 border-b border-line text-mute">{user.email}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-7">
        <div><label htmlFor="p-name" className="label">Full name</label><input id="p-name" name="name" value={form.name} onChange={set} required className="field" /></div>
        <div><label htmlFor="p-phone" className="label">Phone</label><input id="p-phone" name="phone" type="tel" value={form.phone} onChange={set} className="field" /></div>
      </div>
      <div className="grid sm:grid-cols-[1fr_12rem] gap-7">
        <div><label htmlFor="p-address" className="label">Delivery address</label><input id="p-address" name="address" value={form.address} onChange={set} placeholder="House / street / area" className="field" /></div>
        <div><label htmlFor="p-city" className="label">City</label>
          <select id="p-city" name="city" value={form.city} onChange={set} className="field">{cities.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
      </div>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <div className="flex items-center gap-5">
        <button type="submit" disabled={state.busy} className="btn btn-dark disabled:opacity-60">{state.busy ? 'Saving…' : 'Save changes'}</button>
        {state.saved && <span role="status" className="text-sm text-gold">Saved ✓</span>}
      </div>
      <p className="text-xs text-mute">Your saved address is pre-filled at checkout.</p>
    </form>
  );
};

const Account = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false); // while logging out we go Home, not to the login page
  const [params, setParams] = useSearchParams();
  const tab = tabs.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'orders';

  useEffect(() => { document.title = 'My Account | Zareen Fragrance'; }, []);

  if (loading) return <p className="py-32 text-center text-mute flex items-center justify-center gap-3"><Loader2 className="animate-spin" size={18} /> Loading…</p>;
  if (!user) return leaving ? null : <Navigate to="/login?next=/account" replace />;

  return (
    <div>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]}`} subtitle="Manage your orders, wishlist and details." crumbs={[{ label: 'Account' }]} />
      <div className="container mx-auto px-5 py-10 md:py-14 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line mb-10">
          <div className="flex gap-1 overflow-x-auto no-scrollbar" role="tablist">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setParams({ tab: key }, { replace: true })}
                className={`flex items-center gap-2 px-5 py-4 text-[0.72rem] tracking-[0.2em] uppercase font-medium border-b-2 -mb-px transition-colors ${tab === key ? 'border-ink text-ink' : 'border-transparent text-mute hover:text-ink'}`}
              >
                <Icon size={16} strokeWidth={1.5} /> {label}
              </button>
            ))}
          </div>
          {user.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-2 text-[0.72rem] tracking-[0.2em] uppercase font-medium text-gold hover:text-ink pb-3 md:pb-0 transition-colors">Admin panel</Link>
          )}
          <button onClick={() => { setLeaving(true); logout(); navigate('/'); }} className="flex items-center gap-2 text-[0.72rem] tracking-[0.2em] uppercase font-medium text-mute hover:text-ink pb-3 md:pb-0 transition-colors">
            <LogOut size={15} strokeWidth={1.5} /> Log out
          </button>
        </div>

        {tab === 'orders' && <Orders />}
        {tab === 'wishlist' && <WishlistGrid />}
        {tab === 'profile' && <Profile />}
      </div>
    </div>
  );
};

export default Account;
