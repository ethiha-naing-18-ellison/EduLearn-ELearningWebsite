import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Fade,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  PlayCircle,
  Assignment,
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
  VolumeOff,
  Quiz,
  TaskAlt,
  WorkspacePremium,
  Cancel
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [multipleChoices, setMultipleChoices] = useState([]);
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
  
  // Quiz answer state - stores answers for each quiz: { quizId: { questionId: selectedAnswer } }
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({}); // Track which quizzes have been submitted
  const [quizResults, setQuizResults] = useState({}); // Store quiz results after submission: { quizId: { score, totalPoints, percentage, isPassed, results } }
  const [quizAttempts, setQuizAttempts] = useState({}); // Store attempt counts for each quiz
  const [quizCanRetake, setQuizCanRetake] = useState({}); // Store if user can retake each quiz
  const [quizStartTime, setQuizStartTime] = useState({}); // Track when quiz was started
  const [quizPassStatus, setQuizPassStatus] = useState({}); // Store quiz pass status: { quizId: true/false }
  const [materialCompletions, setMaterialCompletions] = useState({}); // Track completion status: { "video_1": true, "document_2": true, etc. }
  const [certificateName, setCertificateName] = useState(''); // Name entered for certificate
  const [confirmCertificateName, setConfirmCertificateName] = useState(''); // Confirmation name
  const [certificateNameError, setCertificateNameError] = useState(''); // Error message for name mismatch
  const [nameConfirmed, setNameConfirmed] = useState(false); // Track if name has been confirmed
  const [confirmedName, setConfirmedName] = useState(''); // Store the confirmed name
  const [nameConfirmationChecked, setNameConfirmationChecked] = useState(false); // Checkbox state

  const fetchMaterialCompletions = useCallback(async () => {
    if (!user || !id) {
      console.log('Cannot fetch completions - missing user or id:', { user: !!user, id });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot fetch completions');
        return;
      }
      
      console.log('Fetching material completions for course:', id, 'user:', user.id);
      const response = await axios.get(`http://localhost:5000/api/materialcompletions/course/${id}/completions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Material completions fetched:', response.data);
      // The API returns a dictionary like { "video_1": true, "document_2": true }
      const completions = response.data || {};
      console.log('Setting material completions:', completions);
      console.log('Number of completions:', Object.keys(completions).length);
      console.log('Completion keys:', Object.keys(completions));
      // Force update to ensure state is set
      setMaterialCompletions({ ...completions });
    } catch (error) {
      console.error('Error fetching material completions:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Set to empty object on error to avoid stale data
      setMaterialCompletions({});
    }
  }, [user, id]);

  useEffect(() => {
    fetchCourseData();
    checkEnrollment();
    
    // Load confirmed certificate name from localStorage
    if (user && id) {
      const storedConfirmedName = localStorage.getItem(`certificate_name_${id}_${user.id}`);
      if (storedConfirmedName) {
        setConfirmedName(storedConfirmedName);
        setNameConfirmed(true);
      }
    }
  }, [id, user]);
  
  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      const certificateElement = document.getElementById('certificate-card');
      if (!certificateElement) {
        alert('Certificate not found. Please refresh the page.');
        return;
      }

      // Show loading state
      const loadingAlert = document.createElement('div');
      loadingAlert.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #1976d2; color: white; padding: 15px 20px; border-radius: 4px; z-index: 10000;';
      loadingAlert.textContent = 'Generating PDF...';
      document.body.appendChild(loadingAlert);

      // Preload all images in the certificate element
      const images = certificateElement.getElementsByTagName('img');
      const imagePromises = [];
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.complete) {
          const promise = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Set timeout to prevent hanging
            setTimeout(() => resolve(), 5000);
          });
          imagePromises.push(promise);
        }
      }

      // Wait for all images to load
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        // Give a small delay to ensure images are rendered
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create canvas from certificate element
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: certificateElement.offsetWidth,
        height: certificateElement.offsetHeight,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure images are visible in cloned document
          const clonedImages = clonedDoc.getElementsByTagName('img');
          for (let i = 0; i < clonedImages.length; i++) {
            const img = clonedImages[i];
            if (img.src && !img.complete) {
              img.style.display = 'block';
              img.style.visibility = 'visible';
            }
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      // Create PDF with A4 format
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate scaling to fit A4 while maintaining aspect ratio
      const imgAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalWidth = pdfWidth;
      let finalHeight = pdfHeight;
      let xOffset = 0;
      let yOffset = 0;
      
      if (imgAspectRatio > pdfAspectRatio) {
        // Image is wider, fit to width
        finalHeight = pdfWidth / imgAspectRatio;
        yOffset = (pdfHeight - finalHeight) / 2;
      } else {
        // Image is taller, fit to height
        finalWidth = pdfHeight * imgAspectRatio;
        xOffset = (pdfWidth - finalWidth) / 2;
      }
      
      // Add image to PDF centered
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      
      // Generate filename
      const courseTitle = course?.title?.replace(/[^a-z0-9]/gi, '_') || 'Certificate';
      const studentName = (confirmedName || user?.name || user?.username || 'Student').replace(/[^a-z0-9]/gi, '_');
      const filename = `Certificate_${courseTitle}_${studentName}.pdf`;
      
      // Save PDF
      pdf.save(filename);
      
      // Remove loading alert
      document.body.removeChild(loadingAlert);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  
  // Handle certificate name confirmation
  const handleConfirmCertificateName = () => {
    if (!certificateName || !confirmCertificateName) {
      setCertificateNameError('Please enter and confirm your name.');
      return;
    }
    
    if (certificateName !== confirmCertificateName) {
      setCertificateNameError('Names do not match. Please ensure both fields contain the same name.');
      return;
    }
    
    if (!nameConfirmationChecked) {
      setCertificateNameError('Please check the confirmation checkbox.');
      return;
    }
    
    // Save confirmed name to localStorage
    if (user && id) {
      localStorage.setItem(`certificate_name_${id}_${user.id}`, certificateName);
      setConfirmedName(certificateName);
      setNameConfirmed(true);
      setCertificateNameError('');
    }
  };

  // Fetch material completions after course data is loaded and user is available
  useEffect(() => {
    const loadCompletions = async () => {
      if (user && id && !loading) {
        console.log('useEffect: Fetching material completions - user:', user.id, 'course:', id, 'loading:', loading);
        await fetchMaterialCompletions();
      }
    };
    loadCompletions();
  }, [user?.id, id, loading, fetchMaterialCompletions]);

  // Mark lesson as complete when content is loaded
  useEffect(() => {
    if (selectedMaterial?.type === 'lesson' && materialContent?.id) {
      markMaterialComplete('lesson', materialContent.id);
    }
  }, [materialContent, selectedMaterial]);

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

  // Fetch quiz pass status for all quizzes
  const fetchQuizPassStatus = async (quizIds) => {
    if (!user || !quizIds || quizIds.length === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const passStatusPromises = quizIds.map(async (quizId) => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/multiplechoices/${quizId}/attempts/all`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const attempts = response.data || [];
          // Get the latest attempt (first one as API returns ordered by CompletedAt desc)
          const latestAttempt = attempts.length > 0 ? attempts[0] : null;
          return {
            quizId,
            isPassed: latestAttempt?.isPassed || false,
            percentage: latestAttempt?.percentage || 0
          };
        } catch (error) {
          console.error(`Error fetching attempts for quiz ${quizId}:`, error);
          return { quizId, isPassed: false, percentage: 0 };
        }
      });
      
      const results = await Promise.all(passStatusPromises);
      const passStatusMap = {};
      results.forEach(result => {
        passStatusMap[result.quizId] = result.isPassed;
        // Also update quizResults with percentage if available
        if (result.percentage > 0) {
          setQuizResults(prev => ({
            ...prev,
            [result.quizId]: {
              ...prev[result.quizId],
              percentage: result.percentage,
              isPassed: result.isPassed
            }
          }));
        }
      });
      setQuizPassStatus(passStatusMap);
    } catch (error) {
      console.error('Error fetching quiz pass status:', error);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, assignmentsRes, videosRes, documentsRes, multipleChoicesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/lessons/course/${id}`),
        axios.get(`http://localhost:5000/api/assignments/course/${id}`),
        axios.get(`http://localhost:5000/api/videos/course/${id}`),
        axios.get(`http://localhost:5000/api/documents/course/${id}`),
        axios.get(`http://localhost:5000/api/multiplechoices/course/${id}`)
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setAssignments(assignmentsRes.data);
      setVideos(videosRes.data);
      setDocuments(documentsRes.data);
      setMultipleChoices(multipleChoicesRes.data);
      
      // Fetch quiz pass status after quizzes are loaded
      if (multipleChoicesRes.data && multipleChoicesRes.data.length > 0) {
        const quizIds = multipleChoicesRes.data.map(q => q.id);
        await fetchQuizPassStatus(quizIds);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMaterialComplete = async (materialType, materialId) => {
    if (!user || !id) return;
    try {
      // Normalize material type names
      let normalizedType = materialType;
      if (materialType === 'quiz' || materialType === 'multiplechoice') {
        normalizedType = 'multiplechoice';
      } else if (materialType === 'lesson') {
        normalizedType = 'lesson';
      }
      
      const key = `${normalizedType}_${materialId}`;
      // Only mark if not already completed
      if (materialCompletions[key]) {
        console.log('Material already marked as complete');
        return;
      }
      
      console.log('Marking material as complete:', { normalizedType, materialId, courseId: id });
      const response = await axios.post('http://localhost:5000/api/materialcompletions/mark-complete', {
        courseId: parseInt(id),
        materialType: normalizedType,
        materialId: materialId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Material marked as complete:', response.data);
      
      // Update local state immediately
      setMaterialCompletions(prev => ({
        ...prev,
        [key]: true
      }));
      
      // Also refresh from server to ensure consistency
      await fetchMaterialCompletions();
    } catch (error) {
      console.error('Error marking material as complete:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const isMaterialComplete = (materialType, materialId) => {
    if (!materialId) return false;
    
    // Normalize material type names
    let normalizedType = materialType;
    if (materialType === 'quiz' || materialType === 'multiplechoice') {
      normalizedType = 'multiplechoice';
    } else if (materialType === 'lesson') {
      normalizedType = 'lesson';
    }
    const key = `${normalizedType}_${materialId}`;
    const isComplete = materialCompletions[key] === true;
    return isComplete;
  };

  const handleTabChange = (event, newValue) => {
    // Prevent switching to Certification tab (index 6) if not all materials are completed
    if (newValue === 6 && !allMaterialsCompleted) {
      return;
    }
    setTabValue(newValue);
  };

  // Check quiz attempts and retake eligibility when opening quiz
  const checkQuizAttempts = async (quizId) => {
    try {
      const [attemptCountRes, canRetakeRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/multiplechoices/${quizId}/attempts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get(`http://localhost:5000/api/multiplechoices/${quizId}/can-retake`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      setQuizAttempts(prev => ({
        ...prev,
        [quizId]: attemptCountRes.data.attemptCount || 0
      }));

      setQuizCanRetake(prev => ({
        ...prev,
        [quizId]: canRetakeRes.data.canRetake || false
      }));
    } catch (error) {
      console.error('Error checking quiz attempts:', error);
      // Default values if error
      setQuizAttempts(prev => ({ ...prev, [quizId]: 0 }));
      setQuizCanRetake(prev => ({ ...prev, [quizId]: true }));
    }
  };

  const handleMaterialClick = async (type, material) => {
    try {
      setContentLoading(true);
      setSelectedMaterial(material);
      setModalOpen(true);
      
      // Refresh completions when opening a material
      if (user && id) {
        await fetchMaterialCompletions();
      }
      
      // If it's a quiz, check attempts
      if (type === 'multiplechoice') {
        await checkQuizAttempts(material.id);
        setQuizStartTime(prev => ({
          ...prev,
          [material.id]: Date.now()
        }));
      }
      
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
        case 'multiplechoice':
          const multipleChoiceResponse = await axios.get(`http://localhost:5000/api/multiplechoices/${material.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          content = multipleChoiceResponse.data;
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

  // Handle quiz answer selection
  const handleQuizAnswerSelect = (quizId, questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        [questionId]: answer
      }
    }));
  };

  // Get selected answer for a question
  const getSelectedAnswer = (quizId, questionId) => {
    return quizAnswers[quizId]?.[questionId] || null;
  };

  // Check if answer is correct
  const isAnswerCorrect = (question, selectedAnswer) => {
    return question.correctAnswer === selectedAnswer;
  };

  // Handle quiz submission
  const handleQuizSubmit = async (quizId, questions) => {
    try {
      const answers = quizAnswers[quizId] || {};
      
      // Calculate time spent
      const startTime = quizStartTime[quizId] || Date.now();
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds

      // Convert answers to format expected by API: { questionId: answer }
      const answersForApi = {};
      Object.keys(answers).forEach(questionId => {
        answersForApi[parseInt(questionId)] = answers[questionId];
      });

      // Submit to backend
      const response = await axios.post(
        `http://localhost:5000/api/multiplechoices/${quizId}/submit`,
        {
          answers: answersForApi,
          timeSpent: timeSpent
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const result = response.data;

      // Convert question results to our format
      const results = {};
      Object.keys(result.questionResults || {}).forEach(questionId => {
        const qResult = result.questionResults[questionId];
        results[parseInt(questionId)] = {
          correct: qResult.isCorrect,
          selected: qResult.selectedAnswer,
          correctAnswer: qResult.correctAnswer
        };
      });

      // Update quiz results
      setQuizResults(prev => ({
        ...prev,
        [quizId]: {
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: result.percentage,
          isPassed: result.isPassed,
          results: results
        }
      }));
      
      // Update quiz pass status
      setQuizPassStatus(prev => ({
        ...prev,
        [quizId]: result.isPassed
      }));

      // Update attempt count and can retake status
      setQuizAttempts(prev => ({
        ...prev,
        [quizId]: result.attemptNumber
      }));

      setQuizCanRetake(prev => ({
        ...prev,
        [quizId]: result.canRetake
      }));

      // Mark quiz as submitted
      setQuizSubmitted(prev => ({
        ...prev,
        [quizId]: true
      }));

      // Mark quiz as complete only if passed
      if (result.isPassed) {
        await markMaterialComplete('multiplechoice', quizId);
      } else {
        // If failed, ensure it's not marked as complete
        // The material completion will remain false, which is correct
      }

      // Refresh quiz pass status for this quiz
      await fetchQuizPassStatus([quizId]);

      alert(`Quiz submitted! Score: ${result.score}/${result.totalPoints} (${result.percentage}%)${result.isPassed ? ' - You passed! ✅' : ' - You need to score higher. Keep practicing!'}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const errorMessage = error.response?.data?.message || 'Error submitting quiz. Please try again.';
      alert(errorMessage);
    }
  };

  // Reset quiz
  const handleQuizReset = async (quizId) => {
    // Check if user can retake
    if (!quizCanRetake[quizId]) {
      alert(`You have reached the maximum number of attempts (${materialContent?.maxAttempts || 3}). You cannot retake this quiz.`);
      return;
    }

    setQuizAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[quizId];
      return newAnswers;
    });
    setQuizSubmitted(prev => {
      const newSubmitted = { ...prev };
      delete newSubmitted[quizId];
      return newSubmitted;
    });
    setQuizResults(prev => {
      const newResults = { ...prev };
      delete newResults[quizId];
      return newResults;
    });
    
    // Reset start time
    setQuizStartTime(prev => ({
      ...prev,
      [quizId]: Date.now()
    }));
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

  const getQuizIcon = () => {
    return <Quiz color="info" />;
  };

  // Sort lessons by order
  const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Create general materials list (all materials combined)
  const generalMaterials = [
    ...sortedLessons.map(lesson => ({ ...lesson, type: 'lesson', materialType: 'Lesson' })),
    ...assignments.map(assignment => ({ ...assignment, type: 'assignment', materialType: 'Assignment' })),
    ...videos.map(video => ({ ...video, type: 'video', materialType: 'Video' })),
    ...documents.map(document => ({ ...document, type: 'document', materialType: 'Document' })),
    ...multipleChoices.map(mc => ({ ...mc, type: 'multiplechoice', materialType: 'Quiz' }))
  ].sort((a, b) => (a.orderIndex || a.order || 0) - (b.orderIndex || b.order || 0));

  // Check if all course materials are completed and all quizzes passed
  const allMaterialsCompleted = useMemo(() => {
    try {
      // Create materials list for checking
      const materials = [
        ...sortedLessons.map(lesson => ({ ...lesson, type: 'lesson' })),
        ...assignments.map(assignment => ({ ...assignment, type: 'assignment' })),
        ...videos.map(video => ({ ...video, type: 'video' })),
        ...documents.map(document => ({ ...document, type: 'document' })),
        ...multipleChoices.map(mc => ({ ...mc, type: 'multiplechoice' }))
      ];
      
      if (!materials || materials.length === 0) {
        console.log('No materials found for completion check');
        return false;
      }
      
      const completed = materials.every(material => {
        if (!material || !material.type || !material.id) return false;
        
        // For quizzes, check if passed (not just completed)
        if (material.type === 'multiplechoice' || material.type === 'quiz') {
          // Check if quiz has been attempted and passed
          const isPassed = quizPassStatus[material.id];
          if (isPassed === undefined) {
            // If no pass status yet, check if it's at least completed
            const key = 'multiplechoice';
            const completionKey = `${key}_${material.id}`;
            return materialCompletions[completionKey] === true;
          }
          return isPassed === true;
        }
        
        // For other materials, check completion
        const key = material.type === 'lesson' ? 'lesson' : material.type;
        const completionKey = `${key}_${material.id}`;
        return materialCompletions[completionKey] === true;
      });
      
      console.log('All materials completed check:', {
        totalMaterials: materials.length,
        completed,
        quizPassStatus,
        completions: materialCompletions
      });
      
      return completed;
    } catch (error) {
      console.error('Error checking material completion:', error);
      return false;
    }
  }, [sortedLessons, assignments, videos, documents, multipleChoices, materialCompletions, quizPassStatus]);

  const areAllMaterialsCompleted = () => allMaterialsCompleted;

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
            {material.type === 'video' && getVideoTypeIcon(material.videoType)}
            {material.type === 'document' && getDocumentTypeIcon(material.documentType)}
            {material.type === 'multiplechoice' && getQuizIcon()}
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
                {material.questions && material.questions.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {material.questions.length} questions
                  </Typography>
                )}
                {material.fileSize && (
                  <Typography variant="body2" color="text.secondary">
                    {(material.fileSize / 1024 / 1024).toFixed(1)} MB
                  </Typography>
                )}
                {material.totalPoints && (
                  <Typography variant="body2" color="text.secondary">
                    {material.totalPoints} points
                  </Typography>
                )}
                {material.timeLimit && (
                  <Typography variant="body2" color="text.secondary">
                    {material.timeLimit} min
                  </Typography>
                )}
                {material.isFree && (
                  <Chip label="Free" size="small" color="success" />
                )}
              </Box>
            }
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {material.type === 'multiplechoice' ? (
              // For quizzes, check if passed
              quizPassStatus[material.id] === true ? (
                <CheckCircle color="success" />
              ) : quizPassStatus[material.id] === false ? (
                <Cancel color="error" />
              ) : isMaterialComplete(material.type, material.id) ? (
                <CheckCircle sx={{ color: 'grey.400' }} />
              ) : (
                <CheckCircle sx={{ color: 'grey.400' }} />
              )
            ) : (
              // For other materials, use regular completion check
              isMaterialComplete(material.type, material.id) ? (
                <CheckCircle color="success" />
              ) : (
                <CheckCircle sx={{ color: 'grey.400' }} />
              )
            )}
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
            <Chip 
              icon={<Quiz />} 
              label={`${multipleChoices.length} Quizzes`} 
              color="info" 
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
          <Tab label="Videos" icon={<VideoLibrary />} iconPosition="start" />
          <Tab label="Documents" icon={<Description />} iconPosition="start" />
          <Tab label="Quizzes" icon={<Quiz />} iconPosition="start" />
          <Tab 
            label="Certification" 
            icon={<WorkspacePremium />} 
            iconPosition="start"
            disabled={!allMaterialsCompleted}
            sx={{
              opacity: allMaterialsCompleted ? 1 : 0.6,
              cursor: allMaterialsCompleted ? 'pointer' : 'not-allowed',
              display: 'flex',
              minWidth: 'auto'
            }}
          />
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
                Videos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Watch video content to enhance your learning experience.
              </Typography>
              {renderMaterialList(videos.map(video => ({ ...video, type: 'video' })))}
            </Box>
          )}

          {tabValue === 4 && (
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

          {tabValue === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Quizzes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Test your knowledge with interactive quiz questions.
              </Typography>
              {renderMaterialList(multipleChoices.map(mc => ({ ...mc, type: 'multiplechoice' })))}
            </Box>
          )}

          {tabValue === 6 && (
            <Box>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <WorkspacePremium sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Course Completion Certificate
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                  {course?.title}
                </Typography>
                
                {/* Name Input Form - Only show if not confirmed */}
                {!nameConfirmed && (
                  <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, mb: 4 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Enter Your Name for the Certificate
                      </Typography>
                      <TextField
                        fullWidth
                        label="Enter your name"
                        value={certificateName}
                        onChange={(e) => {
                          const nameValue = e.target.value;
                          setCertificateName(nameValue);
                          if (confirmCertificateName && nameValue !== confirmCertificateName) {
                            setCertificateNameError('Names do not match. Please ensure both fields contain the same name.');
                          } else {
                            setCertificateNameError('');
                          }
                        }}
                        sx={{ mb: 2 }}
                        required
                      />
                      <TextField
                        fullWidth
                        label="Confirm your name"
                        value={confirmCertificateName}
                        onChange={(e) => {
                          const confirmValue = e.target.value;
                          setConfirmCertificateName(confirmValue);
                          if (certificateName && confirmValue && certificateName !== confirmValue) {
                            setCertificateNameError('Names do not match. Please ensure both fields contain the same name.');
                          } else {
                            setCertificateNameError('');
                          }
                        }}
                        error={!!certificateNameError || (certificateName && confirmCertificateName && certificateName !== confirmCertificateName)}
                        helperText={certificateNameError || (certificateName && confirmCertificateName && certificateName !== confirmCertificateName ? 'Names do not match' : 'Please confirm your name matches the above')}
                        required
                        sx={{ mb: 2 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={nameConfirmationChecked}
                            onChange={(e) => setNameConfirmationChecked(e.target.checked)}
                          />
                        }
                        label="I confirm this is my correct name for the certificate"
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleConfirmCertificateName}
                        disabled={!certificateName || !confirmCertificateName || certificateName !== confirmCertificateName || !nameConfirmationChecked}
                      >
                        Confirm
                      </Button>
                      {certificateNameError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          {certificateNameError}
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Certificate Display - A4 Format */}
                <Card 
                  id="certificate-card" 
                  sx={{ 
                    width: '210mm',
                    minHeight: '297mm',
                    maxWidth: '210mm',
                    mx: 'auto', 
                    mb: 4, 
                    bgcolor: '#ffffff',
                    border: '12px solid #1a237e',
                    borderRadius: '0px',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    '@media print': {
                      width: '210mm',
                      minHeight: '297mm',
                      margin: 0,
                      boxShadow: 'none',
                      border: '12px solid #1a237e'
                    }
                  }}
                >
                  {/* Decorative Corner Elements */}
                  {/* Top Left Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      width: '60px',
                      height: '60px',
                      borderTop: '4px solid #3f51b5',
                      borderLeft: '4px solid #3f51b5',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '25px',
                      left: '25px',
                      width: '40px',
                      height: '40px',
                      borderTop: '2px solid #7986cb',
                      borderLeft: '2px solid #7986cb',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                  
                  {/* Top Right Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      width: '60px',
                      height: '60px',
                      borderTop: '4px solid #3f51b5',
                      borderRight: '4px solid #3f51b5',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '25px',
                      right: '25px',
                      width: '40px',
                      height: '40px',
                      borderTop: '2px solid #7986cb',
                      borderRight: '2px solid #7986cb',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                  
                  {/* Bottom Left Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '15px',
                      left: '15px',
                      width: '60px',
                      height: '60px',
                      borderBottom: '4px solid #3f51b5',
                      borderLeft: '4px solid #3f51b5',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '25px',
                      left: '25px',
                      width: '40px',
                      height: '40px',
                      borderBottom: '2px solid #7986cb',
                      borderLeft: '2px solid #7986cb',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                  
                  {/* Bottom Right Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '15px',
                      right: '15px',
                      width: '60px',
                      height: '60px',
                      borderBottom: '4px solid #3f51b5',
                      borderRight: '4px solid #3f51b5',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '25px',
                      right: '25px',
                      width: '40px',
                      height: '40px',
                      borderBottom: '2px solid #7986cb',
                      borderRight: '2px solid #7986cb',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  />

                  {/* Decorative border pattern */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '30px',
                      left: '30px',
                      right: '30px',
                      bottom: '30px',
                      border: '3px solid #3f51b5',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  
                  {/* Inner decorative border */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '40px',
                      left: '40px',
                      right: '40px',
                      bottom: '40px',
                      border: '1px solid #7986cb',
                      opacity: 0.5,
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />

                  {/* Header Decorative Pattern */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50px',
                      left: '50px',
                      right: '50px',
                      height: '2px',
                      background: 'linear-gradient(to right, transparent, #3f51b5 20%, #7986cb 50%, #3f51b5 80%, transparent)',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  
                  <CardContent sx={{ p: 8, position: 'relative', zIndex: 3 }}>
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', mb: 5, position: 'relative' }}>
                      {/* Decorative elements above organization name */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ width: '80px', height: '2px', bgcolor: '#3f51b5', mr: 2 }} />
                        <Box sx={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          bgcolor: '#3f51b5',
                          border: '2px solid #7986cb'
                        }} />
                        <Box sx={{ width: '80px', height: '2px', bgcolor: '#3f51b5', ml: 2 }} />
                      </Box>

                      {/* Organization Name */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: '#1a237e',
                          letterSpacing: '2px',
                          fontSize: '1.15rem',
                          mb: 3,
                          textTransform: 'uppercase'
                        }}
                      >
                        AUNG – Advanced Upskilling & New Growth
                      </Typography>

                      {/* Decorative divider */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ width: '100px', height: '1px', bgcolor: '#7986cb', mr: 1 }} />
                        <Box sx={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          bgcolor: '#7986cb',
                          mx: 1
                        }} />
                        <Box sx={{ width: '100px', height: '1px', bgcolor: '#7986cb', ml: 1 }} />
                      </Box>

                      {/* Title */}
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: '#1a237e',
                          fontSize: '2.8rem',
                          mb: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '3px',
                          lineHeight: 1.2
                        }}
                      >
                        Course Completion Certificate
                      </Typography>

                      {/* Decorative divider below title */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                        <Box sx={{ width: '120px', height: '3px', bgcolor: '#3f51b5', mr: 2 }} />
                        <Box sx={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          bgcolor: '#3f51b5',
                          border: '3px solid #7986cb'
                        }} />
                        <Box sx={{ width: '120px', height: '3px', bgcolor: '#3f51b5', ml: 2 }} />
                      </Box>
                    </Box>

                    {/* Certificate Body */}
                    <Box sx={{ textAlign: 'center', my: 6, px: 2 }}>
                      {/* Decorative element before text */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ width: '60px', height: '1px', bgcolor: '#7986cb', opacity: 0.6 }} />
                      </Box>

                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontSize: '1.3rem', 
                          mb: 4,
                          color: '#424242',
                          fontStyle: 'italic',
                          letterSpacing: '0.5px'
                        }}
                      >
                        This is to certify that
                      </Typography>
                      
                      {/* Student Name */}
                      <Box sx={{ mb: 5, position: 'relative' }}>
                        <Box sx={{ 
                          position: 'absolute', 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          top: '-10px',
                          width: '200px',
                          height: '2px',
                          background: 'linear-gradient(to right, transparent, #3f51b5, transparent)'
                        }} />
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#1a237e', 
                            mb: 1,
                            fontSize: '2.5rem',
                            textDecoration: 'underline',
                            textDecorationColor: '#3f51b5',
                            textDecorationThickness: '4px',
                            textUnderlineOffset: '12px',
                            letterSpacing: '1px'
                          }}
                        >
                          {confirmedName || user?.name || user?.username || 'Student'}
                        </Typography>
                        <Box sx={{ 
                          position: 'absolute', 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          bottom: '-10px',
                          width: '200px',
                          height: '2px',
                          background: 'linear-gradient(to right, transparent, #3f51b5, transparent)'
                        }} />
                      </Box>
                      
                      {/* Reason */}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontSize: '1.15rem', 
                          mb: 4,
                          color: '#424242',
                          maxWidth: '650px',
                          mx: 'auto',
                          lineHeight: 2,
                          letterSpacing: '0.3px'
                        }}
                      >
                        has successfully completed all course materials and requirements demonstrating 
                        proficiency and commitment to learning
                      </Typography>
                      
                      {/* Decorative element before course name */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ width: '80px', height: '1px', bgcolor: '#7986cb', opacity: 0.6 }} />
                      </Box>
                      
                      {/* Course Name */}
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 2,
                          color: '#1a237e',
                          fontSize: '2rem',
                          fontStyle: 'italic',
                          letterSpacing: '1px'
                        }}
                      >
                        {course?.title || 'Course'}
                      </Typography>
                    </Box>

                    {/* Footer Decorative Pattern */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '50px',
                        left: '50px',
                        right: '50px',
                        height: '2px',
                        background: 'linear-gradient(to right, transparent, #3f51b5 20%, #7986cb 50%, #3f51b5 80%, transparent)',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    />

                    {/* Footer Section */}
                    <Box sx={{ mt: 10, pt: 6 }}>
                      {/* Decorative divider before instructors */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ width: '100px', height: '1px', bgcolor: '#7986cb', opacity: 0.5 }} />
                      </Box>

                      {/* Row 1: Three Instructors with Signatures */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', mb: 5, gap: 3, px: 2 }}>
                        {/* Instructor 1 */}
                        <Box sx={{ flex: 1, textAlign: 'center', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                          <Box>
                            <Box sx={{ mb: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                              <img 
                                src="/images/Thiha_Sign.png" 
                                alt="Instructor Signature" 
                                style={{ 
                                  maxWidth: '160px', 
                                  maxHeight: '65px',
                                  width: 'auto',
                                  height: 'auto',
                                  objectFit: 'contain',
                                  display: 'block'
                                }} 
                              />
                            </Box>
                            <Divider 
                              sx={{ 
                                width: '160px', 
                                borderWidth: 1.5, 
                                borderColor: '#424242', 
                                mb: 0.5,
                                mt: 0,
                                mx: 'auto'
                              }} 
                            />
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: '#1a237e', 
                                fontWeight: '600',
                                fontSize: '1rem',
                                lineHeight: 1.4,
                                letterSpacing: '0.5px',
                                mt: 0
                              }}
                            >
                              {course?.certificateInstructorName1 === 'Naing' || !course?.certificateInstructorName1 
                                ? 'Thiha Naing' 
                                : course.certificateInstructorName1}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Instructor 2 */}
                        <Box sx={{ flex: 1, textAlign: 'center', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                          <Box>
                            <Box sx={{ mb: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                              <img 
                                src="/images/Thiha_Sign.png" 
                                alt="Instructor Signature" 
                                style={{ 
                                  maxWidth: '160px', 
                                  maxHeight: '65px',
                                  width: 'auto',
                                  height: 'auto',
                                  objectFit: 'contain',
                                  display: 'block'
                                }} 
                              />
                            </Box>
                            <Divider 
                              sx={{ 
                                width: '160px', 
                                borderWidth: 1.5, 
                                borderColor: '#424242', 
                                mb: 0.5,
                                mt: 0,
                                mx: 'auto'
                              }} 
                            />
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: '#1a237e', 
                                fontWeight: '600',
                                fontSize: '1rem',
                                lineHeight: 1.4,
                                letterSpacing: '0.5px',
                                mt: 0
                              }}
                            >
                              {course?.certificateInstructorName2 || 'Nay Myo Khine'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Instructor 3 */}
                        <Box sx={{ flex: 1, textAlign: 'center', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                          <Box>
                            <Box sx={{ mb: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                              <img 
                                src="/images/Thiha_Sign.png" 
                                alt="Instructor Signature" 
                                style={{ 
                                  maxWidth: '160px', 
                                  maxHeight: '65px',
                                  width: 'auto',
                                  height: 'auto',
                                  objectFit: 'contain',
                                  display: 'block'
                                }} 
                              />
                            </Box>
                            <Divider 
                              sx={{ 
                                width: '160px', 
                                borderWidth: 1.5, 
                                borderColor: '#424242', 
                                mb: 0.5,
                                mt: 0,
                                mx: 'auto'
                              }} 
                            />
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: '#1a237e', 
                                fontWeight: '600',
                                fontSize: '1rem',
                                lineHeight: 1.4,
                                letterSpacing: '0.5px',
                                mt: 0
                              }}
                            >
                              {course?.certificateInstructorName3 || 'Min Thiha'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Decorative divider between instructors and date */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ width: '150px', height: '1px', bgcolor: '#7986cb', opacity: 0.5 }} />
                      </Box>

                      {/* Row 2: Date */}
                      <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#424242', 
                            fontWeight: 'bold', 
                            mb: 1.5,
                            fontSize: '0.95rem',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                          }}
                        >
                          Date
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#1a237e', 
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                      </Box>

                      {/* Decorative divider before stamp */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ width: '120px', height: '1px', bgcolor: '#7986cb', opacity: 0.5 }} />
                      </Box>

                      {/* Row 3: Stamp with Wings */}
                      <Box sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mb: 2, gap: 0 }}>
                        {/* Left Wing */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            width: '350px',
                            height: '400px',
                            mr: -30,
                            mt: -10
                          }}
                        >
                          <img 
                            src="/images/wing-left.png" 
                            alt="Left Wing" 
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block'
                            }} 
                          />
                        </Box>

                        {/* Stamp */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '300px',
                            height: '300px'
                          }}
                        >
                          <img 
                            src="/images/stamp.png" 
                            alt="AUNG Stamp" 
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block'
                            }} 
                          />
                        </Box>

                        {/* Right Wing */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-start',
                            width: '350px',
                            height: '400px',
                            ml: -29,
                            mt: -10
                          }}
                        >
                          <img 
                            src="/images/wing-right.png" 
                            alt="Right Wing" 
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block'
                            }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Download />}
                    onClick={handleDownloadPDF}
                    sx={{ px: 4 }}
                  >
                    Download Certificate (PDF)
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Download />}
                    onClick={() => {
                      // Share certificate
                      if (navigator.share) {
                        navigator.share({
                          title: `Certificate of Completion - ${course?.title}`,
                          text: `I've completed the course: ${course?.title}`,
                        });
                      }
                    }}
                    sx={{ px: 4 }}
                  >
                    Share Certificate
                  </Button>
                </Box>

                <Box sx={{ mt: 4, p: 3, bgcolor: 'success.light', borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Congratulations!
                    </Typography>
                  </Box>
                  <Typography variant="body1" align="center">
                    You have successfully completed all course materials. Your dedication and hard work have paid off!
                  </Typography>
                </Box>
              </Box>
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
                    {selectedMaterial.type === 'video' && <VideoLibrary />}
                    {selectedMaterial.type === 'document' && <Description />}
                    {selectedMaterial.type === 'multiplechoice' && <Quiz />}
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
                        
                        {/* Mark as Done Button */}
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                          {isMaterialComplete('video', materialContent.id) ? (
                            <Button
                              variant="contained"
                              color="success"
                              size="large"
                              startIcon={<CheckCircle />}
                              disabled
                              sx={{ minWidth: 200 }}
                            >
                              Completed
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              size="large"
                              startIcon={<TaskAlt />}
                              onClick={() => markMaterialComplete('video', materialContent.id)}
                              sx={{ minWidth: 200 }}
                            >
                              Mark as Done
                            </Button>
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
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {(() => {
                          const fileFormat = (materialContent.fileFormat || '').toLowerCase();
                          const canViewInline = ['pdf', 'txt', 'html'].includes(fileFormat);
                          const viewUrl = materialContent.documentUrl || 
                                         (materialContent.documentFile || materialContent.id 
                                          ? `http://localhost:5000/api/documents/${materialContent.id}/view` 
                                          : null);
                          
                          if (viewUrl && canViewInline) {
                            // PDF and text files can be viewed directly in browser
                            if (fileFormat === 'pdf') {
                              return (
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <iframe
                                    src={viewUrl}
                                    width="100%"
                                    height="100%"
                                    title={materialContent.title}
                                    style={{ border: 'none', flex: 1 }}
                                  />
                                  <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Download />}
                                      href={`http://localhost:5000/api/documents/${materialContent.id}/download`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Download PDF
                                    </Button>
                                  </Box>
                                </Box>
                              );
                            } else if (fileFormat === 'txt' || fileFormat === 'html') {
                              return (
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <iframe
                                    src={viewUrl}
                                    width="100%"
                                    height="100%"
                                    title={materialContent.title}
                                    style={{ border: 'none', flex: 1 }}
                                  />
                                  <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Download />}
                                      href={`http://localhost:5000/api/documents/${materialContent.id}/download`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Download
                                    </Button>
                                  </Box>
                                </Box>
                              );
                            }
                          } else if (viewUrl && ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileFormat)) {
                            // Office documents - try to use viewer if documentUrl is external, otherwise show download option
                            if (materialContent.documentUrl && !materialContent.documentUrl.includes('localhost')) {
                              // External URL - can use Office Online Viewer
                              const encodedUrl = encodeURIComponent(materialContent.documentUrl);
                              const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
                              
                              return (
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <iframe
                                    src={officeViewerUrl}
                                    width="100%"
                                    height="100%"
                                    title={materialContent.title}
                                    style={{ border: 'none', flex: 1 }}
                                  />
                                  <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Download />}
                                      href={`http://localhost:5000/api/documents/${materialContent.id}/download`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Download
                                    </Button>
                                  </Box>
                                </Box>
                              );
                            } else {
                              // Local file - Office Online Viewer doesn't work with localhost, show download option
                              return (
                                <Box sx={{ textAlign: 'center', p: 4 }}>
                                  <Description sx={{ fontSize: 80, mb: 2, color: 'grey.400' }} />
                                  <Typography variant="h6" color="text.secondary" gutterBottom>
                                    {materialContent.fileFormat?.toUpperCase()} Document
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    This document format cannot be viewed directly in the browser. 
                                    Please download it to view using Microsoft Office or compatible software.
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Download />}
                                    href={`http://localhost:5000/api/documents/${materialContent.id}/download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download {materialContent.fileFormat?.toUpperCase()} Document
                                  </Button>
                                </Box>
                              );
                            }
                          } else if (viewUrl) {
                            // Try to view other formats
                            return (
                              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <iframe
                                  src={viewUrl}
                                  width="100%"
                                  height="100%"
                                  title={materialContent.title}
                                  style={{ border: 'none', flex: 1 }}
                                />
                                <Box sx={{ p: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Download />}
                                    href={`http://localhost:5000/api/documents/${materialContent.id}/download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download
                                  </Button>
                                </Box>
                              </Box>
                            );
                          } else {
                            // No view URL available
                            return (
                              <Box sx={{ textAlign: 'center' }}>
                                <Description sx={{ fontSize: 80, mb: 2, color: 'grey.400' }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                  Document preview not available
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  This document cannot be viewed in the browser. Please download it to view.
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
                            );
                          }
                        })()}
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
                        
                        {/* Mark as Done Button */}
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                          {isMaterialComplete('document', materialContent.id) ? (
                            <Button
                              variant="contained"
                              color="success"
                              size="large"
                              startIcon={<CheckCircle />}
                              disabled
                              sx={{ minWidth: 200 }}
                            >
                              Completed
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              size="large"
                              startIcon={<TaskAlt />}
                              onClick={() => markMaterialComplete('document', materialContent.id)}
                              sx={{ minWidth: 200 }}
                            >
                              Mark as Done
                            </Button>
                          )}
                        </Box>
                        
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

                  {selectedMaterial?.type === 'multiplechoice' && (
                    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                      {/* Quiz Header */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {materialContent.title}
                        </Typography>
                        {materialContent.description && (
                          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                            {materialContent.description}
                          </Typography>
                        )}
                        {materialContent.instructions && (
                          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'info.dark' }}>
                              Instructions
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {materialContent.instructions}
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Quiz Info Chips */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                          <Chip
                            icon={<Quiz />}
                            label={`${materialContent.questions?.length || 0} Questions`}
                            color="primary"
                            variant="filled"
                          />
                          <Chip
                            label={`${materialContent.totalPoints} Total Points`}
                            color="secondary"
                            variant="filled"
                          />
                          {materialContent.timeLimit && (
                            <Chip
                              label={`${materialContent.timeLimit} Minutes`}
                              color="info"
                              variant="filled"
                            />
                          )}
                          {materialContent.maxAttempts && (
                            <Chip
                              label={`${materialContent.maxAttempts} Max Attempts`}
                              color="warning"
                              variant="filled"
                            />
                          )}
                          {materialContent.passingScore && (
                            <Chip
                              label={`${materialContent.passingScore}% Passing Score`}
                              color="success"
                              variant="filled"
                            />
                          )}
                          {materialContent.isFree && (
                            <Chip label="Free Quiz" color="success" variant="outlined" />
                          )}
                        </Box>
                      </Box>

                      {/* Quiz Questions */}
                      {materialContent.questions && materialContent.questions.length > 0 ? (
                        <Box>
                          {/* Quiz Results Banner */}
                          {quizSubmitted[materialContent.id] && quizResults[materialContent.id] && (
                            <Alert 
                              severity={quizResults[materialContent.id].percentage >= (materialContent.passingScore || 60) ? "success" : "warning"}
                              sx={{ mb: 3 }}
                            >
                              <Typography variant="h6" gutterBottom>
                                Quiz Results
                              </Typography>
                              <Typography variant="body1">
                                Score: {quizResults[materialContent.id].score} / {quizResults[materialContent.id].totalPoints} points ({quizResults[materialContent.id].percentage}%)
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Attempt: {quizAttempts[materialContent.id] || 0} / {materialContent.maxAttempts || 3}
                              </Typography>
                              {materialContent.passingScore && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  Passing Score: {materialContent.passingScore}%
                                  {quizResults[materialContent.id].percentage >= materialContent.passingScore 
                                    ? " - You passed! ✅" 
                                    : " - You need to score higher. Keep practicing!"}
                                </Typography>
                              )}
                              {!quizCanRetake[materialContent.id] && (
                                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                  Maximum attempts reached. This score has been saved.
                                </Typography>
                              )}
                            </Alert>
                          )}

                          {/* Attempt Info Banner */}
                          {!quizSubmitted[materialContent.id] && quizAttempts[materialContent.id] > 0 && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                              <Typography variant="body2">
                                Attempt {quizAttempts[materialContent.id]} of {materialContent.maxAttempts || 3}
                              </Typography>
                            </Alert>
                          )}

                          <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'text.primary' }}>
                            Quiz Questions
                          </Typography>
                          {materialContent.questions.map((question, index) => {
                            const quizId = materialContent.id;
                            const selectedAnswer = getSelectedAnswer(quizId, question.id);
                            const isSubmitted = quizSubmitted[quizId];
                            const questionResult = isSubmitted ? quizResults[quizId]?.results[question.id] : null;
                            
                            return (
                              <Card key={question.id} sx={{ mb: 3, p: 3, border: 1, borderColor: 'grey.200' }}>
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip 
                                      label={`Question ${index + 1}`} 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                      ({question.points} points)
                                    </Typography>
                                    {isSubmitted && questionResult && (
                                      <Chip 
                                        label={questionResult.correct ? "Correct ✓" : "Incorrect ✗"} 
                                        size="small" 
                                        color={questionResult.correct ? "success" : "error"} 
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Typography>
                                  <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                                    {question.questionText}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ pl: 2 }}>
                                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                    Select your answer:
                                  </Typography>
                                  
                                  {/* Option A */}
                                  <Box 
                                    onClick={() => {
                                      if (!isSubmitted && (quizAttempts[quizId] || 0) < (materialContent.maxAttempts || 3)) {
                                        handleQuizAnswerSelect(quizId, question.id, 'A');
                                      }
                                    }}
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      mb: 2, 
                                      p: 2, 
                                      border: 2, 
                                      borderColor: selectedAnswer === 'A' ? 'primary.main' : 'grey.300',
                                      bgcolor: selectedAnswer === 'A' ? 'primary.light' : 'transparent',
                                      borderRadius: 1, 
                                      cursor: (isSubmitted || (quizAttempts[quizId] || 0) >= (materialContent.maxAttempts || 3)) ? 'default' : 'pointer', 
                                      '&:hover': isSubmitted ? {} : { bgcolor: selectedAnswer === 'A' ? 'primary.light' : 'grey.50' },
                                      transition: 'all 0.2s',
                                      position: 'relative'
                                    }}
                                  >
                                    <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold', minWidth: '24px' }}>A.</Typography>
                                    <Typography variant="body1">{question.optionA}</Typography>
                                    {isSubmitted && questionResult && (
                                      <>
                                        {questionResult.correctAnswer === 'A' && (
                                          <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />
                                        )}
                                        {selectedAnswer === 'A' && !questionResult.correct && (
                                          <Close sx={{ ml: 'auto', color: 'error.main' }} />
                                        )}
                                      </>
                                    )}
                                  </Box>
                                  
                                  {/* Option B */}
                                  <Box 
                                    onClick={() => {
                                      if (!isSubmitted && (quizAttempts[quizId] || 0) < (materialContent.maxAttempts || 3)) {
                                        handleQuizAnswerSelect(quizId, question.id, 'B');
                                      }
                                    }}
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      mb: 2, 
                                      p: 2, 
                                      border: 2, 
                                      borderColor: selectedAnswer === 'B' ? 'primary.main' : 'grey.300',
                                      bgcolor: selectedAnswer === 'B' ? 'primary.light' : 'transparent',
                                      borderRadius: 1, 
                                      cursor: (isSubmitted || (quizAttempts[quizId] || 0) >= (materialContent.maxAttempts || 3)) ? 'default' : 'pointer', 
                                      '&:hover': isSubmitted ? {} : { bgcolor: selectedAnswer === 'B' ? 'primary.light' : 'grey.50' },
                                      transition: 'all 0.2s',
                                      position: 'relative'
                                    }}
                                  >
                                    <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold', minWidth: '24px' }}>B.</Typography>
                                    <Typography variant="body1">{question.optionB}</Typography>
                                    {isSubmitted && questionResult && (
                                      <>
                                        {questionResult.correctAnswer === 'B' && (
                                          <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />
                                        )}
                                        {selectedAnswer === 'B' && !questionResult.correct && (
                                          <Close sx={{ ml: 'auto', color: 'error.main' }} />
                                        )}
                                      </>
                                    )}
                                  </Box>
                                  
                                  {/* Option C */}
                                  {question.optionC && (
                                    <Box 
                                      onClick={() => {
                                        if (!isSubmitted && (quizAttempts[quizId] || 0) < (materialContent.maxAttempts || 3)) {
                                          handleQuizAnswerSelect(quizId, question.id, 'C');
                                        }
                                      }}
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: 2, 
                                        p: 2, 
                                        border: 2, 
                                        borderColor: selectedAnswer === 'C' ? 'primary.main' : 'grey.300',
                                        bgcolor: selectedAnswer === 'C' ? 'primary.light' : 'transparent',
                                        borderRadius: 1, 
                                        cursor: (isSubmitted || (quizAttempts[quizId] || 0) >= (materialContent.maxAttempts || 3)) ? 'default' : 'pointer', 
                                        '&:hover': isSubmitted ? {} : { bgcolor: selectedAnswer === 'C' ? 'primary.light' : 'grey.50' },
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                      }}
                                    >
                                      <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold', minWidth: '24px' }}>C.</Typography>
                                      <Typography variant="body1">{question.optionC}</Typography>
                                      {isSubmitted && questionResult && (
                                        <>
                                          {questionResult.correctAnswer === 'C' && (
                                            <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />
                                          )}
                                          {selectedAnswer === 'C' && !questionResult.correct && (
                                            <Close sx={{ ml: 'auto', color: 'error.main' }} />
                                          )}
                                        </>
                                      )}
                                    </Box>
                                  )}
                                  
                                  {/* Option D */}
                                  {question.optionD && (
                                    <Box 
                                      onClick={() => {
                                        if (!isSubmitted && (quizAttempts[quizId] || 0) < (materialContent.maxAttempts || 3)) {
                                          handleQuizAnswerSelect(quizId, question.id, 'D');
                                        }
                                      }}
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: 2, 
                                        p: 2, 
                                        border: 2, 
                                        borderColor: selectedAnswer === 'D' ? 'primary.main' : 'grey.300',
                                        bgcolor: selectedAnswer === 'D' ? 'primary.light' : 'transparent',
                                        borderRadius: 1, 
                                        cursor: (isSubmitted || (quizAttempts[quizId] || 0) >= (materialContent.maxAttempts || 3)) ? 'default' : 'pointer', 
                                        '&:hover': isSubmitted ? {} : { bgcolor: selectedAnswer === 'D' ? 'primary.light' : 'grey.50' },
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                      }}
                                    >
                                      <Typography variant="body1" sx={{ mr: 2, fontWeight: 'bold', minWidth: '24px' }}>D.</Typography>
                                      <Typography variant="body1">{question.optionD}</Typography>
                                      {isSubmitted && questionResult && (
                                        <>
                                          {questionResult.correctAnswer === 'D' && (
                                            <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />
                                          )}
                                          {selectedAnswer === 'D' && !questionResult.correct && (
                                            <Close sx={{ ml: 'auto', color: 'error.main' }} />
                                          )}
                                        </>
                                      )}
                                    </Box>
                                  )}
                                </Box>
                                
                                {/* Question Explanation - Show after submission */}
                                {isSubmitted && question.explanation && (
                                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                      Explanation
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                      {question.explanation}
                                    </Typography>
                                  </Box>
                                )}
                              </Card>
                            );
                          })}
                          
                          {/* Max Attempts Reached Warning */}
                          {quizAttempts[materialContent.id] >= (materialContent.maxAttempts || 3) && !quizSubmitted[materialContent.id] && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                              <Typography variant="body1">
                                You have reached the maximum number of attempts ({materialContent.maxAttempts || 3}) for this quiz. You cannot take it again.
                              </Typography>
                            </Alert>
                          )}

                          {/* Quiz Actions */}
                          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {!quizSubmitted[materialContent.id] ? (
                              <Button 
                                variant="contained" 
                                size="large"
                                sx={{ px: 4, py: 1.5 }}
                                onClick={() => handleQuizSubmit(materialContent.id, materialContent.questions)}
                                disabled={
                                  Object.keys(quizAnswers[materialContent.id] || {}).length === 0 ||
                                  (quizAttempts[materialContent.id] >= (materialContent.maxAttempts || 3))
                                }
                              >
                                {quizAttempts[materialContent.id] >= (materialContent.maxAttempts || 3) 
                                  ? "Max Attempts Reached" 
                                  : "Submit Quiz"}
                              </Button>
                            ) : (
                              <>
                                {quizCanRetake[materialContent.id] ? (
                                  <Button 
                                    variant="outlined" 
                                    size="large"
                                    sx={{ px: 4, py: 1.5 }}
                                    onClick={() => handleQuizReset(materialContent.id)}
                                  >
                                    Retake Quiz
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outlined" 
                                    size="large"
                                    sx={{ px: 4, py: 1.5 }}
                                    disabled
                                  >
                                    Max Attempts Reached
                                  </Button>
                                )}
                              </>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Quiz sx={{ fontSize: 80, mb: 2, color: 'grey.400' }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No questions available
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            This quiz doesn't have any questions yet.
                          </Typography>
                        </Box>
                      )}
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
