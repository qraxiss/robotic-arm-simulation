import * as THREE from 'three';
import { createBox, createCylinder } from '../utils/create-objects';

export class Platform extends THREE.Group {
  public leftWheels: THREE.Mesh[] = [];
  public rightWheels: THREE.Mesh[] = [];
  
  constructor(color: number) {
    super();
    
    const platformMesh = createBox(30, 2, 30, color);
    platformMesh.position.y = 3;
    
    // Create wheels
    const wheelRadius = 3;
    const wheelWidth = 2;
    const wheelColor = 0x333333; // Dark gray for wheels
    
    // Front-left wheel
    const frontLeftWheel = createCylinder(wheelRadius, wheelWidth, wheelColor);
    frontLeftWheel.rotation.z = Math.PI / 2;
    frontLeftWheel.position.set(-16, 3, 12);
    this.leftWheels.push(frontLeftWheel);
    
    // Front-right wheel
    const frontRightWheel = createCylinder(wheelRadius, wheelWidth, wheelColor);
    frontRightWheel.rotation.z = Math.PI / 2;
    frontRightWheel.position.set(16, 3, 12);
    this.rightWheels.push(frontRightWheel);
    
    // Back-left wheel
    const backLeftWheel = createCylinder(wheelRadius, wheelWidth, wheelColor);
    backLeftWheel.rotation.z = Math.PI / 2;
    backLeftWheel.position.set(-16, 3, -12);
    this.leftWheels.push(backLeftWheel);
    
    // Back-right wheel
    const backRightWheel = createCylinder(wheelRadius, wheelWidth, wheelColor);
    backRightWheel.rotation.z = Math.PI / 2;
    backRightWheel.position.set(16, 3, -12);
    this.rightWheels.push(backRightWheel);
    
    // Add all components to the platform
    this.add(platformMesh);
    this.add(frontLeftWheel);
    this.add(frontRightWheel);
    this.add(backLeftWheel);
    this.add(backRightWheel);
  }
  
  // Method to rotate wheels based on movement
  public rotateWheels(distance: number) {
    const rotation = distance * 0.1; // Adjust this multiplier for rotation speed
    
    // Rotate all wheels
    [...this.leftWheels, ...this.rightWheels].forEach(wheel => {
      wheel.rotation.x += rotation;
    });
  }
}