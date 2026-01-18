import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import axios from 'axios';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = (key) => getTranslation(language, key);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    isFree: false,
    level: 'Beginner',
    duration: 0,
    prerequisites: '',
    learningOutcomes: '',
    categoryId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const courseData = {
        ...formData,
        instructorId: user.id,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
      };

      const response = await axios.post('http://localhost:5000/api/courses', courseData);
      
      setSuccess(t('createCourse.courseCreatedSuccess'));
      setTimeout(() => {
        navigate(`/courses/${response.data.id}`);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || t('createCourse.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('createCourse.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('createCourse.subtitle')}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('createCourse.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="title"
                label={t('createCourse.courseTitle')}
                value={formData.title}
                onChange={handleChange}
                placeholder={t('createCourse.courseTitlePlaceholder')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="description"
                label={t('createCourse.courseDescription')}
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder={t('createCourse.courseDescriptionPlaceholder')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="thumbnail"
                label={t('createCourse.thumbnailURL')}
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder={t('createCourse.thumbnailURLPlaceholder')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('createCourse.category')}</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label={t('createCourse.category')}
                >
                  <MenuItem value="">{t('createCourse.selectCategory')}</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Course Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {t('createCourse.courseDetails')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('createCourse.level')}</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  label={t('createCourse.level')}
                >
                  <MenuItem value="Beginner">{t('courses.beginner')}</MenuItem>
                  <MenuItem value="Intermediate">{t('courses.intermediate')}</MenuItem>
                  <MenuItem value="Advanced">{t('courses.advanced')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="duration"
                label={t('createCourse.duration')}
                type="number"
                value={formData.duration}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="price"
                label={t('createCourse.price')}
                type="number"
                value={formData.price}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={formData.isFree}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFree}
                    onChange={handleChange}
                    name="isFree"
                  />
                }
                label={t('createCourse.freeCourse')}
              />
            </Grid>

            {/* Learning Content */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {t('createCourse.learningContent')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="prerequisites"
                label={t('createCourse.prerequisites')}
                multiline
                rows={3}
                value={formData.prerequisites}
                onChange={handleChange}
                placeholder={t('createCourse.prerequisitesPlaceholder')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="learningOutcomes"
                label={t('createCourse.learningOutcomes')}
                multiline
                rows={3}
                value={formData.learningOutcomes}
                onChange={handleChange}
                placeholder={t('createCourse.learningOutcomesPlaceholder')}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ flexGrow: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : t('createCourse.createCourse')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                >
                  {t('common.cancel')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCourse;
