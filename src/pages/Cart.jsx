// pages/Cart.jsx
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'; // <-- replaced X with Trash2

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const shippingCost = cartTotal > 5000 ? 0 : 200;
  
  // Calculate discounted total if promo is applied
  const discountedTotal = promoApplied ? cartTotal * 0.9 : cartTotal;
  const grandTotal = discountedTotal + shippingCost;

  const handlePromoApply = () => {
    if (promoCode.toUpperCase() === 'ZAREEN10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid invitation code');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag size={48} strokeWidth={1} className="mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-serif italic mb-4 uppercase tracking-widest">Your Bag is Empty</h2>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-8">Discover your next signature scent</p>
          <Link 
            to="/products" 
            className="inline-block bg-black text-white px-10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-gray-800 transition"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFCFC] min-h-screen text-black font-sans pb-20">
      {/* 1. Minimal Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-serif italic tracking-widest uppercase">Shopping Bag</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mt-4">
            {cartItems.length} {cartItems.length === 1 ? 'Selection' : 'Selections'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* 2. Items List */}
          <div className="lg:w-2/3">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] tracking-[0.2em] font-bold uppercase text-gray-400">
              <div className="col-span-7">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>

            <div className="divide-y divide-gray-100">
              {cartItems.map(item => (
                <div key={item.id} className="py-8 group">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Image & Detail */}
                    <div className="col-span-12 md:col-span-7 flex items-center gap-6">
                      <div className="w-24 h-32 bg-gray-50 overflow-hidden">
                        <img 
                          src={item.mainImage} 
                          alt={item.name} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold tracking-widest uppercase mb-1">{item.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-4">{item.category}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 w-fit">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:bg-gray-50 transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-4 text-[11px] font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 transition"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Price */}
                    <div className="hidden md:block md:col-span-2 text-center">
                      <p className="text-xs font-serif italic text-gray-500">Rs.{item.price.toLocaleString()}</p>
                    </div>

                    {/* Total & Remove */}
                    <div className="col-span-12 md:col-span-3 flex md:flex-col justify-between items-center md:items-end gap-4">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-black hover:text-gray-600 transition order-2 md:order-1" // changed to always black, bold stroke
                      >
                        <Trash2 size={18} strokeWidth={2} /> {/* bold dustbin icon */}
                      </button>
                      <p className="font-serif italic text-sm order-1 md:order-2">
                        Rs.{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/products" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase mt-10 hover:text-gray-500 transition">
              <ArrowLeft size={14} /> Back to Collection
            </Link>
          </div>

          {/* 3. Summary Section */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-100 p-8 sticky top-10">
              <h3 className="text-xs tracking-[0.3em] font-bold uppercase mb-8">Summary</h3>
              
              {/* Promo Code Boutique Style */}
              <div className="mb-10">
                <div className="flex border-b border-gray-200 focus-within:border-black transition-colors">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="INVITATION CODE"
                    className="flex-1 bg-transparent py-2 text-[10px] tracking-widest uppercase outline-none"
                  />
                  <button
                    onClick={handlePromoApply}
                    className="text-[10px] font-bold tracking-widest uppercase px-4 hover:text-gray-500 transition"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-[9px] tracking-widest uppercase mt-2">{promoError}</p>}
                {promoApplied && <p className="text-gray-400 text-[9px] tracking-widest uppercase mt-2">Privilege Discount Applied</p>}
              </div>

              {/* Breakdown */}
              <div className="space-y-4 text-[10px] tracking-[0.2em] uppercase border-b border-gray-50 pb-8 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>Rs.{cartTotal.toLocaleString()}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-gray-400 italic">
                    <span>Discount (10%)</span>
                    <span>-Rs.{(cartTotal * 0.1).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : `Rs.${shippingCost}`}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[8px] italic text-gray-400 normal-case tracking-normal">
                    Complimentary delivery for orders above Rs.5,000
                  </p>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-10">
                <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Estimated Total</span>
                <span className="text-xl font-serif italic">
                  Rs.{grandTotal.toLocaleString()}
                </span>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-black text-white text-center py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-gray-900 transition shadow-xl"
              >
                Proceed to Checkout
              </Link>

              {/* Trust Badges */}
              <div className="mt-10 flex justify-center gap-6 opacity-20 grayscale">
                <span className="text-xs uppercase tracking-tighter font-bold">Secure</span>
                <span className="text-xs uppercase tracking-tighter font-bold">Authentic</span>
                <span className="text-xs uppercase tracking-tighter font-bold">Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;