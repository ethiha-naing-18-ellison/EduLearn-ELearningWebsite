import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    level: 'Beginner',
    duration: 0,
    categoryId: '',
    prerequisites: '',
    learningOutcomes: ''
  });

  useEffect(() => {
    fetchCourse();
    fetchCategories();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
      const courseData = response.data;
      setCourse(courseData);
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        price: courseData.price || 0,
        level: courseData.level || 'Beginner',
        duration: courseData.duration || 0,
        categoryId: courseData.category?.id || '',
        prerequisites: courseData.prerequisites || '',
        learningOutcomes: courseData.learningOutcomes || ''
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      setMessage('Error loading course');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await axios.put(`http://localhost:5000/api/courses/${id}`, formData);
      setMessage('Course updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating course:', error);
      setMessage('Error updating course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading course...
        </Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Course not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Course
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update your course information
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    label="Level"
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (hours)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Prerequisites"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="What students should know before taking this course"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Learning Outcomes"
                  name="learningOutcomes"
                  value={formData.learningOutcomes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="What students will learn from this course"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : null}
                  >
                    {saving ? 'Updating...' : 'Update Course'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditCourse;
