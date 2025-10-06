import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActions,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const ProblemCard = ({ problem, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    setUpvoting(true);
    try {
      await API.post(`/problems/${problem._id}/upvote`);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Upvote error:', error);
    } finally {
      setUpvoting(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const hasUpvoted = user && problem.upvotes.includes(user.id);

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
      onClick={() => navigate(`/problems/${problem._id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {problem.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {problem.description.length > 150 
                ? `${problem.description.substring(0, 150)}...` 
                : problem.description
              }
            </Typography>
          </Box>
          {problem.images && problem.images.length > 0 && (
            <Box
              sx={{
                width: 80,
                height: 80,
                ml: 2,
                borderRadius: 1,
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img
                src={problem.images[0]}
                alt="Problem"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip
            label={problem.category}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={problem.urgency}
            color={getUrgencyColor(problem.urgency)}
            size="small"
          />
          <Chip
            label={problem.status}
            color={getStatusColor(problem.status)}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 24, height: 24, mr: 1 }}
                src={problem.createdBy?.avatar}
              >
                {problem.createdBy?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {problem.createdBy?.username}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatDate(problem.createdAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {problem.location}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={hasUpvoted ? "Remove upvote" : "Upvote"}>
            <IconButton
              size="small"
              onClick={handleUpvote}
              disabled={upvoting}
              color={hasUpvoted ? "primary" : "default"}
            >
              {hasUpvoted ? <ThumbUp /> : <ThumbUpOutlined />}
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {problem.upvoteCount}
              </Typography>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Comment fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {problem.solutionCount}
            </Typography>
          </Box>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ProblemCard;