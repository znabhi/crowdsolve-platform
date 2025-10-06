import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  CheckCircle,
  CheckCircleOutline
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const ProblemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProblemAndSolutions();
  }, [id]);

  const fetchProblemAndSolutions = async () => {
    try {
      setLoading(true);
      const [problemResponse, solutionsResponse] = await Promise.all([
        API.get(`/problems/${id}`),
        API.get(`/problems/${id}/solutions`)
      ]);
      setProblem(problemResponse.data);
      setSolutions(solutionsResponse.data);
    } catch (error) {
      console.error('Error fetching problem:', error);
      setError('Failed to load problem details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvoteProblem = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await API.post(`/problems/${id}/upvote`);
      fetchProblemAndSolutions();
    } catch (error) {
      console.error('Upvote error:', error);
    }
  };

  const handleUpvoteSolution = async (solutionId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await API.post(`/solutions/${solutionId}/upvote`);
      fetchProblemAndSolutions();
    } catch (error) {
      console.error('Upvote error:', error);
    }
  };

  const handleAcceptSolution = async (solutionId) => {
    try {
      await API.patch(`/solutions/${solutionId}/accept`);
      setSuccess('Solution accepted!');
      fetchProblemAndSolutions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to accept solution');
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!solutionText.trim()) {
      setError('Please enter a solution');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await API.post('/solutions', {
        description: solutionText,
        problemId: id
      });
      setSolutionText('');
      setSuccess('Solution submitted successfully!');
      fetchProblemAndSolutions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[urgency] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'success',
      'in-progress': 'warning',
      resolved: 'info',
      closed: 'default'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!problem) {
    return (
      <Container>
        <Alert severity="error">Problem not found</Alert>
      </Container>
    );
  }

  const hasUpvotedProblem = user && problem.upvotes.includes(user.id);
  const isProblemOwner = user && problem.createdBy._id === user.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* Problem Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {problem.title}
              </Typography>
              <Tooltip title={hasUpvotedProblem ? "Remove upvote" : "Upvote"}>
                <IconButton onClick={handleUpvoteProblem} color={hasUpvotedProblem ? "primary" : "default"}>
                  {hasUpvotedProblem ? <ThumbUp /> : <ThumbUpOutlined />}
                  <Typography sx={{ ml: 1 }}>{problem.upvoteCount}</Typography>
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip label={problem.category} color="primary" variant="outlined" />
              <Chip label={problem.urgency} color={getUrgencyColor(problem.urgency)} />
              <Chip label={problem.status} color={getStatusColor(problem.status)} variant="outlined" />
            </Box>

            <Typography variant="body1" paragraph>
              {problem.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Location: {problem.location}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={problem.createdBy.avatar} sx={{ mr: 2 }}>
                  {problem.createdBy.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {problem.createdBy.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posted on {new Date(problem.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Solutions Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Solutions ({solutions.length})
            </Typography>

            {solutions.map((solution) => (
              <Card key={solution._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Avatar src={solution.proposedBy.avatar} sx={{ mr: 2 }}>
                        {solution.proposedBy.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">
                          {solution.proposedBy.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(solution.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {solution.isAccepted && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Accepted"
                          color="success"
                          size="small"
                        />
                      )}
                      {isProblemOwner && !solution.isAccepted && problem.status !== 'resolved' && (
                        <Tooltip title="Accept this solution">
                          <IconButton
                            onClick={() => handleAcceptSolution(solution._id)}
                            color="primary"
                          >
                            <CheckCircleOutline />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Upvote solution">
                        <IconButton
                          onClick={() => handleUpvoteSolution(solution._id)}
                          color={solution.upvotes.includes(user?.id) ? "primary" : "default"}
                        >
                          {solution.upvotes.includes(user?.id) ? <ThumbUp /> : <ThumbUpOutlined />}
                          <Typography sx={{ ml: 0.5 }}>{solution.upvoteCount}</Typography>
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="body1">
                    {solution.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}

            {solutions.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No solutions yet. Be the first to propose a solution!
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Solution Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>
              Propose a Solution
            </Typography>
            <form onSubmit={handleSubmitSolution}>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Describe your solution in detail..."
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                disabled={submitting}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting || !solutionText.trim()}
              >
                {submitting ? <CircularProgress size={24} /> : 'Submit Solution'}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProblemDetail;