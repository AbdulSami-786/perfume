import { formatPrice } from '../lib/site';

// Subtotal / promo / delivery rows shared by the bag and checkout pages.
const OrderSummaryRows = ({ cart }) => (
  <dl className="space-y-3.5 text-sm">
    <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
    {cart.promoDiscount > 0 && (
      <div className="flex justify-between text-gold"><dt>Promo discount (10%)</dt><dd>−{formatPrice(cart.promoDiscount)}</dd></div>
    )}
    <div className="flex justify-between">
      <dt className="text-mute">Delivery</dt>
      <dd>{cart.shippingCost === 0 ? 'Free' : formatPrice(cart.shippingCost)}</dd>
    </div>
    {cart.savings > 0 && (
      <div className="flex justify-between text-xs"><dt className="text-mute">Sale savings included</dt><dd className="text-gold">{formatPrice(cart.savings)}</dd></div>
    )}
  </dl>
);

export default OrderSummaryRows;
