import React, { createContext, useState, useContext, ReactNode } from 'react';

// Context interface
interface DepthContextType {
  depth: number;
  setDepth: (depth: number) => void;
}

// Create context with a default value
export const DepthContext = createContext<DepthContextType | undefined>(undefined);

// Provider component
interface DepthProviderProps {
  children: ReactNode;
  initialDepth?: number;
}

export const DepthProvider: React.FC<DepthProviderProps> = ({ 
  children, 
  initialDepth = 0 
}) => {
  const [depth, setDepth] = useState<number>(initialDepth);

  return (
    <DepthContext.Provider value={{ depth, setDepth }}>
      {children}
    </DepthContext.Provider>
  );
};

// Custom hook to use the context
export const useDepth = (): DepthContextType => {
  const context = useContext(DepthContext);
  if (context === undefined) {
    throw new Error('useDepth must be used within a DepthProvider');
  }
  return context;
};
