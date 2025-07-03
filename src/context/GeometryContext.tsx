import React, { createContext, useState, useContext, ReactNode } from 'react';

export type GeometryType = "sphere" | "dodecahedron" | "icosahedron" | "box" | "tetrahedron" | "octahedron" | "tetrahedron_star";

// Context interface
interface GeometryContextType {
  geometryType: GeometryType;
  setGeometryType: (type: GeometryType) => void;
}

// Create context with a default value
const GeometryContext = createContext<GeometryContextType | undefined>(undefined);

// Provider component
interface GeometryProviderProps {
  children: ReactNode;
  initialGeometry?: GeometryType;
}

export const GeometryProvider: React.FC<GeometryProviderProps> = ({ 
  children, 
  initialGeometry = "dodecahedron" 
}) => {
  const [geometryType, setGeometryType] = useState<GeometryType>(initialGeometry);

  return (
    <GeometryContext.Provider value={{ geometryType, setGeometryType }}>
      {children}
    </GeometryContext.Provider>
  );
};

// Custom hook to use the context
export const useGeometry = (): GeometryContextType => {
  const context = useContext(GeometryContext);
  if (context === undefined) {
    throw new Error('useGeometry must be used within a GeometryProvider');
  }
  return context;
};
