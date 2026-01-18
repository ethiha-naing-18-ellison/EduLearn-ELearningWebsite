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
  CircularProgress
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {getGreeting()}, {user.firstName}! 👋
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={user.role} 
            color={getRoleColor(user.role)} 
            size="small" 
          />
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.welcome')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards - Different for Students vs Instructors */}
        {user.role === 'Student' ? (
          <>
            {/* Student Dashboard Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.courses')}</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {stats.enrolledCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.stats.enrolled')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PlayArrow color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.inProgress')}</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    {stats.inProgressCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.stats.activeCourses')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.completed')}</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {stats.completedCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.stats.coursesCompleted')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.progress')}</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.averageProgress}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.courses')}</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.stats.created')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.students')}</Typography>
                  </Box>
                  <Typography variant="h4" color="secondary">
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.stats.totalStudents')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.engagement')}</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.totalCourses > 0 ? Math.round((stats.totalStudents / stats.totalCourses) * 10) / 10 : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.stats.avgStudentsPerCourse')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">{t('dashboard.stats.activities')}</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    -
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.myCourses')}
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab 
                      label={`${t('common.enrolled')} (${enrolledCourses.length})`} 
                      icon={<School />}
                      iconPosition="start"
                    />
                    <Tab 
                      label={`${t('common.inProgress')} (${inProgressCourses.length})`} 
                      icon={<PlayArrow />}
                      iconPosition="start"
                    />
                    <Tab 
                      label={`${t('common.completed')} (${completedCourses.length})`} 
                      icon={<CheckCircle />}
                      iconPosition="start"
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
                          <List>
                            {enrolledCourses.map((course, index) => (
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
                                            : course.instructorName || 'Instructor'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                          {course.level && (
                                            <Chip 
                                              label={course.level} 
                                              size="small" 
                                              color="primary" 
                                              variant="outlined"
                                            />
                                          )}
                                          <Typography variant="body2" color="text.secondary">
                                            {course.completionPercentage}% {t('common.complete')}
                                          </Typography>
                                        </Box>
                                        {course.totalMaterials > 0 && (
                                          <Box sx={{ mt: 1 }}>
                                            <LinearProgress 
                                              variant="determinate" 
                                              value={course.completionPercentage} 
                                              sx={{ height: 6, borderRadius: 3 }}
                                            />
                                          </Box>
                                        )}
                                      </Box>
                                    }
                                  />
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                    <Button 
                                      size="small" 
                                      variant="contained"
                                      onClick={() => navigate(`/course-learning/${course.id}`)}
                                    >
                                      {t('dashboard.startLearning')}
                                    </Button>
                                  </Box>
                                </ListItem>
                                {index < enrolledCourses.length - 1 && <Divider />}
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
                          <List>
                            {inProgressCourses.map((course, index) => (
                              <React.Fragment key={course.id || index}>
                                <ListItem>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'info.main' }}>
                                      <PlayArrow />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={course.title}
                                    secondary={
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          {course.instructor?.firstName && course.instructor?.lastName
                                            ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                            : course.instructorName || 'Instructor'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                          {course.level && (
                                            <Chip 
                                              label={course.level} 
                                              size="small" 
                                              color="info" 
                                              variant="outlined"
                                            />
                                          )}
                                          <Typography variant="body2" color="info.main" fontWeight="bold">
                                            {course.completionPercentage}% {t('common.complete')}
                                          </Typography>
                                        </Box>
                                        {course.totalMaterials > 0 && (
                                          <Box sx={{ mt: 1 }}>
                                            <LinearProgress 
                                              variant="determinate" 
                                              value={course.completionPercentage} 
                                              color="info"
                                              sx={{ height: 6, borderRadius: 3 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                              {course.completedMaterialsCount} {t('dashboard.of')} {course.totalMaterials} {t('dashboard.materialsCompleted')}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Box>
                                    }
                                  />
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                    <Button 
                                      size="small" 
                                      variant="contained"
                                      color="info"
                                      onClick={() => navigate(`/course-learning/${course.id}`)}
                                    >
                                      {t('dashboard.continueLearning')}
                                    </Button>
                                  </Box>
                                </ListItem>
                                {index < inProgressCourses.length - 1 && <Divider />}
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
                          <List>
                            {completedCourses.map((course, index) => (
                              <React.Fragment key={course.id || index}>
                                <ListItem>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'success.main' }}>
                                      <WorkspacePremium />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={course.title}
                                    secondary={
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          {course.instructor?.firstName && course.instructor?.lastName
                                            ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                            : course.instructorName || 'Instructor'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                          {course.level && (
                                            <Chip 
                                              label={course.level} 
                                              size="small" 
                                              color="success" 
                                              variant="outlined"
                                            />
                                          )}
                                          <Chip 
                                            icon={<WorkspacePremium />}
                                            label={t('dashboard.certificateEarned')} 
                                            size="small" 
                                            color="success"
                                          />
                                          <Typography variant="body2" color="success.main" fontWeight="bold">
                                            100% {t('common.complete')}
                                          </Typography>
                                        </Box>
                                        {course.totalMaterials > 0 && (
                                          <Box sx={{ mt: 1 }}>
                                            <LinearProgress 
                                              variant="determinate" 
                                              value={100} 
                                              color="success"
                                              sx={{ height: 6, borderRadius: 3 }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                              {t('dashboard.all')} {course.totalMaterials} {t('dashboard.materialsCompleted')}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Box>
                                    }
                                  />
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                    <Button 
                                      size="small" 
                                      variant="contained"
                                      color="success"
                                      onClick={() => navigate(`/course-learning/${course.id}`)}
                                    >
                                      {t('dashboard.viewCertificate')}
                                    </Button>
                                  </Box>
                                </ListItem>
                                {index < completedCourses.length - 1 && <Divider />}
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
  );
};

export default Dashboard;
