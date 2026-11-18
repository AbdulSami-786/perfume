import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { categoryMeta, categoryOrder, imageBgFor, products, photoFit } from '../data/products';
import { applyDiscount, assetUrl, FREE_SHIPPING_THRESHOLD, formatPrice } from '../lib/site';

const navLink = ({ isActive }) =>
  `relative py-2 text-[0.72rem] font-medium tracking-[0.24em] uppercase transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-ink after:transition-all after:duration-300 ${
    isActive ? 'text-ink after:w-full' : 'text-ink/70 hover:text-ink after:w-0 hover:after:w-full'
  }`;

const Logo = ({ light = false, onClick }) => (
  <Link to="/" onClick={onClick} aria-label="Zareen Fragrance — home" className="inline-block text-center leading-none">
    <span className={`block font-display text-[1.9rem] md:text-[2.2rem] font-semibold tracking-[0.18em] pl-[0.18em] ${light ? 'text-white' : 'text-ink'}`}>
      ZAREEN
    </span>
    <span className={`block mt-1 text-[0.56rem] md:text-[0.6rem] tracking-[0.62em] pl-[0.62em] uppercase ${light ? 'text-gold-light' : 'text-gold'}`}>
      Fragrance
    </span>
  </Link>
);

const SearchPanel = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => `${p.name} ${p.shortName} ${p.subtitle} ${categoryMeta[p.category]?.label}`.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    onClose();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[150] animate-fade-in" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-ivory border-b border-line shadow-xl">
        <div className="container mx-auto px-5 py-8 md:py-12 max-w-3xl">
          <form onSubmit={submit} className="flex items-center gap-4 border-b border-ink pb-3">
            <Search size={22} strokeWidth={1.5} className="shrink-0 text-mute" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrances, diffusers…"
              aria-label="Search products"
              className="flex-1 bg-transparent outline-none font-display text-2xl md:text-3xl placeholder:text-mute/60"
            />
            <button type="button" onClick={onClose} aria-label="Close search" className="p-1 hover:text-gold transition-colors">
              <X size={22} strokeWidth={1.5} />
            </button>
          </form>

          {query.trim() && (
            <div className="mt-6">
              {results.length === 0 ? (
                <p className="text-sm text-mute py-4">No results for “{query}”. Try “rose”, “lavender” or “musk”.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.id}`} onClick={() => { onClose(); setQuery(''); }} className="flex items-center gap-4 py-3 group">
                        <span className="w-14 h-16 border border-line/70 shrink-0" style={{ background: imageBgFor(p.id) }}>
                          <img src={assetUrl(p.mainImage)} alt="" className={`w-full h-full ${photoFit(p.mainImage)}`} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-display text-xl group-hover:text-gold transition-colors">{p.shortName}</span>
                          <span className="block text-xs text-mute">{p.subtitle}</span>
                        </span>
                        <span className="text-sm">{formatPrice(applyDiscount(p.price))}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={submit} className="link-underline mt-4 text-ink inline-flex items-center gap-2">
                View all results <ArrowRight size={13} />
              </button>
            </div>
          )}

          {!query.trim() && (
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="text-xs text-mute mr-1 self-center">Popular:</span>
              {['Musk', 'Rose', 'Lavender', 'Jasmine', 'Reed diffuser'].map((t) => (
                <button key={t} onClick={() => setQuery(t)} className="px-4 py-1.5 border border-line text-xs hover:border-ink hover:bg-white transition-colors">
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const announcements = [
  '10% off everything',
  `Free delivery over Rs. ${FREE_SHIPPING_THRESHOLD.toLocaleString()}`,
  'Cash on delivery & bank transfer',
];

// Phones: one readable message at a time. Desktop: all three together.
const AnnouncementBar = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % announcements.length), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-ink text-white/90 text-center px-4 py-2.5 text-[0.7rem] lg:text-[0.68rem] tracking-[0.18em] lg:tracking-[0.26em] uppercase">
      <p key={i} className="lg:hidden h-4 leading-4 animate-fade-in text-gold-light">{announcements[i]}</p>
      <p className="hidden lg:block leading-4">
        <span className="text-gold-light">{announcements[0]}</span>
        <span className="mx-3 text-white/30">|</span>
        <span>{announcements[1]}</span>
        <span className="mx-3 text-white/30">|</span>
        <span>{announcements[2]}</span>
      </p>
    </div>
  );
};

const Navbar = () => {
  // Open state is tied to the current location key, so navigating closes both.
  const location = useLocation();
  const [menuKey, setMenuKey] = useState(null);
  const [shopKey, setShopKey] = useState(null);
  const menuOpen = menuKey === location.key;
  const shopOpen = shopKey === location.key;
  const setMenuOpen = (open) => setMenuKey(open ? location.key : null);
  const setShopOpen = (open) => setShopKey(open ? location.key : null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, openDrawer } = useCart();
  const { user } = useAuth();
  const { count: wishCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-[100]">
      <AnnouncementBar />

      {/* Main bar */}
      <div
        className={`relative bg-ivory/95 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled ? 'border-line shadow-[0_4px_24px_-12px_rgba(0,0,0,0.18)]' : 'border-transparent'
        }`}
      >
        <div className="container mx-auto px-5">
          <div className={`grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-300 ${scrolled ? 'h-[4.1rem]' : 'h-[4.8rem] md:h-24'}`}>
            {/* Left */}
            <div className="flex items-center">
              <button className="lg:hidden -ml-1 p-2" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <Menu size={24} strokeWidth={1.5} />
              </button>
              <nav className="hidden lg:flex items-center gap-9" aria-label="Primary">
                <NavLink to="/" end className={navLink}>Home</NavLink>
                <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
                  <NavLink to="/products" end className={navLink} onFocus={() => setShopOpen(true)}>
                    <span className="inline-flex items-center gap-1.5">Shop <ChevronDown size={12} className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`} /></span>
                  </NavLink>
                </div>
                <NavLink to="/about" className={navLink}>Our Story</NavLink>
              </nav>
            </div>

            {/* Center */}
            <Logo />

            {/* Right */}
            <div className="flex items-center justify-end gap-1 md:gap-3">
              <NavLink to="/contact" className={`${navLink({ isActive: location.pathname === '/contact' })} hidden lg:inline-block mr-4`}>
                Contact
              </NavLink>
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className="p-2 hover:text-gold transition-colors">
                <Search size={21} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist" aria-label={`Wishlist, ${wishCount} items`} className="relative p-2 hover:text-gold transition-colors hidden md:block">
                <Heart size={21} strokeWidth={1.5} />
                {wishCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[1.15rem] h-[1.15rem] px-1 bg-ink text-white text-[0.65rem] font-medium rounded-full flex items-center justify-center">{wishCount}</span>
                )}
              </Link>
              <Link to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Log in'} title={user ? user.name : 'Log in'} className="relative p-2 hover:text-gold transition-colors hidden md:block">
                <User size={21} strokeWidth={1.5} />
                {user && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />}
              </Link>
              <button onClick={openDrawer} aria-label={`Open bag, ${cartCount} items`} className="relative p-2 hover:text-gold transition-colors">
                <ShoppingBag size={21} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[1.15rem] h-[1.15rem] px-1 bg-gold text-white text-[0.65rem] font-medium rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Shop mega menu (desktop) */}
        <div
          onMouseEnter={() => setShopOpen(true)}
          onMouseLeave={() => setShopOpen(false)}
          className={`hidden lg:block absolute left-0 right-0 top-full bg-ivory border-b border-line shadow-xl transition-all duration-300 ${
            shopOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          }`}
        >
          <div className="container mx-auto px-5 py-9">
            <div className="grid grid-cols-5 gap-6">
              {categoryOrder.map((key) => (
                <Link key={key} to={`/products?category=${key}`} className="group block text-center">
                  <span className="block aspect-square bg-white border border-line/70 overflow-hidden mb-3">
                    <img src={categoryMeta[key].image} alt="" className={`w-full h-full ${photoFit(categoryMeta[key].image, 'p-2')} group-hover:scale-105 transition-transform duration-500`} loading="lazy" />
                  </span>
                  <span className="block font-display text-xl group-hover:text-gold transition-colors">{categoryMeta[key].label}</span>
                  <span className="block text-[0.7rem] text-mute mt-0.5">{products.filter((p) => p.category === key).length === 1 ? '1 item' : `${products.filter((p) => p.category === key).length} items`}</span>
                </Link>
              ))}
            </div>
            <div className="mt-7 pt-5 border-t border-line text-center">
              <Link to="/products" className="link-underline text-ink inline-flex items-center gap-2">Shop all products <ArrowRight size={13} /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-[160] animate-fade-in" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[84%] max-w-sm bg-ivory flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <Logo onClick={() => setMenuOpen(false)} />
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1"><X size={24} strokeWidth={1.5} /></button>
            </div>
            <nav className="px-6 py-6 flex-1">
              <ul className="space-y-1">
                {[['/', 'Home'], ['/products', 'Shop All'], ['/about', 'Our Story'], ['/contact', 'Contact'], ['/wishlist', wishCount ? `Wishlist (${wishCount})` : 'Wishlist'], user ? ['/account', 'My Account'] : ['/login', 'Log in / Sign up']].map(([to, label]) => (
                  <li key={to}>
                    <NavLink to={to} end={to === '/'} className={({ isActive }) => `block py-3 font-display text-3xl ${isActive ? 'text-gold' : 'text-ink'}`}>{label}</NavLink>
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-8 mb-3">Collections</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                {categoryOrder.map((key) => (
                  <li key={key}>
                    <Link to={`/products?category=${key}`} className="block py-2 text-sm text-ink/80 hover:text-gold">{categoryMeta[key].label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Navbar;
