import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  People,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import axios from 'axios';

const Courses = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const t = (key) => getTranslation(language, key);

  useEffect(() => {
    fetchCourses();
  }, [page, searchTerm, levelFilter, categoryFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: searchTerm,
        level: levelFilter,
        category: categoryFilter
      });

      console.log('Fetching courses from:', `http://localhost:5000/api/courses?${params}`);
      const response = await axios.get(`http://localhost:5000/api/courses?${params}`);
      console.log('Courses response:', response.data);
      setCourses(response.data);
      setTotalPages(Math.ceil(response.data.length / 12));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

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
          {t('common.loading')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          {t('courses.allCourses')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('courses.discover')}
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={t('courses.searchPlaceholder')}
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
              
              <CardActions sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  {t('courses.viewCourse')}
                </Button>
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
            {t('courses.noCoursesFound')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {t('courses.tryAdjustingFilters')}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Courses;
