import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { applyDiscount, assetUrl, formatPrice } from '../lib/site';
import { categoryMeta, imageBgFor, isCardImage, isLifestylePhoto } from '../data/products';
import WishButton from './WishButton';

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const inBag = cartItems.find((i) => i.id === product.id)?.quantity ?? 0;
  // Styled photo up front → hover reveals the clean studio shot; otherwise the second studio shot.
  const styled = isLifestylePhoto(product.mainImage) && !isCardImage(product.mainImage);
  const secondImage = styled ? (product.images?.[0] || product.lifestyle?.[1]) : product.images?.[1];

  return (
    <article className="group flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden border border-line/70" style={{ background: imageBgFor(product.id) }}>
        <Link to={`/product/${product.id}`} aria-label={product.shortName} className="block h-full">
          <img
            src={assetUrl(product.mainImage)}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full ${isLifestylePhoto(product.mainImage) ? 'object-cover' : 'object-contain p-3'} transition-all duration-700 ${
              secondImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
            }`}
          />
          {secondImage && (
            <img
              src={assetUrl(secondImage)}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain p-3 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700"
            />
          )}
        </Link>

        <span className="absolute top-2.5 left-2.5 md:top-3 md:left-3 bg-ink text-white text-[0.66rem] font-medium tracking-[0.18em] px-2 md:px-2.5 py-1.5">
          −10%
        </span>
        <WishButton product={product} className="absolute top-2 right-2 md:top-3 md:right-3 z-10" />
        {inBag > 0 && (
          <span className="absolute top-11 left-2.5 md:top-12 md:left-3 bg-gold text-white text-[0.66rem] font-medium tracking-wider px-2 md:px-2.5 py-1.5">
            {inBag} IN BAG
          </span>
        )}

        {/* Desktop: slides up over the photo on hover */}
        <button
          type="button"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.shortName} to bag`}
          className="hidden md:flex absolute inset-x-3 bottom-3 items-center justify-center gap-2 bg-ink text-white py-3 text-[0.68rem] tracking-[0.22em] uppercase font-medium transition-all duration-300 hover:bg-gold md:translate-y-[130%] md:group-hover:translate-y-0 focus-visible:translate-y-0"
        >
          <Plus size={14} /> Add to Bag
        </button>
      </div>

      <div className="pt-4 md:pt-5 text-center flex flex-col flex-1">
        <p className="text-[0.68rem] tracking-[0.26em] uppercase text-gold mb-1.5">
          {categoryMeta[product.category]?.label}
        </p>
        <Link to={`/product/${product.id}`} className="inline-block py-1">
          <h3 className="text-[1.35rem] md:text-[1.6rem] leading-tight hover:text-gold transition-colors">{product.shortName}</h3>
        </Link>
        <p className="text-xs text-mute mt-1">{product.subtitle}</p>

        {/* mt-auto keeps prices (and buttons) level across a row, even when names wrap */}
        <p className="mt-auto pt-3 flex flex-wrap items-baseline justify-center gap-x-2.5">
          <span className="text-[0.95rem] font-medium">{formatPrice(applyDiscount(product.price))}</span>
          <span className="text-xs text-mute line-through">{formatPrice(product.price)}</span>
        </p>

        {/* Mobile: a real button under the photo, so it never covers the product */}
        <button
          type="button"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.shortName} to bag`}
          className="md:hidden mt-3 w-full flex items-center justify-center gap-1.5 border border-ink py-3 text-[0.68rem] tracking-[0.2em] uppercase font-medium active:bg-ink active:text-white transition-colors"
        >
          <Plus size={13} /> Add to bag
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
