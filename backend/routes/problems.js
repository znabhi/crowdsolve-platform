const express = require('express');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all problems with filters and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const problems = await Problem.find(filter)
      .populate('createdBy', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments(filter);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single problem
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'username avatar bio problemsSolved solutionsProvided')
      .populate('upvotes', 'username');

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create problem
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location, images, category, urgency } = req.body;

    const problem = new Problem({
      title,
      description,
      location,
      images: images || [],
      category,
      urgency,
      createdBy: req.user._id
    });

    await problem.save();
    await problem.populate('createdBy', 'username avatar');

    res.status(201).json({
      message: 'Problem created successfully',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error during problem creation' });
  }
});

// Update problem
router.put('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username avatar');

    res.json({
      message: 'Problem updated successfully',
      problem: updatedProblem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ message: 'Server error during problem update' });
  }
});

// Upvote problem
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const hasUpvoted = problem.upvotes.includes(req.user._id);
    
    if (hasUpvoted) {
      // Remove upvote
      problem.upvotes.pull(req.user._id);
    } else {
      // Add upvote
      problem.upvotes.push(req.user._id);
    }

    await problem.save();

    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Problem upvoted',
      upvoteCount: problem.upvoteCount,
      hasUpvoted: !hasUpvoted
    });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get problem solutions
router.get('/:id/solutions', async (req, res) => {
  try {
    const solutions = await Solution.find({ problem: req.params.id })
      .populate('proposedBy', 'username avatar solutionsProvided')
      .populate('upvotes', 'username')
      .populate('comments.user', 'username avatar')
      .sort({ upvoteCount: -1, createdAt: -1 });

    res.json(solutions);
  } catch (error) {
    console.error('Get solutions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;