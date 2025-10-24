import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  useTheme
} from '@mui/material';
import {
  School,
  People,
  TrendingUp,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Learn Anything',
      description: 'Access thousands of courses from expert instructors'
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and experts'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      description: 'Track Your Progress',
      title: 'Track your learning journey and achievements'
    }
  ];

  const popularCourses = [
    {
      id: 1,
      title: 'Web Development Fundamentals',
      instructor: 'John Smith',
      rating: 4.8,
      students: 1250,
      price: 99,
      thumbnail: 'https://via.placeholder.com/300x200?text=Web+Development'
    },
    {
      id: 2,
      title: 'Data Science with Python',
      instructor: 'Sarah Johnson',
      rating: 4.9,
      students: 980,
      price: 149,
      thumbnail: 'https://via.placeholder.com/300x200?text=Data+Science'
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass',
      instructor: 'Mike Wilson',
      rating: 4.7,
      students: 750,
      price: 79,
      thumbnail: 'https://via.placeholder.com/300x200?text=UI+UX+Design'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Learn Without Limits
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Start, switch, or advance your career with more than 5,000 courses,
            Professional Certificates, and degrees from world-class universities and companies.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                backgroundColor: 'white', 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'grey.100' }
              }}
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </Button>
            {!user && (
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Our Platform?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box textAlign="center" sx={{ p: 3 }}>
                {feature.icon}
                <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Courses Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Popular Courses
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {popularCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.thumbnail}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      by {course.instructor}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Star sx={{ fontSize: 16, color: 'orange' }} />
                      <Typography variant="body2">{course.rating}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({course.students} students)
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Typography variant="h6" color="primary">
                      ${course.price}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      View Course
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/courses')}
            >
              View All Courses
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
