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
  Fab
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
  VideoLibrary
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
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, assignmentsRes, quizzesRes, videosRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/lessons/course/${id}`),
        axios.get(`http://localhost:5000/api/assignments/course/${id}`),
        axios.get(`http://localhost:5000/api/quizzes/course/${id}`),
        axios.get(`http://localhost:5000/api/videos/course/${id}`)
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setAssignments(assignmentsRes.data);
      setQuizzes(quizzesRes.data);
      setVideos(videosRes.data);
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
        duration: 30,
        totalMarks: 100,
        totalQuestions: 10
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
    }
    
    setOpenDialog(true);
  };

  const handleEdit = (item, type) => {
    setDialogType(type);
    setEditingItem(item);
    
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
        duration: item.duration || 30,
        totalMarks: item.totalMarks || 100,
        totalQuestions: item.totalQuestions || 10,
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
    }
    
    setOpenDialog(true);
  };

  const handleDelete = async (item, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const endpoint = type === 'lesson' ? 'lessons' : 
                     type === 'assignment' ? 'assignments' : 
                     type === 'quiz' ? 'quizzes' : 'videos';
      await axios.delete(`http://localhost:5000/api/${endpoint}/${item.id}`);
      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      fetchCourseData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setMessage(`Error deleting ${type}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let requestData = { ...formData }; // Initialize requestData at the top
    
    try {
      const endpoint = dialogType === 'lesson' ? 'lessons' : 
                     dialogType === 'assignment' ? 'assignments' : 
                     dialogType === 'quiz' ? 'quizzes' : 'videos';
      
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
          duration: formData.duration || 30,
          totalMarks: formData.totalMarks || 100,
          totalQuestions: formData.totalQuestions || 10,
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
                      <IconButton onClick={() => navigate(`/assignment-submissions/${assignment.id}`)}>
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
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={`${quiz.duration} min`} size="small" />
                            <Chip label={`${quiz.totalMarks} marks`} size="small" />
                            <Chip label={`${quiz.totalQuestions} questions`} size="small" variant="outlined" />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
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
                  label="Total Marks"
                  type="number"
                  value={formData.totalMarks || ''}
                  onChange={(e) => handleFormChange('totalMarks', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {dialogType === 'video' && (
              <>
                <TextField
                  fullWidth
                  label="Video URL"
                  value={formData.videoUrl || ''}
                  onChange={(e) => handleFormChange('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Video File Path"
                  value={formData.videoFile || ''}
                  onChange={(e) => handleFormChange('videoFile', e.target.value)}
                  placeholder="/uploads/videos/video.mp4"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Thumbnail URL"
                  value={formData.thumbnail || ''}
                  onChange={(e) => handleFormChange('thumbnail', e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  sx={{ mb: 2 }}
                />
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
    </Container>
  );
};

export default ManageCourseMaterials;
