import { useMemo } from 'react';
import { formatPrice, SITE } from '../lib/site';

// Deterministic barcode: the same order number always draws the same bars.
const Barcode = ({ value }) => {
  const { bars, width } = useMemo(() => {
    let seed = 7;
    for (const ch of String(value)) seed = (seed * 31 + ch.charCodeAt(0)) % 1000003;
    const out = [];
    let x = 0;
    for (let i = 0; i < 52; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const w = 1 + ((seed >> 8) % 3);
      if (i % 2 === 0) out.push({ x, w });
      x += w;
    }
    return { bars: out, width: x };
  }, [value]);

  return (
    <svg viewBox={`0 0 ${width} 40`} preserveAspectRatio="none" className="w-full h-11" role="img" aria-label={`Barcode for ${value}`}>
      {bars.map((b, i) => <rect key={i} x={b.x} y="0" width={b.w} height="40" fill="currentColor" />)}
    </svg>
  );
};

const Leader = ({ label, value, strong, accent }) => (
  <div className={`flex items-baseline ${strong ? 'text-ink' : ''} ${accent ? 'text-gold' : ''}`}>
    <span className="shrink-0">{label}</span>
    <span className="flex-1 mx-2 border-b border-dotted border-ink/25 -translate-y-[3px]" aria-hidden="true" />
    <span className="shrink-0">{value}</span>
  </div>
);

const Dash = () => <div className="my-4 border-t border-dashed border-ink/30" />;

const fmtDate = (d) =>
  d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * A paper-style receipt. `live` = the preview shown while checking out;
 * otherwise it is the final receipt for a placed order.
 */
const Receipt = ({
  items, subtotal, promoDiscount = 0, shipping, total, savings = 0,
  customerName, city, address, method, orderId, date, paymentStatus, live = false,
}) => {
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const stamp = live ? null : (paymentStatus === 'Verified' ? 'Paid' : method === 'bank' ? 'Awaiting verification' : 'Pay on delivery');

  return (
    <div className="my-3">
      <div className="receipt print-area font-mono text-[0.76rem] leading-relaxed text-ink/90 px-6 sm:px-8 pt-9 pb-10">
        {/* brand */}
        <div className="text-center">
          <p className="font-display text-[2rem] tracking-[0.2em] pl-[0.2em] font-semibold leading-none text-ink">ZAREEN</p>
          <p className="font-sans text-[0.55rem] tracking-[0.62em] pl-[0.62em] uppercase text-gold mt-1.5">Fragrance</p>
          <p className="mt-3 text-[0.68rem] text-mute leading-relaxed">
            {SITE.city}<br />{SITE.phoneDisplay} · {SITE.email}
          </p>
        </div>

        <Dash />
        <p className="text-center font-sans text-[0.62rem] tracking-[0.34em] uppercase text-ink">
          {live ? 'Your receipt' : 'Order receipt'}
        </p>
        <Dash />

        {/* meta */}
        <div className="space-y-1">
          <Leader label="Order no." value={orderId || 'on placing'} strong />
          <Leader label="Date" value={fmtDate(date)} />
          <Leader label="Customer" value={customerName || '—'} />
          {city && <Leader label="City" value={city} />}
          <Leader label="Payment" value={method === 'bank' ? 'Bank transfer' : 'Cash on delivery'} />
          {paymentStatus && <Leader label="Status" value={paymentStatus} />}
        </div>
        {address && !live && <p className="mt-2 text-[0.7rem] text-mute">Deliver to: {address}</p>}

        <Dash />

        {/* items */}
        <ul className="space-y-3">
          {items.map((i, idx) => (
            <li key={`${i.name}-${idx}`}>
              <div className="flex items-baseline gap-3">
                <span className="flex-1 min-w-0 text-ink">{i.name}</span>
                <span className="shrink-0 text-ink">{formatPrice(i.price * i.quantity)}</span>
              </div>
              <p className="text-[0.68rem] text-mute">{i.quantity} × {formatPrice(i.price)}</p>
            </li>
          ))}
        </ul>

        <Dash />

        {/* totals */}
        <div className="space-y-1">
          <Leader label={`Subtotal (${count} ${count === 1 ? 'item' : 'items'})`} value={formatPrice(subtotal)} />
          {promoDiscount > 0 && <Leader label="Promo code" value={`−${formatPrice(promoDiscount)}`} accent />}
          <Leader label="Delivery" value={shipping === 0 ? 'FREE' : formatPrice(shipping)} />
        </div>

        <div className="relative mt-4 pt-4 border-t-2 border-double border-ink/40">
          <div className="flex items-baseline justify-between">
            <span className="font-sans text-[0.7rem] tracking-[0.3em] uppercase text-ink">Total</span>
            <span className="font-display text-[2.1rem] leading-none text-ink">{formatPrice(total)}</span>
          </div>
          {savings > 0 && <p className="mt-2 text-right text-[0.68rem] text-gold">You saved {formatPrice(savings)} with the 10% sale</p>}
        </div>

        {stamp && (
          <div className="mt-5 flex justify-center">
            <span className={`receipt-stamp ${paymentStatus === 'Verified' ? 'is-paid' : ''}`} aria-hidden="true">{stamp}</span>
          </div>
        )}

        <Dash />

        {/* barcode + thanks */}
        <div className="text-ink/80">
          <Barcode value={orderId || `ZF-${count}-${total}`} />
          <p className="mt-1.5 text-center tracking-[0.3em] text-[0.65rem]">{orderId || 'ZF-••••••-•••'}</p>
        </div>
        <p className="mt-5 text-center font-display text-[1.35rem] leading-tight text-ink">Thank you for choosing<br />Zareen Fragrance</p>
        <p className="mt-2 text-center text-[0.64rem] text-mute">
          {live ? 'This is a preview. Your order number is issued when you place the order.' : 'Please keep this receipt for your records.'}
        </p>
      </div>
    </div>
  );
};

export default Receipt;
