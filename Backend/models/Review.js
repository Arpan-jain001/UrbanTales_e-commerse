import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true
});

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [replySchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate reviews from same user on same product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for better query performance
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Virtual for review age
reviewSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Static method to get average rating for a product
reviewSchema.statics.getAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function(productId) {
  const result = await this.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const distribution = [5, 4, 3, 2, 1].map(rating => {
    const found = result.find(r => r._id === rating);
    return {
      stars: rating,
      count: found ? found.count : 0
    };
  });

  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  
  return distribution.map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
  }));
};

// Instance method to check if user liked the review
reviewSchema.methods.isLikedBy = function(userId) {
  return this.likedBy.some(id => id.toString() === userId.toString());
};

// Instance method to add a reply
reviewSchema.methods.addReply = function(userId, userName, text) {
  this.replies.push({
    userId,
    userName,
    text,
    date: new Date()
  });
  return this.save();
};

// Pre-save hook to validate
reviewSchema.pre('save', function(next) {
  if (this.isModified('comment')) {
    this.comment = this.comment.trim();
  }
  if (this.isModified('userName')) {
    this.userName = this.userName.trim();
  }
  next();
});

// Pre-remove hook (optional - for cleanup)
reviewSchema.pre('remove', async function(next) {
  console.log(`Removing review ${this._id}`);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
