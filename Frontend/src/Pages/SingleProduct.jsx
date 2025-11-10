import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- START: Single-File Component Placeholders ---

// Placeholder for missing components/libraries
const Navbar = () => (
  <header className="bg-white shadow-md sticky top-0 z-30">
    <div className="container mx-auto px-4 py-4 text-center font-bold text-xl text-[#070A52]">
      Product Page
    </div>
  </header>
);
const Footer = () => (
  <footer className="bg-gray-100 border-t mt-12 py-6 text-center text-sm text-gray-500">
    &copy; {new Date().getFullYear()} Single Product App. All rights reserved.
  </footer>
);

// Placeholder for HashLoader (simple spinning text)
const HashLoader = ({ color, size }) => (
  <div style={{ color, fontSize: `${size / 2}px` }} className="animate-spin text-6xl">
    ⚙️
  </div>
);

// Icon Helper for Unicode characters
const IconMap = {
    // Stars
    'Star': '★',
    'RegStar': '☆',
    'StarHalfAlt': '½',
    // Actions/Status
    'ShoppingCart': '🛒',
    'Bolt': '⚡',
    'Heart': '♥',
    'RegHeart': '♡',
    'CheckCircle': '✓',
    'Truck': '🚚',
    'ShieldAlt': '🛡️',
    // Reviews
    'RegThumbsUp': '👎', // Using 'RegThumbsUp' for 'Like' button placeholder
    'Reply': '↩️',
    'Times': '✕',
    'CommentDots': '💬',
    // Chevrons
    'ChevronDown': '▼',
    'ChevronUp': '▲'
};

// Generic Icon component wrapper
const getIcon = (name, props = {}) => {
  const iconChar = IconMap[name] || '?';
  return (
    <span className={props.className} style={props.style}>
      {iconChar}
    </span>
  );
};
// --- END: Single-File Component Placeholders ---


// Hardcoded API URL (replacing import.meta.env)
const BASE_API_URL = "http://localhost:3000";

/* -----------------------------
   Helpers & UI Bits
------------------------------*/
const getMediaItems = (product) => {
  const arr = [];
  if (product?.images?.length) product.images.forEach(url => arr.push({ type: "image", url }));
  if (product?.videos?.length) product.videos.forEach(url => arr.push({ type: "video", url }));
  return arr;
};

const RatingStars = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const key = `star-${i}`;
    if (rating >= i) {
      stars.push(<span key={key} className="text-yellow-400">★</span>);
    } else if (rating >= i - 0.5) {
      stars.push(<span key={key} className="text-yellow-400">½</span>);
    } else {
      stars.push(<span key={key} className="text-gray-300">☆</span>);
    }
  }
  return <div className="flex items-center space-x-0.5">{stars}</div>;
};

// Mock Data structure for development
const mockProduct = {
  _id: "prod123",
  name: "Advanced Quantum Computing Processor",
  description: "Experience the next generation of computing with our Advanced Quantum Processor. This chip utilizes superconducting qubits to perform complex calculations at speeds currently unattainable by classical computers. It features enhanced error correction capabilities and a modular architecture allowing for seamless integration into various quantum frameworks. Ideal for research, complex simulations, and secure cryptography applications. The initial testing has shown phenomenal stability and reduced decoherence times. This product is a leap forward in the field of computational science and represents thousands of hours of rigorous engineering and scientific innovation. Its compact design is optimized for both laboratory and industrial environments. This is a crucial tool for anyone pushing the boundaries of technology and physics. The processor comes with a comprehensive SDK and full documentation.",
  price: 1500000,
  oldPrice: 1900000,
  rating: 4.7,
  reviewCount: 45,
  stock: 12,
  attributes: [
    { name: "Processor Type", value: "Superconducting Qubit" },
    { name: "Qubit Count", value: "64" },
    { name: "Clock Speed", value: "N/A (Quantum)" },
    { name: "Integration", value: "Modular Interface" },
    { name: "Cooling Req.", value: "Cryogenic (Included)" }
  ],
  images: [
    "https://placehold.co/800x600/0d1170/ffffff?text=Product+Image+1",
    "https://placehold.co/800x600/070A52/ffffff?text=Product+Image+2",
    "https://placehold.co/800x600/0d1170/ffffff?text=Product+Image+3",
  ],
  videos: [],
  reviews: [
    { _id: "r1", user: "Alice", rating: 5, comment: "Mind-blowing performance, a true game changer!", date: "2024-09-01" },
    { _id: "r2", user: "Bob", rating: 4, comment: "Great stability, documentation could be better.", date: "2024-09-10" },
  ]
};

