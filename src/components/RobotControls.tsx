// components/RobotControls.tsx
import React from 'react';
import { useRotation } from '../store/rotationStore';

const RobotControls: React.FC = () => {
    const { rotationValues, setBaseRotation, setUpperArmRotation, setLowerArmRotation, setGripRotation } = useRotation();

    return (
        <div className="control-panel">
            <div className="control">
                <label htmlFor="base-rotation">Base Rotation:</label>
                <input
                    id="base-rotation"
                    type="range"
                    value={rotationValues.baseRotation}
                    onChange={(e) => setBaseRotation(Number(e.target.value))}
                    min="-180"
                    max="180"
                    step="1"
                />
            </div>
            <div className="control">
                <label htmlFor="upper-arm-rotation">Upper Arm Rotation:</label>
                <input
                    id="upper-arm-rotation"
                    type="range"
                    value={rotationValues.upperArmRotation}
                    onChange={(e) => setUpperArmRotation(Number(e.target.value))}
                    min="-180"
                    max="180"
                    step="1"
                />
            </div>
            <div className="control">
                <label htmlFor="lower-arm-rotation">Lower Arm Rotation:</label>
                <input
                    id="lower-arm-rotation"
                    type="range"
                    value={rotationValues.lowerArmRotation}
                    onChange={(e) => setLowerArmRotation(Number(e.target.value))}
                    min="-180"
                    max="180"
                    step="1"
                />
            </div>
            <div className="control">
                <label htmlFor="grip-rotation">Grip Rotation:</label>
                <input
                    id="grip-rotation"
                    type="range"
                    value={rotationValues.gripRotation}
                    onChange={(e) => setGripRotation(Number(e.target.value))}
                    min="-180"
                    max="180"
                    step="1"
                />
            </div>
        </div>
    );
};

export default RobotControls;
