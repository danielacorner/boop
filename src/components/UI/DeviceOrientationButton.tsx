import { useState, useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: '20px',
  left: '20px',
  zIndex: 1000,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '80px',
  left: '20px',
  right: '20px',
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  padding: '16px',
  color: 'white',
  maxWidth: '300px',
}));

export function DeviceOrientationButton() {
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Check if we're on iOS and need permission
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const needsPermissionCheck = isIOS && typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    
    setNeedsPermission(needsPermissionCheck);
    
    // Show info for a few seconds on mobile devices
    if ('ontouchstart' in window) {
      setShowInfo(true);
      const timer = setTimeout(() => setShowInfo(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission === 'granted') {
        setPermissionGranted(true);
        setNeedsPermission(false);
      } else {
        console.log('Device orientation permission denied');
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  };

  if (!needsPermission && !showInfo) {
    return null;
  }

  return (
    <>
      {showInfo && (
        <InfoBox>
          <Typography variant="body2" sx={{ mb: 1 }}>
            📱 <strong>Mobile Tip:</strong>
          </Typography>
          <Typography variant="body2">
            Tilt your device to rotate the 3D scene! On iOS, you may need to enable device orientation permission.
          </Typography>
        </InfoBox>
      )}
      
      {needsPermission && !permissionGranted && (
        <StyledButton
          variant="contained"
          onClick={requestPermission}
          size="small"
        >
          Enable Tilt Control
        </StyledButton>
      )}
    </>
  );
}
