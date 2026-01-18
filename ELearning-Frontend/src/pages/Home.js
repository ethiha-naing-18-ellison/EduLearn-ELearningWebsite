import React, { useState, useEffect } from 'react';
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
  useTheme,
  CircularProgress,
  Avatar,
  Divider,
  Link,
  Stack
} from '@mui/material';
import {
  School,
  People,
  TrendingUp,
  Star,
  AccessTime,
  WorkspacePremium,
  PlayCircle,
  Assignment,
  CheckCircle,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
  YouTube,
  MenuBook,
  VideoLibrary,
  Description,
  Quiz
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const theme = useTheme();
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = (key) => getTranslation(language, key);

  const features = [
    {
      icon: <School sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: t('home.features.learnAnything.title'),
      description: t('home.features.learnAnything.description')
    },
    {
      icon: <People sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: t('home.features.expertInstructors.title'),
      description: t('home.features.expertInstructors.description')
    },
    {
      icon: <TrendingUp sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: t('home.features.trackProgress.title'),
      description: t('home.features.trackProgress.description')
    },
    {
      icon: <WorkspacePremium sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: t('home.features.earnCertificates.title'),
      description: t('home.features.earnCertificates.description')
    },
    {
      icon: <AccessTime sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: t('home.features.learnAtPace.title'),
      description: t('home.features.learnAtPace.description')
    },
    {
      icon: <PlayCircle sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: t('home.features.interactiveContent.title'),
      description: t('home.features.interactiveContent.description')
    }
  ];

  const statistics = [
    { number: '5,000+', label: t('home.statistics.coursesAvailable') },
    { number: '100K+', label: t('home.statistics.activeStudents') },
    { number: '500+', label: t('home.statistics.expertInstructors') },
    { number: '50+', label: t('home.statistics.countries') }
  ];

  const howItWorks = [
    {
      step: '1',
      title: t('home.howItWorks.browse.title'),
      description: t('home.howItWorks.browse.description')
    },
    {
      step: '2',
      title: t('home.howItWorks.enroll.title'),
      description: t('home.howItWorks.enroll.description')
    },
    {
      step: '3',
      title: t('home.howItWorks.complete.title'),
      description: t('home.howItWorks.complete.description')
    },
    {
      step: '4',
      title: t('home.howItWorks.certified.title'),
      description: t('home.howItWorks.certified.description')
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer',
      image: 'https://i.pravatar.cc/150?img=1',
      text: 'This platform transformed my career! The courses are comprehensive and the instructors are amazing.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      image: 'https://i.pravatar.cc/150?img=12',
      text: 'Best investment I\'ve made in my education. The hands-on projects really helped me learn.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'UI/UX Designer',
      image: 'https://i.pravatar.cc/150?img=47',
      text: 'The flexibility to learn at my own pace while getting expert guidance is perfect for my busy schedule.',
      rating: 5
    }
  ];

  useEffect(() => {
    fetchPopularCourses();
  }, []);

  const fetchPopularCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/courses?limit=3');
      const courses = response.data || [];
      
      // Take first 3 courses as popular courses
      const popular = courses.slice(0, 3).map(course => ({
        id: course.id,
        title: course.title,
        instructor: course.instructor?.firstName && course.instructor?.lastName
          ? `${course.instructor.firstName} ${course.instructor.lastName}`
          : course.instructor?.name || 'Instructor',
        rating: course.rating || 4.8,
        students: course.enrollmentsCount || 0,
        price: course.price || 0,
        thumbnail: getThumbnailUrl(course.thumbnail),
        isFree: course.isFree || false
      }));
      
      setPopularCourses(popular);
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      // Fallback to empty array or default courses if API fails
      setPopularCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) {
      return 'https://via.placeholder.com/300x200?text=Course+Image';
    }
    
    // If thumbnail is already a full URL, return it
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
      return thumbnail;
    }
    
    // If thumbnail is a relative path, prepend the backend URL
    if (thumbnail.startsWith('/')) {
      return `http://localhost:5000${thumbnail}`;
    }
    
    // Default fallback
    return `http://localhost:5000/${thumbnail}`;
  };

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
            {t('home.heroTitle')}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            {t('home.heroSubtitle')}
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
              {t('home.browseCourses')}
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
                {t('home.getStarted')}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          {t('home.whyChooseTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          {t('home.whyChooseSubtitle')}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Courses Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            {t('home.popularCourses')}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : popularCourses.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No courses available at the moment. Check back soon!
            </Typography>
          ) : (
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {popularCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={course.thumbnail}
                      alt={course.title}
                      sx={{ 
                        objectFit: 'cover',
                        backgroundColor: 'grey.200'
                      }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.src = 'https://via.placeholder.com/300x200?text=Course+Image';
                      }}
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
                        {course.isFree ? 'Free' : `$${course.price}`}
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
          )}
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/courses')}
            >
              {t('common.courses')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {statistics.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box textAlign="center">
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          {t('home.howItWorks.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          {t('home.howItWorks.subtitle')}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {howItWorks.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3, position: 'relative' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {step.step}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            {t('home.testimonials.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            {t('home.testimonials.subtitle')}
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={testimonial.image} sx={{ width: 56, height: 56, mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{testimonial.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ fontSize: 20, color: 'orange' }} />
                    ))}
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "{testimonial.text}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('home.cta.title')}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {t('home.cta.subtitle')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                '&:hover': { backgroundColor: 'grey.100' }
              }}
              onClick={() => navigate('/courses')}
            >
              {t('home.cta.exploreCourses')}
            </Button>
            {!user && (
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
                onClick={() => navigate('/register')}
              >
                {t('home.cta.signUpFree')}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: 'grey.900',
          color: 'white',
          py: 6,
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                EduLearn
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                {t('home.footer.companyDescription')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                  <Facebook />
                </Link>
                <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                  <Twitter />
                </Link>
                <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                  <LinkedIn />
                </Link>
                <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                  <Instagram />
                </Link>
                <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                  <YouTube />
                </Link>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('home.footer.quickLinks')}
              </Typography>
              <Stack spacing={1}>
                <Link href="/courses" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  {t('common.courses')}
                </Link>
                <Link href="/dashboard" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  {t('common.dashboard')}
                </Link>
                <Link href="/my-courses" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  {t('common.myCourses')}
                </Link>
                {!user && (
                  <>
                    <Link href="/login" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                      {t('common.login')}
                    </Link>
                    <Link href="/register" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                      {t('common.register')}
                    </Link>
                  </>
                )}
              </Stack>
            </Grid>

            {/* Categories */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('home.footer.categories')}
              </Typography>
              <Stack spacing={1}>
                <Link href="/courses?category=Programming" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  Programming
                </Link>
                <Link href="/courses?category=Web Development" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  Web Development
                </Link>
                <Link href="/courses?category=Data Science" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  Data Science
                </Link>
                <Link href="/courses?category=Design" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  Design
                </Link>
                <Link href="/courses?category=Business" color="inherit" sx={{ textDecoration: 'none', '&:hover': { opacity: 0.7 } }}>
                  Business
                </Link>
              </Stack>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('home.footer.contactUs')}
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 20, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    support@edulearn.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 20, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, opacity: 0.8, mt: 0.5 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    123 Education Street<br />
                    Learning City, LC 12345
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Copyright */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} EduLearn. {t('home.footer.copyright')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
              <Link href="#" color="inherit" sx={{ textDecoration: 'none', fontSize: '0.875rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                {t('home.footer.privacyPolicy')}
              </Link>
              <Link href="#" color="inherit" sx={{ textDecoration: 'none', fontSize: '0.875rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                {t('home.footer.termsOfService')}
              </Link>
              <Link href="#" color="inherit" sx={{ textDecoration: 'none', fontSize: '0.875rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                {t('home.footer.cookiePolicy')}
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
