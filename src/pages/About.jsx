import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Gift, Heart, Home, Package, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { categoryOrder } from '../data/products';
import { assetUrl } from '../lib/site';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

const story = [
  {
    title: 'The inspiration',
    text: 'People often have a favourite perfume they love to wear. We wanted them to experience that same scent in their car and their room as well.',
  },
  {
    title: 'The name',
    text: 'Zareen Fragrance is named after the grandmother of our founder, Saim Sheikh, whose name was Zareen — a meaningful, personal touch behind the brand.',
  },
  {
    title: 'Our promise',
    text: 'Our team has more than five years of experience working with fragrance oils and scent development. We work with verified vendors and partners and never compromise on quality.',
  },
];

const range = [
  { icon: Gift, title: 'Eau de Parfum', text: 'Signature 50 ml perfumes for him and for her.' },
  { icon: Home, title: 'Room diffusers', text: 'Transform your living spaces with signature aromas.' },
  { icon: Car, title: 'Car diffusers', text: 'Take your favourite scent on every journey.' },
  { icon: Package, title: 'Tester box', text: 'Explore multiple fragrances before choosing a favourite.' },
];

const values = [
  { icon: Sparkles, title: 'Premium quality', text: 'High-quality, perfume-inspired fragrances crafted with expertise.' },
  { icon: Heart, title: 'A personal touch', text: 'Scents for both men and women to match their personality.' },
  { icon: ShieldCheck, title: 'Verified vendors', text: 'Trusted partners, and no compromise on quality.' },
  { icon: Truck, title: 'Easy delivery', text: 'Cash on delivery for trust and convenience.' },
];

const About = () => {
  useEffect(() => { document.title = 'Our Story | Zareen Fragrance'; }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="pointer-events-none absolute -top-32 -right-24 w-[34rem] h-[34rem] rounded-full bg-gold/20 blur-3xl" />
        <div className="relative container mx-auto px-5 py-16 md:py-36 text-center">
          <p className="eyebrow !text-gold-light mb-6">Established 1 March 2026 · Karachi</p>
          <h1 className="text-6xl md:text-8xl text-white">Our story</h1>
          <div className="w-16 h-px bg-gold mx-auto mt-8 mb-8" />
          <p className="max-w-xl mx-auto text-white/70 leading-relaxed">
            A fragrance house built on a simple belief: a great scent belongs everywhere you are — on you, in your car and in your home.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="container mx-auto px-5 py-14 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center max-w-6xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-white border border-line/70 overflow-hidden"><img src={assetUrl('/p1.jpeg')} alt="Musk Al Rawdah perfume" loading="lazy" className="w-full h-full object-contain p-2" /></div>
              <div className="aspect-[3/4] bg-white border border-line/70 overflow-hidden mt-10"><img src={assetUrl('/p2.jpeg')} alt="Pink Aura perfume" loading="lazy" className="w-full h-full object-contain p-2" /></div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-5">Welcome</p>
            <h2 className="text-4xl md:text-5xl mb-7">Welcome to Zareen Fragrance</h2>
            <p className="text-mute leading-relaxed mb-5">
              Zareen Fragrance is a premium fragrance brand offering high-quality perfumes, perfume-inspired car diffusers and room diffusers. Our goal is to let people enjoy their favourite fragrances not only on themselves, but in their cars and living spaces too.
            </p>
            <p className="text-mute leading-relaxed">
              Founded on 1 March 2026 in Karachi, Pakistan, we serve men and women who want to elevate their lifestyle with a unique and pleasant fragrance experience.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="bg-sand border-y border-line">
        <div className="container mx-auto px-5 py-14 md:py-24">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {story.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="h-full bg-white border border-line/70 p-9 text-center">
                  <span className="font-display text-6xl text-gold/70 leading-none">0{i + 1}</span>
                  <h3 className="text-3xl mt-3 mb-4">{s.title}</h3>
                  <p className="text-sm text-mute leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Range */}
      <section className="container mx-auto px-5 py-14 md:py-28">
        <Reveal><SectionHeading eyebrow="What we make" title="Our collection" text="Designed for men and women, for the body, the car and the home." /></Reveal>
        <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {range.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="text-center">
              <span className="mx-auto mb-5 w-16 h-16 rounded-full border border-gold/50 flex items-center justify-center text-gold"><Icon size={24} strokeWidth={1.25} /></span>
              <h3 className="text-2xl mb-2">{title}</h3>
              <p className="text-sm text-mute max-w-[14rem] mx-auto leading-relaxed">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-charcoal text-white">
        <Reveal className="container mx-auto px-5 py-16 md:py-32 max-w-4xl text-center">
          <p className="eyebrow !text-gold-light mb-7">Our philosophy</p>
          <blockquote className="font-display text-3xl md:text-5xl leading-[1.2] italic text-white">
            “People wear great clothes and present themselves well — but a great fragrance is always essential, whether it's on your body, in your car or in your room.”
          </blockquote>
        </Reveal>
      </section>

      {/* Values + stats */}
      <section className="container mx-auto px-5 py-14 md:py-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {values.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="text-center">
              <Icon size={30} strokeWidth={1} className="mx-auto mb-5 text-gold" />
              <h3 className="font-sans text-[0.75rem] font-medium tracking-[0.2em] uppercase mb-3">{title}</h3>
              <p className="text-sm text-mute leading-relaxed">{text}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-3 border-y border-line max-w-4xl mx-auto divide-x divide-line">
          {[
            ['5+', 'Years of experience'],
            ['2026', 'Founded in Karachi'],
            [String(categoryOrder.length), 'Collections'],
          ].map(([n, l]) => (
            <div key={l} className="py-10 text-center px-2">
              <p className="font-display text-5xl md:text-6xl">{n}</p>
              <p className="mt-2 text-[0.66rem] md:text-[0.68rem] tracking-[0.2em] uppercase text-mute">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision + CTA */}
      <section className="bg-sand border-t border-line">
        <Reveal className="container mx-auto px-5 py-14 md:py-28 text-center max-w-3xl">
          <p className="eyebrow mb-5">Our vision</p>
          <h2 className="text-4xl md:text-5xl mb-6">A fragrance identity that goes with you</h2>
          <p className="text-mute leading-relaxed mb-10">
            To expand Zareen Fragrance across Pakistan and eventually into international markets, allowing more people to experience our scents and build a fragrance identity that stays with them wherever they go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn btn-dark">Explore the collection</Link>
            <Link to="/contact" className="btn btn-outline">Get in touch</Link>
          </div>
          <p className="mt-6 text-xs text-mute">Cash on delivery and bank transfer available</p>
        </Reveal>
      </section>
    </div>
  );
};

export default About;
