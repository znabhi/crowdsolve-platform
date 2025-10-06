const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  images: [{
    type: String, // URL to image
  }],
  category: {
    type: String,
    required: true,
    enum: ['environment', 'infrastructure', 'social', 'education', 'health', 'other']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  createdBy: {
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
  solutionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update upvoteCount when upvotes array changes
problemSchema.pre('save', function(next) {
  this.upvoteCount = this.upvotes.length;
  next();
});

module.exports = mongoose.model('Problem', problemSchema);