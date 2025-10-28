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
  Visibility
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
      const [courseRes, lessonsRes, assignmentsRes, quizzesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/lessons/course/${id}`),
        axios.get(`http://localhost:5000/api/assignments/course/${id}`),
        axios.get(`http://localhost:5000/api/quizzes/course/${id}`)
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setAssignments(assignmentsRes.data);
      setQuizzes(quizzesRes.data);
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
    setFormData({
      title: '',
      description: '',
      courseId: parseInt(id)
    });
    setOpenDialog(true);
  };

  const handleEdit = (item, type) => {
    setDialogType(type);
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      ...item
    });
    setOpenDialog(true);
  };

  const handleDelete = async (item, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const endpoint = type === 'lesson' ? 'lessons' : 
                     type === 'assignment' ? 'assignments' : 'quizzes';
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
    try {
      const endpoint = dialogType === 'lesson' ? 'lessons' : 
                     dialogType === 'assignment' ? 'assignments' : 'quizzes';
      
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/${endpoint}/${editingItem.id}`, formData);
        setMessage(`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} updated successfully`);
      } else {
        await axios.post(`http://localhost:5000/api/${endpoint}`, formData);
        setMessage(`${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} created successfully`);
      }
      
      setOpenDialog(false);
      fetchCourseData();
    } catch (error) {
      console.error(`Error saving ${dialogType}:`, error);
      setMessage(`Error saving ${dialogType}`);
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
                            {lesson.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={`${lesson.duration} min`} size="small" />
                            <Chip 
                              label={lesson.isFree ? 'Free' : 'Premium'} 
                              size="small" 
                              color={lesson.isFree ? 'success' : 'primary'}
                            />
                            <Chip label={`Order: ${lesson.order}`} size="small" variant="outlined" />
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
                            <Chip label={`${assignment.totalMarks} marks`} size="small" />
                            <Chip 
                              label={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`} 
                              size="small" 
                              color="warning"
                            />
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
              </>
            )}
            
            {dialogType === 'assignment' && (
              <>
                <TextField
                  fullWidth
                  label="Total Marks"
                  type="number"
                  value={formData.totalMarks || ''}
                  onChange={(e) => handleFormChange('totalMarks', parseInt(e.target.value))}
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
