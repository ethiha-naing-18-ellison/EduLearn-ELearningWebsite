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
  CheckCircle,
  Lock,
  VideoLibrary,
  Description
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { getTranslation } from '../utils/translations';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const { showSuccess, showError, showWarning } = useNotification();

  const t = (key) => getTranslation(language, key);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchCourseData();
    checkEnrollment();
  }, [id, user]);

  // Refresh enrollment status when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        checkEnrollment();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, assignmentsRes, videosRes, documentsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/lessons/course/${id}`),
        axios.get(`http://localhost:5000/api/assignments/course/${id}`),
        axios.get(`http://localhost:5000/api/videos/course/${id}`),
        axios.get(`http://localhost:5000/api/documents/course/${id}`)
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setAssignments(assignmentsRes.data);
      setVideos(videosRes.data);
      setDocuments(documentsRes.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) {
      setEnrolled(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setEnrolled(false);
      return;
    }
    
    try {
      setEnrollmentLoading(true);
      const response = await axios.get(`http://localhost:5000/api/enrollments/check?courseId=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEnrolled(response.data.isEnrolled);
    } catch (error) {
      // Handle 401 errors (user not authenticated or token expired)
      if (error.response?.status === 401) {
        setEnrolled(false);
        // Clear invalid token and logout user
        logout();
        // Optionally show message and redirect to login
        // Note: We don't redirect here to avoid disrupting the user's browsing experience
        // The user can still view course details, they just need to login to enroll
      } else {
        console.error('Error checking enrollment:', error);
        setEnrolled(false);
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrollmentLoading(true);
      await axios.post('http://localhost:5000/api/enrollments/enroll', {
        courseId: parseInt(id)
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEnrolled(true);
      // Refresh enrollment status to ensure consistency
      await checkEnrollment();
      showSuccess(t('courseDetail.enrollSuccess') || 'Successfully enrolled in course!', { 
        title: t('courseDetail.enrollmentSuccess') || 'Enrollment Successful' 
      });
    } catch (error) {
      console.error('Error enrolling:', error);
      // Handle 401 errors (token expired or invalid)
      if (error.response?.status === 401) {
        logout();
        showWarning(t('courseDetail.sessionExpired'), { title: 'Session Expired' });
        navigate('/login');
        return;
      }
      // Show error message to user
      if (error.response?.status === 409) {
        setEnrolled(true);
        showWarning(t('courseDetail.alreadyEnrolled') || 'You are already enrolled in this course.');
      } else {
        showError(t('courseDetail.enrollFailed'), { title: t('courseDetail.enrollmentFailed') || 'Enrollment Failed' });
      }
    } finally {
      setEnrollmentLoading(false);
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
          {t('common.loading')}
        </Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {t('courseDetail.courseNotFound')}
        </Alert>
      </Container>
    );
  }

  // Helper function to get icon based on type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <PlayCircle color="primary" />;
      case 'Audio':
        return <PlayCircle color="secondary" />;
      case 'Assignment':
        return <Assignment color="secondary" />;
      case 'Document':
        return <Assignment color="primary" />;
      case 'Text':
        return <Assignment color="default" />;
      default:
        return <PlayCircle color="primary" />;
    }
  };

  const getVideoTypeIcon = (videoType) => {
    switch (videoType) {
      case 'YouTube':
        return <VideoLibrary color="error" />;
      case 'Vimeo':
        return <VideoLibrary color="primary" />;
      case 'Upload':
        return <VideoLibrary color="success" />;
      case 'Other':
        return <VideoLibrary color="default" />;
      default:
        return <VideoLibrary color="primary" />;
    }
  };

  const getDocumentTypeIcon = (documentType) => {
    switch (documentType) {
      case 'PDF':
        return <Description color="error" />;
      case 'DOC':
      case 'DOCX':
        return <Description color="primary" />;
      case 'PPT':
      case 'PPTX':
        return <Description color="warning" />;
      case 'XLS':
      case 'XLSX':
        return <Description color="success" />;
      case 'TXT':
        return <Description color="default" />;
      case 'HTML':
        return <Description color="info" />;
      default:
        return <Description color="primary" />;
    }
  };

  // Sort lessons by order
  const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

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
                  {course.isFree ? t('courses.free') : `$${course.price}`}
                </Typography>
              </Box>

              <Typography variant="h3" gutterBottom>
                {course.title}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('courses.by')} {course.instructor?.firstName} {course.instructor?.lastName}
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
                    1,250 {t('courses.students')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {course.duration} {t('courseDetail.hours')}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {course.description}
              </Typography>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab label={t('courseDetail.curriculum')} />
                  <Tab label={t('courseDetail.instructor')} />
                  <Tab label={t('courseDetail.reviews')} />
                </Tabs>
              </Box>

              {/* Tab Content */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('courseDetail.courseContent')}
                  </Typography>
                  <List>
                    {/* Display lessons */}
                    {sortedLessons.map((lesson, index) => (
                      <ListItem key={`lesson-${lesson.id}`} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getTypeIcon(lesson.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={lesson.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {lesson.duration} {t('courseDetail.minutes')}
                              </Typography>
                              {lesson.isFree && (
                                <Chip label={t('courses.free')} size="small" color="success" />
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
                    
                    {/* Display assignments */}
                    {assignments.map((assignment, index) => (
                      <ListItem key={`assignment-${assignment.id}`} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Assignment color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={assignment.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('courseDetail.assignments')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('courseDetail.due')}: {new Date(assignment.dueDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {enrolled ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Lock color="disabled" />
                          )}
                        </Box>
                      </ListItem>
                    ))}
                    
                    
                    {/* Display videos */}
                    {videos.map((video, index) => (
                      <ListItem key={`video-${video.id}`} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getVideoTypeIcon(video.videoType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={video.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('courseDetail.videos')} - {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {video.videoType} • {video.quality}
                              </Typography>
                              {video.isFree && (
                                <Chip label={t('courses.free')} size="small" color="success" />
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {enrolled ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Lock color="disabled" />
                          )}
                        </Box>
                      </ListItem>
                    ))}
                    
                    {/* Display documents */}
                    {documents.map((document, index) => (
                      <ListItem key={`document-${document.id}`} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getDocumentTypeIcon(document.documentType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={document.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('courseDetail.documents')} - {document.documentType}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(document.fileSize / 1024 / 1024).toFixed(1)} MB
                              </Typography>
                              {document.pageCount > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                  {document.pageCount} {t('courseDetail.pages')}
                                </Typography>
                              )}
                              {document.isFree && (
                                <Chip label={t('courses.free')} size="small" color="success" />
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {enrolled ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Lock color="disabled" />
                          )}
                        </Box>
                      </ListItem>
                    ))}
                    
                    {/* Show message if no content */}
                    {sortedLessons.length === 0 && assignments.length === 0 && videos.length === 0 && documents.length === 0 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={t('courseDetail.noContentAvailable')}
                          secondary={t('courseDetail.instructorWorkingOnContent')}
                        />
                      </ListItem>
                    )}
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
                        {t('courseDetail.seniorWebDeveloper')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Star sx={{ fontSize: 16, color: 'orange', mr: 0.5 }} />
                        <Typography variant="body2">{t('courseDetail.instructorRating')}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body1">
                    {t('courseDetail.instructorBio')}
                  </Typography>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('courseDetail.studentReviews')}
                  </Typography>
                  {/* Reviews would go here */}
                  <Typography variant="body2" color="text.secondary">
                    {t('courseDetail.reviewsComingSoon')}
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
                {course.isFree ? t('courseDetail.freeCourse') : `$${course.price}`}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('courseDetail.whatYouWillLearn')}:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={t('courseDetail.learn1')} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={t('courseDetail.learn2')} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={t('courseDetail.learn3')} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={t('courseDetail.learn4')} />
                  </ListItem>
                </List>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('courseDetail.courseIncludes')}:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PlayCircle color="primary" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={`${sortedLessons.length} ${t('courseDetail.lessons')}`} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Assignment color="secondary" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={`${assignments.length} ${t('courseDetail.assignments')}`} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <VideoLibrary color="success" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={`${videos.length} ${t('courseDetail.videos')}`} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Description color="info" sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={`${documents.length} ${t('courseDetail.documents')}`} />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2 }}>
              {user?.role === 'Instructor' || user?.role === 'Admin' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    onClick={() => navigate(`/edit-course/${course.id}`)}
                  >
                    {t('courseDetail.editCourse')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    size="large"
                    onClick={() => navigate(`/manage-materials/${course.id}`)}
                  >
                    {t('courseDetail.manageCourseMaterials')}
                  </Button>
                </Box>
              ) : enrolled ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <Button variant="contained" fullWidth size="large">
                    {t('dashboard.continueLearning')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    size="large"
                    onClick={() => navigate(`/course-learning/${course.id}`)}
                  >
                    {t('courseDetail.goToCourse')}
                  </Button>
                </Box>
              ) : (
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={handleEnroll}
                  disabled={enrollmentLoading}
                >
                  {enrollmentLoading ? t('courseDetail.enrolling') : (course.isFree ? t('courseDetail.enrollForFree') : `${t('courseDetail.enrollFor')} $${course.price}`)}
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
