import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="container mx-auto px-5 py-28 md:py-40 text-center">
    <p className="eyebrow mb-5">Error 404</p>
    <h1 className="text-6xl md:text-8xl mb-6">Lost in the scent</h1>
    <p className="text-mute max-w-md mx-auto mb-10">
      The page you're looking for has drifted away. Let's get you back to something beautiful.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/" className="btn btn-dark">Back to Home</Link>
      <Link to="/products" className="btn btn-outline">Shop the Collection</Link>
    </div>
  </section>
);

export default NotFound;
