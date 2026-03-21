import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Clock, Award } from 'lucide-react';

const Home = () => {
  const { addToCart, cartItems } = useCart();
  const [addedToCart, setAddedToCart] = useState({});
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') {
      current.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const dealProduct = {
    id: 'deal1',
    name: "Eid Special| 10%Off PERFUMES",
    originalPrice: 5600,
    price: 4400,
    image: "b4.jpeg",
    description: "Get all premium fragrances in 10% off "
  };

  const categories = [
    { name: "Reed Diffuser For House Hold", image: "b3.jpeg", link: "/products?category=bestseller" },
    { name: "PERFUME FOR HER", image: "b2.jpeg", link: "/products?category=women" },
    { name: "PERFUME FOR HIM", image: "b1.jpeg", link: "/products?category=men" },
  ];

  // Handle add to cart with animation
  const handleAddToCart = (product) => {
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
    <div className="bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[80vh] bg-black flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 opacity-50">
           <img src={dealProduct.image} alt="Hero" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-white max-w-2xl">
          <h2 className="text-xs tracking-[0.5em] mb-4 uppercase font-bold">Zareen Fragrance Exclusive</h2>
          <h1 className="text-5xl md:text-7xl font-serif mb-6 italic leading-tight">Eid Special</h1>
          <p className="text-lg md:text-xl mb-8 font-light tracking-wide">{dealProduct.description}</p>
          <Link 
            to="/products" 
            className="inline-block bg-white text-black px-10 py-4 hover:bg-transparent hover:text-white border border-white transition-all duration-300 tracking-[0.2em] text-xs uppercase font-bold"
          >
            Discover the Collection
          </Link>
        </div>
      </section>

      {/* 2. HORIZONTAL SCROLLING CRAZY DEALS */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-serif italic mb-2">Crazy Deals</h2>
              <div className="w-20 h-1 bg-black"></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="p-2 border border-black hover:bg-black hover:text-white transition"><ChevronLeft size={20}/></button>
              <button onClick={() => scroll('right')} className="p-2 border border-black hover:bg-black hover:text-white transition"><ChevronRight size={20}/></button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 scrollbar-hide snap-x no-scrollbar pb-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products && products.map((product) => {
              const quantity = getItemQuantity(product.id);
              
              return (
                <div key={product.id} className="min-w-[280px] md:min-w-[350px] snap-start group bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  <Link to={`/product/${product.id}`} className="relative overflow-hidden aspect-[4/5] block">
                    <span className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] tracking-widest z-10 font-bold">SALE</span>
                    {quantity > 0 && (
                      <div className="absolute top-4 right-4 bg-black text-white w-6 h-6 flex items-center justify-center text-[10px] font-bold z-10">
                        {quantity}
                      </div>
                    )}
                    <img 
                      src={product.mainImage} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </Link>
                  <div className="p-6 text-center">
                    <Link to={`/product/${product.id}`}>
                      <h4 className="font-bold text-sm tracking-widest uppercase mb-2 truncate hover:text-gray-600 transition">
                        {product.name}
                      </h4>
                    </Link>
                    <div className="flex justify-center items-center gap-3 mb-6">
                      <span className="text-gray-400 line-through text-sm font-light italic">
                        Rs.{product.price + 1200}
                      </span>
                      <span className="text-lg font-bold text-black font-serif">
                        Rs.{product.price}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className={`w-full py-3 text-[10px] tracking-[0.3em] uppercase transition duration-300 ${
                        addedToCart[product.id]
                          ? 'bg-gray-600 text-white'
                          : 'border border-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {addedToCart[product.id] ? '✓ ADDED TO CART' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. NEW CONTENT: WHY CHOOSE US */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Truck className="mb-4 text-gray-700" size={32} />
            <h5 className="font-bold text-xs tracking-widest uppercase mb-2">Fast Delivery</h5>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Across Pakistan</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="mb-4 text-gray-700" size={32} />
            <h5 className="font-bold text-xs tracking-widest uppercase mb-2">100% Original</h5>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Authentic Scents</p>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="mb-4 text-gray-700" size={32} />
            <h5 className="font-bold text-xs tracking-widest uppercase mb-2">Long Lasting</h5>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">12+ Hours Sillage</p>
          </div>
          <div className="flex flex-col items-center">
            <Award className="mb-4 text-gray-700" size={32} />
            <h5 className="font-bold text-xs tracking-widest uppercase mb-2">Premium Quality</h5>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">French Ingredients</p>
          </div>
        </div>
      </section>

      {/* 4. CATEGORY BANNERS */}
      <section className="space-y-4 mb-20 px-4">
        {categories.map((cat, idx) => (
          <Link key={idx} to={cat.link} className="relative block h-72 md:h-[450px] w-full group overflow-hidden">
            <img 
              src={cat.image} 
              alt={cat.name} 
              className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition duration-1000 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
              <h3 className="text-4xl md:text-6xl font-serif italic font-light tracking-[0.1em] mb-4">
                {cat.name}
              </h3>
              <span className="text-[10px] tracking-[0.5em] border-b border-white pb-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                SHOP NOW
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* 5. TESTIMONIALS */}
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
         <div className="text-yellow-500 mb-6 text-2xl tracking-widest">★★★★★</div>
         <p className="text-2xl md:text-3xl italic font-serif text-gray-800 mb-8 leading-relaxed">
           "The sillage and longevity of Zareen Fragrances are unmatched. It feels like wearing pure luxury every single day."
         </p>
         <h5 className="font-bold tracking-[0.4em] text-xs">— AYESHA KHAN, KARACHI</h5>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif italic mb-8 tracking-widest">ZAREEN FRAGRANCE</h2>
          <div className="flex justify-center space-x-12 text-[10px] tracking-[0.3em] font-bold mb-12">
            <Link to="/products" className="hover:text-gray-400 transition">COLLECTIONS</Link>
            <Link to="/about" className="hover:text-gray-400 transition">OUR STORY</Link>
            <Link to="/contact" className="hover:text-gray-400 transition">CONTACT</Link>
          </div>
          <p className="text-gray-500 text-[10px] tracking-widest">
            © {new Date().getFullYear()} ZAREEN FRAGRANCE | CRAFTED FOR ELEGANCE
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;