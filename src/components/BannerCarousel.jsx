import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Brand banners (all 16:9).
//  • Landscape screens (desktop / laptop / tablet held sideways): full-bleed, full-screen hero.
//  • Portrait screens (phones / tablet held upright): the WHOLE banner, never cropped or zoomed,
//    full width under the header, with the headline + button in a panel directly beneath it.
const slides = [
  { image: '/banners/flat-10-off.webp', alt: 'Flat 10% off — discover your signature scent. Shop now.', to: '/products', kicker: 'Limited time', title: 'Flat 10% off', cta: 'Shop now' },
  { image: '/ban1.jpeg', alt: 'Women’s perfume — Pink Aura, Maison Flora and more', to: '/products?category=women', kicker: 'Eau de Parfum', title: 'Women’s Perfume', cta: 'Shop for her' },
  { image: '/ban2.jpeg', alt: 'Men’s perfume — White Sultan, Musk Al Rawdah and more', to: '/products?category=men', kicker: 'Eau de Parfum', title: 'Men’s Perfume', cta: 'Shop for him' },
];

const Dots = ({ index, setIndex, playing, setPlaying, className = '' }) => (
  <div className={`items-center gap-2 md:gap-3 ${className}`}>
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
);

const BannerCarousel = () => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const touchX = useRef(null);
  const swiped = useRef(false); // true briefly after a swipe, so letting go never counts as a tap on a link

  useEffect(() => {
    if (!playing || hover) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [playing, hover]);

  const go = (dir) => setIndex((i) => (i + dir + slides.length) % slides.length);
  const current = slides[index];

  // swipe left / right to change banner
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 45) {
      go(dx < 0 ? 1 : -1);
      swiped.current = true;
      setTimeout(() => { swiped.current = false; }, 450);
    }
  };
  const blockClickAfterSwipe = (e) => {
    if (swiped.current) { e.preventDefault(); e.stopPropagation(); }
  };

  return (
    <section className="bg-charcoal" aria-roledescription="carousel" aria-label="Featured collections">
      <div
        className="relative group touch-pan-y wide:h-[calc(100svh-8.25rem)] wide:min-h-[32rem]"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClickCapture={blockClickAfterSwipe}
      >
        {/* the picture: a normal 16:9 box on portrait screens, the whole hero on landscape ones */}
        <div className="relative w-full aspect-video overflow-hidden wide:absolute wide:inset-0 wide:aspect-auto">
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <Link
                key={s.image}
                to={s.to}
                tabIndex={active ? 0 : -1}
                aria-hidden={!active}
                aria-label={s.alt}
                className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                <img
                  src={s.image}
                  alt={s.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable="false"
                  className="w-full h-full object-contain wide:object-cover"
                />
              </Link>
            );
          })}

          <button onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur hidden wide:flex items-center justify-center wide:opacity-0 wide:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go(1)} aria-label="Next banner" className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur hidden wide:flex items-center justify-center wide:opacity-0 wide:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
            <ChevronRight size={18} />
          </button>

          {/* landscape: dots float over the picture */}
          <Dots
            index={index} setIndex={setIndex} playing={playing} setPlaying={setPlaying}
            className="hidden wide:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-ink/60 backdrop-blur px-4 py-2.5"
          />
        </div>

        {/* portrait: caption panel under the picture */}
        <div className="wide:hidden bg-charcoal text-white px-5 md:px-10 pt-5 pb-3">
          <Link key={index} to={current.to} className="flex items-end justify-between gap-4 animate-fade-in">
            <span className="min-w-0">
              <span className="eyebrow !text-gold-light block mb-2">{current.kicker}</span>
              <span className="block font-display text-[2rem] md:text-5xl leading-none text-balance">{current.title}</span>
            </span>
            <span className="btn btn-light shrink-0 !px-5 !py-3.5">{current.cta} <ArrowRight size={14} /></span>
          </Link>
          <Dots
            index={index} setIndex={setIndex} playing={playing} setPlaying={setPlaying}
            className="flex justify-center mt-2"
          />
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
