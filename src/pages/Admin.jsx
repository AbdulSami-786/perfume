import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check, ChevronDown, Copy, Download, ExternalLink, EyeOff, Eye, ImageIcon, Loader2, LogOut, Lock, MessageCircle,
  RefreshCw, Search, Star, X,
} from 'lucide-react';
import { api, getAdminToken, setAdminToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/site';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Cash on delivery', 'Awaiting verification', 'Verified', 'Rejected'];

const tone = {
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
  <span className={`inline-block border px-2.5 py-1 text-[0.62rem] tracking-[0.14em] uppercase font-medium whitespace-nowrap ${tone[children] || 'bg-sand border-line'}`}>{children}</span>
);

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// 0300… / +92300… → 92300… for wa.me links
const waPhone = (p) => {
  const d = String(p).replace(/\D/g, '');
  return d.startsWith('0') ? `92${d.slice(1)}` : d.startsWith('92') ? d : `92${d}`;
};

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};
const downloadCsv = (filename, rows) => {
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
};

/* ------------------------------ Login ------------------------------ */

const AdminLogin = ({ onLogin }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('account'); // 'account' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const switchMode = () => { setMode((m) => (m === 'account' ? 'password' : 'account')); setError(''); setPassword(''); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'password') {
        const data = await api('adminLogin', { password });
        setAdminToken(data.adminToken);
      } else {
        const user = await login(email, password);
        if (user.role !== 'admin') {
          setError('You are logged in, but this account is not an admin. Ask an admin to set your type to Admin.');
          setBusy(false);
          return;
        }
      }
      onLogin();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm bg-ivory p-9 shadow-2xl">
        <p className="font-display text-3xl tracking-[0.18em] font-semibold text-center">ZAREEN</p>
        <p className="text-[0.6rem] tracking-[0.62em] uppercase text-gold text-center mt-1 mb-8">Admin</p>

        {mode === 'account' && (
          <div className="mb-6">
            <label htmlFor="admin-email" className="label">Email</label>
            <input id="admin-email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
          </div>
        )}
        <label htmlFor="admin-pass" className="label">{mode === 'account' ? 'Password' : 'Master admin password'}</label>
        <div className="relative mb-6">
          <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-mute" />
          <input id="admin-pass" type="password" autoComplete="current-password" autoFocus={mode === 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="field pl-7" />
        </div>
        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 mb-5">{error}</p>}
        <button type="submit" disabled={busy} className="btn btn-dark w-full disabled:opacity-60">
          {busy ? <><Loader2 size={15} className="animate-spin" /> Checking…</> : 'Enter admin panel'}
        </button>
        <button type="button" onClick={switchMode} className="mt-3 w-full py-2.5 text-center text-xs text-mute hover:text-ink underline underline-offset-4">
          {mode === 'account' ? 'Use the master admin password instead' : 'Log in with my admin account instead'}
        </button>
      </form>
    </div>
  );
};

/* ------------------------------ Orders ------------------------------ */

