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
  Alert,
  Paper,
  IconButton,
  Tooltip,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  Fade
} from '@mui/material';
import {
  PlayCircle,
  Assignment,
  Quiz,
  CheckCircle,
  Lock,
  VideoLibrary,
  Description,
  ArrowBack,
  MenuBook,
  School,
  MenuBookOutlined,
  Close,
  Download,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialContent, setMaterialContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

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

  const checkEnrollment = async () => {
    if (!user) {
      console.log('No user found, setting enrolled to false');
      setEnrolled(false);
      return;
    }
    
    try {
      setEnrollmentLoading(true);
      console.log('Checking enrollment for course:', id, 'user:', user.id);
      const response = await axios.get(`http://localhost:5000/api/enrollments/check?courseId=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Enrollment check response:', response.data);
      setEnrolled(response.data.isEnrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      console.error('Error response:', error.response?.data);
      setEnrolled(false);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, assignmentsRes, quizzesRes, videosRes, documentsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/lessons/course/${id}`),
        axios.get(`http://localhost:5000/api/assignments/course/${id}`),
        axios.get(`http://localhost:5000/api/quizzes/course/${id}`),
        axios.get(`http://localhost:5000/api/videos/course/${id}`),
        axios.get(`http://localhost:5000/api/documents/course/${id}`)
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setAssignments(assignmentsRes.data);
      setQuizzes(quizzesRes.data);
      setVideos(videosRes.data);
      setDocuments(documentsRes.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMaterialClick = async (type, material) => {
    try {
      setContentLoading(true);
      setSelectedMaterial(material);
      setModalOpen(true);
      
      // Fetch detailed content based on material type
      let content = null;
      switch (type) {
        case 'lesson':
          const lessonResponse = await axios.get(`http://localhost:5000/api/lessons/${material.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          content = lessonResponse.data;
          break;
        case 'assignment':
          const assignmentResponse = await axios.get(`http://localhost:5000/api/assignments/${material.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          content = assignmentResponse.data;
          break;
        case 'quiz':
          const quizResponse = await axios.get(`http://localhost:5000/api/quizzes/${material.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          content = quizResponse.data;
          break;
        case 'video':
          const videoResponse = await axios.get(`http://localhost:5000/api/videos/${material.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          content = videoResponse.data;
          break;
        case 'document':
          const documentResponse = await axios.get(`http://localhost:5000/api/documents/${material.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          content = documentResponse.data;
          break;
        default:
          content = material;
          break;
      }
      
      setMaterialContent(content);
    } catch (error) {
      console.error('Error fetching material content:', error);
      setMaterialContent(material); // Fallback to basic material data
    } finally {
      setContentLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMaterial(null);
    setMaterialContent(null);
    setVideoPlaying(false);
    setVideoMuted(false);
  };

  const toggleVideoPlay = () => {
    setVideoPlaying(!videoPlaying);
  };

  const toggleVideoMute = () => {
    setVideoMuted(!videoMuted);
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    // For other URLs, return as is
    return url;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <PlayCircle color="primary" />;
      case 'Audio':
        return <PlayCircle color="secondary" />;
      case 'Assignment':
        return <Assignment color="secondary" />;
      case 'Quiz':
        return <Quiz color="info" />;
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

  // Create general materials list (all materials combined)
  const generalMaterials = [
    ...sortedLessons.map(lesson => ({ ...lesson, type: 'lesson', materialType: 'Lesson' })),
    ...assignments.map(assignment => ({ ...assignment, type: 'assignment', materialType: 'Assignment' })),
    ...quizzes.map(quiz => ({ ...quiz, type: 'quiz', materialType: 'Quiz' })),
    ...videos.map(video => ({ ...video, type: 'video', materialType: 'Video' })),
    ...documents.map(document => ({ ...document, type: 'document', materialType: 'Document' }))
  ].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (loading || enrollmentLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading course materials...
        </Typography>
      </Container>
    );
  }

  // Check if user is enrolled, if not redirect to course detail
  // Only show this if we're not still loading and we have a definitive answer
  if (user && !enrolled && !enrollmentLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          You need to enroll in this course to access the learning materials.
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/courses/${id}`)}
            size="large"
          >
            Go to Course Details
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => setEnrolled(true)}
            size="large"
            sx={{ ml: 2 }}
          >
            Bypass for Testing
          </Button>
        </Box>
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

  const renderMaterialList = (materials, showType = false) => (
    <List>
      {materials.map((material, index) => (
        <ListItem 
          key={`${material.type || 'material'}-${material.id}`} 
          sx={{ 
            px: 0, 
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
          onClick={() => handleMaterialClick(material.type, material)}
        >
          <ListItemIcon>
            {material.type === 'lesson' && getTypeIcon(material.type)}
            {material.type === 'assignment' && <Assignment color="secondary" />}
            {material.type === 'quiz' && <Quiz color="info" />}
            {material.type === 'video' && getVideoTypeIcon(material.videoType)}
            {material.type === 'document' && getDocumentTypeIcon(material.documentType)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {material.title}
                {showType && (
                  <Chip 
                    label={material.materialType} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {material.duration && (
                  <Typography variant="body2" color="text.secondary">
                    {material.type === 'video' 
                      ? `${Math.floor(material.duration / 60)}:${(material.duration % 60).toString().padStart(2, '0')}`
                      : `${material.duration} min`
                    }
                  </Typography>
                )}
                {material.dueDate && (
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(material.dueDate).toLocaleDateString()}
                  </Typography>
                )}
                {material.totalQuestions && (
                  <Typography variant="body2" color="text.secondary">
                    {material.totalQuestions} questions
                  </Typography>
                )}
                {material.fileSize && (
                  <Typography variant="body2" color="text.secondary">
                    {(material.fileSize / 1024 / 1024).toFixed(1)} MB
                  </Typography>
                )}
                {material.isFree && (
                  <Chip label="Free" size="small" color="success" />
                )}
              </Box>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" />
          </Box>
        </ListItem>
      ))}
      
      {materials.length === 0 && (
        <ListItem sx={{ px: 0 }}>
          <ListItemText
            primary="No materials available"
            secondary="The instructor is still working on adding course materials."
          />
        </ListItem>
      )}
    </List>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            by {course.instructor?.firstName} {course.instructor?.lastName}
          </Typography>
        </Box>
      </Box>

      {/* Course Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardMedia
          component="img"
          height="200"
          image={course.thumbnail || 'https://via.placeholder.com/800x200?text=Course+Image'}
          alt={course.title}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Overview
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {course.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<MenuBook />} 
              label={`${sortedLessons.length} Lessons`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              icon={<Assignment />} 
              label={`${assignments.length} Assignments`} 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              icon={<Quiz />} 
              label={`${quizzes.length} Quizzes`} 
              color="info" 
              variant="outlined" 
            />
            <Chip 
              icon={<VideoLibrary />} 
              label={`${videos.length} Videos`} 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<Description />} 
              label={`${documents.length} Documents`} 
              color="warning" 
              variant="outlined" 
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" icon={<MenuBook />} iconPosition="start" />
          <Tab label="Lessons" icon={<MenuBook />} iconPosition="start" />
          <Tab label="Assignments" icon={<Assignment />} iconPosition="start" />
          <Tab label="Quizzes" icon={<Quiz />} iconPosition="start" />
          <Tab label="Videos" icon={<VideoLibrary />} iconPosition="start" />
          <Tab label="Documents" icon={<Description />} iconPosition="start" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                All Course Materials
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Browse all course materials in one place. Click on any item to access it.
              </Typography>
              {renderMaterialList(generalMaterials, true)}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Lessons
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Step-by-step lessons to guide your learning journey.
              </Typography>
              {renderMaterialList(sortedLessons.map(lesson => ({ ...lesson, type: 'lesson' })))}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Assignments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Practice what you've learned with hands-on assignments.
              </Typography>
              {renderMaterialList(assignments.map(assignment => ({ ...assignment, type: 'assignment' })))}
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Quizzes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Test your knowledge with interactive quizzes.
              </Typography>
              {renderMaterialList(quizzes.map(quiz => ({ ...quiz, type: 'quiz' })))}
            </Box>
          )}

          {tabValue === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Videos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Watch video content to enhance your learning experience.
              </Typography>
              {renderMaterialList(videos.map(video => ({ ...video, type: 'video' })))}
            </Box>
          )}

          {tabValue === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Download and read supplementary materials and resources.
              </Typography>
              {renderMaterialList(documents.map(document => ({ ...document, type: 'document' })))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Material Content Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {selectedMaterial && (
                  <>
                    {selectedMaterial.type === 'lesson' && <MenuBook />}
                    {selectedMaterial.type === 'assignment' && <Assignment />}
                    {selectedMaterial.type === 'quiz' && <Quiz />}
                    {selectedMaterial.type === 'video' && <VideoLibrary />}
                    {selectedMaterial.type === 'document' && <Description />}
                  </>
                )}
                <Typography variant="h5" component="h2">
                  {selectedMaterial?.title || 'Loading...'}
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseModal}
                sx={{ color: 'white' }}
                size="large"
              >
                <Close />
              </IconButton>
            </Box>

            {/* Modal Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {contentLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={60} />
                  <Typography variant="h6">Loading content...</Typography>
                </Box>
              ) : materialContent ? (
                <Box sx={{ height: '100%' }}>
                  {selectedMaterial?.type === 'lesson' && (
                    <Box sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" gutterBottom>
                        Lesson Content
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                        {materialContent.content}
                      </Typography>
                      
                      {(materialContent.videoUrl || materialContent.videoFile) && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Video
                          </Typography>
                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: '400px',
                              bgcolor: 'black',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            {materialContent.videoUrl ? (
                              <iframe
                                src={getEmbedUrl(materialContent.videoUrl)}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allowFullScreen
                                title={materialContent.title}
                              />
                            ) : (
                              <video
                                controls
                                width="100%"
                                height="100%"
                              >
                                <source src={`http://localhost:5000/api/videos/${materialContent.id}/stream`} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      {materialContent.audioUrl && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Audio
                          </Typography>
                          <audio controls style={{ width: '100%' }}>
                            <source src={materialContent.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </Box>
                      )}
                      
                      {(materialContent.documentUrl || materialContent.documentFile) && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Document
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<Download />}
                            href={materialContent.documentUrl || `http://localhost:5000/api/documents/${materialContent.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download Document
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}

                  {selectedMaterial?.type === 'assignment' && (
                    <Box sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" gutterBottom>
                        Assignment Details
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                        {materialContent.description}
                      </Typography>
                      
                      {materialContent.instructions && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Instructions
                          </Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {materialContent.instructions}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                        <Chip
                          label={`Max Points: ${materialContent.maxPoints}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`Due: ${new Date(materialContent.dueDate).toLocaleDateString()}`}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          label={`Type: ${materialContent.type}`}
                          color="info"
                          variant="outlined"
                        />
                        {materialContent.allowLateSubmission && (
                          <Chip
                            label={`Late Penalty: ${materialContent.latePenaltyPercentage}%`}
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Button variant="contained" size="large">
                        Start Assignment
                      </Button>
                    </Box>
                  )}

                  {selectedMaterial?.type === 'quiz' && (
                    <Box sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" gutterBottom>
                        Quiz Details
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                        {materialContent.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                        <Chip
                          label={`Time Limit: ${materialContent.timeLimit} minutes`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`Max Attempts: ${materialContent.maxAttempts}`}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          label={`Questions: ${materialContent.totalQuestions}`}
                          color="info"
                          variant="outlined"
                        />
                        <Chip
                          label={`Passing Score: ${materialContent.passingScore}%`}
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                      
                      {materialContent.availableFrom && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Available from: {new Date(materialContent.availableFrom).toLocaleString()}
                        </Typography>
                      )}
                      
                      {materialContent.availableUntil && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Available until: {new Date(materialContent.availableUntil).toLocaleString()}
                        </Typography>
                      )}
                      
                      <Button variant="contained" size="large">
                        Start Quiz
                      </Button>
                    </Box>
                  )}

                  {selectedMaterial?.type === 'video' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Video Player */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: '70%',
                          bgcolor: 'black',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        }}
                      >
                        {(materialContent.videoUrl || materialContent.videoFile) ? (
                          materialContent.videoUrl ? (
                            <iframe
                              src={getEmbedUrl(materialContent.videoUrl)}
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              allowFullScreen
                              title={materialContent.title}
                              style={{ borderRadius: '4px' }}
                            />
                          ) : (
                            <video
                              controls
                              width="100%"
                              height="100%"
                              style={{ borderRadius: '4px' }}
                            >
                              <source src={`http://localhost:5000/api/videos/${materialContent.id}/stream`} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )
                        ) : (
                          <Box sx={{ textAlign: 'center', color: 'white', p: 4 }}>
                            <VideoLibrary sx={{ fontSize: 80, mb: 2, opacity: 0.7 }} />
                            <Typography variant="h5" sx={{ mb: 1 }}>Video not available</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              The video content is currently unavailable
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Video Details */}
                      <Box sx={{ 
                        p: 3, 
                        height: '30%', 
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        borderTop: 1,
                        borderColor: 'divider'
                      }}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {materialContent.title}
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            mb: 2, 
                            whiteSpace: 'pre-wrap',
                            color: 'text.secondary',
                            lineHeight: 1.6
                          }}>
                            {materialContent.description}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                          <Chip
                            icon={<PlayArrow />}
                            label={`${Math.floor(materialContent.duration / 60)}:${(materialContent.duration % 60).toString().padStart(2, '0')}`}
                            color="primary"
                            variant="filled"
                            sx={{ fontWeight: 500 }}
                          />
                          <Chip
                            icon={<VideoLibrary />}
                            label={materialContent.videoType}
                            color="secondary"
                            variant="filled"
                            sx={{ fontWeight: 500 }}
                          />
                          <Chip
                            label={materialContent.quality}
                            color="info"
                            variant="filled"
                            sx={{ fontWeight: 500 }}
                          />
                          {materialContent.isFree && (
                            <Chip 
                              label="Free Content" 
                              color="success" 
                              variant="filled"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                          {materialContent.isPublished && (
                            <Chip 
                              label="Published" 
                              color="default" 
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </Box>
                        
                        {(materialContent.transcript || materialContent.notes) && (
                          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            {materialContent.transcript && (
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <Description />
                                  Transcript
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  color: 'text.secondary',
                                  lineHeight: 1.5,
                                  maxHeight: '120px',
                                  overflow: 'auto',
                                  p: 2,
                                  bgcolor: 'grey.50',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'grey.200'
                                }}>
                                  {materialContent.transcript}
                                </Typography>
                              </Box>
                            )}
                            
                            {materialContent.notes && (
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" gutterBottom sx={{ 
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <MenuBook />
                                  Instructor Notes
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  color: 'text.secondary',
                                  lineHeight: 1.5,
                                  maxHeight: '120px',
                                  overflow: 'auto',
                                  p: 2,
                                  bgcolor: 'grey.50',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'grey.200'
                                }}>
                                  {materialContent.notes}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}

                  {selectedMaterial?.type === 'document' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Document Viewer */}
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                        }}
                      >
                        {materialContent.documentUrl ? (
                          <iframe
                            src={materialContent.documentUrl}
                            width="100%"
                            height="100%"
                            title={materialContent.title}
                          />
                        ) : (
                          <Box sx={{ textAlign: 'center' }}>
                            <Description sx={{ fontSize: 80, mb: 2, color: 'grey.400' }} />
                            <Typography variant="h6" color="text.secondary">
                              Document preview not available
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Download />}
                              href={`http://localhost:5000/api/documents/${materialContent.id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ mt: 2 }}
                            >
                              Download Document
                            </Button>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Document Details */}
                      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" gutterBottom>
                          {materialContent.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                          {materialContent.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          <Chip
                            label={`Type: ${materialContent.documentType}`}
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`Format: ${materialContent.fileFormat}`}
                            color="secondary"
                            variant="outlined"
                          />
                          <Chip
                            label={`Size: ${(materialContent.fileSize / 1024 / 1024).toFixed(1)} MB`}
                            color="info"
                            variant="outlined"
                          />
                          {materialContent.pageCount > 0 && (
                            <Chip
                              label={`Pages: ${materialContent.pageCount}`}
                              color="warning"
                              variant="outlined"
                            />
                          )}
                          {materialContent.isFree && (
                            <Chip label="Free" color="success" variant="outlined" />
                          )}
                        </Box>
                        
                        {materialContent.summary && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Summary
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {materialContent.summary}
                            </Typography>
                          </Box>
                        )}
                        
                        {materialContent.notes && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Notes
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {materialContent.notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Content not available
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default CourseLearning;
