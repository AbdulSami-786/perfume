import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

const empty = { reviews: [], count: 0, average: 0 };

// Loads (and lets callers replace) the reviews for one product.
export const useReviews = (productId) => {
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api('getReviews', { productId })
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(empty)) // backend offline → just show "no reviews yet"
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [productId]);

  const replace = useCallback((d) => setData(d), []);
  return { ...data, loading, replace };
};
