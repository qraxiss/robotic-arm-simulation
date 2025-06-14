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

const MainCanvas: React.FC = () => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { rotationValues, setBaseRotation, setUpperArmRotation, setAllMiddleArmRotations, setMiddleArmRotation, setLowerArmRotation, setGripRotation, setPlatformPosition } = useRotation();
    const rotationValuesRef = useRef(rotationValues);
    const armAnimationRef = useRef<number | null>(null);
    const baseAnimationRef = useRef<number | null>(null);

    // Update ref when rotationValues changes
    useEffect(() => {
        rotationValuesRef.current = rotationValues;
    }, [rotationValues]);

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
            const currentValues = rotationValuesRef.current;
            switch (event.key) {
                case 'a':
                    setUpperArmRotation(currentValues.upperArmRotation + 1);
                    break;
                case 'd':
                    setUpperArmRotation(currentValues.upperArmRotation - 1);
                    break;
                case 's':
                    setGripRotation(currentValues.gripRotation + 1);
                    break;
                case 'w':
                    setGripRotation(currentValues.gripRotation - 1);
                    break;
            }
        };


        const animateArmRotations = (startValues: any, targetValues: any, duration: number, onComplete?: () => void) => {
            if (armAnimationRef.current) {
                cancelAnimationFrame(armAnimationRef.current);
            }

            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

                // Animate upper arm
                const currentUpperArm = startValues.upperArm + (targetValues.upperArm - startValues.upperArm) * easeProgress;
                setUpperArmRotation(currentUpperArm);

                // Animate lower arm
                const currentLowerArm = startValues.lowerArm + (targetValues.lowerArm - startValues.lowerArm) * easeProgress;
                setLowerArmRotation(currentLowerArm);

                // Animate grip
                const currentGrip = startValues.grip + (targetValues.grip - startValues.grip) * easeProgress;
                setGripRotation(currentGrip);

                // Animate middle arms
                if (startValues.middleArms && targetValues.middleArms) {
                    targetValues.middleArms.forEach((targetRotation: number, index: number) => {
                        const startRotation = startValues.middleArms[index] || 0;
                        const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;
                        setMiddleArmRotation(index, currentRotation);
                    });
                }

                if (progress < 1) {
                    armAnimationRef.current = requestAnimationFrame(animate);
                } else {
                    armAnimationRef.current = null;
                    if (onComplete) onComplete();
                }
            };

            animate();
        };

        const animateBaseRotation = (startAngle: number, targetAngle: number, duration: number, onComplete?: () => void) => {
            if (baseAnimationRef.current) {
                cancelAnimationFrame(baseAnimationRef.current);
            }

            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

                // Handle angle wrapping for shortest path
                let angleDiff = targetAngle - startAngle;
                if (angleDiff > 180) angleDiff -= 360;
                if (angleDiff < -180) angleDiff += 360;

                const currentAngle = startAngle + angleDiff * easeProgress;
                setBaseRotation(currentAngle);

                if (progress < 1) {
                    baseAnimationRef.current = requestAnimationFrame(animate);
                } else {
                    baseAnimationRef.current = null;
                    if (onComplete) onComplete();
                }
            };

            animate();
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
                // Calculate direction vector from origin to clicked point
                const direction = new THREE.Vector3(intersectPoint.x, 0, intersectPoint.z);
                direction.normalize();

                // Move platform further behind the clicked point
                // Distance based only on arm count
                const middleArmCount = rotationValuesRef.current.middleArmCount;
                let offsetDistance;
                if (middleArmCount <= 1) {
                    offsetDistance = 40 + (20 * middleArmCount);
                } else {
                    // For 2+ arms, use a smaller multiplier to keep platform closer
                    offsetDistance = 40 + (15 * middleArmCount);
                }
                const platformX = intersectPoint.x - direction.x * offsetDistance;
                const platformZ = intersectPoint.z - direction.z * offsetDistance;

                // Calculate base rotation to face the clicked point
                // This needs to be relative to the platform's rotation
                const angleToTarget = Math.atan2(intersectPoint.x - platformX, intersectPoint.z - platformZ);

                // Get current arm positions
                const currentValues = {
                    upperArm: rotationValuesRef.current.upperArmRotation,
                    lowerArm: rotationValuesRef.current.lowerArmRotation,
                    grip: rotationValuesRef.current.gripRotation,
                    middleArms: [...rotationValuesRef.current.middleArmRotations]
                };

                // First animate arms to straight position
                const straightValues = {
                    upperArm: 0,
                    lowerArm: 0,
                    grip: 0,
                    middleArms: new Array(middleArmCount).fill(0)
                };

                animateArmRotations(currentValues, straightValues, 500, () => {
                    // After arms are straight, move the platform first
                    setTimeout(() => {
                        // Set platform position (this will trigger animation with platform rotation)
                        setPlatformPosition(platformX, platformZ);

                        // After platform movement starts, rotate the base independently
                        setTimeout(() => {
                            // Wait for platform rotation to complete
                            setTimeout(() => {
                                const currentBaseRotation = rotationValuesRef.current.baseRotation;
                                // Get the direction the platform moved
                                const deltaX = platformX - platformRef.current.position.x;
                                const deltaZ = platformZ - platformRef.current.position.z;
                                const platformRotation = Math.atan2(deltaX, deltaZ);
                                // Calculate base rotation relative to platform's new orientation
                                const relativeAngle = (angleToTarget - platformRotation) * 180 / Math.PI;
                                animateBaseRotation(currentBaseRotation, relativeAngle, 600, () => {
                                    // After base rotation completes, bend the arms
                                    setTimeout(() => {
                        // Calculate the target position relative to the platform
                        const targetX = intersectPoint.x - platformX;
                        const targetZ = intersectPoint.z - platformZ;

                        // Calculate horizontal distance
                        const horizontalDistance = Math.sqrt(targetX * targetX + targetZ * targetZ);

                        // Get arm segment lengths
                        const upperArmLength = 30; // UpperArm longitude
                        const lowerArmLength = 30; // LowerArm longitude
                        const middleArmLength = rotationValuesRef.current.middleArmLength;

                        // Calculate required reach distance
                        const targetDistance = horizontalDistance;
                        const totalArmLength = upperArmLength + lowerArmLength + (middleArmCount * middleArmLength);
                        const reachRatio = targetDistance / totalArmLength;

                        // Direct calculation based on arm count and distance
                        let bendAngle;
                        if (middleArmCount === 0) {
                            // 0 arms - keep as is (working well)
                            bendAngle = 90 * (1 - reachRatio * 0.4);
                        } else if (middleArmCount === 1) {
                            // 1 arm
                            bendAngle = 80 * (1 - reachRatio * 0.5);
                        } else if (middleArmCount === 2) {
                            // 2 arms - slightly less bend
                            bendAngle = 70 * (1 - reachRatio * 0.6);
                        } else if (middleArmCount === 3) {
                            // 3 arms - less bend than 2
                            bendAngle = 62 * (1 - reachRatio * 0.67);
                        } else if (middleArmCount === 4) {
                            // 4 arms - less bend than 3
                            bendAngle = 57 * (1 - reachRatio * 0.72);
                        } else {
                            // 5+ arms - less bend than 4
                            bendAngle = 52 * (1 - reachRatio * 0.77);
                        }

                        // Apply the calculated angle to all joints
                        // Upper arm uses specific angles based on arm count
                        let upperArmAngle;
                        if (middleArmCount === 0) {
                            upperArmAngle = 85;
                        } else if (middleArmCount === 1) {
                            upperArmAngle = 80;
                        } else if (middleArmCount === 2) {
                            upperArmAngle = 75;
                        } else if (middleArmCount === 3) {
                            upperArmAngle = 70;
                        } else if (middleArmCount === 4) {
                            upperArmAngle = 65;
                        } else {
                            upperArmAngle = 60;
                        }

                        // Calculate target bend values
                        const targetBendValues = {
                            upperArm: bendAngle * upperArmAngle / 100,
                            lowerArm: bendAngle,
                            grip: bendAngle,
                            middleArms: [] as number[]
                        };

                        // For 2+ arms, make the first middle arm bend less
                        if (middleArmCount >= 2) {
                            targetBendValues.middleArms.push(bendAngle * 0.7);
                            for (let i = 1; i < middleArmCount; i++) {
                                targetBendValues.middleArms.push(bendAngle);
                            }
                        } else if (middleArmCount === 1) {
                            targetBendValues.middleArms = [bendAngle];
                        }

                        // Animate from straight to bent position
                        animateArmRotations(straightValues, targetBendValues, 800);
                                    }, 200); // Small delay after base rotation
                                });
                            }, 400); // Wait for platform rotation to complete
                        }, 300); // Start base rotation shortly after platform starts moving
                    }, 200); // Small delay after arms straighten
                });
            }
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('keydown', handleKeyDown);
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

        // Calculate total distance for wheel rotation
        const deltaX = targetX - currentX;
        const deltaZ = targetZ - currentZ;
        const totalDistance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

        // Only animate if there's significant movement
        if (totalDistance < 0.1) return;

        // Calculate the angle to face the movement direction
        const targetAngle = Math.atan2(deltaX, deltaZ);
        const currentAngle = platformRef.current.rotation.y;

        // Handle angle wrapping for shortest path
        let angleDiff = targetAngle - currentAngle;
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // First rotate the platform
        const rotationDuration = 400;
        const movementDuration = 1000;
        const startTime = Date.now();

        const animateRotation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / rotationDuration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // Rotate platform
            platformRef.current.rotation.y = currentAngle + angleDiff * easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                // After rotation completes, start movement
                const moveStartTime = Date.now();
                
                const animateMovement = () => {
                    const elapsed = Date.now() - moveStartTime;
                    const progress = Math.min(elapsed / movementDuration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 3);

                    // Move platform
                    platformRef.current.position.x = currentX + (targetX - currentX) * easeProgress;
                    platformRef.current.position.z = currentZ + (targetZ - currentZ) * easeProgress;

                    // Rotate wheels based on distance traveled
                    const distanceTraveled = totalDistance * easeProgress;
                    if (platformRef.current.rotateWheels) {
                        platformRef.current.rotateWheels(distanceTraveled * 0.05); // Small incremental rotation
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animateMovement);
                    }
                };

                animateMovement();
            }
        };

        animateRotation();
    }, [rotationValues.platformX, rotationValues.platformZ]);

    return (
        <div className="canvas-container" ref={canvasContainerRef}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default MainCanvas;
