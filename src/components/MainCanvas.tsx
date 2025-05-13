// components/MainCanvas.tsx
import React, { useRef, useEffect } from 'react';
import { CanvasObject } from '../module-3D/canvas/canvas-object';
import { RobotBase } from '../module-3D/segments/robot-base';
import { UpperArm } from '../module-3D/segments/upper-arm';
import { LowerArm } from '../module-3D/segments/lower-arm';
import { Grip } from '../module-3D/segments/grip';
import { useRotation } from '../store/rotationStore';

const MainCanvas: React.FC = () => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { rotationValues, setBaseRotation, setUpperArmRotation, setLowerArmRotation, setGripRotation } = useRotation();

    // Store objects as refs to maintain them between renders
    const canvasObjectRef = useRef<CanvasObject | null>(null);
    const robotBaseRef = useRef<RobotBase>(new RobotBase(0xaaaaee));
    const upperArmRef = useRef<UpperArm>(new UpperArm(0xaaaaee));
    const lowerArmRef = useRef<LowerArm>(new LowerArm(0xaaaaee));
    const gripRef = useRef<Grip>(new Grip(0xaaaaee));

    useEffect(() => {
        const canvasContainer = canvasContainerRef.current;
        const canvas = canvasRef.current;

        if (!(canvasContainer && canvas)) {
            return;
        }

        canvas.width = canvasContainer.clientWidth;
        canvas.height = canvasContainer.clientHeight;

        const resizeCanvas = () => {
            if (!canvas || !canvasContainer) return;

            canvas.width = canvasContainer.clientWidth;
            canvas.height = canvasContainer.clientHeight;

            if (canvasObjectRef.current) {
                canvasObjectRef.current.onWindowResize();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'a':
                    setUpperArmRotation(rotationValues.upperArmRotation + 1);
                    break;
                case 'd':
                    setUpperArmRotation(rotationValues.upperArmRotation - 1);
                    break;
                case 's':
                    setGripRotation(rotationValues.gripRotation + 1);
                    break;
                case 'w':
                    setGripRotation(rotationValues.gripRotation - 1);
                    break;
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!canvas) return;

            const canvasRect: DOMRect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left;
            const mouseY = event.clientY - canvasRect.top;

            const canvasWidth = canvas.clientWidth;
            const normalizedX = (mouseX / canvasWidth) * 22.5;

            const canvasHeight = canvas.clientHeight;
            const normalizedY = (mouseY / canvasHeight) * 22.5;
            const maxRotation = Math.PI * 2;

            setBaseRotation(maxRotation * normalizedX);
            setLowerArmRotation(maxRotation * normalizedY + Math.PI / 3);
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('mousemove', handleMouseMove);

        // Initialize 3D objects
        const robotBase = robotBaseRef.current;
        const upperArm = upperArmRef.current;
        const lowerArm = lowerArmRef.current;
        const grip = gripRef.current;

        robotBase.addChild(upperArm);
        upperArm.addChild(lowerArm);
        lowerArm.addChild(grip);

        canvasObjectRef.current = new CanvasObject(canvas);
        canvasObjectRef.current.start();
        canvasObjectRef.current.addObject(robotBase);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', handleKeyDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Watch effects to respond to rotation changes
    useEffect(() => {
        const angle = rotationValues.baseRotation * Math.PI / 180;
        robotBaseRef.current.rotation.y = angle;
    }, [rotationValues.baseRotation]);

    useEffect(() => {
        const angle = rotationValues.upperArmRotation * Math.PI / 180;
        upperArmRef.current.rotate(angle);
    }, [rotationValues.upperArmRotation]);

    useEffect(() => {
        const angle = rotationValues.lowerArmRotation * Math.PI / 180;
        lowerArmRef.current.rotate(angle);
    }, [rotationValues.lowerArmRotation]);

    useEffect(() => {
        const angle = rotationValues.gripRotation * Math.PI / 180;
        gripRef.current.rotate(angle);
    }, [rotationValues.gripRotation]);

    return (
        <div className="canvas-container" ref={canvasContainerRef}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default MainCanvas;
