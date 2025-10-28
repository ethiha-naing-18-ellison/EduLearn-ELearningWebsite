import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Pagination,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  People,
  Schedule,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMyCourses();
  }, [page, searchTerm, levelFilter, categoryFilter, fetchMyCourses]);

  const fetchMyCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: searchTerm,
        level: levelFilter,
        category: categoryFilter,
        instructorId: user.id // Filter by current instructor
      });

      console.log('Fetching my courses from:', `http://localhost:5000/api/courses?${params}`);
      const response = await axios.get(`http://localhost:5000/api/courses?${params}`);
      console.log('My courses response:', response.data);
      
      // Filter courses to only show those created by the current instructor
      const myCourses = response.data.filter(course => course.instructorId === user.id);
      setCourses(myCourses);
      setTotalPages(Math.ceil(myCourses.length / 12));
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, levelFilter, categoryFilter, user.id]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleLevelFilter = (e) => {
    setLevelFilter(e.target.value);
    setPage(1);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleEditCourse = (courseId) => {
    navigate(`/edit-course/${courseId}`);
  };

  const handleManageMaterials = (courseId) => {
    navigate(`/manage-materials/${courseId}`);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
        fetchMyCourses(); // Refresh the list
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error deleting course. Please try again.');
      }
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your courses...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          My Courses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all the courses you've created
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search my courses..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={levelFilter}
                onChange={handleLevelFilter}
                label="Level"
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilter}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Programming">Programming</MenuItem>
                <MenuItem value="Web Development">Web Development</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setLevelFilter('');
                setCategoryFilter('');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Courses Grid */}
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Image'}
                alt={course.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip 
                    label={course.level} 
                    color={getLevelColor(course.level)}
                    size="small" 
                  />
                  <Typography variant="h6" color="primary">
                    ${course.price}
                  </Typography>
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom>
                  {course.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  by {course.instructor?.firstName} {course.instructor?.lastName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={4.8} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    4.8 (1,250)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <People sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      1,250 students
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.duration}h
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" noWrap>
                  {course.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ p: 2, flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  View Course
                </Button>
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditCourse(course.id)}
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterList />}
                    onClick={() => handleManageMaterials(course.id)}
                    sx={{ flex: 1 }}
                  >
                    Materials
                  </Button>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {courses.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No courses found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            You haven't created any courses yet. Start by creating your first course!
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/create-course')}
          >
            Create Your First Course
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MyCourses;
