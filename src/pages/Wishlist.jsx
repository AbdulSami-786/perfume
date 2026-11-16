import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WishlistGrid from '../components/WishlistGrid';
import PageHeader from '../components/PageHeader';

const Wishlist = () => {
  const { user } = useAuth();
  useEffect(() => { document.title = 'Wishlist | Zareen Fragrance'; }, []);

  return (
    <div>
      <PageHeader title="My Wishlist" subtitle="The fragrances you’ve fallen for." crumbs={[{ label: 'Wishlist' }]} />
      <div className="container mx-auto px-5 py-10 md:py-14">
        {!user && (
          <p className="mb-8 text-sm text-mute bg-white border border-line/70 px-5 py-4 text-center">
            Saved on this device. <Link to="/login?next=/wishlist" className="text-ink underline underline-offset-4 hover:text-gold">Log in</Link> to keep your wishlist on every device.
          </p>
        )}
        <WishlistGrid />
      </div>
    </div>
  );
};

export default Wishlist;
