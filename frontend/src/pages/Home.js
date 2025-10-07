import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Fade,
  Zoom,
  useMediaQuery,
  useTheme,
  Skeleton,
  InputAdornment,
  debounce
} from '@mui/material';
import { 
  Add, 
  Search, 
  TrendingUp,
  FilterList,
  Clear 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProblemCard from '../components/Problem/ProblemCard';
import API from '../utils/api';

// Skeleton loader for cards
const ProblemCardSkeleton = () => (
  <Paper sx={{ p: 2, height: 280 }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="60%" />
      </Box>
    </Box>
    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="text" height={20} width="80%" sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Skeleton variant="rounded" width={80} height={24} />
      <Skeleton variant="rounded" width={60} height={24} />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton variant="text" width={100} height={20} />
      <Skeleton variant="rounded" width={80} height={32} />
    </Box>
  </Paper>
);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 9
  });

  // Memoized categories and statuses
  const categories = useMemo(() => [
    { value: 'environment', label: '🌍 Environment', color: 'success' },
    { value: 'infrastructure', label: '🏗️ Infrastructure', color: 'warning' },
    { value: 'social', label: '👥 Social', color: 'secondary' },
    { value: 'education', label: '📚 Education', color: 'info' },
    { value: 'health', label: '🏥 Health', color: 'error' },
    { value: 'other', label: '🔧 Other', color: 'default' }
  ], []);

  const statuses = useMemo(() => [
    { value: 'open', label: '🟢 Open', color: 'success' },
    { value: 'in-progress', label: '🟡 In Progress', color: 'warning' },
    { value: 'resolved', label: '🔵 Resolved', color: 'info' },
    { value: 'closed', label: '⚫ Closed', color: 'default' }
  ], []);

  // Debounced search function
  const debouncedFetchProblems = useCallback(
    debounce(async (filters) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await API.get(`/problems?${params}`);
        setProblems(response.data.problems);
        setError('');
      } catch (error) {
        console.error('Error fetching problems:', error);
        setError('Failed to load problems');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    }, 300), // 300ms debounce
    []
  );

  useEffect(() => {
    debouncedFetchProblems(filters);
  }, [filters, debouncedFetchProblems]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    handleFilterChange('search', value);
  }, [handleFilterChange]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      status: '',
      page: 1,
      limit: 9
    });
  }, []);

  const handleCreateProblem = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/create');
  }, [user, navigate]);

  const hasActiveFilters = filters.search || filters.category || filters.status;

  // Grid configuration based on screen size
  const gridConfig = useMemo(() => ({
    xs: 12,
    sm: 6,
    md: isTablet ? 6 : 4,
    lg: 4
  }), [isTablet]);

  if (initialLoad) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" height={48} width="40%" sx={{ mb: 2 }} />
          <Skeleton variant="text" height={24} width="60%" sx={{ mb: 3 }} />
          
          {/* Filter skeleton */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid item xs={12} md={2}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid item xs={12} md={2}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid item xs={12} md={2}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Cards skeleton */}
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item {...gridConfig} key={index}>
              <ProblemCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Community Solutions
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Collaborate with your community to solve local problems together
          </Typography>

          {/* Stats Chip */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              icon={<TrendingUp />} 
              label={`${problems.length} problems waiting for solutions`}
              color="primary"
              variant="outlined"
            />
            {hasActiveFilters && (
              <Chip 
                icon={<Clear />} 
                label="Clear filters"
                onClick={clearFilters}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>

          {/* Filter Section */}
          <Paper 
            sx={{ 
              p: { xs: 2, md: 3 }, 
              mb: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search problems, locations..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider'
                      }
                    }
                  }}
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>

              {/* Category Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  InputProps={{
                    startAdornment: filters.category && (
                      <InputAdornment position="start">
                        <FilterList fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Create Problem Button */}
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateProblem}
                  sx={{ 
                    height: isMobile ? '40px' : '56px',
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {isMobile ? 'Post' : 'Post Problem'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Fade in timeout={300}>
          <Alert 
            severity="error" 
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Content Section */}
      {loading && problems.length === 0 ? (
        // Loading state
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item {...gridConfig} key={index}>
              <ProblemCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : problems.length === 0 ? (
        // Empty state
        <Zoom in timeout={500}>
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
              borderRadius: 3
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {hasActiveFilters ? 'No problems match your filters' : 'No problems yet'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results'
                : 'Be the first to post a community problem and start collaborating'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateProblem}
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
              }}
            >
              Post First Problem
            </Button>
          </Paper>
        </Zoom>
      ) : (
        // Problems grid
        <Grid container spacing={3}>
          {problems.map((problem, index) => (
            <Grid item {...gridConfig} key={problem._id}>
              <Zoom in timeout={300 + (index * 100)} style={{ transitionDelay: `${index * 50}ms` }}>
                <div>
                  <ProblemCard problem={problem} onUpdate={debouncedFetchProblems} />
                </div>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Loading overlay for subsequent loads */}
      {loading && problems.length > 0 && (
        <Fade in timeout={300}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
          >
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography>Updating problems...</Typography>
              </Box>
            </Paper>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default React.memo(Home);