import './App.css'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planeRef = useRef<THREE.Mesh>(new THREE.Mesh());
  const cubeRef = useRef<THREE.Mesh>(new THREE.Mesh());
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isMovingRef = useRef<boolean>(false);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const segmentsRef = useRef<THREE.Mesh[]>([]);

  const [segmentCount, setSegmentCount] = useState<number>(3);
  const [segmentLength, setSegmentLength] = useState<number>(0.5);

  const updateArmSegments = () => {
    if (!sceneRef.current || !cubeRef.current) return;

    segmentsRef.current.forEach(segment => {
      sceneRef.current.remove(segment);
    });
    segmentsRef.current = [];

    const segmentGeometry = new THREE.BoxGeometry(0.1, segmentLength, 0.1);
    const segmentMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (let i = 0; i < segmentCount; i++) {
      const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);

      const yPosition = 0.5 + (i * segmentLength) + segmentLength / 2;
      segment.position.copy(cubeRef.current.position);
      segment.position.y = yPosition;

      sceneRef.current.add(segment);
      segmentsRef.current.push(segment);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 3;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x777777,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    planeRef.current = plane;
    sceneRef.current.add(plane);

    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 0.25;
    cubeRef.current = cube;
    sceneRef.current.add(cube);

    updateArmSegments();

    const ambientLight = new THREE.AmbientLight(0x404040);
    sceneRef.current.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    sceneRef.current.add(directionalLight);

    const handleClick = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
      const intersects = raycasterRef.current.intersectObject(planeRef.current);

      if (intersects.length > 0) {
        targetPositionRef.current = intersects[0].point.clone();
        targetPositionRef.current.y = 0.25;
        isMovingRef.current = true;
      }
    };

    window.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);

      if (isMovingRef.current) {
        const direction = targetPositionRef.current.clone().sub(cubeRef.current.position);
        const distance = direction.length();

        if (distance > 0.1) {
          direction.normalize();
          direction.multiplyScalar(0.05);
          cubeRef.current.position.add(direction);

          segmentsRef.current.forEach((segment) => {
            segment.position.x = cubeRef.current.position.x;
            segment.position.z = cubeRef.current.position.z;
          });
        } else {
          isMovingRef.current = false;
        }
      }

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  useEffect(() => {
    updateArmSegments();
  }, [segmentCount, segmentLength]);

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }}></div>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>
          <label htmlFor="segmentCount">Segment Count: {segmentCount}</label>
          <input
            id="segmentCount"
            type="range"
            min="1"
            max="10"
            value={segmentCount}
            onChange={(e) => setSegmentCount(parseInt(e.target.value))}
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="segmentLength">Segment Length: {segmentLength.toFixed(1)}</label>
          <input
            id="segmentLength"
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={segmentLength}
            onChange={(e) => setSegmentLength(parseFloat(e.target.value))}
            style={{ display: 'block', width: '100%' }}
          />
        </div>
      </div>
    </>
  )
}

export default App
