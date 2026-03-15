import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { useState } from 'react';

// Helper function to get product images
const getProductImages = (product) => {
  if (!product) return [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  if (product.mainImage) return [product.mainImage];
  if (product.image) return [product.image];
  return ['/placeholder.jpg'];
};

// Helper function to get main image
const getMainImage = (product) => {
  if (!product) return '/placeholder.jpg';
  if (product.mainImage) return product.mainImage;
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return '/placeholder.jpg';
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-20 font-serif">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <button 
            onClick={() => navigate('/products')} 
            className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Get all images for this product
  const images = getProductImages(product);
  
  // Get related products (same category, exclude current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Mock data for performance
  const performance = [
    { label: "Concentration", value: "30% to 35%" },
    { label: "Lasting", value: "Up to 8 - 10 Hours" },
    { label: "Sillage", value: "Strong" }
  ];

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      image: getMainImage(product) // Use main image for cart
    };
    addToCart(productToAdd, quantity);
  };

  const handleBuyNow = () => {
    const productToAdd = {
      ...product,
      image: getMainImage(product)
    };
    addToCart(productToAdd, quantity);
    navigate('/cart');
  };

  return (
    <div className="bg-white text-black font-sans">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors flex items-center gap-2"
        >
          ← Back to Collection
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Product Images */}
          <div className="lg:w-1/2 flex gap-4">
            {/* Thumbnail Gallery - Only show if multiple images */}
            {images.length > 1 && (
              <div className="hidden lg:flex flex-col gap-2 w-20">
                {images.map((img, index) => (
                  <div 
                    key={index}
                    className={`border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                      selectedImage === index 
                        ? 'border-black' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-20 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Main Image Display */}
            <div className="flex-1">
              <div className="border border-gray-100 overflow-hidden bg-gray-50">
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </div>
              
              {/* Mobile Image Dots */}
              {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 lg:hidden">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        selectedImage === index ? 'w-6 bg-black' : 'w-2 bg-gray-300'
                      }`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              
              <div className="text-center mt-4 font-bold tracking-tighter text-xl">
                {product.category === 'men' ? 'MEN' : product.category === 'women' ? 'WOMEN' : 'UNISEX'}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">{product.name}</h1>
            <p className="text-sm text-gray-600 mb-4">Inspired by Luxury Scents</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400 text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                 <img src="p1.jpeg" alt="" />
              </div>
              <span className="text-gray-400 text-sm">(15 Reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-red-600">{formatPrice(product.price)}</span>
              <span className="text-gray-400 text-lg line-through ml-3 font-normal">
                {formatPrice(Math.round(product.price * 1.3))}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-4 mb-8">
              <h3 className="font-bold border-b pb-2 uppercase text-sm tracking-wider">Description</h3>
              <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line max-h-96 overflow-y-auto">
                {product.description}
              </div>
            </div>

            {/* Performance Metrics - Only for perfumes */}
            {(product.category === 'men' || product.category === 'women') && (
              <div className="space-y-4 mb-8">
                <h3 className="font-bold border-b pb-2 uppercase text-sm tracking-wider">Performance</h3>
                <ul className="text-sm space-y-2">
                  {performance.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-1 border-b border-gray-50">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <span className="text-sm uppercase tracking-wider mr-4">Quantity</span>
                <div className="flex items-center border">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-4 py-2 border-r hover:bg-gray-100 transition disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    readOnly 
                    className="w-14 text-center focus:outline-none py-2"
                    min="1"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="px-4 py-2 border-l hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-red-600 text-white font-bold py-4 uppercase tracking-widest hover:bg-black transition-colors"
              >
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full border-2 border-black text-black font-bold py-4 uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-20 border-t pt-10">
          <h2 className="text-2xl font-bold text-center uppercase mb-10">Customer Reviews</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border-b pb-6">
              <div className="flex text-yellow-400 mb-2 text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="font-bold">Asad Murtaza</p>
              <p className="text-gray-600 italic">"Very Good Perfume, exactly what I was looking for."</p>
              <p className="text-xs text-gray-400 mt-2">Verified Purchase</p>
            </div>
            <div className="border-b pb-6">
              <div className="flex text-yellow-400 mb-2 text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="font-bold">Ahmed</p>
              <p className="text-gray-600 italic">"The scent is powerful and stays for the whole day."</p>
              <p className="text-xs text-gray-400 mt-2">Verified Purchase</p>
            </div>
            <div className="border-b pb-6">
              <div className="flex text-yellow-400 mb-2 text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
              </div>
              <p className="font-bold">Fatima Khan</p>
              <p className="text-gray-600 italic">"Beautiful fragrance, very long lasting. Highly recommended!"</p>
              <p className="text-xs text-gray-400 mt-2">Verified Purchase</p>
            </div>
          </div>
        </div>
       <img src="p1.jpeg" alt="" />
        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t pt-10">
            <h2 className="text-2xl font-bold text-center uppercase mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(relatedProduct => {
                const relatedImage = relatedProduct.mainImage || 
                                   (relatedProduct.images?.[0]) || 
                                   relatedProduct.image || 
                                   '/placeholder.jpg';
                
                return (
                  <div 
                    key={relatedProduct.id} 
                    className="cursor-pointer group"
                    onClick={() => {
                      navigate(`/product/${relatedProduct.id}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="overflow-hidden bg-gray-50 aspect-square">
                      <img 
                        src={"./"+relatedImage} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <h3 className="text-xs font-bold uppercase mt-2 truncate">{relatedProduct.name}</h3>
                    <p className="text-red-600 text-sm font-bold">{formatPrice(relatedProduct.price)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;