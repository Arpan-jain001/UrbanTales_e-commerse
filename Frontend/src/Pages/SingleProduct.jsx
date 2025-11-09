import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaBolt, 
  FaHeart, FaRegHeart, FaCheckCircle, FaTruck, FaShieldAlt,
  FaThumbsUp, FaRegThumbsUp, FaReply
} from "react-icons/fa";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// Helper: get thumbnails for images/videos
const getMediaItems = (product) => {
  const arr = [];
  if (product.images?.length) {
    product.images.forEach(url => arr.push({ type: "image", url }));
  }
  if (product.videos?.length) {
    product.videos.forEach(url => arr.push({ type: "video", url }));
  }
  if ((!product.images?.length) && product.image)
    arr.unshift({ type: "image", url: product.image });
  return arr;
};

// Star Rating Component
const StarRating = ({ rating, size = "text-lg", showNumber = false }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<FaStar key={i} className={`${size} text-yellow-400`} />);
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      stars.push(<FaStarHalfAlt key={i} className={`${size} text-yellow-400`} />);
    } else {
      stars.push(<FaRegStar key={i} className={`${size} text-gray-300`} />);
    }
  }
  return (
    <div className="flex items-center gap-1">
      {stars}
      {showNumber && <span className="ml-2 text-gray-700 font-semibold">{rating.toFixed(1)}</span>}
    </div>
  );
};

// Rating Progress Bar
const RatingBar = ({ stars, percentage, count }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="flex items-center gap-1 w-16">
      <span className="font-semibold text-sm">{stars}</span>
      <FaStar className="text-xs text-gray-400" />
    </div>
    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-green-500 h-full"
      />
    </div>
    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
  </div>
);

