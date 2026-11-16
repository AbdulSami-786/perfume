import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Brand banners. Desktop/tablet: full-bleed, full-screen. Phones: the whole banner
// (never cropped) on a blurred backdrop, with a headline and button underneath.
const slides = [
  { image: '/b4.jpeg', alt: 'Sale on sale — 10% off on all products', to: '/products', kicker: 'Limited time', title: '10% off everything', cta: 'Shop the sale' },
  { image: '/ban1.jpeg', alt: 'Women’s perfume — Pink Aura, Maison Flora and more', to: '/products?category=women', kicker: 'Eau de Parfum', title: 'Women’s Perfume', cta: 'Shop for her' },
  { image: '/ban2.jpeg', alt: 'Men’s perfume — White Sultan, Musk Al Rawdah and more', to: '/products?category=men', kicker: 'Eau de Parfum', title: 'Men’s Perfume', cta: 'Shop for him' },
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
        className="relative group overflow-hidden w-full h-[calc(100svh-7.1rem)] min-h-[30rem] max-h-[46rem] md:max-h-none md:min-h-[32rem] md:h-[calc(100svh-8.25rem)]"
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
              {/* blurred backdrop: fills any space the sharp image doesn't */}
              <img src={s.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-90" />
              <div className="absolute inset-0 bg-ink/45 wide:hidden" />

              {/* tablet / desktop: full-bleed. Tall (portrait) windows fall back to the whole image. */}
              <img
                src={s.image}
                alt={s.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="hidden wide:block absolute inset-0 w-full h-full object-cover"
              />

              {/* phones: whole banner + headline + button */}
              <div className="wide:hidden absolute inset-0 flex flex-col items-center justify-center gap-7 md:gap-10 px-4 pb-10 text-center text-white">
                <img
                  src={s.image}
                  alt={s.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="w-full max-w-2xl aspect-video object-contain shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
                />
                <div>
                  <p className="eyebrow !text-gold-light mb-3">{s.kicker}</p>
                  <p className="font-display text-[2.6rem] md:text-6xl leading-none text-balance">{s.title}</p>
                  <span className="btn btn-light mt-6">{s.cta} <ArrowRight size={14} /></span>
                </div>
              </div>
            </Link>
          );
        })}

        <button onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-3 md:left-6 top-[34%] wide:top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-white/85 hover:bg-white backdrop-blur flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => go(1)} aria-label="Next banner" className="absolute right-3 md:right-6 top-[34%] wide:top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-12 md:h-12 bg-white/85 hover:bg-white backdrop-blur flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
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
