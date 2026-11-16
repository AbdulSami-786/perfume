import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Shared page banner with breadcrumb, used by inner pages.
const PageHeader = ({ title, subtitle, crumbs = [] }) => (
  <header className="bg-sand border-b border-line">
    <div className="container mx-auto px-5 py-10 md:py-20 text-center">
      <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-[0.68rem] tracking-[0.2em] uppercase text-mute mb-2 md:mb-6">
        <Link to="/" className="inline-block py-2 hover:text-ink transition-colors">Home</Link>
        {crumbs.map((c) => (
          <span key={c.label} className="flex items-center gap-2">
            <ChevronRight size={11} />
            {c.to ? <Link to={c.to} className="inline-block py-2 hover:text-ink transition-colors">{c.label}</Link> : <span className="text-ink">{c.label}</span>}
          </span>
        ))}
      </nav>
      <h1 className="text-4xl sm:text-5xl md:text-6xl">{title}</h1>
      {subtitle && <p className="mt-5 text-mute max-w-xl mx-auto text-[0.95rem]">{subtitle}</p>}
    </div>
  </header>
);

export default PageHeader;
