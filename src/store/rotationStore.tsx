// store/rotationStore.ts
import { createContext, useContext, useState, ReactNode } from 'react';

interface RotationVariables {
  baseRotation: number;
  upperArmRotation: number;
  middleArmRotation: number;
  lowerArmRotation: number;
  gripRotation: number;
  platformX: number;
  platformZ: number;
}

interface RotationContextType {
  rotationValues: RotationVariables;
  setBaseRotation: (value: number) => void;
  setUpperArmRotation: (value: number) => void;
  setMiddleArmRotation: (value: number) => void;
  setLowerArmRotation: (value: number) => void;
  setGripRotation: (value: number) => void;
  setPlatformPosition: (x: number, z: number) => void;
}

const RotationContext = createContext<RotationContextType | undefined>(undefined);

export const RotationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rotationValues, setRotationValues] = useState<RotationVariables>({
    baseRotation: 0,
    upperArmRotation: 0,
    middleArmRotation: 0,
    lowerArmRotation: 0,
    gripRotation: 0,
    platformX: 0,
    platformZ: 0,
  });

  const setBaseRotation = (value: number) => {
    setRotationValues(prev => ({ ...prev, baseRotation: value }));
  };

  const setUpperArmRotation = (value: number) => {
    setRotationValues(prev => ({ ...prev, upperArmRotation: value }));
  };

  const setMiddleArmRotation = (value: number) => {
    setRotationValues(prev => ({ ...prev, middleArmRotation: value }));
  };

  const setLowerArmRotation = (value: number) => {
    setRotationValues(prev => ({ ...prev, lowerArmRotation: value }));
  };

  const setGripRotation = (value: number) => {
    setRotationValues(prev => ({ ...prev, gripRotation: value }));
  };

  const setPlatformPosition = (x: number, z: number) => {
    setRotationValues(prev => ({ ...prev, platformX: x, platformZ: z }));
  };

  return (
    <RotationContext.Provider value={{
      rotationValues,
      setBaseRotation,
      setUpperArmRotation,
      setMiddleArmRotation,
      setLowerArmRotation,
      setGripRotation,
      setPlatformPosition
    }}>
      {children}
    </RotationContext.Provider>
  );
};

export const useRotation = (): RotationContextType => {
  const context = useContext(RotationContext);
  if (context === undefined) {
    throw new Error('useRotation must be used within a RotationProvider');
  }
  return context;
};
