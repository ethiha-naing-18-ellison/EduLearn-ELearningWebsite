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
  Schedule,
  Grade,
  Visibility,
  VideoLibrary,
  Description,
  CloudUpload,
  MenuBook
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
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewingType, setViewingType] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

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
      setMessage('Error loading course materials');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Create general materials list (all materials combined)
  const generalMaterials = [
    ...lessons.map(lesson => ({ ...lesson, type: 'lesson', materialType: 'Lesson' })),
    ...assignments.map(assignment => ({ ...assignment, type: 'assignment', materialType: 'Assignment' })),
    ...videos.map(video => ({ ...video, type: 'video', materialType: 'Video' })),
    ...documents.map(document => ({ ...document, type: 'document', materialType: 'Document' }))
  ].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Handle editing materials from the All tab
  const handleEditFromAll = (material) => {
    handleEdit(material.type, material);
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
                     type === 'video' ? 'videos' : 'documents';
      await axios.delete(`http://localhost:5000/api/${endpoint}/${item.id}`);
      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      fetchCourseData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setMessage(`Error deleting ${type}`);
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
                     dialogType === 'video' ? 'videos' : 'documents';

      // Handle file uploads if files are selected
      if (dialogType === 'video' && selectedVideoFile) {
        // Upload the video file to the server
        const uploadFormData = new FormData();
        uploadFormData.append('videoFile', selectedVideoFile);
        uploadFormData.append('title', requestData.title);
        uploadFormData.append('description', requestData.description);
        uploadFormData.append('courseId', requestData.courseId);
        uploadFormData.append('isFree', requestData.isFree);
        uploadFormData.append('videoType', requestData.videoType);
        uploadFormData.append('quality', requestData.quality);
        uploadFormData.append('duration', requestData.duration || 0);
        uploadFormData.append('order', requestData.order || 1);
        uploadFormData.append('isPublished', requestData.isPublished);
        uploadFormData.append('transcript', requestData.transcript || '');
        uploadFormData.append('notes', requestData.notes || '');

        // Upload file using the upload endpoint
        const uploadResponse = await axios.post('http://localhost:5000/api/videos/upload', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setMessage('Video uploaded successfully');
        setOpenDialog(false);
        fetchCourseData();
        return; // Exit early since we handled the upload
      }
      
      if (dialogType === 'document' && selectedDocumentFile) {
        // Upload the file to the server
        const uploadFormData = new FormData();
        uploadFormData.append('documentFile', selectedDocumentFile);
        uploadFormData.append('title', requestData.title);
        uploadFormData.append('description', requestData.description);
        uploadFormData.append('courseId', requestData.courseId);
        uploadFormData.append('isFree', requestData.isFree);
        uploadFormData.append('documentType', requestData.documentType);
        uploadFormData.append('fileFormat', requestData.fileFormat);
        uploadFormData.append('version', requestData.version);
        uploadFormData.append('language', requestData.language);
        uploadFormData.append('keywords', requestData.keywords || '');
        uploadFormData.append('summary', requestData.summary || '');
        uploadFormData.append('notes', requestData.notes || '');
        uploadFormData.append('pageCount', requestData.pageCount || 0);
        uploadFormData.append('order', requestData.order || 1);
        uploadFormData.append('isPublished', requestData.isPublished);

        // Upload file using the upload endpoint
        const uploadResponse = await axios.post('http://localhost:5000/api/documents/upload', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setMessage('Document uploaded successfully');
        setOpenDialog(false);
        fetchCourseData();
        return; // Exit early since we handled the upload
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {course?.title || 'Manage Course Materials'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            by {course?.instructor?.firstName} {course?.instructor?.lastName}
          </Typography>
        </Box>
      </Box>

      {/* Course Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardMedia
          component="img"
          height="200"
          image={course?.thumbnail || 'https://via.placeholder.com/800x200?text=Course+Image'}
          alt={course?.title || 'Course Image'}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Overview
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {course?.description || 'Manage all course materials including lessons, assignments, quizzes, videos, and documents.'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<MenuBook />} 
              label={`${lessons.length} Lessons`} 
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

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={`All (${generalMaterials.length})`} 
              icon={<MenuBook />} 
              iconPosition="start"
            />
            <Tab 
              label={`Lessons (${lessons.length})`} 
              icon={<MenuBook />} 
              iconPosition="start"
            />
            <Tab 
              label={`Assignments (${assignments.length})`} 
              icon={<Assignment />} 
              iconPosition="start"
            />
            <Tab 
              label={`Videos (${videos.length})`} 
              icon={<VideoLibrary />} 
              iconPosition="start"
            />
            <Tab 
              label={`Documents (${documents.length})`} 
              icon={<Description />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent>
          {/* All Materials Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                All Course Materials
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage all course materials in one place. Click on any item to edit or delete it.
              </Typography>
              <List>
                {generalMaterials.map((material, index) => (
                  <ListItem key={`${material.type}-${material.id}`} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {material.title}
                          <Chip 
                            label={material.materialType} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
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
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditFromAll(material)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(material.type, material.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                
                {generalMaterials.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No materials available"
                      secondary="Start by adding lessons, assignments, quizzes, videos, or documents to your course."
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}

          {/* Lessons Tab */}
          {tabValue === 1 && (
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
          {tabValue === 2 && (
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
