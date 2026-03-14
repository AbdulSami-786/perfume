import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { useState } from 'react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <div className="text-center py-20 font-serif">Product not found</div>;
  }

  // Mock data for the specific Elyscents look
  const performance = [
    { label: "Concentration", value: "30% to 35%" },
    { label: "Lasting", value: "Up to 8 - 10 Hours" },
    { label: "Sillage", value: "Strong" }
  ];

  return (
    <div className="bg-white text-black font-sans">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Breadcrumb / Back */}
        <button onClick={() => navigate(-1)} className="mb-6 text-sm uppercase tracking-widest text-gray-500 hover:text-black">
          ← Back to Collection
        </button>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Left: Product Images */}
          <div className="md:w-1/2 flex gap-4">
            <div className="hidden md:flex flex-col gap-2 w-20">
              <img src={product.image} className="border border-gray-200 cursor-pointer" alt="thumb" />
              <img src={product.image} className="border border-gray-200 opacity-50 cursor-pointer" alt="thumb" />
            </div>
            <div className="flex-1">
              <img src={product.image} alt={product.name} className="w-full object-cover" />
              <div className="text-center mt-4 font-bold tracking-tighter text-2xl">UNISEX</div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">{product.name}</h1>
            <p className="text-sm text-gray-600 mb-4">Inspired by Luxury Scents</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4 text-yellow-500">
              {"★★★★★"} <span className="text-gray-400 text-xs ml-2">(15 Reviews)</span>
            </div>

            <div className="text-2xl font-bold text-red-600 mb-6">
              Rs. {product.price} 
              <span className="text-gray-400 text-lg line-through ml-3 font-normal">Rs. 3,500</span>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="font-bold border-b pb-2 uppercase text-sm">Description:</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {product.description || "A luxurious blend featuring the smokey power of Oud Wood, combined with rare spices and exotic ingredients for a long-lasting impression."}
              </p>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4 mb-8">
              <h3 className="font-bold border-b pb-2 uppercase text-sm">Performance:</h3>
              <ul className="text-sm space-y-2">
                {performance.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="text-gray-600">• {item.label}:</span>
                    <span className="font-semibold">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center border w-max">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 border-r">-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                  className="w-12 text-center focus:outline-none" 
                />
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 border-l">+</button>
              </div>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  navigate('/cart');
                }}
                className="w-full bg-red-600 text-white font-bold py-4 uppercase tracking-widest hover:bg-black transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-20 border-t pt-10">
          <h2 className="text-2xl font-bold text-center uppercase mb-10">Customer Reviews</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border-b pb-6">
              <div className="flex text-yellow-500 mb-2">★★★★★</div>
              <p className="font-bold">Asad Murtaza</p>
              <p className="text-gray-600 italic">"Very Good Perfume, exactly what I was looking for."</p>
            </div>
            <div className="border-b pb-6">
              <div className="flex text-yellow-500 mb-2">★★★★★</div>
              <p className="font-bold">Ahmed</p>
              <p className="text-gray-600 italic">"The scent is powerful and stays for the whole day."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;