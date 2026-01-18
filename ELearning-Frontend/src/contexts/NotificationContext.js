import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, AlertTitle, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import ConfirmDialog from '../components/ConfirmDialog';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success', // success, error, warning, info
    title: null,
    duration: 6000,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: 'Confirm Action',
    message: '',
    type: 'warning',
    onConfirm: null,
    onCancel: null,
  });

  const showNotification = (message, type = 'success', options = {}) => {
    setNotification({
      open: true,
      message,
      type,
      title: options.title || null,
      duration: options.duration || (type === 'error' ? 8000 : 6000),
    });
  };

  const showSuccess = (message, options = {}) => {
    showNotification(message, 'success', options);
  };

  const showError = (message, options = {}) => {
    showNotification(message, 'error', options);
  };

  const showWarning = (message, options = {}) => {
    showNotification(message, 'warning', options);
  };

  const showInfo = (message, options = {}) => {
    showNotification(message, 'info', options);
  };

  const showConfirm = (message, onConfirm, onCancel = null, options = {}) => {
    setConfirmDialog({
      open: true,
      title: options.title || 'Confirm Action',
      message: message,
      type: options.type || 'warning',
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleConfirmClose = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
      default:
        return 'success';
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          mt: { xs: 7, sm: 8 },
          '& .MuiSnackbarContent-root': {
            minWidth: { xs: '90%', sm: '400px' },
          },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={getSeverity(notification.type)}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: { xs: '0.875rem', md: '1rem' },
            '& .MuiAlert-icon': {
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            },
            '& .MuiAlert-message': {
              width: '100%',
            },
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            borderRadius: 2,
            animation: 'slideInRight 0.3s ease-out',
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {notification.title && (
            <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
              {notification.title}
            </AlertTitle>
          )}
          {notification.message}
        </Alert>
      </Snackbar>
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleConfirmClose}
        onConfirm={confirmDialog.onConfirm || handleConfirmClose}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </NotificationContext.Provider>
  );
};
