import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { getProduct } from '../data/products';
import ProductCard from './ProductCard';

const WishlistGrid = () => {
  const { ids } = useWishlist();
  const items = ids.map(getProduct).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <Heart size={46} strokeWidth={1} className="mx-auto text-gold mb-5" />
        <p className="font-display text-3xl mb-2">Your wishlist is empty</p>
        <p className="text-sm text-mute mb-8">Tap the heart on any product to save it for later.</p>
        <Link to="/products" className="btn btn-dark">Explore the collection</Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-7 gap-y-12">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
};

export default WishlistGrid;
