const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Solution description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update counts when arrays change
solutionSchema.pre('save', function(next) {
  this.upvoteCount = this.upvotes.length;
  this.commentCount = this.comments.length;
  next();
});

module.exports = mongoose.model('Solution', solutionSchema);