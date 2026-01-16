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
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  School,
  People,
  Assignment,
  TrendingUp,
  BookOnline,
  Star,
  Schedule,
  PlayArrow
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalStudents: 0,
    averageProgress: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'Student') {
        // For students, fetch only their enrolled courses
        const enrollmentsResponse = await axios.get('http://localhost:5000/api/enrollments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const enrollments = enrollmentsResponse.data || [];
        
        // Extract courses from enrollments
        const enrolledCourses = enrollments
          .map(e => e.course)
          .filter(course => course !== null && course !== undefined);
        
        // Sort by most recently enrolled
        const sortedCourses = enrolledCourses
          .sort((a, b) => {
            const enrollmentA = enrollments.find(e => e.courseId === a.id);
            const enrollmentB = enrollments.find(e => e.courseId === b.id);
            return new Date(enrollmentB?.enrolledAt || 0) - new Date(enrollmentA?.enrolledAt || 0);
          })
          .slice(0, 3);
        
        setRecentCourses(sortedCourses);
        
        // Calculate student-specific stats
        const completedCount = enrollments.filter(e => e.status === 'Completed').length;
        const inProgressCount = enrollments.filter(e => e.status === 'InProgress').length;
        
        // Calculate average progress (if available from progress data, otherwise use enrollment status)
        let avgProgress = 0;
        if (enrollments.length > 0) {
          // If we have progress data, use it; otherwise estimate based on status
          const completedEnrollments = enrollments.filter(e => e.status === 'Completed').length;
          avgProgress = (completedEnrollments / enrollments.length) * 100;
        }
        
        setStats({
          enrolledCourses: enrollments.length,
          completedCourses: completedCount,
          inProgressCourses: inProgressCount,
          averageProgress: Math.round(avgProgress)
        });
      } else {
        // For instructors/admins, fetch their created courses
        const coursesResponse = await axios.get('http://localhost:5000/api/courses');
        
        const allCourses = coursesResponse.data || [];
        const instructorCourses = allCourses.filter(course => course.instructorId === user.id);
        
        setRecentCourses(instructorCourses.slice(0, 3));
        
        // Try to fetch enrollments to count students (this might not be available for all instructors)
        let totalStudentsCount = 0;
        try {
          const enrollmentsResponse = await axios.get('http://localhost:5000/api/enrollments', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const allEnrollments = enrollmentsResponse.data || [];
          const instructorCourseIds = instructorCourses.map(c => c.id);
          totalStudentsCount = allEnrollments.filter(e => 
            instructorCourseIds.includes(e.courseId)
          ).length;
        } catch (error) {
          console.warn('Could not fetch enrollment data for instructor:', error);
          // If we can't fetch enrollments, we'll show 0 - this is acceptable
        }
        
        setStats({
          totalCourses: instructorCourses.length,
          totalStudents: totalStudentsCount
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Instructor': return 'primary';
      case 'Student': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {getGreeting()}, {user.firstName}! 👋
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={user.role} 
            color={getRoleColor(user.role)} 
            size="small" 
          />
          <Typography variant="body2" color="text.secondary">
            Welcome to your dashboard
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards - Different for Students vs Instructors */}
        {user.role === 'Student' ? (
          <>
            {/* Student Dashboard Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Courses</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {stats.enrolledCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enrolled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PlayArrow color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">In Progress</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    {stats.inProgressCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Courses
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Completed</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {stats.completedCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Courses Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Progress</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.averageProgress}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            {/* Instructor/Admin Dashboard Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Courses</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {stats.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Students</Typography>
                  </Box>
                  <Typography variant="h4" color="secondary">
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Engagement</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.totalCourses > 0 ? Math.round((stats.totalStudents / stats.totalCourses) * 10) / 10 : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Students/Course
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Activities</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    -
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Activities
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Recent Courses */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {user.role === 'Student' ? 'Your Recent Courses' : 'Your Created Courses'}
              </Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  Loading courses...
                </Typography>
              ) : recentCourses.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  {user.role === 'Student' 
                    ? "You haven't enrolled in any courses yet. Browse courses to get started!" 
                    : "You haven't created any courses yet."}
                </Typography>
              ) : (
                <List>
                  {recentCourses.map((course, index) => (
                    <React.Fragment key={course.id || index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <BookOnline />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={course.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {course.instructor?.firstName && course.instructor?.lastName
                                  ? `${course.instructor.firstName} ${course.instructor.lastName}`
                                  : course.instructorName || 'Instructor'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Star sx={{ fontSize: 16, color: 'orange', mr: 0.5 }} />
                                <Typography variant="body2" sx={{ mr: 2 }}>
                                  4.8
                                </Typography>
                                {course.level && (
                                  <Chip 
                                    label={course.level} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Typography variant="h6" color="primary">
                            ${course.price || 0}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => navigate(`/courses/${course.id}`)}
                          >
                            View
                          </Button>
                        </Box>
                      </ListItem>
                      {index < recentCourses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions>
              <Button 
                fullWidth
                onClick={() => navigate('/my-courses')}
              >
                {user.role === 'Student' ? 'View My Courses' : 'Manage My Courses'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {user.role === 'Instructor' || user.role === 'Admin' ? (
                  <>
                    <Button 
                      variant="contained" 
                      startIcon={<BookOnline />} 
                      fullWidth
                      onClick={() => navigate('/create-course')}
                    >
                      Create New Course
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<People />} 
                      fullWidth
                      onClick={() => navigate('/students')}
                    >
                      Manage Students
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Assignment />} 
                      fullWidth
                      onClick={() => navigate('/assignments')}
                    >
                      View Assignments
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      startIcon={<BookOnline />} 
                      fullWidth
                      onClick={() => navigate('/courses')}
                    >
                      Browse Courses
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Schedule />} 
                      fullWidth
                      onClick={() => navigate('/schedule')}
                    >
                      My Schedule
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Assignment />} 
                      fullWidth
                      onClick={() => navigate('/assignments')}
                    >
                      My Assignments
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
