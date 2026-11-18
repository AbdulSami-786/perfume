import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Check, ChevronDown, Gift, Minus, Plus, ShieldCheck, Truck, Wallet,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { categoryMeta, getProduct, imageBgFor, isLifestylePhoto, isPerfume, products } from '../data/products';
import {
  applyDiscount, assetUrl, formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE,
} from '../lib/site';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import Stars from '../components/Stars';
import WishButton from '../components/WishButton';
import ReviewsSection from '../components/ReviewsSection';
import { useReviews } from '../lib/useReviews';
import PageHeader from '../components/PageHeader';

// Placeholder performance specs for perfumes (existing site content).
const performance = [
  { label: 'Concentration', value: '30% – 35%' },
  { label: 'Longevity', value: 'Up to 8 – 10 hours' },
  { label: 'Sillage', value: 'Strong' },
];

const Accordion = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-[0.74rem] font-medium tracking-[0.22em] uppercase">{title}</span>
        <ChevronDown size={17} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden text-sm text-mute leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

const ProductView = ({ id }) => {
  const navigate = useNavigate();
  const product = getProduct(id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const reviewData = useReviews(Number(id));

  useEffect(() => {
    if (product) document.title = `${product.shortName} | Zareen Fragrance`;
  }, [product]);

  if (!product) {
    return (
      <section className="container mx-auto px-5 py-28 text-center">
        <h1 className="text-5xl mb-4">Product not found</h1>
        <p className="text-mute mb-8">This item may have been moved or is no longer available.</p>
        <Link to="/products" className="btn btn-dark">Browse the collection</Link>
      </section>
    );
  }

  const studio = product.images?.length ? product.images : (product.lifestyle?.length ? [] : [product.mainImage]);
  const images = [...(product.lifestyle || []), ...studio]; // styled photos first
  const hasPhotos = (product.lifestyle?.length || 0) > 0;
  const price = applyDiscount(product.price);
  const meta = categoryMeta[product.category];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);
  const fallback = products.filter((p) => p.category !== product.category && p.id !== product.id);
  const youMayLike = [...related, ...fallback].slice(0, 4);

  const handleAdd = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, { openDrawer: false });
    navigate('/checkout');
  };

  const onTouchEnd = (e) => {
    if (touchStart === null || images.length < 2) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setSelected((s) => Math.min(images.length - 1, Math.max(0, s + (diff > 0 ? 1 : -1))));
    }
    setTouchStart(null);
  };

  return (
    <div>
      <div className="border-b border-line bg-sand/50">
        <nav aria-label="Breadcrumb" className="container mx-auto px-5 py-1 flex flex-wrap items-center gap-x-2 text-[0.68rem] tracking-[0.18em] uppercase text-mute">
          <Link to="/" className="inline-block py-2 hover:text-ink">Home</Link> <span>/</span>
          <Link to="/products" className="inline-block py-2 hover:text-ink">Shop</Link> <span>/</span>
          <Link to={`/products?category=${product.category}`} className="inline-block py-2 hover:text-ink">{meta.label}</Link> <span>/</span>
          <span className="text-ink">{product.shortName}</span>
        </nav>
      </div>

      <section className="container mx-auto px-5 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-start">
          {/* Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:sticky lg:top-36 w-full max-w-xl mx-auto lg:max-w-none">
            {images.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[36rem] no-scrollbar lg:w-20 shrink-0 pb-1 lg:pb-0">
                {images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setSelected(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-current={selected === i}
                    style={{ background: imageBgFor(product.id) }}
                    className={`shrink-0 w-[4.5rem] h-[4.5rem] md:w-20 md:h-20 border transition-colors ${selected === i ? 'border-ink' : 'border-line hover:border-ink/50'}`}
                  >
                    <img src={assetUrl(img)} alt="" loading="lazy" className={`w-full h-full ${isLifestylePhoto(img) ? 'object-cover' : 'object-contain p-1'}`} />
                  </button>
                ))}
              </div>
            )}
            <div
              className={`relative flex-1 border border-line/70 overflow-hidden ${hasPhotos ? 'aspect-[4/5]' : 'aspect-square'}`}
              style={{ background: imageBgFor(product.id) }}
              onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
              onTouchEnd={onTouchEnd}
            >
              <img
                key={images[selected]}
                src={assetUrl(images[selected])}
                alt={product.name}
                className={`w-full h-full animate-fade-in ${isLifestylePhoto(images[selected]) ? 'object-cover' : 'object-contain p-3'}`}
              />
              <span className="absolute top-4 left-4 bg-ink text-white text-[0.7rem] tracking-[0.2em] px-3 py-1.5">−10%</span>
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="eyebrow mb-3">{meta.label}</p>
            <h1 className="text-5xl md:text-6xl">{product.shortName}</h1>
            {product.nameAr && <p className="mt-2 text-2xl text-mute"><span dir="rtl" lang="ur">{product.nameAr}</span></p>}
            <p className="mt-3 text-sm text-mute">{product.subtitle}</p>

            <a href="#reviews" className="mt-4 inline-flex items-center gap-3 py-2 text-sm text-mute hover:text-ink transition-colors">
              {reviewData.count > 0 ? (
                <><Stars value={reviewData.average} size={15} /><span>{reviewData.average} · {reviewData.count} {reviewData.count === 1 ? 'review' : 'reviews'}</span></>
              ) : (
                <span>No reviews yet. Be the first!</span>
              )}
            </a>

            <div className="mt-6 flex flex-wrap items-baseline gap-4 pb-7 border-b border-line">
              <span className="font-display text-5xl">{formatPrice(price)}</span>
              <span className="text-lg text-mute line-through">{formatPrice(product.price)}</span>
              <span className="text-xs tracking-[0.18em] uppercase text-gold font-medium">Save {formatPrice(product.price - price)}</span>
            </div>

            <p className="mt-7 text-mute leading-relaxed whitespace-pre-line">{product.description}</p>

            {product.notes?.length > 0 && (
              <div className="mt-7">
                <p className="label mb-3">Fragrance notes</p>
                <ul className="flex flex-wrap gap-2">
                  {product.notes.map((n) => (
                    <li key={n} className="border border-line bg-white px-4 py-2 text-sm">{n}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchase */}
            <div className="mt-8 flex items-stretch gap-3">
              <div className="flex items-center border border-ink/30 bg-white">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-sand disabled:opacity-30 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 sm:w-10 text-center font-medium" aria-live="polite">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-sand transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={handleAdd} className={`btn flex-1 min-w-0 !whitespace-normal !px-3 sm:!px-6 !tracking-[0.14em] sm:!tracking-[0.24em] text-center leading-tight ${justAdded ? 'btn-dark !bg-gold !border-gold' : 'btn-dark'}`}>
                {justAdded ? <><Check size={16} /> Added to bag</> : `Add to Bag · ${formatPrice(price * quantity)}`}
              </button>
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={handleBuyNow} className="btn btn-outline flex-1">Buy It Now</button>
              <WishButton product={product} variant="page" />
            </div>

            {/* Reassurance */}
            <ul className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                [Wallet, 'Cash on delivery'],
                [Truck, 'Nationwide delivery'],
                [Gift, 'Gift-ready box'],
              ].map(([Icon, label]) => (
                <li key={label} className="border border-line bg-white py-4 px-2">
                  <Icon size={20} strokeWidth={1.25} className="mx-auto text-gold mb-2" />
                  <span className="text-[0.66rem] tracking-[0.12em] uppercase text-ink/80">{label}</span>
                </li>
              ))}
            </ul>

            {/* Details */}
            <div className="mt-8 border-t border-line">
              {isPerfume(product) && (
                <Accordion title="Fragrance profile" defaultOpen>
                  <ul>
                    {performance.map((row) => (
                      <li key={row.label} className="flex justify-between py-2.5 border-b border-line/60 last:border-0">
                        <span>{row.label}</span>
                        <span className="text-ink font-medium">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </Accordion>
              )}
              <Accordion title="Delivery & payment" defaultOpen={!isPerfume(product)}>
                <ul className="space-y-2.5">
                  <li className="flex gap-3"><Truck size={16} className="shrink-0 mt-0.5 text-gold" /> Delivery is Rs. {SHIPPING_FEE}, and free on orders over Rs. {FREE_SHIPPING_THRESHOLD.toLocaleString()}.</li>
                  <li className="flex gap-3"><Wallet size={16} className="shrink-0 mt-0.5 text-gold" /> Pay by cash on delivery or bank transfer.</li>
                  <li className="flex gap-3"><ShieldCheck size={16} className="shrink-0 mt-0.5 text-gold" /> Bank transfers are confirmed once your payment screenshot is verified.</li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection productId={product.id} reviewData={reviewData} onChange={reviewData.replace} />

      {/* Related */}
      <section className="container mx-auto px-5 py-12 md:py-24">
        <Reveal className="text-center mb-12">
          <p className="eyebrow mb-3">Complete the collection</p>
          <h2 className="text-4xl md:text-5xl">You may also like</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-7 gap-y-12">
          {youMayLike.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

// Keyed by id so quantity / gallery state resets when switching products.
const ProductDetail = () => {
  const { id } = useParams();
  return <ProductView key={id} id={id} />;
};

export default ProductDetail;
