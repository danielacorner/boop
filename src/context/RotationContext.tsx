import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RotationContextType {
  rotationVelocity: number;
  setRotationVelocity: (velocity: number) => void;
  isKinematic: boolean;
}

const defaultValue: RotationContextType = {
  rotationVelocity: 1,
  setRotationVelocity: (_velocity: number) => { /* This will be overridden */ },
  isKinematic: true
};

export const RotationContext = createContext<RotationContextType>(defaultValue);

export const useRotation = () => useContext(RotationContext);

interface RotationProviderProps {
  children: ReactNode;
}

export const RotationProvider: React.FC<RotationProviderProps> = ({ children }) => {
  const [rotationVelocity, setRotationVelocity] = useState<number>(1);
  
  // Determine if physics should be kinematic based on rotation velocity
  const isKinematic = rotationVelocity !== 0;

  return (
    <RotationContext.Provider value={{ rotationVelocity, setRotationVelocity, isKinematic }}>
      {children}
    </RotationContext.Provider>
  );
};