// Review Card Component
const ReviewCard = ({ review, onLike, onReply, currentUserId }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      // ✅ Use _id (MongoDB primary key)
      onReply(review._id || review.id, replyText);
      setReplyText("");
      setShowReplyBox(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-200 py-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {review.userName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-gray-800">{review.userName || 'Anonymous'}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <FaCheckCircle /> Verified Purchase
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm">
              <span className="font-semibold">{review.rating}</span>
              <FaStar className="text-xs" />
            </div>
            <span className="text-gray-600 text-sm">{review.date}</span>
          </div>

          <p className="text-gray-800 mb-3">{review.comment}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Review ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded border"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <button 
              onClick={() => onLike(review._id || review.id)}
              className={`flex items-center gap-1 transition ${
                review.likedBy?.some(id => id.toString() === currentUserId?.toString()) 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {review.likedBy?.some(id => id.toString() === currentUserId?.toString()) ? (
                <FaThumbsUp />
              ) : (
                <FaRegThumbsUp />
              )}
              <span>Helpful ({review.helpful || 0})</span>
            </button>
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition"
            >
              <FaReply />
              <span>Reply</span>
            </button>
          </div>

          {/* Reply Box */}
          <AnimatePresence>
            {showReplyBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleReplySubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Submit Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyText("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Display Replies */}
          {review.replies && review.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {review.replies.map((reply, idx) => (
                <div key={idx} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {reply.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">{reply.userName || 'Anonymous'}</span>
                      <span className="text-xs text-gray-500">{reply.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  
  // User data from server
  const [currentUser, setCurrentUser] = useState(null);
  
  // Image zoom states (for desktop only)
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  // New review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });

  // Reviews from server
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const navigate = useNavigate();

  // Rating statistics
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ]
  });

  // ✅ FIX: Fetch current user data with fallback
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(`${BASE_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data);
          } else {
            // ✅ Fallback: Decode token to get userId
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setCurrentUser({ _id: payload.userId, id: payload.userId });
            } catch (decodeErr) {
              console.error("Failed to decode token:", decodeErr);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          // ✅ Fallback on error
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser({ _id: payload.userId, id: payload.userId });
          } catch {}
        }
      }
    };
    fetchUserData();
  }, []);

  // Fetch product and reviews
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch product
    fetch(`${BASE_API_URL}/api/products/id/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelected(0);
        
        // Fetch suggestions
        if (data?.category) {
          fetch(`${BASE_API_URL}/api/products/${data.category}`)
            .then(res => res.json())
            .then((all) => {
              setSuggestions(Array.isArray(all) ? all.filter(p => p._id !== id).slice(0, 4) : []);
            });
        } else {
          setSuggestions([]);
        }
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });

    // Fetch reviews
    fetchReviews();
  }, [id]);

  // ✅ FIX: Fetch reviews from server with proper error handling
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      console.log('📖 Fetching reviews for product:', id);
      const res = await fetch(`${BASE_API_URL}/api/reviews/product/${id}`);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Reviews fetched:', data.reviews?.length || 0);
        setReviews(data.reviews || []);
        
        // Calculate rating statistics
        if (data.reviews && data.reviews.length > 0) {
          const total = data.reviews.length;
          const sum = data.reviews.reduce((acc, r) => acc + r.rating, 0);
          const average = sum / total;
          
          const distribution = [5, 4, 3, 2, 1].map(star => {
            const count = data.reviews.filter(r => r.rating === star).length;
            const percentage = (count / total) * 100;
            return { stars: star, count, percentage: Math.round(percentage) };
          });
          
          setRatingStats({
            average: parseFloat(average.toFixed(1)),
            total,
            distribution
          });
        } else {
          // ✅ No reviews - set empty stats
          setRatingStats({
            average: 0,
            total: 0,
            distribution: [
              { stars: 5, count: 0, percentage: 0 },
              { stars: 4, count: 0, percentage: 0 },
              { stars: 3, count: 0, percentage: 0 },
              { stars: 2, count: 0, percentage: 0 },
              { stars: 1, count: 0, percentage: 0 },
            ]
          });
        }
      } else {
        console.error('❌ Failed to fetch reviews:', res.status);
      }
    } catch (err) {
      console.error("❌ Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // ✅ FIX: Sort reviews based on selected option
  const getSortedReviews = () => {
    let sorted = [...reviews];
    
    switch(sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'helpful':
        sorted.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    return sorted;
  };

  // ✅ FIX: Handle like button with _id
  const handleLike = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to like reviews");
      navigate("/login");
      return;
    }

    try {
      console.log('👍 Liking review:', reviewId);
      const res = await fetch(`${BASE_API_URL}/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Like successful:', data);
        // ✅ Update local state with _id
        setReviews(reviews.map(review => {
          if (review._id === reviewId || review.id === reviewId) {
            return {
              ...review,
              helpful: data.helpful,
              likedBy: data.likedBy
            };
          }
          return review;
        }));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to like review');
      }
    } catch (err) {
      console.error("❌ Failed to like review:", err);
      alert("Failed to like review. Please try again.");
    }
  };

  // ✅ FIX: Handle reply submission with _id
  const handleReply = async (reviewId, replyText) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to reply");
      navigate("/login");
      return;
    }

    try {
      console.log('💬 Replying to review:', reviewId);
      const res = await fetch(`${BASE_API_URL}/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text: replyText })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Reply successful:', data);
        // ✅ Update local state with new reply using _id
        setReviews(reviews.map(review => {
          if (review._id === reviewId || review.id === reviewId) {
            return {
              ...review,
              replies: data.replies
            };
          }
          return review;
        }));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to post reply");
      }
    } catch (err) {
      console.error("❌ Failed to post reply:", err);
      alert("Failed to post reply. Please try again.");
    }
  };

  const addToCart = async (showAlert = true) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      navigate("/login");
      return false;
    }
    const mainImage = getMediaItems(product)[selected]?.url || product.images?.[0] || product.image;
    const item = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      qty: 1
    };
    try {
      const res = await fetch(`${BASE_API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      if (showAlert) {
        alert(data.msg || (res.ok ? "Added to cart!" : "Error"));
      }
      return res.ok;
    } catch {
      if (showAlert) {
        alert("Server error");
      }
      return false;
    }
  };

  // Add to wishlist function (silently adds to cart)
  const handleWishlistClick = async () => {
    if (!wishlist) {
      const success = await addToCart(false);
      if (success) {
        setWishlist(true);
      }
    } else {
      setWishlist(false);
    }
  };

  // Buy Now function
  const handleBuyNow = async () => {
    const success = await addToCart(false);
    if (success) {
      navigate("/cartpage");
    }
  };

  // Image zoom handlers (desktop only)
  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (newReview.rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!newReview.comment.trim()) {
      alert("Please write a comment");
      return;
    }

    try {
      console.log('📝 Submitting review for product:', id);
      const res = await fetch(`${BASE_API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          productId: id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Review submitted:', data);
        alert("Review submitted successfully!");
        setNewReview({ rating: 0, comment: "" });
        setShowReviewForm(false);
        // Refresh reviews
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("❌ Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <HashLoader color="#070A52" size={80} />
    </div>
  );

  if (error) return (
    <div className="text-center text-red-600 mt-10">{error}</div>
  );

  if (!product) return null;

  const mediaItems = getMediaItems(product);
  const maxThumbnails = 6;
  const thumbnailsToShow = showAll ? mediaItems : mediaItems.slice(0, maxThumbnails);
  const remainingCount = mediaItems.length - maxThumbnails;
  const sortedReviews = getSortedReviews();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to={`/category/${product.category}`} className="hover:text-blue-600">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-800">{product.name}</span>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left: Images */}
              <div className="flex gap-4">
                {/* Thumbnail Column */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300">
                  {thumbnailsToShow.map((item, i) => (
                    <button
                      key={i}
                      className={`w-14 h-14 border rounded-md overflow-hidden flex-shrink-0 transition-all
                        ${selected === i ? 'border-blue-500 border-2' : 'border-gray-200 hover:border-gray-400'}`}
                      onClick={() => setSelected(i)}
                    >
                      {item.type === "image" ? (
                        <img src={item.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg viewBox="0 0 40 40" width={16} height={16} className="text-blue-500 fill-current">
                            <polygon points="15,12 28,20 15,28" fill="currentColor" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                  {!showAll && remainingCount > 0 && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-14 h-14 border border-gray-200 rounded-md flex items-center justify-center text-xs font-semibold text-gray-600 hover:border-gray-400"
                    >
                      +{remainingCount}
                    </button>
                  )}
                </div>

                {/* Main Image with Zoom Effect */}
                <div className="flex-1 flex items-center justify-center bg-white border border-gray-200 rounded-lg p-4 relative overflow-hidden">
                  <button
                    onClick={handleWishlistClick}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition"
                  >
                    {wishlist ? (
                      <FaHeart className="text-2xl text-red-500" />
                    ) : (
                      <FaRegHeart className="text-2xl text-gray-400" />
                    )}
                  </button>

                  {mediaItems[selected]?.type === "image" ? (
                    <div 
                      className="relative w-full h-full flex items-center justify-center cursor-crosshair"
                      onMouseEnter={() => window.innerWidth >= 1024 && setIsZooming(true)}
                      onMouseLeave={() => setIsZooming(false)}
                      onMouseMove={handleMouseMove}
                    >
                      <motion.img
                        key={selected}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        src={mediaItems[selected]?.url}
                        alt={product.name}
                        className="max-w-full max-h-[500px] object-contain"
                        style={{
                          transform: isZooming ? `scale(2.5)` : 'scale(1)',
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          transition: 'transform 0.1s ease-out'
                        }}
                      />
                    </div>
                  ) : (
                    <video
                      controls
                      src={mediaItems[selected]?.url}
                      className="max-w-full max-h-[500px] object-contain rounded-lg"
                    >
                      Sorry, your browser does not support embedded videos.
                    </video>
                  )}
                </div>
              </div>

              {/* Right: Product Details */}
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
                  {product.name}
                </h1>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded">
                    <span className="font-semibold">{ratingStats.average || 'N/A'}</span>
                    <FaStar className="text-sm" />
                  </div>
                  <span className="text-gray-600">
                    {ratingStats.total.toLocaleString()} Ratings & {reviews.length} Reviews
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                        <span className="text-green-600 font-semibold text-lg">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-green-600 mt-1">+ ₹{Math.round(product.price * 0.05)} cashback</p>
                </div>

                {/* Available Offers */}
                <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-800 mb-3">Available Offers</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 font-semibold mt-0.5">🏷️</span>
                      <p><span className="font-semibold">Bank Offer:</span> 10% instant discount on SBI Credit Cards</p>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 font-semibold mt-0.5">🏷️</span>
                      <p><span className="font-semibold">Special Price:</span> Get extra 5% off (price inclusive of discount)</p>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 font-semibold mt-0.5">🏷️</span>
                      <p><span className="font-semibold">No Cost EMI:</span> Available on orders above ₹3,000</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">Delivery</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Enter Delivery Pincode"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button className="text-blue-600 font-semibold text-sm hover:underline">
                      Check
                    </button>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaTruck className="text-gray-600" />
                      <span>Free Delivery by <span className="font-semibold">Tomorrow</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaShieldAlt className="text-gray-600" />
                      <span>7 Days Replacement Policy</span>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Product Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-auto">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(true)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart />
                    ADD TO CART
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <FaBolt />
                    BUY NOW
                  </motion.button>
                </div>

                {/* Seller Info */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Seller:</span>
                    <span className="font-semibold text-gray-800">{product.seller || "UrbanTales"}</span>
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                      <span>4.3</span>
                      <FaStar className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ratings & Reviews</h2>

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <HashLoader color="#070A52" size={50} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Rating Summary */}
                  <div className="lg:col-span-1">
                    <div className="border rounded-lg p-6 text-center">
                      <div className="text-5xl font-bold text-gray-800 mb-2">
                        {ratingStats.average || 'N/A'}
                        <FaStar className="inline-block text-3xl text-yellow-400 ml-2 mb-2" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        {ratingStats.total.toLocaleString()} Ratings &<br />
                        {reviews.length} Reviews
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowReviewForm(true)}
                        className="w-full bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                      >
                        ✍️ Write a Review
                      </motion.button>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-gray-800 mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                      {ratingStats.distribution.map((item) => (
                        <RatingBar
                          key={item.stars}
                          stars={item.stars}
                          percentage={item.percentage}
                          count={item.count}
                        />
                      ))}
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
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                      onClick={() => setShowReviewForm(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Write a Review</h3>

                        {/* Star Rating Input */}
                        <div className="mb-6">
                          <label className="block text-gray-700 font-semibold mb-3">Your Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="transition-transform hover:scale-110"
                              >
                                {star <= newReview.rating ? (
                                  <FaStar className="text-4xl text-yellow-400" />
                                ) : (
                                  <FaRegStar className="text-4xl text-gray-300" />
                                )}
                              </button>
                            ))}
                          </div>
                          {newReview.rating > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              You rated: {newReview.rating} star{newReview.rating > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        {/* Comment Input */}
                        <div className="mb-6">
                          <label className="block text-gray-700 font-semibold mb-3">Your Review</label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            rows={6}
                            maxLength={500}
                            className="w-full border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:border-blue-500 transition"
                            placeholder="Share your experience with this product..."
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            {newReview.comment.length}/500 characters
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
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

                {/* Sort Options */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                  <span className="font-semibold text-gray-700">Sort by:</span>
                  <div className="flex gap-2 flex-wrap">
                    {['recent', 'helpful', 'rating'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          sortBy === option
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {sortedReviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">No reviews yet</p>
                      <p className="text-sm">Be the first to review this product!</p>
                    </div>
                  ) : (
                    sortedReviews.map((review) => (
                      <ReviewCard 
                        key={review._id || review.id} 
                        review={review} 
                        onLike={handleLike}
                        onReply={handleReply}
                        currentUserId={currentUser?._id || currentUser?.id}
                      />
                    ))
                  )}
                </div>

                {/* Load More Button */}
                {sortedReviews.length > 0 && sortedReviews.length >= 10 && (
                  <div className="text-center mt-8">
                    <button className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                      Load More Reviews
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

       {/* Suggested Products */}
        {suggestions.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {suggestions.map(item => (
                  <Link 
                    key={item._id} 
                    to={`/product/${item._id}`}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                        <img 
                          src={item.images?.[0] || item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                        />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                          <span className="font-semibold">4.3</span>
                          <FaStar className="text-xs" />
                        </div>
                        <span className="text-xs text-gray-500">(234)</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                      {item.originalPrice && (
                        <span className="text-xs text-green-600 font-semibold">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </span>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}


