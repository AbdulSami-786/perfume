import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ChevronLeft, MessageSquare } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: 'Karachi', paymentMethod: 'cod'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = cartTotal > 5000 ? 0 : 200;
  const grandTotal = cartTotal + shippingCost;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderItems = cartItems.map(item => 
      `• ${item.name} x ${item.quantity} = Rs.${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    const message = `✨ *NEW LUXURY ORDER - ZAREEN FRAGRANCE* ✨
    
👤 *Client Details:*
• Name: ${formData.name}
• Phone: ${formData.phone}
• Address: ${formData.address}, ${formData.city}
• Payment: ${formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}

📦 *Selection:*
${orderItems}

📊 *Summary:*
• Subtotal: Rs.${cartTotal.toLocaleString()}
• Shipping: ${shippingCost === 0 ? 'Complimentary' : 'Rs.' + shippingCost.toLocaleString()}
• *Grand Total: Rs.${grandTotal.toLocaleString()}*

Order Time: ${new Date().toLocaleString('en-PK')}

Thank you for choosing Zareen Fragrance.`;

    const phoneNumber = '923711191925'; // Replace with your actual WhatsApp number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    clearCart();
    window.open(url, '_blank');
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-[#FCFCFC] min-h-screen text-black font-sans pb-20">
      {/* 1. Refined Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-serif italic tracking-widest uppercase">Checkout</h1>
          <div className="w-12 h-px bg-black mx-auto mt-4"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* 2. Form Section */}
          <div className="lg:w-2/3">
            <h2 className="text-xs tracking-[0.3em] font-bold uppercase mb-10 pb-4 border-b">Shipping & Client Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Full Name</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    placeholder="Enter your name"
                    className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Phone Number</label>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                    placeholder="+92 XXX XXXXXXX"
                    className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Email Address</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="email@example.com"
                    className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">City</label>
                  <select
                    name="city" value={formData.city} onChange={handleChange} required
                    className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black bg-transparent"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Delivery Address</label>
                <textarea
                  name="address" value={formData.address} onChange={handleChange} required rows="2"
                  placeholder="Street address, Apartment, Landmark"
                  className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black transition-colors resize-none"
                ></textarea>
              </div>

              <div className="pt-8">
                <h3 className="text-[10px] tracking-widest uppercase text-gray-400 font-bold mb-6">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="hidden" />
                      <span className="text-[10px] tracking-widest font-bold uppercase">Cash on Delivery</span>
                    </div>
                  </label>
                  
                

                </div>
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-black text-white py-5 text-[11px] tracking-[0.4em] font-bold uppercase hover:bg-gray-900 transition flex items-center justify-center gap-4"
              >
                {isSubmitting ? 'SECURELY REDIRECTING...' : <><MessageSquare size={16}/> Complete via WhatsApp</>}
              </button>
            </form>
          </div>

          {/* 3. Order Summary Panel */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-100 p-8 sticky top-10">
              <h3 className="text-xs tracking-[0.3em] font-bold uppercase mb-8">Your Selection</h3>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img src={item.mainImage} alt={item.name} className="w-16 h-20 object-cover grayscale hover:grayscale-0 transition-all" />
                    <div className="flex-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase">Qty: {item.quantity}</p>
                      <p className="text-xs font-serif italic mt-1">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-[10px] tracking-widest uppercase border-t pt-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>Rs.{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : `Rs.${shippingCost.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-4 mt-2">
                  <span>Grand Total</span>
                  <span className="font-serif italic text-lg tracking-normal">Rs.{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <ShieldCheck size={16} strokeWidth={1} />
                  <span className="text-[9px] tracking-widest uppercase">Authenticity Guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Truck size={16} strokeWidth={1} />
                  <span className="text-[9px] tracking-widest uppercase">Premium Secure Packaging</span>
                </div>
              </div>

              <Link to="/cart" className="flex items-center justify-center gap-2 text-[9px] tracking-widest uppercase font-bold mt-10 hover:text-gray-500 transition">
                <ChevronLeft size={14} /> Back to Dressing Room
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Loading Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-6">
          <div className="text-center max-w-xs">
            <div className="w-16 h-px bg-black mx-auto mb-8 animate-pulse"></div>
            <h3 className="text-lg font-serif italic mb-4">Finalizing Your Request</h3>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 leading-loose">
              You are being directed to our WhatsApp concierge to finalize your luxury delivery.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;