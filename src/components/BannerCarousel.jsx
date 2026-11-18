import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Brand banners. Landscape screens: full-bleed, full-screen, the artwork as designed.
// Portrait screens (phones / tablets held upright): the same picture fills the whole hero,
// framed on the products (`focus`), with the headline and button written over a soft fade.
const slides = [
  { image: '/banners/flat-10-off.webp', alt: 'Flat 10% off — discover your signature scent. Shop now.', to: '/products', kicker: 'Limited time', title: 'Flat 10% off', cta: 'Shop now', focus: '71% 50%', focusMd: '96% 50%' },
  { image: '/ban1.jpeg', alt: 'Women’s perfume — Pink Aura, Maison Flora and more', to: '/products?category=women', kicker: 'Eau de Parfum', title: 'Women’s Perfume', cta: 'Shop for her', focus: '70% 50%', focusMd: '88% 50%' },
  { image: '/ban2.jpeg', alt: 'Men’s perfume — White Sultan, Musk Al Rawdah and more', to: '/products?category=men', kicker: 'Eau de Parfum', title: 'Men’s Perfume', cta: 'Shop for him', focus: '68% 50%', focusMd: '88% 50%' },
];

const BannerCarousel = () => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!playing || hover) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [playing, hover]);

  const go = (dir) => setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section className="bg-charcoal" aria-roledescription="carousel" aria-label="Featured collections">
      <div
        className="relative group overflow-hidden w-full h-[calc(100svh-7.1rem)] min-h-[28rem] max-h-[48rem] md:max-h-none md:min-h-[32rem] md:h-[calc(100svh-8.25rem)]"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <Link
              key={s.image}
              to={s.to}
              tabIndex={active ? 0 : -1}
              aria-hidden={!active}
              aria-label={s.alt}
              className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {/* one picture, always covering the whole hero; only the focal point differs */}
              <img
                src={s.image}
                alt={s.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{ '--focus': s.focus, '--focus-md': s.focusMd }}
                className="absolute inset-0 w-full h-full object-cover [object-position:var(--focus)] md:[object-position:var(--focus-md)] wide:[object-position:50%_50%]"
              />

              {/* portrait screens: readable headline + button over a soft fade */}
              <div className="wide:hidden absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent to-60%" aria-hidden="true" />
              <div className="wide:hidden absolute inset-x-0 bottom-0 px-6 pb-[4.6rem] md:pb-24 md:px-12 text-white">
                <p className="eyebrow !text-gold-light mb-3">{s.kicker}</p>
                <p className="font-display text-[2.9rem] md:text-7xl leading-[0.95] text-balance max-w-md md:max-w-xl">{s.title}</p>
                <span className="btn btn-light mt-6">{s.cta} <ArrowRight size={14} /></span>
              </div>
            </Link>
          );
        })}

        <button onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-2.5 md:left-6 top-[38%] wide:top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-white/80 hover:bg-white backdrop-blur flex items-center justify-center wide:opacity-0 wide:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => go(1)} aria-label="Next banner" className="absolute right-2.5 md:right-6 top-[38%] wide:top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-white/80 hover:bg-white backdrop-blur flex items-center justify-center wide:opacity-0 wide:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 md:gap-3 bg-ink/60 backdrop-blur px-3 md:px-4 py-1.5 md:py-2.5">
          {slides.map((s, i) => (
            <button
              key={s.image}
              onClick={() => setIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === index}
              className="py-3 px-0.5"
            >
              <span className={`block h-[3px] transition-all duration-500 ${i === index ? 'w-7 md:w-10 bg-white' : 'w-3 md:w-5 bg-white/50'}`} />
            </button>
          ))}
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause banners' : 'Play banners'} className="text-white ml-0.5 p-2.5 -my-1">
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
