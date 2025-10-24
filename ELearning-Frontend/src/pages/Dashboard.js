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
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    totalStudents: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's courses and stats
      const coursesResponse = await axios.get('http://localhost:5000/api/courses');
      const enrollmentsResponse = await axios.get('http://localhost:5000/api/enrollments');
      
      setRecentCourses(coursesResponse.data.slice(0, 3));
      
      if (user.role === 'Instructor' || user.role === 'Admin') {
        setStats({
          totalCourses: coursesResponse.data.filter(course => course.instructorId === user.id).length,
          enrolledCourses: 0,
          completedCourses: 0,
          totalStudents: enrollmentsResponse.data.length
        });
      } else {
        setStats({
          totalCourses: coursesResponse.data.length,
          enrolledCourses: enrollmentsResponse.data.length,
          completedCourses: enrollmentsResponse.data.filter(e => e.status === 'Completed').length,
          totalStudents: 0
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
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Courses</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {user.role === 'Student' ? stats.enrolledCourses : stats.totalCourses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.role === 'Student' ? 'Enrolled' : 'Created'}
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
                85%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Courses */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {user.role === 'Student' ? 'Your Recent Courses' : 'Your Created Courses'}
              </Typography>
              <List>
                {recentCourses.map((course, index) => (
                  <React.Fragment key={course.id}>
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
                              {course.instructor?.firstName} {course.instructor?.lastName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Star sx={{ fontSize: 16, color: 'orange', mr: 0.5 }} />
                              <Typography variant="body2" sx={{ mr: 2 }}>
                                4.8
                              </Typography>
                              <Chip 
                                label={course.level} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="h6" color="primary">
                          ${course.price}
                        </Typography>
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </Box>
                    </ListItem>
                    {index < recentCourses.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button fullWidth>
                View All Courses
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
                    <Button variant="contained" startIcon={<BookOnline />} fullWidth>
                      Create New Course
                    </Button>
                    <Button variant="outlined" startIcon={<People />} fullWidth>
                      Manage Students
                    </Button>
                    <Button variant="outlined" startIcon={<Assignment />} fullWidth>
                      View Assignments
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="contained" startIcon={<BookOnline />} fullWidth>
                      Browse Courses
                    </Button>
                    <Button variant="outlined" startIcon={<Schedule />} fullWidth>
                      My Schedule
                    </Button>
                    <Button variant="outlined" startIcon={<Assignment />} fullWidth>
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
