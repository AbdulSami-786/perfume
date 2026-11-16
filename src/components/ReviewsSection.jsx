import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, Loader2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import Stars from './Stars';
import Reveal from './Reveal';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const ReviewForm = ({ productId, onSaved }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please choose a star rating.');
    setBusy(true);
    setError('');
    try {
      const data = await api('addReview', { productId, rating, title, text });
      onSaved(data);
      setDone(true);
      setTitle('');
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="bg-white border border-line/70 p-8 text-center">
        <BadgeCheck size={30} strokeWidth={1.25} className="mx-auto text-gold mb-3" />
        <p className="font-display text-3xl mb-1">Thank you for your review</p>
        <p className="text-sm text-mute">It’s now live on this page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-line/70 p-7 md:p-9 space-y-6">
      <h3 className="text-3xl">Write a review</h3>
      <div>
        <span className="label mb-2">Your rating</span>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="p-0.5"
            >
              <Star size={28} strokeWidth={1.25} className={(hover || rating) >= n ? 'fill-gold text-gold' : 'text-line'} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="rv-title" className="label">Title <span className="normal-case tracking-normal text-mute/70">(optional)</span></label>
        <input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="field" placeholder="Sum it up in a few words" />
      </div>
      <div>
        <label htmlFor="rv-text" className="label">Your review</label>
        <textarea id="rv-text" value={text} onChange={(e) => setText(e.target.value)} required rows={4} maxLength={1000} className="field resize-none" placeholder="What did you love about it?" />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-dark disabled:opacity-60">
        {busy ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : 'Submit review'}
      </button>
    </form>
  );
};

const ReviewsSection = ({ productId, reviewData, onChange }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { reviews, count, average, loading } = reviewData;

  return (
    <section id="reviews" className="bg-sand/60 border-y border-line scroll-mt-32">
      <div className="container mx-auto px-5 py-12 md:py-20">
        <Reveal className="text-center mb-12">
          <p className="eyebrow mb-3">Reviews</p>
          <h2 className="text-4xl md:text-5xl">What customers say</h2>
          {count > 0 && (
            <p className="mt-5 flex items-center justify-center gap-3 text-sm text-mute">
              <Stars value={average} size={16} />
              <span><strong className="text-ink font-medium">{average}</strong> out of 5 · {count} {count === 1 ? 'review' : 'reviews'}</span>
            </p>
          )}
        </Reveal>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 max-w-6xl mx-auto items-start">
          <div className="space-y-5">
            {loading && <p className="text-center text-mute text-sm py-10">Loading reviews…</p>}
            {!loading && count === 0 && (
              <div className="bg-white border border-line/70 p-10 text-center">
                <p className="font-display text-3xl mb-2">No reviews yet</p>
                <p className="text-sm text-mute">Be the first to share your thoughts on this product.</p>
              </div>
            )}
            {reviews.map((r) => (
              <figure key={r.id} className="bg-white border border-line/70 p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="text-xs text-mute">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="font-display text-2xl mt-3 leading-tight">{r.title}</p>}
                <blockquote className="mt-2 text-sm text-mute leading-relaxed whitespace-pre-line">{r.text}</blockquote>
                <figcaption className="mt-4 flex items-center gap-3 text-sm">
                  <span className="font-medium">{r.name}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-gold"><BadgeCheck size={14} /> Verified purchase</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="lg:sticky lg:top-36">
            {user ? (
              <ReviewForm productId={productId} onSaved={onChange} />
            ) : (
              <div className="bg-white border border-line/70 p-8 text-center">
                <h3 className="text-3xl mb-2">Share your experience</h3>
                <p className="text-sm text-mute mb-6">Log in to write a review and help others find their scent.</p>
                <Link to={`/login?next=${encodeURIComponent(location.pathname + '#reviews')}`} className="btn btn-dark w-full">Log in to review</Link>
                <p className="mt-4 text-xs text-mute">New here? <Link to={`/signup?next=${encodeURIComponent(location.pathname + '#reviews')}`} className="underline underline-offset-4 hover:text-gold">Create an account</Link></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
