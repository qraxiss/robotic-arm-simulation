// store/rotationStore.ts
import { createContext, useContext, useState, ReactNode } from 'react';

interface RotationVariables {
  baseRotation: number;
  upperArmRotation: number;
  middleArmRotations: number[];
  lowerArmRotation: number;
  gripRotation: number;
  platformX: number;
  platformZ: number;
  middleArmCount: number;
}

interface RotationContextType {
  rotationValues: RotationVariables;
  setBaseRotation: (value: number) => void;
  setUpperArmRotation: (value: number) => void;
  setMiddleArmRotation: (index: number, value: number) => void;
  setLowerArmRotation: (value: number) => void;
  setGripRotation: (value: number) => void;
  setPlatformPosition: (x: number, z: number) => void;
  setMiddleArmCount: (count: number) => void;
}

const RotationContext = createContext<RotationContextType | undefined>(undefined);

export const RotationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rotationValues, setRotationValues] = useState<RotationVariables>({
    baseRotation: 0,
    upperArmRotation: 0,
    middleArmRotations: [0],
    lowerArmRotation: 0,
    gripRotation: 0,
    platformX: 0,
    platformZ: 0,
    middleArmCount: 1,
  });

  const setBaseRotation = (value: number) => {
    setRotationValues(prev => ({ ...prev, baseRotation: value }));
  };

  const setUpperArmRotation = (value: number) => {
    setRotationValues(prev => ({ ...prev, upperArmRotation: value }));
  };

  const setMiddleArmRotation = (index: number, value: number) => {
    setRotationValues(prev => {
      const newRotations = [...prev.middleArmRotations];
      newRotations[index] = value;
      return { ...prev, middleArmRotations: newRotations };
    });
  };

  const setMiddleArmCount = (count: number) => {
    setRotationValues(prev => {
      const newRotations = new Array(count).fill(0);
      // Preserve existing rotations where possible
      for (let i = 0; i < Math.min(count, prev.middleArmRotations.length); i++) {
        newRotations[i] = prev.middleArmRotations[i];
      }
      return { ...prev, middleArmCount: count, middleArmRotations: newRotations };
    });
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
      setPlatformPosition,
      setMiddleArmCount
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
