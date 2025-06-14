import * as THREE from 'three';
import { createBox } from '../utils/create-objects';

export class Platform extends THREE.Group {
  constructor(color: number) {
    super();
    
    const platformMesh = createBox(30, 2, 30, color);
    platformMesh.position.y = -1;
    
    this.add(platformMesh);
  }
}