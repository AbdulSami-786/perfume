import { Link } from 'react-router-dom';
import { Award, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

const About = () => {
  const brandName = "ZAREEN FRAGRANCE";

  const milestones = [
    { year: '2015', title: 'The Vision', description: 'Founded as a boutique fragrance house in the heart of Karachi.' },
    { year: '2018', title: 'Retail Milestone', description: 'Inaugurated our flagship presence at Ocean Mall.' },
    { year: '2020', title: 'Digital Luxury', description: 'Bringing our signature scents to doorsteps across Pakistan.' },
    { year: '2023', title: 'Expanding Horizons', description: 'Celebrating three distinct retail destinations in Karachi.' }
  ];

  const values = [
    { icon: <Sparkles size={32} strokeWidth={1}/>, title: 'Uncompromising Quality', description: 'Sourcing the world’s most exquisite essences to craft lasting impressions.' },
    { icon: <ShieldCheck size={32} strokeWidth={1}/>, title: 'Authenticity', description: 'Every bottle is a promise of 100% genuine craftsmanship.' },
    { icon: <Award size={32} strokeWidth={1}/>, title: 'Master Curation', description: 'Our scents are hand-selected by connoisseurs to suit the modern persona.' },
    { icon: <MapPin size={32} strokeWidth={1}/>, title: 'Local Heritage', description: 'Proudly rooted in Pakistan, serving a global standard of elegance.' }
  ];

  return (
    <div className="bg-white text-black font-sans">
      {/* 1. HERO SECTION - High Fashion Style */}
      <div className="relative h-[60vh] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=1600&q=80" 
            className="w-full h-full object-cover" 
            alt="Fragrance Backdrop"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-[10px] tracking-[0.5em] text-white uppercase mb-4 font-bold">ESTABLISHED 2015</h2>
          <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-6">Our Legacy</h1>
          <div className="w-16 h-px bg-white mx-auto"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* 2. BRAND PHILOSOPHY */}
        <div className="max-w-3xl mx-auto text-center mb-24">
          <h2 className="text-3xl font-serif italic mb-8 uppercase tracking-widest">A Scent For Every Soul</h2>
          <p className="text-gray-500 text-lg leading-relaxed font-light italic">
            At <span className="text-black font-bold not-italic">{brandName}</span>, we believe a fragrance is more than just a scent—it is an invisible garment, a memory captured in a bottle. Since our inception, we have been dedicated to the art of perfumery, blending tradition with modern elegance to bring you a collection that speaks to your identity.
          </p>
        </div>

        {/* 3. CORE VALUES - Minimalist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-32 border-y border-gray-100 py-20">
          {values.map((val, idx) => (
            <div key={idx} className="text-center group">
              <div className="mb-6 flex justify-center text-gray-400 group-hover:text-black transition-colors duration-500">
                {val.icon}
              </div>
              <h3 className="text-xs tracking-[0.3em] font-bold uppercase mb-4">{val.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-tighter">{val.description}</p>
            </div>
          ))}
        </div>

        {/* 4. THE JOURNEY - Vertical Minimalist Timeline */}
        <div className="mb-32">
          <h2 className="text-center text-2xl font-serif italic tracking-widest mb-16 uppercase">The Journey</h2>
          <div className="max-w-4xl mx-auto space-y-12">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-8 items-start border-l border-black pl-8 relative ml-4 md:ml-auto">
                <div className="absolute -left-[5px] top-0 w-2 h-2 bg-black rounded-full"></div>
                <span className="text-xl font-serif italic text-gray-400">{m.year}</span>
                <div>
                  <h4 className="text-sm font-bold tracking-[0.2em] uppercase mb-2">{m.title}</h4>
                  <p className="text-gray-500 font-light italic">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. STATS - Clean Banner */}
        <div className="bg-black text-white py-20 px-4 mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center max-w-5xl mx-auto">
            <div>
              <div className="text-3xl font-serif mb-2 italic">08+</div>
              <div className="text-[9px] tracking-[0.4em] uppercase opacity-60">Years of Mastery</div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-2 italic">5k+</div>
              <div className="text-[9px] tracking-[0.4em] uppercase opacity-60">Curated Senses</div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-2 italic">200+</div>
              <div className="text-[9px] tracking-[0.4em] uppercase opacity-60">Unique Notes</div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-2 italic">03</div>
              <div className="text-[9px] tracking-[0.4em] uppercase opacity-60">Boutique Locations</div>
            </div>
          </div>
        </div>

        {/* 6. CALL TO ACTION */}
        <div className="text-center py-20 border border-gray-100">
          <h2 className="text-3xl font-serif italic mb-6">Discover Your Signature</h2>
          <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-10 max-w-lg mx-auto leading-loose">
            Visit our boutiques in Karachi or explore our online gallery to find the scent that defines you.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link 
              to="/products" 
              className="bg-black text-white px-12 py-4 text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-gray-800 transition shadow-xl"
            >
              Shop Collection
            </Link>
            <Link 
              to="/contact" 
              className="border border-black text-black px-12 py-4 text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-black hover:text-white transition"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;