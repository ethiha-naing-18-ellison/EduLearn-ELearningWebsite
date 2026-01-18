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
  useMediaQuery,
  CircularProgress,
  Avatar,
  Divider,
  Link,
  Stack,
  IconButton
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
  Quiz,
  AutoAwesome,
  RocketLaunch,
  EmojiEvents,
  Lightbulb,
  Psychology,
  Explore
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = (key) => getTranslation(language, key);

  const features = [
    {
      icon: <School />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      title: t('home.features.learnAnything.title'),
      description: t('home.features.learnAnything.description')
    },
    {
      icon: <People />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      title: t('home.features.expertInstructors.title'),
      description: t('home.features.expertInstructors.description')
    },
    {
      icon: <TrendingUp />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      title: t('home.features.trackProgress.title'),
      description: t('home.features.trackProgress.description')
    },
    {
      icon: <WorkspacePremium />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      title: t('home.features.earnCertificates.title'),
      description: t('home.features.earnCertificates.description')
    },
    {
      icon: <AccessTime />,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      title: t('home.features.learnAtPace.title'),
      description: t('home.features.learnAtPace.description')
    },
    {
      icon: <PlayCircle />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
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
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #6366f1 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
          color: 'white',
          py: { xs: 8, md: 15 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: '70vh', md: '85vh' },
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'rotate 20s linear infinite',
            pointerEvents: 'none',
            opacity: 0.3,
          },
        }}
      >
        {/* Floating Icons - Hidden on mobile for performance */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: 'float 6s ease-in-out infinite',
            opacity: { xs: 0, md: 0.3 },
            zIndex: 1,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <School sx={{ fontSize: { md: 50, lg: 60 }, color: 'rgba(255,255,255,0.5)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            animation: 'floatReverse 8s ease-in-out infinite',
            opacity: { xs: 0, md: 0.3 },
            zIndex: 1,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <MenuBook sx={{ fontSize: { md: 40, lg: 50 }, color: 'rgba(255,255,255,0.5)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '20%',
            animation: 'float 7s ease-in-out infinite',
            opacity: { xs: 0, md: 0.3 },
            zIndex: 1,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <WorkspacePremium sx={{ fontSize: { md: 45, lg: 55 }, color: 'rgba(255,255,255,0.5)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            animation: 'floatReverse 9s ease-in-out infinite',
            opacity: { xs: 0, md: 0.3 },
            zIndex: 1,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <PlayCircle sx={{ fontSize: { md: 55, lg: 65 }, color: 'rgba(255,255,255,0.5)' }} />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              animation: 'slideInUp 1s ease-out',
              px: { xs: 2, sm: 3 },
            }}
          >
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem', lg: '5.5rem' },
                fontWeight: 900,
                mb: { xs: 2, md: 3 },
                background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 4px 20px rgba(255,255,255,0.3)',
                letterSpacing: { xs: '-0.02em', md: '-0.03em' },
                lineHeight: { xs: 1.2, md: 1.1 },
              }}
            >
              {t('home.heroTitle')}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: { xs: 4, md: 6 }, 
                opacity: 0.98,
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.35rem', lg: '1.6rem' },
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: { xs: 1.6, md: 1.7 },
                fontWeight: 400,
                animation: 'fadeIn 1.2s ease-out 0.3s both',
                px: { xs: 1, sm: 0 },
              }}
            >
              {t('home.heroSubtitle')}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 3 }, 
                justifyContent: 'center', 
                alignItems: 'center',
                animation: 'slideInUp 1s ease-out 0.6s both',
                width: '100%',
                px: { xs: 2, sm: 0 },
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayCircle />}
                fullWidth={isMobile}
                sx={{ 
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  color: '#6366f1',
                  px: { xs: 4, sm: 5 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  fontWeight: 800,
                  borderRadius: { xs: 3, md: 4 },
                  minHeight: { xs: 48, sm: 52, md: 56 },
                  boxShadow: '0 15px 35px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.3)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)',
                    transform: { xs: 'scale(0.98)', md: 'translateY(-4px) scale(1.05)' },
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 60px rgba(255,255,255,0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
                onClick={() => navigate('/courses')}
              >
                {t('home.browseCourses')}
              </Button>
              {!user && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<School />}
                  fullWidth={isMobile}
                  sx={{ 
                    borderColor: 'white', 
                    borderWidth: { xs: 2, md: 3 },
                    color: 'white',
                    px: { xs: 4, sm: 5 },
                    py: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    fontWeight: 800,
                    borderRadius: { xs: 3, md: 4 },
                    minHeight: { xs: 48, sm: 52, md: 56 },
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      transform: { xs: 'scale(0.98)', md: 'translateY(-4px) scale(1.05)' },
                      boxShadow: '0 15px 35px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.3)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                  onClick={() => navigate('/register')}
                >
                  {t('home.getStarted')}
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8, md: 12 }, px: { xs: 2, sm: 3 } }}>
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 5, md: 8 },
            animation: 'fadeIn 1s ease-out',
          }}
        >
          <Box sx={{ display: 'inline-flex', mb: 2 }}>
            <AutoAwesome sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main', animation: 'pulse 2s ease-in-out infinite' }} />
          </Box>
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem', lg: '3.25rem' },
              mb: { xs: 1.5, md: 2 },
              px: { xs: 2, sm: 0 },
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('home.whyChooseTitle')}
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.2rem' },
              lineHeight: { xs: 1.6, md: 1.7 },
              px: { xs: 2, sm: 0 },
            }}
          >
            {t('home.whyChooseSubtitle')}
          </Typography>
        </Box>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={index}
              sx={{
                animation: `slideInUp 0.8s ease-out ${index * 0.1}s both`,
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: { xs: 3, sm: 3.5, md: 4 },
                  border: '2px solid',
                  borderColor: 'grey.200',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: feature.gradient,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease',
                  },
                  '&:hover': {
                    transform: { xs: 'translateY(-8px)', md: 'translateY(-16px) scale(1.02)' },
                    boxShadow: '0 25px 50px rgba(99, 102, 241, 0.2), 0 0 60px rgba(99, 102, 241, 0.1)',
                    borderColor: 'primary.light',
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                    '& .feature-icon': {
                      transform: { xs: 'scale(1.1)', md: 'scale(1.15) rotate(5deg)' },
                      boxShadow: '0 12px 30px rgba(99, 102, 241, 0.4)',
                    },
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                <Box 
                  className="feature-icon"
                  sx={{ 
                    mb: { xs: 2, md: 3 },
                    display: 'inline-flex',
                    p: { xs: 2, md: 2.5 },
                    borderRadius: { xs: 3, md: 4 },
                    background: feature.gradient,
                    color: 'white',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: { xs: 3, md: 4 },
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    },
                    '&:hover::after': {
                      opacity: 1,
                    },
                  }}
                >
                  {React.cloneElement(feature.icon, { 
                    sx: { 
                      fontSize: { xs: 36, sm: 42, md: 48 }, 
                      color: 'white',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    } 
                  })}
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 800,
                    mb: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.5rem', lg: '1.6rem' },
                    color: 'text.primary',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    lineHeight: { xs: 1.6, md: 1.8 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  }}
                >
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Courses Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.75rem' },
                mb: 2,
              }}
            >
              {t('home.popularCourses')}
            </Typography>
          </Box>
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
              {popularCourses.map((course, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={course.id}
                  sx={{
                    animation: `scaleIn 0.6s ease-out ${index * 0.15}s both`,
                  }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: 'grey.200',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 30px 60px rgba(99, 102, 241, 0.25), 0 0 80px rgba(99, 102, 241, 0.1)',
                        borderColor: 'primary.light',
                        '& .course-image': {
                          transform: 'scale(1.1)',
                        },
                        '& .course-overlay': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <CardMedia
                        className="course-image"
                        component="img"
                        height="240"
                        image={course.thumbnail}
                        alt={course.title}
                        sx={{ 
                          objectFit: 'cover',
                          backgroundColor: 'grey.200',
                          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Course+Image';
                        }}
                      />
                      <Box
                        className="course-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.7) 100%)',
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          sx={{
                            backgroundColor: 'white',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: 'white',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          <PlayCircle sx={{ fontSize: 48 }} />
                        </IconButton>
                      </Box>
                      <Chip
                        label={course.isFree ? 'FREE' : `$${course.price}`}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: course.isFree ? '#10b981' : '#6366f1',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <School sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {course.instructor}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4,
                        }}
                      >
                        {course.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 20, color: '#f59e0b', animation: 'pulse 2s ease-in-out infinite' }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {course.rating}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {course.students}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<Explore />}
                        onClick={() => navigate(`/courses/${course.id}`)}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 3,
                          py: 1.5,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                          },
                        }}
                      >
                        Explore Course
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
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #ec4899 60%, #6366f1 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 12s ease infinite',
          color: 'white', 
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            animation: 'float 15s ease-in-out infinite',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            animation: 'rotate 30s linear infinite',
            pointerEvents: 'none',
            opacity: 0.2,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {statistics.map((stat, index) => (
              <Grid 
                item 
                xs={6} 
                md={3} 
                key={index}
                sx={{
                  animation: `scaleIn 0.8s ease-out ${index * 0.2}s both`,
                }}
              >
                <Box 
                  textAlign="center"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.08)',
                      background: 'rgba(255,255,255,0.15)',
                      borderColor: 'rgba(255,255,255,0.4)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 60px rgba(255,255,255,0.2)',
                      '&::before': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: 1.5,
                      fontSize: { xs: '2.25rem', md: '3.5rem' },
                      background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.9) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 4px 20px rgba(255,255,255,0.3)',
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.98,
                      fontWeight: 600,
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      letterSpacing: '0.02em',
                    }}
                  >
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
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          color: 'white',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.75rem' },
              mb: 3,
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('home.cta.title')}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 5, 
              opacity: 0.95,
              fontSize: { xs: '1rem', md: '1.25rem' },
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            {t('home.cta.subtitle')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: '#6366f1',
                px: 5,
                py: 1.75,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 3,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                },
                transition: 'all 0.3s ease',
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
                  borderWidth: 2,
                  color: 'white',
                  px: 5,
                  py: 1.75,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': { 
                    borderColor: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
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
