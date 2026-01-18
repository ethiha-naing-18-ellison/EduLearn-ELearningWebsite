import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School,
  People,
  Assignment,
  TrendingUp,
  BookOnline,
  Star,
  Schedule,
  PlayArrow,
  CheckCircle,
  WorkspacePremium
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const t = (key) => getTranslation(language, key);
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalStudents: 0,
    averageProgress: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'Student') {
        // For students, fetch only their enrolled courses
        const enrollmentsResponse = await axios.get('http://localhost:5000/api/enrollments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const enrollments = enrollmentsResponse.data || [];
        
        // Process each enrollment to get course details with progress and certificates
        const coursesWithProgress = await Promise.all(
          enrollments.map(async (enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            try {
              // Fetch all course materials to calculate total
              const [lessonsRes, assignmentsRes, videosRes, documentsRes, quizzesRes, completionsResponse] = await Promise.all([
                axios.get(`http://localhost:5000/api/lessons/course/${course.id}`).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/assignments/course/${course.id}`).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/videos/course/${course.id}`).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/documents/course/${course.id}`).catch(() => ({ data: [] })),
                axios.get(`http://localhost:5000/api/multiplechoices/course/${course.id}`).catch(() => ({ data: [] })),
                axios.get(
                  `http://localhost:5000/api/materialcompletions/course/${course.id}/completions`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                  }
                ).catch(() => ({ data: {} }))
              ]);

              const lessons = lessonsRes.data || [];
              const assignments = assignmentsRes.data || [];
              const videos = videosRes.data || [];
              const documents = documentsRes.data || [];
              const quizzes = quizzesRes.data || [];
              const completions = completionsResponse.data || {};

              // Fetch quiz pass status for all quizzes (quizzes need to be passed, not just completed)
              let quizPassStatus = {};
              if (quizzes.length > 0) {
                try {
                  const quizPassPromises = quizzes.map(async (quiz) => {
                    try {
                      const attemptsResponse = await axios.get(
                        `http://localhost:5000/api/multiplechoices/${quiz.id}/attempts/all`,
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                          }
                        }
                      );
                      const attempts = attemptsResponse.data || [];
                      const latestAttempt = attempts.length > 0 ? attempts[0] : null;
                      return {
                        quizId: quiz.id,
                        isPassed: latestAttempt?.isPassed || false
                      };
                    } catch (error) {
                      console.error(`Error fetching quiz pass status for quiz ${quiz.id}:`, error);
                      return { quizId: quiz.id, isPassed: false };
                    }
                  });
                  const quizResults = await Promise.all(quizPassPromises);
                  quizResults.forEach(result => {
                    quizPassStatus[result.quizId] = result.isPassed;
                  });
                } catch (error) {
                  console.error('Error fetching quiz pass status:', error);
                }
              }

              // Build list of all materials with their expected completion keys
              const allMaterials = [
                ...lessons.map(l => ({ id: l.id, type: 'lesson', key: `lesson_${l.id}` })),
                ...assignments.map(a => ({ id: a.id, type: 'assignment', key: `assignment_${a.id}` })),
                ...videos.map(v => ({ id: v.id, type: 'video', key: `video_${v.id}` })),
                ...documents.map(d => ({ id: d.id, type: 'document', key: `document_${d.id}` })),
                ...quizzes.map(q => ({ id: q.id, type: 'multiplechoice', key: `multiplechoice_${q.id}` }))
              ];

              const totalMaterials = allMaterials.length;

              // Count completed materials - check each material's completion status
              // For quizzes, check if they're passed, not just completed
              let completedMaterialsCount = 0;
              allMaterials.forEach(material => {
                if (material.type === 'multiplechoice') {
                  // For quizzes, check if passed
                  if (quizPassStatus[material.id] === true) {
                    completedMaterialsCount++;
                  }
                } else {
                  // For other materials, check completion status
                  if (completions[material.key] === true) {
                    completedMaterialsCount++;
                  }
                }
              });

              // Calculate completion percentage
              const completionPercentage = totalMaterials > 0 
                ? Math.round((completedMaterialsCount / totalMaterials) * 100)
                : 0;

              // Check if user has a certificate for this course
              // Certificate exists if completion is 100% or enrollment status is Completed
              const hasCertificate = enrollment.status === 'Completed' || completionPercentage === 100;

              // Determine category
              let category = 'enrolled';
              if (hasCertificate) {
                category = 'completed';
              } else if (completedMaterialsCount > 0) {
                category = 'inProgress';
              } else {
                category = 'enrolled';
              }

              // Debug logging
              console.log(`Course ${course.id} (${course.title}):`, {
                totalMaterials,
                completedMaterialsCount,
                completionPercentage,
                hasCertificate,
                category,
                enrollmentStatus: enrollment.status
              });

              return {
                ...course,
                enrollment,
                completedMaterialsCount,
                totalMaterials,
                completionPercentage,
                hasCertificate,
                category
              };
            } catch (error) {
              console.error(`Error fetching progress for course ${course.id}:`, error);
              // Try to at least get material counts even if completions fail
              try {
                const [lessonsRes, assignmentsRes, videosRes, documentsRes, quizzesRes] = await Promise.all([
                  axios.get(`http://localhost:5000/api/lessons/course/${course.id}`).catch(() => ({ data: [] })),
                  axios.get(`http://localhost:5000/api/assignments/course/${course.id}`).catch(() => ({ data: [] })),
                  axios.get(`http://localhost:5000/api/videos/course/${course.id}`).catch(() => ({ data: [] })),
                  axios.get(`http://localhost:5000/api/documents/course/${course.id}`).catch(() => ({ data: [] })),
                  axios.get(`http://localhost:5000/api/multiplechoices/course/${course.id}`).catch(() => ({ data: [] }))
                ]);
                
                const totalMaterials = 
                  (lessonsRes.data?.length || 0) +
                  (assignmentsRes.data?.length || 0) +
                  (videosRes.data?.length || 0) +
                  (documentsRes.data?.length || 0) +
                  (quizzesRes.data?.length || 0);
                
                return {
                  ...course,
                  enrollment,
                  completedMaterialsCount: 0,
                  totalMaterials,
                  completionPercentage: 0,
                  hasCertificate: false,
                  category: 'enrolled'
                };
              } catch (fallbackError) {
                console.error(`Error in fallback fetch for course ${course.id}:`, fallbackError);
                return {
                  ...course,
                  enrollment,
                  completedMaterialsCount: 0,
                  totalMaterials: 0,
                  completionPercentage: 0,
                  hasCertificate: false,
                  category: 'enrolled'
                };
              }
            }
          })
        );

        // Filter out null courses
        const validCourses = coursesWithProgress.filter(c => c !== null);

        // Categorize courses
        const enrolled = validCourses.filter(c => c.category === 'enrolled');
        const inProgress = validCourses.filter(c => c.category === 'inProgress');
        const completed = validCourses.filter(c => c.category === 'completed');

        console.log('Categorized courses:', {
          enrolled: enrolled.length,
          inProgress: inProgress.length,
          completed: completed.length,
          total: validCourses.length
        });

        setEnrolledCourses(enrolled);
        setInProgressCourses(inProgress);
        setCompletedCourses(completed);

        // Sort by most recently enrolled for recent courses
        const sortedCourses = validCourses
          .sort((a, b) => {
            const enrollmentA = a.enrollment;
            const enrollmentB = b.enrollment;
            return new Date(enrollmentB?.enrolledAt || 0) - new Date(enrollmentA?.enrolledAt || 0);
          })
          .slice(0, 3);
        
        setRecentCourses(sortedCourses);
        
        // Calculate student-specific stats
        const totalEnrolled = validCourses.length;
        const completedCount = completed.length;
        const inProgressCount = inProgress.length;
        
        // Calculate average progress
        let avgProgress = 0;
        if (validCourses.length > 0) {
          const totalProgress = validCourses.reduce((sum, c) => sum + c.completionPercentage, 0);
          avgProgress = Math.round(totalProgress / validCourses.length);
        }
        
        setStats({
          enrolledCourses: totalEnrolled,
          completedCourses: completedCount,
          inProgressCourses: inProgressCount,
          averageProgress: avgProgress
        });
      } else {
        // For instructors/admins, fetch their created courses
        const coursesResponse = await axios.get('http://localhost:5000/api/courses');
        
        const allCourses = coursesResponse.data || [];
        const instructorCourses = allCourses.filter(course => course.instructorId === user.id);
        
        setRecentCourses(instructorCourses.slice(0, 3));
        
        // Try to fetch enrollments to count students (this might not be available for all instructors)
        let totalStudentsCount = 0;
        try {
          const enrollmentsResponse = await axios.get('http://localhost:5000/api/enrollments', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const allEnrollments = enrollmentsResponse.data || [];
          const instructorCourseIds = instructorCourses.map(c => c.id);
          totalStudentsCount = allEnrollments.filter(e => 
            instructorCourseIds.includes(e.courseId)
          ).length;
        } catch (error) {
          console.warn('Could not fetch enrollment data for instructor:', error);
          // If we can't fetch enrollments, we'll show 0 - this is acceptable
        }
        
        setStats({
          totalCourses: instructorCourses.length,
          totalStudents: totalStudentsCount
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Instructor': return 'primary';
      case 'Student': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', position: 'relative' }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
          animation: 'float 20s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 6 }, px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            mb: { xs: 4, md: 6 },
            p: { xs: 2.5, sm: 3, md: 4 },
            borderRadius: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #ec4899 60%, #6366f1 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradient 10s ease infinite',
            color: 'white',
            boxShadow: '0 15px 35px rgba(99, 102, 241, 0.3)',
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
              animation: 'pulse 4s ease-in-out infinite',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem', lg: '2.75rem' },
                mb: { xs: 1.5, md: 2 },
                background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.95) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'slideInDown 0.8s ease-out',
                lineHeight: { xs: 1.3, md: 1.2 },
              }}
            >
              {getGreeting()}, {user.firstName}! 👋
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1.5, md: 2 }, 
                flexWrap: 'wrap',
                animation: 'fadeIn 1s ease-out 0.3s both',
              }}
            >
              <Chip 
                label={user.role} 
                icon={<WorkspacePremium sx={{ fontSize: { xs: 18, md: 20 } }} />}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 700,
                  border: '2px solid rgba(255,255,255,0.4)',
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  py: { xs: 2, md: 2.5 },
                  height: { xs: 32, md: 40 },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.35)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.3s ease',
                }}
                size="medium" 
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.98,
                  fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1.1rem' },
                  fontWeight: 500,
                }}
              >
                {t('dashboard.welcome')}
              </Typography>
            </Box>
          </Box>
        </Box>

      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Stats Cards - Different for Students vs Instructors */}
        {user.role === 'Student' ? (
          <>
            {/* Student Dashboard Stats */}
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3}
              sx={{
                animation: 'scaleIn 0.6s ease-out 0.1s both',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
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
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.05)',
                    boxShadow: '0 25px 50px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.2)',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .stat-icon': {
                      transform: 'scale(1.2) rotate(5deg)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box 
                      className="stat-icon"
                      sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <School sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: { xs: 0.5, md: 1 },
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '2.75rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      lineHeight: 1.2,
                    }}
                  >
                    {stats.enrolledCourses}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95, 
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                    }}
                  >
                    {t('dashboard.stats.enrolled')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3}
              sx={{
                animation: 'scaleIn 0.6s ease-out 0.2s both',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: 'white',
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
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.05)',
                    boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .stat-icon': {
                      transform: 'scale(1.2) rotate(5deg)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box 
                      className="stat-icon"
                      sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <PlayArrow sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: { xs: 0.5, md: 1 },
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '2.75rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      lineHeight: 1.2,
                    }}
                  >
                    {stats.inProgressCourses}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95, 
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                    }}
                  >
                    {t('dashboard.stats.activeCourses')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3}
              sx={{
                animation: 'scaleIn 0.6s ease-out 0.3s both',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  color: 'white',
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
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.05)',
                    boxShadow: '0 25px 50px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .stat-icon': {
                      transform: 'scale(1.2) rotate(5deg)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box 
                      className="stat-icon"
                      sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <Assignment sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: { xs: 0.5, md: 1 },
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '2.75rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      lineHeight: 1.2,
                    }}
                  >
                    {stats.completedCourses}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95, 
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                    }}
                  >
                    {t('dashboard.stats.coursesCompleted')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3}
              sx={{
                animation: 'scaleIn 0.6s ease-out 0.4s both',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  color: 'white',
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
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.05)',
                    boxShadow: '0 25px 50px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.2)',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .stat-icon': {
                      transform: 'scale(1.2) rotate(5deg)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box 
                      className="stat-icon"
                      sx={{ 
                        p: 2, 
                        borderRadius: 3, 
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <TrendingUp sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: { xs: 0.5, md: 1 },
                      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '2.75rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      lineHeight: 1.2,
                    }}
                  >
                    {stats.averageProgress}%
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.95, 
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                    }}
                  >
                    {t('dashboard.stats.averageProgress')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            {/* Instructor/Admin Dashboard Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <School sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {t('dashboard.stats.created')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <People sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {t('dashboard.stats.totalStudents')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <TrendingUp sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {stats.totalCourses > 0 ? Math.round((stats.totalStudents / stats.totalCourses) * 10) / 10 : 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {t('dashboard.stats.avgStudentsPerCourse')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Assignment sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    -
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {t('dashboard.stats.totalActivities')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Course Categories - Only for Students */}
        {user.role === 'Student' ? (
          <Grid item xs={12}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                  }}
                >
                  {t('dashboard.myCourses')}
                </Typography>
                <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: { xs: 2, md: 3 } }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      minHeight: { xs: 56, md: 56 },
                      '& .MuiTab-root': {
                        fontWeight: 600,
                        textTransform: 'none',
                        minHeight: 56,
                        fontSize: '0.9375rem',
                        px: { xs: 2, sm: 2.5, md: 3 },
                        whiteSpace: 'nowrap',
                        '& .MuiTab-iconWrapper': {
                          fontSize: '1.25rem',
                          mr: 1,
                        },
                      },
                      '& .MuiTabs-scrollButtons': {
                        width: { xs: 40, md: 48 },
                        '&.Mui-disabled': {
                          opacity: 0.3,
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: { xs: '1.5rem', md: '1.75rem' },
                        },
                      },
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                      },
                    }}
                  >
                    <Tab 
                      icon={<School />}
                      iconPosition="start"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span">
                            {t('common.enrolled')}
                          </Box>
                          <Chip 
                            label={enrolledCourses.length} 
                            size="small" 
                            sx={{ 
                              height: 20,
                              fontSize: '0.75rem',
                              minWidth: 24,
                            }}
                          />
                        </Box>
                      }
                    />
                    <Tab 
                      icon={<PlayArrow />}
                      iconPosition="start"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span">
                            {t('common.inProgress')}
                          </Box>
                          <Chip 
                            label={inProgressCourses.length} 
                            size="small" 
                            sx={{ 
                              height: 20,
                              fontSize: '0.75rem',
                              minWidth: 24,
                            }}
                          />
                        </Box>
                      }
                    />
                    <Tab 
                      icon={<CheckCircle />}
                      iconPosition="start"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box component="span">
                            {t('common.completed')}
                          </Box>
                          <Chip 
                            label={completedCourses.length} 
                            size="small" 
                            sx={{ 
                              height: 20,
                              fontSize: '0.75rem',
                              minWidth: 24,
                            }}
                          />
                        </Box>
                      }
                    />
                  </Tabs>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {/* Enrolled Courses Tab */}
                    {tabValue === 0 && (
                      <Box>
                        {enrolledCourses.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            {t('dashboard.noCoursesEnrolled')}
                          </Typography>
                        ) : (
                          <List sx={{ p: 0 }}>
                            {enrolledCourses.map((course, index) => (
                              <React.Fragment key={course.id || index}>
                                <ListItem
                                  sx={{
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    py: { xs: 2, md: 2.5 },
                                    px: { xs: 1, sm: 2 },
                                  }}
                                >
                                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 } }}>
                                    <ListItemAvatar sx={{ minWidth: { xs: 48, md: 56 } }}>
                                      <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 } }}>
                                        <BookOnline sx={{ fontSize: { xs: 24, md: 28 } }} />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography 
                                          variant="h6" 
                                          sx={{ 
                                            fontWeight: 700,
                                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                            mb: { xs: 0.5, md: 1 },
                                            lineHeight: 1.3,
                                          }}
                                        >
                                          {course.title}
                                        </Typography>
                                      }
                                      secondary={
                                        <Box sx={{ mt: { xs: 0.5, md: 1 } }}>
                                          <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                              fontSize: { xs: '0.85rem', md: '0.875rem' },
                                              mb: { xs: 1, md: 1.5 },
                                            }}
                                          >
                                            {course.instructor?.firstName && course.instructor?.lastName
                                              ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                              : course.instructorName || 'Instructor'}
                                          </Typography>
                                          <Box sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap',
                                            alignItems: 'center', 
                                            gap: { xs: 0.75, md: 1 },
                                            mb: { xs: 1, md: 1.5 },
                                          }}>
                                            {course.level && (
                                              <Chip 
                                                label={course.level} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined"
                                                sx={{ 
                                                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                  height: { xs: 22, md: 24 },
                                                }}
                                              />
                                            )}
                                            <Typography 
                                              variant="body2" 
                                              color="text.secondary"
                                              sx={{ 
                                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                                fontWeight: 600,
                                              }}
                                            >
                                              {course.completionPercentage}% {t('common.complete')}
                                            </Typography>
                                          </Box>
                                          {course.totalMaterials > 0 && (
                                            <Box sx={{ mt: { xs: 0.5, md: 1 } }}>
                                              <LinearProgress 
                                                variant="determinate" 
                                                value={course.completionPercentage} 
                                                sx={{ 
                                                  height: { xs: 5, md: 6 }, 
                                                  borderRadius: 3,
                                                  mb: 0.5,
                                                }}
                                              />
                                            </Box>
                                          )}
                                        </Box>
                                      }
                                      sx={{ flex: 1, m: 0 }}
                                    />
                                  </Box>
                                  <Box sx={{ 
                                    width: { xs: '100%', sm: 'auto' },
                                    mt: { xs: 2, sm: 0 },
                                    ml: { xs: 0, sm: 2 },
                                  }}>
                                    <Button 
                                      fullWidth={isMobile}
                                      size={isMobile ? "medium" : "small"}
                                      variant="contained"
                                      onClick={() => navigate(`/course-learning/${course.id}`)}
                                      sx={{
                                        minHeight: { xs: 44, md: 36 },
                                        fontSize: { xs: '0.875rem', md: '0.8125rem' },
                                        fontWeight: 600,
                                        borderRadius: { xs: 2, md: 1.5 },
                                      }}
                                    >
                                      {t('dashboard.startLearning')}
                                    </Button>
                                  </Box>
                                </ListItem>
                                {index < enrolledCourses.length - 1 && <Divider sx={{ mx: { xs: 1, sm: 2 } }} />}
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                      </Box>
                    )}

                    {/* In Progress Courses Tab */}
                    {tabValue === 1 && (
                      <Box>
                        {inProgressCourses.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            {t('dashboard.noCoursesInProgress')}
                          </Typography>
                        ) : (
                          <List sx={{ p: 0 }}>
                            {inProgressCourses.map((course, index) => (
                              <React.Fragment key={course.id || index}>
                                <ListItem
                                  sx={{
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    py: { xs: 2, md: 2.5 },
                                    px: { xs: 1, sm: 2 },
                                  }}
                                >
                                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 } }}>
                                    <ListItemAvatar sx={{ minWidth: { xs: 48, md: 56 } }}>
                                      <Avatar sx={{ bgcolor: 'info.main', width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 } }}>
                                        <PlayArrow sx={{ fontSize: { xs: 24, md: 28 } }} />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography 
                                          variant="h6" 
                                          sx={{ 
                                            fontWeight: 700,
                                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                            mb: { xs: 0.5, md: 1 },
                                            lineHeight: 1.3,
                                          }}
                                        >
                                          {course.title}
                                        </Typography>
                                      }
                                      secondary={
                                        <Box sx={{ mt: { xs: 0.5, md: 1 } }}>
                                          <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                              fontSize: { xs: '0.85rem', md: '0.875rem' },
                                              mb: { xs: 1, md: 1.5 },
                                            }}
                                          >
                                            {course.instructor?.firstName && course.instructor?.lastName
                                              ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                              : course.instructorName || 'Instructor'}
                                          </Typography>
                                          <Box sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap',
                                            alignItems: 'center', 
                                            gap: { xs: 0.75, md: 1 },
                                            mb: { xs: 1, md: 1.5 },
                                          }}>
                                            {course.level && (
                                              <Chip 
                                                label={course.level} 
                                                size="small" 
                                                color="info" 
                                                variant="outlined"
                                                sx={{ 
                                                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                  height: { xs: 22, md: 24 },
                                                }}
                                              />
                                            )}
                                            <Typography 
                                              variant="body2" 
                                              color="info.main" 
                                              fontWeight="bold"
                                              sx={{ 
                                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                              }}
                                            >
                                              {course.completionPercentage}% {t('common.complete')}
                                            </Typography>
                                          </Box>
                                          {course.totalMaterials > 0 && (
                                            <Box sx={{ mt: { xs: 0.5, md: 1 } }}>
                                              <LinearProgress 
                                                variant="determinate" 
                                                value={course.completionPercentage} 
                                                color="info"
                                                sx={{ 
                                                  height: { xs: 5, md: 6 }, 
                                                  borderRadius: 3,
                                                  mb: 0.5,
                                                }}
                                              />
                                              <Typography 
                                                variant="caption" 
                                                color="text.secondary" 
                                                sx={{ 
                                                  mt: 0.5,
                                                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                }}
                                              >
                                                {course.completedMaterialsCount} {t('dashboard.of')} {course.totalMaterials} {t('dashboard.materialsCompleted')}
                                              </Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      }
                                      sx={{ flex: 1, m: 0 }}
                                    />
                                  </Box>
                                  <Box sx={{ 
                                    width: { xs: '100%', sm: 'auto' },
                                    mt: { xs: 2, sm: 0 },
                                    ml: { xs: 0, sm: 2 },
                                  }}>
                                    <Button 
                                      fullWidth={isMobile}
                                      size={isMobile ? "medium" : "small"}
                                      variant="contained"
                                      color="info"
                                      onClick={() => navigate(`/course-learning/${course.id}`)}
                                      sx={{
                                        minHeight: { xs: 44, md: 36 },
                                        fontSize: { xs: '0.875rem', md: '0.8125rem' },
                                        fontWeight: 600,
                                        borderRadius: { xs: 2, md: 1.5 },
                                      }}
                                    >
                                      {t('dashboard.continueLearning')}
                                    </Button>
                                  </Box>
                                </ListItem>
                                {index < inProgressCourses.length - 1 && <Divider sx={{ mx: { xs: 1, sm: 2 } }} />}
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                      </Box>
                    )}

                    {/* Completed Courses Tab */}
                    {tabValue === 2 && (
                      <Box>
                        {completedCourses.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            {t('dashboard.noCompletedCourses')}
                          </Typography>
                        ) : (
                          <List sx={{ p: 0 }}>
                            {completedCourses.map((course, index) => (
                              <React.Fragment key={course.id || index}>
                                <ListItem
                                  sx={{
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    py: { xs: 2, md: 2.5 },
                                    px: { xs: 1, sm: 2 },
                                  }}
                                >
                                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 } }}>
                                    <ListItemAvatar sx={{ minWidth: { xs: 48, md: 56 } }}>
                                      <Avatar sx={{ bgcolor: 'success.main', width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 } }}>
                                        <WorkspacePremium sx={{ fontSize: { xs: 24, md: 28 } }} />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography 
                                          variant="h6" 
                                          sx={{ 
                                            fontWeight: 700,
                                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                            mb: { xs: 0.5, md: 1 },
                                            lineHeight: 1.3,
                                          }}
                                        >
                                          {course.title}
                                        </Typography>
                                      }
                                      secondary={
                                        <Box sx={{ mt: { xs: 0.5, md: 1 } }}>
                                          <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                              fontSize: { xs: '0.85rem', md: '0.875rem' },
                                              mb: { xs: 1, md: 1.5 },
                                            }}
                                          >
                                            {course.instructor?.firstName && course.instructor?.lastName
                                              ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                              : course.instructorName || 'Instructor'}
                                          </Typography>
                                          <Box sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap',
                                            alignItems: 'center', 
                                            gap: { xs: 0.75, md: 1 },
                                            mb: { xs: 1, md: 1.5 },
                                          }}>
                                            {course.level && (
                                              <Chip 
                                                label={course.level} 
                                                size="small" 
                                                color="success" 
                                                variant="outlined"
                                                sx={{ 
                                                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                  height: { xs: 22, md: 24 },
                                                }}
                                              />
                                            )}
                                            <Chip 
                                              icon={<WorkspacePremium sx={{ fontSize: { xs: 14, md: 16 } }} />}
                                              label={t('dashboard.certificateEarned')} 
                                              size="small" 
                                              color="success"
                                              sx={{ 
                                                fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                height: { xs: 22, md: 24 },
                                              }}
                                            />
                                            <Typography 
                                              variant="body2" 
                                              color="success.main" 
                                              fontWeight="bold"
                                              sx={{ 
                                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                              }}
                                            >
                                              100% {t('common.complete')}
                                            </Typography>
                                          </Box>
                                          {course.totalMaterials > 0 && (
                                            <Box sx={{ mt: { xs: 0.5, md: 1 } }}>
                                              <LinearProgress 
                                                variant="determinate" 
                                                value={100} 
                                                color="success"
                                                sx={{ 
                                                  height: { xs: 5, md: 6 }, 
                                                  borderRadius: 3,
                                                  mb: 0.5,
                                                }}
                                              />
                                              <Typography 
                                                variant="caption" 
                                                color="text.secondary" 
                                                sx={{ 
                                                  mt: 0.5,
                                                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                                                }}
                                              >
                                                {t('dashboard.all')} {course.totalMaterials} {t('dashboard.materialsCompleted')}
                                              </Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      }
                                      sx={{ flex: 1, m: 0 }}
                                    />
                                  </Box>
                                  <Box sx={{ 
                                    width: { xs: '100%', sm: 'auto' },
                                    mt: { xs: 2, sm: 0 },
                                    ml: { xs: 0, sm: 2 },
                                  }}>
                                    <Button 
                                      fullWidth={isMobile}
                                      size={isMobile ? "medium" : "small"}
                                      variant="contained"
                                      color="success"
                                      startIcon={<WorkspacePremium sx={{ fontSize: { xs: 18, md: 20 } }} />}
                                      onClick={() => navigate(`/course-learning/${course.id}`)}
                                      sx={{
                                        minHeight: { xs: 44, md: 36 },
                                        fontSize: { xs: '0.875rem', md: '0.8125rem' },
                                        fontWeight: 600,
                                        borderRadius: { xs: 2, md: 1.5 },
                                      }}
                                    >
                                      {t('dashboard.viewCertificate')}
                                    </Button>
                                  </Box>
                                </ListItem>
                                {index < completedCourses.length - 1 && <Divider sx={{ mx: { xs: 1, sm: 2 } }} />}
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          /* Recent Courses for Instructors */
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.createdCourses')}
                </Typography>
                {loading ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    {t('common.loading')}
                  </Typography>
                ) : recentCourses.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    {t('dashboard.noCoursesCreated')}
                  </Typography>
                ) : (
                  <List>
                    {recentCourses.map((course, index) => (
                      <React.Fragment key={course.id || index}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <BookOnline />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={course.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {course.instructor?.firstName && course.instructor?.lastName
                                    ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                    : course.instructorName || t('courseDetail.instructor')}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <Star sx={{ fontSize: 16, color: 'orange', mr: 0.5 }} />
                                  <Typography variant="body2" sx={{ mr: 2 }}>
                                    4.8
                                  </Typography>
                                  {course.level && (
                                    <Chip 
                                      label={course.level} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="h6" color="primary">
                              ${course.price || 0}
                            </Typography>
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => navigate(`/courses/${course.id}`)}
                            >
                              {t('common.view')}
                            </Button>
                          </Box>
                        </ListItem>
                        {index < recentCourses.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth
                  onClick={() => navigate('/my-courses')}
                >
                  Manage My Courses
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
