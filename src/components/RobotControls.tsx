// components/RobotControls.tsx
import React from 'react';
import { useRotation } from '../store/rotationStore';

const RobotControls: React.FC = () => {
    const { rotationValues, setBaseRotation, setUpperArmRotation, setMiddleArmRotation, setLowerArmRotation, setGripRotation, setPlatformPosition, setMiddleArmCount, setMiddleArmLength } = useRotation();

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
                <label htmlFor="middle-arm-count">Middle Arm Count:</label>
                <input
                    id="middle-arm-count"
                    type="range"
                    value={rotationValues.middleArmCount}
                    onChange={(e) => setMiddleArmCount(Number(e.target.value))}
                    min="0"
                    max="5"
                    step="1"
                />
                <span style={{ marginLeft: '10px' }}>{rotationValues.middleArmCount}</span>
            </div>
            {rotationValues.middleArmCount > 0 && (
                <div className="control">
                    <label htmlFor="middle-arm-length">Middle Arm Length:</label>
                    <input
                        id="middle-arm-length"
                        type="range"
                        value={rotationValues.middleArmLength}
                        onChange={(e) => setMiddleArmLength(Number(e.target.value))}
                        min="10"
                        max="40"
                        step="1"
                    />
                    <span style={{ marginLeft: '10px' }}>{rotationValues.middleArmLength}</span>
                </div>
            )}
            {rotationValues.middleArmRotations.map((rotation, index) => (
                <div key={index} className="control">
                    <label htmlFor={`middle-arm-rotation-${index}`}>Middle Arm {index + 1} Rotation:</label>
                    <input
                        id={`middle-arm-rotation-${index}`}
                        type="range"
                        value={rotation}
                        onChange={(e) => setMiddleArmRotation(index, Number(e.target.value))}
                        min="-180"
                        max="180"
                        step="1"
                    />
                </div>
            ))}
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
            <div className="control">
                <label htmlFor="platform-x">Platform X:</label>
                <input
                    id="platform-x"
                    type="range"
                    value={rotationValues.platformX}
                    onChange={(e) => setPlatformPosition(Number(e.target.value), rotationValues.platformZ)}
                    min="-50"
                    max="50"
                    step="1"
                />
            </div>
            <div className="control">
                <label htmlFor="platform-z">Platform Z:</label>
                <input
                    id="platform-z"
                    type="range"
                    value={rotationValues.platformZ}
                    onChange={(e) => setPlatformPosition(rotationValues.platformX, Number(e.target.value))}
                    min="-50"
                    max="50"
                    step="1"
                />
            </div>
        </div>
    );
};

export default RobotControls;
