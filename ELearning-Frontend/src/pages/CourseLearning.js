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
  Tooltip
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
  MenuBookOutlined
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

  const handleMaterialClick = (type, material) => {
    // Navigate to specific material based on type
    switch (type) {
      case 'lesson':
        // Navigate to lesson detail or open lesson content
        console.log('Opening lesson:', material);
        break;
      case 'assignment':
        // Navigate to assignment detail
        console.log('Opening assignment:', material);
        break;
      case 'quiz':
        // Navigate to quiz
        console.log('Opening quiz:', material);
        break;
      case 'video':
        // Open video player
        console.log('Opening video:', material);
        break;
      case 'document':
        // Open document viewer
        console.log('Opening document:', material);
        break;
      default:
        break;
    }
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
    </Container>
  );
};

export default CourseLearning;
