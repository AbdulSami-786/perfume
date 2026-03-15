// pages/Product.jsx
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Product = () => {
  const { addToCart, cartItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [addedToCart, setAddedToCart] = useState({});

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleAddToCart = (product) => {
    // Pass the product object and quantity (defaults to 1 in your context)
    addToCart(product);
    
    // Show temporary "Added" state
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  // Check if a product is in cart to show quantity
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Page Header */}
      <div className="py-12 md:py-20 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight text-black mb-4">
          All Collections
        </h1>
        <div className="w-24 h-px bg-black mx-auto mb-6"></div>
        <p className="text-xs tracking-[0.4em] uppercase text-gray-500 font-bold">
          Signature Scents & Timeless Elegance
        </p>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter and Sort Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-100 pb-6 gap-6">
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-[10px] tracking-[0.3em] uppercase font-bold transition-all pb-1 border-b-2 ${
                  selectedCategory === category
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-black'
                }`}
              >
                {category === 'all' ? 'View All' : category}
              </button>
            ))}
          </div>

          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent text-[10px] tracking-[0.2em] font-bold uppercase pr-8 py-2 focus:outline-none cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="name">Sort: A-Z</option>
              <option value="price-low">Price: Low-High</option>
              <option value="price-high">Price: High-Low</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 italic font-serif">No fragrances found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12">
            {sortedProducts.map(product => {
              const quantity = getItemQuantity(product.id);
              
              return (
                <div key={product.id} className="group flex flex-col items-center">
                  {/* Product Image Area */}
                  <Link to={`/product/${product.id}`} className="relative w-full aspect-[4/5] bg-[#F8F8F8] overflow-hidden mb-6">
                    <img 
                      src={product.mainImage} 
                      alt={product.name} 
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-0 left-0 bg-black text-white px-3 py-1.5 text-[8px] tracking-widest font-bold">
                        SALE
                      </div>
                    )}
                    {quantity > 0 && (
                      <div className="absolute top-0 right-0 bg-black text-white w-6 h-6 flex items-center justify-center text-[10px] font-bold">
                        {quantity}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <button className="w-full bg-white text-black text-[10px] font-bold tracking-[0.2em] py-3 shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        QUICK VIEW
                      </button>
                    </div>
                  </Link>

                  {/* Product Text Info */}
                  <div className="text-center px-2 flex flex-col items-center flex-grow">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">{product.category}</p>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm md:text-base font-serif tracking-wide text-black mb-3 line-clamp-2 uppercase">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="mb-6">
                      {product.originalPrice ? (
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 line-through text-xs font-light tracking-tighter italic">Rs.{product.originalPrice}</span>
                          <span className="text-base font-bold text-black font-serif">Rs.{product.price}</span>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-black font-serif">Rs.{product.price}</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`w-full max-w-[180px] py-3 text-[10px] tracking-[0.3em] font-bold uppercase transition-all ${
                        addedToCart[product.id]
                          ? 'bg-gray-600 text-white'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {addedToCart[product.id] ? '✓ ADDED' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {sortedProducts.length > 0 && (
          <div className="flex justify-center mt-20 border-t border-gray-100 pt-10 gap-8">
            <button className="text-[10px] tracking-widest font-bold text-gray-400 hover:text-black transition">PREVIOUS</button>
            <div className="flex gap-4 items-center">
              <span className="text-[12px] font-bold border-b border-black pb-1">01</span>
              <span className="text-[12px] text-gray-300">02</span>
              <span className="text-[12px] text-gray-300">03</span>
            </div>
            <button className="text-[10px] tracking-widest font-bold text-black hover:text-gray-500 transition">NEXT</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;