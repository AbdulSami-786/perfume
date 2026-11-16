import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { categoryMeta, categoryOrder } from '../data/products';
import { SITE, whatsappLink } from '../lib/site';
import NewsletterForm from './NewsletterForm';

const Footer = () => (
  <footer className="bg-ink text-white/70">
    {/* Newsletter */}
    <div className="border-b border-white/10">
      <div className="container mx-auto px-5 py-10 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <p className="eyebrow !text-gold-light mb-3">The Zareen list</p>
          <h2 className="text-3xl md:text-4xl text-white">New scents and private offers, first.</h2>
          <p className="mt-3 text-sm text-white/60">Join our email list. No spam, only the good stuff.</p>
        </div>
        <NewsletterForm source="footer" />
      </div>
    </div>

    <div className="container mx-auto px-5 pt-14 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
        <div className="col-span-2 md:col-span-4">
          <p className="font-display text-4xl text-white tracking-[0.18em] font-semibold">ZAREEN</p>
          <p className="text-[0.62rem] tracking-[0.62em] uppercase text-gold-light mt-1">Fragrance</p>
          <p className="mt-6 text-sm leading-relaxed max-w-xs">
            Premium Eau de Parfum, reed diffusers and car diffusers — crafted in Karachi to bring your signature scent to every part of your day.
          </p>
          <div className="flex gap-3 mt-7">
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-colors">
              <Instagram size={17} strokeWidth={1.5} />
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-colors">
              <MessageCircle size={17} strokeWidth={1.5} />
            </a>
            <a href={`mailto:${SITE.email}`} aria-label="Email" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-colors">
              <Mail size={17} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="md:col-span-2 md:col-start-6">
          <h3 className="font-sans text-[0.68rem] tracking-[0.28em] uppercase text-white mb-5 font-medium">Shop</h3>
          <ul className="text-sm -my-2">
            {categoryOrder.map((key) => (
              <li key={key}><Link to={`/products?category=${key}`} className="inline-block py-2 hover:text-gold-light transition-colors">{categoryMeta[key].label}</Link></li>
            ))}
            <li><Link to="/products" className="inline-block py-2 hover:text-gold-light transition-colors">View all</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="font-sans text-[0.68rem] tracking-[0.28em] uppercase text-white mb-5 font-medium">Company</h3>
          <ul className="text-sm -my-2">
            <li><Link to="/about" className="inline-block py-2 hover:text-gold-light transition-colors">Our Story</Link></li>
            <li><Link to="/contact" className="inline-block py-2 hover:text-gold-light transition-colors">Contact</Link></li>
            <li><Link to="/contact#faq" className="inline-block py-2 hover:text-gold-light transition-colors">FAQ</Link></li>
            <li><Link to="/account" className="inline-block py-2 hover:text-gold-light transition-colors">My Account</Link></li>
            <li><Link to="/wishlist" className="inline-block py-2 hover:text-gold-light transition-colors">Wishlist</Link></li>
            <li><Link to="/cart" className="inline-block py-2 hover:text-gold-light transition-colors">Shopping Bag</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-3">
          <h3 className="font-sans text-[0.68rem] tracking-[0.28em] uppercase text-white mb-5 font-medium">Get in touch</h3>
          <ul className="text-sm -my-1">
            <li className="flex items-center gap-3 py-2"><MapPin size={16} strokeWidth={1.5} className="shrink-0 text-gold-light" /> {SITE.city}</li>
            <li className="flex items-center gap-3"><Phone size={16} strokeWidth={1.5} className="shrink-0 text-gold-light" /> <a href={`tel:+${SITE.whatsappNumber}`} className="py-2 hover:text-gold-light transition-colors">{SITE.phoneDisplay}</a></li>
            <li className="flex items-center gap-3"><Mail size={16} strokeWidth={1.5} className="shrink-0 text-gold-light" /> <a href={`mailto:${SITE.email}`} className="py-2 hover:text-gold-light transition-colors break-all">{SITE.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-14 pt-7 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/45">
        <p>© {new Date().getFullYear()} Zareen Fragrance. All rights reserved.</p>
        <p className="tracking-[0.2em] uppercase text-[0.66rem] md:mr-44">Cash on delivery or bank transfer · Delivered across Pakistan</p>
      </div>
    </div>
  </footer>
);

export default Footer;
