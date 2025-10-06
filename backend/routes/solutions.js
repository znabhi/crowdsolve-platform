const express = require('express');
const Solution = require('../models/Solution');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create solution
router.post('/', auth, async (req, res) => {
  try {
    const { description, problemId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const solution = new Solution({
      description,
      problem: problemId,
      proposedBy: req.user._id
    });

    await solution.save();
    
    // Update problem solution count
    problem.solutionCount += 1;
    await problem.save();

    // Update user solutions provided count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { solutionsProvided: 1 }
    });

    await solution.populate('proposedBy', 'username avatar solutionsProvided');

    res.status(201).json({
      message: 'Solution added successfully',
      solution
    });
  } catch (error) {
    console.error('Create solution error:', error);
    res.status(500).json({ message: 'Server error during solution creation' });
  }
});

// Upvote solution
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    const hasUpvoted = solution.upvotes.includes(req.user._id);
    
    if (hasUpvoted) {
      solution.upvotes.pull(req.user._id);
    } else {
      solution.upvotes.push(req.user._id);
    }

    await solution.save();

    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Solution upvoted',
      upvoteCount: solution.upvoteCount,
      hasUpvoted: !hasUpvoted
    });
  } catch (error) {
    console.error('Upvote solution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to solution
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    solution.comments.push({
      user: req.user._id,
      text
    });

    await solution.save();
    await solution.populate('comments.user', 'username avatar');

    const newComment = solution.comments[solution.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error during comment creation' });
  }
});

// Accept solution
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id)
      .populate('problem');

    if (!solution) {
      return res.status(404).json({ message: 'Solution not found' });
    }

    // Check if user owns the problem
    if (solution.problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept solutions for this problem' });
    }

    // Unaccept any previously accepted solution for this problem
    await Solution.updateMany(
      { problem: solution.problem._id, _id: { $ne: solution._id } },
      { isAccepted: false }
    );

    // Accept this solution
    solution.isAccepted = true;
    await solution.save();

    // Update problem status
    await Problem.findByIdAndUpdate(solution.problem._id, {
      status: 'resolved'
    });

    // Update user problems solved count
    await User.findByIdAndUpdate(solution.proposedBy, {
      $inc: { problemsSolved: 1 }
    });

    res.json({
      message: 'Solution accepted successfully',
      solution
    });
  } catch (error) {
    console.error('Accept solution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;