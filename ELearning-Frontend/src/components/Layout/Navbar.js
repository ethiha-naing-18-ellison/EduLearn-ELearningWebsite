import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  useTheme,
  useMediaQuery,
  Select,
  FormControl
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  School,
  Dashboard,
  Add,
  ExitToApp,
  BookOnline,
  Language,
  Close
} from '@mui/icons-material';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const t = (key) => getTranslation(language, key);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };

  const handleCreateCourse = () => {
    navigate('/create-course');
    handleClose();
  };

  const handleMyCourses = () => {
    navigate('/my-courses');
    handleClose();
    setMobileMenuAnchor(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 30%, #ec4899 60%, #6366f1 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient 8s ease infinite',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'float 10s ease-in-out infinite',
          pointerEvents: 'none',
        },
      }}
    >
      <Toolbar sx={{ py: 1.5, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.3)',
              animation: 'pulse 3s ease-in-out infinite',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(5deg) scale(1.1)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.5)',
              },
            }}
          >
            <School sx={{ color: '#6366f1', fontSize: 30 }} />
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 800,
              fontSize: { xs: '1.1rem', sm: '1.35rem' },
              letterSpacing: '-0.02em',
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.95) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 10px rgba(255,255,255,0.3)',
            }}
          >
            EduLearn
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 }, flexGrow: 1, justifyContent: 'flex-end' }}>
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {/* Language Switcher */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 120, 
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <Select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="mm">မြန်မာ</MenuItem>
              </Select>
            </FormControl>

            <Button 
              color="inherit" 
              onClick={() => navigate('/courses')}
              startIcon={<BookOnline />}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                fontSize: '0.875rem',
                minHeight: 40,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              {t('common.courses')}
            </Button>

            {user ? (
              <>
                <Button
                  color="inherit"
                  startIcon={<BookOnline />}
                  onClick={handleMyCourses}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    minHeight: 40,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  {t('common.myCourses')}
                </Button>

                {user.role === 'Instructor' || user.role === 'Admin' ? (
                  <Button
                    color="inherit"
                    startIcon={<Add />}
                    onClick={handleCreateCourse}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      minHeight: 40,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                      },
                    }}
                  >
                    {t('dashboard.createNewCourse')}
                  </Button>
                ) : null}

                <Button
                  color="inherit"
                  startIcon={<Dashboard />}
                  onClick={handleDashboard}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    minHeight: 40,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  {t('common.dashboard')}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    minHeight: 40,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  {t('common.login')}
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => navigate('/register')}
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    color: '#6366f1',
                    fontWeight: 700,
                    px: 2.5,
                    fontSize: '0.875rem',
                    minHeight: 40,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(255,255,255,0.4), 0 0 30px rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  {t('common.register')}
                </Button>
              </>
            )}
          </Box>

          {/* Mobile/Tablet Navigation */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            {/* Language Switcher - Mobile */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: 80, sm: 100 }, 
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <Select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                    fontSize: '1.2rem',
                  },
                }}
              >
                <MenuItem value="en" sx={{ fontSize: '0.875rem' }}>EN</MenuItem>
                <MenuItem value="mm" sx={{ fontSize: '0.875rem' }}>MM</MenuItem>
              </Select>
            </FormControl>

            {/* User Avatar or Login Button - Mobile */}
            {user ? (
              <IconButton
                size="large"
                aria-label="account menu"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  p: 0.5,
                  transition: 'all 0.3s ease',
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <Avatar 
                  src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : null}
                  sx={{ 
                    width: { xs: 32, sm: 36 }, 
                    height: { xs: 32, sm: 36 },
                    border: '2px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </Avatar>
              </IconButton>
            ) : (
              <Button 
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  color: '#6366f1',
                  fontWeight: 700,
                  px: { xs: 1.5, sm: 2 },
                  py: 0.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minHeight: { xs: 32, sm: 36 },
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                {t('common.register')}
              </Button>
            )}

            {/* Hamburger Menu */}
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{
                ml: 0.5,
                p: 1,
                transition: 'all 0.3s ease',
                '&:active': {
                  transform: 'scale(0.9)',
                },
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </IconButton>
          </Box>

          {/* Desktop User Menu */}
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  ml: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Avatar 
                  src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : null}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '3px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <MenuItem onClick={handleProfile} sx={{ py: 1.5, fontSize: '0.9375rem' }}>
                  <AccountCircle sx={{ mr: 1.5, fontSize: 24 }} />
                  {t('common.profile')}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, fontSize: '0.9375rem' }}>
                  <ExitToApp sx={{ mr: 1.5, fontSize: 24 }} />
                  {t('common.logout')}
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Mobile Drawer Menu */}
          <Drawer
            anchor="right"
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                width: { xs: '85%', sm: 320 },
                maxWidth: 400,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
                  Menu
                </Typography>
                <IconButton
                  onClick={handleMobileMenuClose}
                  sx={{
                    color: 'white',
                    '&:active': {
                      transform: 'scale(0.9)',
                    },
                  }}
                >
                  <Close />
                </IconButton>
              </Box>

              <List sx={{ pt: 0 }}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate('/courses');
                      handleMobileMenuClose();
                    }}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      '&:active': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        transform: 'scale(0.98)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <BookOnline sx={{ color: 'white', fontSize: 28 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('common.courses')} 
                      primaryTypographyProps={{ 
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>

                {user && (
                  <>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={handleMyCourses}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          '&:active': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(0.98)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <BookOnline sx={{ color: 'white', fontSize: 28 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('common.myCourses')} 
                          primaryTypographyProps={{ 
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={handleDashboard}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          '&:active': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(0.98)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Dashboard sx={{ color: 'white', fontSize: 28 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('common.dashboard')} 
                          primaryTypographyProps={{ 
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>

                    {(user.role === 'Instructor' || user.role === 'Admin') && (
                      <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                          onClick={() => {
                            handleCreateCourse();
                            handleMobileMenuClose();
                          }}
                          sx={{
                            borderRadius: 2,
                            py: 1.5,
                            '&:active': {
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              transform: 'scale(0.98)',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Add sx={{ color: 'white', fontSize: 28 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={t('dashboard.createNewCourse')} 
                            primaryTypographyProps={{ 
                              fontWeight: 600,
                              fontSize: '1rem',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )}

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={() => {
                          handleProfile();
                          handleMobileMenuClose();
                        }}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          '&:active': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(0.98)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AccountCircle sx={{ color: 'white', fontSize: 28 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('common.profile')} 
                          primaryTypographyProps={{ 
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => {
                          handleLogout();
                          handleMobileMenuClose();
                        }}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          '&:active': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(0.98)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <ExitToApp sx={{ color: 'white', fontSize: 28 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={t('common.logout')} 
                          primaryTypographyProps={{ 
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}

                {!user && (
                  <>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={() => {
                          navigate('/login');
                          handleMobileMenuClose();
                        }}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '&:active': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(0.98)',
                          },
                        }}
                      >
                        <ListItemText 
                          primary={t('common.login')} 
                          primaryTypographyProps={{ 
                            fontWeight: 700,
                            fontSize: '1rem',
                            textAlign: 'center',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
            </Box>
          </Drawer>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
