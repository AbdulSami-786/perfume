import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Gift, Heart, Loader2, PackageCheck, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const perks = [
  [PackageCheck, 'Track every order and its payment status'],
  [Heart, 'Save your wishlist across all your devices'],
  [Star, 'Review products you’ve purchased'],
  [Gift, 'Faster checkout with saved delivery details'],
];

// Only allow redirects back into this site.
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/account');

const Auth = ({ mode }) => {
  const isSignup = mode === 'signup';
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = `${isSignup ? 'Create account' : 'Log in'} | Zareen Fragrance`; }, [isSignup]);

  if (!loading && user) return <Navigate to={next} replace />;

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isSignup) await signup(form); else await login(form.email, form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const other = `${isSignup ? '/login' : '/signup'}${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`;

  return (
    <div className="container mx-auto px-5 py-10 md:py-20">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-0 max-w-5xl mx-auto bg-white border border-line/70 shadow-[0_30px_80px_-40px_rgba(60,40,10,0.3)]">
        <aside className="hidden lg:flex flex-col justify-between bg-charcoal text-white p-12">
          <div>
            <p className="font-display text-4xl tracking-[0.18em] font-semibold">ZAREEN</p>
            <p className="text-[0.6rem] tracking-[0.62em] uppercase text-gold-light mt-1">Fragrance</p>
          </div>
          <div>
            <h2 className="text-4xl text-white mb-8">{isSignup ? 'Join the Zareen family' : 'Welcome back'}</h2>
            <ul className="space-y-5">
              {perks.map(([Icon, text]) => (
                <li key={text} className="flex gap-4 text-sm text-white/75"><Icon size={19} strokeWidth={1.25} className="shrink-0 text-gold-light" /> {text}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/40">Your details are only used to process your orders.</p>
        </aside>

        <div className="p-6 sm:p-8 md:p-12">
          <p className="eyebrow mb-3">{isSignup ? 'Create your account' : 'Account login'}</p>
          <h1 className="text-5xl mb-8">{isSignup ? 'Sign up' : 'Log in'}</h1>

          <form onSubmit={submit} className="space-y-6" noValidate>
            {isSignup && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="a-name" className="label">Full name</label>
                  <input id="a-name" name="name" value={form.name} onChange={set} required autoComplete="name" className="field" />
                </div>
                <div>
                  <label htmlFor="a-phone" className="label">Phone</label>
                  <input id="a-phone" name="phone" type="tel" value={form.phone} onChange={set} autoComplete="tel" placeholder="03XX XXXXXXX" className="field" />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="a-email" className="label">Email</label>
              <input id="a-email" name="email" type="email" value={form.email} onChange={set} required autoComplete="email" className="field" />
            </div>
            <div>
              <label htmlFor="a-pass" className="label">Password {isSignup && <span className="normal-case tracking-normal text-mute/70">(min. 8 characters)</span>}</label>
              <div className="relative">
                <input id="a-pass" name="password" type={show ? 'text' : 'password'} value={form.password} onChange={set} required minLength={isSignup ? 8 : undefined} autoComplete={isSignup ? 'new-password' : 'current-password'} className="field pr-10" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-mute hover:text-ink">
                  {show ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}

            <button type="submit" disabled={busy} className="btn btn-dark w-full disabled:opacity-60">
              {busy ? <><Loader2 size={16} className="animate-spin" /> Please wait…</> : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="mt-8 text-sm text-mute text-center">
            {isSignup ? 'Already have an account?' : 'New to Zareen?'}{' '}
            <Link to={other} className="text-ink underline underline-offset-4 hover:text-gold">{isSignup ? 'Log in' : 'Create an account'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