// Component for the Product Description with See More/Less logic
const ProductDescription = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);
  
  // Effect to determine if clamping is needed (check if scrollHeight > clientHeight on initial render)
  useEffect(() => {
    if (contentRef.current) {
        // We only check if clamping is needed on large screens where max-h-40 is applied.
        // On small screens, we assume the content is always visible or we let it scroll.
        if (contentRef.current.scrollHeight > contentRef.current.clientHeight && contentRef.current.clientHeight > 0) {
            setIsClamped(true);
        }
    }
  }, [description]);

  const maxHeight = useMemo(() => {
    if (isExpanded) {
      // Return scrollHeight if expanded, guaranteeing full content visibility
      return contentRef.current?.scrollHeight || 'auto'; 
    }
    // Set a clamped height (10rem) when collapsed on md and up screens
    return isClamped ? '10rem' : 'auto'; 
  }, [isExpanded, isClamped]);

  if (!description) return null;

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h3 className="text-xl font-bold mb-3 text-gray-800">Product Details</h3>
      <div className="relative">
        
        {/* The motion.div animates maxHeight and opacity for a smooth fade/expand effect */}
        <motion.div
          ref={contentRef}
          initial={{ maxHeight: isClamped ? '10rem' : 'auto', opacity: 1 }}
          animate={{
            maxHeight: maxHeight,
            opacity: isExpanded ? 1 : (isClamped ? 0.8 : 1), // slight fade when clamped
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`overflow-hidden text-gray-700 leading-relaxed text-base transition-opacity duration-500
            ${isClamped ? 'md:max-h-40 md:overflow-hidden' : ''}
          `}
        >
          <p>{description}</p>
        </motion.div>

        {(isClamped || isExpanded) && (
          <div className="pt-2">
            {/* Faded overlay for clamped state on tablet/desktop */}
            {!isExpanded && isClamped && (
              <div className="absolute bottom-6 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center text-blue-600 font-semibold transition duration-300 hover:text-blue-700 mt-2`}
            >
              {isExpanded ? (
                <>
                  {getIcon('ChevronUp', { className: 'mr-2 text-sm' })} See Less
                </>
              ) : (
                <>
                  {getIcon('ChevronDown', { className: 'mr-2 text-sm' })} See More
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};


/* -----------------------------
   Main Component
------------------------------*/
const SingleProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // MOCK STATE - Replace with actual API fetch logic
  const [product, setProduct] = useState(mockProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  // Placeholder for fetching product data
  useEffect(() => {
    // In a real app, you would fetch data here
    // const fetchProduct = async () => { ... }
    // fetchProduct();
  }, [productId]);

  const mediaItems = useMemo(() => getMediaItems(product), [product]);

  // Handler for image selection (simulated)
  const selectMediaItem = (index) => {
    setSelectedImageIndex(index);
  };

  const currentMedia = mediaItems[selectedImageIndex];

  // Placeholder for submitting a review
  const submitReview = () => {
    // NOTE: Replaced alert() with console log and modal close due to platform restrictions.
    if (!newReview.comment.trim() || newReview.rating < 1) {
      console.log("Validation error: Please provide a rating and a comment."); 
      return;
    }
    console.log("Submitting review:", newReview);
    // Add API call logic here
    setShowReviewForm(false);
    setNewReview({ rating: 5, comment: "" });
    // In a real app, refresh product data to show the new review
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center p-10 mt-20">
        <h1 className="text-2xl font-bold text-red-600">Product Not Found</h1>
        <p className="text-gray-600 mt-2">The product ID {productId} could not be loaded.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">Go to Home</button>
      </div>
    );
  }

  const discountPercentage = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  
  // Safety check for reviews array
  const reviews = product.reviews || [];


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        
        <main className="container mx-auto px-4 sm:px-6 py-8 lg:py-12">
          
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            
            {/* Image Gallery (Col 1) */}
            <div className="lg:sticky lg:top-8 self-start">
              <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-6 max-h-[600px] flex flex-col">
                
                {/* Main Image/Video Area */}
                <div className="flex-1 min-h-[300px] overflow-hidden rounded-lg mb-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImageIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      {currentMedia?.type === "image" ? (
                        <img
                          src={currentMedia.url}
                          alt={`${product.name} - ${selectedImageIndex + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/cccccc/333333?text=Image+Unavailable"; }}
                        />
                      ) : currentMedia?.type === "video" ? (
                        <video controls src={currentMedia.url} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-lg text-gray-500">
                          No Media Selected
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Thumbnails (Mobile: below main image, scrollable row; Desktop: fixed on left) */}
                <div className="flex space-x-3 overflow-x-auto lg:overflow-x-visible lg:space-x-0 lg:flex-col lg:space-y-3 lg:w-full">
                  {mediaItems.map((item, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectMediaItem(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition duration-200 ${
                        selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-500/50 shadow-md"
                          : "border-gray-200 hover:border-blue-300"
                      } lg:w-full lg:h-20 lg:mb-2`}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/cccccc/333333?text=Thumb"; }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 text-xs">
                          VIDEO
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details (Col 2) */}
            <div className="mt-6 lg:mt-0">
              
              {/* Product Header */}
              <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
                <h1 className="text-3xl font-extrabold text-[#070A52] mb-2">{product.name}</h1>
                
                {/* Rating and Reviews */}
                <div className="flex items-center mb-4">
                  <RatingStars rating={product.rating} />
                  <span className="ml-2 text-gray-600 font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="ml-4 text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                    ({product.reviewCount} Reviews)
                  </span>
                </div>
                
                {/* Pricing */}
                <div className="flex items-end mb-4">
                  <span className="text-4xl font-extrabold text-red-600 mr-3">
                    ${product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through mr-3">
                        ${product.oldPrice.toLocaleString()}
                      </span>
                      <span className="text-base font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Status */}
                <p className={`text-base font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getIcon('CheckCircle', { className: 'inline mr-2 text-lg' })}
                  {product.stock > 0 ? (product.stock > 10 ? "In Stock" : `Low Stock: Only ${product.stock} left!`) : "Out of Stock"}
                </p>
                
              </div>
              
              {/* Product Attributes / Specifications */}
              <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Key Specifications</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">{attr.name}</dt>
                      <dd className="text-base font-semibold text-gray-900">{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Action Bar (Visible static on Desktop) */}
              <div className="hidden lg:block p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
                 {/* Quantity Selector */}
                <div className="flex items-center mb-6">
                  <label className="text-gray-700 font-semibold mr-4">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-3 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-12 text-center border-x border-gray-300 py-3 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-3 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition"
                  >
                    {getIcon('ShoppingCart', { className: 'mr-3 text-xl' })} Add to Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition"
                  >
                    {getIcon('Bolt', { className: 'mr-3 text-xl' })} Buy Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-4 rounded-xl transition text-xl ${
                      isWishlisted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {isWishlisted ? getIcon('Heart') : getIcon('RegHeart')}
                  </motion.button>
                </div>

                {/* Shipping & Warranty Info */}
                <div className="flex justify-around mt-6 border-t pt-4 text-center">
                  <div className="text-sm">
                    {getIcon('Truck', { className: 'mx-auto text-xl text-green-500 mb-1' })}
                    Fast Shipping
                  </div>
                  <div className="text-sm">
                    {getIcon('ShieldAlt', { className: 'mx-auto text-xl text-yellow-500 mb-1' })}
                    2 Year Warranty
                  </div>
                  <div className="text-sm">
                    {getIcon('CheckCircle', { className: 'mx-auto text-xl text-blue-500 mb-1' })}
                    Verified Seller
                  </div>
                </div>

              </div>

              {/* Product Description (Uses the new component) */}
              <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-20 lg:mb-6">
                <ProductDescription description={product.description} />
              </div>
              
              {/* Customer Reviews */}
              <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Customer Reviews ({reviews.length})</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition"
                  >
                    {getIcon('CommentDots', { className: 'mr-2 text-xl' })} Write a Review
                  </motion.button>
                </div>
                
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <RatingStars rating={review.rating} />
                          <span className="ml-3 text-sm font-semibold text-gray-800">{review.user}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 italic">{review.comment}</p>
                      <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                        <button className="flex items-center hover:text-blue-600 transition">
                          {getIcon('RegThumbsUp', { className: 'mr-1' })} Like
                        </button>
                        <button className="flex items-center hover:text-blue-600 transition">
                          {getIcon('Reply', { className: 'mr-1' })} Reply
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Be the first to leave a review!</p>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </main>
        
        {/* Sticky Bottom Bar (Mobile/Tablet Only) */}
        <div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl z-40 
                     lg:static lg:border-none lg:shadow-none lg:p-0"
        >
          <div className="container mx-auto px-0 sm:px-6 lg:px-0">
            {/* Quantity Selector - Moved here for mobile/tablet visibility */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
                <label className="text-gray-700 font-semibold">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-10 text-center py-2 border-x focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
            </div>

            {/* Action Buttons (Mobile/Tablet) */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex-shrink-0 p-3 rounded-xl transition text-2xl ${
                  isWishlisted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isWishlisted ? getIcon('Heart') : getIcon('RegHeart')}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center bg-blue-600 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:bg-blue-700 transition"
              >
                {getIcon('ShoppingCart', { className: 'mr-2 text-lg' })} Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center bg-red-600 text-white py-3 rounded-xl font-bold text-base shadow-lg hover:bg-red-700 transition"
              >
                {getIcon('Bolt', { className: 'mr-2 text-lg' })} Buy Now
              </motion.button>
            </div>
          </div>
        </div>

        {/* Review Form Modal */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowReviewForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg"
              >
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Submit Your Review</h2>
                  <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                    {getIcon('Times', { className: 'text-xl' })}
                  </button>
                </div>

                {/* Rating Input */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-3">Your Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="text-3xl transition"
                      >
                        {newReview.rating >= star ? (
                          <span className="text-yellow-400">★</span>
                        ) : (
                          <span className="text-gray-300 hover:text-yellow-300">☆</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-3">Your Review</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={5}
                    maxLength={500}
                    className="w-full border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Share your experience with this product..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {newReview.comment.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    className="flex-1 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Submit Review
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
};

export default SingleProduct;