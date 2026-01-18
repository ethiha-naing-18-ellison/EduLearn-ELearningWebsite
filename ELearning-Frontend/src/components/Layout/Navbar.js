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
  Language
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <School sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          E-Learning Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Language Switcher */}
          <FormControl size="small" sx={{ minWidth: 120, backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <Select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{
                color: 'white',
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

          <Button color="inherit" onClick={() => navigate('/courses')}>
            {t('common.courses')}
          </Button>

          {user ? (
            <>
              {/* My Courses - Show for both Students and Instructors/Admins */}
              <Button
                color="inherit"
                startIcon={<BookOnline />}
                onClick={handleMyCourses}
              >
                {t('common.myCourses')}
              </Button>

              {/* Create Course - Only for Instructors/Admins */}
              {user.role === 'Instructor' || user.role === 'Admin' ? (
                <Button
                  color="inherit"
                  startIcon={<Add />}
                  onClick={handleCreateCourse}
                >
                  {t('dashboard.createNewCourse')}
                </Button>
              ) : null}

              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={handleDashboard}
              >
                {t('common.dashboard')}
              </Button>

              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar 
                  src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : null}
                  sx={{ width: 32, height: 32 }}
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
              >
                <MenuItem onClick={handleProfile}>
                  <AccountCircle sx={{ mr: 1 }} />
                  {t('common.profile')}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  {t('common.logout')}
                </MenuItem>
              </Menu>
            </> 
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                {t('common.login')}
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                {t('common.register')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
