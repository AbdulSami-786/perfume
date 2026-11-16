import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const NewsletterForm = ({ source = 'footer' }) => {
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState(''); // honeypot — real visitors never see or fill this
  const [state, setState] = useState({ status: 'idle', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'loading', message: '' });
    try {
      const data = await api('subscribe', { email, source, hp });
      setState({
        status: 'done',
        message: data.already ? 'You’re already on the list — thank you!' : 'Welcome to the Zareen list. Watch your inbox!',
      });
      setEmail('');
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-md">
      <label htmlFor={`news-${source}`} className="sr-only">Email address</label>
      <div className="flex border-b border-white/40 focus-within:border-white transition-colors">
        <input
          id={`news-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          autoComplete="email"
          className="flex-1 min-w-0 bg-transparent py-3.5 text-white placeholder:text-white/45 outline-none"
        />
        <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="px-1 text-[0.7rem] tracking-[0.22em] uppercase font-medium text-white hover:text-gold-light disabled:opacity-60 inline-flex items-center gap-2 transition-colors"
        >
          {state.status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <>Subscribe <ArrowRight size={14} /></>}
        </button>
      </div>
      <p role="status" aria-live="polite" className={`mt-3 text-xs min-h-[1.25rem] flex items-center gap-1.5 ${state.status === 'error' ? 'text-red-300' : 'text-gold-light'}`}>
        {state.status === 'done' && <Check size={14} />}
        {state.message}
      </p>
    </form>
  );
};

export default NewsletterForm;
