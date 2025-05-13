// App.tsx
import React from 'react';
import MainCanvas from './components/MainCanvas';
import RobotControls from './components/RobotControls';
import { RotationProvider } from './store/rotationStore';
import './styles.css';

const App: React.FC = () => {
  return (
    <RotationProvider>
      <MainCanvas />
      <RobotControls />
    </RotationProvider>
  );
};

export default App;
