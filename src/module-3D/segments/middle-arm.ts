import { Segment } from './segment';
import { createCylinder } from '../utils/create-objects';
import * as THREE from 'three';

export class MiddleArm extends Segment {
  longitude: number;
  lowerY: number = 0;
  lateralCylinder: THREE.Mesh;

  constructor(color: number, length: number = 25) {
    super();
    
    this.longitude = length;

    const jointCylinder = createCylinder(4, 3, color);
    const jointCylinder2 = jointCylinder.clone();
    const jointCylinder3 =  createCylinder(5, 3, color);

    jointCylinder.position.x = 4
    jointCylinder.rotation.z = Math.PI / 2;

    jointCylinder2.position.x = - 4
    jointCylinder2.rotation.z = Math.PI / 2;

    jointCylinder3.rotation.z = Math.PI / 2;

    const axisCylinder = createCylinder(1, 14, color, true);
    axisCylinder.rotation.z = Math.PI / 2;

    this.lateralCylinder = createCylinder(1.2, length, 0xaaaaaa, true);
    this.lateralCylinder.position.y = length / 2;
  
    this.add(jointCylinder);
    this.add(jointCylinder2);
    this.add(jointCylinder3);
    this.add(axisCylinder);
    this.add(this.lateralCylinder);

  }

  updateLength(newLength: number) {
    this.longitude = newLength;
    
    // Remove old lateral cylinder
    this.remove(this.lateralCylinder);
    
    // Create new lateral cylinder with new length
    this.lateralCylinder = createCylinder(1.2, newLength, 0xaaaaaa, true);
    this.lateralCylinder.position.y = newLength / 2;
    
    this.add(this.lateralCylinder);
  }

  animate(position: number, rotation: number) {
    
  }

}