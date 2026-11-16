import { Star } from 'lucide-react';

// Read-only star rating (supports half-rounded display via Math.round).
const Stars = ({ value, size = 14 }) => (
  <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={size} className={i < Math.round(value) ? 'fill-gold text-gold' : 'text-line'} />
    ))}
  </span>
);

export default Stars;
