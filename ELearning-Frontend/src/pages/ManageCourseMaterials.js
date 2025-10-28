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
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Assignment,
  Quiz,
  Schedule,
  Grade,
  Visibility,
  VideoLibrary,
  Description,
  CloudUpload
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ManageCourseMaterials = () => {
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
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [openQuestionsDialog, setOpenQuestionsDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingType, setViewingType] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

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
      setMessage('Error loading course materials');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddNew = (type) => {
    setDialogType(type);
    setEditingItem(null);
    // Clear file selections
    setSelectedVideoFile(null);
    setSelectedDocumentFile(null);
    setSelectedThumbnailFile(null);
    
    if (type === 'lesson') {
    setFormData({
      title: '',
      description: '',
        content: '',
        courseId: parseInt(id),
        duration: 30,
        order: 1,
        isFree: false,
        type: 'Video'
      });
    } else if (type === 'assignment') {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        courseId: parseInt(id),
        maxPoints: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7 days from now
        allowLateSubmission: false,
        latePenaltyPercentage: 0,
        type: 'Essay'
      });
    } else if (type === 'quiz') {
      setFormData({
        title: '',
        description: '',
        courseId: parseInt(id),
        timeLimit: 30,
        maxAttempts: 1,
        isRandomized: false,
        showCorrectAnswers: true,
        showResultsImmediately: true,
        passingScore: 60,
        availableFrom: '',
        availableUntil: ''
      });
    } else if (type === 'video') {
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        videoFile: '',
        thumbnail: '',
        duration: 0,
        order: videos.length + 1,
        isFree: false,
        isPublished: true,
        videoType: 'Upload',
        quality: 'HD',
        transcript: '',
        notes: '',
      courseId: parseInt(id)
    });
    } else if (type === 'document') {
      setFormData({
        title: '',
        description: '',
        documentUrl: '',
        documentFile: '',
        thumbnail: '',
        fileSize: 0,
        pageCount: 0,
        order: documents.length + 1,
        isFree: false,
        isPublished: true,
        documentType: 'PDF',
        fileFormat: 'PDF',
        version: '1.0',
        language: 'en',
        keywords: '',
        summary: '',
        notes: '',
        courseId: parseInt(id)
      });
    }
    
    setOpenDialog(true);
  };

  const handleEdit = (item, type) => {
    setDialogType(type);
    setEditingItem(item);
    // Clear file selections
    setSelectedVideoFile(null);
    setSelectedDocumentFile(null);
    setSelectedThumbnailFile(null);
    
    if (type === 'lesson') {
    setFormData({
      title: item.title,
      description: item.description,
        content: item.content || '',
        courseId: parseInt(id),
        duration: item.duration || 30,
        order: item.order || 1,
        isFree: item.isFree || false,
        type: item.type || 'Video',
      ...item
    });
    } else if (type === 'assignment') {
      setFormData({
        title: item.title,
        description: item.description,
        instructions: item.instructions || '',
        courseId: parseInt(id),
        maxPoints: item.maxPoints || 100,
        dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 16) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        allowLateSubmission: item.allowLateSubmission || false,
        latePenaltyPercentage: item.latePenaltyPercentage || 0,
        type: item.type || 'Essay',
        ...item
      });
    } else if (type === 'quiz') {
      setFormData({
        title: item.title,
        description: item.description,
        courseId: parseInt(id),
        timeLimit: item.timeLimit || 30,
        maxAttempts: item.maxAttempts || 1,
        isRandomized: item.isRandomized || false,
        showCorrectAnswers: item.showCorrectAnswers !== undefined ? item.showCorrectAnswers : true,
        showResultsImmediately: item.showResultsImmediately !== undefined ? item.showResultsImmediately : true,
        passingScore: item.passingScore || 60,
        availableFrom: item.availableFrom ? new Date(item.availableFrom).toISOString().slice(0, 16) : '',
        availableUntil: item.availableUntil ? new Date(item.availableUntil).toISOString().slice(0, 16) : '',
        ...item
      });
    } else if (type === 'video') {
      setFormData({
        title: item.title,
        description: item.description,
        videoUrl: item.videoUrl || '',
        videoFile: item.videoFile || '',
        thumbnail: item.thumbnail || '',
        duration: item.duration || 0,
        order: item.order || 1,
        isFree: item.isFree || false,
        isPublished: item.isPublished !== undefined ? item.isPublished : true,
        videoType: item.videoType || 'Upload',
        quality: item.quality || 'HD',
        transcript: item.transcript || '',
        notes: item.notes || '',
        courseId: parseInt(id),
        ...item
      });
    } else if (type === 'document') {
      setFormData({
        title: item.title,
        description: item.description,
        documentUrl: item.documentUrl || '',
        documentFile: item.documentFile || '',
        thumbnail: item.thumbnail || '',
        fileSize: item.fileSize || 0,
        pageCount: item.pageCount || 0,
        order: item.order || 1,
        isFree: item.isFree || false,
        isPublished: item.isPublished !== undefined ? item.isPublished : true,
        documentType: item.documentType || 'PDF',
        fileFormat: item.fileFormat || 'PDF',
        version: item.version || '1.0',
        language: item.language || 'en',
        keywords: item.keywords || '',
        summary: item.summary || '',
        notes: item.notes || '',
        courseId: parseInt(id),
        ...item
      });
    }
    
    setOpenDialog(true);
  };

  const handleDelete = async (item, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const endpoint = type === 'lesson' ? 'lessons' : 
                     type === 'assignment' ? 'assignments' : 
                     type === 'quiz' ? 'quizzes' : 
                     type === 'video' ? 'videos' : 'documents';
      await axios.delete(`http://localhost:5000/api/${endpoint}/${item.id}`);
      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      fetchCourseData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setMessage(`Error deleting ${type}`);
    }
  };

  const handleManageQuestions = async (quiz) => {
    setSelectedQuiz(quiz);
    try {
      const response = await axios.get(`http://localhost:5000/api/quizquestions/quiz/${quiz.id}`);
      setQuizQuestions(response.data);
      setOpenQuestionsDialog(true);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setMessage('Error loading quiz questions');
    }
  };

  const fetchQuizQuestions = async (quizId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizquestions/quiz/${quizId}`);
      setQuizQuestions(response.data);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      question: '',
      correctAnswer: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      explanation: '',
      points: 1,
      type: 'MultipleChoice',
      quizId: selectedQuiz?.id
    });
    setOpenQuestionDialog(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      question: question.question,
      correctAnswer: question.correctAnswer,
      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      explanation: question.explanation || '',
      points: question.points,
      type: question.type,
      quizId: question.quizId
    });
    setOpenQuestionDialog(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/quizquestions/${questionId}`);
      setMessage('Question deleted successfully');
      fetchQuizQuestions(selectedQuiz.id);
    } catch (error) {
      console.error('Error deleting question:', error);
      setMessage('Error deleting question');
    }
  };

  const handleQuestionFormChange = (field, value) => {
    setQuestionFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveQuestion = async () => {
    try {
      setSaving(true);
      
      if (editingQuestion) {
        // Update existing question
        await axios.put(`http://localhost:5000/api/quizquestions/${editingQuestion.id}`, questionFormData);
        setMessage('Question updated successfully');
      } else {
        // Create new question
        await axios.post('http://localhost:5000/api/quizquestions', questionFormData);
        setMessage('Question created successfully');
      }
      
      setOpenQuestionDialog(false);
      fetchQuizQuestions(selectedQuiz.id);
    } catch (error) {
      console.error('Error saving question:', error);
      setMessage('Error saving question');
    } finally {
      setSaving(false);
    }
  };

  const handleView = (item, type) => {
    setViewingItem(item);
    setViewingType(type);
    setOpenViewDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    let requestData = { ...formData }; // Initialize requestData at the top
    
    try {
      const endpoint = dialogType === 'lesson' ? 'lessons' : 
                     dialogType === 'assignment' ? 'assignments' : 
                     dialogType === 'quiz' ? 'quizzes' : 
                     dialogType === 'video' ? 'videos' : 'documents';

      // Handle file uploads if files are selected
      if (dialogType === 'video' && selectedVideoFile) {
        // For now, we'll just use the file name
        // In a real implementation, you'd upload the file to a server
        requestData.videoFile = selectedVideoFile.name;
        requestData.videoUrl = ''; // Clear URL when file is uploaded
      }
      
      if (dialogType === 'document' && selectedDocumentFile) {
        // For now, we'll just use the file name and size
        // In a real implementation, you'd upload the file to a server
        requestData.documentFile = selectedDocumentFile.name;
        requestData.documentUrl = ''; // Clear URL when file is uploaded
        requestData.fileSize = selectedDocumentFile.size;
      }
      
      if ((dialogType === 'video' || dialogType === 'document') && selectedThumbnailFile) {
        // For now, we'll just use the file name
        // In a real implementation, you'd upload the file to a server
        requestData.thumbnail = selectedThumbnailFile.name;
      }
      
      // Prepare the data based on the type
      
      if (dialogType === 'lesson') {
        // Ensure all required fields are present for lessons
        requestData = {
          title: formData.title || 'Untitled Lesson',
          content: formData.content || formData.description || 'No content provided', // Use description as content if content is empty
          duration: formData.duration || 30,
          order: formData.order || 1,
          isFree: formData.isFree || false,
          type: formData.type || 'Video',
          courseId: formData.courseId
        };
        
        // Validate required fields
        if (!requestData.title.trim()) {
          setMessage('Title is required for lessons');
          return;
        }
        if (!requestData.content.trim()) {
          setMessage('Content is required for lessons');
          return;
        }
      } else if (dialogType === 'assignment') {
        // Ensure all required fields are present for assignments
        // Convert date to proper ISO format
        let dueDate;
        if (formData.dueDate) {
          // If it's already in ISO format, use it; otherwise convert
          if (formData.dueDate.includes('T')) {
            dueDate = new Date(formData.dueDate).toISOString();
          } else {
            dueDate = new Date(formData.dueDate + 'T00:00:00.000Z').toISOString();
          }
        } else {
          dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        requestData = {
          title: formData.title || 'Untitled Assignment',
          description: formData.description || 'No description provided',
          instructions: formData.instructions || '',
          maxPoints: formData.maxPoints || 100,
          dueDate: dueDate,
          allowLateSubmission: formData.allowLateSubmission || false,
          latePenaltyPercentage: formData.latePenaltyPercentage || 0,
          type: formData.type || 'Essay',
          courseId: formData.courseId
        };
        
        // Debug logging
        console.log('Assignment request data:', requestData);
        console.log('Form data:', formData);
        
        // Validate required fields
        if (!requestData.title.trim()) {
          setMessage('Title is required for assignments');
          return;
        }
        if (!requestData.description.trim()) {
          setMessage('Description is required for assignments');
          return;
        }
      } else if (dialogType === 'quiz') {
        // Ensure all required fields are present for quizzes
        requestData = {
          title: formData.title || 'Untitled Quiz',
          description: formData.description || 'No description provided',
          timeLimit: formData.timeLimit || 30,
          maxAttempts: formData.maxAttempts || 1,
          isRandomized: formData.isRandomized || false,
          showCorrectAnswers: formData.showCorrectAnswers !== undefined ? formData.showCorrectAnswers : true,
          showResultsImmediately: formData.showResultsImmediately !== undefined ? formData.showResultsImmediately : true,
          passingScore: formData.passingScore || 60,
          availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
          availableUntil: formData.availableUntil ? new Date(formData.availableUntil).toISOString() : null,
          courseId: formData.courseId
        };
        
        // Validate required fields
        if (!requestData.title.trim()) {
          setMessage('Title is required for quizzes');
          return;
        }
        if (!requestData.description.trim()) {
          setMessage('Description is required for quizzes');
          return;
        }
      } else if (dialogType === 'video') {
        // Ensure all required fields are present for videos
        requestData = {
          title: formData.title || 'Untitled Video',
          description: formData.description || 'No description provided',
          videoUrl: formData.videoUrl || '',
          videoFile: formData.videoFile || '',
          thumbnail: formData.thumbnail || '',
          duration: formData.duration || 0,
          order: formData.order || 1,
          isFree: formData.isFree || false,
          isPublished: formData.isPublished !== undefined ? formData.isPublished : true,
          videoType: formData.videoType || 'Upload',
          quality: formData.quality || 'HD',
          transcript: formData.transcript || '',
          notes: formData.notes || '',
          courseId: formData.courseId
        };
        
        // Validate required fields
        if (!requestData.title.trim()) {
          setMessage('Title is required for videos');
          return;
        }
        if (!requestData.description.trim()) {
          setMessage('Description is required for videos');
          return;
        }
        if (!requestData.videoUrl && !requestData.videoFile) {
          setMessage('Either video URL or video file is required');
          return;
        }
      } else if (dialogType === 'document') {
        // Ensure all required fields are present for documents
        requestData = {
          title: formData.title || 'Untitled Document',
          description: formData.description || 'No description provided',
          documentUrl: formData.documentUrl || '',
          documentFile: formData.documentFile || '',
          thumbnail: formData.thumbnail || '',
          fileSize: formData.fileSize || 0,
          pageCount: formData.pageCount || 0,
          order: formData.order || 1,
          isFree: formData.isFree || false,
          isPublished: formData.isPublished !== undefined ? formData.isPublished : true,
          documentType: formData.documentType || 'PDF',
          fileFormat: formData.fileFormat || 'PDF',
          version: formData.version || '1.0',
          language: formData.language || 'en',
          keywords: formData.keywords || '',
          summary: formData.summary || '',
          notes: formData.notes || '',
          courseId: formData.courseId
        };
        
        // Validate required fields
        if (!requestData.title.trim()) {
          setMessage('Title is required for documents');
          return;
        }
        if (!requestData.description.trim()) {
          setMessage('Description is required for documents');
          return;
        }
        if (!requestData.documentUrl && !requestData.documentFile) {
          setMessage('Either document URL or document file is required');
          return;
        }
      }
      
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/${endpoint}/${editingItem.id}`, requestData);
        setMessage(`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} updated successfully`);
      } else {
        await axios.post(`http://localhost:5000/api/${endpoint}`, requestData);
        setMessage(`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} created successfully`);
      }
      
      setOpenDialog(false);
      fetchCourseData();
    } catch (error) {
      console.error(`Error saving ${dialogType}:`, error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request data that was sent:', requestData || 'Not available');
      
      let errorMessage = `Error saving ${dialogType}`;
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data) {
        errorMessage += `: ${JSON.stringify(error.response.data)}`;
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (file, type) => {
    if (type === 'video') {
      setSelectedVideoFile(file);
      setFormData(prev => ({
        ...prev,
        videoFile: file.name,
        videoUrl: '' // Clear URL when file is selected
      }));
    } else if (type === 'document') {
      setSelectedDocumentFile(file);
      setFormData(prev => ({
        ...prev,
        documentFile: file.name,
        documentUrl: '', // Clear URL when file is selected
        fileSize: file.size
      }));
    } else if (type === 'thumbnail') {
      setSelectedThumbnailFile(file);
      setFormData(prev => ({
        ...prev,
        thumbnail: file.name
      }));
    }
  };

  const handleFileInputChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading course materials...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Manage Course Materials
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {course?.title} - Manage lessons, assignments, and quizzes
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Lessons (${lessons.length})`} />
            <Tab label={`Assignments (${assignments.length})`} />
            <Tab label={`Quizzes (${quizzes.length})`} />
            <Tab label={`Videos (${videos.length})`} />
            <Tab label={`Documents (${documents.length})`} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Lessons Tab */}
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Course Lessons</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleAddNew('lesson')}
                >
                  Add Lesson
                </Button>
              </Box>
              <List>
                {lessons.map((lesson, index) => (
                  <ListItem key={lesson.id} divider>
                    <ListItemText
                      primary={lesson.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {lesson.content || lesson.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={`${lesson.duration} min`} size="small" />
                            <Chip 
                              label={lesson.isFree ? 'Free' : 'Premium'} 
                              size="small" 
                              color={lesson.isFree ? 'success' : 'primary'}
                            />
                            <Chip label={`Order: ${lesson.order}`} size="small" variant="outlined" />
                            <Chip label={lesson.type} size="small" color="secondary" />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleView(lesson, 'lesson')}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(lesson, 'lesson')}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(lesson, 'lesson')}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {lessons.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No lessons added yet. Click "Add Lesson" to get started.
                  </Typography>
                )}
              </List>
            </Box>
          )}

          {/* Assignments Tab */}
          {tabValue === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Course Assignments</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleAddNew('assignment')}
                >
                  Add Assignment
                </Button>
              </Box>
              <List>
                {assignments.map((assignment) => (
                  <ListItem key={assignment.id} divider>
                    <ListItemText
                      primary={assignment.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {assignment.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={`${assignment.maxPoints} points`} size="small" />
                            <Chip 
                              label={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`} 
                              size="small" 
                              color="warning"
                            />
                            <Chip label={assignment.type} size="small" color="secondary" />
                            <Chip label={`${assignment.submissions?.length || 0} submissions`} size="small" variant="outlined" />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleView(assignment, 'assignment')}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(assignment, 'assignment')}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(assignment, 'assignment')}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {assignments.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No assignments added yet. Click "Add Assignment" to get started.
                  </Typography>
                )}
              </List>
            </Box>
          )}

          {/* Quizzes Tab */}
          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Course Quizzes</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleAddNew('quiz')}
                >
                  Add Quiz
                </Button>
              </Box>
              <List>
                {quizzes.map((quiz) => (
                  <ListItem key={quiz.id} divider>
                    <ListItemText
                      primary={quiz.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {quiz.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            <Chip label={`${quiz.timeLimit} min`} size="small" />
                            <Chip label={`${quiz.maxAttempts} attempts`} size="small" />
                            <Chip label={`${quiz.passingScore}% pass`} size="small" />
                            <Chip label={`${quiz.totalQuestions} questions`} size="small" variant="outlined" />
                            {quiz.isRandomized && <Chip label="Randomized" size="small" color="primary" />}
                            {!quiz.showCorrectAnswers && <Chip label="No answers" size="small" color="warning" />}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleView(quiz, 'quiz')}>
                        <Visibility />
                      </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleManageQuestions(quiz)}
                        sx={{ mr: 1 }}
                      >
                        Questions
                      </Button>
                      <IconButton onClick={() => handleEdit(quiz, 'quiz')}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(quiz, 'quiz')}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {quizzes.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No quizzes added yet. Click "Add Quiz" to get started.
                  </Typography>
                )}
              </List>
            </Box>
          )}

          {/* Videos Tab */}
          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Course Videos</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleAddNew('video')}
                >
                  Add Video
                </Button>
              </Box>
              <List>
                {videos.map((video) => (
                  <ListItem key={video.id} divider>
                    <ListItemText
                      primary={video.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {video.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={`${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`} size="small" />
                            <Chip label={video.videoType} size="small" />
                            <Chip label={video.quality} size="small" />
                            {video.isFree && <Chip label="Free" size="small" color="success" />}
                            {!video.isPublished && <Chip label="Draft" size="small" color="warning" />}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleView(video, 'video')}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(video, 'video')}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(video, 'video')}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {videos.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No videos added yet. Click "Add Video" to get started.
                  </Typography>
                )}
              </List>
            </Box>
          )}

          {/* Documents Tab */}
          {tabValue === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Course Documents</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleAddNew('document')}
                >
                  Add Document
                </Button>
              </Box>
              <List>
                {documents.map((document) => (
                  <ListItem key={document.id} divider>
                    <ListItemText
                      primary={document.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {document.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={document.documentType} size="small" />
                            <Chip label={document.fileFormat} size="small" />
                            <Chip label={`${(document.fileSize / 1024 / 1024).toFixed(1)} MB`} size="small" />
                            {document.pageCount > 0 && <Chip label={`${document.pageCount} pages`} size="small" />}
                            {document.isFree && <Chip label="Free" size="small" color="success" />}
                            {!document.isPublished && <Chip label="Draft" size="small" color="warning" />}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleView(document, 'document')}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(document, 'document')}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(document, 'document')}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {documents.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No documents added yet. Click "Add Document" to get started.
                  </Typography>
                )}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? `Edit ${dialogType}` : `Add New ${dialogType}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title || ''}
              onChange={(e) => handleFormChange('title', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            {dialogType === 'lesson' && (
              <>
                <TextField
                  fullWidth
                  label="Content"
                  value={formData.content || ''}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Order"
                  type="number"
                  value={formData.order || ''}
                  onChange={(e) => handleFormChange('order', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type || 'Video'}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="Video">Video</MenuItem>
                    <MenuItem value="Audio">Audio</MenuItem>
                    <MenuItem value="Text">Text</MenuItem>
                    <MenuItem value="Document">Document</MenuItem>
                    <MenuItem value="Quiz">Quiz</MenuItem>
                    <MenuItem value="Assignment">Assignment</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Is Free</InputLabel>
                  <Select
                    value={formData.isFree ? 'true' : 'false'}
                    onChange={(e) => handleFormChange('isFree', e.target.value === 'true')}
                    label="Is Free"
                  >
                    <MenuItem value="false">Premium</MenuItem>
                    <MenuItem value="true">Free</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            
            {dialogType === 'assignment' && (
              <>
                <TextField
                  fullWidth
                  label="Instructions"
                  value={formData.instructions || ''}
                  onChange={(e) => handleFormChange('instructions', e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Max Points"
                  type="number"
                  value={formData.maxPoints || ''}
                  onChange={(e) => handleFormChange('maxPoints', parseFloat(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Due Date"
                  type="datetime-local"
                  value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleFormChange('dueDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Assignment Type</InputLabel>
                  <Select
                    value={formData.type || 'Essay'}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    label="Assignment Type"
                  >
                    <MenuItem value="Essay">Essay</MenuItem>
                    <MenuItem value="MultipleChoice">Multiple Choice</MenuItem>
                    <MenuItem value="FileUpload">File Upload</MenuItem>
                    <MenuItem value="CodeSubmission">Code Submission</MenuItem>
                    <MenuItem value="Presentation">Presentation</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Allow Late Submission</InputLabel>
                  <Select
                    value={formData.allowLateSubmission ? 'true' : 'false'}
                    onChange={(e) => handleFormChange('allowLateSubmission', e.target.value === 'true')}
                    label="Allow Late Submission"
                  >
                    <MenuItem value="false">No</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                  </Select>
                </FormControl>
                {formData.allowLateSubmission && (
                  <TextField
                    fullWidth
                    label="Late Penalty Percentage"
                    type="number"
                    value={formData.latePenaltyPercentage || ''}
                    onChange={(e) => handleFormChange('latePenaltyPercentage', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                )}
              </>
            )}
            
            {dialogType === 'quiz' && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                      label="Time Limit (minutes)"
                      type="number"
                      value={formData.timeLimit || ''}
                      onChange={(e) => handleFormChange('timeLimit', parseInt(e.target.value))}
                      inputProps={{ min: 1, max: 300 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Max Attempts"
                      type="number"
                      value={formData.maxAttempts || ''}
                      onChange={(e) => handleFormChange('maxAttempts', parseInt(e.target.value))}
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Passing Score (%)"
                      type="number"
                      value={formData.passingScore || ''}
                      onChange={(e) => handleFormChange('passingScore', parseFloat(e.target.value))}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Available From"
                      type="datetime-local"
                      value={formData.availableFrom || ''}
                      onChange={(e) => handleFormChange('availableFrom', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Available Until"
                      type="datetime-local"
                      value={formData.availableUntil || ''}
                      onChange={(e) => handleFormChange('availableUntil', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Quiz Settings
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isRandomized || false}
                        onChange={(e) => handleFormChange('isRandomized', e.target.checked)}
                      />
                    }
                    label="Randomize question order"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.showCorrectAnswers !== undefined ? formData.showCorrectAnswers : true}
                        onChange={(e) => handleFormChange('showCorrectAnswers', e.target.checked)}
                      />
                    }
                    label="Show correct answers after completion"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.showResultsImmediately !== undefined ? formData.showResultsImmediately : true}
                        onChange={(e) => handleFormChange('showResultsImmediately', e.target.checked)}
                      />
                    }
                    label="Show results immediately"
                  />
                </Box>
              </>
            )}

            {dialogType === 'video' && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Video Source (Choose one):
                  </Typography>
                  <TextField
                    fullWidth
                    label="Video URL"
                    value={formData.videoUrl || ''}
                    onChange={(e) => {
                      handleFormChange('videoUrl', e.target.value);
                      if (e.target.value) {
                        setSelectedVideoFile(null);
                        setFormData(prev => ({ ...prev, videoFile: '' }));
                      }
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ minWidth: 200 }}
                    >
                      Upload Video File
                      <input
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={(e) => handleFileInputChange(e, 'video')}
                      />
                    </Button>
                    {selectedVideoFile && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="success.main">
                          ✓ Selected: {selectedVideoFile.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedVideoFile(null);
                            setFormData(prev => ({ ...prev, videoFile: '' }));
                          }}
                        >
                          Clear
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Thumbnail:
                  </Typography>
                  <TextField
                    fullWidth
                    label="Thumbnail URL"
                    value={formData.thumbnail || ''}
                    onChange={(e) => {
                      handleFormChange('thumbnail', e.target.value);
                      if (e.target.value) {
                        setSelectedThumbnailFile(null);
                      }
                    }}
                    placeholder="https://example.com/thumbnail.jpg"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ minWidth: 200 }}
                    >
                      Upload Thumbnail
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileInputChange(e, 'thumbnail')}
                      />
                    </Button>
                    {selectedThumbnailFile && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="success.main">
                          ✓ Selected: {selectedThumbnailFile.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedThumbnailFile(null);
                            setFormData(prev => ({ ...prev, thumbnail: '' }));
                          }}
                        >
                          Clear
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="Duration (seconds)"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Order"
                  type="number"
                  value={formData.order || ''}
                  onChange={(e) => handleFormChange('order', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Video Type</InputLabel>
                  <Select
                    value={formData.videoType || 'Upload'}
                    onChange={(e) => handleFormChange('videoType', e.target.value)}
                    label="Video Type"
                  >
                    <MenuItem value="Upload">Upload</MenuItem>
                    <MenuItem value="YouTube">YouTube</MenuItem>
                    <MenuItem value="Vimeo">Vimeo</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Quality</InputLabel>
                  <Select
                    value={formData.quality || 'HD'}
                    onChange={(e) => handleFormChange('quality', e.target.value)}
                    label="Quality"
                  >
                    <MenuItem value="SD">SD</MenuItem>
                    <MenuItem value="HD">HD</MenuItem>
                    <MenuItem value="FHD">FHD</MenuItem>
                    <MenuItem value="UHD4K">UHD 4K</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Is Free</InputLabel>
                  <Select
                    value={formData.isFree ? 'true' : 'false'}
                    onChange={(e) => handleFormChange('isFree', e.target.value === 'true')}
                    label="Is Free"
                  >
                    <MenuItem value="false">Premium</MenuItem>
                    <MenuItem value="true">Free</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Is Published</InputLabel>
                  <Select
                    value={formData.isPublished ? 'true' : 'false'}
                    onChange={(e) => handleFormChange('isPublished', e.target.value === 'true')}
                    label="Is Published"
                  >
                    <MenuItem value="true">Published</MenuItem>
                    <MenuItem value="false">Draft</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Transcript"
                  value={formData.transcript || ''}
                  onChange={(e) => handleFormChange('transcript', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Video transcript or subtitles..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Instructor Notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Private notes for instructors..."
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {dialogType === 'document' && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Document Source (Choose one):
                  </Typography>
                  <TextField
                    fullWidth
                    label="Document URL"
                    value={formData.documentUrl || ''}
                    onChange={(e) => {
                      handleFormChange('documentUrl', e.target.value);
                      if (e.target.value) {
                        setSelectedDocumentFile(null);
                        setFormData(prev => ({ ...prev, documentFile: '' }));
                      }
                    }}
                    placeholder="https://example.com/documents/document.pdf"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ minWidth: 200 }}
                    >
                      Upload Document
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.html"
                        onChange={(e) => handleFileInputChange(e, 'document')}
                      />
                    </Button>
                    {selectedDocumentFile && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="success.main">
                          ✓ Selected: {selectedDocumentFile.name} ({formatFileSize(selectedDocumentFile.size)})
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedDocumentFile(null);
                            setFormData(prev => ({ ...prev, documentFile: '', fileSize: 0 }));
                          }}
                        >
                          Clear
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Thumbnail/Preview:
                  </Typography>
                  <TextField
                    fullWidth
                    label="Thumbnail URL"
                    value={formData.thumbnail || ''}
                    onChange={(e) => {
                      handleFormChange('thumbnail', e.target.value);
                      if (e.target.value) {
                        setSelectedThumbnailFile(null);
                      }
                    }}
                    placeholder="https://example.com/thumbnails/document.jpg"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      sx={{ minWidth: 200 }}
                    >
                      Upload Thumbnail
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileInputChange(e, 'thumbnail')}
                      />
                    </Button>
                    {selectedThumbnailFile && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="success.main">
                          ✓ Selected: {selectedThumbnailFile.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedThumbnailFile(null);
                            setFormData(prev => ({ ...prev, thumbnail: '' }));
                          }}
                        >
                          Clear
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="File Size (bytes)"
                  type="number"
                  value={formData.fileSize || ''}
                  onChange={(e) => handleFormChange('fileSize', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Page Count"
                  type="number"
                  value={formData.pageCount || ''}
                  onChange={(e) => handleFormChange('pageCount', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Order"
                  type="number"
                  value={formData.order || ''}
                  onChange={(e) => handleFormChange('order', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    value={formData.documentType || 'PDF'}
                    onChange={(e) => handleFormChange('documentType', e.target.value)}
                    label="Document Type"
                  >
                    <MenuItem value="PDF">PDF</MenuItem>
                    <MenuItem value="DOC">DOC</MenuItem>
                    <MenuItem value="DOCX">DOCX</MenuItem>
                    <MenuItem value="PPT">PPT</MenuItem>
                    <MenuItem value="PPTX">PPTX</MenuItem>
                    <MenuItem value="XLS">XLS</MenuItem>
                    <MenuItem value="XLSX">XLSX</MenuItem>
                    <MenuItem value="TXT">TXT</MenuItem>
                    <MenuItem value="RTF">RTF</MenuItem>
                    <MenuItem value="HTML">HTML</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="File Format"
                  value={formData.fileFormat || ''}
                  onChange={(e) => handleFormChange('fileFormat', e.target.value)}
                  placeholder="PDF, DOCX, etc."
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Version"
                  value={formData.version || ''}
                  onChange={(e) => handleFormChange('version', e.target.value)}
                  placeholder="1.0"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Language"
                  value={formData.language || ''}
                  onChange={(e) => handleFormChange('language', e.target.value)}
                  placeholder="en"
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Is Free</InputLabel>
                  <Select
                    value={formData.isFree ? 'true' : 'false'}
                    onChange={(e) => handleFormChange('isFree', e.target.value === 'true')}
                    label="Is Free"
                  >
                    <MenuItem value="false">Premium</MenuItem>
                    <MenuItem value="true">Free</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Is Published</InputLabel>
                  <Select
                    value={formData.isPublished ? 'true' : 'false'}
                    onChange={(e) => handleFormChange('isPublished', e.target.value === 'true')}
                    label="Is Published"
                  >
                    <MenuItem value="true">Published</MenuItem>
                    <MenuItem value="false">Draft</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Keywords"
                  value={formData.keywords || ''}
                  onChange={(e) => handleFormChange('keywords', e.target.value)}
                  placeholder="web development, programming, tutorial"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Summary"
                  value={formData.summary || ''}
                  onChange={(e) => handleFormChange('summary', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Brief summary of the document content..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Instructor Notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Private notes for instructors..."
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Questions Management Dialog */}
      <Dialog 
        open={openQuestionsDialog} 
        onClose={() => setOpenQuestionsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Questions - {selectedQuiz?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddQuestion}
            >
              Add Question
            </Button>
          </Box>
          
          <List>
            {quizQuestions.map((question, index) => (
              <ListItem key={question.id} divider>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="h6">
                        Question {index + 1}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {question.question}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip label={question.type} size="small" />
                        <Chip label={`${question.points} points`} size="small" />
                        {question.optionA && <Chip label={`A: ${question.optionA}`} size="small" variant="outlined" />}
                        {question.optionB && <Chip label={`B: ${question.optionB}`} size="small" variant="outlined" />}
                        {question.optionC && <Chip label={`C: ${question.optionC}`} size="small" variant="outlined" />}
                        {question.optionD && <Chip label={`D: ${question.optionD}`} size="small" variant="outlined" />}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEditQuestion(question)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteQuestion(question.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {quizQuestions.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No questions added yet. Click "Add Question" to get started.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Creation/Edit Dialog */}
      <Dialog 
        open={openQuestionDialog} 
        onClose={() => setOpenQuestionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question"
            value={questionFormData.question || ''}
            onChange={(e) => handleQuestionFormChange('question', e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            required
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Question Type</InputLabel>
            <Select
              value={questionFormData.type || 'MultipleChoice'}
              onChange={(e) => handleQuestionFormChange('type', e.target.value)}
              label="Question Type"
            >
              <MenuItem value="MultipleChoice">Multiple Choice</MenuItem>
              <MenuItem value="TrueFalse">True/False</MenuItem>
              <MenuItem value="ShortAnswer">Short Answer</MenuItem>
              <MenuItem value="Essay">Essay</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Points"
                type="number"
                value={questionFormData.points || 1}
                onChange={(e) => handleQuestionFormChange('points', parseFloat(e.target.value))}
                inputProps={{ min: 0.1, step: 0.1 }}
              />
            </Grid>
          </Grid>

          {(questionFormData.type === 'MultipleChoice' || questionFormData.type === 'TrueFalse') && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Answer Options
              </Typography>
              <TextField
                fullWidth
                label="Option A"
                value={questionFormData.optionA || ''}
                onChange={(e) => handleQuestionFormChange('optionA', e.target.value)}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Option B"
                value={questionFormData.optionB || ''}
                onChange={(e) => handleQuestionFormChange('optionB', e.target.value)}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Option C"
                value={questionFormData.optionC || ''}
                onChange={(e) => handleQuestionFormChange('optionC', e.target.value)}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Option D"
                value={questionFormData.optionD || ''}
                onChange={(e) => handleQuestionFormChange('optionD', e.target.value)}
                sx={{ mb: 2 }}
              />
            </>
          )}

          <TextField
            fullWidth
            label="Correct Answer"
            value={questionFormData.correctAnswer || ''}
            onChange={(e) => handleQuestionFormChange('correctAnswer', e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Explanation (Optional)"
            value={questionFormData.explanation || ''}
            onChange={(e) => handleQuestionFormChange('explanation', e.target.value)}
            multiline
            rows={2}
            placeholder="Explain why this is the correct answer..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuestion}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Create Question')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Content Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          View {viewingType?.charAt(0).toUpperCase() + viewingType?.slice(1)} - {viewingItem?.title}
        </DialogTitle>
        <DialogContent>
          {viewingItem && (
            <Box>
              {/* Common fields for all types */}
              <Typography variant="h6" gutterBottom>
                {viewingItem.title}
              </Typography>
              
              {viewingItem.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description:
                  </Typography>
                  <Typography variant="body1">
                    {viewingItem.description}
                  </Typography>
                </Box>
              )}

              {/* Type-specific content */}
              {viewingType === 'lesson' && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Content:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {viewingItem.content}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Duration: {viewingItem.duration} minutes
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type: {viewingItem.type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Order: {viewingItem.order}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Free: {viewingItem.isFree ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {viewingType === 'assignment' && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Instructions:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {viewingItem.instructions}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Max Points: {viewingItem.maxPoints}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type: {viewingItem.type}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Due Date: {new Date(viewingItem.dueDate).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Late Submission: {viewingItem.allowLateSubmission ? 'Allowed' : 'Not Allowed'}
                      </Typography>
                    </Grid>
                    {viewingItem.allowLateSubmission && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Late Penalty: {viewingItem.latePenaltyPercentage}%
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {viewingType === 'quiz' && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Time Limit: {viewingItem.timeLimit} minutes
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Max Attempts: {viewingItem.maxAttempts}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Passing Score: {viewingItem.passingScore}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Questions: {viewingItem.totalQuestions}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Randomized: {viewingItem.isRandomized ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Show Answers: {viewingItem.showCorrectAnswers ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    {viewingItem.availableFrom && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Available From: {new Date(viewingItem.availableFrom).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {viewingItem.availableUntil && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Available Until: {new Date(viewingItem.availableUntil).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {viewingType === 'video' && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Duration: {Math.floor(viewingItem.duration / 60)}:{(viewingItem.duration % 60).toString().padStart(2, '0')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type: {viewingItem.videoType}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Quality: {viewingItem.quality}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Order: {viewingItem.order}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Free: {viewingItem.isFree ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Published: {viewingItem.isPublished ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {viewingItem.videoUrl && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Video URL:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {viewingItem.videoUrl}
                      </Typography>
                    </Box>
                  )}
                  
                  {viewingItem.transcript && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Transcript:
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {viewingItem.transcript}
                      </Typography>
                    </Box>
                  )}
                  
                  {viewingItem.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes:
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {viewingItem.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {viewingType === 'document' && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Type: {viewingItem.documentType}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Format: {viewingItem.fileFormat}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        File Size: {(viewingItem.fileSize / 1024 / 1024).toFixed(1)} MB
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Pages: {viewingItem.pageCount || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Version: {viewingItem.version}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Language: {viewingItem.language}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Free: {viewingItem.isFree ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Published: {viewingItem.isPublished ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {viewingItem.documentUrl && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Document URL:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {viewingItem.documentUrl}
                      </Typography>
                    </Box>
                  )}
                  
                  {viewingItem.keywords && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Keywords:
                      </Typography>
                      <Typography variant="body1">
                        {viewingItem.keywords}
                      </Typography>
                    </Box>
                  )}
                  
                  {viewingItem.summary && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Summary:
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {viewingItem.summary}
                      </Typography>
                    </Box>
                  )}
                  
                  {viewingItem.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes:
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {viewingItem.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => {
              setOpenViewDialog(false);
              handleEdit(viewingItem, viewingType);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => {
              setOpenViewDialog(false);
              handleDelete(viewingItem, viewingType);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageCourseMaterials;
