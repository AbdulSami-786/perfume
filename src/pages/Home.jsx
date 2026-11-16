import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Gift, Quote, Sparkles, Star, Truck, Wallet, Wind,
} from 'lucide-react';
import { categoryMeta, categoryOrder, getProduct, products } from '../data/products';
import { applyDiscount, assetUrl, formatPrice } from '../lib/site';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import BannerCarousel from '../components/BannerCarousel';
import { useCart } from '../context/CartContext';

/* ------------------------------------------------------------------ */
/* Marquee                                                             */
/* ------------------------------------------------------------------ */
const marqueeItems = [
  'Premium Eau de Parfum',
  'Cash on delivery or bank transfer',
  'Free delivery over Rs. 5,000',
  'Gift-ready packaging',
  'Reed & car diffusers',
  'Crafted in Karachi',
];

const Marquee = () => (
  <div className="bg-ink text-white overflow-hidden py-4" aria-hidden="true">
    <div className="flex w-max animate-marquee">
      {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((t, i) => (
        <span key={i} className="flex items-center whitespace-nowrap text-[0.7rem] tracking-[0.32em] uppercase">
          <span className="px-8">{t}</span>
          <Sparkles size={13} className="text-gold-light" />
        </span>
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */
const Categories = () => (
  <section className="py-14 md:py-28">
    <div className="container mx-auto px-5">
      <Reveal>
        <SectionHeading eyebrow="Explore" title="Shop by collection" text="From a statement fragrance to a calming room scent — find what suits your day." />
      </Reveal>
      <div className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-4 md:gap-6">
        {categoryOrder.map((key, i) => {
          const meta = categoryMeta[key];
          const count = products.filter((p) => p.category === key).length;
          return (
            <Reveal key={key} delay={i * 80} className={`md:col-span-2 lg:col-span-1 ${i === 4 ? 'col-span-2' : ''} ${i === 3 ? 'md:col-start-2 lg:col-start-auto' : ''}`}>
              <Link to={`/products?category=${key}`} className="group block">
                <div className={`relative bg-white border border-line/70 overflow-hidden ${i === 4 ? 'aspect-[16/9] md:aspect-[4/5]' : 'aspect-[4/5]'}`}>
                  <img src={meta.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute bottom-4 left-0 right-0 text-center text-[0.7rem] tracking-[0.26em] uppercase text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    Shop now
                  </span>
                </div>
                <div className="pt-4 text-center">
                  <h3 className="text-2xl group-hover:text-gold transition-colors">{meta.label}</h3>
                  <p className="text-xs text-mute mt-1">{count} {count === 1 ? 'product' : 'products'}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Signature collection                                                */
/* ------------------------------------------------------------------ */
const signatureIds = [12, 2, 1, 4];

const Signature = () => (
  <section className="pb-14 md:pb-28">
    <div className="container mx-auto px-5">
      <Reveal>
        <SectionHeading eyebrow="The Signature Collection" title="Eau de Parfum, 50 ml" text="Our most-loved fragrances, each presented in a gift-ready box." />
      </Reveal>
      <div className="mt-10 md:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-7 gap-y-12">
        {signatureIds.map((id, i) => (
          <Reveal key={id} delay={i * 90}>
            <ProductCard product={getProduct(id)} />
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-14 text-center">
        <Link to="/products" className="btn btn-outline">View all products <ArrowRight size={14} /></Link>
      </Reveal>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Spotlight                                                           */
/* ------------------------------------------------------------------ */
const Spotlight = () => {
  const p = getProduct(12);
  const { addToCart } = useCart();
  return (
    <section className="bg-charcoal text-white overflow-hidden">
      <div className="container mx-auto px-5 grid md:grid-cols-2 items-center gap-12 md:gap-20 py-14 md:py-28">
        <Reveal>
          <div className="relative max-w-md mx-auto">
            <div className="aspect-square bg-white overflow-hidden">
              <img src={assetUrl(p.images[0])} alt={p.name} loading="lazy" className="w-full h-full object-contain p-2" />
            </div>
            <div className="absolute -inset-3 border border-gold/40 pointer-events-none translate-x-3 translate-y-3" />
          </div>
        </Reveal>
        <Reveal delay={150} className="text-center md:text-left">
          <p className="eyebrow !text-gold-light mb-5">Featured fragrance · For Her</p>
          <h2 className="text-5xl md:text-6xl text-white">{p.shortName}</h2>
          <p className="mt-6 text-white/70 leading-relaxed max-w-md mx-auto md:mx-0">
            {p.description.split('\n\n').join(' ')} Presented in a keepsake box with a matching gift bag.
          </p>
          <p className="mt-7 flex items-baseline gap-3 justify-center md:justify-start">
            <span className="font-display text-4xl text-gold-light">{formatPrice(applyDiscount(p.price))}</span>
            <span className="text-white/45 line-through">{formatPrice(p.price)}</span>
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button onClick={() => addToCart(p)} className="btn btn-light">Add to Bag</button>
            <Link to={`/product/${p.id}`} className="btn btn-outline-light">Discover</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Home & Car                                                          */
/* ------------------------------------------------------------------ */
const lifestyle = [
  {
    key: 'home',
    title: 'Fragrance for your home',
    text: 'Reed diffusers in Rose Petal, Lavender and Jasmine Bloom — household aroma therapy that fills a room all day.',
    ids: [8, 9, 10],
  },
  {
    key: 'accessories',
    title: 'Fragrance for your car',
    text: 'Hanging glass diffusers that turn every drive into a calmer, sweeter journey.',
    ids: [5, 6, 7],
  },
];

const Lifestyle = () => (
  <section className="py-14 md:py-28">
    <div className="container mx-auto px-5">
      <Reveal>
        <SectionHeading eyebrow="Beyond the bottle" title="Scent every space you live in" />
      </Reveal>
      <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
        {lifestyle.map((c, i) => (
          <Reveal key={c.key} delay={i * 120}>
            <Link to={`/products?category=${c.key}`} className="group block bg-white border border-line/70 h-full">
              <div className="grid grid-cols-3 bg-sand/60">
                {c.ids.map((id) => (
                  <div key={id} className="aspect-[3/4] overflow-hidden">
                    <img src={assetUrl(getProduct(id).mainImage)} alt={getProduct(id).name} loading="lazy" className="w-full h-full object-contain p-1 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
              <div className="p-7 md:p-9 text-center">
                <h3 className="text-3xl md:text-4xl">{c.title}</h3>
                <p className="mt-3 text-sm text-mute max-w-sm mx-auto leading-relaxed">{c.text}</p>
                <span className="link-underline mt-6 text-ink inline-flex items-center gap-2">Explore <ArrowRight size={13} /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Discovery set                                                       */
/* ------------------------------------------------------------------ */
const Discovery = () => {
  const p = getProduct(11);
  return (
    <section className="bg-sand">
      <div className="container mx-auto px-5 grid md:grid-cols-2 items-center gap-10 md:gap-16 py-12 md:py-24">
        <Reveal className="order-2 md:order-1 text-center md:text-left">
          <p className="eyebrow mb-5">Can't decide?</p>
          <h2 className="text-5xl md:text-6xl">Begin with five.</h2>
          <p className="mt-6 text-mute leading-relaxed max-w-md mx-auto md:mx-0">{p.description}</p>
          <p className="mt-6 text-sm">
            From <span className="font-display text-3xl align-middle ml-1">{formatPrice(applyDiscount(p.price))}</span>
          </p>
          <Link to={`/product/${p.id}`} className="btn btn-dark mt-8">Shop the Discovery Set</Link>
        </Reveal>
        <Reveal delay={120} className="order-1 md:order-2">
          <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto">
            <div className="col-span-3 row-span-2 bg-white border border-line/70 aspect-[4/5] overflow-hidden">
              <img src={assetUrl(p.images[0])} alt={p.name} loading="lazy" className="w-full h-full object-contain p-2" />
            </div>
            {p.images.slice(1, 3).map((src) => (
              <div key={src} className="col-span-2 bg-white border border-line/70 aspect-square overflow-hidden">
                <img src={assetUrl(src)} alt="" loading="lazy" className="w-full h-full object-contain p-1" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Why Zareen                                                          */
/* ------------------------------------------------------------------ */
const features = [
  { icon: Gift, title: 'Gift-ready packaging', text: 'Every perfume arrives in a premium box with satin lining.' },
  { icon: Wind, title: 'Scent for every space', text: 'Perfume, room and car fragrances in matching signature scents.' },
  { icon: Wallet, title: 'Cash on delivery', text: 'Order with confidence and pay when it reaches your door.' },
  { icon: Truck, title: 'Delivered nationwide', text: 'Free delivery on orders over Rs. 5,000.' },
];

const WhyUs = () => (
  <section className="py-14 md:py-24 border-y border-line bg-white">
    <div className="container mx-auto px-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
        {features.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 90} className="text-center px-2">
            <span className="mx-auto mb-5 w-16 h-16 rounded-full border border-gold/50 flex items-center justify-center text-gold">
              <Icon size={24} strokeWidth={1.25} />
            </span>
            <h3 className="font-sans text-[0.75rem] font-medium tracking-[0.2em] uppercase mb-2.5">{title}</h3>
            <p className="text-sm text-mute leading-relaxed max-w-[15rem] mx-auto">{text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Brand story                                                         */
/* ------------------------------------------------------------------ */
const Story = () => (
  <section className="py-16 md:py-32">
    <Reveal className="container mx-auto px-5 max-w-3xl text-center">
      <p className="eyebrow mb-6">Our story</p>
      <h2 className="text-4xl md:text-6xl leading-[1.08]">
        Named for a grandmother. <br className="hidden md:block" />Made for everyone who loves a signature scent.
      </h2>
      <p className="mt-8 text-mute leading-relaxed max-w-xl mx-auto">
        Zareen Fragrance takes its name from the grandmother of our founder, Saim Sheikh. It began with a simple idea — your favourite perfume should follow you into your car and your home too.
      </p>
      <Link to="/about" className="link-underline mt-9 text-ink inline-flex items-center gap-2">Read our story <ArrowRight size={13} /></Link>
    </Reveal>
  </section>
);

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */
const reviews = [
  { name: 'Ayesha Khan', place: 'Karachi', stars: 5, text: 'The sillage and longevity of Zareen Fragrances are unmatched. It feels like wearing pure luxury every single day.' },
  { name: 'Ahmed', place: 'Verified purchase', stars: 5, text: 'The scent is powerful and stays for the whole day.' },
  { name: 'Fatima Khan', place: 'Verified purchase', stars: 4, text: 'Beautiful fragrance, very long lasting. Highly recommended!' },
  { name: 'Asad Murtaza', place: 'Verified purchase', stars: 5, text: 'Very good perfume, exactly what I was looking for.' },
];

const Testimonials = () => (
  <section className="pb-16 md:pb-32">
    <div className="container mx-auto px-5">
      <Reveal>
        <SectionHeading eyebrow="Loved by our customers" title="Words from the Zareen family" />
      </Reveal>
      <div className="mt-10 md:mt-14 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 pb-2 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible">
        {reviews.map((r, i) => (
          <Reveal key={r.name} delay={i * 90} className="min-w-[84%] snap-center sm:min-w-0">
            <figure className="h-full bg-white border border-line/70 p-7 flex flex-col">
              <Quote size={26} strokeWidth={1.25} className="text-gold mb-4" />
              <div className="flex gap-0.5 mb-4" aria-label={`${r.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} className={s < r.stars ? 'fill-gold text-gold' : 'text-line'} />
                ))}
              </div>
              <blockquote className="font-display text-[1.35rem] leading-snug flex-1">“{r.text}”</blockquote>
              <figcaption className="mt-6 pt-5 border-t border-line">
                <span className="block text-sm font-medium">{r.name}</span>
                <span className="block text-xs text-mute">{r.place}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const Home = () => {
  useEffect(() => {
    document.title = 'Zareen Fragrance | Premium Perfumes & Diffusers';
  }, []);

  return (
    <>
      <BannerCarousel />
      <Marquee />
      <Categories />
      <Signature />
      <Spotlight />
      <Lifestyle />
      <Discovery />
      <WhyUs />
      <Story />
      <Testimonials />
    </>
  );
};

export default Home;