const ProofModal = ({ order, onClose }) => {
  const [state, setState] = useState({ loading: true, dataUrl: '', url: '', error: '' });

  useEffect(() => {
    let alive = true;
    api('adminProof', { orderId: order.orderId })
      .then((d) => alive && setState({ loading: false, dataUrl: d.dataUrl, url: d.url, error: '' }))
      .catch((e) => alive && setState({ loading: false, dataUrl: '', url: order.proofUrl, error: e.message }));
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { alive = false; document.removeEventListener('keydown', onKey); };
  }, [order, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Payment screenshot" onClick={onClose}>
      <div className="bg-ivory max-w-lg w-full max-h-[92vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <p className="font-display text-2xl leading-none">{order.orderId}</p>
            <p className="text-xs text-mute mt-1">Expected: {formatPrice(order.total)} · {order.name}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1"><X size={20} /></button>
        </div>
        <div className="p-5">
          {state.loading && <p className="py-16 text-center text-mute flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading screenshot…</p>}
          {state.error && <p role="alert" className="text-sm text-red-700 mb-3">{state.error}</p>}
          {state.dataUrl && <img src={state.dataUrl} alt={`Payment screenshot for ${order.orderId}`} className="w-full border border-line" />}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            {state.dataUrl && <a href={state.dataUrl} download={`${order.orderId}-payment.jpg`} className="inline-flex items-center gap-1.5 hover:text-gold"><Download size={14} /> Download</a>}
            {state.url && <a href={state.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-gold"><ExternalLink size={14} /> Open in Drive</a>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusSelect = ({ label, value, options, onChange, disabled }) => (
  <label className="block">
    <span className="label mb-1.5">{label}</span>
    <span className="relative block">
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none bg-white border border-line pl-3 pr-9 py-2.5 text-sm outline-none focus:border-ink disabled:opacity-60 cursor-pointer">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </span>
  </label>
);

const OrderCard = ({ order, onUpdated, onProof }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = async (patch) => {
    setSaving(true);
    setError('');
    try {
      const r = await api('adminUpdateOrder', { orderId: order.orderId, ...patch });
      onUpdated(order.orderId, { status: r.status, paymentStatus: r.paymentStatus });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const needsAction = order.paymentStatus === 'Awaiting verification' && order.status !== 'Cancelled';

  return (
    <article className={`bg-white border ${needsAction ? 'border-amber-300' : 'border-line/70'}`}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full text-left p-4 md:p-5 grid md:grid-cols-[1.1fr_1.4fr_auto_auto] gap-3 md:gap-6 items-center">
        <div>
          <p className="font-display text-2xl leading-none">{order.orderId}</p>
          <p className="text-xs text-mute mt-1">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{order.name}</p>
          <p className="text-xs text-mute truncate">{order.city} · {order.paymentMethod}</p>
        </div>
        <div className="flex flex-wrap gap-1.5"><Badge>{order.status}</Badge><Badge>{order.paymentStatus}</Badge></div>
        <div className="flex items-center justify-between md:justify-end gap-4">
          <span className="font-display text-2xl">{formatPrice(order.total)}</span>
          <ChevronDown size={17} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-line p-4 md:p-6 grid lg:grid-cols-3 gap-8 text-sm">
          <div className="space-y-4">
            <div>
              <p className="label mb-1">Customer</p>
              <p className="font-medium">{order.name}</p>
              <p className="text-mute">{order.phone}</p>
              <p className="text-mute break-all">{order.email}</p>
              <p className="text-xs text-mute mt-1">{order.userEmail ? `Account: ${order.userEmail}` : 'Guest checkout'}</p>
            </div>
            <div>
              <p className="label mb-1">Deliver to</p>
              <p className="text-mute">{order.address}, {order.city}{order.postalCode ? ` ${order.postalCode}` : ''}</p>
            </div>
            {order.notes && <div><p className="label mb-1">Notes</p><p className="text-mute">{order.notes}</p></div>}
            <a href={`https://wa.me/${waPhone(order.phone)}?text=${encodeURIComponent(`Hello ${order.name}, this is Zareen Fragrance about your order ${order.orderId}.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs border border-line px-3 py-2 hover:border-ink transition-colors">
              <MessageCircle size={14} /> Message customer
            </a>
          </div>

          <div>
            <p className="label mb-2">Items</p>
            <ul className="space-y-2 mb-4">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3"><span>{i.name} <span className="text-mute">× {i.quantity}</span></span><span>{formatPrice(i.price * i.quantity)}</span></li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line pt-3">
              <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.promoDiscount > 0 && <div className="flex justify-between text-gold"><dt>Promo</dt><dd>−{formatPrice(order.promoDiscount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-mute">Delivery</dt><dd>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</dd></div>
              <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </div>

          <div className="space-y-4">
            <StatusSelect label="Order status" value={order.status} options={ORDER_STATUSES} disabled={saving} onChange={(status) => update({ status })} />
            <StatusSelect label="Payment status" value={order.paymentStatus} options={PAYMENT_STATUSES} disabled={saving} onChange={(paymentStatus) => update({ paymentStatus })} />
            {order.proofUrl && (
              <button onClick={() => onProof(order)} className="btn btn-outline w-full !py-3"><ImageIcon size={15} /> View payment screenshot</button>
            )}
            {needsAction && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2">Check {formatPrice(order.total)} in your bank app, then set payment to <strong>Verified</strong>.</p>}
            <p className="text-xs h-4" role="status">{saving ? 'Saving…' : ''}</p>
            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          </div>
        </div>
      )}
    </article>
  );
};

const OrdersTab = ({ orders, onUpdated }) => {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [proofFor, setProofFor] = useState(null);
  const closeProof = useCallback(() => setProofFor(null), []);

  const filters = [
    ['all', 'All', orders.length],
    ['verify', 'Needs verification', orders.filter((o) => o.paymentStatus === 'Awaiting verification' && o.status !== 'Cancelled').length],
    ...ORDER_STATUSES.map((s) => [s, s, orders.filter((o) => o.status === s).length]),
  ];

  const visible = orders.filter((o) => {
    if (filter === 'verify' ? !(o.paymentStatus === 'Awaiting verification' && o.status !== 'Cancelled') : filter !== 'all' && o.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${o.orderId} ${o.name} ${o.phone} ${o.email} ${o.city} ${o.postalCode}`.toLowerCase().includes(q);
  });

  const exportCsv = () => downloadCsv('zareen-orders.csv', [
    ['Order', 'Date', 'Status', 'Payment method', 'Payment status', 'Name', 'Phone', 'Email', 'City', 'Postal code', 'Address', 'Items', 'Total'],
    ...visible.map((o) => [o.orderId, o.createdAt, o.status, o.paymentMethod, o.paymentStatus, o.name, o.phone, o.email, o.city, o.postalCode, o.address, o.items.map((i) => `${i.name} x${i.quantity}`).join('; '), o.total]),
  ]);

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map(([key, label, n]) => (
            <button key={key} onClick={() => setFilter(key)} className={`shrink-0 px-4 py-2 text-[0.68rem] tracking-[0.16em] uppercase font-medium border transition-colors ${filter === key ? 'bg-ink text-white border-ink' : 'bg-white border-line hover:border-ink'}`}>
              {label} <span className="opacity-60 ml-1">{n}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="relative flex-1 lg:w-64">
            <span className="sr-only">Search orders</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, name, phone…" className="w-full bg-white border border-line pl-9 pr-3 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <button onClick={exportCsv} className="shrink-0 inline-flex items-center gap-2 text-xs border border-line bg-white px-4 hover:border-ink transition-colors"><Download size={14} /> CSV</button>
        </div>
      </div>

      {visible.length === 0 ? <p className="py-16 text-center text-mute">No orders match.</p> : (
        <div className="space-y-3">{visible.map((o) => <OrderCard key={o.orderId} order={o} onUpdated={onUpdated} onProof={setProofFor} />)}</div>
      )}
      {proofFor && <ProofModal order={proofFor} onClose={closeProof} />}
    </div>
  );
};

/* ------------------------------ Other tabs ------------------------------ */

const ReviewsTab = ({ reviews, onChanged }) => {
  const [busy, setBusy] = useState('');
  const toggle = async (r) => {
    setBusy(r.id);
    try {
      const d = await api('adminSetReview', { reviewId: r.id, status: r.status === 'Hidden' ? 'Approved' : 'Hidden' });
      onChanged(r.id, d.status);
    } finally { setBusy(''); }
  };
  if (!reviews.length) return <p className="py-16 text-center text-mute">No reviews yet.</p>;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {reviews.map((r) => (
        <article key={r.id} className={`bg-white border border-line/70 p-5 ${r.status === 'Hidden' ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="inline-flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={n <= r.rating ? 'fill-gold text-gold' : 'text-line'} />)}</span>
            <span className="text-xs text-mute">{fmtDate(r.createdAt)}</span>
          </div>
          <p className="text-xs text-gold mb-1">{r.productName}</p>
          {r.title && <p className="font-display text-xl leading-tight">{r.title}</p>}
          <p className="text-sm text-mute mt-1 whitespace-pre-line">{r.text}</p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span>{r.name}{r.verified && <span className="text-gold ml-2">· Verified purchase</span>}</span>
            <button onClick={() => toggle(r)} disabled={busy === r.id} className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 hover:border-ink disabled:opacity-50">
              {r.status === 'Hidden' ? <><Eye size={13} /> Show</> : <><EyeOff size={13} /> Hide</>}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

const Table = ({ head, rows, empty }) => (
  rows.length === 0 ? <p className="py-16 text-center text-mute">{empty}</p> : (
    <div className="bg-white border border-line/70 overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead><tr className="border-b border-line">{head.map((h) => <th key={h} className="px-4 py-3 text-[0.64rem] tracking-[0.18em] uppercase text-mute font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-line/60 last:border-0">{r.map((c, j) => <td key={j} className="px-4 py-3 align-top">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
);

const SubscribersTab = ({ subscribers }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(', ')); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* no clipboard */ }
  };
  return (
    <div>
      <div className="flex gap-3 mb-5">
        <button onClick={copy} className="inline-flex items-center gap-2 text-xs border border-line bg-white px-4 py-2.5 hover:border-ink">{copied ? <><Check size={14} className="text-gold" /> Copied</> : <><Copy size={14} /> Copy all emails</>}</button>
        <button onClick={() => downloadCsv('zareen-subscribers.csv', [['Email', 'Date', 'Source'], ...subscribers.map((s) => [s.email, s.createdAt, s.source])])} className="inline-flex items-center gap-2 text-xs border border-line bg-white px-4 py-2.5 hover:border-ink"><Download size={14} /> CSV</button>
      </div>
      <Table head={['Email', 'Joined', 'Source']} rows={subscribers.map((s) => [s.email, fmtDate(s.createdAt), s.source])} empty="No subscribers yet." />
    </div>
  );
};

const MessagesTab = ({ messages }) => (
  messages.length === 0 ? <p className="py-16 text-center text-mute">No messages yet.</p> : (
    <div className="space-y-3">
      {messages.map((m, i) => (
        <article key={i} className="bg-white border border-line/70 p-5">
          <div className="flex flex-wrap justify-between gap-2 mb-2">
            <p className="text-sm font-medium">{m.name} <span className="text-mute font-normal">· {m.email}</span></p>
            <p className="text-xs text-mute">{fmtDate(m.createdAt)}</p>
          </div>
          <p className="text-sm text-mute whitespace-pre-line">{m.message}</p>
          <a href={`mailto:${m.email}?subject=${encodeURIComponent('Your message to Zareen Fragrance')}`} className="inline-block mt-3 text-xs underline underline-offset-4 hover:text-gold">Reply by email</a>
        </article>
      ))}
    </div>
  )
);

const CustomersTab = ({ customers, orders, selfEmail, onRole }) => {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const change = async (c, role) => {
    setBusy(c.email);
    setError('');
    try {
      const d = await api('adminSetUserRole', { email: c.email, role });
      onRole(c.email, d.role);
    } catch (e) {
      setError(e.message);
    } finally { setBusy(''); }
  };

  const admins = customers.filter((c) => c.role === 'admin').length;

  return (
    <div>
      <p className="text-sm text-mute mb-5 max-w-2xl">
        <strong className="text-ink font-medium">Type</strong> controls who can open this admin panel. An <strong className="text-ink font-medium">Admin</strong> logs in at
        /admin with their own email and password. You have {admins} admin account{admins === 1 ? '' : 's'}.
      </p>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-5">{error}</p>}
      <Table
        head={['Name', 'Email', 'Phone', 'City', 'Type', 'Orders', 'Joined']}
        empty="No customers yet."
        rows={customers.map((c) => [
          c.name, c.email, c.phone, c.city,
          <span key="t" className="relative inline-block">
            <select
              value={c.role}
              disabled={busy === c.email || c.email === selfEmail}
              title={c.email === selfEmail ? 'You can’t change your own type' : undefined}
              aria-label={`Type for ${c.name}`}
              onChange={(e) => change(c, e.target.value)}
              className={`appearance-none border pl-3 pr-8 py-1.5 text-xs font-medium outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${c.role === 'admin' ? 'bg-ink text-white border-ink' : 'bg-white border-line'}`}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${c.role === 'admin' ? 'text-white' : ''}`} />
          </span>,
          orders.filter((o) => o.userEmail === c.email).length,
          fmtDate(c.createdAt),
        ])}
      />
    </div>
  );
};

/* ------------------------------ Dashboard ------------------------------ */

const emptyData = { orders: [], reviews: [], subscribers: [], messages: [], customers: [] };

const Dashboard = ({ onLogout, selfEmail }) => {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('orders');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api('adminOverview'));
    } catch (e) {
      if (/expired|log in/i.test(e.message)) { onLogout(); return; }
      setError(e.message);
    } finally { setLoading(false); }
  }, [onLogout]);

  useEffect(() => { load(); }, [load]);

  const patchOrder = useCallback((id, patch) => setData((d) => ({ ...d, orders: d.orders.map((o) => (o.orderId === id ? { ...o, ...patch } : o)) })), []);
  const patchCustomer = useCallback((email, role) => setData((d) => ({ ...d, customers: d.customers.map((c) => (c.email === email ? { ...c, role } : c)) })), []);
  const patchReview = useCallback((id, status) => setData((d) => ({ ...d, reviews: d.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })), []);

  const stats = useMemo(() => {
    const live = data.orders.filter((o) => o.status !== 'Cancelled');
    return [
      ['Orders', data.orders.length],
      ['Needs verification', data.orders.filter((o) => o.paymentStatus === 'Awaiting verification' && o.status !== 'Cancelled').length, true],
      ['Pending', data.orders.filter((o) => o.status === 'Pending').length],
      ['Order value', formatPrice(live.reduce((s, o) => s + o.total, 0))],
      ['Customers', data.customers.length],
      ['Subscribers', data.subscribers.length],
    ];
  }, [data]);

  const tabs = [
    ['orders', 'Orders', data.orders.length],
    ['reviews', 'Reviews', data.reviews.length],
    ['subscribers', 'Subscribers', data.subscribers.length],
    ['messages', 'Messages', data.messages.length],
    ['customers', 'Customers', data.customers.length],
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-charcoal text-white">
        <div className="container mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-2xl tracking-[0.18em] font-semibold">ZAREEN</span>
            <span className="text-[0.6rem] tracking-[0.4em] uppercase text-gold-light">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} aria-label="Refresh data" className="inline-flex items-center gap-2 text-xs border border-white/25 px-3.5 py-2 whitespace-nowrap hover:bg-white/10 disabled:opacity-60"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Refresh</span></button>
            <a href="/" className="hidden sm:inline-block text-xs border border-white/25 px-3.5 py-2 hover:bg-white/10">View site</a>
            <button onClick={onLogout} className="inline-flex items-center gap-2 text-xs border border-white/25 px-3.5 py-2 whitespace-nowrap hover:bg-white/10"><LogOut size={14} /> Log out</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-5 py-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {stats.map(([label, value, alert]) => (
            <div key={label} className={`bg-white border p-4 ${alert && value > 0 ? 'border-amber-300' : 'border-line/70'}`}>
              <p className="text-[0.6rem] tracking-[0.18em] uppercase text-mute">{label}</p>
              <p className={`font-display text-3xl mt-1 ${alert && value > 0 ? 'text-amber-700' : ''}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mb-8" role="tablist">
          {tabs.map(([key, label, n]) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`shrink-0 px-5 py-3.5 text-[0.72rem] tracking-[0.18em] uppercase font-medium border-b-2 -mb-px transition-colors ${tab === key ? 'border-ink text-ink' : 'border-transparent text-mute hover:text-ink'}`}>
              {label} <span className="opacity-50 ml-1">{n}</span>
            </button>
          ))}
        </div>

        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">{error}</p>}
        {loading && data === emptyData ? (
          <p className="py-24 text-center text-mute flex items-center justify-center gap-3"><Loader2 className="animate-spin" size={18} /> Loading…</p>
        ) : (
          <>
            {tab === 'orders' && <OrdersTab orders={data.orders} onUpdated={patchOrder} />}
            {tab === 'reviews' && <ReviewsTab reviews={data.reviews} onChanged={patchReview} />}
            {tab === 'subscribers' && <SubscribersTab subscribers={data.subscribers} />}
            {tab === 'messages' && <MessagesTab messages={data.messages} />}
            {tab === 'customers' && <CustomersTab customers={data.customers} orders={data.orders} selfEmail={selfEmail} onRole={patchCustomer} />}
          </>
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, loading, logout: logoutAccount } = useAuth();
  const [hasMasterToken, setHasMasterToken] = useState(() => Boolean(getAdminToken()));
  const isAdminAccount = user?.role === 'admin';

  useEffect(() => {
    document.title = 'Admin | Zareen Fragrance';
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex,nofollow' });
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const logout = useCallback(() => {
    setAdminToken(null);
    setHasMasterToken(false);
    logoutAccount(); // also ends an admin-account session
  }, [logoutAccount]);

  if (loading && !hasMasterToken) {
    return <div className="min-h-screen bg-charcoal flex items-center justify-center text-white/70"><Loader2 className="animate-spin" /></div>;
  }
  if (hasMasterToken || isAdminAccount) {
    return <Dashboard onLogout={logout} selfEmail={isAdminAccount && !hasMasterToken ? user.email : ''} />;
  }
  return <AdminLogin onLogin={() => setHasMasterToken(Boolean(getAdminToken()))} />;
};

export default Admin;
