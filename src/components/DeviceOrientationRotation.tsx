import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function DeviceOrientationRotation() {
  const { scene } = useThree();
  const orientationRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const targetRotationRef = useRef(new THREE.Euler(0, 0, 0));
  const currentRotationRef = useRef(new THREE.Euler(0, 0, 0));

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      // Get orientation values
      const alpha = event.alpha || 0; // Z axis (0-360)
      const beta = event.beta || 0;   // X axis (-180 to 180)
      const gamma = event.gamma || 0; // Y axis (-90 to 90)

      // Store the orientation values
      orientationRef.current = { alpha, beta, gamma };

      // Convert to radians and set target rotation
      // We'll use a more intuitive mapping for the fidget toy
      targetRotationRef.current.set(
        THREE.MathUtils.degToRad(beta * 0.5),   // Tilt forward/backward
        THREE.MathUtils.degToRad(alpha * 0.5),  // Rotate left/right
        THREE.MathUtils.degToRad(gamma * 0.5)   // Roll left/right
      );
    };

    const requestPermission = async () => {
      // For iOS 13+ devices, we need to request permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          } else {
            console.log('Device orientation permission denied');
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        // For other devices, just add the event listener
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    };

    // Check if device orientation is supported
    if (window.DeviceOrientationEvent) {
      requestPermission();
    } else {
      console.log('Device orientation not supported');
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  useFrame(() => {
    // Smoothly interpolate between current and target rotation
    const lerpFactor = 0.1;
    
    currentRotationRef.current.x = THREE.MathUtils.lerp(
      currentRotationRef.current.x,
      targetRotationRef.current.x,
      lerpFactor
    );
    currentRotationRef.current.y = THREE.MathUtils.lerp(
      currentRotationRef.current.y,
      targetRotationRef.current.y,
      lerpFactor
    );
    currentRotationRef.current.z = THREE.MathUtils.lerp(
      currentRotationRef.current.z,
      targetRotationRef.current.z,
      lerpFactor
    );

    // Apply the rotation to the scene
    scene.rotation.copy(currentRotationRef.current);
  });

  return null;
}
