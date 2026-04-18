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

// Math function to calculate 10% discount
const applyDiscount = (originalPrice) => {
  const discountRate = 0.10; // 10% discount
  const discountedPrice = originalPrice - (originalPrice * discountRate);
  return Math.round(discountedPrice); // Round to nearest whole number
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Swipe state for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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

  // Apply 10% discount to product price
  const discountedPrice = applyDiscount(product.price);
  
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
      price: discountedPrice, // Use discounted price for cart
      image: getMainImage(product) // Use main image for cart
    };
    addToCart(productToAdd, quantity);
  };

  const handleBuyNow = () => {
    const productToAdd = {
      ...product,
      price: discountedPrice, // Use discounted price for cart
      image: getMainImage(product)
    };
    addToCart(productToAdd, quantity);
    navigate('/cart');
  };

  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && selectedImage < images.length - 1) {
        // Swipe left -> next image
        setSelectedImage(prev => prev + 1);
      } else if (diff < 0 && selectedImage > 0) {
        // Swipe right -> previous image
        setSelectedImage(prev => prev - 1);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="bg-white text-black font-sans">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors flex items-center gap-2"
        >
          ← Back to Collection
        </button>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-12">
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
            
            {/* Main Image Display - with swipe support */}
            <div 
              className="flex-1"
              onTouchStart={images.length > 1 ? handleTouchStart : undefined}
              onTouchMove={images.length > 1 ? handleTouchMove : undefined}
              onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
            >
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
              
              <div className="text-center mt-4 font-bold tracking-tighter text-base sm:text-xl">
                {product.category === 'men' ? 'MEN' : product.category === 'women' ? 'WOMEN' : 'UNISEX'}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-1/2">
            <h1 className="text-xl sm:text-3xl font-bold uppercase tracking-tight mb-2">{product.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">Inspired by Luxury Scents</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex text-yellow-400 text-base sm:text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                 <img src="p1.jpeg" alt="" />
              </div>
              <span className="text-gray-400 text-xs sm:text-sm">(15 Reviews)</span>
            </div>

            {/* Price with 10% Discount */}
            <div className="mb-4">
              <span className="text-xl sm:text-3xl font-bold text-red-600">{formatPrice(discountedPrice)}</span>
              <span className="text-gray-400 text-base sm:text-lg line-through ml-3 font-normal">
                {formatPrice(product.price)}
              </span>
              <span className="ml-3 bg-red-100 text-red-600 text-xs sm:text-sm px-2 py-1 rounded font-semibold">
                -10% OFF
              </span>
            </div>

            {/* Description */}
            <div className="space-y-3 mb-6">
              <h3 className="font-bold border-b pb-1 uppercase text-xs sm:text-sm tracking-wider">Description</h3>
              <div className="text-gray-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line max-h-96 overflow-y-auto">
                {product.description}
              </div>
            </div>

            {/* Performance Metrics - Only for perfumes */}
            {(product.category === 'men' || product.category === 'women') && (
              <div className="space-y-3 mb-6">
                <h3 className="font-bold border-b pb-1 uppercase text-xs sm:text-sm tracking-wider">Performance</h3>
                <ul className="text-xs sm:text-sm space-y-1">
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <span className="text-xs uppercase tracking-wider mr-4">Quantity</span>
                <div className="flex items-center border">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-3 py-1 sm:px-4 sm:py-2 border-r hover:bg-gray-100 transition disabled:opacity-50 text-sm"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    readOnly 
                    className="w-12 text-center focus:outline-none py-1 sm:py-2 text-sm"
                    min="1"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="px-3 py-1 sm:px-4 sm:py-2 border-l hover:bg-gray-100 transition text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-red-600 text-white font-bold py-2 sm:py-4 text-sm sm:text-base uppercase tracking-widest hover:bg-black transition-colors"
              >
                Add to Cart - {formatPrice(discountedPrice * quantity)}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full border-2 border-black text-black font-bold py-2 sm:py-4 text-sm sm:text-base uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                Buy Now - {formatPrice(discountedPrice * quantity)}
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-10 sm:mt-20 border-t pt-5 sm:pt-10">
          <h2 className="text-lg sm:text-2xl font-bold text-center uppercase mb-6 sm:mb-10">Customer Reviews</h2>
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <div className="border-b pb-4 sm:pb-6">
              <div className="flex text-yellow-400 mb-1 text-base sm:text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="font-bold text-sm sm:text-base">Asad Murtaza</p>
              <p className="text-gray-600 italic text-xs sm:text-sm">"Very Good Perfume, exactly what I was looking for."</p>
              <p className="text-xs text-gray-400 mt-1">Verified Purchase</p>
            </div>
            <div className="border-b pb-4 sm:pb-6">
              <div className="flex text-yellow-400 mb-1 text-base sm:text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="font-bold text-sm sm:text-base">Ahmed</p>
              <p className="text-gray-600 italic text-xs sm:text-sm">"The scent is powerful and stays for the whole day."</p>
              <p className="text-xs text-gray-400 mt-1">Verified Purchase</p>
            </div>
            <div className="border-b pb-4 sm:pb-6">
              <div className="flex text-yellow-400 mb-1 text-base sm:text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
              </div>
              <p className="font-bold text-sm sm:text-base">Fatima Khan</p>
              <p className="text-gray-600 italic text-xs sm:text-sm">"Beautiful fragrance, very long lasting. Highly recommended!"</p>
              <p className="text-xs text-gray-400 mt-1">Verified Purchase</p>
            </div>
          </div>
        </div>
       <img src="p1.jpeg" alt="" />
        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-20 border-t pt-5 sm:pt-10">
            <h2 className="text-lg sm:text-2xl font-bold text-center uppercase mb-6 sm:mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {relatedProducts.map(relatedProduct => {
                const relatedImage = relatedProduct.mainImage || 
                                   (relatedProduct.images?.[0]) || 
                                   relatedProduct.image || 
                                   '/placeholder.jpg';
                const relatedDiscountedPrice = applyDiscount(relatedProduct.price);
                
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
                     src={`../../${relatedImage}`} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <h3 className="text-[11px] sm:text-xs font-bold uppercase mt-1 truncate">{relatedProduct.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-red-600 text-[11px] sm:text-sm font-bold">{formatPrice(relatedDiscountedPrice)}</p>
                      <p className="text-gray-400 text-[10px] sm:text-xs line-through">{formatPrice(relatedProduct.price)}</p>
                    </div>
                    <span className="text-green-600 text-[10px] sm:text-xs font-semibold">-10% OFF</span>
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