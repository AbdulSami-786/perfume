import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../lib/site';

const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  // Keep the totals and the order button unobstructed while buying.
  if (pathname === '/cart' || pathname === '/checkout') return null;
  return (
  <a
    href={whatsappLink('Hello Zareen Fragrance, I would like some help choosing a fragrance.')}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="fixed bottom-4 right-4 md:bottom-5 md:right-5 z-[90] flex items-center gap-2.5 bg-[#25D366] text-white pl-3.5 pr-3.5 md:pl-4 md:pr-5 py-3 md:py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:scale-105 hover:shadow-[0_10px_36px_rgba(0,0,0,0.3)] transition-all duration-300"
  >
    <MessageCircle size={22} fill="currentColor" strokeWidth={0} />
    <span className="hidden md:inline text-[0.72rem] font-medium tracking-[0.18em] uppercase">Chat with us</span>
  </a>
  );
};

export default WhatsAppFloat;
