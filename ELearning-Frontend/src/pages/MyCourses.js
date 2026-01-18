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
  Visibility,
  School,
  MenuBook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { getTranslation } from '../utils/translations';
import axios from 'axios';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showConfirm, showSuccess, showError } = useNotification();

  const t = (key) => getTranslation(language, key);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const isStudent = user?.role === 'Student';
  const isInstructor = user?.role === 'Instructor' || user?.role === 'Admin';

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

  const fetchEnrolledCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/enrollments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setEnrolledCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for user to be loaded
    if (!user) {
      return;
    }

    // Only fetch created courses if user is instructor/admin
    if (isInstructor) {
      fetchMyCourses();
    }
    // Only fetch enrolled courses if user is student
    else if (isStudent) {
      fetchEnrolledCourses();
    }
    // If user role is unknown, set loading to false
    else {
      setLoading(false);
    }
  }, [user, fetchMyCourses, fetchEnrolledCourses, isInstructor, isStudent]);

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
    showConfirm(
      t('myCourses.confirmDelete'),
      async () => {
        try {
          await axios.delete(`http://localhost:5000/api/courses/${courseId}`);
          showSuccess(t('myCourses.deleteSuccess') || 'Course deleted successfully', {
            title: t('myCourses.deleteSuccessTitle') || 'Deleted Successfully'
          });
          fetchMyCourses(); // Refresh the list
        } catch (error) {
          console.error('Error deleting course:', error);
          showError(t('myCourses.deleteError'), {
            title: t('myCourses.deleteErrorTitle') || 'Delete Failed'
          });
        }
      },
      null,
      {
        title: t('myCourses.confirmDeleteTitle') || 'Confirm Delete',
        type: 'warning'
      }
    );
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
          {t('myCourses.loading')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          {t('myCourses.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isStudent 
            ? t('myCourses.subtitleStudent')
            : t('myCourses.subtitleInstructor')}
        </Typography>
      </Box>


      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={t('myCourses.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('courses.level')}</InputLabel>
              <Select
                value={levelFilter}
                onChange={handleLevelFilter}
                label={t('courses.level')}
              >
                <MenuItem value="">{t('courses.allLevels')}</MenuItem>
                <MenuItem value="Beginner">{t('courses.beginner')}</MenuItem>
                <MenuItem value="Intermediate">{t('courses.intermediate')}</MenuItem>
                <MenuItem value="Advanced">{t('courses.advanced')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('courses.category')}</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilter}
                label={t('courses.category')}
              >
                <MenuItem value="">{t('courses.allCategories')}</MenuItem>
                <MenuItem value="Programming">{t('courses.programming')}</MenuItem>
                <MenuItem value="Web Development">{t('courses.webDevelopment')}</MenuItem>
                <MenuItem value="Data Science">{t('courses.dataScience')}</MenuItem>
                <MenuItem value="Design">{t('courses.design')}</MenuItem>
                <MenuItem value="Business">{t('courses.business')}</MenuItem>
                <MenuItem value="Marketing">{t('courses.marketing')}</MenuItem>
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
              {t('courses.clearFilters')}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Courses Grid - Show created courses for instructors */}
      {isInstructor && (
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
                  {t('courses.by')} {course.instructor?.firstName} {course.instructor?.lastName}
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
                      1,250 {t('courses.students')}
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
                    {t('courses.viewCourse')}
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditCourse(course.id)}
                      sx={{ flex: 1 }}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FilterList />}
                      onClick={() => handleManageMaterials(course.id)}
                      sx={{ flex: 1 }}
                    >
                      {t('myCourses.materials')}
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
      )}

      {/* Enrolled Courses Grid - Show enrolled courses for students */}
      {isStudent && (() => {
        // Filter enrolled courses based on search and filters
        const filteredEnrolled = enrolledCourses.filter(enrollment => {
          const course = enrollment.course;
          if (!course) return false;
          
          const matchesSearch = !searchTerm || 
            course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesLevel = !levelFilter || course.level === levelFilter;
          
          const matchesCategory = !categoryFilter || course.category?.name === categoryFilter;
          
          return matchesSearch && matchesLevel && matchesCategory;
        });

        return (
          <Grid container spacing={3}>
            {filteredEnrolled.map((enrollment) => (
            <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={enrollment.course?.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Image'}
                  alt={enrollment.course?.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip 
                      label={enrollment.course?.level} 
                      color={getLevelColor(enrollment.course?.level)}
                      size="small" 
                    />
                    <Typography variant="h6" color="primary">
                      {enrollment.course?.isFree ? t('courses.free') : `$${enrollment.course?.price}`}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {enrollment.course?.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    by {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
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
                        {enrollment.course?.duration}h
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {enrollment.course?.description}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 2, flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/courses/${enrollment.course?.id}`)}
                  >
                    {t('courses.viewCourse')}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<MenuBook />}
                    onClick={() => navigate(`/course-learning/${enrollment.course?.id}`)}
                  >
                    {t('myCourses.goToCourse')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            ))}
          </Grid>
        );
      })()}

      {/* Pagination - Only for created courses (instructors) */}
      {isInstructor && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Empty state for instructors - no created courses */}
      {isInstructor && courses.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            {t('myCourses.noCoursesFound')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {t('myCourses.noCreatedCourses')}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/create-course')}
          >
            {t('myCourses.createFirstCourse')}
          </Button>
        </Box>
      )}

      {/* Empty state for students - no enrolled courses */}
      {isStudent && (() => {
        const filteredEnrolled = enrolledCourses.filter(enrollment => {
          const course = enrollment.course;
          if (!course) return false;
          
          const matchesSearch = !searchTerm || 
            course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesLevel = !levelFilter || course.level === levelFilter;
          
          const matchesCategory = !categoryFilter || course.category?.name === categoryFilter;
          
          return matchesSearch && matchesLevel && matchesCategory;
        });

        // Show empty state if no enrolled courses at all, or if filters result in no matches
        const hasNoEnrolledCourses = enrolledCourses.length === 0;
        const hasNoFilteredResults = filteredEnrolled.length === 0 && enrolledCourses.length > 0;

        return (hasNoEnrolledCourses || hasNoFilteredResults) && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            {hasNoEnrolledCourses ? t('myCourses.noEnrolledCourses') : t('myCourses.noFilteredCourses')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {hasNoEnrolledCourses 
              ? t('myCourses.noEnrolledCoursesMessage')
              : t('courses.tryAdjustingFilters')}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              if (hasNoEnrolledCourses) {
                navigate('/courses');
              } else {
                setSearchTerm('');
                setLevelFilter('');
                setCategoryFilter('');
              }
            }}
          >
            {hasNoEnrolledCourses ? t('myCourses.browseCourses') : t('courses.clearFilters')}
          </Button>
        </Box>
        );
      })()}
    </Container>
  );
};

export default MyCourses;
