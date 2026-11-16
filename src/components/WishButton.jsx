import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

// Heart toggle. `variant="card"` is the small overlay on product cards.
const WishButton = ({ product, variant = 'card', className = '' }) => {
  const { has, toggle } = useWishlist();
  const active = has(product.id);
  const label = active ? `Remove ${product.shortName} from wishlist` : `Add ${product.shortName} to wishlist`;

  const base =
    variant === 'card'
      ? 'w-9 h-9 bg-white/90 backdrop-blur hover:bg-white border border-line/70'
      : 'w-12 h-12 border border-ink/30 bg-white hover:border-ink';

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex items-center justify-center transition-colors ${base} ${className}`}
    >
      <Heart size={variant === 'card' ? 17 : 20} strokeWidth={1.5} className={active ? 'fill-gold text-gold' : 'text-ink'} />
    </button>
  );
};

export default WishButton;
