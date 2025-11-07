import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

const getTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

// ✅ SIRF US PRODUCT KE REVIEWS (Product-specific)
router.get('/product/:productId', async (req, res) => {
  try {
    console.log('📖 Fetching reviews for product:', req.params.productId);
    
    // ✅ Filter by productId - sirf is product ki reviews
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${reviews.length} reviews for this product only`);

    const reviewsWithTime = reviews.map(review => ({
      ...review,
      date: getTimeAgo(review.createdAt)
    }));

    res.json({ reviews: reviewsWithTime });
  } catch (err) {
    console.error('❌ Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// ✅ SUBMIT REVIEW - Product-specific
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('📝 Submitting review...');
    console.log('Body:', req.body);
    console.log('User ID:', req.userId);

    const { productId, rating, comment } = req.body;

    // Validation
    if (!productId) {
      console.log('❌ Missing productId');
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!rating) {
      console.log('❌ Missing rating');
      return res.status(400).json({ error: 'Rating is required' });
    }

    if (!comment) {
      console.log('❌ Missing comment');
      return res.status(400).json({ error: 'Comment is required' });
    }

    if (rating < 1 || rating > 5) {
      console.log('❌ Invalid rating:', rating);
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (comment.length > 500) {
      console.log('❌ Comment too long');
      return res.status(400).json({ error: 'Comment must be 500 characters or less' });
    }

    // ✅ Check if user already reviewed THIS SPECIFIC PRODUCT
    console.log('🔍 Checking for existing review on THIS product...');
    const existingReview = await Review.findOne({
      productId: productId,  // ✅ Specific product
      userId: req.userId     // ✅ Specific user
    });

    if (existingReview) {
      console.log('⚠️ User already reviewed THIS product');
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // ✅ Create review LINKED to specific product
    const userName = `User${req.userId.toString().slice(-4)}`;
    const userEmail = `user${req.userId.toString().slice(-4)}@example.com`;

    console.log('✏️ Creating review for product:', productId);

    const review = new Review({
      productId: new mongoose.Types.ObjectId(productId), // ✅ Linked to THIS product only
      userId: new mongoose.Types.ObjectId(req.userId),
      userName,
      userEmail,
      rating: Number(rating),
      comment: comment.trim(),
      verified: true,
      helpful: 0,
      likedBy: [],
      replies: []
    });

    console.log('💾 Saving review to database...');
    const savedReview = await review.save();
    console.log('✅ Review saved for product:', productId);

    res.status(201).json({ 
      message: 'Review submitted successfully',
      review: savedReview
    });
  } catch (err) {
    console.error('❌ Error submitting review:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to submit review', 
      details: err.message
    });
  }
});

// Like/Unlike review
router.post('/:reviewId/like', verifyToken, async (req, res) => {
  try {
    console.log('👍 Toggling like for review:', req.params.reviewId);
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      console.log('❌ Review not found');
      return res.status(404).json({ error: 'Review not found' });
    }

    const userId = req.userId;
    const likedIndex = review.likedBy.findIndex(id => id.toString() === userId);

    if (likedIndex > -1) {
      review.likedBy.splice(likedIndex, 1);
      review.helpful = Math.max(0, review.helpful - 1);
      console.log('👎 Review unliked');
    } else {
      review.likedBy.push(new mongoose.Types.ObjectId(userId));
      review.helpful += 1;
      console.log('👍 Review liked');
    }

    await review.save();

    res.json({
      helpful: review.helpful,
      likedBy: review.likedBy
    });
  } catch (err) {
    console.error('❌ Error liking review:', err);
    res.status(500).json({ error: 'Failed to like review', details: err.message });
  }
});

// Reply to review
router.post('/:reviewId/reply', verifyToken, async (req, res) => {
  try {
    console.log('💬 Adding reply to review:', req.params.reviewId);
    
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const userName = `User${req.userId.toString().slice(-4)}`;

    const reply = {
      userId: new mongoose.Types.ObjectId(req.userId),
      userName,
      text: text.trim(),
      date: new Date()
    };

    review.replies.push(reply);
    await review.save();

    console.log('✅ Reply added successfully');

    const formattedReplies = review.replies.map(r => ({
      userId: r.userId,
      userName: r.userName,
      text: r.text,
      date: getTimeAgo(r.date),
      _id: r._id
    }));

    res.json({
      message: 'Reply added successfully',
      replies: formattedReplies
    });
  } catch (err) {
    console.error('❌ Error adding reply:', err);
    res.status(500).json({ error: 'Failed to add reply', details: err.message });
  }
});

// Delete review
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    console.log('🗑️ Deleting review:', req.params.reviewId);
    
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    console.log('✅ Review deleted successfully');

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review', details: err.message });
  }
});

// Update review
router.put('/:reviewId', verifyToken, async (req, res) => {
  try {
    console.log('✏️ Updating review:', req.params.reviewId);
    
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (comment.length > 500) {
      return res.status(400).json({ error: 'Comment must be 500 characters or less' });
    }

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    console.log('✅ Review updated successfully');

    res.json({ 
      message: 'Review updated successfully',
      review 
    });
  } catch (err) {
    console.error('❌ Error updating review:', err);
    res.status(500).json({ error: 'Failed to update review', details: err.message });
  }
});

export default router;
