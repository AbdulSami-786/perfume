import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Brand banners (all 16:9).
//  • Landscape screens (desktop / laptop / tablet held sideways): full-bleed, full-screen hero.
//  • Portrait screens (phones / tablet held upright): the WHOLE banner, never cropped or zoomed,
//    full width under the header — just the carousel, nothing underneath it.
const slides = [
  { image: '/banners/flat-10-off.webp', alt: 'Flat 10% off — discover your signature scent. Shop now.', to: '/products' },
  { image: '/ban1.jpeg', alt: 'Women’s perfume — Pink Aura, Maison Flora and more', to: '/products?category=women' },
  { image: '/ban2.jpeg', alt: 'Men’s perfume — White Sultan, Musk Al Rawdah and more', to: '/products?category=men' },
];

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
        {/* a normal 16:9 box on portrait screens, the whole hero on landscape ones */}
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

          {/* arrows: only on landscape screens (phones swipe), hidden until hover */}
          <button onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur hidden wide:flex items-center justify-center wide:opacity-0 wide:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => go(1)} aria-label="Next banner" className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur hidden wide:flex items-center justify-center wide:opacity-0 wide:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
            <ChevronRight size={18} />
          </button>

          {/* dots + pause, over the bottom of the picture on every screen */}
          <div className="absolute bottom-1.5 md:bottom-4 wide:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 md:gap-3 bg-ink/55 backdrop-blur px-2.5 md:px-4 py-0 md:py-1.5">
            {slides.map((s, i) => (
              <button
                key={s.image}
                onClick={() => setIndex(i)}
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === index}
                className="py-3 px-0.5"
              >
                <span className={`block h-[3px] transition-all duration-500 ${i === index ? 'w-6 md:w-10 bg-white' : 'w-2.5 md:w-5 bg-white/50'}`} />
              </button>
            ))}
            <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause banners' : 'Play banners'} className="text-white p-2.5 -my-1">
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;
