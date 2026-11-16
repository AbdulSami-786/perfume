import { useEffect, useState } from 'react';
import { ChevronDown, Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, SITE, whatsappLink } from '../lib/site';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Reveal from '../components/Reveal';

const channels = [
  { icon: MessageCircle, title: 'WhatsApp', value: SITE.phoneDisplay, note: 'Quickest assistance', href: whatsappLink('Hello Zareen Fragrance, I have a question.') },
  { icon: Phone, title: 'Call us', value: SITE.phoneDisplay, note: 'Daily, 11am – 11pm', href: `tel:+${SITE.whatsappNumber}` },
  { icon: Mail, title: 'Email', value: SITE.email, note: 'We reply as soon as we can', href: `mailto:${SITE.email}` },
  { icon: Instagram, title: 'Instagram', value: SITE.instagramHandle, note: 'New scents & updates', href: SITE.instagram },
];

const faqs = [
  { q: 'How do I place an order?', a: 'Add your favourites to the bag and check out right here on the website. Choose cash on delivery or bank transfer and we’ll confirm your order. Create an account to track every order.' },
  { q: 'What payment methods do you accept?', a: 'Cash on delivery, or bank transfer: transfer the amount, upload a screenshot of the payment at checkout, and we’ll verify it before dispatch.' },
  { q: 'How much is delivery?', a: `Delivery is Rs. ${SHIPPING_FEE} and free on orders over Rs. ${FREE_SHIPPING_THRESHOLD.toLocaleString()}.` },
  { q: 'Which products do you offer?', a: 'Eau de Parfum for men and women (50 ml), reed diffusers for the home, car diffusers, and a five-scent Discovery Tester Set.' },
  { q: 'How do I track my order?', a: 'Log in to your account and open the Orders tab. You’ll see the status of each order and its payment verification.' },
  { q: 'Is the 10% discount automatic?', a: 'Yes — the storewide sale price is already shown on every product.' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [open, setOpen] = useState(0);
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => { document.title = 'Contact | Zareen Fragrance'; }, []);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'sending', message: '' });
    try {
      await api('contact', { ...form, hp });
      setStatus({ state: 'sent', message: '' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  };

  return (
    <div>
      <PageHeader title="Get in touch" subtitle="Questions about a scent or an order? We're happy to help." crumbs={[{ label: 'Contact' }]} />

      <section className="container mx-auto px-5 py-12 md:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {channels.map(({ icon: Icon, title, value, note, href }, i) => (
            <Reveal key={title} delay={i * 80}>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="group block h-full bg-white border border-line/70 p-8 text-center hover:border-gold hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <span className="mx-auto mb-5 w-14 h-14 rounded-full border border-gold/50 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors"><Icon size={22} strokeWidth={1.25} /></span>
                <h2 className="text-2xl mb-1">{title}</h2>
                <p className="text-sm break-words">{value}</p>
                <p className="text-xs text-mute mt-1.5">{note}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sand border-y border-line">
        <div className="container mx-auto px-5 py-12 md:py-24">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 max-w-6xl mx-auto items-start">
            <Reveal>
              <p className="eyebrow mb-4">Send a message</p>
              <h2 className="text-4xl md:text-5xl mb-5">How can we help?</h2>
              <p className="text-mute leading-relaxed mb-9">Write to us below and we’ll get back to you by email.</p>
              <form onSubmit={submit} className="space-y-7">
                <div className="grid sm:grid-cols-2 gap-7">
                  <div>
                    <label htmlFor="c-name" className="label">Name</label>
                    <input id="c-name" name="name" value={form.name} onChange={set} required autoComplete="name" className="field" />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="label">Email</label>
                    <input id="c-email" name="email" type="email" value={form.email} onChange={set} required autoComplete="email" className="field" />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-message" className="label">Message</label>
                  <textarea id="c-message" name="message" value={form.message} onChange={set} required rows={4} className="field resize-none" />
                </div>
                <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
                {status.state === 'error' && <p role="alert" className="text-sm text-red-700">{status.message}</p>}
                {status.state === 'sent' && <p role="status" className="text-sm text-gold">Thank you, your message has been sent. We’ll be in touch soon.</p>}
                <button type="submit" disabled={status.state === 'sending'} className="btn btn-dark disabled:opacity-60">{status.state === 'sending' ? 'Sending…' : 'Send message'}</button>
              </form>
            </Reveal>

            <Reveal delay={120}>
              <div className="bg-ink text-white p-9 md:p-12">
                <p className="eyebrow !text-gold-light mb-4">Visit & hours</p>
                <h2 className="text-4xl text-white mb-8">Based in Karachi</h2>
                <ul className="space-y-6 text-sm text-white/75">
                  <li className="flex gap-4"><MapPin size={19} strokeWidth={1.25} className="shrink-0 text-gold-light" /> <span>{SITE.city}<br /><span className="text-white/45">Delivering across Pakistan</span></span></li>
                  <li className="flex gap-4"><Clock size={19} strokeWidth={1.25} className="shrink-0 text-gold-light" /> <span>Open daily<br /><span className="text-white/45">11:00 am – 11:00 pm</span></span></li>
                  <li className="flex gap-4"><Phone size={19} strokeWidth={1.25} className="shrink-0 text-gold-light" /> <span>{SITE.phoneDisplay}<br /><span className="text-white/45">Call or WhatsApp</span></span></li>
                </ul>
                <a href={whatsappLink('Hello Zareen Fragrance!')} target="_blank" rel="noopener noreferrer" className="btn btn-light mt-10 w-full">Chat with us now</a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="faq" className="container mx-auto px-5 py-14 md:py-28 scroll-mt-32">
        <Reveal className="text-center mb-12">
          <p className="eyebrow mb-4">Good to know</p>
          <h2 className="text-4xl md:text-5xl">Frequently asked questions</h2>
        </Reveal>
        <div className="max-w-3xl mx-auto border-t border-line">
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b border-line">
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="w-full flex items-center justify-between gap-6 py-6 text-left">
                <span className="font-display text-2xl">{f.q}</span>
                <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'}`}>
                <p className="overflow-hidden text-mute leading-relaxed text-sm">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;
