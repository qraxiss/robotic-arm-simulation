// components/MainCanvas.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { CanvasObject } from '../module-3D/canvas/canvas-object';
import { RobotBase } from '../module-3D/segments/robot-base';
import { UpperArm } from '../module-3D/segments/upper-arm';
import { MiddleArm } from '../module-3D/segments/middle-arm';
import { LowerArm } from '../module-3D/segments/lower-arm';
import { Grip } from '../module-3D/segments/grip';
import { Platform } from '../module-3D/segments/platform';
import { useRotation } from '../store/rotationStore';
import { calculateInverseKinematics } from '../utils/inverse-kinematics';

const MainCanvas: React.FC = () => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { rotationValues, setBaseRotation, setUpperArmRotation, setMiddleArmRotation, setLowerArmRotation, setGripRotation, setPlatformPosition, setMiddleArmCount, setMiddleArmLength } = useRotation();

    // Store objects as refs to maintain them between renders
    const canvasObjectRef = useRef<CanvasObject | null>(null);
    const platformRef = useRef<Platform>(new Platform(0x666666));
    const robotBaseRef = useRef<RobotBase>(new RobotBase(0xaaaaee));
    const upperArmRef = useRef<UpperArm>(new UpperArm(0xaaaaee));
    const middleArmsRef = useRef<MiddleArm[]>([new MiddleArm(0xaaaaee, 25)]);
    const lowerArmRef = useRef<LowerArm>(new LowerArm(0xaaaaee));
    const gripRef = useRef<Grip>(new Grip(0xaaaaee));
    const raycastRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

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

        const handleClick = (event: MouseEvent) => {
            if (!canvas || !canvasObjectRef.current) return;

            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycastRef.current.setFromCamera(mouseRef.current, canvasObjectRef.current.camera);

            const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersectPoint = new THREE.Vector3();
            raycastRef.current.ray.intersectPlane(groundPlane, intersectPoint);

            if (intersectPoint) {
                setPlatformPosition(intersectPoint.x, intersectPoint.z);

                const ikResult = calculateInverseKinematics(
                    0,
                    3,
                    0,
                    25,
                    25,
                    16.5
                );

                if (ikResult) {
                    setBaseRotation(ikResult.baseAngle * 180 / Math.PI);
                    setUpperArmRotation(-ikResult.upperArmAngle * 180 / Math.PI);
                    setLowerArmRotation(-ikResult.lowerArmAngle * 180 / Math.PI);
                }
            }
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);

        // Initialize 3D objects
        const platform = platformRef.current;
        const robotBase = robotBaseRef.current;
        const upperArm = upperArmRef.current;
        const lowerArm = lowerArmRef.current;
        const grip = gripRef.current;

        platform.add(robotBase);
        robotBase.addChild(upperArm);
        
        // Connect middle arms chain
        if (middleArmsRef.current.length > 0) {
            upperArm.addChild(middleArmsRef.current[0]);
            for (let i = 0; i < middleArmsRef.current.length - 1; i++) {
                middleArmsRef.current[i].addChild(middleArmsRef.current[i + 1]);
            }
            middleArmsRef.current[middleArmsRef.current.length - 1].addChild(lowerArm);
        } else {
            upperArm.addChild(lowerArm);
        }
        
        lowerArm.addChild(grip);

        canvasObjectRef.current = new CanvasObject(canvas);
        canvasObjectRef.current.start();
        canvasObjectRef.current.scene.add(platform);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('keydown', handleKeyDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
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

    // Update middle arms when count changes
    useEffect(() => {
        const count = rotationValues.middleArmCount;
        const currentCount = middleArmsRef.current.length;
        
        if (count !== currentCount) {
            // Remove all middle arms from scene
            middleArmsRef.current.forEach(arm => {
                if (arm.parent) {
                    arm.parent.remove(arm);
                }
            });
            
            // Create new middle arms
            const newMiddleArms: MiddleArm[] = [];
            for (let i = 0; i < count; i++) {
                newMiddleArms.push(new MiddleArm(0xaaaaee, rotationValues.middleArmLength));
            }
            middleArmsRef.current = newMiddleArms;
            
            // Reconnect the chain
            const upperArm = upperArmRef.current;
            const lowerArm = lowerArmRef.current;
            
            // Remove lowerArm from its current parent
            if (lowerArm.parent) {
                lowerArm.parent.remove(lowerArm);
            }
            
            if (count > 0) {
                upperArm.addChild(middleArmsRef.current[0]);
                for (let i = 0; i < count - 1; i++) {
                    middleArmsRef.current[i].addChild(middleArmsRef.current[i + 1]);
                }
                middleArmsRef.current[count - 1].addChild(lowerArm);
            } else {
                upperArm.addChild(lowerArm);
            }
        }
    }, [rotationValues.middleArmCount]);
    
    // Update middle arms rotations
    useEffect(() => {
        middleArmsRef.current.forEach((arm, index) => {
            if (index < rotationValues.middleArmRotations.length) {
                const angle = rotationValues.middleArmRotations[index] * Math.PI / 180;
                arm.rotate(angle);
            }
        });
    }, [rotationValues.middleArmRotations]);

    // Update middle arms length
    useEffect(() => {
        middleArmsRef.current.forEach(arm => {
            arm.updateLength(rotationValues.middleArmLength);
        });
    }, [rotationValues.middleArmLength]);

    useEffect(() => {
        const angle = rotationValues.lowerArmRotation * Math.PI / 180;
        lowerArmRef.current.rotate(angle);
    }, [rotationValues.lowerArmRotation]);

    useEffect(() => {
        const angle = rotationValues.gripRotation * Math.PI / 180;
        gripRef.current.rotate(angle);
    }, [rotationValues.gripRotation]);

    useEffect(() => {
        const targetX = rotationValues.platformX;
        const targetZ = rotationValues.platformZ;
        const currentX = platformRef.current.position.x;
        const currentZ = platformRef.current.position.z;

        const animationDuration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            platformRef.current.position.x = currentX + (targetX - currentX) * easeProgress;
            platformRef.current.position.z = currentZ + (targetZ - currentZ) * easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }, [rotationValues.platformX, rotationValues.platformZ]);

    return (
        <div className="canvas-container" ref={canvasContainerRef}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default MainCanvas;
