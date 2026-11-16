const SectionHeading = ({ eyebrow, title, text, align = 'center', light = false, className = '' }) => (
  <div
    className={`${align === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-2xl ${className}`}
  >
    {eyebrow && <p className={`eyebrow mb-4 ${light ? '!text-gold-light' : ''}`}>{eyebrow}</p>}
    <h2 className={`text-4xl md:text-5xl lg:text-[3.4rem] ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
    {text && (
      <p className={`mt-5 text-[0.95rem] leading-relaxed ${light ? 'text-white/70' : 'text-mute'}`}>{text}</p>
    )}
  </div>
);

export default SectionHeading;
