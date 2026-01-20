import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Fade,
  Slide,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close,
  Send,
  ThumbUp,
  ThumbDown,
  HelpOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [hasShownIntroduction, setHasShownIntroduction] = useState(false);
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID
    let session = sessionStorage.getItem('chatSessionId');
    if (!session) {
      session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('chatSessionId', session);
    }
    return session;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const showIntroduction = async () => {
    try {
      // Send a greeting message to get introduction response
      const response = await axios.post('http://localhost:5000/api/ChatWidget/message', {
        message: 'hello',
        sessionId: sessionId,
        userId: null
      });

      // Parse action button for introduction if available
      let actionButton = null;
      if (response.data.actionButton) {
        try {
          actionButton = typeof response.data.actionButton === 'string' 
            ? JSON.parse(response.data.actionButton) 
            : response.data.actionButton;
        } catch (error) {
          console.error('Error parsing action button:', error);
        }
      }

      const introMessage = {
        id: Date.now(),
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
        faqId: response.data.faqId,
        isIntroduction: true,
        actionButton: actionButton
      };

      setMessages([introMessage]);
    } catch (error) {
      console.error('Error loading introduction:', error);
      // Fallback introduction message
      const fallbackIntro = {
        id: Date.now(),
        text: 'Hello! 👋 Welcome to AUNG (Advanced Upskilling & New Growth)! I\'m here to help you learn about our platform, courses, instructors, and services. Feel free to ask me anything!',
        isUser: false,
        timestamp: new Date(),
        isIntroduction: true
      };
      setMessages([fallbackIntro]);
    }
  };

  useEffect(() => {
    if (isOpen && !hasShownIntroduction && messages.length === 0) {
      // Show introduction message only once when chat first opens
      showIntroduction();
      setHasShownIntroduction(true);
      // Load suggested questions when widget opens
      loadSuggestedQuestions();
      // Focus input when widget opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    } else if (isOpen) {
      // Just load suggested questions if chat was already opened before
      loadSuggestedQuestions();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSuggestedQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ChatWidget/faqs');
      if (response.data && response.data.length > 0) {
        const questions = response.data.slice(0, 5).map(faq => faq.question);
        setSuggestedQuestions(questions);
      }
    } catch (error) {
      console.error('Error loading suggested questions:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    // Check if user wants to end chat (conclusion)
    const messageLower = message.toLowerCase().trim();
    const conclusionKeywords = ['goodbye', 'bye', 'thank you', 'thanks', 'end chat', 'done', 'that\'s all', 'exit', 'close'];
    const isConclusion = conclusionKeywords.some(keyword => messageLower.includes(keyword));

    setLoading(true);
    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/ChatWidget/message', {
        message: message,
        sessionId: sessionId,
        userId: null // Can be updated if user is logged in
      });

      // Parse action button safely
      let actionButton = null;
      if (response.data.actionButton) {
        try {
          // If it's already an object, use it directly; otherwise parse JSON string
          actionButton = typeof response.data.actionButton === 'string' 
            ? JSON.parse(response.data.actionButton) 
            : response.data.actionButton;
        } catch (error) {
          console.error('Error parsing action button:', error);
          actionButton = null;
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
        faqId: response.data.faqId,
        messageId: null, // Will be set after saving
        isConclusion: isConclusion,
        actionButton: actionButton
      };

      setMessages(prev => [...prev, botMessage]);

      // Update suggested questions if provided
      if (response.data.suggestedQuestions) {
        setSuggestedQuestions(response.data.suggestedQuestions);
      }

      // If conclusion message, optionally close chat after a delay
      if (isConclusion) {
        setTimeout(() => {
          // Optionally auto-close or show a close button
          // For now, we'll just keep it open but user can close manually
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again later.',
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId, isHelpful) => {
    try {
      await axios.post('http://localhost:5000/api/ChatWidget/feedback', {
        messageId: messageId,
        isHelpful: isHelpful
      });
      // Update message to show feedback was submitted
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, feedbackSubmitted: true, feedback: isHelpful } : msg
        )
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    sendMessage(question);
  };

  const handleCloseChat = () => {
    // Show conclusion message before closing if there are messages
    if (messages.length > 0) {
      sendMessage('goodbye');
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Fade in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              width: 64,
              height: 64,
              backgroundColor: 'primary.main',
              color: 'white',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 32px rgba(99, 102, 241, 0.5)',
              },
              transition: 'all 0.3s ease',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <ChatIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
      </Fade>

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            maxWidth: 400,
            height: { xs: 'calc(100vh - 96px)', sm: 600 },
            maxHeight: 600,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                <HelpOutline />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Need Help?
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                  Ask me anything
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseChat}
              sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              backgroundColor: '#f8fafc',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f5f9',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#cbd5e1',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#94a3b8',
                },
              },
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HelpOutline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Loading...
                </Typography>
              </Box>
            ) : (
              <>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 1.5,
                          backgroundColor: message.isUser
                            ? 'primary.main'
                            : message.isError
                            ? 'error.light'
                            : message.isIntroduction
                            ? '#e3f2fd'
                            : message.isConclusion
                            ? '#f3e5f5'
                            : 'white',
                          color: message.isUser ? 'white' : 'text.primary',
                          borderRadius: 2,
                          borderTopLeftRadius: message.isUser ? 2 : 0,
                          borderTopRightRadius: message.isUser ? 0 : 2,
                          border: message.isIntroduction ? '2px solid #2196f3' : message.isConclusion ? '2px solid #9c27b0' : 'none',
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {message.text}
                        </Typography>
                      </Paper>
                      {/* Action Button for navigation */}
                      {message.actionButton && !message.isUser && (
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => {
                            if (message.actionButton.path) {
                              navigate(message.actionButton.path);
                              setIsOpen(false); // Close chat widget after navigation
                            }
                          }}
                          sx={{
                            mt: 1.5,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 2,
                          }}
                        >
                          {message.actionButton.text || 'Go to Page'}
                        </Button>
                      )}
                      {message.isConclusion && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setIsOpen(false)}
                          sx={{ mt: 1, fontSize: '0.75rem' }}
                        >
                          Close Chat
                        </Button>
                      )}
                      {!message.isUser && !message.isError && message.faqId && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {!message.feedbackSubmitted && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleFeedback(message.id, true)}
                                sx={{ p: 0.5 }}
                              >
                                <ThumbUp sx={{ fontSize: 16, color: 'text.secondary' }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleFeedback(message.id, false)}
                                sx={{ p: 0.5 }}
                              >
                                <ThumbDown sx={{ fontSize: 16, color: 'text.secondary' }} />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        borderTopLeftRadius: 0,
                      }}
                    >
                      <CircularProgress size={20} />
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                inputRef={inputRef}
                fullWidth
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                onClick={() => sendMessage()}
                disabled={loading || !inputMessage.trim()}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:disabled': {
                    backgroundColor: 'grey.300',
                  },
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default ChatWidget;
