import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading or wait for authentication check to complete
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route 
              path="/create-course" 
              element={
                <ProtectedRoute>
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-course/:id" 
              element={
                <ProtectedRoute>
                  <EditCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App;
