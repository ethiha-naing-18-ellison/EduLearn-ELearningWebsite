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
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Tab,
  Tabs,
  TabPanel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Star,
  People,
  Schedule,
  PlayCircle,
  Assignment,
  Quiz,
  CheckCircle,
  Lock
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchCourse();
    checkEnrollment();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/enrollments/course/${id}`);
      setEnrolled(response.data.length > 0);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/enrollments', {
        courseId: parseInt(id)
      });
      setEnrolled(true);
    } catch (error) {
      console.error('Error enrolling:', error);
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

  const lessons = [
    { id: 1, title: 'Introduction to Web Development', duration: '15 min', type: 'video', isFree: true },
    { id: 2, title: 'HTML Basics', duration: '30 min', type: 'video', isFree: true },
    { id: 3, title: 'CSS Fundamentals', duration: '45 min', type: 'video', isFree: false },
    { id: 4, title: 'JavaScript Introduction', duration: '60 min', type: 'video', isFree: false },
    { id: 5, title: 'Project: Building a Portfolio', duration: '90 min', type: 'assignment', isFree: false }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={course.thumbnail || 'https://via.placeholder.com/800x300?text=Course+Image'}
              alt={course.title}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Chip 
                  label={course.level} 
                  color={getLevelColor(course.level)}
                  size="small" 
                />
                <Typography variant="h4" color="primary">
                  {course.isFree ? 'Free' : `$${course.price}`}
                </Typography>
              </Box>

              <Typography variant="h3" gutterBottom>
                {course.title}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                by {course.instructor?.firstName} {course.instructor?.lastName}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={4.8} precision={0.1} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    4.8 (1,250 reviews)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    1,250 students
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {course.duration} hours
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {course.description}
              </Typography>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label="Curriculum" />
                  <Tab label="Instructor" />
                  <Tab label="Reviews" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Course Content
                  </Typography>
                  <List>
                    {lessons.map((lesson, index) => (
                      <ListItem key={lesson.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {lesson.type === 'video' ? (
                            <PlayCircle color="primary" />
                          ) : (
                            <Assignment color="secondary" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={lesson.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {lesson.duration}
                              </Typography>
                              {lesson.isFree && (
                                <Chip label="Free" size="small" color="success" />
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {enrolled || lesson.isFree ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Lock color="disabled" />
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
                      {course.instructor?.firstName?.charAt(0)}{course.instructor?.lastName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Senior Web Developer
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Star sx={{ fontSize: 16, color: 'orange', mr: 0.5 }} />
                        <Typography variant="body2">4.9 Instructor Rating</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body1">
                    Experienced web developer with 10+ years in the industry. 
                    Passionate about teaching and helping others learn modern web technologies.
                  </Typography>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Student Reviews
                  </Typography>
                  {/* Reviews would go here */}
                  <Typography variant="body2" color="text.secondary">
                    Reviews coming soon...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {course.isFree ? 'Free Course' : `$${course.price}`}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  What you'll learn:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Build responsive websites" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Master modern CSS techniques" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="JavaScript fundamentals" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="Deploy your projects" />
                  </ListItem>
                </List>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Course includes:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PlayCircle color="primary" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="5 hours on-demand video" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Assignment color="secondary" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="3 assignments" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Quiz color="info" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary="2 quizzes" />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2 }}>
              {user?.role === 'Instructor' || user?.role === 'Admin' ? (
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={() => navigate(`/edit-course/${course.id}`)}
                >
                  Edit Course
                </Button>
              ) : enrolled ? (
                <Button variant="contained" fullWidth size="large">
                  Continue Learning
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={handleEnroll}
                >
                  {course.isFree ? 'Enroll for Free' : `Enroll for $${course.price}`}
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetail;
