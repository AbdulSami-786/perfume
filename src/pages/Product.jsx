import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, SearchX, X } from 'lucide-react';
import { categoryMeta, categoryOrder, products } from '../data/products';
import ProductCard from '../components/ProductCard';
import PageHeader from '../components/PageHeader';

const sorters = {
  featured: () => 0,
  'price-low': (a, b) => a.price - b.price,
  'price-high': (a, b) => b.price - a.price,
  name: (a, b) => a.shortName.localeCompare(b.shortName),
};

const Product = () => {
  const [params, setParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('featured');

  const category = categoryMeta[params.get('category')] ? params.get('category') : 'all';
  const query = (params.get('q') || '').trim();

  useEffect(() => {
    document.title = `${category === 'all' ? 'Shop All' : categoryMeta[category].label} | Zareen Fragrance`;
  }, [category]);

  const setCategory = (key) => {
    const next = new URLSearchParams(params);
    if (key === 'all') next.delete('category'); else next.set('category', key);
    setParams(next, { replace: true });
  };

  const clearQuery = () => {
    const next = new URLSearchParams(params);
    next.delete('q');
    setParams(next, { replace: true });
  };

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return products
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => !q || `${p.name} ${p.shortName} ${p.subtitle} ${categoryMeta[p.category].label}`.toLowerCase().includes(q))
      .sort(sorters[sortBy]);
  }, [category, query, sortBy]);

  const tabs = [{ key: 'all', label: 'All', count: products.length }].concat(
    categoryOrder.map((key) => ({ key, label: categoryMeta[key].label, count: products.filter((p) => p.category === key).length }))
  );

  return (
    <div>
      <PageHeader
        title={category === 'all' ? 'The Collection' : categoryMeta[category].label}
        subtitle={category === 'all' ? 'Perfumes, reed diffusers and car diffusers — all 10% off.' : categoryMeta[category].description}
        crumbs={[{ label: 'Shop', to: category === 'all' ? undefined : '/products' }].concat(category === 'all' ? [] : [{ label: categoryMeta[category].label }])}
      />

      <div className="container mx-auto px-5 py-10 md:py-14">
        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 mb-10 border-b border-line">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter by collection">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={category === t.key}
                onClick={() => setCategory(t.key)}
                className={`shrink-0 px-5 py-2.5 text-[0.7rem] tracking-[0.2em] uppercase font-medium border transition-colors ${
                  category === t.key ? 'bg-ink text-white border-ink' : 'border-line bg-white text-ink/70 hover:border-ink hover:text-ink'
                }`}
              >
                {t.label} <span className="opacity-50 ml-1">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-6 text-sm">
            <p className="text-mute">{visible.length} {visible.length === 1 ? 'product' : 'products'}</p>
            <label className="relative flex items-center">
              <span className="sr-only">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-line pl-4 pr-10 py-2.5 text-[0.7rem] tracking-[0.16em] uppercase font-medium outline-none cursor-pointer hover:border-ink focus:border-ink transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="name">Name: A – Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 pointer-events-none" />
            </label>
          </div>
        </div>

        {query && (
          <div className="mb-8 flex items-center gap-3 text-sm">
            <span className="text-mute">Results for</span>
            <button onClick={clearQuery} className="inline-flex items-center gap-2 bg-white border border-line px-3.5 py-1.5 hover:border-ink transition-colors">
              “{query}” <X size={13} />
            </button>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="py-24 text-center">
            <SearchX size={44} strokeWidth={1} className="mx-auto text-gold mb-5" />
            <p className="font-display text-3xl mb-2">Nothing found</p>
            <p className="text-sm text-mute mb-8">Try a different search or browse the full collection.</p>
            <Link to="/products" className="btn btn-dark">View all products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-7 gap-y-12">
            {visible.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
