import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: null,
    phoneNumber: '',
    address: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = (key) => getTranslation(language, key);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsDoNotMatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('register.passwordTooShort'));
      setLoading(false);
      return;
    }

    if (!formData.dateOfBirth) {
      setError(t('register.selectDateOfBirth'));
      setLoading(false);
      return;
    }

    const userData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth.toISOString(),
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      role: formData.role
    };

    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || t('register.registrationFailed'));
    }
    
    setLoading(false);
  };

  // Set locale for DatePicker (date-fns doesn't have Myanmar locale, so we'll use enUS for both)
  const dateLocale = language === 'mm' ? enUS : enUS;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h4" gutterBottom>
                {t('register.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('register.subtitle')}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      label={t('register.firstName')}
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label={t('register.lastName')}
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label={t('register.emailAddress')}
                      name="email"
                      autoComplete="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label={t('register.password')}
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label={t('register.confirmPassword')}
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label={t('register.dateOfBirth')}
                      value={formData.dateOfBirth}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="role-label">{t('register.role')}</InputLabel>
                      <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formData.role}
                        label={t('register.role')}
                        onChange={handleChange}
                      >
                        <MenuItem value="Student">{t('register.student')}</MenuItem>
                        <MenuItem value="Instructor">{t('register.instructor')}</MenuItem>
                        <MenuItem value="Admin">{t('register.admin')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="phoneNumber"
                      label={t('register.phoneNumber')}
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="address"
                      label={t('register.address')}
                      id="address"
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : t('register.signUp')}
                </Button>
                <Box textAlign="center">
                  <Link component={RouterLink} to="/login" variant="body2">
                    {t('register.alreadyHaveAccount')} {t('register.signIn')}
                  </Link>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default Register;
